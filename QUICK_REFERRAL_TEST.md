# 🚀 Test Rapide du Système de Parrainage

## Accès Rapide
**Aller à:** Settings → Test de Parrainage → `/referral-test`

## Test Automatique en 3 Étapes

### ✨ Ce que fait le test:

1. **User 1 (Parrain)** 🔵
   - Crée un compte automatiquement
   - Génère un code de parrainage unique
   - Obtient un lien: `/join/{CODE}`

2. **User 2 (Filleul)** 🟢
   - S'inscrit via le lien de parrainage
   - Enregistre le lien dans le système
   - Status: "En attente"

3. **Paiement & Récompenses** 💰
   - User 2 paie $59
   - **Parrain reçoit:** 12 mois gratuits
   - **Filleul reçoit:** 12 mois gratuits
   - Status: "Payé" ✓

---

## 🎯 Résultats Attendus

### User 1 (Parrain)
```
✅ Familles référées: 1
✅ Stockage gagné: 12 mois
✅ Liste des invités:
   - Famille Martin (Status: Payé)
```

### User 2 (Filleul)
```
✅ Stockage total: 12 mois
✅ Bonus reçu: 12 mois
```

---

## 📋 Checklist de Validation

- [ ] User 1 créé avec succès
- [ ] Code de parrainage généré (format: `famille-{nom}-{id}`)
- [ ] Lien de parrainage fonctionnel
- [ ] User 2 créé via le lien
- [ ] Enregistrement du parrainage dans la base
- [ ] Status "En attente" visible
- [ ] Paiement de $59 traité
- [ ] Parrain reçoit 12 mois
- [ ] Filleul reçoit 12 mois
- [ ] Status passe à "Payé"
- [ ] Dashboard mis à jour correctement

---

## 🛠️ Configuration par Défaut

**User 1 (Parrain):**
- Email: `user1@test.com`
- Nom: `Jean Diallo`
- Famille: `Famille Diallo`

**User 2 (Filleul):**
- Email: `user2@test.com`
- Nom: `Sophie Martin`
- Famille: `Famille Martin`

Vous pouvez modifier ces valeurs avant de lancer le test.

---

## 🔍 Vérifications Backend

Les données sont stockées dans le KV store:

```javascript
// Referral du parrain
referral:family:{userId} = {
  referralCode: "famille-diallo-abc1",
  totalReferred: 1,
  totalStorageEarned: 12,
  referredFamilies: [...]
}

// Référence du code
referral:code:{code} = userId

// Données du filleul
referral:referred:{newUserId} = {
  referredBy: referrerUserId,
  referralCode: "famille-diallo-abc1",
  bonusStorageMonths: 12
}

// Stockage
storage:{userId} = {
  freeMonthsGranted: 12,
  expiresAt: "...",
  history: [...]
}
```

---

## 🎨 Interface du Test

Le test affiche des cards colorées pour chaque étape:

- **Bleu** 🔵 - User 1 (Parrain)
- **Vert** 🟢 - User 2 (Filleul)  
- **Violet** 💜 - Paiement & Résultats

Chaque étape attend votre confirmation avant de continuer.

---

## ❌ Dépannage

**Problème:** Erreur lors de la création de User 1
- **Solution:** Changez l'email (l'utilisateur existe peut-être déjà)

**Problème:** Le code de parrainage n'est pas valide
- **Solution:** Vérifiez les logs de la console pour voir l'erreur exacte

**Problème:** Les récompenses ne sont pas accordées
- **Solution:** Vérifiez que le paiement est ≥ $29 et que c'est le premier paiement

---

## 🎉 Après le Test

Vous pouvez:

1. **Voir le Dashboard** - Cliquer sur "Voir Dashboard de Parrainage"
2. **Recommencer** - Cliquer sur "Recommencer le Test" avec de nouveaux emails
3. **Tester Manuellement** - Utiliser le lien généré dans un navigateur différent

---

## 📱 Test Manuel (Alternative)

Si vous préférez tester manuellement:

1. Allez dans **Settings → Parrainage → Programme de Parrainage**
2. Créez votre code de parrainage
3. Copiez le lien
4. Ouvrez un **nouvel onglet incognito**
5. Collez le lien → Inscription
6. Revenez au compte principal
7. Allez dans **Test de Paiement**
8. Payez minimum $29
9. Vérifiez les récompenses dans les deux comptes

---

✅ **Le système de parrainage est prêt à l'emploi!**
