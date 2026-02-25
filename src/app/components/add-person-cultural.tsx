import { ArrowLeft, Mic, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useLanguage } from './language-context';
import { VoiceInputField, VoiceConversationalPrompt } from './voice-input';
import { LocalNameField, VillageOriginField, ExtendedFamilyRoleField } from './cultural-fields';
import { PhotoUpload } from './photo-upload';
import { serverBaseUrl, publicAnonKey } from '../../../utils/supabase/info';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';
import { toast } from 'sonner';

export function AddPersonCultural() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [useVoiceMode, setUseVoiceMode] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    localName: '',
    profession: '',
    birthDate: '',
    village: {
      country: '',
      city: '',
      village: ''
    },
    familyRole: 'biological-parent',
    guardianName: ''
  });

  const totalSteps = 5;

  const handleVoiceResponse = (transcript: string) => {
    console.log('Voice input:', transcript);
  };

  const handlePhotoSelect = (file: File, preview: string) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const handleSubmit = async () => {
    const session = getSessionFromStorage();
    if (!session) {
      navigate('/login');
      return;
    }
    setIsSaving(true);
    try {
      const body = {
        full_name: formData.fullName,
        birth_date: formData.birthDate || null,
        birth_place: [formData.village?.village, formData.village?.city, formData.village?.country]
          .filter(Boolean).join(', ') || null,
        local_name: formData.localName || null,
        profession: formData.profession || null,
        family_role: formData.familyRole || null,
      };
      const res = await fetch(`${serverBaseUrl}/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('API error');
      toast.success('Membre ajouté !');
      navigate('/tree');
    } catch (err) {
      toast.error("Erreur lors de l'ajout. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-4">
        <div className="flex items-center gap-4 mb-3">
          <Link to="/input-methods">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Ajouter un Membre</h1>
            <p className="text-sm text-white/80">Étape {step} sur {totalSteps}</p>
          </div>
          <button
            onClick={() => setUseVoiceMode(!useVoiceMode)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              useVoiceMode
                ? 'bg-white text-[#D2691E]'
                : 'bg-white/20 backdrop-blur-sm text-white'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {useVoiceMode ? (
          <div className="space-y-4">
            {step === 1 && (
              <VoiceConversationalPrompt
                prompt="Parlez-moi de cette personne. Dites son nom, son nom traditionnel si elle en a un, où elle est née et quand."
                onResponse={handleVoiceResponse}
                icon={<User className="w-6 h-6 text-white" />}
              />
            )}
            {step === 2 && (
              <VoiceConversationalPrompt
                prompt="D'où vient sa famille? Dites-moi le village d'origine, la ville et le pays."
                onResponse={handleVoiceResponse}
                icon={<span className="text-2xl">🏡</span>}
              />
            )}
            {step === 3 && (
              <VoiceConversationalPrompt
                prompt="Quel est le lien familial? Est-ce le parent biologique, ou a-t-il/elle été élevé(e) par une tante, un oncle, ou un grand-parent?"
                onResponse={handleVoiceResponse}
                icon={<span className="text-2xl">👨‍👩‍👧‍👦</span>}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <div className="bg-white rounded-3xl p-6 shadow-md">
                  <h3 className="font-bold text-[#5D4037] mb-4">Informations de Base</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
                        Nom Complet
                      </label>
                      <VoiceInputField
                        value={formData.fullName}
                        onChange={(val) => setFormData({ ...formData, fullName: val })}
                        onVoiceInput={(transcript) => setFormData({ ...formData, fullName: transcript })}
                        placeholder="Ex: Kwame Mensah"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
                        Date de Naissance
                      </label>
                      <VoiceInputField
                        value={formData.birthDate}
                        onChange={(val) => setFormData({ ...formData, birthDate: val })}
                        onVoiceInput={(transcript) => setFormData({ ...formData, birthDate: transcript })}
                        type="date"
                      />
                    </div>
                  </div>
                </div>
                <LocalNameField
                  value={formData.localName}
                  onChange={(val) => setFormData({ ...formData, localName: val })}
                />
              </>
            )}

            {/* Step 2: Village Origin */}
            {step === 2 && (
              <>
                <div className="bg-gradient-to-br from-[#D2691E]/10 to-[#E8A05D]/10 rounded-2xl p-5 mb-4 border-2 border-[#D2691E]/20">
                  <h3 className="font-bold text-[#5D4037] mb-2 flex items-center gap-2">
                    🌍 Importance du Village d'Origine
                  </h3>
                  <p className="text-sm text-[#5D4037] leading-relaxed">
                    Le village d'origine est le lien ancestral. C'est là que se trouvent les racines de la famille,
                    où sont célébrées les cérémonies importantes, et où reposent les ancêtres.
                  </p>
                </div>
                <VillageOriginField
                  value={formData.village}
                  onChange={(val) => setFormData({ ...formData, village: val })}
                  isMainVillage={false}
                />
              </>
            )}

            {/* Step 3: Family Role */}
            {step === 3 && (
              <ExtendedFamilyRoleField
                selectedRole={formData.familyRole}
                onRoleSelect={(role) => setFormData({ ...formData, familyRole: role })}
                guardianName={formData.guardianName}
                onGuardianNameChange={(name) => setFormData({ ...formData, guardianName: name })}
              />
            )}

            {/* Step 4: Photo */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 text-white text-center">
                  <div className="text-6xl mb-3">📸</div>
                  <h2 className="text-xl font-bold mb-2">Ajouter une Photo</h2>
                  <p className="text-white/90 text-sm">
                    Ajoutez une photo de cette personne pour l'illustrer dans l'arbre généalogique.
                  </p>
                </div>
                <PhotoUpload
                  currentPhoto={photoPreview}
                  onPhotoSelect={handlePhotoSelect}
                  size="large"
                  shape="circle"
                />
              </div>
            )}

            {/* Step 5: Summary */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 text-white text-center">
                  <div className="text-6xl mb-3">✓</div>
                  <h2 className="text-xl font-bold mb-2">Prêt à Ajouter!</h2>
                  <p className="text-white/90 text-sm">
                    Vérifiez les informations ci-dessous avant de confirmer.
                  </p>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-md space-y-3">
                  <div>
                    <div className="text-xs text-[#8D6E63] mb-1">Nom</div>
                    <div className="font-bold text-[#5D4037]">{formData.fullName || 'Non spécifié'}</div>
                    {formData.localName && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-[#2E7D32]/10 text-[#2E7D32] px-2 py-0.5 rounded-full font-semibold">
                          🌍 {formData.localName}
                        </span>
                      </div>
                    )}
                  </div>
                  {formData.village.country && (
                    <div>
                      <div className="text-xs text-[#8D6E63] mb-1">Village d'Origine</div>
                      <div className="text-sm text-[#5D4037]">
                        {[formData.village.village, formData.village.city, formData.village.country]
                          .filter(Boolean).join(', ')}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-[#8D6E63] mb-1">Date de Naissance</div>
                    <div className="text-sm text-[#5D4037]">{formData.birthDate || 'Non spécifiée'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#8D6E63] mb-1">Lien Familial</div>
                    <div className="text-sm text-[#5D4037]">
                      {formData.familyRole === 'biological-parent' && 'Parent Biologique'}
                      {formData.familyRole === 'raised-by-aunt' && 'Élevé(e) par Tante Maternelle'}
                      {formData.familyRole === 'raised-by-uncle' && 'Élevé(e) par Oncle'}
                      {formData.familyRole === 'raised-by-grandparent' && 'Élevé(e) par Grand-Parent'}
                      {formData.familyRole === 'guardian' && `Tuteur: ${formData.guardianName}`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#5D4037]/10 p-6" style={{ maxWidth: '375px', margin: '0 auto' }}>
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 h-14 bg-[#FFF8E7] text-[#5D4037] rounded-2xl font-semibold active:scale-95 transition-transform"
            >
              Précédent
            </button>
          )}
          <button
            onClick={() => {
              if (step < totalSteps) {
                setStep(step + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={isSaving}
            className="flex-1 h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold active:scale-95 transition-transform disabled:opacity-60"
          >
            {step === totalSteps ? (isSaving ? 'Enregistrement...' : "Ajouter à l'Arbre") : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
