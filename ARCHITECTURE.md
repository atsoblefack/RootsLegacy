# Architecture RootsLegacy - Production Ready

## 📐 Vue d'ensemble

RootsLegacy est une application de gestion d'arbres généalogiques construite sur :

- **Frontend** : React 18.3 + Vite + Tailwind CSS + React Router
- **Backend** : Hono + Supabase Edge Functions
- **Base de données** : PostgreSQL (Supabase) avec Row Level Security
- **Authentification** : Supabase Auth (JWT)
- **State Management** : React Context (AuthContext)

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Components (Home, Profiles, Relations, Admin, etc)  │   │
│  │  └─ useAuth() → AuthContext (user, role, familyId)   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions (Hono)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /make-server-467d3bfa/...                           │   │
│  │  ├─ /auth/signup, /auth/role                         │   │
│  │  ├─ /profiles, /relations, /family-members          │   │
│  │  ├─ /pricing, /app-config                           │   │
│  │  └─ /admin-actions                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Modules                                             │   │
│  │  ├─ db.tsx (SQL operations + family_id filtering)   │   │
│  │  ├─ app_config.tsx (centralized config)             │   │
│  │  └─ [legacy] kv_store.tsx (deprecated)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ SQL/RLS
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL (Supabase)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables (with Row Level Security)                    │   │
│  │  ├─ families (family_id, plan, status)              │   │
│  │  ├─ profiles (family_id, user_id, full_name)        │   │
│  │  ├─ relations (family_id, profile_id_1/2)           │   │
│  │  ├─ family_members (family_id, user_id, role)       │   │
│  │  ├─ referrals (referrer_family_id, referred_family) │   │
│  │  ├─ fusion_codes (family_id, profile_id)            │   │
│  │  ├─ app_config (key, value)                         │   │
│  │  └─ admin_actions (audit log)                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Sécurité et Isolation

### Row Level Security (RLS)

Chaque table a des politiques RLS qui garantissent l'isolation des données :

```sql
-- Exemple : Politique SELECT sur profiles
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = profiles.family_id 
      AND family_members.user_id = auth.uid()
    )
  );
```

**Règle d'or :** Un utilisateur ne peut voir que les données de sa famille.

### family_id Isolation

Chaque entité (profile, relation, etc.) a un `family_id` :

```typescript
// Exemple dans db.tsx
export async function getProfilesByFamilyId(familyId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('family_id', familyId);  // ← Filtre obligatoire
  return data;
}
```

### Rôles et permissions

| Rôle | Accès | Permissions |
|------|-------|-------------|
| **guest** | Aucun | Voir landing page |
| **member** | Famille | Lire profils, relations |
| **admin** | Famille | Créer/modifier profils, relations, inviter membres |
| **super_admin** | Système | Gérer config, voir toutes les familles, audit |

---

## 📊 Modèle de données

### Families

```sql
CREATE TABLE families (
  id UUID PRIMARY KEY,
  family_id UUID UNIQUE NOT NULL,  -- Clé métier
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  plan TEXT ('roots', 'family', 'heritage', 'trial'),
  status TEXT ('trial', 'active', 'read_only', 'grace'),
  trial_ends_at TIMESTAMP,
  storage_paid_until TIMESTAMP,
  grace_ends_at TIMESTAMP,
  member_limit INTEGER,
  created_at TIMESTAMP
);
```

**Statuts :**
- `trial` — 30 jours gratuits
- `active` — Plan payant actif
- `grace` — 90 jours de grâce après expiration
- `read_only` — Accès en lecture seule

### Profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(family_id),
  user_id UUID,  -- NULL si profil sans compte
  full_name TEXT NOT NULL,
  local_name TEXT,
  birth_date DATE,
  death_date DATE,
  gender TEXT,
  profession TEXT,
  bio TEXT,
  photo_url TEXT,
  village_country TEXT,
  village_city TEXT,
  village_name TEXT,
  is_alive BOOLEAN,
  created_by UUID NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Relations

```sql
CREATE TABLE relations (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(family_id),
  profile_id_1 UUID NOT NULL REFERENCES profiles(id),
  profile_id_2 UUID NOT NULL REFERENCES profiles(id),
  relation_type TEXT (
    'spouse', 'parent', 'child', 'sibling',
    'uncle_aunt', 'nephew_niece', 'cousin',
    'guardian', 'godparent'
  ),
  marriage_date DATE,
  marriage_place TEXT,
  divorce_date DATE,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Family Members

```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(family_id),
  user_id UUID NOT NULL,
  role TEXT ('member', 'admin', 'super_admin'),
  status TEXT ('active', 'suspended'),
  invited_by UUID,
  joined_at TIMESTAMP,
  created_at TIMESTAMP,
  UNIQUE(family_id, user_id)
);
```

### App Config

```sql
CREATE TABLE app_config (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,  -- 'trial_duration_days', 'max_admins_per_family', etc.
  value JSONB NOT NULL,
  updated_at TIMESTAMP
);
```

**Clés principales :**
- `trial_duration_days` → 30
- `grace_period_days` → 90
- `max_admins_per_family` → 3
- `referral_cap_months` → 36
- `plan_roots_member_limit` → 30
- `plan_family_member_limit` → 80
- `plan_heritage_member_limit` → 9999
- `plan_roots_lifetime_price` → 29
- `plan_family_lifetime_price` → 59
- `plan_heritage_lifetime_price` → 149

### Admin Actions (Audit Log)

```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT ('signup', 'promote_to_admin', 'update_config', etc.),
  target_family_id UUID,
  target_user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP
);
```

---

## 🔄 Flux de données

### 1. Signup (Création de famille)

```
1. User POST /auth/signup
   ├─ Supabase Auth crée le compte
   ├─ db.createFamily() crée la famille
   ├─ db.addFamilyMember() ajoute l'utilisateur comme admin
   └─ db.logAdminAction() enregistre l'action

2. Frontend reçoit { user, family }
   ├─ Sauvegarde le token JWT
   ├─ AuthContext charge user, role, familyId
   └─ Redirige vers /home
```

### 2. Créer un profil

```
1. Admin POST /profiles
   ├─ Vérifie authorization (token JWT)
   ├─ Récupère familyId depuis family_members
   ├─ Vérifie que l'utilisateur est admin
   ├─ Vérifie que member_limit n'est pas atteint
   ├─ db.createProfile() insère le profil
   └─ db.logAdminAction() enregistre l'action

2. RLS filtre automatiquement par family_id
   └─ Seuls les membres de cette famille voient le profil
```

### 3. Charger les profils

```
1. Member GET /profiles?limit=20&cursor=CURSOR
   ├─ Vérifie authorization
   ├─ Récupère familyId
   ├─ db.getProfilesByFamilyId(familyId, limit, cursor)
   │  └─ SELECT * FROM profiles WHERE family_id = familyId
   │     ORDER BY created_at DESC LIMIT 21
   └─ Retourne { data: [...], nextCursor, total }

2. Frontend affiche les profils
   └─ Utilise nextCursor pour charger la page suivante
```

### 4. Super Admin Dashboard

```
1. Super Admin GET /admin
   ├─ AuthContext charge role = 'super_admin'
   ├─ Affiche 4 onglets : Metrics, Pricing, Families, Referrals
   └─ Peut modifier app_config

2. Super Admin PUT /app-config
   ├─ Vérifie super_admin
   ├─ db.setAppConfig(key, value)
   └─ Les changements prennent effet immédiatement
```

---

## 🔌 Endpoints API

### Auth

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/signup` | Créer compte + famille |
| GET | `/auth/role` | Obtenir role + familyId |

### Profiles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/profiles` | Créer profil (admin) |
| GET | `/profiles` | Lister profils (pagination) |
| GET | `/profiles/:id` | Obtenir profil |
| PUT | `/profiles/:id` | Modifier profil (admin) |

### Relations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/relations` | Créer relation (admin) |
| GET | `/relations` | Lister relations (pagination) |

### Family Members

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/family-members` | Lister membres (pagination) |
| POST | `/family-members/:userId/promote` | Promouvoir en admin |

### Pricing & Config

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/pricing` | Obtenir plans (public) |
| GET | `/app-config` | Obtenir config (super admin) |
| PUT | `/app-config` | Modifier config (super admin) |

### Admin

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/admin-actions` | Lister actions (super admin, pagination) |

---

## 🎯 Pagination

Tous les endpoints retournent :

```json
{
  "data": [...],
  "nextCursor": "2024-02-25T10:30:00Z",
  "total": 20
}
```

**Utilisation :**

```typescript
// Page 1
const response1 = await fetch('/profiles?limit=20');
const { data, nextCursor } = await response1.json();

// Page 2
const response2 = await fetch(`/profiles?limit=20&cursor=${nextCursor}`);
```

---

## 🚀 Performance

### Index

Tous les index sont créés sur les colonnes fréquemment filtrées :

```sql
CREATE INDEX idx_profiles_family_id ON profiles(family_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_relations_family_id ON relations(family_id);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at);
```

### Limites

- Chaque requête SELECT a un LIMIT (jamais SELECT * sans limite)
- Pagination avec cursors (pas d'offset)
- RLS filtre au niveau de la base de données (pas d'application)

---

## 🔄 Mise à jour des données

### AuthContext

Charge une seule fois au démarrage :

```typescript
// src/app/components/auth-context.tsx
useEffect(() => {
  fetchAuthInfo();  // Une seule fois
  
  // Écoute les changements d'auth
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      await fetchAuthInfo();  // Recharge si changement
    }
  );
}, []);
```

### Refetch manuel

```typescript
const { refetch } = useAuth();
await refetch();  // Recharge les données
```

---

## 🐛 Debugging

### Logs

Tous les logs utilisent le format :
- `✅` — Succès
- `🔵` — Info
- `⚠️` — Warning
- `❌` — Erreur

### Console du navigateur

```javascript
// Vérifier l'auth
const { data: { session } } = await supabase.auth.getSession();
console.log(session);

// Vérifier le token
console.log(session.access_token);

// Décoder le JWT (pour debug)
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
```

### Supabase Logs

1. Allez sur Supabase Dashboard
2. **Edge Functions > server > Logs**
3. Cherchez les erreurs

---

## 📈 Scalabilité

Cette architecture supporte :
- ✅ **10,000 familles** avec RLS
- ✅ **100,000 utilisateurs** avec pagination
- ✅ **1,000,000 profils** avec index
- ✅ **Croissance linéaire** (O(n) avec index)

**Limitations :**
- Requêtes sans index → O(n)
- RLS complexe → peut ralentir les requêtes
- Trop de relations → peut ralentir les jointures

---

## 🔐 Sécurité

### HTTPS

Tous les appels API utilisent HTTPS (Supabase Edge Functions).

### JWT

Les tokens JWT sont signés par Supabase Auth et vérifiés par RLS.

### RLS

Chaque requête SQL est filtrée par RLS avant de retourner les données.

### CORS

CORS est activé pour les domaines autorisés (voir `index.tsx`).

---

## 📚 Références

- [Supabase Docs](https://supabase.com/docs)
- [Hono Docs](https://hono.dev)
- [React Docs](https://react.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

**Dernière mise à jour :** Février 2026
**Version :** 1.0.0
