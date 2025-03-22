import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface PippinHintProps {
  hint: string;
  position?: "top" | "right" | "bottom" | "left";
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  isModal?: boolean;
}

export function PippinHint({
  hint,
  position = "right",
  size = "md",
  animated = true,
  isModal = false,
}: PippinHintProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClass = {
    sm: isModal ? "w-10 h-10" : "w-8 h-8",
    md: isModal ? "w-16 h-16" : "w-12 h-12",
    lg: isModal ? "w-20 h-20" : "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`p-0 ${animated ? "hover:animate-bounce" : ""}`}
          onClick={() => setIsOpen(true)}
        >
          <div className={`relative ${sizeClass[size]}`}>
            <img
              src="/images/pippin.svg"
              alt="Pippin the unicorn"
              className="w-full h-full object-contain"
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={position}
        className="w-72 bg-pink-50 border-pink-300 shadow-md"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 flex-shrink-0">
            <img
              src="/images/pippin.svg"
              alt="Pippin"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-sm font-medium text-purple-800">
            <div className="font-bold text-pink-600 mb-1">Pippin says:</div>
            {hint}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FloatingPippinHint({
  hint,
  position = "bottom",
}: {
  hint: string;
  position?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <PippinHint hint={hint} position={position} size="lg" animated={true} />
    </div>
  );
}