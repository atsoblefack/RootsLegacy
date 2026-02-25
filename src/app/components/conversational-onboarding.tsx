import { Languages, Send, Loader, CheckCircle, Mic, MicOff } from 'lucide-react';
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
}

const LANG_LABELS: Record<string, string> = {
  fr: 'Français', en: 'English', sw: 'Kiswahili', yo: 'Yorùbá', ha: 'Hausa', am: 'አማርኛ',
};

const INITIAL_PROMPTS: Record<string, string> = {
  fr: "Bonjour ! Je suis votre assistant RootsLegacy. 🌳 Je vais vous aider à construire votre arbre généalogique. Commençons par vous ! Quel est votre prénom et nom complet ?",
  en: "Hello! I'm your RootsLegacy assistant. 🌳 I'll help you build your family tree. Let's start with you! What is your full name?",
  sw: "Habari! Mimi ni msaidizi wako wa RootsLegacy. 🌳 Nitakusaidia kujenga mti wako wa familia. Tuanze nawe! Jina lako kamili ni nani?",
  yo: "Ẹ káàbọ̀! Mo jẹ olùrànlọ́wọ́ RootsLegacy rẹ. 🌳 Emi yoo ràn ọ lọ́wọ́ láti kọ́ igi ìdílé rẹ. Kí ni orúkọ rẹ?",
  ha: "Sannu! Ni ne mataimakin RootsLegacy naka. 🌳 Zan taimaka maka gina itacen danginku. Menene cikakken sunanka?",
  am: "ሰላም! እኔ የ RootsLegacy ረዳትዎ ነኝ። 🌳 ሙሉ ስምዎ ምንድን ነው?",
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
  const [savedProfile, setSavedProfile] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<ExtractedProfile>({});
  const [step, setStep] = useState<'chat' | 'confirm' | 'done'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentLang = (language as string) || 'fr';

  useEffect(() => {
    const initialMsg = INITIAL_PROMPTS[currentLang] || INITIAL_PROMPTS['fr'];
    setMessages([{ role: 'assistant', content: initialMsg }]);
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
      // Utiliser getSessionFromStorage pour éviter le lock deadlock avec AuthProvider
      const session = getSessionFromStorage();
      if (!session) { navigate('/login'); return; }
      if (!extractedData.name && updatedMessages.filter(m => m.role === 'user').length === 1) {
        setExtractedData(prev => ({ ...prev, name: userText }));
      }
      const res = await fetch(`${serverBaseUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })), language: currentLang, context: { extractedSoFar: extractedData } }),
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = { role: 'assistant', content: data.message };
        const allMsgs = [...updatedMessages, aiMsg];
        setMessages(allMsgs);
        const userMsgCount = allMsgs.filter(m => m.role === 'user').length;
        if (userMsgCount >= 3) {
          const lastAi = data.message.toLowerCase();
          if (['félicitations','congratulations','terminé','done','arbre','tree','explorer','explore'].some(kw => lastAi.includes(kw))) {
            setStep('confirm');
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('AI chat failed:', res.status, errData);
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

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      // Utiliser getSessionFromStorage pour éviter le lock deadlock avec AuthProvider
      const session = getSessionFromStorage();
      if (!session) return;
      const conversationSummary = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
      const extractRes = await fetch(`${serverBaseUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': publicAnonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Extract person info as JSON with fields: name, birthDate (YYYY-MM-DD or null), birthPlace (string or null), gender (male/female/other/null). Return ONLY valid JSON.\n\nConversation:\n${conversationSummary}` }], language: 'en', context: { task: 'extract_profile' } }),
      });
      let profileData: any = { name: extractedData.name || 'Nouveau membre' };
      if (extractRes.ok) {
        const extractResult = await extractRes.json();
        try {
          const jsonMatch = extractResult.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            profileData = { name: parsed.name || extractedData.name || 'Nouveau membre', birthDate: parsed.birthDate || null, birthPlace: parsed.birthPlace || null, gender: parsed.gender || null };
          }
        } catch (e) { console.error('Parse error:', e); }
      }
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
        setSavedProfile(createData.profile);
      } else {
        const errData = await createRes.json().catch(() => ({}));
        console.error('Create profile failed:', createRes.status, errData);
        alert(currentLang === 'fr' ? `Erreur lors de la création du profil: ${errData.error || createRes.status}` : `Error creating profile: ${errData.error || createRes.status}`);
      }
      setStep('done');
    } catch (err) { console.error('Save profile error:', err); setStep('done'); } finally { setIsSaving(false); }
  };

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
    setMessages([{ role: 'assistant', content: INITIAL_PROMPTS[code] || INITIAL_PROMPTS['fr'] }]);
    setExtractedData({});
    setStep('chat');
  };

  if (step === 'done') {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#5D4037] mb-3">{currentLang === 'fr' ? 'Profil créé !' : 'Profile Created!'}</h2>
          <p className="text-[#8D6E63] mb-8 leading-relaxed">{currentLang === 'fr' ? 'Votre profil a été ajouté à votre arbre généalogique.' : 'Your profile has been added to your family tree.'}</p>
          {savedProfile && (
            <div className="bg-white rounded-2xl p-4 shadow-md mb-6 text-left">
              <p className="text-xs text-[#8D6E63] uppercase tracking-wide mb-1">{currentLang === 'fr' ? 'Profil créé' : 'Created profile'}</p>
              <p className="font-bold text-[#5D4037]">{savedProfile.full_name}</p>
            </div>
          )}
          <div className="space-y-3 w-full">
            <Link to="/input-methods"><button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">{currentLang === 'fr' ? "Ajouter d'autres membres" : 'Add More Members'}</button></Link>
            <Link to="/home"><button className="w-full h-14 bg-white text-[#D2691E] rounded-2xl font-semibold border-2 border-[#D2691E]/20 active:scale-95 transition-transform">{currentLang === 'fr' ? 'Voir mon arbre' : 'View My Tree'}</button></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl w-full">
          <h2 className="text-xl font-bold text-[#5D4037] mb-3">{currentLang === 'fr' ? 'Sauvegarder votre profil ?' : 'Save your profile?'}</h2>
          <p className="text-[#8D6E63] mb-6 text-sm leading-relaxed">{currentLang === 'fr' ? 'Nous allons créer votre profil dans votre arbre généalogique.' : "We'll create your profile in your family tree."}</p>
          {extractedData.name && (
            <div className="bg-[#FFF8E7] rounded-2xl p-4 mb-6">
              <p className="text-xs text-[#8D6E63] uppercase tracking-wide mb-1">Nom</p>
              <p className="font-bold text-[#5D4037]">{extractedData.name}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep('chat')} className="flex-1 h-14 bg-[#FFF8E7] text-[#5D4037] rounded-2xl font-semibold active:scale-95 transition-transform">{currentLang === 'fr' ? 'Continuer' : 'Continue'}</button>
            <button onClick={saveProfile} disabled={isSaving} className="flex-1 h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold active:scale-95 transition-transform disabled:opacity-50">
              {isSaving ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : (currentLang === 'fr' ? 'Sauvegarder' : 'Save')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#5D4037]">{currentLang === 'fr' ? 'Assistant RootsLegacy' : 'RootsLegacy Assistant'}</h1>
            <p className="text-sm text-[#8D6E63]">{currentLang === 'fr' ? 'IA généalogique' : 'Genealogy AI'} ✨</p>
          </div>
          <button onClick={() => setShowLanguages(!showLanguages)} className="flex items-center gap-2 px-3 py-2 bg-[#FFF8E7] rounded-xl text-sm font-medium text-[#D2691E]">
            <Languages className="w-4 h-4" />
            <span>{LANG_LABELS[currentLang] || currentLang}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showLanguages && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-20 right-4 z-50 bg-white rounded-2xl shadow-xl p-3 border border-[#5D4037]/10">
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
          <button onClick={() => sendMessage()} disabled={!inputText.trim() || isLoading} className="w-12 h-12 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-between mt-2">
          <Link to="/home" className="text-xs text-[#8D6E63] underline">{currentLang === 'fr' ? "Passer pour l'instant" : 'Skip for now'}</Link>
          {messages.filter(m => m.role === 'user').length >= 3 && (
            <button onClick={() => setStep('confirm')} className="text-xs text-[#D2691E] font-semibold underline">{currentLang === 'fr' ? 'Sauvegarder maintenant' : 'Save now'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
