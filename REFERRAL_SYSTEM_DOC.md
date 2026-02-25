# Système de Parrainage RootsLegacy

## Vue d'ensemble

Le système de parrainage permet aux familles payantes d'inviter d'autres familles et de gagner du stockage cloud gratuit. Chaque famille invitée qui effectue un paiement minimum de $29 rapporte 12 mois de stockage gratuit au parrain, et reçoit elle-même 3 mois gratuits.

## Caractéristiques Principales

### Pour le Parrain (Famille Invitante)
- ✅ Lien de parrainage unique et permanent (ex: `racinapp.com/join/famille-diallo-x7k2`)
- ✅ 12 mois de stockage gratuit par famille invitée qui paie
- ✅ Récompenses cumulatives jusqu'à 3 ans maximum (36 mois)
- ✅ Dashboard avec statistiques et suivi
- ✅ Partage facile via WhatsApp, SMS ou tout autre canal
- ✅ Notification célébratoire quand une famille rejoint et paie

### Pour le Filleul (Nouvelle Famille)
- ✅ 3 mois de stockage gratuit dès le premier paiement de $29+
- ✅ Écran de bienvenue montrant qui l'a invité
- ✅ Information claire sur le bonus avant l'inscription

### Règles du Système
- 🎯 Récompense déclenchée uniquement sur paiement confirmé ($29 minimum)
- 🎯 Jamais de récompense sur simple inscription
- 🎯 Liens permanents qui n'expirent jamais
- 🎯 Maximum 3 ans de stockage gratuit par famille
- 🎯 Récompenses automatiques sans action manuelle

## Architecture

### Backend (`/supabase/functions/server/referrals.tsx`)

#### Structures de Données

```typescript
interface Referral {
  id: string;
  familyId: string;                    // ID de la famille propriétaire
  referralCode: string;                // Code unique (ex: "famille-diallo-x7k2")
  createdAt: string;
  totalReferred: number;               // Nombre de familles parrainées
  totalStorageEarned: number;          // En mois (max 36)
  referredFamilies: Array<{
    familyId: string;
    familyName: string;
    joinedAt: string;
    paidAt?: string;
    status: 'pending' | 'paid';
  }>;
}

interface ReferralReward {
  familyId: string;
  storageMonths: number;               // Total de mois gagnés
  expiresAt?: string;                  // Date d'expiration
}
```

#### Fonctions Principales

**`generateReferralCode(familyName: string): string`**
- Génère un code unique basé sur le nom de famille
- Format: `famille-[slug]-[random]`
- Normalise les accents et caractères spéciaux

**`createReferral(familyId, familyName): Promise<Referral>`**
- Crée un lien de parrainage pour une famille
- Vérifie si un lien existe déjà
- Stocke le mapping code → familyId

**`getReferralByCode(code): Promise<{referral, familyName}>`**
- Récupère les infos d'un lien de parrainage (route publique)
- Retourne le nom de la famille et les détails

**`registerReferralSignup(referralCode, newFamilyId, newFamilyName): Promise<void>`**
- Enregistre qu'une nouvelle famille s'est inscrite via un lien
- Status: 'pending' (en attente du paiement)

**`processReferralPayment(newFamilyId, paymentAmount): Promise<{referrerReward, refereeBonus}>`**
- Traite le paiement et accorde les récompenses
- Vérifie le montant minimum ($29)
- Accorde 12 mois au parrain (max 36 mois total)
- Accorde 3 mois au nouveau membre
- Change le status en 'paid'

**`getReferralStats(familyId): Promise<Stats>`**
- Obtient toutes les statistiques pour le dashboard
- Retourne: referral, storageReward, progressToMax

### API Routes

```
POST /make-server-467d3bfa/referrals/create
Body: { familyName: string }
Auth: Required
→ Crée ou récupère le lien de parrainage

GET /make-server-467d3bfa/referrals/stats
Auth: Required
→ Obtient les stats du dashboard

GET /make-server-467d3bfa/referrals/code/:code
Auth: None (public)
→ Vérifie un code de parrainage

POST /make-server-467d3bfa/referrals/register-signup
Body: { referralCode, newFamilyId, newFamilyName }
Auth: None
→ Enregistre une inscription via parrainage

POST /make-server-467d3bfa/referrals/process-payment
Body: { paymentAmount: number }
Auth: Required
→ Traite le paiement et accorde les récompenses
```

## Frontend

### 1. Dashboard de Parrainage (`/src/app/components/referral-dashboard.tsx`)

**Route**: `/referral`

**Fonctionnalités**:
- Affichage du lien unique avec boutons Copier/Partager
- Statistiques visuelles : années gagnées, familles invitées
- Barre de progression vers le cap de 3 ans
- Liste des familles parrainées avec leur statut
- Modal de création si pas de lien existant
- Section "Comment ça marche?"

**États de l'interface**:
- Loading: Spinner centré
- Pas de lien: Modal de création
- Avec lien: Dashboard complet
- Aucune famille invitée: État vide encourageant

### 2. Page d'Invitation (`/src/app/components/referral-invite.tsx`)

**Route**: `/join/:code`

**Fonctionnalités**:
- Vérification du code de parrainage
- Affichage du nom de la famille invitante
- Carte de bonus proéminente (3 mois gratuits)
- Liste des avantages
- CTA pour continuer vers l'inscription
- Stockage du code en sessionStorage pour l'inscription

**États de l'interface**:
- Loading: Spinner sur fond dégradé
- Code invalide: Message d'erreur avec retour accueil
- Code valide: Écran de bienvenue complet

### 3. Notification de Récompense (`/src/app/components/reward-notification.tsx`)

**Utilisation**:
```tsx
import { RewardNotification, useRewardNotification } from './reward-notification';

function MyComponent() {
  const { show, familyName, storageMonths, showReward, hideReward } = useRewardNotification();
  
  // Déclencher la notification
  showReward('Famille Koné', 12);
  
  return (
    <RewardNotification
      familyName={familyName}
      storageMonths={storageMonths}
      show={show}
      onClose={hideReward}
    />
  );
}
```

**Fonctionnalités**:
- Animation de confetti célébratoire
- Affichage du nom de la famille
- Montant de stockage gagné
- Auto-fermeture après 10 secondes
- Bouton de fermeture manuelle
- Design chaleureux avec palette terracotta/ochre

## Flux d'Utilisation

### Scénario Complet : De l'Invitation au Paiement

#### Étape 1 : Création du Lien (Famille A - Parrain)

1. **Famille A** va dans Settings > Programme de Parrainage
2. Si premier accès : modal demande le nom de famille
3. Système génère le code unique `famille-diallo-k3x9`
4. Dashboard affiche : `racinapp.com/join/famille-diallo-k3x9`

#### Étape 2 : Partage

1. **Famille A** clique sur "Partager" ou "Copier"
2. Envoie le lien via WhatsApp, SMS, email, etc.

#### Étape 3 : Arrivée de la Famille B (Filleul)

1. **Famille B** clique sur le lien
2. Route: `/join/famille-diallo-k3x9`
3. Écran affiche:
   - "Invité par Famille Diallo"
   - "3 mois de stockage gratuit!"
   - Avantages de l'app
4. Bouton "Commencer maintenant"

#### Étape 4 : Inscription

1. Click redirige vers `/onboarding`
2. Le code `famille-diallo-k3x9` est stocké en sessionStorage
3. **Famille B** complète l'inscription normalement

#### Étape 5 : Enregistrement du Parrainage

Pendant l'inscription, appeler:
```javascript
await fetch('/referrals/register-signup', {
  method: 'POST',
  body: JSON.stringify({
    referralCode: sessionStorage.getItem('referral_code'),
    newFamilyId: newUser.id,
    newFamilyName: 'Famille Koné'
  })
});
```

Status: **PENDING** (en attente du paiement)

#### Étape 6 : Paiement

1. **Famille B** effectue le premier paiement ($29+)
2. Système de paiement appelle:
```javascript
await fetch('/referrals/process-payment', {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}` },
  body: JSON.stringify({
    paymentAmount: 29
  })
});
```

#### Étape 7 : Attribution des Récompenses

Automatiquement:
- ✅ **Famille A** reçoit +12 mois de stockage
- ✅ **Famille B** reçoit +3 mois de stockage
- ✅ Status change de 'pending' à 'paid'
- ✅ Compteurs mis à jour

#### Étape 8 : Notification

**Famille A** voit apparaître:
- Notification in-app avec confetti
- "La famille Koné a rejoint Racin — 1 an de stockage offert !"
- Dashboard mis à jour : 1 famille invitée, 1 an gagné

## Intégration avec le Système de Paiement

### Stripe Webhook Handler (à implémenter)

```typescript
// Dans le webhook Stripe
app.post('/stripe-webhook', async (c) => {
  const event = await stripe.webhooks.constructEvent(
    await c.req.text(),
    c.req.header('stripe-signature'),
    webhookSecret
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Traiter le parrainage si c'est le premier paiement
    const result = await referrals.processReferralPayment(
      session.client_reference_id, // User/Family ID
      session.amount_total / 100    // Convert cents to dollars
    );
    
    if (result.referrerReward) {
      // Déclencher la notification pour le parrain
      // (via WebSocket, push notification, ou polling)
    }
  }
});
```

## Stockage des Données (KV Store)

```
referral:family:{familyId}       → Referral object
referral:code:{code}              → familyId (pour lookup rapide)
referral:referred:{newFamilyId}   → { referredBy, referralCode, bonusStorageMonths }
storage_reward:{familyId}         → ReferralReward object
```

## Design et UX

### Palette de Couleurs
- **Primaire**: #D2691E (Terracotta)
- **Secondaire**: #E8A05D (Ochre)
- **Accent**: #FFD700 (Gold - pour les récompenses)
- **Success**: #2E7D32 (Vert forêt)
- **Neutral**: #5D4037, #8D6E63, #FFF8E7

### Typographie
- **Police**: Poppins
- **Titres**: Bold, 24-32px
- **Corps**: Medium/Regular, 14-16px
- **Petits textes**: 12px

### Coins Arrondis
- **Cartes**: 24px (rounded-3xl)
- **Boutons**: 16px (rounded-2xl)
- **Icônes circulaires**: 50% (rounded-full)

### Animations
- **Entrée**: Spring avec bounce
- **Hover**: Scale 0.98-1.02
- **Active**: Scale 0.95
- **Confetti**: Fall animation 3s
- **Progress bar**: Animate width 1s ease-out

## Messages et Micro-copy

### Ton
- Chaleureux, familial, encourageant
- Usage du "vous" formel mais amical
- Émojis pertinents (🎉, ❤️, 🎁, 🌳)

### Exemples

**Dashboard vide**:
> "Commencez à inviter! Partagez votre lien avec d'autres familles et gagnez jusqu'à 3 ans de stockage gratuit."

**Notification de récompense**:
> "La famille Koné a rejoint Racin — 1 an de stockage offert !"

**Écran d'invitation**:
> "En rejoignant via ce lien, vous recevrez automatiquement 3 mois de stockage gratuit dès votre premier paiement de $29 minimum."

## Métriques et Analytics

### KPIs à Tracker
- Nombre de liens créés
- Nombre de clics sur liens
- Taux de conversion (click → signup)
- Taux de paiement (signup → paid)
- Récompenses totales distribuées
- Famille avec le plus de parrainages

### Événements à Logger
- `referral_link_created`
- `referral_link_clicked`
- `referral_signup_completed`
- `referral_payment_processed`
- `referral_reward_granted`

## Sécurité et Validation

### Protections Implémentées
- ✅ Vérification du montant minimum ($29)
- ✅ Vérification du status (pas de double récompense)
- ✅ Cap maximum (36 mois)
- ✅ Codes uniques et non-devinables
- ✅ Validation côté serveur uniquement

### Points d'Attention
- Ne jamais permettre l'auto-parrainage
- Vérifier que les familles existent réellement
- Logger toutes les transactions de récompense
- Implémenter un système de détection de fraude si nécessaire

## Tests Recommandés

### Tests Unitaires
- Génération de codes uniques
- Calcul des récompenses
- Respect du cap de 36 mois
- Validation des montants

### Tests d'Intégration
- Flux complet d'inscription via lien
- Traitement de paiement et attribution
- Mise à jour des compteurs
- Notification du parrain

### Tests E2E
- Parcours utilisateur complet parrain → filleul
- Vérification des récompenses dans les deux comptes
- Test de partage sur différentes plateformes

## Roadmap Future

### Fonctionnalités Possibles
- 🎯 Codes de parrainage personnalisés
- 🎯 Paliers de récompenses (Bronze, Silver, Gold)
- 🎯 Leaderboard des meilleurs parrains
- 🎯 Récompenses spéciales pour jalons (10 familles, etc.)
- 🎯 Programme d'ambassadeurs avec avantages supplémentaires
- 🎯 Intégration avec le système de gamification existant
- 🎯 Notifications push pour nouvelles récompenses
- 🎯 Badges spéciaux pour parrains actifs
- 🎯 Récompenses en cascade (parrain du parrain)

## Support et Dépannage

### Problèmes Courants

**Le lien ne fonctionne pas**
- Vérifier que le code existe dans la base
- Vérifier l'URL complète
- Tester en mode navigation privée

**La récompense n'a pas été créditée**
- Vérifier que le paiement est ≥ $29
- Vérifier le statut du parrainage (pending vs paid)
- Vérifier les logs du serveur
- Vérifier que le cap de 36 mois n'est pas atteint

**La notification n'apparaît pas**
- Implémenter un système de polling ou WebSocket
- Vérifier les permissions de notification
- Forcer un refresh du dashboard

## Conformité et Légal

### Mentions Légales Recommandées
- Conditions générales du programme de parrainage
- Durée de validité des récompenses
- Conditions d'annulation ou modification
- Traitement des données des parrains/filleuls
- Droit de résiliation du programme

### RGPD
- Consentement pour partager le nom de famille
- Droit d'accès aux données de parrainage
- Droit de suppression (impacter les récompenses?)
