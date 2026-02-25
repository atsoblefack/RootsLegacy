import { ArrowLeft, MessageCircle, Upload, Users, CheckCircle, Loader, Share2, Copy, Check, X, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../../utils/supabase/client';
import { serverBaseUrl, publicAnonKey } from '../../../utils/supabase/info';

interface ParsedContact {
  name: string;
  phone?: string;
  selected: boolean;
}

function parseWhatsAppText(text: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];
  const seen = new Set<string>();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.includes(' - ') && /\d{2}\/\d{2}\/\d{4}/.test(line)) continue;
    if (line.length < 2 || line.length > 80) continue;

    const namePhonePattern = /^([^:+\-]+)[:–\-]\s*([+\d\s\(\)]{7,})$/;
    const namePhoneMatch = line.match(namePhonePattern);
    if (namePhoneMatch) {
      const name = namePhoneMatch[1].trim();
      const phone = namePhoneMatch[2].replace(/\s+/g, '').trim();
      const key = name.toLowerCase();
      if (!seen.has(key) && name.length > 1) { seen.add(key); contacts.push({ name, phone, selected: true }); }
      continue;
    }

    if (/^[+\d\s\(\)]+$/.test(line)) {
      const phone = line.replace(/\s+/g, '');
      if (!seen.has(phone)) { seen.add(phone); contacts.push({ name: phone, phone, selected: true }); }
      continue;
    }

    const cleanName = line.replace(/[^\w\s\-'àâäéèêëîïôùûüç]/gi, '').trim();
    if (cleanName.length >= 2 && cleanName.length <= 60 && !seen.has(cleanName.toLowerCase())) {
      seen.add(cleanName.toLowerCase());
      contacts.push({ name: cleanName, selected: true });
    }
  }
  return contacts.slice(0, 50);
}

export function WhatsAppImport() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'import' | 'share'>('import');
  const [pastedText, setPastedText] = useState('');
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ created: number; errors: number } | null>(null);
  const [shareData, setShareData] = useState<{ shareUrl: string; shareText: string; familyName: string } | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    if (!pastedText.trim()) return;
    setIsParsing(true);
    setTimeout(() => {
      const contacts = parseWhatsAppText(pastedText);
      setParsedContacts(contacts);
      setIsParsing(false);
      setError(contacts.length === 0 ? "Aucun contact trouvé. Essayez de coller une liste de noms, un par ligne." : null);
    }, 300);
  };

  const toggleContact = (idx: number) => setParsedContacts(prev => prev.map((c, i) => i === idx ? { ...c, selected: !c.selected } : c));
  const selectAll = (val: boolean) => setParsedContacts(prev => prev.map(c => ({ ...c, selected: val })));

  const handleSave = async () => {
    const selected = parsedContacts.filter(c => c.selected);
    if (selected.length === 0) return;
    setIsSaving(true); setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }
      const res = await fetch(`${serverBaseUrl}/profiles/batch`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles: selected.map(c => ({ full_name: c.name, phone: c.phone || null })) }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaveResult({ created: data.total || data.created?.length || 0, errors: data.errors?.length || 0 });
      } else {
        const errData = await res.json();
        setError(errData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) { setError('Erreur de connexion.'); } finally { setIsSaving(false); }
  };

  const loadShareData = async () => {
    setShareLoading(true); setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }
      const res = await fetch(`${serverBaseUrl}/share/family-link`, {
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey },
      });
      if (res.ok) { const data = await res.json(); setShareData({ shareUrl: data.shareUrl, shareText: data.shareText, familyName: data.familyName }); }
      else setError('Impossible de générer le lien de partage');
    } catch (err) { setError('Erreur de connexion'); } finally { setShareLoading(false); }
  };

  const handleWebShare = async () => {
    if (!shareData) return;
    if (navigator.share) {
      try { await navigator.share({ title: `Rejoins notre arbre familial "${shareData.familyName}"`, text: shareData.shareText, url: shareData.shareUrl }); }
      catch (err) { if ((err as any).name !== 'AbortError') handleCopy(); }
    } else handleCopy();
  };

  const handleWhatsAppShare = () => {
    if (!shareData) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareData.shareText)}`, '_blank');
  };

  const handleCopy = async () => {
    if (!shareData) return;
    try { await navigator.clipboard.writeText(shareData.shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (err) {}
  };

  if (saveResult) {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#5D4037] mb-3">Contacts importés !</h2>
          <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
            <p className="text-3xl font-bold text-[#D2691E]">{saveResult.created}</p>
            <p className="text-[#8D6E63] text-sm">profil{saveResult.created > 1 ? 's' : ''} créé{saveResult.created > 1 ? 's' : ''}</p>
            {saveResult.errors > 0 && <p className="text-orange-500 text-xs mt-1">{saveResult.errors} erreur{saveResult.errors > 1 ? 's' : ''}</p>}
          </div>
          <div className="space-y-3 w-full">
            <Link to="/tree"><button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">Voir l'arbre généalogique</button></Link>
            <Link to="/home"><button className="w-full h-14 bg-white text-[#D2691E] rounded-2xl font-semibold border-2 border-[#D2691E]/20 active:scale-95 transition-transform">Retour à l'accueil</button></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/input-methods">
            <button className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-[#5D4037]" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#5D4037]">WhatsApp</h1>
            <p className="text-sm text-[#8D6E63]">Importer ou partager</p>
          </div>
          <div className="ml-auto w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setTab('import')} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'import' ? 'bg-[#D2691E] text-white' : 'bg-[#FFF8E7] text-[#5D4037]'}`}>
            <Upload className="w-4 h-4 inline mr-1" />Importer
          </button>
          <button onClick={() => { setTab('share'); if (!shareData) loadShareData(); }} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'share' ? 'bg-[#25D366] text-white' : 'bg-[#FFF8E7] text-[#5D4037]'}`}>
            <Share2 className="w-4 h-4 inline mr-1" />Partager
          </button>
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

        {tab === 'import' && (
          <AnimatePresence mode="wait">
            {parsedContacts.length === 0 ? (
              <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-[#25D366]/10 rounded-2xl p-4 mb-4">
                  <h3 className="font-bold text-[#5D4037] mb-2">Comment importer ?</h3>
                  <ol className="text-sm text-[#5D4037] space-y-2">
                    <li className="flex gap-2"><span className="font-bold text-[#D2691E]">1.</span> Ouvrez un groupe WhatsApp</li>
                    <li className="flex gap-2"><span className="font-bold text-[#D2691E]">2.</span> Allez dans "Infos du groupe" → "Participants"</li>
                    <li className="flex gap-2"><span className="font-bold text-[#D2691E]">3.</span> Copiez les noms et collez-les ci-dessous</li>
                  </ol>
                  <p className="text-xs text-[#8D6E63] mt-3">Ou collez simplement une liste de noms, un par ligne.</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                  <label className="text-sm font-semibold text-[#5D4037] block mb-2">Collez vos contacts ici</label>
                  <textarea
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder={"Mamadou Diallo\nFatou Traoré\nKofi Mensah\n+33 6 12 34 56 78\n..."}
                    className="w-full h-40 bg-[#FFF8E7] rounded-xl p-3 text-sm text-[#5D4037] outline-none resize-none placeholder:text-[#8D6E63]"
                  />
                  <p className="text-xs text-[#8D6E63] mt-1">{pastedText.split('\n').filter(l => l.trim()).length} lignes</p>
                </div>
                <button onClick={handleParse} disabled={!pastedText.trim() || isParsing} className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                  {isParsing ? <Loader className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
                  {isParsing ? 'Analyse en cours...' : 'Analyser les contacts'}
                </button>
              </motion.div>
            ) : (
              <motion.div key="contacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#5D4037]">{parsedContacts.filter(c => c.selected).length}/{parsedContacts.length} sélectionnés</h3>
                  <div className="flex gap-2">
                    <button onClick={() => selectAll(true)} className="text-xs text-[#D2691E] font-semibold">Tout</button>
                    <span className="text-[#8D6E63]">|</span>
                    <button onClick={() => selectAll(false)} className="text-xs text-[#8D6E63]">Aucun</button>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {parsedContacts.map((contact, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} onClick={() => toggleContact(idx)} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${contact.selected ? 'bg-white shadow-sm' : 'bg-white/50 opacity-60'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${contact.selected ? 'bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white' : 'bg-[#F5E6D3] text-[#8D6E63]'}`}>{contact.name.charAt(0).toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#5D4037] truncate">{contact.name}</p>
                        {contact.phone && contact.phone !== contact.name && <p className="text-xs text-[#8D6E63]">{contact.phone}</p>}
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${contact.selected ? 'bg-[#D2691E] border-[#D2691E]' : 'border-[#D2691E]/30'}`}>
                        {contact.selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setParsedContacts([]); setPastedText(''); }} className="flex-1 h-14 bg-white border-2 border-[#5D4037]/20 text-[#5D4037] rounded-2xl font-semibold active:scale-95 transition-transform">Recommencer</button>
                  <button onClick={handleSave} disabled={isSaving || parsedContacts.filter(c => c.selected).length === 0} className="flex-1 h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : null}
                    {isSaving ? 'Sauvegarde...' : `Ajouter ${parsedContacts.filter(c => c.selected).length}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {tab === 'share' && (
          <AnimatePresence mode="wait">
            {shareLoading ? (
              <motion.div key="loading" className="flex flex-col items-center justify-center py-20">
                <Loader className="w-8 h-8 text-[#D2691E] animate-spin mb-3" />
                <p className="text-[#8D6E63]">Génération du lien...</p>
              </motion.div>
            ) : shareData ? (
              <motion.div key="share" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-[#8D6E63] uppercase tracking-wide mb-1">Famille</p>
                  <p className="font-bold text-[#5D4037] text-lg">{shareData.familyName}</p>
                </div>
                <div className="bg-[#25D366]/10 rounded-2xl p-4">
                  <p className="text-xs text-[#8D6E63] uppercase tracking-wide mb-2">Message à partager</p>
                  <p className="text-sm text-[#5D4037] leading-relaxed">{shareData.shareText}</p>
                </div>
                <div className="space-y-3">
                  <button onClick={handleWhatsAppShare} className="w-full h-14 bg-[#25D366] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
                    <MessageCircle className="w-5 h-5" />Partager sur WhatsApp
                  </button>
                  <button onClick={handleWebShare} className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
                    <Share2 className="w-5 h-5" />Partager (autres apps)
                  </button>
                  <button onClick={handleCopy} className="w-full h-14 bg-white border-2 border-[#5D4037]/20 text-[#5D4037] rounded-2xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-3">
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copié !' : 'Copier le message'}
                  </button>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-[#8D6E63] uppercase tracking-wide mb-2">Lien d'invitation</p>
                  <div className="flex items-center gap-2 bg-[#FFF8E7] rounded-xl p-3">
                    <p className="flex-1 text-sm text-[#D2691E] font-mono truncate">{shareData.shareUrl}</p>
                    <button onClick={async () => { await navigator.clipboard.writeText(shareData.shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#8D6E63]" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="error" className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-orange-400 mb-3" />
                <p className="text-[#8D6E63] text-center mb-4">Impossible de charger le lien de partage</p>
                <button onClick={loadShareData} className="px-6 py-3 bg-[#D2691E] text-white rounded-2xl font-semibold">Réessayer</button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
