import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Menu, X, ChevronUp } from 'lucide-react';
import { OWNER_INFO } from '../constants';
import { Theme } from '../types';
import ThemeSelector from './ThemeSelector';
import EmergencyBanner from './EmergencyBanner';
import Footer from './Footer';
import MobileActionBar from './MobileActionBar';
import SkipToContent from './SkipToContent';

interface LayoutProps {
  children: React.ReactNode;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const navLinks = [
  { name: 'Services', href: '#services' },
  { name: 'Fleet', href: '#equipment' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function Layout({ children, theme, onThemeChange }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      if (isMounted.current) {
        setPrefersReducedMotion(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Fix mobile 100vh issue - dynamically set CSS variable for viewport height
  useEffect(() => {
    isMounted.current = true;

    const setVH = () => {
      // Use visual viewport height if available, otherwise fallback to window height
      const vh = window.visualViewport
        ? window.visualViewport.height * 0.01
        : window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVH);
    }

    return () => {
      isMounted.current = false;
      window.removeEventListener('resize', setVH);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setVH);
      }
    };
  }, []);

  // Handle scroll for navbar styling and hide/show with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && isMounted.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Show/hide based on scroll direction (threshold of 10px)
          if (currentScrollY > lastScrollY + 10 && currentScrollY > 200) {
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY - 10 || currentScrollY <= 200) {
            setIsVisible(true);
          }

          setIsScrolled(currentScrollY > 50);
          setShowScrollTop(currentScrollY > 500);
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [lastScrollY]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen && isMounted.current) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const handleNavClick = useCallback((href: string) => {
    setIsMenuOpen(false);

    // Small delay to allow menu to close before scrolling
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        const offset = 140; // Account for sticky header + emergency banner
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    }, 100);
  }, [prefersReducedMotion]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }, [prefersReducedMotion]);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTop();
  }, [scrollToTop]);

  const emergencyBannerHeight = 40; // Height of emergency banner

  return (
    <div
      className="min-h-screen text-text-base"
      style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <SkipToContent />
      <EmergencyBanner />

      {/* Navigation */}
      <motion.nav
        className={`sticky z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-bg-base/95 backdrop-blur-lg border-b border-border-accent py-2 shadow-lg'
            : 'bg-transparent py-4'
        }`}
        style={{ top: `${emergencyBannerHeight}px` }} // Account for emergency banner
        initial={{ y: 0 }}
        animate={{
          y: isVisible ? 0 : -100,
        }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <motion.a
            href="#"
            onClick={handleLogoClick}
            className="flex items-center gap-2 group cursor-pointer"
            whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
          >
            <div className="bg-primary px-3 py-2 rounded flex items-center justify-center font-black text-2xl text-bg-base transform transition-transform group-hover:rotate-12">
              AAA
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight leading-none uppercase">On Time Electric</span>
              <span className="text-xs tracking-[0.15em] uppercase text-accent font-bold hidden sm:block">José L. Saladin</span>
            </div>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="text-sm font-semibold hover:text-primary transition-colors tracking-wide uppercase relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
            <ThemeSelector currentTheme={theme} onThemeChange={onThemeChange} />
            <a
              href={`tel:${OWNER_INFO.phone}`}
              className="btn-primary flex items-center gap-2 text-sm"
              aria-label={`Call ${OWNER_INFO.phone}`}
            >
              <Phone size={18} />
              <span className="hidden lg:inline">Call Now</span>
            </a>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeSelector currentTheme={theme} onThemeChange={onThemeChange} />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              style={{ top: `${emergencyBannerHeight + (isScrolled ? 56 : 72)}px` }}
            />

            {/* Menu */}
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-bg-surface border-b border-border-accent overflow-hidden fixed left-0 right-0 z-40 shadow-2xl"
              style={{ top: `${emergencyBannerHeight + (isScrolled ? 56 : 72)}px` }}
            >
              <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="text-xl font-bold hover:text-primary transition-colors flex items-center justify-between py-2"
                  >
                    {link.name}
                    <span className="text-primary text-sm">→</span>
                  </motion.a>
                ))}

                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  href={`tel:${OWNER_INFO.phone}`}
                  className="btn-primary flex items-center justify-center gap-2 text-lg py-4 mt-4"
                >
                  <Phone size={24} />
                  Call José Now
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main id="main-content" className="relative" tabIndex={-1}>
        {children}
      </main>

      <Footer />
      <MobileActionBar />

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 p-3 bg-bg-surface border border-border-accent rounded-full shadow-lg hover:border-primary hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Scroll to top"
            whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
          >
            <ChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
