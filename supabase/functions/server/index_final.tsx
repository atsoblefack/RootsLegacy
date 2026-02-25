import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Initialize Supabase clients using env variables (auto-injected by Supabase)
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
};

const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

// Enable CORS for all routes
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ============= HELPERS =============

async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return { user: null, error: "No authorization header" };
  const token = authHeader.split(" ")[1];
  if (!token) return { user: null, error: "Invalid authorization header" };
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { user: null, error: error?.message || "Invalid token" };
  return { user: data.user, error: null };
}

async function getUserFamilyId(userId: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    // Check family_members first (most reliable)
    const { data: memberData } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", userId)
      .limit(1)
      .single();
    if (memberData?.family_id) return memberData.family_id;

    // Fallback: check families table
    const { data: familyData } = await supabase
      .from("families")
      .select("family_id")
      .eq("created_by", userId)
      .limit(1)
      .single();
    return familyData?.family_id || null;
  } catch {
    return null;
  }
}

async function isUserSuperAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("family_members")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin");
    return data !== null && data.length > 0;
  } catch {
    return false;
  }
}

async function isUserAdminInFamily(userId: string, familyId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("family_members")
      .select("role")
      .eq("family_id", familyId)
      .eq("user_id", userId)
      .single();
    return data?.role === "admin" || data?.role === "super_admin";
  } catch {
    return false;
  }
}

// ============= HEALTH CHECK =============

app.get("/make-server-467d3bfa/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString(), version: "2.0-sql" });
});

// ============= AUTH ROUTES =============

// Sign up new user and create family
app.post("/make-server-467d3bfa/auth/signup", async (c) => {
  try {
    const { email, password, name, familyName } = await c.req.json();
    if (!email || !password || !name || !familyName) {
      return c.json({ error: "Email, password, name, and familyName are required" }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (authError) return c.json({ error: `Failed to create account: ${authError.message}` }, 400);

    const userId = authData.user.id;

    // Create family
    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({
        name: familyName,
        created_by: userId,
        plan: "trial",
        status: "trial",
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        member_limit: 30,
      })
      .select()
      .single();

    if (familyError) return c.json({ error: `Failed to create family: ${familyError.message}` }, 400);

    // Add user as admin to family
    await supabase.from("family_members").insert({
      family_id: family.family_id,
      user_id: userId,
      role: "admin",
      status: "active",
    });

    return c.json({
      user: authData.user,
      family,
      message: "Account and family created successfully with 30-day trial",
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return c.json({ error: `Server error: ${error.message}` }, 500);
  }
});

// Get current user role and family info
app.get("/make-server-467d3bfa/auth/role", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const familyId = await getUserFamilyId(user.id);
    const isSuperAdmin = await isUserSuperAdmin(user.id);

    if (!familyId) {
      return c.json({
        role: isSuperAdmin ? "super_admin" : "guest",
        familyId: null,
        userId: user.id,
        email: user.email,
      });
    }

    const supabase = getSupabaseAdmin();
    const { data: memberData } = await supabase
      .from("family_members")
      .select("role")
      .eq("family_id", familyId)
      .eq("user_id", user.id)
      .single();

    const role = memberData?.role || "member";

    return c.json({
      role: isSuperAdmin ? "super_admin" : role,
      familyId,
      userId: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Get role error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= PROFILES ROUTES =============

// Get profiles
app.get("/make-server-467d3bfa/profiles", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const familyId = await getUserFamilyId(user.id);
    if (!familyId) return c.json({ error: "No family found" }, 404);

    const limit = parseInt(c.req.query("limit") || "50");
    const supabase = getSupabaseAdmin();

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("family_id", familyId)
      .limit(limit);

    if (profileError) return c.json({ error: profileError.message }, 500);

    return c.json({ data: profiles || [], total: profiles?.length || 0 });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create profile
app.post("/make-server-467d3bfa/profiles", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const familyId = await getUserFamilyId(user.id);
    if (!familyId) return c.json({ error: "No family found" }, 404);

    const isAdmin = await isUserAdminInFamily(user.id, familyId);
    if (!isAdmin) return c.json({ error: "Admin access required" }, 403);

    const profileData = await c.req.json();
    const supabase = getSupabaseAdmin();

    const { data: family } = await supabase
      .from("families")
      .select("member_limit")
      .eq("family_id", familyId)
      .single();

    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("family_id", familyId);

    if (count !== null && count >= (family?.member_limit || 30)) {
      return c.json({ error: `Member limit (${family?.member_limit || 30}) reached` }, 403);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({ family_id: familyId, created_by: user.id, ...profileData })
      .select()
      .single();

    if (profileError) return c.json({ error: profileError.message }, 500);

    return c.json({ profile });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============= RELATIONS ROUTES =============

// Get relations
app.get("/make-server-467d3bfa/relations", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const familyId = await getUserFamilyId(user.id);
    if (!familyId) return c.json({ error: "No family found" }, 404);

    const supabase = getSupabaseAdmin();
    const { data: relations, error: relError } = await supabase
      .from("relations")
      .select("*")
      .eq("family_id", familyId);

    if (relError) return c.json({ error: relError.message }, 500);

    return c.json({ data: relations || [] });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create relation
app.post("/make-server-467d3bfa/relations", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const familyId = await getUserFamilyId(user.id);
    if (!familyId) return c.json({ error: "No family found" }, 404);

    const isAdmin = await isUserAdminInFamily(user.id, familyId);
    if (!isAdmin) return c.json({ error: "Admin access required" }, 403);

    const relationData = await c.req.json();
    const supabase = getSupabaseAdmin();

    const { data: relation, error: relError } = await supabase
      .from("relations")
      .insert({ family_id: familyId, created_by: user.id, ...relationData })
      .select()
      .single();

    if (relError) return c.json({ error: relError.message }, 500);

    return c.json({ relation });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============= REFERRALS ROUTES =============

// Get referral stats
app.get("/make-server-467d3bfa/referrals", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const supabase = getSupabaseAdmin();
    const { data: referrals } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id);

    const totalEarned = referrals?.reduce((sum, r) => sum + (r.months_earned || 0), 0) || 0;

    return c.json({
      referrals: referrals || [],
      totalMonthsEarned: Math.min(totalEarned, 36),
      referralCode: user.id.substring(0, 8).toUpperCase(),
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============= SUBSCRIPTION ROUTES =============

// Get subscription info
app.get("/make-server-467d3bfa/subscription", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const familyId = await getUserFamilyId(user.id);
    if (!familyId) return c.json({ subscription: null });

    const supabase = getSupabaseAdmin();
    const { data: family } = await supabase
      .from("families")
      .select("plan, status, trial_ends_at, storage_paid_until")
      .eq("family_id", familyId)
      .single();

    return c.json({ subscription: family });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Subscription upgrade (payment coming soon)
app.post("/make-server-467d3bfa/subscription/upgrade", async (c) => {
  return c.json({
    message: "Paiement en ligne disponible bientôt — contactez-nous à contact@rootslegacy.com",
    available_plans: [
      { id: "roots", name: "Roots", price: 29, members: 30, storage_gb: 5 },
      { id: "family", name: "Family", price: 59, members: 150, storage_gb: 20 },
      { id: "heritage", name: "Heritage", price: 99, members: 1000, storage_gb: 100 },
    ]
  });
});

// ============= APP CONFIG ROUTES =============

// Get app config
app.get("/make-server-467d3bfa/app-config", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const supabase = getSupabaseAdmin();
    const { data: configs } = await supabase
      .from("app_config")
      .select("key, value");

    const configMap: Record<string, any> = {};
    configs?.forEach(c => { configMap[c.key] = c.value; });

    return c.json({ config: configMap });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update app config (super admin only)
app.patch("/make-server-467d3bfa/app-config", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const isSuperAdmin = await isUserSuperAdmin(user.id);
    if (!isSuperAdmin) return c.json({ error: "Super admin access required" }, 403);

    const updates = await c.req.json();
    const supabase = getSupabaseAdmin();

    for (const [key, value] of Object.entries(updates)) {
      await supabase
        .from("app_config")
        .upsert({ key, value: String(value), updated_at: new Date().toISOString() });
    }

    return c.json({ message: "Config updated successfully" });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============= ADMIN METRICS =============

app.get("/make-server-467d3bfa/admin/metrics", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const isSuperAdmin = await isUserSuperAdmin(user.id);
    if (!isSuperAdmin) return c.json({ error: "Super admin access required" }, 403);

    const supabase = getSupabaseAdmin();

    const [
      { count: activeFamilies },
      { count: trialsInProgress },
      { count: totalProfiles },
      { count: totalReferrals },
    ] = await Promise.all([
      supabase.from("families").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("families").select("*", { count: "exact", head: true }).eq("status", "trial"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("referrals").select("*", { count: "exact", head: true }),
    ]);

    return c.json({
      metrics: {
        activeFamilies: activeFamilies || 0,
        trialsInProgress: trialsInProgress || 0,
        trialsExpiringIn7Days: 0,
        activeReferrals: totalReferrals || 0,
        totalProfiles: totalProfiles || 0,
      }
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============= FAMILIES ADMIN =============

// List all families (super admin)
app.get("/make-server-467d3bfa/admin/families", async (c) => {
  try {
    const { user, error } = await getUserFromToken(c.req.header("Authorization"));
    if (error || !user) return c.json({ error: "Unauthorized" }, 401);

    const isSuperAdmin = await isUserSuperAdmin(user.id);
    if (!isSuperAdmin) return c.json({ error: "Super admin access required" }, 403);

    const limit = parseInt(c.req.query("limit") || "50");
    const supabase = getSupabaseAdmin();

    const { data: families, error: famError } = await supabase
      .from("families")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (famError) return c.json({ error: famError.message }, 500);

    return c.json({ data: families || [], total: families?.length || 0 });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============= FALLBACK =============

app.all("*", (c) => {
  return c.json({ error: "Not found", path: c.req.path }, 404);
});

// Serve the app
serve(app.fetch);
