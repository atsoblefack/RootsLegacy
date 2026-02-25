import { ArrowLeft, User, Calendar, MapPin, Briefcase, Phone, Mail, Check, Copy } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { useLanguage } from './language-context';
import { PhotoUpload } from './photo-upload';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { copyToClipboard } from '../utils/clipboard';
import { VoiceInputField } from './voice-input';
import { LocalNameField, VillageOriginField } from './cultural-fields';

export function AdminCreateProfile() {
  const { t } = useLanguage();
  const [step, setStep] = useState<'create' | 'success'>('create');
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [invitationToken, setInvitationToken] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    localName: '',
    profession: '',
    relation: '',
    birthDate: '',
    village: {
      country: '',
      city: '',
      village: ''
    }
  });

  const handlePhotoSelect = (file: File, preview: string) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const handleCreateProfile = async () => {
    setLoading(true);
    
    try {
      // Get access token (assuming user is already logged in)
      const accessToken = localStorage.getItem('supabase.auth.token'); // Simplified
      
      // Create profile
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/profiles`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to create profile');
      }
      
      const data = await response.json();
      setInvitationToken(data.invitationToken);
      
      // Upload photo if provided
      if (photoFile && data.profile.id) {
        const photoFormData = new FormData();
        photoFormData.append('photo', photoFile);
        
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-467d3bfa/profiles/${data.profile.id}/photo`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            },
            body: photoFormData,
          }
        );
      }
      
      setStep('success');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Erreur lors de la création du profil');
    } finally {
      setLoading(false);
    }
  };

  const getInvitationLink = () => {
    return `${window.location.origin}/invitation/${invitationToken}`;
  };

  const copyInvitationLink = async () => {
    const success = await copyToClipboard(getInvitationLink());
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Salut! J'ai créé ton profil sur RootsLegacy, notre arbre généalogique familial. 🌳\n\nClique ici pour créer ton compte et compléter tes informations:\n${getInvitationLink()}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (step === 'success') {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] px-6 py-12 text-white text-center">
          <div className="text-7xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">{t('admin.profileCreated')}</h1>
          <p className="text-white/90">Profil créé pour {formData.name}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-bold text-[#5D4037] mb-4">Partager l'Invitation</h3>
            
            <div className="bg-[#FFF8E7] rounded-2xl p-4 mb-4">
              <p className="text-xs text-[#8D6E63] mb-2">Lien d'invitation</p>
              <p className="text-sm text-[#5D4037] break-all font-mono">
                {getInvitationLink()}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={shareViaWhatsApp}
                className="w-full h-14 bg-[#25D366] text-white rounded-2xl font-semibold flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Partager via WhatsApp
              </button>

              <button
                onClick={copyInvitationLink}
                className="w-full h-14 bg-[#FFF8E7] text-[#5D4037] rounded-2xl font-semibold flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Lien Copié!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copier le Lien
                  </>
                )}
              </button>
            </div>
          </div>

          <Link to="/home">
            <button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold">
              Retour à l'Accueil
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] px-6 py-4">
        <div className="flex items-center gap-4 mb-3">
          <Link to="/home">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Créer un Profil</h1>
            <p className="text-sm text-white/80">Admin</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-6">
        <div className="bg-gradient-to-br from-[#D2691E]/10 to-[#E8A05D]/10 rounded-2xl p-5 border-2 border-[#D2691E]/20">
          <h3 className="font-bold text-[#5D4037] mb-2">Mode Admin</h3>
          <p className="text-sm text-[#5D4037]">
            Créez un profil pour un membre de la famille. Un lien d'invitation sera généré pour qu'ils puissent créer leur compte et compléter leurs informations.
          </p>
        </div>

        {/* Photo */}
        <div className="bg-white rounded-3xl p-6 shadow-md">
          <h3 className="font-bold text-[#5D4037] mb-4">Photo (Optionnel)</h3>
          <PhotoUpload
            currentPhoto={photoPreview}
            onPhotoSelect={handlePhotoSelect}
            size="large"
            shape="circle"
          />
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="font-bold text-[#5D4037] mb-2">Informations de Base</h3>
          
          <div>
            <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
              Nom Complet *
            </label>
            <VoiceInputField
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              onVoiceInput={(transcript) => setFormData({ ...formData, name: transcript })}
              placeholder="Ex: Kwame Mensah"
            />
          </div>

          <div>
            <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
              Relation *
            </label>
            <VoiceInputField
              value={formData.relation}
              onChange={(val) => setFormData({ ...formData, relation: val })}
              onVoiceInput={(transcript) => setFormData({ ...formData, relation: transcript })}
              placeholder="Ex: Grand-père, Tante, Cousin"
            />
          </div>

          <div>
            <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
              {t('profession')} (Optionnel)
            </label>
            <VoiceInputField
              value={formData.profession}
              onChange={(val) => setFormData({ ...formData, profession: val })}
              onVoiceInput={(transcript) => setFormData({ ...formData, profession: transcript })}
              placeholder={t('professionPlaceholder')}
            />
          </div>

          <div>
            <label className="text-xs text-[#8D6E63] uppercase tracking-wide font-semibold block mb-2">
              Date de Naissance (Optionnel)
            </label>
            <VoiceInputField
              value={formData.birthDate}
              onChange={(val) => setFormData({ ...formData, birthDate: val })}
              onVoiceInput={(transcript) => setFormData({ ...formData, birthDate: transcript })}
              type="date"
            />
          </div>
        </div>

        {/* Cultural Info */}
        <LocalNameField
          value={formData.localName}
          onChange={(val) => setFormData({ ...formData, localName: val })}
        />

        <VillageOriginField
          value={formData.village}
          onChange={(val) => setFormData({ ...formData, village: val })}
          isMainVillage={false}
        />
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#5D4037]/10 p-6" style={{ maxWidth: '375px', margin: '0 auto' }}>
        <button
          onClick={handleCreateProfile}
          disabled={!formData.name || !formData.relation || loading}
          className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          {loading ? 'Création...' : 'Créer le Profil & Générer le Lien'}
        </button>
      </div>
    </div>
  );
}