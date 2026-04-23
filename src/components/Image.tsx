import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
  fetchPriority?: 'high' | 'low' | 'auto';
  maxRetries?: number;
  sizes?: string;
  srcSet?: string;
}

const MAX_RETRY_COUNT = 3;

export default function Image({
  src,
  alt,
  className = '',
  loading = 'lazy',
  placeholderColor = 'var(--bg-surface)',
  onLoad,
  onError,
  fetchPriority = 'auto',
  maxRetries = MAX_RETRY_COUNT,
  sizes,
  srcSet,
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const [retryKey, setRetryKey] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    // Setup intersection observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px', threshold: 0.01 }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loading]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  }, [onError]);

  const handleRetry = useCallback(() => {
    if (retryCount >= maxRetries) {
      console.warn(`Image failed to load after ${maxRetries} retries:`, src);
      return;
    }
    setHasError(false);
    setIsLoaded(false);
    setRetryCount(prev => prev + 1);
    // Force re-render by incrementing retry key
    setRetryKey(prev => prev + 1);
  }, [retryCount, maxRetries, src]);

  // Generate placeholder style
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: placeholderColor,
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease',
  };

  if (hasError) {
    const canRetry = retryCount < maxRetries;
    return (
      <div
        className={`${className} flex flex-col items-center justify-center bg-bg-surface text-text-muted ${canRetry ? 'cursor-pointer' : ''}`}
        onClick={canRetry ? handleRetry : undefined}
        role={canRetry ? 'button' : undefined}
        tabIndex={canRetry ? 0 : undefined}
        onKeyDown={(e) => canRetry && e.key === 'Enter' && handleRetry()}
        aria-label={canRetry ? `Failed to load image: ${alt}. Click to retry` : `Failed to load image: ${alt}`}
      >
        <AlertCircle size={32} className="mb-2 text-primary/50" />
        <span className="text-xs">{canRetry ? 'Click to retry' : 'Failed to load'}</span>
        {retryCount > 0 && <span className="text-[10px] mt-1 opacity-50">Attempt {retryCount + 1}/{maxRetries + 1}</span>}
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`${className} relative overflow-hidden`}>
      {/* Placeholder */}
      <div
        className="absolute inset-0"
        style={placeholderStyle}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Actual image */}
      {isInView && (
        <img
          key={retryKey}
          src={`${src}${retryKey > 0 ? (src.includes('?') ? '&' : '?') + `retry=${retryKey}` : ''}`}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
        />
      )}
    </div>
  );
}
