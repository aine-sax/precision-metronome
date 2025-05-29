import React, { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  initiallyOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Generate a unique ID for ARIA controls, safer for multiple instances
  const contentId = `collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="border border-gray-700/70 rounded-lg bg-gray-800/30 shadow-md">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-3 text-left text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-inset transition-colors rounded-t-lg"
        aria-expanded={isOpen}
        aria-controls={contentId} // Links button to the content area
      >
        <span className="font-semibold text-sm">{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true" // Decorative icon
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div 
          id={contentId} 
          className="p-4 border-t border-gray-700/50 bg-gray-800/20 rounded-b-lg"
          role="region" // Content area role
          // aria-labelledby removed as button doesn't have a matching id
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;