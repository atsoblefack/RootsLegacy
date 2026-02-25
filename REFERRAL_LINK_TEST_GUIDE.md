# Guide de Test du Système de Parrainage RootsLegacy

## Vue d'ensemble
Le système de parrainage permet aux utilisateurs d'inviter d'autres familles et de gagner 12 mois de stockage gratuit pour chaque famille qui s'inscrit et effectue un premier paiement de minimum $29.

## Flux Complet de Test

### 1. Création du Lien de Parrainage (Utilisateur A - Parrain)

**Étapes:**
1. Connectez-vous à l'application
2. Allez dans **Settings** → **Parrainage** → **Programme de Parrainage**
3. Si c'est votre première fois:
   - Une modale apparaît demandant le nom de votre famille
   - Entrez "Famille Diallo" (ou autre nom)
   - Cliquez sur "Créer mon lien"
4. Votre code de parrainage est généré automatiquement
5. Le lien s'affiche: `https://[domain]/join/[CODE]`
6. Utilisez les boutons:
   - **Copier** - Copie le lien dans le presse-papiers
   - **Partager** - Ouvre le menu de partage natif (mobile)

**Vérifications:**
- ✅ Le code de parrainage est visible
- ✅ Le lien est au format correct
- ✅ Les statistiques affichent "0 Familles"
- ✅ Le stockage gagné est "0 mois"

---

### 2. Réception de l'Invitation (Utilisateur B - Filleul)

**Étapes:**
1. Ouvrez le lien de parrainage dans un **nouveau navigateur** ou en **mode incognito**
   - Format: `https://[domain]/join/[CODE]`
2. La page **ReferralInvite** s'affiche avec:
   - Message de bienvenue
   - Nom de la famille qui invite ("Famille Diallo")
   - Badge "12 mois de stockage gratuit"
   - Liste des avantages

**Vérifications:**
- ✅ Le nom de la famille s'affiche correctement
- ✅ Le badge "12 mois" est visible
- ✅ Les animations fonctionnent
- ✅ Le bouton "Commencer maintenant" est présent

---

### 3. Inscription du Filleul

**Étapes:**
1. Cliquez sur **"Commencer maintenant"**
2. Vous êtes redirigé vers `/signup`
3. Le badge de parrainage s'affiche en haut du formulaire:
   - "Invité par Famille Diallo"
   - "🎁 12 mois gratuits après paiement"
4. Remplissez le formulaire:
   - **Nom complet**: "Sophie Martin"
   - **Nom de famille**: "Famille Martin"
   - **Email**: "sophie@martin.com"
   - **Mot de passe**: "password123"
   - **Confirmer mot de passe**: "password123"
5. Cliquez sur **"Créer mon compte"**
6. Si le parrainage est détecté, vous verrez:
   - Toast: "🎉 Compte créé! Vous recevrez 12 mois gratuits après votre premier paiement!"

**Vérifications:**
- ✅ Le badge de parrainage s'affiche dans le formulaire
- ✅ Le compte est créé avec succès
- ✅ La notification de bonus s'affiche
- ✅ Redirection vers `/home`

---

### 4. Enregistrement du Parrainage (Backend)

**Ce qui se passe en coulisse:**

1. Le code de parrainage est stocké dans `sessionStorage` quand on clique sur le lien
2. Lors de l'inscription, le code est récupéré
3. Une requête POST est envoyée à `/referrals/register-signup` avec:
   ```json
   {
     "referralCode": "ABC123",
     "newFamilyId": "uuid-du-nouveau-user",
     "newFamilyName": "Famille Martin"
   }
   ```
4. Le backend enregistre:
   - La liaison entre le parrain et le filleul
   - Statut: "pending" (en attente de paiement)
   - Date d'inscription

**Vérifications Backend:**
```
KV Store:
- referral:{referrerUserId} → { referralCode, familyName, ... }
- referral_signups:{referralCode} → [{ familyId, familyName, joinedAt, status }]
```

---

### 5. Vérification Côté Parrain

**Retournez sur le compte du Parrain (Utilisateur A):**

1. Allez dans **Settings** → **Parrainage**
2. Le dashboard affiche maintenant:
   - **1 Famille** invitée
   - **0 mois** gagnés (car pas encore de paiement)
   - Liste des familles invitées:
     - "Famille Martin"
     - Status: "En attente"
     - Date de rejointe

**Vérifications:**
- ✅ Le compteur de familles = 1
- ✅ "Famille Martin" apparaît dans la liste
- ✅ Status = "En attente"
- ✅ Stockage gagné = 0 mois

---

### 6. Premier Paiement du Filleul

**Sur le compte du Filleul (Utilisateur B):**

1. Allez dans **Settings** → **Test de Paiement**
2. Entrez un montant ≥ $29 (exemple: $59)
3. Cliquez sur **"Simuler le paiement"**
4. Le système déclenche automatiquement:
   - Attribution de **12 mois** au **Filleul** (Sophie)
   - Attribution de **12 mois** au **Parrain** (Famille Diallo)
   - Notification de célébration: "🎉 Récompenses débloquées!"

**Vérifications:**
- ✅ Toast de succès avec notification de bonus
- ✅ Le paiement est enregistré

---

### 7. Vérification Finale - Parrain

**Retournez sur le compte du Parrain:**

1. Actualisez le dashboard de parrainage
2. Vous devriez voir:
   - **1 an** de stockage gratuit gagné (12 mois)
   - "Famille Martin" avec status **"Payé"** ✓
   - Badge vert "Payé" dans la liste

**Vérifications:**
- ✅ Stockage gagné = 12 mois (1 an)
- ✅ Status de "Famille Martin" = "Payé"
- ✅ Badge vert affiché
- ✅ Date de paiement visible

---

### 8. Vérification Finale - Filleul

**Sur le compte du Filleul:**

1. Allez dans **Settings** → **Parrainage**
2. Vérifiez:
   - **Stockage Total Gratuit** = 12 mois (ou plus si bonus de bienvenue)
   - Le filleul peut aussi créer son propre code de parrainage

**Vérifications:**
- ✅ Le filleul a reçu ses 12 mois
- ✅ Peut créer son propre lien de parrainage

---

## Cas de Test Supplémentaires

### Test 1: Lien Invalide
- Accédez à `/join/CODE_INVALIDE`
- Devrait afficher: "Lien invalide" avec bouton retour

### Test 2: Parrainage Multiple
- Partagez le même lien avec 2 nouvelles familles
- Vérifiez que le parrain gagne 24 mois (12 x 2)

### Test 3: Sans Code de Parrainage
- Accédez directement à `/signup` (sans passer par un lien)
- Le badge de parrainage ne doit PAS s'afficher
- L'inscription fonctionne normalement sans bonus

### Test 4: Paiement Insuffisant
- Le filleul paie moins de $29 (exemple: $10)
- Aucune récompense ne doit être accordée
- Les deux utilisateurs restent à 0 mois de bonus

---

## Architecture Technique

### Routes Frontend
- `/referral` - Dashboard de parrainage
- `/join/:code` - Page d'invitation avec code
- `/signup` - Inscription avec détection de code de parrainage

### Routes Backend
- `GET /referrals/stats` - Statistiques du parrain
- `POST /referrals/create` - Créer un code de parrainage
- `GET /referrals/code/:code` - Info d'un code (public)
- `POST /referrals/register-signup` - Enregistrer une inscription
- `POST /referrals/process-payment` - Traiter un paiement et distribuer récompenses

### Stockage KV
```
referral:{userId} = {
  referralCode: "ABC123",
  familyName: "Famille Diallo",
  totalReferred: 1,
  totalStorageEarned: 12
}

referral_signups:{referralCode} = [
  {
    familyId: "uuid",
    familyName: "Famille Martin",
    joinedAt: "2026-02-24T...",
    paidAt: "2026-02-24T...",
    status: "paid"
  }
]

user:{userId}:storage_reward = {
  storageMonths: 12,
  sources: ["referral_welcome", "referral_ABC123"]
}
```

---

## Dépannage

### Le lien ne fonctionne pas
- Vérifiez que le code existe dans la base de données
- Vérifiez l'API `/referrals/code/:code` dans les outils de développement

### Le bonus ne s'applique pas
- Vérifiez que le paiement est ≥ $29
- Vérifiez que c'est le PREMIER paiement de l'utilisateur
- Regardez les logs de la console pour les erreurs

### Le code n'est pas détecté à l'inscription
- Vérifiez que `sessionStorage.getItem('referral_code')` contient le code
- Assurez-vous de ne pas avoir vidé le cache entre les pages

---

## Checklist Complète

- [ ] Parrain peut créer un code de parrainage
- [ ] Lien de parrainage fonctionne
- [ ] Page d'invitation s'affiche correctement
- [ ] Badge de parrainage visible lors de l'inscription
- [ ] Compte filleul créé avec succès
- [ ] Enregistrement du parrainage en backend
- [ ] Statut "En attente" visible côté parrain
- [ ] Premier paiement ≥ $29 déclenche les récompenses
- [ ] Parrain reçoit 12 mois
- [ ] Filleul reçoit 12 mois
- [ ] Statut passe à "Payé" côté parrain
- [ ] Notifications de célébration affichées
- [ ] Dashboard de parrainage mis à jour correctement

🎉 Si tous les tests passent, le système de parrainage fonctionne parfaitement!
