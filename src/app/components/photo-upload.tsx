import { Camera, Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useLanguage } from './language-context';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoSelect: (file: File, preview: string) => void;
  onPhotoRemove?: () => void;
  size?: 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square';
}

export function PhotoUpload({
  currentPhoto,
  onPhotoSelect,
  onPhotoRemove,
  size = 'large',
  shape = 'circle'
}: PhotoUploadProps) {
  const { t } = useLanguage();
  const [preview, setPreview] = useState<string | undefined>(currentPhoto);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-40 h-40'
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-3xl'
  };

  // Compress image to reduce file size
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Check file size (5MB max before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert('La photo est trop grande (maximum 5MB)');
      return;
    }

    // Compress image
    const compressedFile = await compressImage(file);
    
    // Create preview
    const previewUrl = URL.createObjectURL(compressedFile);
    setPreview(previewUrl);
    
    onPhotoSelect(compressedFile, previewUrl);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onPhotoRemove?.();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative ${sizeClasses[size]} ${shapeClasses[shape]} overflow-hidden border-4 border-white shadow-lg`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {onPhotoRemove && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              isDragging
                ? 'bg-[#D2691E]/20'
                : 'bg-gradient-to-br from-[#D2691E]/10 to-[#E8A05D]/10 hover:from-[#D2691E]/20 hover:to-[#E8A05D]/20'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-8 h-8 text-[#D2691E]" />
            <span className="text-xs text-[#8D6E63] text-center px-2">
              {t('addPhoto')}
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-[#FFF8E7] text-[#5D4037] rounded-2xl font-medium hover:bg-[#F5E6D3] transition-colors"
      >
        <Upload className="w-4 h-4" />
        {preview ? t('changePhoto') : t('uploadPhoto')}
      </button>
      
      <p className="text-xs text-[#8D6E63] text-center">
        {t('photoWillBeCompressed')}
      </p>
    </div>
  );
}
