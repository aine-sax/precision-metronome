import React from 'react';

interface ToggleSwitchProps {
  id: string; // Unique ID for the switch, links label and button
  checked: boolean; // Current state of the switch
  onChange: (checked: boolean) => void; // Callback when the switch state changes
  label: string; // Visible label for the switch
  srLabel?: string; // Optional screen-reader-specific label if different from visible label
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, srLabel }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  // Use a button element for better semantics and keyboard accessibility
  return (
    <div className="flex items-center justify-between">
      <label 
        htmlFor={id} 
        className="text-sm font-medium text-gray-300 cursor-pointer select-none pr-3" // Added padding-right
      >
        {label}
      </label>
      <button
        type="button"
        id={id}
        role="switch" // ARIA role for a toggle switch
        aria-checked={checked} // Indicates the current state of the switch
        aria-label={srLabel || label} // Provides an accessible name
        onClick={handleToggle}
        className={`${
          checked ? 'bg-sky-500' : 'bg-gray-600'
        } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out 
           focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
      >
        <span className="sr-only">{checked ? "Enabled" : "Disabled"}</span> {/* For screen readers */}
        <span
          aria-hidden="true" // Thumb is decorative
          className={`${
            checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;