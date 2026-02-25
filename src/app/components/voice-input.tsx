import { Mic, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  prompt?: string;
}

export function VoiceInput({ onTranscript, placeholder, prompt }: VoiceInputProps) {
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    setIsListening(true);
    
    // Simulate voice recognition (in real app, use Web Speech API or backend service)
    setTimeout(() => {
      setIsListening(false);
      // Example transcript - in real app this would come from speech recognition
      const mockTranscript = "Sample voice input";
      onTranscript(mockTranscript);
    }, 2000);
  };

  return (
    <button
      onClick={handleVoiceInput}
      disabled={isListening}
      className={`w-full h-16 rounded-3xl font-semibold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 ${
        isListening
          ? 'bg-[#d4183d] text-white animate-pulse'
          : 'bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white'
      }`}
    >
      <Mic className="w-6 h-6" />
      <span>{isListening ? 'Listening...' : placeholder}</span>
    </button>
  );
}

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  size?: 'small' | 'medium' | 'large';
  position?: 'inline' | 'standalone';
}

export function VoiceInputButton({ 
  onTranscript, 
  size = 'medium',
  position = 'standalone' 
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    setIsListening(true);
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      const mockTranscript = "Sample voice input";
      onTranscript(mockTranscript);
    }, 2000);
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleVoiceInput}
      disabled={isListening}
      className={`${sizeClasses[size]} rounded-full font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center ${
        isListening
          ? 'bg-[#d4183d] text-white animate-pulse'
          : 'bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white'
      }`}
    >
      <Mic className={iconSizes[size]} />
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

export function VoiceInputField({
  value,
  onChange,
  onVoiceInput,
  placeholder,
  type = 'text',
  icon
}: VoiceInputFieldProps) {
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
      <VoiceInputButton
        onTranscript={onVoiceInput}
        size="medium"
        position="inline"
      />
    </div>
  );
}

interface VoiceConversationalPromptProps {
  prompt: string;
  onResponse: (response: string) => void;
  icon?: React.ReactNode;
}

export function VoiceConversationalPrompt({
  prompt,
  onResponse,
  icon
}: VoiceConversationalPromptProps) {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      // Mock response
      onResponse("Sample voice response");
    }, 2000);
  };

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
      <button
        onClick={handleVoiceInput}
        disabled={isListening}
        className={`w-full h-14 rounded-2xl font-semibold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 ${
          isListening
            ? 'bg-[#d4183d] text-white animate-pulse'
            : 'bg-white text-[#D2691E]'
        }`}
      >
        <Mic className="w-5 h-5" />
        {isListening ? 'Listening...' : 'Tap to Answer'}
      </button>
    </motion.div>
  );
}