import { Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

// Extend Window type for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setIsSupported(true);
    return () => recognitionRef.current?.abort();
  }, []);

  const toggle = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      onTranscript(event.results[0][0].transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return { isListening, isSupported, toggle };
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  prompt?: string;
}

export function VoiceInput({ onTranscript, placeholder = 'Appuyer pour parler' }: VoiceInputProps) {
  const { isListening, isSupported, toggle } = useSpeechRecognition(onTranscript);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`w-full h-16 rounded-3xl font-semibold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 ${
        isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white'
      }`}
    >
      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      <span>{isListening ? 'Écoute... (appuyer pour arrêter)' : placeholder}</span>
    </button>
  );
}

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  size?: 'small' | 'medium' | 'large';
  position?: 'inline' | 'standalone';
}

export function VoiceInputButton({ onTranscript, size = 'medium' }: VoiceInputButtonProps) {
  const { isListening, isSupported, toggle } = useSpeechRecognition(onTranscript);

  const sizeClasses = { small: 'w-8 h-8', medium: 'w-10 h-10', large: 'w-12 h-12' };
  const iconSizes = { small: 'w-4 h-4', medium: 'w-5 h-5', large: 'w-6 h-6' };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all active:scale-95 ${
        isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-[#D2691E]/10 text-[#D2691E] hover:bg-[#D2691E]/20'
      }`}
    >
      {isListening ? <MicOff className={iconSizes[size]} /> : <Mic className={iconSizes[size]} />}
    </button>
  );
}

interface VoiceInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onVoiceInput: (transcript: string) => void;
  placeholder?: string;
  type?: 'text' | 'date';
  icon?: React.ReactNode;
}

export function VoiceInputField({ value, onChange, onVoiceInput, placeholder, type = 'text', icon }: VoiceInputFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-3 p-3 bg-[#FFF8E7] rounded-xl">
        {icon}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[#5D4037] font-medium outline-none placeholder:text-[#8D6E63]"
        />
      </div>
      <VoiceInputButton onTranscript={onVoiceInput} size="medium" />
    </div>
  );
}

interface VoiceConversationalPromptProps {
  prompt: string;
  onResponse: (response: string) => void;
  icon?: React.ReactNode;
}

export function VoiceConversationalPrompt({ prompt, onResponse, icon }: VoiceConversationalPromptProps) {
  const { isListening, isSupported, toggle } = useSpeechRecognition(onResponse);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#D2691E] to-[#E8A05D] rounded-3xl p-6 shadow-xl"
    >
      <div className="flex items-start gap-3 mb-4">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <p className="flex-1 text-white leading-relaxed">{prompt}</p>
      </div>
      {isSupported ? (
        <button
          type="button"
          onClick={toggle}
          className={`w-full h-14 rounded-2xl font-semibold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-[#D2691E]'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {isListening ? 'Écoute...' : 'Appuyer pour répondre'}
        </button>
      ) : (
        <p className="text-white/70 text-sm text-center">Saisie vocale non disponible sur ce navigateur</p>
      )}
    </motion.div>
  );
}
