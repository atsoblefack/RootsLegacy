import * as kv from "./kv_store.tsx";
import * as profiles from "./profiles.tsx";
import * as relationships from "./relationships.tsx";

// PDF Export management for Family Heritage Book
// This uses a simple approach to generate structured data that can be converted to PDF

interface PdfExportData {
  familyName: string;
  generationDate: string;
  profiles: any[];
  relationships: any[];
  stats: {
    totalMembers: number;
    generations: number;
    oldestBirth?: string;
    youngestBirth?: string;
  };
}

/**
 * Check if user has PDF export access
 * - Heritage tier: included
 * - Other tiers: check if they purchased PDF export
 */
export async function hasPdfExportAccess(userId: string): Promise<boolean> {
  try {
    // Check user's subscription tier
    const tierKey = `user:${userId}:tier`;
    const tier = await kv.get(tierKey);
    
    // Heritage tier has unlimited access
    if (tier === 'heritage') {
      return true;
    }
    
    // Check if user purchased PDF export as add-on
    const pdfPurchaseKey = `user:${userId}:pdf_export_purchased`;
    const purchased = await kv.get(pdfPurchaseKey);
    
    return purchased === 'true';
  } catch (error: any) {
    console.error('Error checking PDF export access:', error);
    return false;
  }
}

/**
 * Record PDF export purchase (one-time payment)
 */
export async function purchasePdfExport(userId: string, amount: number): Promise<{ success: boolean; message: string }> {
  try {
    // Store purchase record
    const purchaseKey = `user:${userId}:pdf_export_purchased`;
    await kv.set(purchaseKey, 'true');
    
    // Store purchase metadata
    const metadataKey = `user:${userId}:pdf_export_purchase_metadata`;
    await kv.set(metadataKey, JSON.stringify({
      purchaseDate: new Date().toISOString(),
      amount,
    }));
    
    return {
      success: true,
      message: 'PDF Export access granted',
    };
  } catch (error: any) {
    console.error('Error recording PDF export purchase:', error);
    return {
      success: false,
      message: `Failed to record purchase: ${error.message}`,
    };
  }
}

/**
 * Get PDF export purchase status
 */
export async function getPdfExportStatus(userId: string): Promise<{
  hasAccess: boolean;
  reason: 'heritage_tier' | 'purchased' | 'not_purchased';
  purchaseDate?: string;
}> {
  try {
    // Check tier first
    const tierKey = `user:${userId}:tier`;
    const tier = await kv.get(tierKey);
    
    if (tier === 'heritage') {
      return {
        hasAccess: true,
        reason: 'heritage_tier',
      };
    }
    
    // Check purchase
    const purchaseKey = `user:${userId}:pdf_export_purchased`;
    const purchased = await kv.get(purchaseKey);
    
    if (purchased === 'true') {
      // Get purchase metadata
      const metadataKey = `user:${userId}:pdf_export_purchase_metadata`;
      const metadata = await kv.get(metadataKey);
      const parsedMetadata = metadata ? JSON.parse(metadata) : null;
      
      return {
        hasAccess: true,
        reason: 'purchased',
        purchaseDate: parsedMetadata?.purchaseDate,
      };
    }
    
    return {
      hasAccess: false,
      reason: 'not_purchased',
    };
  } catch (error: any) {
    console.error('Error getting PDF export status:', error);
    return {
      hasAccess: false,
      reason: 'not_purchased',
    };
  }
}

/**
 * Generate PDF export data
 * Returns structured data ready for PDF generation
 */
export async function generatePdfExportData(
  userId: string,
  familyName: string
): Promise<PdfExportData> {
  try {
    // Get all profiles for this family
    const allProfiles = await profiles.getAllProfiles(userId);
    
    // Get all relationships
    const allRelationships: any[] = [];
    for (const profile of allProfiles) {
      const profileRels = await relationships.getProfileRelationships(profile.id);
      allRelationships.push(...profileRels);
    }
    
    // Remove duplicates (relationships are bidirectional)
    const uniqueRelationships = allRelationships.filter((rel, index, self) => 
      index === self.findIndex(r => 
        (r.profileId1 === rel.profileId1 && r.profileId2 === rel.profileId2) ||
        (r.profileId1 === rel.profileId2 && r.profileId2 === rel.profileId1)
      )
    );
    
    // Calculate stats
    const birthDates = allProfiles
      .filter(p => p.birthDate)
      .map(p => new Date(p.birthDate))
      .sort((a, b) => a.getTime() - b.getTime());
    
    const stats = {
      totalMembers: allProfiles.length,
      generations: calculateGenerations(allProfiles, uniqueRelationships),
      oldestBirth: birthDates[0]?.toISOString(),
      youngestBirth: birthDates[birthDates.length - 1]?.toISOString(),
    };
    
    return {
      familyName,
      generationDate: new Date().toISOString(),
      profiles: allProfiles.map(p => ({
        ...p,
        // Remove sensitive data
        invitationToken: undefined,
        userId: undefined,
      })),
      relationships: uniqueRelationships,
      stats,
    };
  } catch (error: any) {
    console.error('Error generating PDF export data:', error);
    throw new Error(`Failed to generate export data: ${error.message}`);
  }
}

/**
 * Calculate number of generations in family tree
 */
function calculateGenerations(profiles: any[], relationships: any[]): number {
  // Build parent-child map
  const childToParents = new Map<string, string[]>();
  
  relationships.forEach(rel => {
    if (rel.type === 'parent-child') {
      // profileId1 is parent, profileId2 is child
      const children = childToParents.get(rel.profileId2) || [];
      children.push(rel.profileId1);
      childToParents.set(rel.profileId2, children);
    }
  });
  
  // Find max depth from any root node
  let maxDepth = 0;
  
  function getDepth(profileId: string, visited: Set<string> = new Set()): number {
    if (visited.has(profileId)) return 0;
    visited.add(profileId);
    
    const parents = childToParents.get(profileId) || [];
    if (parents.length === 0) return 1;
    
    const parentDepths = parents.map(parentId => getDepth(parentId, new Set(visited)));
    return 1 + Math.max(...parentDepths);
  }
  
  profiles.forEach(profile => {
    const depth = getDepth(profile.id);
    maxDepth = Math.max(maxDepth, depth);
  });
  
  return maxDepth || 1;
}

/**
 * Store PDF export record for tracking
 */
export async function recordPdfExport(userId: string, familyName: string): Promise<void> {
  try {
    const exportKey = `user:${userId}:pdf_exports`;
    const existingExports = await kv.get(exportKey);
    const exports = existingExports ? JSON.parse(existingExports) : [];
    
    exports.push({
      familyName,
      exportDate: new Date().toISOString(),
      profileCount: 0, // Will be updated with actual count
    });
    
    await kv.set(exportKey, JSON.stringify(exports));
  } catch (error: any) {
    console.error('Error recording PDF export:', error);
    // Don't fail the export if recording fails
  }
}
