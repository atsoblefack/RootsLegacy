import { useState, useEffect } from 'react';
import { Heart, Users, Baby, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';
import { Link } from 'react-router';

interface Relationship {
  id: string;
  profileId1: string;
  profileId2: string;
  type: 'spouse' | 'parent' | 'child' | 'sibling';
  metadata?: {
    marriageDate?: string;
    marriagePlace?: string;
  };
}

interface RelatedProfile {
  id: string;
  name: string;
  photoUrl?: string;
  birthDate?: string;
  profession?: string;
}

interface FamilyRelationsProps {
  profileId: string;
}

export function FamilyRelations({ profileId }: FamilyRelationsProps) {
  const [spouses, setSpouses] = useState<any[]>([]);
  const [parents, setParents] = useState<RelatedProfile[]>([]);
  const [children, setChildren] = useState<RelatedProfile[]>([]);
  const [siblings, setSiblings] = useState<RelatedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelations();
  }, [profileId]);

  const loadRelations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const accessToken = session.access_token;

      // Load spouses
      const spousesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/profiles/${profileId}/spouses`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (spousesRes.ok) {
        const data = await spousesRes.json();
        setSpouses(data.spouses || []);
      }

      // Load all relationships to get parents, children, siblings
      const relRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/profiles/${profileId}/relationships`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (relRes.ok) {
        const data = await relRes.json();
        const relationships: Relationship[] = data.relationships || [];
        
        // Extract related profiles
        const parentsList: RelatedProfile[] = [];
        const childrenList: RelatedProfile[] = [];
        const siblingsList: RelatedProfile[] = [];

        for (const rel of relationships) {
          const relatedId = rel.profileId1 === profileId ? rel.profileId2 : rel.profileId1;
          
          // Fetch related profile
          const profileRes = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/profiles/${relatedId}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            const profile = profileData.profile;

            if (rel.type === 'parent' && rel.profileId2 === profileId) {
              parentsList.push(profile);
            } else if (rel.type === 'parent' && rel.profileId1 === profileId) {
              childrenList.push(profile);
            } else if (rel.type === 'sibling') {
              siblingsList.push(profile);
            }
          }
        }

        setParents(parentsList);
        setChildren(childrenList);
        setSiblings(siblingsList);
      }
    } catch (error) {
      console.error('Load relations error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-4 shadow-md">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-[#D2691E]/20 border-t-[#D2691E] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const hasRelations = spouses.length > 0 || parents.length > 0 || children.length > 0 || siblings.length > 0;

  if (!hasRelations) {
    return (
      <div className="bg-white rounded-3xl p-4 shadow-md">
        <h3 className="font-semibold text-[#5D4037] mb-3">Relations Familiales</h3>
        <p className="text-sm text-[#8D6E63] text-center py-4">
          Aucune relation familiale enregistrée pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 shadow-md space-y-4">
      <h3 className="font-semibold text-[#5D4037] mb-3">Relations Familiales</h3>

      {/* Spouses */}
      {spouses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-[#D2691E]" />
            <h4 className="text-sm font-medium text-[#5D4037]">
              Conjoint{spouses.length > 1 ? 's' : ''}
            </h4>
          </div>
          <div className="space-y-2">
            {spouses.map((spouse) => (
              <Link key={spouse.id} to={`/profile/${spouse.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#FFF8E7] transition-colors active:scale-98">
                  {spouse.photoUrl ? (
                    <img
                      src={spouse.photoUrl}
                      alt={spouse.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center text-white text-sm font-bold">
                      {spouse.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#5D4037]">{spouse.name}</div>
                    {spouse.marriageDate && (
                      <div className="text-xs text-[#8D6E63]">
                        Marié le {new Date(spouse.marriageDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Parents */}
      {parents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#8D6E63]" />
            <h4 className="text-sm font-medium text-[#5D4037]">
              Parent{parents.length > 1 ? 's' : ''}
            </h4>
          </div>
          <div className="space-y-2">
            {parents.map((parent) => (
              <Link key={parent.id} to={`/profile/${parent.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#FFF8E7] transition-colors active:scale-98">
                  {parent.photoUrl ? (
                    <img
                      src={parent.photoUrl}
                      alt={parent.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8D6E63] to-[#6D4C41] flex items-center justify-center text-white text-sm font-bold">
                      {parent.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#5D4037]">{parent.name}</div>
                    {parent.profession && (
                      <div className="text-xs text-[#8D6E63]">{parent.profession}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Children */}
      {children.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Baby className="w-4 h-4 text-[#2E7D32]" />
            <h4 className="text-sm font-medium text-[#5D4037]">
              Enfant{children.length > 1 ? 's' : ''}
            </h4>
          </div>
          <div className="space-y-2">
            {children.map((child) => (
              <Link key={child.id} to={`/profile/${child.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#FFF8E7] transition-colors active:scale-98">
                  {child.photoUrl ? (
                    <img
                      src={child.photoUrl}
                      alt={child.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-sm font-bold">
                      {child.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#5D4037]">{child.name}</div>
                    {child.birthDate && (
                      <div className="text-xs text-[#8D6E63]">
                        Né le {new Date(child.birthDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Siblings */}
      {siblings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-[#E8A05D]" />
            <h4 className="text-sm font-medium text-[#5D4037]">
              Frère{siblings.length > 1 ? 's' : ''} et Sœur{siblings.length > 1 ? 's' : ''}
            </h4>
          </div>
          <div className="space-y-2">
            {siblings.map((sibling) => (
              <Link key={sibling.id} to={`/profile/${sibling.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#FFF8E7] transition-colors active:scale-98">
                  {sibling.photoUrl ? (
                    <img
                      src={sibling.photoUrl}
                      alt={sibling.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8A05D] to-[#D2691E] flex items-center justify-center text-white text-sm font-bold">
                      {sibling.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#5D4037]">{sibling.name}</div>
                    {sibling.profession && (
                      <div className="text-xs text-[#8D6E63]">{sibling.profession}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}