import { Languages, Send, Loader, CheckCircle, Mic, MicOff, Users, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './language-context';
import { getSessionFromStorage } from '../../../utils/supabase/useSession';
import { serverBaseUrl, publicAnonKey } from '../../../utils/supabase/info';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ExtractedProfile {
  name?: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: string;
  relations?: Array<{ name: string; type: string; profileId?: string }>;
}

interface CreatedProfile {
  id: string;
  full_name: string;
  birth_date?: string;
  birth_place?: string;
}

const LANG_LABELS: Record<string, string> = {
  fr: 'Français', en: 'English', sw: 'Kiswahili', yo: 'Yorùbá', ha: 'Hausa', am: 'አማርኛ',
};

// ─── Prompts initiaux selon le flux ──────────────────────────────────────────
const INITIAL_PROMPTS_USER: Record<string, string> = {
  fr: "Bonjour ! Je suis votre assistant RootsLegacy. 🌳 Je vais vous aider à créer votre profil et à vous placer dans l'arbre généalogique. Commençons par vous ! Quel est votre prénom et nom complet ?",
  en: "Hello! I'm your RootsLegacy assistant. 🌳 I'll help you create your profile and place you in the family tree. Let's start with you! What is your full name?",
  sw: "Habari! Mimi ni msaidizi wako wa RootsLegacy. 🌳 Nitakusaidia kuunda wasifu wako na kukuweka kwenye mti wa familia. Tuanze nawe! Jina lako kamili ni nani?",
  yo: "Ẹ káàbọ̀! Mo jẹ olùrànlọ́wọ́ RootsLegacy rẹ. 🌳 Emi yoo ràn ọ lọ́wọ́ láti ṣẹ̀dá àkọsílẹ̀ rẹ àti gbé ọ sínú igi ìdílé. Kí ni orúkọ rẹ?",
  ha: "Sannu! Ni ne mataimakin RootsLegacy naka. 🌳 Zan taimaka maka ƙirƙirar bayanan ka da sanya ka a cikin itacen dangi. Menene cikakken sunanka?",
  am: "ሰላም! እኔ የ RootsLegacy ረዳትዎ ነኝ። 🌳 ሙሉ ስምዎ ምንድን ነው?",
};

const INITIAL_PROMPTS_ADMIN: Record<string, string> = {
  fr: "Bonjour Administrateur ! 👑 Je suis votre assistant RootsLegacy. Je vais vous aider à construire l'arbre généalogique de votre famille en ajoutant plusieurs membres. Commençons ! Quel est le nom complet du premier membre à ajouter ?",
  en: "Hello Administrator! 👑 I'm your RootsLegacy assistant. I'll help you build your family tree by adding multiple members. Let's start! What is the full name of the first member to add?",
  sw: "Habari Msimamizi! 👑 Nitakusaidia kujenga mti wa familia kwa kuongeza wanachama wengi. Tuanze! Jina kamili la mwanachama wa kwanza ni nani?",
  yo: "Ẹ káàbọ̀ Alákòóso! 👑 Emi yoo ràn ọ lọ́wọ́ láti kọ́ igi ìdílé rẹ nípa fífikún àwọn ọmọ ẹgbẹ́ púpọ̀. Kí ni orúkọ ọmọ ẹgbẹ́ àkọ́kọ́?",
  ha: "Sannu Gudanarwa! 👑 Zan taimaka maka gina itacen dangi ta hanyar ƙara membobi da yawa. Menene cikakken sunan memba na farko?",
  am: "ሰላም አስተዳዳሪ! 👑 የቤተሰብ ዛፍዎን ለመገንባት ብዙ አባላትን ለማከል እርዳዎ። የመጀመሪያው አባል ሙሉ ስም ምንድን ነው?",
};

function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSupported = !!SR;

  const toggle = (lang: string) => {
    if (!SR) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const langMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', sw: 'sw-KE', yo: 'yo-NG', ha: 'ha-NG', am: 'am-ET' };
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = langMap[lang] || 'fr-FR';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => { onTranscript(event.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };
  return { isListening, isSupported, toggle };
}

export function ConversationalOnboarding() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<'loading' | 'chat' | 'confirm' | 'done'>('loading');
  const [isAdmin, setIsAdmin] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedProfile>({});
  const [editableName, setEditableName] = useState('');
  // Admin multi-profile state
  const [createdProfiles, setCreatedProfiles] = useState<CreatedProfile[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<ExtractedProfile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentLang = (language as string) || 'fr';

  // ─── Detect user role on mount ──────────────────────────────────────────────
  useEffect(() => {
    const detectRole = async () => {
      const session = getSessionFromStorage();
      if (!session) { navigate('/login'); return; }
      try {
        const res = await fetch(`${serverBaseUrl}/auth/role`, {
          headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey },
        });
        if (res.ok) {
          const data = await res.json();
          const adminRole = data.role === 'admin' || data.role === 'super_admin';
          setIsAdmin(adminRole);
          const initialMsg = adminRole
            ? (INITIAL_PROMPTS_ADMIN[currentLang] || INITIAL_PROMPTS_ADMIN['fr'])
            : (INITIAL_PROMPTS_USER[currentLang] || INITIAL_PROMPTS_USER['fr']);
          setMessages([{ role: 'assistant', content: initialMsg }]);
        } else {
          setMessages([{ role: 'assistant', content: INITIAL_PROMPTS_USER[currentLang] || INITIAL_PROMPTS_USER['fr'] }]);
        }
      } catch {
        setMessages([{ role: 'assistant', content: INITIAL_PROMPTS_USER[currentLang] || INITIAL_PROMPTS_USER['fr'] }]);
      }
      setStep('chat');
    };
    detectRole();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleVoiceTranscript = (text: string) => setInputText(text);
  const { isListening, isSupported, toggle: toggleVoice } = useSpeechRecognition(handleVoiceTranscript);

  const sendMessage = async (text?: string) => {
    const userText = text || inputText.trim();
    if (!userText || isLoading) return;
    const newUserMsg: Message = { role: 'user', content: userText };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    try {
      const session = getSessionFromStorage();
      if (!session) { navigate('/login'); return; }

      // Ne pas pré-remplir avec le premier message brut (peut être une question)
      // Le nom sera extrait par l'IA lors du clic Sauvegarder

      const res = await fetch(`${serverBaseUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          language: currentLang,
          context: {
            isAdmin,
            extractedSoFar: extractedData,
            createdProfilesCount: createdProfiles.length,
            mode: isAdmin ? 'admin_multi_profile' : 'user_self_profile',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = { role: 'assistant', content: data.message };
        const allMsgs = [...updatedMessages, aiMsg];
        setMessages(allMsgs);

        const userMsgCount = allMsgs.filter(m => m.role === 'user').length;

        if (isAdmin) {
          // Admin flow: trigger confirm after enough data collected for current member
          if (userMsgCount >= 2) {
            const lastAi = data.message.toLowerCase();
            const confirmKeywords = ['sauvegarder', 'save', 'créer', 'create', 'ajouter', 'add', 'confirmer', 'confirm', 'enregistrer', 'register'];
            if (confirmKeywords.some(kw => lastAi.includes(kw))) {
              setStep('confirm');
            }
          }
        } else {
          // User flow: trigger confirm after enough data collected
          if (userMsgCount >= 3) {
            const lastAi = data.message.toLowerCase();
            const confirmKeywords = ['félicitations', 'congratulations', 'terminé', 'done', 'arbre', 'tree', 'explorer', 'explore', 'sauvegarder', 'save', 'créer', 'create'];
            if (confirmKeywords.some(kw => lastAi.includes(kw))) {
              setStep('confirm');
            }
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const fallback = res.status === 401
          ? (currentLang === 'fr' ? 'Session expirée. Veuillez vous reconnecter.' : 'Session expired. Please log in again.')
          : (currentLang === 'fr' ? `Erreur IA (${res.status}): ${errData.error || 'Veuillez réessayer.'}` : `AI error (${res.status}): ${errData.error || 'Please try again.'}`);
        setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: currentLang === 'fr' ? "Une erreur s'est produite. Veuillez réessayer." : "An error occurred. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Extract profile data from conversation via AI ───────────────────────
  const extractProfileFromConversation = async (session: any, conversationMessages: Message[]): Promise<ExtractedProfile> => {
    const conversationSummary = conversationMessages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
    try {
      const extractRes = await fetch(`${serverBaseUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Extract the MOST RECENTLY discussed person's info as JSON with fields: name (string), birthDate (YYYY-MM-DD or null), birthPlace (string or null), gender (male/female/other/null), relations (array of {name: string, type: "father"|"mother"|"spouse"|"child"|"sibling"|"other"} or empty array). Return ONLY valid JSON, no explanation.\n\nConversation:\n${conversationSummary}`,
          }],
          language: 'en',
          context: { task: 'extract_profile' },
        }),
      });
      if (extractRes.ok) {
        const extractResult = await extractRes.json();
        const jsonMatch = extractResult.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            name: parsed.name || extractedData.name || 'Nouveau membre',
            birthDate: parsed.birthDate || null,
            birthPlace: parsed.birthPlace || null,
            gender: parsed.gender || null,
            relations: parsed.relations || [],
          };
        }
      }
    } catch (e) { console.error('Extract error:', e); }
    return { name: extractedData.name || 'Nouveau membre', relations: [] };
  };

  // ─── Save profile (user flow) ─────────────────────────────────────────────
  const saveUserProfile = async () => {
    setIsSaving(true);
    try {
      const session = getSessionFromStorage();
      if (!session) return;

      const profileData = await extractProfileFromConversation(session, messages);
      // Use the editable name if user modified it
      if (editableName.trim()) profileData.name = editableName.trim();

      const createRes = await fetch(`${serverBaseUrl}/profiles/self`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileData.name,
          full_name: profileData.name,
          birth_date: profileData.birthDate || null,
          birth_place: profileData.birthPlace || null,
          gender: profileData.gender || null,
        }),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        const myProfileId = createData.profile?.id;

        // Create relations if any were collected
        if (myProfileId && profileData.relations && profileData.relations.length > 0) {
          for (const rel of profileData.relations) {
            if (!rel.name) continue;
            // First create the related person's profile
            const relProfileRes = await fetch(`${serverBaseUrl}/profiles/self`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: rel.name, full_name: rel.name }),
            });
            if (relProfileRes.ok) {
              const relProfileData = await relProfileRes.json();
              const relProfileId = relProfileData.profile?.id;
              if (relProfileId) {
                // Create the relation
                await fetch(`${serverBaseUrl}/relations`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    profileId1: myProfileId,
                    profileId2: relProfileId,
                    relationType: rel.type || 'other',
                  }),
                });
              }
            }
          }
        }

        setCreatedProfiles([createData.profile]);
      } else {
        const errData = await createRes.json().catch(() => ({}));
        alert(currentLang === 'fr' ? `Erreur: ${errData.error || createRes.status}` : `Error: ${errData.error || createRes.status}`);
      }
      setStep('done');
    } catch (err) {
      console.error('Save profile error:', err);
      setStep('done');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Save current member (admin flow) ────────────────────────────────────
  const saveAdminProfile = async () => {
    setIsSaving(true);
    try {
      const session = getSessionFromStorage();
      if (!session) return;

      const profileData = await extractProfileFromConversation(session, messages);
      // Use the editable name if user modified it
      if (editableName.trim()) profileData.name = editableName.trim();

      const createRes = await fetch(`${serverBaseUrl}/profiles`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profileData.name,
          birth_date: profileData.birthDate || null,
          birth_place: profileData.birthPlace || null,
          gender: profileData.gender || null,
        }),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        const newProfile: CreatedProfile = createData.profile;
        const allProfiles = [...createdProfiles, newProfile];
        setCreatedProfiles(allProfiles);

        // Create relations with previously created profiles
        if (profileData.relations && profileData.relations.length > 0) {
          for (const rel of profileData.relations) {
            const relatedProfile = allProfiles.find(p =>
              p.full_name.toLowerCase().includes(rel.name.toLowerCase()) ||
              rel.name.toLowerCase().includes(p.full_name.toLowerCase())
            );
            if (relatedProfile && relatedProfile.id !== newProfile.id) {
              await fetch(`${serverBaseUrl}/relations`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  profileId1: newProfile.id,
                  profileId2: relatedProfile.id,
                  relationType: rel.type || 'other',
                }),
              }).catch(e => console.error('Relation error:', e));
            }
          }
        }

        // Ask if admin wants to add another member
        const nextPrompt = currentLang === 'fr'
          ? `✅ ${profileData.name} a été ajouté(e) à l'arbre ! Vous avez maintenant ${allProfiles.length} membre(s) créé(s). Voulez-vous ajouter un autre membre ? Si oui, dites-moi son nom. Sinon, tapez "terminé".`
          : `✅ ${profileData.name} has been added to the tree! You now have ${allProfiles.length} member(s) created. Do you want to add another member? If yes, tell me their name. Otherwise, type "done".`;

        setMessages(prev => [...prev, { role: 'assistant', content: nextPrompt }]);
        setExtractedData({});
        setStep('chat');
      } else {
        const errData = await createRes.json().catch(() => ({}));
        alert(currentLang === 'fr' ? `Erreur: ${errData.error || createRes.status}` : `Error: ${errData.error || createRes.status}`);
        setStep('chat');
      }
    } catch (err) {
      console.error('Save admin profile error:', err);
      setStep('chat');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Handle admin "done" keyword ─────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    const doneKeywords = ['terminé', 'done', 'fini', 'finished', 'stop', 'fin', 'c\'est tout', 'that\'s all', 'ça suffit'];
    if (doneKeywords.some(kw => lastUserMsg.content.toLowerCase().includes(kw))) {
      setStep('done');
    }
  }, [messages, isAdmin]);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  ];

  const handleLanguageChange = (code: string) => {
    if (code === 'en' || code === 'fr') setLanguage(code);
    setShowLanguages(false);
    const initialMsg = isAdmin
      ? (INITIAL_PROMPTS_ADMIN[code] || INITIAL_PROMPTS_ADMIN['fr'])
      : (INITIAL_PROMPTS_USER[code] || INITIAL_PROMPTS_USER['fr']);
    setMessages([{ role: 'assistant', content: initialMsg }]);
    setExtractedData({});
    setStep('chat');
  };

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-[#D2691E] animate-spin" />
      </div>
    );
  }

  // ─── Done screen ──────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center w-full">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#5D4037] mb-3">
            {isAdmin
              ? (currentLang === 'fr' ? `${createdProfiles.length} profil(s) créé(s) !` : `${createdProfiles.length} profile(s) created!`)
              : (currentLang === 'fr' ? 'Profil créé !' : 'Profile Created!')}
          </h2>
          <p className="text-[#8D6E63] mb-6 leading-relaxed">
            {currentLang === 'fr' ? 'Les profils ont été ajoutés à votre arbre généalogique.' : 'Profiles have been added to your family tree.'}
          </p>

          {createdProfiles.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-md mb-6 text-left w-full max-h-48 overflow-y-auto">
              <p className="text-xs text-[#8D6E63] uppercase tracking-wide mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {currentLang === 'fr' ? 'Profils créés' : 'Created profiles'}
              </p>
              {createdProfiles.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 py-1 border-b border-[#5D4037]/5 last:border-0">
                  <div className="w-6 h-6 rounded-full bg-[#D2691E]/10 flex items-center justify-center">
                    <User className="w-3 h-3 text-[#D2691E]" />
                  </div>
                  <p className="font-medium text-[#5D4037] text-sm">{p.full_name}</p>
                  {p.birth_place && <p className="text-xs text-[#8D6E63]">• {p.birth_place}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 w-full">
            {isAdmin && (
              <button
                onClick={() => {
                  setStep('chat');
                  setExtractedData({});
                  const nextPrompt = currentLang === 'fr'
                    ? "Quel est le nom complet du prochain membre à ajouter ?"
                    : "What is the full name of the next member to add?";
                  setMessages(prev => [...prev, { role: 'assistant', content: nextPrompt }]);
                }}
                className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform"
              >
                {currentLang === 'fr' ? "Ajouter un autre membre" : 'Add Another Member'}
              </button>
            )}
            <Link to="/input-methods">
              <button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">
                {currentLang === 'fr' ? "Ajouter d'autres membres" : 'Add More Members'}
              </button>
            </Link>
            <Link to="/home">
              <button className="w-full h-14 bg-white text-[#D2691E] rounded-2xl font-semibold border-2 border-[#D2691E]/20 active:scale-95 transition-transform">
                {currentLang === 'fr' ? 'Voir mon arbre' : 'View My Tree'}
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Confirm screen ───────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl w-full">
          <h2 className="text-xl font-bold text-[#5D4037] mb-2">
            {isAdmin
              ? (currentLang === 'fr' ? 'Sauvegarder ce membre ?' : 'Save this member?')
              : (currentLang === 'fr' ? 'Sauvegarder votre profil ?' : 'Save your profile?')}
          </h2>
          <p className="text-[#8D6E63] mb-4 text-sm leading-relaxed">
            {isAdmin
              ? (currentLang === 'fr' ? "L'IA va extraire les informations de la conversation et créer le profil." : "The AI will extract info from the conversation and create the profile.")
              : (currentLang === 'fr' ? 'Nous allons créer votre profil dans votre arbre généalogique.' : "We'll create your profile in your family tree.")}
          </p>

          {isAdmin && createdProfiles.length > 0 && (
            <div className="bg-[#FFF8E7] rounded-xl p-3 mb-4">
              <p className="text-xs text-[#8D6E63] mb-1">
                {currentLang === 'fr' ? `${createdProfiles.length} membre(s) déjà ajouté(s)` : `${createdProfiles.length} member(s) already added`}
              </p>
              {createdProfiles.map(p => (
                <p key={p.id} className="text-sm font-medium text-[#5D4037]">• {p.full_name}</p>
              ))}
            </div>
          )}

          <div className="mb-6">
            <label className="text-xs text-[#8D6E63] uppercase tracking-wide block mb-1">
              {currentLang === 'fr' ? 'Nom' : 'Name'}
            </label>
            <input
              type="text"
              value={editableName}
              onChange={e => setEditableName(e.target.value)}
              placeholder={currentLang === 'fr' ? 'Nom complet...' : 'Full name...'}
              className="w-full bg-[#FFF8E7] rounded-xl px-4 py-3 text-[#5D4037] font-bold outline-none border-2 border-transparent focus:border-[#D2691E] transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('chat')}
              className="flex-1 h-14 bg-[#FFF8E7] text-[#5D4037] rounded-2xl font-semibold active:scale-95 transition-transform"
            >
              {currentLang === 'fr' ? 'Continuer' : 'Continue'}
            </button>
            <button
              onClick={isAdmin ? saveAdminProfile : saveUserProfile}
              disabled={isSaving}
              className="flex-1 h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold active:scale-95 transition-transform disabled:opacity-50"
            >
              {isSaving ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : (currentLang === 'fr' ? 'Sauvegarder' : 'Save')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Chat screen ──────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#5D4037]">
                {currentLang === 'fr' ? 'Assistant RootsLegacy' : 'RootsLegacy Assistant'}
              </h1>
              {isAdmin && (
                <span className="text-xs bg-[#D2691E]/10 text-[#D2691E] px-2 py-0.5 rounded-full font-medium">Admin</span>
              )}
            </div>
            <p className="text-sm text-[#8D6E63]">
              {isAdmin
                ? (currentLang === 'fr' ? `Mode multi-profils • ${createdProfiles.length} créé(s)` : `Multi-profile mode • ${createdProfiles.length} created`)
                : (currentLang === 'fr' ? 'IA généalogique' : 'Genealogy AI')} ✨
            </p>
          </div>
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-2 px-3 py-2 bg-[#FFF8E7] rounded-xl text-sm font-medium text-[#D2691E]"
          >
            <Languages className="w-4 h-4" />
            <span>{LANG_LABELS[currentLang] || currentLang}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showLanguages && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-4 z-50 bg-white rounded-2xl shadow-xl p-3 border border-[#5D4037]/10"
          >
            {languages.map(lang => (
              <button key={lang.code} onClick={() => handleLanguageChange(lang.code)} className="flex items-center gap-3 w-full px-4 py-2 rounded-xl hover:bg-[#FFF8E7] transition-colors">
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium text-[#5D4037]">{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user' ? 'bg-[#D2691E] text-white rounded-tr-sm' : 'bg-white text-[#5D4037] rounded-tl-sm'}`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D2691E] to-[#E8A05D] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-2 h-2 bg-[#D2691E]/40 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-[#5D4037]/10">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-[#FFF8E7] rounded-2xl px-4 py-3 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={currentLang === 'fr' ? 'Votre réponse...' : 'Your answer...'}
              className="flex-1 bg-transparent text-[#5D4037] outline-none text-sm placeholder:text-[#8D6E63]"
              disabled={isLoading}
            />
            {isSupported && (
              <button onClick={() => toggleVoice(currentLang)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#D2691E]/10 text-[#D2691E]'}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-between mt-2">
          <Link to="/home" className="text-xs text-[#8D6E63] underline">
            {currentLang === 'fr' ? "Passer pour l'instant" : 'Skip for now'}
          </Link>
          {messages.filter(m => m.role === 'user').length >= 2 && (
            <button onClick={() => setStep('confirm')} className="text-xs text-[#D2691E] font-semibold underline">
              {currentLang === 'fr' ? 'Sauvegarder maintenant' : 'Save now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
