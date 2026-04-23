import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { THEMES } from '../constants';
import { Theme } from '../types';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const currentThemeData = THEMES.find(t => t.id === currentTheme);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-3 py-1.5 bg-bg-surface/50 rounded-full border border-border-accent cursor-pointer hover:bg-bg-surface transition-colors"
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span
          className="w-2.5 h-2.5 rounded-full transition-colors"
          style={{ backgroundColor: currentThemeData?.color }}
        />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          {currentThemeData?.name}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform text-accent ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-bg-surface border border-border-accent rounded-xl shadow-2xl overflow-hidden z-[60]"
            role="listbox"
            aria-label="Theme options"
          >
            <div className="p-1 space-y-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onThemeChange(theme.id);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={currentTheme === theme.id}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors uppercase tracking-widest font-bold ${
                    currentTheme === theme.id ? 'bg-primary text-bg-base' : 'text-text-base hover:bg-white/5'
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  {theme.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
