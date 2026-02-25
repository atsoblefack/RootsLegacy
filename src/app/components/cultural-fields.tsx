import { MapPin, Home, Users, X } from 'lucide-react';
import { useState } from 'react';
import { VoiceInputField } from './voice-input';

interface VillageOrigin {
  country: string;
  city: string;
  village: string;
  isMainVillage?: boolean; // Village du père = village principal
}

interface VillageOriginFieldProps {
  value: VillageOrigin;
  onChange: (value: VillageOrigin) => void;
  label?: string;
  isMainVillage?: boolean;
}

export function VillageOriginField({ 
  value, 
  onChange, 
  label = "Village d'Origine",
  isMainVillage = false 
}: VillageOriginFieldProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        {isMainVillage ? (
          <Home className="w-5 h-5 text-[#D2691E]" />
        ) : (
          <MapPin className="w-5 h-5 text-[#D2691E]" />
        )}
        <h3 className="font-bold text-[#5D4037]">{label}</h3>
        {isMainVillage && (
          <span className="text-xs bg-[#D2691E]/10 text-[#D2691E] px-2 py-0.5 rounded-full font-semibold ml-auto">
            Village Principal
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
            Pays
          </label>
          <VoiceInputField
            value={value.country}
            onChange={(val) => onChange({ ...value, country: val })}
            onVoiceInput={(transcript) => onChange({ ...value, country: transcript })}
            placeholder="Ex: Ghana, Sénégal, Côte d'Ivoire..."
            icon={<MapPin className="w-5 h-5 text-[#D2691E]" />}
          />
        </div>

        <div>
          <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
            Ville / Région
          </label>
          <VoiceInputField
            value={value.city}
            onChange={(val) => onChange({ ...value, city: val })}
            onVoiceInput={(transcript) => onChange({ ...value, city: transcript })}
            placeholder="Ex: Kumasi, Dakar, Abidjan..."
            icon={<MapPin className="w-5 h-5 text-[#E8A05D]" />}
          />
        </div>

        <div>
          <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
            Village (Optionnel)
          </label>
          <VoiceInputField
            value={value.village}
            onChange={(val) => onChange({ ...value, village: val })}
            onVoiceInput={(transcript) => onChange({ ...value, village: transcript })}
            placeholder="Ex: Bantama, Touba, Bingerville..."
          />
        </div>
      </div>

      <div className="bg-[#E8A05D]/10 rounded-2xl p-3 mt-4">
        <p className="text-xs text-[#5D4037] leading-relaxed">
          {isMainVillage ? (
            <>
              <span className="font-semibold">🏡 Village principal:</span> Le village du père devient le village d'origine de la famille. Important pour les liens ancestraux et les cérémonies.
            </>
          ) : (
            <>
              <span className="font-semibold">💡 Info:</span> Préservez l'origine de chaque membre. Les villages maternels sont tout aussi importants dans l'histoire familiale.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

interface LocalNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function LocalNameField({ 
  value, 
  onChange,
  label = "Nom d'Initiation / Nom Local",
  placeholder = "Ex: Nkrumah, Ama, Kouadio..."
}: LocalNameFieldProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="bg-gradient-to-br from-[#2E7D32]/10 to-[#66BB6A]/10 rounded-2xl p-5 border-2 border-[#2E7D32]/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <h3 className="font-bold text-[#5D4037]">{label}</h3>
        </div>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs text-[#2E7D32] font-semibold"
        >
          {showExplanation ? 'Masquer' : 'Pourquoi?'}
        </button>
      </div>

      {showExplanation && (
        <div className="bg-white rounded-xl p-3 mb-3">
          <p className="text-xs text-[#5D4037] leading-relaxed">
            <span className="font-semibold">Nom traditionnel:</span> Nom donné lors de l'initiation, nom du village, nom en langue locale. 
            Différent du nom officiel mais tout aussi important pour l'identité culturelle.
            <br/><br/>
            <span className="font-semibold">Exemples:</span>
            <br/>• Akan (Ghana): Kofi (né vendredi), Akosua (née dimanche)
            <br/>• Yoruba (Nigeria): Adeola, Babatunde
            <br/>• Wolof (Sénégal): Modou, Fatou
          </p>
        </div>
      )}

      <VoiceInputField
        value={value}
        onChange={onChange}
        onVoiceInput={(transcript) => onChange(transcript)}
        placeholder={placeholder}
      />

      <p className="text-xs text-[#8D6E63] mt-2">
        Optionnel • Ce nom apparaîtra à côté du nom officiel dans le profil
      </p>
    </div>
  );
}

interface FamilyRoleOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const extendedFamilyRoles: FamilyRoleOption[] = [
  { id: 'biological-parent', label: 'Parent Biologique', description: 'Parent de naissance', icon: '👨‍👩‍👧' },
  { id: 'raised-by-aunt', label: 'Élevé(e) par Tante Maternelle', description: 'Tante qui a élevé l\'enfant', icon: '👩🏿' },
  { id: 'raised-by-uncle', label: 'Élevé(e) par Oncle', description: 'Oncle qui a pris le rôle paternel', icon: '👨🏿' },
  { id: 'raised-by-grandparent', label: 'Élevé(e) par Grand-Parent', description: 'Grand-parent éducateur', icon: '👴🏿👵🏿' },
  { id: 'guardian', label: 'Tuteur/Tutrice', description: 'Membre de la famille élargie', icon: '🤝' },
];

interface ExtendedFamilyRoleFieldProps {
  selectedRole: string;
  onRoleSelect: (roleId: string) => void;
  guardianName?: string;
  onGuardianNameChange?: (name: string) => void;
}

export function ExtendedFamilyRoleField({
  selectedRole,
  onRoleSelect,
  guardianName,
  onGuardianNameChange
}: ExtendedFamilyRoleFieldProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#2E7D32]" />
        <h3 className="font-bold text-[#5D4037]">Structure Familiale</h3>
      </div>

      <div className="bg-[#2E7D32]/10 rounded-2xl p-4 mb-4">
        <p className="text-xs text-[#5D4037] leading-relaxed">
          <span className="font-semibold">🌍 Familles africaines:</span> Honore toutes les formes d'éducation. 
          Les tantes, oncles, et grands-parents jouent souvent un rôle central dans l'éducation des enfants.
        </p>
      </div>

      <div className="space-y-2">
        {extendedFamilyRoles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            className={`w-full rounded-2xl p-4 transition-all text-left ${
              selectedRole === role.id
                ? 'bg-[#2E7D32] text-white shadow-md'
                : 'bg-[#FFF8E7] text-[#5D4037] hover:bg-[#F5E6D3]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{role.icon}</span>
              <div className="flex-1">
                <div className={`font-semibold ${selectedRole === role.id ? 'text-white' : 'text-[#5D4037]'}`}>
                  {role.label}
                </div>
                <div className={`text-xs ${selectedRole === role.id ? 'text-white/80' : 'text-[#8D6E63]'}`}>
                  {role.description}
                </div>
              </div>
              {selectedRole === role.id && (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedRole === 'guardian' && onGuardianNameChange && (
        <div className="mt-4">
          <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
            Nom du Tuteur/Tutrice
          </label>
          <VoiceInputField
            value={guardianName || ''}
            onChange={onGuardianNameChange}
            onVoiceInput={onGuardianNameChange}
            placeholder="Ex: Tante Akosua Mensah"
          />
        </div>
      )}
    </div>
  );
}

interface VillageDisplayProps {
  village: VillageOrigin;
  isMain?: boolean;
  compact?: boolean;
}

export function VillageDisplay({ village, isMain = false, compact = false }: VillageDisplayProps) {
  const displayText = [village.village, village.city, village.country].filter(Boolean).join(', ');
  
  if (!displayText) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isMain ? (
          <Home className="w-4 h-4 text-[#D2691E]" />
        ) : (
          <MapPin className="w-4 h-4 text-[#8D6E63]" />
        )}
        <span className="text-sm text-[#5D4037]">{displayText}</span>
        {isMain && (
          <span className="text-xs bg-[#D2691E]/10 text-[#D2691E] px-2 py-0.5 rounded-full font-semibold">
            Principal
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-4 ${isMain ? 'bg-gradient-to-br from-[#D2691E]/10 to-[#E8A05D]/10 border-2 border-[#D2691E]/20' : 'bg-[#FFF8E7]'}`}>
      <div className="flex items-center gap-2 mb-2">
        {isMain ? (
          <Home className="w-5 h-5 text-[#D2691E]" />
        ) : (
          <MapPin className="w-5 h-5 text-[#8D6E63]" />
        )}
        <span className="text-xs font-semibold text-[#5D4037] uppercase tracking-wide">
          {isMain ? 'Village Principal de la Famille' : 'Village d\'Origine'}
        </span>
      </div>
      <div className="text-[#5D4037] font-medium">{displayText}</div>
    </div>
  );
}
