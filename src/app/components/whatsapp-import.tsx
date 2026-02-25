import { ArrowLeft, MessageCircle, CheckCircle, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './language-context';

export function WhatsAppImport() {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Simulated WhatsApp contacts
  const whatsappContacts = [
    { id: '1', name: 'Kwame Mensah', phone: '+233 24 123 4567', photo: '👨🏿', inGroup: true },
    { id: '2', name: 'Abena Osei', phone: '+233 24 234 5678', photo: '👩🏿', inGroup: true },
    { id: '3', name: 'Kofi Asante', phone: '+233 24 345 6789', photo: '👨🏿', inGroup: true },
    { id: '4', name: 'Ama Boateng', phone: '+233 24 456 7890', photo: '👵🏿', inGroup: true },
    { id: '5', name: 'Yaw Johnson', phone: '+233 24 567 8901', photo: '👴🏿', inGroup: true },
    { id: '6', name: 'Efua Mensah', phone: '+233 24 678 9012', photo: '👧🏿', inGroup: false },
  ];

  const handleConnect = () => {
    // Simulate WhatsApp connection
    setTimeout(() => {
      setIsConnected(true);
    }, 1500);
  };

  const toggleContact = (id: string) => {
    setSelectedContacts(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedContacts(whatsappContacts.map(c => c.id));
  };

  if (!isConnected) {
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
              <h1 className="text-xl font-bold text-[#5D4037]">WhatsApp Import</h1>
              <p className="text-sm text-[#8D6E63]">Connect your account</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-sm">
              {/* WhatsApp icon */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <MessageCircle className="w-14 h-14 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-[#5D4037] text-center mb-3">
                Connect WhatsApp
              </h2>
              <p className="text-[#8D6E63] text-center mb-8 leading-relaxed">
                Import names and phone numbers from your family WhatsApp group. 
                The fastest way to build your tree.
              </p>

              {/* Benefits */}
              <div className="bg-white rounded-3xl p-6 shadow-md mb-6 space-y-4">
                <div className="flex gap-3">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <h4 className="font-semibold text-[#5D4037] mb-1">Super Fast</h4>
                    <p className="text-sm text-[#8D6E63]">Import dozens of family members in seconds</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">🔐</div>
                  <div>
                    <h4 className="font-semibold text-[#5D4037] mb-1">Private & Secure</h4>
                    <p className="text-sm text-[#8D6E63]">Your data stays encrypted and private</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">👥</div>
                  <div>
                    <h4 className="font-semibold text-[#5D4037] mb-1">Already Organized</h4>
                    <p className="text-sm text-[#8D6E63]">Most families already use WhatsApp groups</p>
                  </div>
                </div>
              </div>

              {/* Privacy notice */}
              <div className="bg-[#E8A05D]/10 rounded-2xl p-4 mb-6">
                <p className="text-xs text-[#5D4037] leading-relaxed">
                  <span className="font-semibold">Privacy first:</span> We only access names and phone numbers 
                  from groups you choose. No messages or media are ever read or stored.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnect}
            className="w-full h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-3xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <MessageCircle className="w-6 h-6" />
            Connect WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/input-methods">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Select Family Members</h1>
            <p className="text-sm text-white/80">From: Johnson Family 👨‍👩‍👧‍👦</p>
          </div>
        </div>

        {/* Selection summary */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{selectedContacts.length} selected</span>
          </div>
          <button
            onClick={selectAll}
            className="text-sm font-medium text-white underline"
          >
            Select All
          </button>
        </div>
      </div>

      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          {whatsappContacts.map((contact, index) => (
            <div key={contact.id}>
              <button
                onClick={() => toggleContact(contact.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-[#FFF8E7] transition-colors active:scale-98"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8A05D] to-[#D2691E] flex items-center justify-center text-2xl flex-shrink-0">
                  {contact.photo}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#5D4037]">{contact.name}</span>
                    {contact.inGroup && (
                      <span className="text-xs bg-[#25D366]/10 text-[#25D366] px-2 py-0.5 rounded-full font-medium">
                        In group
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#8D6E63]">{contact.phone}</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedContacts.includes(contact.id)
                    ? 'bg-[#25D366] border-[#25D366]'
                    : 'border-[#8D6E63]/30'
                }`}>
                  {selectedContacts.includes(contact.id) && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </div>
              </button>
              {index < whatsappContacts.length - 1 && (
                <div className="h-px bg-[#5D4037]/5 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Help text */}
        <div className="bg-[#E8A05D]/10 rounded-2xl p-4 mt-4">
          <p className="text-sm text-[#5D4037]">
            <span className="font-semibold">💡 Next step:</span> We'll ask you to specify each person's 
            relationship to you (parent, sibling, grandparent, etc.)
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 bg-white border-t border-[#5D4037]/10">
        <Link to="/home">
          <button
            disabled={selectedContacts.length === 0}
            className="w-full h-16 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-3xl font-semibold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import {selectedContacts.length} Member{selectedContacts.length !== 1 ? 's' : ''}
          </button>
        </Link>
      </div>
    </div>
  );
}