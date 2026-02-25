import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from 'npm:@supabase/supabase-js';
import * as db from "./db.tsx";
import * as appConfig from "./app_config.tsx";
import * as adminMetrics from "./admin_metrics.tsx";
import * as storage from "./storage.tsx";

const app = new Hono();

// Initialize Supabase client helper
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
};

const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Initialize app config on startup (non-blocking to prevent startup crash if table missing)
appConfig.initializeAppConfig().catch((e: any) => console.error('App config init failed (non-fatal):', e?.message));

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to get user from access token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return { user: null, error: 'Invalid authorization header' };
  }
  
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    console.error('getUserFromToken error:', error?.message, 'token prefix:', token.substring(0, 20));
    return { user: null, error: error?.message || 'Invalid or expired token' };
  }
  
  return { user: data.user, error: null };
}

// Helper to get user's family_id
async function getUserFamilyId(userId: string): Promise<string | null> {
  try {
    const families = await db.getUserFamilies(userId);
    if (families.length > 0) {
      return families[0].family_id;
    }
  } catch (error) {
    console.error('Error getting user family_id:', error);
  }
  return null;
}

// Helper to check if user is admin in family
async function isUserAdminInFamily(userId: string, familyId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single();

    if (error || !data) return false;
    return data.role === 'admin' || data.role === 'super_admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Helper to check if user is super admin
async function isUserSuperAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('family_members')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin');

    return !error && data && data.length > 0;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

// ============= HEALTH CHECK =============

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============= AUTH ROUTES =============

// Sign up new user and create family
app.post("/auth/signup", async (c) => {
  try {
    const { email, password, name, familyName } = await c.req.json();
    
    if (!email || !password || !name || !familyName) {
      return c.json({ error: 'Email, password, name, and familyName are required' }, 400);
    }
    
    const supabase = getSupabaseAdmin();
    
    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });
    
    if (authError) {
      return c.json({ error: `Failed to create account: ${authError.message}` }, 400);
    }

    const userId = authData.user.id;

    // Create family
    const family = await db.createFamily(familyName, userId, 'trial');
    
    // Add user as admin to family
    await db.addFamilyMember(family.family_id, userId, 'admin');

    // Log action
    await db.logAdminAction(userId, 'signup', family.family_id);

    return c.json({ 
      user: authData.user,
      family,
      message: 'Account and family created successfully with 30-day trial',
    });
    
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: `Server error during signup: ${error.message}` }, 500);
  }
});

// Get current user role and family info
app.get("/auth/role", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get user's family
    const families = await db.getUserFamilies(user.id);
    if (families.length === 0) {
      return c.json({ role: 'guest', familyId: null });
    }

    const family = families[0];
    const familyId = family.family_id;

    // Get user's role in family
    const supabase = getSupabaseAdmin();
    const { data: memberData } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .single();

    const role = memberData?.role || 'member';
    const isSuperAdmin = await isUserSuperAdmin(user.id);

    return c.json({ 
      role: isSuperAdmin ? 'super_admin' : role,
      familyId,
      userId: user.id,
      email: user.email,
    });
    
  } catch (error: any) {
    console.error('Get role error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= PROFILES ROUTES =============

// Create profile (admin only)
app.post("/profiles", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found' }, 404);
    }

    const isAdmin = await isUserAdminInFamily(user.id, familyId);
    if (!isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const profileData = await c.req.json();
    
    // Check member limit
    const family = await db.getFamilyByFamilyId(familyId);
    const profileCount = await db.countProfilesByFamilyId(familyId);
    
    if (profileCount >= family.member_limit) {
      return c.json({ 
        error: `Member limit (${family.member_limit}) reached for plan ${family.plan}` 
      }, 403);
    }

    // Map 'name' → 'full_name' for frontend compatibility
    const fullName = profileData.full_name || profileData.name;
    if (!fullName) {
      return c.json({ error: 'full_name or name is required' }, 400);
    }
    // Only pass allowed columns to avoid schema cache errors
    const allowedFields: Record<string, any> = {};
    const allowedCols = ['local_name','birth_date','birth_place','death_date','gender','profession','bio','phone','email','photo_url','village_country','village_city','village_name','is_alive','user_id'];
    for (const key of allowedCols) {
      if (profileData[key] !== undefined) allowedFields[key] = profileData[key];
    }
    const profile = await db.createProfile(
      familyId,
      fullName,
      user.id,
      allowedFields
    );

    // Log action
    await db.logAdminAction(user.id, 'create_profile', familyId, null, { profileId: profile.id });

    return c.json({ profile });
    
  } catch (error: any) {
    console.error('Create profile error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get profiles (family members only)
app.get("/profiles", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found' }, 404);
    }

    const limit = parseInt(c.req.query('limit') || '20');
    const cursor = c.req.query('cursor');

    const { data: profiles, nextCursor } = await db.getProfilesByFamilyId(
      familyId,
      limit,
      cursor
    );

    return c.json({ 
      data: profiles,
      nextCursor,
      total: profiles.length,
    });
    
  } catch (error: any) {
    console.error('Get profiles error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get specific profile
app.get("/profiles/:id", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profileId = c.req.param('id');
    const profile = await db.getProfileById(profileId);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Verify user has access to this family
    const familyId = await getUserFamilyId(user.id);
    if (profile.family_id !== familyId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json({ profile });
    
  } catch (error: any) {
    console.error('Get profile error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update profile (admin only)
app.put("/profiles/:id", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profileId = c.req.param('id');
    const profile = await db.getProfileById(profileId);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const familyId = await getUserFamilyId(user.id);
    if (profile.family_id !== familyId) {
      return c.json({ error: 'Access denied' }, 403);
    }

    const isAdmin = await isUserAdminInFamily(user.id, familyId);
    if (!isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const updates = await c.req.json();
    const updatedProfile = await db.updateProfile(profileId, updates);

    // Log action
    await db.logAdminAction(user.id, 'update_profile', familyId, null, { profileId });

    return c.json({ profile: updatedProfile });
    
  } catch (error: any) {
    console.error('Update profile error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= RELATIONS ROUTES =============

// Create relation (admin only)
app.post("/relations", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found' }, 404);
    }

    const isAdmin = await isUserAdminInFamily(user.id, familyId);
    if (!isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { profileId1, profileId2, relationType, ...metadata } = await c.req.json();
    
    if (!profileId1 || !profileId2 || !relationType) {
      return c.json({ error: 'profileId1, profileId2, and relationType are required' }, 400);
    }

    const relation = await db.createRelation(
      familyId,
      profileId1,
      profileId2,
      relationType,
      user.id,
      metadata
    );

    // Log action
    await db.logAdminAction(user.id, 'create_relation', familyId, null, { relationId: relation.id });

    return c.json({ relation });
    
  } catch (error: any) {
    console.error('Create relation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get family tree (profiles + relations)
app.get("/tree", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found' }, 404);
    }
    const { data: profiles } = await db.getProfilesByFamilyId(familyId, 200);
    const { data: relations } = await db.getRelationsByFamilyId(familyId, 500);
    return c.json({ profiles, relations, familyId });
  } catch (error: any) {
    console.error('Get tree error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get relations (family members only)
app.get("/relations", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found' }, 404);
    }

    const limit = parseInt(c.req.query('limit') || '20');
    const cursor = c.req.query('cursor');

    const { data: relations, nextCursor } = await db.getRelationsByFamilyId(
      familyId,
      limit,
      cursor
    );

    return c.json({ 
      data: relations,
      nextCursor,
      total: relations.length,
    });
    
  } catch (error: any) {
    console.error('Get relations error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= FAMILY MEMBERS ROUTES =============

// Get family members (family members only)
app.get("/family-members", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found' }, 404);
    }

    const limit = parseInt(c.req.query('limit') || '20');
    const cursor = c.req.query('cursor');

    const { data: members, nextCursor } = await db.getFamilyMembersByFamilyId(
      familyId,
      limit,
      cursor
    );

    return c.json({ 
      data: members,
      nextCursor,
      total: members.length,
    });
    
  } catch (error: any) {
    console.error('Get family members error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Promote member to admin (admin only)
app.post("/family-members/:userId/promote", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found' }, 404);
    }

    const isAdmin = await isUserAdminInFamily(user.id, familyId);
    if (!isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const targetUserId = c.req.param('userId');

    // Check admin limit
    const maxAdmins = await appConfig.getConfig('max_admins_per_family');
    const adminCount = await db.countAdminsByFamilyId(familyId);
    
    if (adminCount >= maxAdmins) {
      return c.json({ 
        error: `Admin limit (${maxAdmins}) reached for this family` 
      }, 403);
    }

    const member = await db.updateFamilyMemberRole(familyId, targetUserId, 'admin');

    // Log action
    await db.logAdminAction(user.id, 'promote_to_admin', familyId, targetUserId);

    return c.json({ member });
    
  } catch (error: any) {
    console.error('Promote member error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= APP CONFIG ROUTES =============

// Get all app config (super admin only)
app.get("/app-config", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isSuperAdmin = await isUserSuperAdmin(user.id);
    if (!isSuperAdmin) {
      return c.json({ error: 'Super admin access required' }, 403);
    }

    const config = await db.getAllAppConfig();
    return c.json({ config });
    
  } catch (error: any) {
    console.error('Get app config error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Update app config (super admin only)
app.put("/app-config", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isSuperAdmin = await isUserSuperAdmin(user.id);
    if (!isSuperAdmin) {
      return c.json({ error: 'Super admin access required' }, 403);
    }

    const { key, value } = await c.req.json();
    if (!key || value === undefined) {
      return c.json({ error: 'key and value are required' }, 400);
    }

    await appConfig.updateConfig(key, value);

    // Log action
    await db.logAdminAction(user.id, 'update_config', null, null, { key, value });

    const config = await db.getAllAppConfig();
    return c.json({ config });
    
  } catch (error: any) {
    console.error('Update app config error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= ADMIN ROUTES =============

// Get admin metrics (super admin only)
app.get("/admin/metrics", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isSuperAdmin = await isUserSuperAdmin(user.id);
    if (!isSuperAdmin) {
      return c.json({ error: 'Super admin access required' }, 403);
    }

    const metrics = await adminMetrics.getAdminMetrics();
    return c.json({ metrics });
    
  } catch (error: any) {
    console.error('Get admin metrics error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get admin actions (super admin only)
app.get("/admin-actions", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isSuperAdmin = await isUserSuperAdmin(user.id);
    if (!isSuperAdmin) {
      return c.json({ error: 'Super admin access required' }, 403);
    }

    const limit = parseInt(c.req.query('limit') || '20');
    const cursor = c.req.query('cursor');

    const { data: actions, nextCursor } = await db.getAdminActions(limit, cursor);

    return c.json({ 
      data: actions,
      nextCursor,
      total: actions.length,
    });
    
  } catch (error: any) {
    console.error('Get admin actions error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= PROFILES/ME ROUTE =============
// Get current user's own profile
app.get("/profiles/me", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const supabase = getSupabaseAdmin();
    // Find profile linked to this user_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (!profile) {
      return c.json({ profile: null, message: 'No profile linked to this user' });
    }
    return c.json({ profile });
  } catch (error: any) {
    console.error('Get my profile error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= SELF PROFILE ROUTE (no admin required) =============
// Create own profile without admin check (for onboarding)
app.post("/profiles/self", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found. Please complete onboarding first.' }, 404);
    }
    const profileData = await c.req.json();
    const fullName = profileData.full_name || profileData.name;
    if (!fullName) {
      return c.json({ error: 'name is required' }, 400);
    }
    const supabase = getSupabaseAdmin();
    // Check if user already has a profile in this family
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .single();
    if (existing) {
      return c.json({ profile: existing, message: 'Profile already exists' });
    }
    const allowedCols = ['local_name','birth_date','birth_place','death_date','gender','profession','bio','phone','email','photo_url','is_alive'];
    const allowedFields: Record<string, any> = {};
    for (const key of allowedCols) {
      if (profileData[key] !== undefined) allowedFields[key] = profileData[key];
    }
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        family_id: familyId,
        full_name: fullName,
        created_by: user.id,
        user_id: user.id,
        ...allowedFields,
      })
      .select()
      .single();
    if (insertError) {
      console.error('Create self profile error:', insertError);
      return c.json({ error: insertError.message }, 500);
    }
    return c.json({ profile });
  } catch (error: any) {
    console.error('Create self profile error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= AI ROUTES =============
// AI Chat for conversational onboarding
app.post("/ai/chat", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const body = await c.req.json();
    const { messages, language = 'fr', context = {} } = body;
    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: 'messages array is required' }, 400);
    }
    const openaiApiKey = Deno.env.get('GROQ_API_KEY');
    const openaiBaseUrl = 'https://api.groq.com/openai/v1';
    if (!openaiApiKey) {
      return c.json({ error: 'AI service not configured' }, 503);
    }
    const langInstructions: Record<string, string> = {
      fr: 'Réponds toujours en français.',
      en: 'Always respond in English.',
      sw: 'Jibu kwa Kiswahili.',
      yo: 'Dahun ni Yorùbá.',
      ha: 'Amsa da Hausa.',
      am: 'ሁልጊዜ በአማርኛ ምላሽ ስጥ።',
    };
    const systemPrompt = `You are a warm, culturally sensitive AI assistant helping African families build their genealogical tree on RootsLegacy. 
You guide users through collecting family information step by step in a conversational way.
You ask one question at a time, acknowledge answers warmly, and extract structured data (name, birth date, birth place, relation type).
Be encouraging and celebrate family heritage. Use emojis sparingly but warmly.
${langInstructions[language] || langInstructions['fr']}

Context about this session: ${JSON.stringify(context)}`;
    const response = await fetch(`${openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', errText);
      return c.json({ error: 'AI service error' }, 502);
    }
    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || '';
    return c.json({ message: aiMessage, usage: data.usage });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// AI Document Scan (OCR + extraction)
app.post("/ai/scan-document", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const body = await c.req.json();
    const { imageBase64, imageUrl, language = 'fr' } = body;
    if (!imageBase64 && !imageUrl) {
      return c.json({ error: 'imageBase64 or imageUrl is required' }, 400);
    }
    const openaiApiKey = Deno.env.get('GROQ_API_KEY');
    const openaiBaseUrl = 'https://api.groq.com/openai/v1';
    if (!openaiApiKey) {
      return c.json({ error: 'AI scan service not configured' }, 503);
    }
    const imageContent = imageBase64
      ? { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } }
      : { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } };
    const response = await fetch(`${openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              imageContent,
              {
                type: 'text',
                text: `Analyze this document image and extract genealogical information. Return a JSON object with these fields (use null if not found):
{
  "name": "full name",
  "birthDate": "date in YYYY-MM-DD format or descriptive",
  "birthPlace": "city, country",
  "deathDate": "date or null",
  "documentType": "birth certificate / ID card / passport / marriage certificate / death certificate / handwritten record / other",
  "gender": "male / female / other / null",
  "fatherName": "name or null",
  "motherName": "name or null",
  "additionalInfo": "any other relevant genealogical info"
}
Respond ONLY with the JSON object, no other text.`,
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.1,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI vision error:', errText);
      return c.json({ error: 'AI vision service error' }, 502);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    let extracted: any = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.error('JSON parse error:', e);
      extracted = { additionalInfo: content };
    }
    return c.json({ extracted, raw: content });
  } catch (error: any) {
    console.error('AI scan error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= SHARE ROUTES =============
// Generate family share link
app.get("/share/family-link", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found' }, 404);
    }
    const supabase = getSupabaseAdmin();
    const { data: family } = await supabase
      .from('families')
      .select('family_name, invite_code')
      .eq('family_id', familyId)
      .single();
    const inviteCode = family?.invite_code || familyId.substring(0, 8);
    const familyName = family?.family_name || 'Notre Famille';
    return c.json({ 
      familyId,
      familyName,
      inviteCode,
      shareUrl: `https://rootslegacy.app/join/${inviteCode}`,
      shareText: `Rejoins notre arbre généalogique familial "${familyName}" sur RootsLegacy ! 🌳 Clique ici pour rejoindre : https://rootslegacy.app/join/${inviteCode}`,
    });
  } catch (error: any) {
    console.error('Share link error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= BATCH CREATE PROFILES (WhatsApp import) =============
app.post("/profiles/batch", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header('Authorization'));
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const isAdmin = await isUserAdminInFamily(user.id, await getUserFamilyId(user.id) || '');
    if (!isAdmin) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: 'No family found' }, 404);
    }
    const body = await c.req.json();
    const { profiles } = body;
    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      return c.json({ error: 'profiles array is required' }, 400);
    }
    if (profiles.length > 50) {
      return c.json({ error: 'Maximum 50 profiles per batch' }, 400);
    }
    const supabase = getSupabaseAdmin();
    const created = [];
    const errors = [];
    for (const p of profiles) {
      try {
        const { data, error: insertError } = await supabase
          .from('profiles')
          .insert({
            family_id: familyId,
            full_name: p.full_name || p.name,
            phone: p.phone || null,
            gender: p.gender || null,
            birth_date: p.birth_date || null,
            birth_place: p.birth_place || null,
            created_by: user.id,
          })
          .select()
          .single();
        if (insertError) {
          errors.push({ name: p.full_name || p.name, error: insertError.message });
        } else {
          created.push(data);
        }
      } catch (e: any) {
        errors.push({ name: p.full_name || p.name, error: e.message });
      }
    }
    return c.json({ created, errors, total: created.length });
  } catch (error: any) {
    console.error('Batch create profiles error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Start server - strip /server prefix injected by Supabase Edge Functions
Deno.serve((req: Request) => {
  const url = new URL(req.url);
  // Supabase injects /functions/v1/server/... - strip the /server prefix so Hono sees /...
  const stripped = url.pathname.replace(/^\/server/, '') || '/';
  const newUrl = new URL(stripped + url.search, url.origin);
  const newReq = new Request(newUrl.toString(), req);
  return app.fetch(newReq);
});
