import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide";
  showSkeleton?: boolean;
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg",
  aspectRatio,
  showSkeleton = true,
  ...props
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const imageSrc = error ? fallbackSrc : src;

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatio && aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {showSkeleton && isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}
