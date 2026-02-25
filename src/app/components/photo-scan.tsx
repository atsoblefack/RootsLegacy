import { ArrowLeft, Camera, Upload, Loader, CheckCircle, X, AlertCircle, FileImage } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';
import { serverBaseUrl, publicAnonKey } from '../../../utils/supabase/info';

interface ExtractedData {
  name: string;
  birthDate: string;
  birthPlace: string;
  deathDate?: string;
  documentType: string;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  additionalInfo?: string;
}

const RELATION_OPTIONS = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Enfant' },
  { value: 'sibling', label: 'Frere/Soeur' },
  { value: 'grandparent', label: 'Grand-parent' },
  { value: 'uncle_aunt', label: 'Oncle/Tante' },
  { value: 'cousin', label: 'Cousin(e)' },
  { value: 'spouse', label: 'Conjoint(e)' },
  { value: 'other', label: 'Autre' },
];

export function PhotoScan() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'saving' | 'saved'>('idle');
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);
  const [selectedRelation, setSelectedRelation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('Image trop grande (max 10 Mo). Veuillez choisir une image plus petite.');
      return;
    }
    setScanState('scanning');
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      // Utiliser getSessionFromStorage pour éviter le lock deadlock avec AuthProvider
      const session = getSessionFromStorage();
      if (!session) { navigate('/login'); return; }
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`${serverBaseUrl}/ai/scan-document`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, language: 'fr' }),
      });
      if (res.ok) {
        const data = await res.json();
        const extracted: ExtractedData = {
          name: data.extracted?.name || '',
          birthDate: data.extracted?.birthDate || '',
          birthPlace: data.extracted?.birthPlace || '',
          deathDate: data.extracted?.deathDate || '',
          documentType: data.extracted?.documentType || 'Document',
          gender: data.extracted?.gender || '',
          fatherName: data.extracted?.fatherName || '',
          motherName: data.extracted?.motherName || '',
          additionalInfo: data.extracted?.additionalInfo || '',
        };
        setEditedData(extracted);
        setScanState('success');
      } else {
        const errData = await res.json();
        setError(errData.error || "Impossible d'analyser ce document. Essayez avec une image plus nette.");
        setScanState('idle');
      }
    } catch (err) {
      setError("Erreur de connexion. Verifiez votre connexion internet.");
      setScanState('idle');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
    e.target.value = '';
  };

  const handleSaveProfile = async () => {
    if (!editedData) return;
    setScanState('saving');
    setError(null);
    try {
      // Utiliser getSessionFromStorage pour éviter le lock deadlock avec AuthProvider
      const session = getSessionFromStorage();
      if (!session) { navigate('/login'); return; }
      const res = await fetch(`${serverBaseUrl}/profiles`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedData.name || 'Profil scanne',
          localName: '',
          profession: '',
          relation: selectedRelation || 'other',
          birthDate: editedData.birthDate || null,
          village: { country: editedData.birthPlace || '', city: '', village: '' },
        }),
      });
      if (res.ok) { setScanState('saved'); }
      else { const errData = await res.json(); setError(errData.error || 'Erreur lors de la sauvegarde'); setScanState('success'); }
    } catch (err) { setError('Erreur de connexion lors de la sauvegarde.'); setScanState('success'); }
  };

  const updateField = (field: keyof ExtractedData, value: string) => setEditedData(prev => prev ? { ...prev, [field]: value } : null);

  if (scanState === 'saved') {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#5D4037] mb-3">Profil cree !</h2>
          <p className="text-[#8D6E63] mb-6">Le profil de <strong>{editedData?.name || 'ce membre'}</strong> a ete ajoute a votre arbre.</p>
          <div className="space-y-3 w-full">
            <button onClick={() => { setScanState('idle'); setEditedData(null); setPreviewUrl(null); setSelectedRelation(''); }} className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">Scanner un autre document</button>
            <Link to="/tree"><button className="w-full h-14 bg-white text-[#D2691E] rounded-2xl font-semibold border-2 border-[#D2691E]/20 active:scale-95 transition-transform">Voir l'arbre genealogique</button></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/input-methods"><button className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-[#5D4037]" /></button></Link>
          <div><h1 className="text-xl font-bold text-[#5D4037]">Scanner un document</h1><p className="text-sm text-[#8D6E63]">OCR intelligent par IA</p></div>
          <div className="ml-auto w-10 h-10 rounded-full bg-[#D2691E]/10 flex items-center justify-center"><Camera className="w-5 h-5 text-[#D2691E]" /></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400"><X className="w-4 h-4" /></button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {scanState === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-bold text-[#5D4037] mb-3">Documents supportes</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[['document', 'Actes de naissance'],['id-card', "Cartes d'identite"],['scroll', 'Registres manuscrits'],['rings', 'Actes de mariage'],['cross', 'Actes de deces'],['photo', 'Photos de famille']].map(([_icon, label], i) => (
                    <div key={i} className="bg-[#FFF8E7] rounded-2xl p-3 text-center">
                      <div className="text-2xl mb-1">{['document','id-card','scroll','rings','cross','photo'][i] === 'document' ? '📄' : ['id-card','scroll','rings','cross','photo'][i-1] === 'id-card' ? '🪪' : i === 1 ? '🪪' : i === 2 ? '📝' : i === 3 ? '💒' : i === 4 ? '✝️' : '📸'}</div>
                      <div className="text-xs text-[#5D4037] font-medium leading-tight">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#D2691E]/10 rounded-2xl p-4">
                <h3 className="font-bold text-[#5D4037] mb-2">Conseils pour un bon scan</h3>
                <ul className="text-sm text-[#5D4037] space-y-1">
                  <li>Bonne luminosite, pas de reflets</li>
                  <li>Document a plat, bien cadre</li>
                  <li>Texte lisible et net</li>
                </ul>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
            </motion.div>
          )}

          {scanState === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12">
              {previewUrl && <div className="w-full rounded-2xl overflow-hidden mb-6 shadow-lg"><img src={previewUrl} alt="Document scanne" className="w-full h-48 object-cover" /></div>}
              <div className="bg-white rounded-3xl p-8 shadow-xl text-center w-full">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6"><Loader className="w-16 h-16 text-[#D2691E] mx-auto" /></motion.div>
                <h3 className="text-xl font-bold text-[#5D4037] mb-2">Analyse en cours...</h3>
                <p className="text-[#8D6E63]">L'IA lit votre document</p>
                <div className="mt-6 space-y-2">
                  {['Document detecte', 'Extraction du texte', 'Identification des champs'].map((label, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.5 }} className="flex items-center gap-2 text-sm text-[#2E7D32]">
                      <CheckCircle className="w-4 h-4" /><span>{label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(scanState === 'success' || scanState === 'saving') && editedData && (
            <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-4 text-center text-white">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <h3 className="text-lg font-bold">Document analyse !</h3>
                <p className="text-white/90 text-sm">Verifiez et corrigez si necessaire</p>
              </div>
              {previewUrl && <div className="rounded-2xl overflow-hidden shadow-sm"><img src={previewUrl} alt="Document" className="w-full h-32 object-cover" /></div>}
              <div className="bg-white rounded-3xl p-4 shadow-md space-y-3">
                <h3 className="text-base font-bold text-[#5D4037]">Informations extraites</h3>
                {[
                  { label: 'Nom complet', field: 'name' as const, placeholder: 'Nom de la personne' },
                  { label: 'Date de naissance', field: 'birthDate' as const, placeholder: 'YYYY-MM-DD' },
                  { label: 'Lieu de naissance', field: 'birthPlace' as const, placeholder: 'Ville, Pays' },
                  { label: 'Nom du pere', field: 'fatherName' as const, placeholder: 'Optionnel' },
                  { label: 'Nom de la mere', field: 'motherName' as const, placeholder: 'Optionnel' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs text-[#8D6E63] uppercase tracking-wide">{label}</label>
                    <input type="text" value={editedData[field] || ''} onChange={e => updateField(field, e.target.value)} placeholder={placeholder} className="w-full mt-1 p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium outline-none text-sm" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-[#8D6E63] uppercase tracking-wide">Type de document</label>
                  <input type="text" value={editedData.documentType || ''} disabled className="w-full mt-1 p-3 bg-[#F5E6D3] rounded-xl text-[#8D6E63] text-sm" />
                </div>
                {editedData.additionalInfo && (
                  <div>
                    <label className="text-xs text-[#8D6E63] uppercase tracking-wide">Informations supplementaires</label>
                    <p className="mt-1 p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] text-sm">{editedData.additionalInfo}</p>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-3xl p-4 shadow-md">
                <h3 className="text-base font-bold text-[#5D4037] mb-3">Lien familial</h3>
                <select value={selectedRelation} onChange={e => setSelectedRelation(e.target.value)} className="w-full p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium outline-none text-sm">
                  <option value="">Selectionner le lien...</option>
                  {RELATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pb-4">
                <button onClick={() => { setScanState('idle'); setEditedData(null); setPreviewUrl(null); }} className="flex-1 h-14 bg-white border-2 border-[#5D4037]/20 text-[#5D4037] rounded-2xl font-semibold active:scale-95 transition-transform">Nouveau scan</button>
                <button onClick={handleSaveProfile} disabled={scanState === 'saving' || !editedData.name} className="flex-1 h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                  {scanState === 'saving' ? <Loader className="w-5 h-5 animate-spin" /> : null}
                  {scanState === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {scanState === 'idle' && (
        <div className="p-4 bg-white border-t border-[#5D4037]/10 space-y-2">
          <button onClick={() => cameraInputRef.current?.click()} className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
            <Camera className="w-5 h-5" />Prendre une photo
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-full h-12 bg-white border-2 border-[#5D4037]/20 text-[#5D4037] rounded-2xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-3">
            <FileImage className="w-5 h-5" />Choisir depuis la galerie
          </button>
        </div>
      )}
    </div>
  );
}
