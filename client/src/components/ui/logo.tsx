import React from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/images/pippin.svg" 
        alt="Pippin the unicorn" 
        className="h-full w-auto"
      />
      <span className="ml-2 font-heading font-bold text-primary">Pippin</span>
    </div>
  );
} 