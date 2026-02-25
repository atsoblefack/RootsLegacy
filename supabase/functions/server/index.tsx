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

// Initialize app config on startup
await appConfig.initializeAppConfig();

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
  
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
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

app.get("/make-server-467d3bfa/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============= AUTH ROUTES =============

// Sign up new user and create family
app.post("/make-server-467d3bfa/auth/signup", async (c) => {
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
app.get("/make-server-467d3bfa/auth/role", async (c) => {
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
app.post("/make-server-467d3bfa/profiles", async (c) => {
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

    const profile = await db.createProfile(
      familyId,
      profileData.full_name,
      user.id,
      profileData
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
app.get("/make-server-467d3bfa/profiles", async (c) => {
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
app.get("/make-server-467d3bfa/profiles/:id", async (c) => {
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
app.put("/make-server-467d3bfa/profiles/:id", async (c) => {
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
app.post("/make-server-467d3bfa/relations", async (c) => {
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

// Get relations (family members only)
app.get("/make-server-467d3bfa/relations", async (c) => {
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
app.get("/make-server-467d3bfa/family-members", async (c) => {
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
app.post("/make-server-467d3bfa/family-members/:userId/promote", async (c) => {
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
app.get("/make-server-467d3bfa/app-config", async (c) => {
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
app.put("/make-server-467d3bfa/app-config", async (c) => {
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
app.get("/make-server-467d3bfa/admin/metrics", async (c) => {
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
app.get("/make-server-467d3bfa/admin-actions", async (c) => {
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

// Start server
Deno.serve(app.fetch);
