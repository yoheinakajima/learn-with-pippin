import React from "react";
import { Loader2 } from "lucide-react";

interface MapSvgSkeletonProps {
  message?: string;
}

/**
 * A skeleton loading component for the MapSvg that shows a placeholder
 * with loading animation while the map resources are being loaded
 */
export function MapSvgSkeleton({ message = "Loading map..." }: MapSvgSkeletonProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg animate-pulse">
      <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-white/80 shadow-lg border">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-lg font-medium">{message}</p>
        
        {/* Placeholder for map nodes */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="bg-gray-200 rounded-full h-10 w-10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A fallback component that automatically tries to load a background image
 * and shows a skeleton in the meantime
 */
export function MapSvgFallback({ 
  backgroundSrc,
  children 
}: { 
  backgroundSrc: string; 
  children: React.ReactNode 
}) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  React.useEffect(() => {
    // Preload the image
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      console.warn(`Failed to load background image: ${backgroundSrc}`);
      // Still mark as loaded to avoid blocking the UI
      setImageLoaded(true);
    };
    img.src = backgroundSrc;
  }, [backgroundSrc]);
  
  if (!imageLoaded) {
    return <MapSvgSkeleton message="Loading map background..." />;
  }
  
  return <>{children}</>;
} 