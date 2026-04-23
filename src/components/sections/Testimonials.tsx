import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { TESTIMONIALS } from '../../constants';

const AUTO_ROTATE_INTERVAL = 6000; // 6 seconds

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const nextSlide = useCallback(() => {
    if (!isMounted.current) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prevSlide = useCallback(() => {
    if (!isMounted.current) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (!isMounted.current) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Auto-rotation with proper cleanup
  useEffect(() => {
    if (isPaused || prefersReducedMotion) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      nextSlide();
    }, AUTO_ROTATE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, prefersReducedMotion, nextSlide]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Keyboard navigation with proper focus management
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSlide();
        break;
      case ' ':
        e.preventDefault();
        setIsPaused((prev) => !prev);
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(TESTIMONIALS.length - 1);
        break;
    }
  }, [nextSlide, prevSlide, goToSlide]);

  // Touch handlers with passive event support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 50; // minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  }, [nextSlide, prevSlide]);

  // Mouse drag handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - e.clientX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  }, [nextSlide, prevSlide]);

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section className="py-32 bg-bg-base overflow-hidden" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-16 space-y-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-black text-primary uppercase tracking-[0.4em]"
            id="testimonials-heading"
          >
            Client Experiences
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-0 leading-none uppercase"
          >
            Success <span className="text-primary">Stories</span>
          </motion.h3>
        </div>

        {/* Carousel */}
        <div
          ref={containerRef}
          className="relative max-w-4xl mx-auto select-none"
          role="region"
          aria-roledescription="carousel"
          aria-label="Testimonials"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div className="overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeInOut' }}
                className="card-surface p-8 md:p-12 relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                role="group"
                aria-roledescription="slide"
                aria-label={`${currentIndex + 1} of ${TESTIMONIALS.length}`}
              >
                <div className="absolute top-6 right-6 text-primary/10">
                  <Quote size={64} />
                </div>

                <div className="relative z-10">
                  <blockquote className="text-xl md:text-2xl leading-relaxed italic text-text-muted mb-8">
                    "{currentTestimonial.text}"
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <img
                      src={currentTestimonial.avatar}
                      alt=""
                      loading="lazy"
                      className="w-14 h-14 rounded-full border-2 border-primary object-cover"
                    />
                    <div>
                      <h4 className="font-black uppercase tracking-tight text-lg">
                        {currentTestimonial.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        {currentTestimonial.logo && (
                          <img
                            src={currentTestimonial.logo}
                            alt=""
                            className="w-5 h-5 rounded-sm object-contain opacity-70"
                          />
                        )}
                        <p className="text-xs uppercase font-bold text-primary tracking-widest">
                          {currentTestimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full border border-border-accent hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Previous testimonial"
              disabled={TESTIMONIALS.length <= 1}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    i === currentIndex ? 'bg-primary w-6' : 'bg-border-accent hover:bg-text-muted'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === currentIndex ? 'true' : 'false'}
                  disabled={TESTIMONIALS.length <= 1}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-3 rounded-full border border-border-accent hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Next testimonial"
              disabled={TESTIMONIALS.length <= 1}
            >
              <ChevronRight size={24} />
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 rounded-full border border-border-accent hover:border-primary hover:text-primary transition-colors ml-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
              title={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
          </div>

          {/* Status indicator */}
          <p className="sr-only" aria-live="polite">
            Showing testimonial {currentIndex + 1} of {TESTIMONIALS.length}
          </p>
        </div>
      </div>
    </section>
  );
}
