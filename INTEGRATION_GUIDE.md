# Guide d'Intégration RootsLegacy - Architecture Production

Ce guide explique comment intégrer toutes les modifications pour transformer RootsLegacy en une application production-ready avec isolation des données, SQL Supabase, et Super Admin Dashboard.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Étape 1 : Migration SQL Supabase](#étape-1--migration-sql-supabase)
3. [Étape 2 : Mise à jour du serveur Hono](#étape-2--mise-à-jour-du-serveur-hono)
4. [Étape 3 : Intégration React (AuthContext)](#étape-3--intégration-react-authcontext)
5. [Étape 4 : Mise à jour des composants](#étape-4--mise-à-jour-des-composants)
6. [Étape 5 : Déploiement et tests](#étape-5--déploiement-et-tests)
7. [Architecture et sécurité](#architecture-et-sécurité)
8. [Troubleshooting](#troubleshooting)

---

## Prérequis

- Accès au dashboard Supabase
- Hono backend déployé sur Supabase Edge Functions
- React 18.3+ avec Vite
- Node.js 22+

---

## Étape 1 : Migration SQL Supabase

### 1.1 Créer les tables SQL

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête
5. Copiez le contenu de `supabase/migrations/001_create_tables.sql`
6. Exécutez la requête

**⚠️ Important :** Cette migration crée :
- 8 tables relationnelles (families, profiles, relations, family_members, referrals, fusion_codes, app_config, admin_actions)
- **Row Level Security (RLS)** sur toutes les tables
- Index sur les colonnes critiques

### 1.2 Vérifier la création des tables

```sql
-- Vérifier que toutes les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Vous devriez voir :
- admin_actions
- app_config
- families
- family_members
- fusion_codes
- profiles
- referrals
- relations

### 1.3 Activer RLS

RLS est activé automatiquement par la migration. Vérifiez dans **Authentication > Policies** que les politiques sont en place.

---

## Étape 2 : Mise à jour du serveur Hono

### 2.1 Remplacer le serveur

1. Sauvegardez l'ancien `supabase/functions/server/index.tsx` :
   ```bash
   cp supabase/functions/server/index.tsx supabase/functions/server/index.tsx.backup
   ```

2. Remplacez par le nouveau serveur :
   ```bash
   cp supabase/functions/server/index_new.tsx supabase/functions/server/index.tsx
   ```

### 2.2 Ajouter les nouveaux modules

Les fichiers suivants doivent être dans `supabase/functions/server/` :

- ✅ `db.tsx` — Opérations SQL avec family_id isolation
- ✅ `app_config.tsx` — Gestion centralisée des paramètres
- ✅ `index.tsx` — Serveur Hono révisé

### 2.3 Vérifier les imports

Le serveur importe :
```typescript
import * as db from "./db.tsx";
import * as appConfig from "./app_config.tsx";
```

Assurez-vous que ces fichiers existent dans le même répertoire.

### 2.4 Déployer les Edge Functions

```bash
# Depuis la racine du projet
supabase functions deploy server
```

Vérifiez le déploiement dans **Edge Functions > server** sur Supabase Dashboard.

---

## Étape 3 : Intégration React (AuthContext)

### 3.1 Créer AuthContext

Créez le fichier `src/app/components/auth-context.tsx` avec le contenu fourni.

Ce fichier crée :
- `AuthProvider` — Wrapper pour l'application
- `useAuth()` — Hook pour accéder aux données d'auth
- Chargement unique au démarrage
- Écoute des changements d'auth

### 3.2 Mettre à jour RootLayout

Remplacez `src/app/components/root-layout.tsx` par `root-layout-updated.tsx` :

```typescript
import { AuthProvider } from './auth-context';

export function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-[#FFF8E7]">
          <Outlet />
          <Toaster position="bottom-center" />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
```

### 3.3 Mettre à jour les routes

Dans `src/app/routes.ts`, assurez-vous que la route `/admin` pointe vers `AdminDashboard` :

```typescript
import { AdminDashboard } from "./components/admin-dashboard";

// Dans le routeur
{
  path: "admin",
  Component: AdminDashboard,
}
```

---

## Étape 4 : Mise à jour des composants

### 4.1 Remplacer les composants

Remplacez les fichiers suivants par les versions mises à jour :

| Ancien | Nouveau | Raison |
|--------|---------|--------|
| `home.tsx` | `home-updated.tsx` | isAdmin dynamique via useAuth() |
| `subscription-upgrade.tsx` | `subscription-upgrade-updated.tsx` | Nouveau modèle pricing (lifetime + annuel) |
| `family-relations.tsx` | `family-relations-updated.tsx` | Types de relations étendus |

### 4.2 Ajouter le Super Admin Dashboard

Créez `src/app/components/admin-dashboard.tsx` avec le contenu fourni.

### 4.3 Utiliser useAuth() dans les composants

Exemple pour vérifier si l'utilisateur est admin :

```typescript
import { useAuth } from './auth-context';

export function MyComponent() {
  const { role, familyId, userId, loading } = useAuth();
  
  const isAdmin = role === 'admin' || role === 'super_admin';
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### 4.4 Faire des appels API avec le token

Tous les appels API doivent passer par le token Supabase :

```typescript
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/profiles`,
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  }
);
```

---

## Étape 5 : Déploiement et tests

### 5.1 Tester localement

```bash
# Démarrer le serveur de développement
npm run dev

# Tester les endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5173/api/make-server-467d3bfa/auth/role
```

### 5.2 Tester l'isolation family_id

1. Créez deux familles avec deux utilisateurs différents
2. Vérifiez que l'utilisateur A ne peut pas voir les profils de la famille B
3. Testez les endpoints `/profiles`, `/relations`, `/family-members`

### 5.3 Tester le Super Admin Dashboard

1. Promovez un utilisateur en `super_admin` (via SQL ou endpoint)
2. Accédez à `/admin`
3. Vérifiez les 4 onglets : Metrics, Pricing, Families, Referrals

### 5.4 Tester la pagination

```bash
# Tester la pagination avec cursors
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5173/api/make-server-467d3bfa/profiles?limit=20&cursor=CURSOR_VALUE"
```

---

## Architecture et sécurité

### 🔒 Row Level Security (RLS)

Chaque table a des politiques RLS qui garantissent :
- Les utilisateurs ne voient que leurs propres familles
- Les admins peuvent modifier les données de leur famille
- Les super_admins ont accès à tout (via filtres explicites)

**Politiques principales :**

| Table | SELECT | INSERT | UPDATE |
|-------|--------|--------|--------|
| families | Member de la famille | Creator | Admin de la famille |
| profiles | Member de la famille | Admin | Admin |
| relations | Member de la famille | Admin | Admin |
| family_members | Member de la famille | Admin | Admin |
| admin_actions | Super admin seulement | Super admin | - |

### 🔑 Isolation family_id

Chaque requête filtre automatiquement par `family_id` :

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

### 📊 Pagination

Tous les endpoints retournent :

```json
{
  "data": [...],
  "nextCursor": "uuid-or-null",
  "total": 20
}
```

Utilisez `nextCursor` pour charger la page suivante.

### 🔐 Audit Logging

Chaque action admin est loggée dans `admin_actions` :

```typescript
await db.logAdminAction(
  userId,
  'promote_to_admin',
  familyId,
  targetUserId
);
```

---

## Troubleshooting

### ❌ Erreur : "No authorization header"

**Cause :** Le token n'est pas envoyé correctement.

**Solution :**
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Rediriger vers login
  return;
}

// Envoyer le token
headers: {
  'Authorization': `Bearer ${session.access_token}`,
}
```

### ❌ Erreur : "Access denied" ou "403 Forbidden"

**Cause :** L'utilisateur n'a pas les permissions pour cette action.

**Solution :**
1. Vérifiez que l'utilisateur est admin : `GET /auth/role`
2. Vérifiez que l'utilisateur est dans la bonne famille
3. Vérifiez les politiques RLS dans Supabase

### ❌ Erreur : "Profile not found" ou "Family not found"

**Cause :** L'ID n'existe pas ou l'utilisateur n'a pas accès.

**Solution :**
1. Vérifiez que l'ID est correct
2. Vérifiez que l'utilisateur est dans la bonne famille
3. Vérifiez les politiques RLS

### ❌ Les données de l'ancienne app ne s'affichent pas

**Cause :** Les données sont encore dans le KV store, pas dans SQL.

**Solution :** Créez une migration pour copier les données du KV store vers SQL (voir section Migration des données legacy).

### ❌ AuthContext ne charge pas

**Cause :** `AuthProvider` n'est pas au-dessus des composants.

**Solution :** Vérifiez que `RootLayout` enveloppe tout avec `<AuthProvider>`.

---

## Migration des données legacy (KV Store → SQL)

Si vous avez des données dans l'ancien KV store, vous devez les migrer :

```typescript
// supabase/functions/server/migrate.tsx
import * as kv from './kv_store.tsx';
import * as db from './db.tsx';

export async function migrateKVToSQL() {
  // Récupérer toutes les familles du KV store
  const familiesKV = await kv.getByPrefix('family:');
  
  for (const familyKV of familiesKV) {
    // Créer la famille en SQL
    const family = await db.createFamily(
      familyKV.name,
      familyKV.created_by,
      familyKV.plan
    );
    
    // Migrer les profils
    const profilesKV = await kv.getByPrefix(`profile:${familyKV.id}:`);
    for (const profileKV of profilesKV) {
      await db.createProfile(
        family.family_id,
        profileKV.full_name,
        familyKV.created_by,
        profileKV
      );
    }
  }
}
```

---

## Prochaines étapes

1. ✅ **Intégration complète** — Suivez ce guide
2. 🔄 **Tests en production** — Testez avec de vraies données
3. 📊 **Monitoring** — Configurez les logs et alertes
4. 🚀 **Lancement** — Annoncez à vos utilisateurs

---

## Support

Pour toute question ou problème :
1. Consultez le [Troubleshooting](#troubleshooting)
2. Vérifiez les logs Supabase (Edge Functions > Logs)
3. Vérifiez la console du navigateur (F12)
4. Contactez le support Supabase

---

**Dernière mise à jour :** Février 2026
**Version :** 1.0.0
