import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// Initialize Supabase client helper
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

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Helper to get user from access token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: "No authorization header" };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return { user: null, error: "Invalid authorization header" };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { user: null, error: error?.message || "Invalid or expired token" };
  }

  return { user: data.user, error: null };
}

// Helper to get user's family_id
async function getUserFamilyId(userId: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("families")
      .select("family_id")
      .eq("created_by", userId)
      .single();

    if (error || !data) return null;
    return data.family_id;
  } catch (error) {
    console.error("Error getting user family_id:", error);
  }
  return null;
}

// Helper to check if user is admin in family
async function isUserAdminInFamily(
  userId: string,
  familyId: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("family_members")
      .select("role")
      .eq("family_id", familyId)
      .eq("user_id", userId)
      .single();

    if (error || !data) return false;
    return data.role === "admin" || data.role === "super_admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Helper to check if user is super admin
async function isUserSuperAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("family_members")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin");

    return !error && data && data.length > 0;
  } catch (error) {
    console.error("Error checking super admin status:", error);
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
      return c.json(
        {
          error:
            "Email, password, name, and familyName are required",
        },
        400
      );
    }

    const supabase = getSupabaseAdmin();

    // Create user account
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true,
      });

    if (authError) {
      return c.json(
        { error: `Failed to create account: ${authError.message}` },
        400
      );
    }

    const userId = authData.user.id;

    // Create family
    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({
        name: familyName,
        created_by: userId,
        plan: "trial",
        status: "trial",
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        member_limit: 30,
      })
      .select()
      .single();

    if (familyError) {
      return c.json({ error: `Failed to create family: ${familyError.message}` }, 400);
    }

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
    return c.json(
      { error: `Server error during signup: ${error.message}` },
      500
    );
  }
});

// Get current user role and family info
app.get("/auth/role", async (c) => {
  try {
    const { user, error } = await getUserFromToken(
      c.req.header("Authorization")
    );
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user's family
    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ role: "guest", familyId: null });
    }

    // Get user's role in family
    const supabase = getSupabaseAdmin();
    const { data: memberData } = await supabase
      .from("family_members")
      .select("role")
      .eq("family_id", familyId)
      .eq("user_id", user.id)
      .single();

    const role = memberData?.role || "member";
    const isSuperAdmin = await isUserSuperAdmin(user.id);

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

// Get profiles (family members only)
app.get("/profiles", async (c) => {
  try {
    const { user, error } = await getUserFromToken(
      c.req.header("Authorization")
    );
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: "No family found" }, 404);
    }

    const limit = parseInt(c.req.query("limit") || "20");
    const supabase = getSupabaseAdmin();

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("family_id", familyId)
      .limit(limit);

    if (profileError) {
      return c.json({ error: profileError.message }, 500);
    }

    return c.json({
      data: profiles,
      total: profiles?.length || 0,
    });
  } catch (error: any) {
    console.error("Get profiles error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Create profile (admin only)
app.post("/profiles", async (c) => {
  try {
    const { user, error } = await getUserFromToken(
      c.req.header("Authorization")
    );
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const familyId = await getUserFamilyId(user.id);
    if (!familyId) {
      return c.json({ error: "No family found" }, 404);
    }

    const isAdmin = await isUserAdminInFamily(user.id, familyId);
    if (!isAdmin) {
      return c.json({ error: "Admin access required" }, 403);
    }

    const profileData = await c.req.json();
    const supabase = getSupabaseAdmin();

    // Check member limit
    const { data: family } = await supabase
      .from("families")
      .select("member_limit")
      .eq("family_id", familyId)
      .single();

    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("family_id", familyId);

    if (count && count >= (family?.member_limit || 30)) {
      return c.json(
        {
          error: `Member limit (${family?.member_limit || 30}) reached`,
        },
        403
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        family_id: familyId,
        full_name: profileData.full_name,
        created_by: user.id,
        ...profileData,
      })
      .select()
      .single();

    if (profileError) {
      return c.json({ error: profileError.message }, 500);
    }

    return c.json({ profile });
  } catch (error: any) {
    console.error("Create profile error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= ADMIN METRICS =============

app.get("/admin/metrics", async (c) => {
  try {
    const { user, error } = await getUserFromToken(
      c.req.header("Authorization")
    );
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const isSuperAdmin = await isUserSuperAdmin(user.id);
    if (!isSuperAdmin) {
      return c.json({ error: "Super admin access required" }, 403);
    }

    const supabase = getSupabaseAdmin();

    // Count active families
    const { count: activeFamilies } = await supabase
      .from("families")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Count trials in progress
    const { count: trialsInProgress } = await supabase
      .from("families")
      .select("*", { count: "exact", head: true })
      .eq("status", "trial");

    // Count total profiles
    const { count: totalProfiles } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const metrics = {
      activeFamilies: activeFamilies || 0,
      trialsInProgress: trialsInProgress || 0,
      trialsExpiringIn7Days: 0,
      activeReferrals: 0,
      totalProfiles: totalProfiles || 0,
    };

    return c.json({ metrics });
  } catch (error: any) {
    console.error("Get admin metrics error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// ============= FALLBACK =============

app.all("*", (c) => {
  return c.json({ error: "Not found" }, 404);
});

// Serve the app
serve(app.fetch);
