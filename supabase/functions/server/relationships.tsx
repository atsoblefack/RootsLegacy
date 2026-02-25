import * as kv from './kv_store.tsx';

// Relationship types
export type RelationshipType = 'spouse' | 'parent' | 'child' | 'sibling';

export interface Relationship {
  id: string;
  profileId1: string; // First person in relationship
  profileId2: string; // Second person in relationship
  type: RelationshipType;
  createdBy: string;
  createdAt: string;
  metadata?: {
    marriageDate?: string;
    marriagePlace?: string;
    divorceDate?: string;
    notes?: string;
  };
}

// Create a relationship between two profiles
export async function createRelationship(
  profileId1: string,
  profileId2: string,
  type: RelationshipType,
  createdBy: string,
  metadata?: any
): Promise<Relationship> {
  // Validate that profiles exist
  const profile1 = await kv.get(`profile:${profileId1}`);
  const profile2 = await kv.get(`profile:${profileId2}`);
  
  if (!profile1 || !profile2) {
    throw new Error('One or both profiles not found');
  }
  
  // Prevent self-relationship
  if (profileId1 === profileId2) {
    throw new Error('Cannot create relationship with self');
  }
  
  // Check if relationship already exists
  const existingRel = await findRelationship(profileId1, profileId2, type);
  if (existingRel) {
    throw new Error('Relationship already exists between these profiles');
  }
  
  const relationshipId = crypto.randomUUID();
  const relationship: Relationship = {
    id: relationshipId,
    profileId1,
    profileId2,
    type,
    createdBy,
    createdAt: new Date().toISOString(),
    metadata,
  };
  
  // Store relationship
  await kv.set(`relationship:${relationshipId}`, relationship);
  
  // Store indexes for quick lookup
  await addRelationshipIndex(profileId1, relationshipId);
  await addRelationshipIndex(profileId2, relationshipId);
  
  return relationship;
}

// Find a specific relationship between two profiles
async function findRelationship(
  profileId1: string,
  profileId2: string,
  type: RelationshipType
): Promise<Relationship | null> {
  const allRelationships = await kv.getByPrefix('relationship:');
  
  const found = allRelationships.find((rel: Relationship) => {
    return (
      rel.type === type &&
      ((rel.profileId1 === profileId1 && rel.profileId2 === profileId2) ||
       (rel.profileId1 === profileId2 && rel.profileId2 === profileId1))
    );
  });
  
  return found || null;
}

// Add relationship to profile index
async function addRelationshipIndex(profileId: string, relationshipId: string) {
  const indexKey = `profile_relationships:${profileId}`;
  const existingIndex = await kv.get(indexKey) || [];
  
  if (!existingIndex.includes(relationshipId)) {
    existingIndex.push(relationshipId);
    await kv.set(indexKey, existingIndex);
  }
}

// Remove relationship from profile index
async function removeRelationshipIndex(profileId: string, relationshipId: string) {
  const indexKey = `profile_relationships:${profileId}`;
  const existingIndex = await kv.get(indexKey) || [];
  
  const updated = existingIndex.filter((id: string) => id !== relationshipId);
  await kv.set(indexKey, updated);
}

// Get all relationships for a profile
export async function getProfileRelationships(profileId: string): Promise<Relationship[]> {
  const indexKey = `profile_relationships:${profileId}`;
  const relationshipIds = await kv.get(indexKey) || [];
  
  const relationships: Relationship[] = [];
  for (const relId of relationshipIds) {
    const rel = await kv.get(`relationship:${relId}`);
    if (rel) {
      relationships.push(rel);
    }
  }
  
  return relationships;
}

// Get relationships by type for a profile
export async function getProfileRelationshipsByType(
  profileId: string,
  type: RelationshipType
): Promise<Relationship[]> {
  const allRelationships = await getProfileRelationships(profileId);
  return allRelationships.filter(rel => rel.type === type);
}

// Get spouse(s) for a profile
export async function getSpouses(profileId: string): Promise<any[]> {
  const spouseRelationships = await getProfileRelationshipsByType(profileId, 'spouse');
  
  const spouses = [];
  for (const rel of spouseRelationships) {
    const spouseId = rel.profileId1 === profileId ? rel.profileId2 : rel.profileId1;
    const spouseProfile = await kv.get(`profile:${spouseId}`);
    if (spouseProfile) {
      spouses.push({
        ...spouseProfile,
        relationshipId: rel.id,
        marriageDate: rel.metadata?.marriageDate,
        marriagePlace: rel.metadata?.marriagePlace,
      });
    }
  }
  
  return spouses;
}

// Get parents for a profile
export async function getParents(profileId: string): Promise<any[]> {
  const parentRelationships = await getProfileRelationshipsByType(profileId, 'parent');
  
  const parents = [];
  for (const rel of parentRelationships) {
    // If profileId is profileId2, then profileId1 is the parent
    if (rel.profileId2 === profileId) {
      const parentProfile = await kv.get(`profile:${rel.profileId1}`);
      if (parentProfile) {
        parents.push(parentProfile);
      }
    }
  }
  
  return parents;
}

// Get children for a profile
export async function getChildren(profileId: string): Promise<any[]> {
  const childRelationships = await getProfileRelationshipsByType(profileId, 'parent');
  
  const children = [];
  for (const rel of childRelationships) {
    // If profileId is profileId1, then profileId2 is the child
    if (rel.profileId1 === profileId) {
      const childProfile = await kv.get(`profile:${rel.profileId2}`);
      if (childProfile) {
        children.push(childProfile);
      }
    }
  }
  
  return children;
}

// Get siblings for a profile
export async function getSiblings(profileId: string): Promise<any[]> {
  const siblingRelationships = await getProfileRelationshipsByType(profileId, 'sibling');
  
  const siblings = [];
  for (const rel of siblingRelationships) {
    const siblingId = rel.profileId1 === profileId ? rel.profileId2 : rel.profileId1;
    const siblingProfile = await kv.get(`profile:${siblingId}`);
    if (siblingProfile) {
      siblings.push(siblingProfile);
    }
  }
  
  return siblings;
}

// Update relationship metadata
export async function updateRelationship(
  relationshipId: string,
  updates: Partial<Relationship>,
  userId: string
): Promise<Relationship> {
  const relationship = await kv.get(`relationship:${relationshipId}`);
  
  if (!relationship) {
    throw new Error('Relationship not found');
  }
  
  const updatedRelationship = {
    ...relationship,
    ...updates,
    updatedBy: userId,
    updatedAt: new Date().toISOString(),
  };
  
  await kv.set(`relationship:${relationshipId}`, updatedRelationship);
  return updatedRelationship;
}

// Delete a relationship
export async function deleteRelationship(relationshipId: string): Promise<void> {
  const relationship = await kv.get(`relationship:${relationshipId}`);
  
  if (!relationship) {
    throw new Error('Relationship not found');
  }
  
  // Remove from indexes
  await removeRelationshipIndex(relationship.profileId1, relationshipId);
  await removeRelationshipIndex(relationship.profileId2, relationshipId);
  
  // Delete relationship
  await kv.del(`relationship:${relationshipId}`);
}

// Get full family tree starting from a profile
export async function getFamilyTree(profileId: string, maxDepth: number = 3): Promise<any> {
  const visited = new Set<string>();
  
  async function buildTree(currentProfileId: string, depth: number): Promise<any> {
    if (depth > maxDepth || visited.has(currentProfileId)) {
      return null;
    }
    
    visited.add(currentProfileId);
    
    const profile = await kv.get(`profile:${currentProfileId}`);
    if (!profile) return null;
    
    const spouses = await getSpouses(currentProfileId);
    const parents = await getParents(currentProfileId);
    const children = await getChildren(currentProfileId);
    const siblings = await getSiblings(currentProfileId);
    
    return {
      profile,
      spouses: await Promise.all(spouses.map(s => buildTree(s.id, depth + 1))),
      parents: await Promise.all(parents.map(p => buildTree(p.id, depth + 1))),
      children: await Promise.all(children.map(c => buildTree(c.id, depth + 1))),
      siblings: await Promise.all(siblings.map(s => buildTree(s.id, depth + 1))),
    };
  }
  
  return buildTree(profileId, 0);
}

// Get all relationships in the system (admin only)
export async function getAllRelationships(): Promise<Relationship[]> {
  return await kv.getByPrefix('relationship:');
}

// ============= FAMILY FUSION SYSTEM =============

interface FusionCode {
  code: string;
  profileId: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

// Generate a unique fusion code for a profile
export async function generateFusionCode(
  profileId: string,
  createdBy: string
): Promise<string> {
  // Validate profile exists
  const profile = await kv.get(`profile:${profileId}`);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Generate a unique 8-character code
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Check if code already exists (very unlikely but good practice)
  const existing = await kv.get(`fusion_code:${code}`);
  if (existing) {
    // Recursively try again
    return generateFusionCode(profileId, createdBy);
  }
  
  // Create fusion code with 30 days expiration
  const fusionCode: FusionCode = {
    code,
    profileId,
    createdBy,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    used: false,
  };
  
  // Store the fusion code
  await kv.set(`fusion_code:${code}`, fusionCode);
  
  // Also store a reverse index for the profile
  await kv.set(`fusion_code_by_profile:${profileId}`, code);
  
  return code;
}

// Link two families using a fusion code
export async function linkWithFusionCode(
  myProfileId: string,
  fusionCode: string,
  userId: string,
  metadata?: any
): Promise<Relationship> {
  // Validate my profile exists
  const myProfile = await kv.get(`profile:${myProfileId}`);
  if (!myProfile) {
    throw new Error('Your profile not found');
  }
  
  // Get fusion code details
  const codeData: FusionCode = await kv.get(`fusion_code:${fusionCode}`);
  if (!codeData) {
    throw new Error('Code de fusion invalide');
  }
  
  // Check if code is expired
  if (new Date(codeData.expiresAt) < new Date()) {
    throw new Error('Ce code de fusion a expiré');
  }
  
  // Check if code has already been used
  if (codeData.used) {
    throw new Error('Ce code de fusion a déjà été utilisé');
  }
  
  // Get the other profile
  const otherProfile = await kv.get(`profile:${codeData.profileId}`);
  if (!otherProfile) {
    throw new Error('Le profil lié à ce code n\'existe plus');
  }
  
  // Prevent linking the same profile
  if (myProfileId === codeData.profileId) {
    throw new Error('Vous ne pouvez pas lier un profil avec lui-même');
  }
  
  // Check if relationship already exists
  const existingRel = await findRelationship(myProfileId, codeData.profileId, 'spouse');
  if (existingRel) {
    throw new Error('Ces profils sont déjà liés');
  }
  
  // Create the spouse relationship
  const relationship = await createRelationship(
    myProfileId,
    codeData.profileId,
    'spouse',
    userId,
    metadata
  );
  
  // Mark code as used
  codeData.used = true;
  codeData.usedAt = new Date().toISOString();
  codeData.usedBy = userId;
  await kv.set(`fusion_code:${fusionCode}`, codeData);
  
  return relationship;
}