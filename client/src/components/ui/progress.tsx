import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all duration-700 relative animated-progress"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: 'linear-gradient(90deg, var(--progress-color-start, hsl(210, 100%, 60%)), var(--progress-color-mid, hsl(280, 100%, 65%)), var(--progress-color-end, hsl(330, 100%, 60%)))',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite, pulse 1s ease-in-out'
      }}
    >
      <div className="absolute top-0 right-0 w-1 h-full bg-white opacity-40 blur-sm" 
           style={{ transform: 'translateX(1px)' }}></div>
    </ProgressPrimitive.Indicator>
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: 100% 0; }
        100% { background-position: 0 0; }
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0px rgba(255, 255, 255, 0.3); }
        50% { box-shadow: 0 0 10px rgba(220, 220, 255, 0.6); }
        100% { box-shadow: 0 0 0px rgba(255, 255, 255, 0.3); }
      }
      
      .animated-progress {
        box-shadow: 0 0 6px rgba(180, 220, 255, 0.5);
      }
    `}</style>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
