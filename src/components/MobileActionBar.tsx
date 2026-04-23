import { Phone, MessageSquare } from 'lucide-react';
import { OWNER_INFO } from '../constants';
import { useEffect, useState } from 'react';

export default function MobileActionBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on mobile devices
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChatClick = () => {
    document.dispatchEvent(new CustomEvent('open-jose-chat'));
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-bg-base/95 border-t border-border-accent z-[100] flex items-center px-4 gap-4 shadow-2xl backdrop-blur-xl"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        paddingTop: '8px',
        height: 'auto',
        minHeight: '72px'
      }}
    >
      <a
        href={`tel:${OWNER_INFO.phone}`}
        className="flex-1 bg-primary text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors active:scale-95"
        style={{ touchAction: 'manipulation' }}
      >
        <Phone size={16} />
        Call Jose
      </a>
      <button
        onClick={handleChatClick}
        className="flex-1 bg-bg-surface border border-border-accent rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:border-primary hover:text-primary active:scale-95"
        style={{ touchAction: 'manipulation' }}
      >
        <MessageSquare size={16} className="text-primary" />
        Chat
      </button>
    </div>
  );
}
