import { ArrowLeft, Camera, CheckCircle, Loader } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './language-context';

type ScanState = 'idle' | 'scanning' | 'success';

export function PhotoScan() {
  const { t } = useLanguage();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleScan = () => {
    setScanState('scanning');
    
    // Simulate AI processing
    setTimeout(() => {
      setScanState('success');
      setExtractedData({
        name: 'Kwame Mensah',
        birthDate: 'January 15, 1945',
        birthPlace: 'Kumasi, Ghana',
        documentType: 'Birth Certificate'
      });
    }, 3000);
  };

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#5D4037]/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/input-methods">
            <button className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#D2691E]">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#5D4037]">Photo Scan</h1>
            <p className="text-sm text-[#8D6E63]">AI-powered document reader</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {scanState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              {/* Instructions */}
              <div className="bg-white rounded-3xl p-6 shadow-md mb-6">
                <h3 className="text-lg font-bold text-[#5D4037] mb-4">How it works:</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0 text-[#D2691E] font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="text-[#5D4037] font-medium">Take a photo</p>
                      <p className="text-sm text-[#8D6E63]">Capture your document clearly</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0 text-[#D2691E] font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="text-[#5D4037] font-medium">AI extracts info</p>
                      <p className="text-sm text-[#8D6E63]">We read names, dates, and places</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D2691E]/10 flex items-center justify-center flex-shrink-0 text-[#D2691E] font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="text-[#5D4037] font-medium">Review & confirm</p>
                      <p className="text-sm text-[#8D6E63]">Check the details and save</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document examples */}
              <div className="bg-gradient-to-br from-[#E8A05D]/20 to-[#D2691E]/20 rounded-3xl p-6 mb-6">
                <h4 className="text-sm font-semibold text-[#5D4037] mb-3">Works with:</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl p-3 text-center">
                    <div className="text-3xl mb-2">📄</div>
                    <div className="text-xs text-[#5D4037] font-medium">Birth Certificates</div>
                  </div>
                  <div className="bg-white rounded-2xl p-3 text-center">
                    <div className="text-3xl mb-2">🎫</div>
                    <div className="text-xs text-[#5D4037] font-medium">ID Cards</div>
                  </div>
                  <div className="bg-white rounded-2xl p-3 text-center">
                    <div className="text-3xl mb-2">📝</div>
                    <div className="text-xs text-[#5D4037] font-medium">Handwritten Records</div>
                  </div>
                </div>
              </div>

              {/* Camera preview placeholder */}
              <div className="flex-1 bg-gradient-to-b from-[#5D4037] to-[#3E2723] rounded-3xl flex items-center justify-center min-h-[300px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+Cjwvc3ZnPg==')] opacity-50" />
                <div className="text-center z-10">
                  <Camera className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 text-sm">Camera preview will appear here</p>
                </div>
                
                {/* Scan frame */}
                <div className="absolute inset-8 border-4 border-white/30 rounded-3xl" style={{
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                }}>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
                </div>
              </div>
            </motion.div>
          )}

          {scanState === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-6"
                >
                  <Loader className="w-16 h-16 text-[#D2691E] mx-auto" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#5D4037] mb-2">Scanning Document...</h3>
                <p className="text-[#8D6E63]">Our AI is reading the information</p>
                
                <div className="mt-6 space-y-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 text-sm text-[#2E7D32]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Document detected</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="flex items-center gap-2 text-sm text-[#2E7D32]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Extracting text</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="flex items-center gap-2 text-sm text-[#2E7D32]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Identifying fields</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {scanState === 'success' && extractedData && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Success message */}
              <div className="bg-gradient-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-6 text-center text-white">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-1">Successfully Scanned!</h3>
                <p className="text-white/90 text-sm">Review the extracted information below</p>
              </div>

              {/* Extracted data */}
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-[#5D4037] mb-4">Extracted Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#8D6E63] uppercase tracking-wide">Full Name</label>
                    <input 
                      type="text" 
                      value={extractedData.name}
                      className="w-full mt-1 p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-[#8D6E63] uppercase tracking-wide">Birth Date</label>
                    <input 
                      type="text" 
                      value={extractedData.birthDate}
                      className="w-full mt-1 p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-[#8D6E63] uppercase tracking-wide">Birth Place</label>
                    <input 
                      type="text" 
                      value={extractedData.birthPlace}
                      className="w-full mt-1 p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-[#8D6E63] uppercase tracking-wide">Document Type</label>
                    <input 
                      type="text" 
                      value={extractedData.documentType}
                      className="w-full mt-1 p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Relation selection */}
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-[#5D4037] mb-4">Relationship to You</h3>
                <select className="w-full p-3 bg-[#FFF8E7] rounded-xl text-[#5D4037] font-medium">
                  <option>Select relationship...</option>
                  <option>Grandparent</option>
                  <option>Parent</option>
                  <option>Sibling</option>
                  <option>Uncle/Aunt</option>
                  <option>Cousin</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setScanState('idle')}
                  className="flex-1 h-14 bg-white border-2 border-[#5D4037]/20 text-[#5D4037] rounded-2xl font-semibold active:scale-95 transition-transform"
                >
                  Scan Another
                </button>
                <Link to="/home" className="flex-1">
                  <button className="w-full h-14 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold active:scale-95 transition-transform">
                    Save & Continue
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      {scanState === 'idle' && (
        <div className="p-6 bg-white border-t border-[#5D4037]/10">
          <button
            onClick={handleScan}
            className="w-full h-16 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-3xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <Camera className="w-6 h-6" />
            Take Photo
          </button>
        </div>
      )}
    </div>
  );
}