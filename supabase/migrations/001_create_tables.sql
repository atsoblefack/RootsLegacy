-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============= FAMILIES TABLE =============
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('roots', 'family', 'heritage', 'trial')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'read_only', 'grace')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  storage_paid_until TIMESTAMP WITH TIME ZONE,
  grace_ends_at TIMESTAMP WITH TIME ZONE,
  member_limit INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_families_family_id ON families(family_id);
CREATE INDEX idx_families_created_by ON families(created_by);
CREATE INDEX idx_families_status ON families(status);

-- ============= PROFILES TABLE =============
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
  user_id UUID,
  full_name TEXT NOT NULL,
  local_name TEXT,
  birth_date DATE,
  birth_place TEXT,
  death_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  profession TEXT,
  bio TEXT,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  village_country TEXT,
  village_city TEXT,
  village_name TEXT,
  is_alive BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_family_id ON profiles(family_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_created_by ON profiles(created_by);

-- ============= RELATIONS TABLE =============
CREATE TABLE relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
  profile_id_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN (
    'spouse', 'parent', 'child', 'sibling', 
    'uncle_aunt', 'nephew_niece', 'cousin', 
    'guardian', 'godparent'
  )),
  marriage_date DATE,
  marriage_place TEXT,
  divorce_date DATE,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_relations_family_id ON relations(family_id);
CREATE INDEX idx_relations_profile_id_1 ON relations(profile_id_1);
CREATE INDEX idx_relations_profile_id_2 ON relations(profile_id_2);

-- ============= FAMILY_MEMBERS TABLE =============
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_role ON family_members(role);

-- ============= REFERRALS TABLE =============
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_family_id UUID NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
  referred_family_id UUID NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rewarded')),
  storage_months_granted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rewarded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_referrals_referrer_family_id ON referrals(referrer_family_id);
CREATE INDEX idx_referrals_referred_family_id ON referrals(referred_family_id);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- ============= FUSION_CODES TABLE =============
CREATE TABLE fusion_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  used_by_family_id UUID REFERENCES families(family_id),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fusion_codes_family_id ON fusion_codes(family_id);
CREATE INDEX idx_fusion_codes_code ON fusion_codes(code);
CREATE INDEX idx_fusion_codes_expires_at ON fusion_codes(expires_at);

-- ============= APP_CONFIG TABLE =============
CREATE TABLE app_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_app_config_key ON app_config(key);

-- ============= ADMIN_ACTIONS TABLE (Audit Log) =============
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_family_id UUID REFERENCES families(family_id),
  target_user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin_user_id ON admin_actions(admin_user_id);
CREATE INDEX idx_admin_actions_target_family_id ON admin_actions(target_family_id);
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at);

-- ============= ROW LEVEL SECURITY (RLS) =============

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fusion_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Families: Users can only see their own families
CREATE POLICY families_select ON families FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = families.family_id 
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY families_insert ON families FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY families_update ON families FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = families.family_id 
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'super_admin')
    )
  );

-- Profiles: Users can only see profiles in their families
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = profiles.family_id 
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY profiles_insert ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = profiles.family_id 
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = profiles.family_id 
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'super_admin')
    )
  );

-- Relations: Users can only see relations in their families
CREATE POLICY relations_select ON relations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = relations.family_id 
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY relations_insert ON relations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = relations.family_id 
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY relations_update ON relations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = relations.family_id 
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'super_admin')
    )
  );

-- Family Members: Users can see members of their families
CREATE POLICY family_members_select ON family_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm2
      WHERE fm2.family_id = family_members.family_id 
      AND fm2.user_id = auth.uid()
    )
  );

CREATE POLICY family_members_insert ON family_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm2
      WHERE fm2.family_id = family_members.family_id 
      AND fm2.user_id = auth.uid()
      AND fm2.role IN ('admin', 'super_admin')
    )
  );

-- Referrals: Users can see referrals for their families
CREATE POLICY referrals_select ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE (family_members.family_id = referrals.referrer_family_id OR 
             family_members.family_id = referrals.referred_family_id)
      AND family_members.user_id = auth.uid()
    )
  );

-- Fusion Codes: Users can see codes for their families
CREATE POLICY fusion_codes_select ON fusion_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = fusion_codes.family_id 
      AND family_members.user_id = auth.uid()
    )
  );

-- Admin Actions: Only super admins can see
CREATE POLICY admin_actions_select ON admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.user_id = auth.uid()
      AND family_members.role = 'super_admin'
    )
  );

CREATE POLICY admin_actions_insert ON admin_actions FOR INSERT
  WITH CHECK (admin_user_id = auth.uid());
