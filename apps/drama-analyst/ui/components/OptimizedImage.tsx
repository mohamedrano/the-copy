import React, { useState, useRef, useEffect } from 'react';
import { imageOptimizer, OptimizedImageInfo, ImageOptimizationOptions } from '@services/imageOptimizer';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  options?: ImageOptimizationOptions;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  options = {},
  placeholder,
  fallback,
  onLoad,
  onError,
  className = '',
  ...props
}) => {
  const [imageInfo, setImageInfo] = useState<OptimizedImageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(imgRef.current);
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Generate optimized image info when in view
  useEffect(() => {
    if (isInView && src) {
      const optimized = imageOptimizer.createOptimizedImage(src, alt, options);
      setImageInfo(optimized);
    }
  }, [isInView, src, alt, options]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Show placeholder while loading
  if (isLoading && placeholder) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width: options.width, height: options.height }}
      >
        <img 
          src={placeholder}
          alt="Loading..."
          className="w-full h-full object-cover opacity-50"
        />
      </div>
    );
  }

  // Show fallback on error
  if (hasError && fallback) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  // Show loading skeleton if no placeholder
  if (isLoading && !placeholder) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse rounded ${className}`}
        style={{ width: options.width, height: options.height }}
        ref={imgRef}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageInfo?.src || src}
      srcSet={imageInfo?.srcSet}
      sizes={imageInfo?.sizes}
      alt={alt}
      loading={imageInfo?.loading || 'lazy'}
      width={imageInfo?.width || options.width}
      height={imageInfo?.height || options.height}
      className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

// Specialized components for different use cases
export const AvatarImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    options={{
      width: 40,
      height: 40,
      format: 'webp',
      quality: 80,
      ...props.options
    }}
    className={`rounded-full ${props.className || ''}`}
  />
);

export const HeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    options={{
      format: 'webp',
      quality: 85,
      preload: true,
      ...props.options
    }}
    className={`w-full h-auto ${props.className || ''}`}
  />
);

export const ThumbnailImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    options={{
      width: 150,
      height: 150,
      format: 'webp',
      quality: 75,
      ...props.options
    }}
    className={`object-cover ${props.className || ''}`}
  />
);

// Background image component
interface OptimizedBackgroundImageProps {
  src: string;
  alt: string;
  className?: string;
  options?: ImageOptimizationOptions;
  children?: React.ReactNode;
}

export const OptimizedBackgroundImage: React.FC<OptimizedBackgroundImageProps> = ({
  src,
  alt,
  className = '',
  options = {},
  children
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const optimizedSrc = imageOptimizer.optimizeImageSrc(src, options);
    setBackgroundImage(optimizedSrc);
    setIsLoaded(true);
  }, [src, options]);

  return (
    <div
      className={`relative bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        backgroundImage: isLoaded ? `url(${backgroundImage})` : undefined
      }}
      role="img"
      aria-label={alt}
    >
      {children}
    </div>
  );
};

