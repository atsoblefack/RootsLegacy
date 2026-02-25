# Fix: Multiple GoTrueClient Instances Warning

## Problème

L'application affichait un warning dans la console :
```
Multiple GoTrueClient instances detected in the same browser context. 
It is not an error, but this should be avoided as it may produce 
undefined behavior when used concurrently under the same storage key.
```

## Cause

Plusieurs composants créaient leurs propres instances de Supabase client en appelant `createClient()` directement, ce qui générait plusieurs instances de GoTrueClient (le client d'authentification de Supabase).

**Composants affectés :**
- `/src/app/components/manage-users.tsx`
- `/src/app/components/referral-dashboard.tsx`
- `/src/app/components/link-families.tsx`
- `/src/app/components/family-relations.tsx`

## Solution Implémentée

### 1. Création d'un Singleton Supabase Client

**Fichier:** `/utils/supabase/client.tsx`

```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a singleton instance of Supabase client
// This prevents multiple GoTrueClient instances warning
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );
  }
  return supabaseInstance;
}

// Export the singleton instance
export const supabase = getSupabaseClient();
```

### 2. Mise à Jour des Composants

Tous les composants qui utilisaient `createClient` directement ont été mis à jour pour importer le singleton :

**Avant :**
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
```

**Après :**
```typescript
import { supabase } from '/utils/supabase/client';
```

### 3. Composants Mis à Jour

✅ **manage-users.tsx**
- Import du singleton
- Utilisation de `supabase.auth.getSession()` pour l'authentification
- Ajout de toasts pour les messages de succès/erreur

✅ **referral-dashboard.tsx**
- Import du singleton
- Gestion cohérente des sessions

✅ **link-families.tsx**
- Import du singleton
- Ajout des imports manquants (Heart, Calendar, MapPin, Check)
- Fonctionnalité de liaison des familles maintenant opérationnelle

✅ **family-relations.tsx**
- Import du singleton
- Affichage correct des relations familiales

## Avantages

1. **Performance** : Une seule instance du client Supabase pour toute l'application
2. **Stabilité** : Évite les comportements indéfinis liés aux multiples instances
3. **Maintenabilité** : Configuration centralisée du client
4. **Mémoire** : Réduction de l'empreinte mémoire

## Tests de Vérification

Pour vérifier que la correction fonctionne :

1. Ouvrir la console du navigateur
2. Naviguer dans l'application vers différentes pages :
   - Dashboard de parrainage (`/referral`)
   - Gestion des utilisateurs (`/manage-users`)
   - Liaison des familles (`/link-families`)
3. Vérifier l'absence du warning "Multiple GoTrueClient instances"

## Notes Importantes

- ⚠️ Le singleton est créé à la première utilisation (lazy initialization)
- ⚠️ L'instance est réutilisée pour toutes les opérations Supabase
- ⚠️ Les sessions sont gérées de manière centralisée via `supabase.auth.getSession()`
- ✅ Cette approche est conforme aux meilleures pratiques Supabase

## Backend

Le backend (Edge Functions) n'est pas affecté car chaque invocation de fonction crée son propre contexte d'exécution isolé. Les instances multiples y sont normales et attendues.
