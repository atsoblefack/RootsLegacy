# Système de Relations Familiales et Fusion des Familles

## Vue d'ensemble

Le système de relations familiales permet de créer et gérer des liens entre les profils (mariages, parents-enfants, frères/sœurs) et ainsi fusionner différents arbres généalogiques.

## Fonctionnalités

### 1. Backend - Système de Relations

**Fichier**: `/supabase/functions/server/relationships.tsx`

Ce module gère toutes les relations familiales :

#### Types de relations supportées
- `spouse` : Conjoint/Époux
- `parent` : Relation parent-enfant (profileId1 = parent, profileId2 = enfant)
- `child` : Relation enfant-parent (inverse de parent)
- `sibling` : Frère/Sœur

#### Fonctions principales

```typescript
// Créer une relation entre deux profils
createRelationship(profileId1, profileId2, type, createdBy, metadata)

// Obtenir toutes les relations d'un profil
getProfileRelationships(profileId)

// Obtenir les relations par type
getProfileRelationshipsByType(profileId, type)

// Obtenir les conjoints d'un profil
getSpouses(profileId)

// Obtenir l'arbre généalogique complet
getFamilyTree(profileId, maxDepth)
```

### 2. API Routes

**Fichier**: `/supabase/functions/server/index.tsx`

#### Endpoints disponibles

```
POST /make-server-467d3bfa/relationships
- Créer une nouvelle relation
- Body: { profileId1, profileId2, type, metadata }

GET /make-server-467d3bfa/profiles/:id/relationships
- Obtenir toutes les relations d'un profil

GET /make-server-467d3bfa/profiles/:id/spouses
- Obtenir les conjoints d'un profil

GET /make-server-467d3bfa/profiles/:id/family-tree?depth=3
- Obtenir l'arbre généalogique complet

PUT /make-server-467d3bfa/relationships/:id
- Mettre à jour une relation (ex: ajouter date de mariage)

DELETE /make-server-467d3bfa/relationships/:id
- Supprimer une relation

GET /make-server-467d3bfa/relationships
- Obtenir toutes les relations (Admin seulement)
```

### 3. Interface Utilisateur

#### Page de Liaison des Familles
**Fichier**: `/src/app/components/link-families.tsx`
**Route**: `/link-families`

Cette page permet de :
1. Rechercher et sélectionner deux personnes
2. Créer un lien de mariage entre elles
3. Ajouter des informations optionnelles (date et lieu du mariage)
4. Fusionner automatiquement les deux arbres généalogiques

**Accès**: Réservé aux administrateurs et super-administrateurs
- Accessible via Settings > Administration > Lier les Familles

#### Composant Relations Familiales
**Fichier**: `/src/app/components/family-relations.tsx`

Ce composant affiche toutes les relations d'un profil :
- Conjoints avec dates de mariage
- Parents
- Enfants
- Frères et sœurs

**Usage**:
```tsx
import { FamilyRelations } from './family-relations';

<FamilyRelations profileId="profile-uuid" />
```

### 4. Flux d'utilisation

#### Scénario : Fusionner deux familles par mariage

1. **Navigation**
   - L'administrateur va dans Settings > Lier les Familles

2. **Sélection des personnes**
   - Rechercher et sélectionner la première personne
   - Rechercher et sélectionner la deuxième personne
   - Le système vérifie automatiquement qu'ils ne sont pas déjà liés

3. **Ajout des détails**
   - Optionnel : Ajouter la date de mariage
   - Optionnel : Ajouter le lieu de mariage

4. **Création du lien**
   - Cliquer sur "Créer le lien matrimonial"
   - Le système crée la relation `spouse` entre les deux profils
   - Les deux arbres généalogiques sont maintenant fusionnés

5. **Visualisation**
   - Les conjoints apparaissent dans les profils respectifs
   - L'arbre généalogique affiche les deux familles connectées

## Structure des Données

### Relationship Object
```typescript
{
  id: string;
  profileId1: string;        // Premier profil
  profileId2: string;        // Deuxième profil
  type: 'spouse' | 'parent' | 'child' | 'sibling';
  createdBy: string;         // ID de l'utilisateur créateur
  createdAt: string;         // ISO date
  metadata: {
    marriageDate?: string;   // Pour type 'spouse'
    marriagePlace?: string;  // Pour type 'spouse'
    divorceDate?: string;    // Pour type 'spouse'
    notes?: string;          // Notes diverses
  }
}
```

### Index System
Le système maintient des index pour accélérer les recherches :
- `relationship:{relationshipId}` : Stocke la relation
- `profile_relationships:{profileId}` : Liste des IDs de relations pour un profil

## Permissions

- **Super Admin** : Peut tout faire + gérer les utilisateurs
- **Admin** : Peut créer des relations, gérer les profils
- **Member** : Peut voir les relations de leur propre famille

## Validation

Le système empêche :
- Les relations avec soi-même
- Les relations en double (même type entre mêmes profils)
- Les relations avec des profils inexistants

## Fonctionnalités Futures Possibles

1. **Types de relations supplémentaires**
   - Cousins
   - Oncles/Tantes
   - Neveux/Nièces

2. **Timeline des événements**
   - Mariages
   - Divorces
   - Naissances

3. **Visualisation d'arbre améliorée**
   - Affichage graphique des conjoints
   - Navigation entre familles fusionnées
   - Vue des familles multiples

4. **Import/Export**
   - Format GEDCOM pour compatibilité avec d'autres apps généalogiques
   - Export PDF de l'arbre complet

## Notes Techniques

- Les relations sont bidirectionnelles (cherchées dans les deux sens)
- L'arbre généalogique utilise un système de profondeur maximale pour éviter les boucles infinies
- Les index sont mis à jour automatiquement lors de la création/suppression de relations
- Le système de KV store de Supabase est utilisé pour le stockage

## Dépannage

### La relation n'apparaît pas
- Vérifier que les deux profils existent
- Vérifier les permissions de l'utilisateur
- Consulter les logs du serveur pour les erreurs

### Erreur "Relationship already exists"
- Une relation du même type existe déjà entre ces profils
- Vérifier les relations existantes avant de créer une nouvelle

### Les conjoints ne s'affichent pas
- Recharger la page
- Vérifier que la relation est de type 'spouse'
- Vérifier les appels API dans la console
