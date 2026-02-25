# Configuration du stockage de photos permanentes

## Vue d'ensemble

Les photos de famille sont maintenant stockées avec des URLs publiques permanentes qui ne s'expirent jamais, au lieu des signed URLs limitées à 31536000 secondes.

## Configuration Supabase Storage

### Étape 1 : Créer le bucket public

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Storage**
4. Cliquez sur **Create a new bucket**
5. Nommez-le `family-photos`
6. **Cochez "Public bucket"** ✅
7. Cliquez sur **Create bucket**

### Étape 2 : Configurer les politiques CORS (optionnel)

Si vous avez besoin d'uploader depuis le frontend :

1. Allez dans **Storage > family-photos > Policies**
2. Créez une nouvelle politique :
   - **Operation** : INSERT
   - **Target role** : authenticated
   - **Check expression** : `true`

### Étape 3 : Vérifier la configuration

Testez que le bucket est public :

```bash
# Remplacez PROJECT_ID et FILE_PATH
curl https://{PROJECT_ID}.supabase.co/storage/v1/object/public/family-photos/test.jpg
# Doit retourner 404 (fichier n'existe pas) ou 200 (fichier existe)
# Ne doit PAS retourner 403 (forbidden)
```

## Utilisation dans le code

### Backend (Hono)

```typescript
import * as storage from "./storage.tsx";

// Obtenir l'URL publique d'une photo
const photoUrl = storage.getPublicPhotoUrl('family-123/photo.jpg');

// Uploader une photo et obtenir l'URL
const url = await storage.uploadPhotoAndGetUrl(
  'family-123',
  'photo.jpg',
  fileBuffer
);

// Supprimer une photo
await storage.deletePhoto('family-123/photo.jpg');
```

### Frontend (React)

```typescript
// Afficher une photo avec URL permanente
<img src={profile.photo_url} alt={profile.full_name} />

// Les URLs ne s'expirent jamais
// Pas besoin de refresh ou de signed URLs
```

## Structure des fichiers

Les photos sont organisées par famille :

```
family-photos/
├── family-uuid-1/
│   ├── 1708876800000-photo1.jpg
│   ├── 1708876801000-photo2.jpg
│   └── ...
├── family-uuid-2/
│   ├── 1708876802000-photo3.jpg
│   └── ...
└── ...
```

## Migration des anciennes photos

Si vous avez des photos avec des signed URLs expirées :

1. Créez un script de migration
2. Téléchargez les anciennes photos
3. Uploadez-les vers le nouveau bucket public
4. Mettez à jour les URLs dans la base de données

```typescript
// Exemple de migration
async function migratePhotos() {
  const profiles = await db.getAllProfiles();
  
  for (const profile of profiles) {
    if (profile.photo_url && profile.photo_url.includes('signed')) {
      // Télécharger l'ancienne photo
      const response = await fetch(profile.photo_url);
      const buffer = await response.arrayBuffer();
      
      // Uploader vers le nouveau bucket
      const newUrl = await storage.uploadPhotoAndGetUrl(
        profile.family_id,
        `${profile.id}.jpg`,
        buffer
      );
      
      // Mettre à jour la base de données
      await db.updateProfile(profile.id, { photo_url: newUrl });
    }
  }
}
```

## Avantages

- ✅ **Permanentes** : Les URLs ne s'expirent jamais
- ✅ **Publiques** : Pas besoin de token pour afficher
- ✅ **Rapides** : CDN global Supabase
- ✅ **Sécurisées** : Isolation par family_id
- ✅ **Simples** : Pas de gestion de tokens

## Limitations

- Les fichiers sont publiquement accessibles (par design)
- Pas de contrôle d'accès granulaire
- Les URLs sont prévisibles (mais pas sensibles)

## Troubleshooting

### Erreur : "403 Forbidden"

Le bucket n'est pas public. Vérifiez dans Supabase Dashboard que le bucket est marqué comme "Public".

### Erreur : "404 Not Found"

Le fichier n'existe pas. Vérifiez le chemin du fichier.

### Les photos ne s'affichent pas

1. Vérifiez que le bucket est public
2. Vérifiez que l'URL est correcte
3. Vérifiez les logs du navigateur (F12)

---

**Dernière mise à jour :** Février 2026
