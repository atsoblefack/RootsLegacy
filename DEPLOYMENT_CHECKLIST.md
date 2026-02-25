# Checklist de déploiement RootsLegacy

## ✅ Phase 1 : Préparation (Avant le déploiement)

- [ ] Lire `ARCHITECTURE.md` pour comprendre l'architecture
- [ ] Lire `INTEGRATION_GUIDE.md` pour les étapes d'intégration
- [ ] Sauvegarder les données actuelles (export SQL)
- [ ] Tester localement avec `npm run dev`
- [ ] Vérifier que tous les fichiers sont présents :
  - [ ] `supabase/migrations/001_create_tables.sql`
  - [ ] `supabase/functions/server/db.tsx`
  - [ ] `supabase/functions/server/app_config.tsx`
  - [ ] `supabase/functions/server/index.tsx` (remplacé)
  - [ ] `src/app/components/auth-context.tsx`
  - [ ] `src/app/components/home-updated.tsx`
  - [ ] `src/app/components/subscription-upgrade-updated.tsx`
  - [ ] `src/app/components/family-relations-updated.tsx`
  - [ ] `src/app/components/admin-dashboard.tsx`

---

## ✅ Phase 2 : Migration SQL Supabase

### 2.1 Créer les tables

- [ ] Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Sélectionnez votre projet
- [ ] Allez dans **SQL Editor**
- [ ] Créez une nouvelle requête
- [ ] Copiez le contenu de `supabase/migrations/001_create_tables.sql`
- [ ] Exécutez la requête
- [ ] Vérifiez que toutes les tables sont créées :
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name;
  ```

### 2.2 Vérifier RLS

- [ ] Allez dans **Authentication > Policies**
- [ ] Vérifiez que les politiques RLS existent pour :
  - [ ] families
  - [ ] profiles
  - [ ] relations
  - [ ] family_members
  - [ ] referrals
  - [ ] fusion_codes
  - [ ] admin_actions

### 2.3 Vérifier les index

- [ ] Allez dans **SQL Editor**
- [ ] Exécutez :
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE schemaname = 'public' 
  ORDER BY indexname;
  ```
- [ ] Vérifiez que les index existent pour family_id, user_id, etc.

---

## ✅ Phase 3 : Déploiement du serveur Hono

### 3.1 Préparer les fichiers

- [ ] Sauvegardez l'ancien serveur :
  ```bash
  cp supabase/functions/server/index.tsx supabase/functions/server/index.tsx.backup
  ```

- [ ] Vérifiez que les nouveaux fichiers existent :
  ```bash
  ls -la supabase/functions/server/
  # Doit contenir : db.tsx, app_config.tsx, index.tsx
  ```

### 3.2 Déployer les Edge Functions

- [ ] Exécutez :
  ```bash
  supabase functions deploy server
  ```

- [ ] Vérifiez le déploiement :
  - [ ] Allez sur Supabase Dashboard
  - [ ] **Edge Functions > server**
  - [ ] Vérifiez que le statut est "Deployed"

### 3.3 Tester les endpoints

- [ ] Testez `/health` :
  ```bash
  curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/health
  ```

- [ ] Testez `/auth/signup` (créer un compte de test)
- [ ] Testez `/auth/role` (vérifier le rôle)
- [ ] Testez `/profiles` (créer et lister des profils)

---

## ✅ Phase 4 : Intégration React

### 4.1 Mettre à jour les composants

- [ ] Créez `src/app/components/auth-context.tsx`
- [ ] Mettez à jour `src/app/components/root-layout.tsx` pour inclure `<AuthProvider>`
- [ ] Remplacez `src/app/components/home.tsx` par `home-updated.tsx`
- [ ] Remplacez `src/app/components/subscription-upgrade.tsx` par `subscription-upgrade-updated.tsx`
- [ ] Remplacez `src/app/components/family-relations.tsx` par `family-relations-updated.tsx`
- [ ] Créez `src/app/components/admin-dashboard.tsx`

### 4.2 Mettre à jour les routes

- [ ] Ouvrez `src/app/routes.ts`
- [ ] Ajoutez la route `/admin` :
  ```typescript
  {
    path: "admin",
    Component: AdminDashboard,
  }
  ```

### 4.3 Tester localement

- [ ] Exécutez `npm run dev`
- [ ] Testez le signup (créer un compte)
- [ ] Vérifiez que `useAuth()` retourne les bonnes données
- [ ] Testez la page `/home` (isAdmin dynamique)
- [ ] Testez la page `/admin` (super admin dashboard)

---

## ✅ Phase 5 : Tests d'intégration

### 5.1 Tester l'isolation family_id

- [ ] Créez 2 comptes utilisateur
- [ ] Créez 2 familles (une par utilisateur)
- [ ] Créez des profils dans chaque famille
- [ ] Vérifiez que l'utilisateur A ne peut pas voir les profils de la famille B
- [ ] Vérifiez les logs RLS dans Supabase

### 5.2 Tester les rôles

- [ ] Testez avec un utilisateur `member` (accès en lecture seule)
- [ ] Testez avec un utilisateur `admin` (peut créer/modifier)
- [ ] Testez avec un utilisateur `super_admin` (accès complet)
- [ ] Vérifiez les erreurs 403 pour les accès non autorisés

### 5.3 Tester la pagination

- [ ] Créez 50+ profils
- [ ] Testez `/profiles?limit=20`
- [ ] Vérifiez que `nextCursor` est retourné
- [ ] Testez `/profiles?limit=20&cursor=CURSOR_VALUE`
- [ ] Vérifiez que la page suivante est chargée

### 5.4 Tester le Super Admin Dashboard

- [ ] Promovez un utilisateur en `super_admin` (via SQL) :
  ```sql
  UPDATE family_members 
  SET role = 'super_admin' 
  WHERE user_id = 'USER_ID';
  ```

- [ ] Accédez à `/admin`
- [ ] Vérifiez les 4 onglets :
  - [ ] **Metrics** — Affiche les statistiques
  - [ ] **Pricing** — Peut modifier les prix
  - [ ] **Families** — Liste les familles
  - [ ] **Referrals** — Liste les parrainages

### 5.5 Tester l'audit logging

- [ ] Effectuez des actions (créer profil, promouvoir admin)
- [ ] Vérifiez que les actions sont loggées dans `admin_actions`
- [ ] Vérifiez que super admin peut voir les logs

---

## ✅ Phase 6 : Optimisation et sécurité

### 6.1 Vérifier les logs

- [ ] Allez sur Supabase Dashboard
- [ ] **Edge Functions > server > Logs**
- [ ] Vérifiez qu'il n'y a pas d'erreurs
- [ ] Vérifiez les temps de réponse

### 6.2 Vérifier les performances

- [ ] Testez avec 1000+ profils
- [ ] Vérifiez que la pagination fonctionne bien
- [ ] Vérifiez que les requêtes sont rapides (< 200ms)

### 6.3 Vérifier la sécurité

- [ ] Vérifiez que RLS est activé sur toutes les tables
- [ ] Vérifiez que les tokens JWT sont validés
- [ ] Vérifiez que CORS est configuré correctement
- [ ] Testez les attaques (SQL injection, XSS, etc.)

---

## ✅ Phase 7 : Lancement en production

### 7.1 Sauvegarder les données

- [ ] Exportez les données SQL :
  ```bash
  pg_dump -h {HOST} -U {USER} -d {DATABASE} > backup.sql
  ```

- [ ] Stockez le backup en sécurité

### 7.2 Configurer le monitoring

- [ ] Configurez les alertes Supabase
- [ ] Configurez les logs (Sentry, LogRocket, etc.)
- [ ] Configurez les métriques (New Relic, DataDog, etc.)

### 7.3 Configurer les domaines

- [ ] Ajoutez votre domaine dans Supabase Auth
- [ ] Configurez CORS pour votre domaine
- [ ] Configurez les redirects après login

### 7.4 Annoncer le lancement

- [ ] Notifiez les utilisateurs
- [ ] Préparez le support client
- [ ] Préparez la documentation utilisateur

---

## ✅ Phase 8 : Post-lancement

### 8.1 Monitoring

- [ ] Vérifiez les logs quotidiennement
- [ ] Vérifiez les performances
- [ ] Vérifiez les erreurs utilisateur

### 8.2 Feedback utilisateur

- [ ] Collectez les retours
- [ ] Corrigez les bugs
- [ ] Améliorez les performances

### 8.3 Maintenance

- [ ] Mettez à jour les dépendances
- [ ] Optimisez les requêtes lentes
- [ ] Nettoyez les données obsolètes

---

## 🆘 Troubleshooting

### Erreur : "No authorization header"

```bash
# Vérifiez que le token est envoyé
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-467d3bfa/auth/role
```

### Erreur : "Access denied" (403)

- Vérifiez que l'utilisateur est admin : `GET /auth/role`
- Vérifiez que l'utilisateur est dans la bonne famille
- Vérifiez les politiques RLS

### Erreur : "Profile not found" (404)

- Vérifiez que l'ID existe
- Vérifiez que l'utilisateur a accès à cette famille
- Vérifiez les politiques RLS

### Erreur : "Member limit reached" (403)

- Vérifiez que le plan a assez de places
- Vérifiez la configuration dans `app_config`

### Performance lente

- Vérifiez les index
- Vérifiez les requêtes sans LIMIT
- Vérifiez les requêtes avec RLS complexe

---

## 📊 Métriques de succès

Après le lancement, vérifiez :

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Temps de réponse (API) | < 200ms | __ |
| Taux d'erreur | < 0.1% | __ |
| Uptime | > 99.9% | __ |
| Utilisateurs actifs | > 100 | __ |
| Familles créées | > 50 | __ |
| Profils créés | > 500 | __ |

---

## 📞 Support

Si vous avez des problèmes :

1. Consultez le [Troubleshooting](#troubleshooting)
2. Vérifiez les logs Supabase
3. Vérifiez la console du navigateur (F12)
4. Contactez le support Supabase

---

**Dernière mise à jour :** Février 2026
**Version :** 1.0.0
