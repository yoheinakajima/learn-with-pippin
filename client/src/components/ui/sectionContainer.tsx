import React, { ReactNode } from "react";

interface SectionContainerProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const SectionContainer = ({ 
  title, 
  children, 
  className = "" 
}: SectionContainerProps) => {
  return (
    <div className={`mb-6 bg-white rounded-md shadow-md ${className}`}>
      {title ? (
        <>
          <div className="p-4">
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <hr className="border-gray-200 mx-2 mb-2" />
        </>
      ) : null}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export { SectionContainer }