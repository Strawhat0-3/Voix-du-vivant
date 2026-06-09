import { useState, useRef, useEffect, memo, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  priority?: boolean;
}

/**
 * Optimized image component with lazy loading, blur-up effect, and error handling.
 * Implements best practices for web performance and accessibility.
 */
const OptimizedImage = memo(({
  src,
  alt,
  fallback = "/placeholder.svg",
  aspectRatio = "auto",
  priority = false,
  className,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  const imageSrc = hasError ? fallback : src;

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {/* Placeholder blur */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
