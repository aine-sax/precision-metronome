import React, { useState, useEffect } from 'react';
import { TimeSignature, Subdivision } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import ToggleSwitch from './ToggleSwitch';

interface ControlsProps {
  isPlaying: boolean;
  bpm: number;
  timeSignature: TimeSignature;
  subdivision: Subdivision;
  volume: number;
  accentOnFirstBeat: boolean;
  onTogglePlay: () => void;
  onBpmChange: (bpm: number) => void;
  onTimeSignatureChange: (index: number) => void;
  onSubdivisionChange: (index: number) => void;
  onVolumeChange: (volume: number) => void;
  onAccentToggle: (isAccentEnabled: boolean) => void;
  onTap: () => void;
  isTappingActive: boolean;
  displayedTapBpm: string | number; // What's shown in BPM display during tap
  minBpm: number;
  maxBpm: number;
  timeSignatures: ReadonlyArray<TimeSignature>;
  subdivisions: ReadonlyArray<Subdivision>;
  isSynced?: boolean; // Optional: for UI changes if synced
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying, bpm, timeSignature, subdivision, volume, accentOnFirstBeat,
  onTogglePlay, onBpmChange, onTimeSignatureChange, onSubdivisionChange,
  onVolumeChange, onAccentToggle, onTap, isTappingActive, displayedTapBpm,
  minBpm, maxBpm, timeSignatures, subdivisions, // isSynced is available if needed
}) => {
  const [bpmInputText, setBpmInputText] = useState<string>(bpm.toString());

  // Update BPM text input when actual BPM changes, unless actively tapping
  useEffect(() => {
    if (!isTappingActive) {
      setBpmInputText(bpm.toString());
    }
  }, [bpm, isTappingActive]);

  const handleBpmSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBpmChange(parseInt(e.target.value, 10));
  };

  // Handles direct text input for BPM
  const handleBpmTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    setBpmInputText(inputText); // Allow user to type freely

    // Attempt to parse and update BPM if it's a valid number within range
    const newBpm = parseInt(inputText, 10);
    if (!isNaN(newBpm) && newBpm >= minBpm && newBpm <= maxBpm) {
      onBpmChange(newBpm); // Update BPM in real-time if valid
    }
  };
  
  // Validates and clamps BPM on blur from text input
  const handleBpmTextBlur = () => {
    let newBpm = parseInt(bpmInputText, 10);
    if (isNaN(newBpm)) { // If input is not a number, revert to current BPM
        newBpm = bpm; 
    }
    // Clamp to min/max and update state
    const clampedBpm = Math.max(minBpm, Math.min(maxBpm, newBpm));
    onBpmChange(clampedBpm);
    setBpmInputText(clampedBpm.toString()); // Ensure input field reflects clamped value
  };

  const handleIncrementBpm = () => onBpmChange(Math.min(maxBpm, bpm + 1));
  const handleDecrementBpm = () => onBpmChange(Math.max(minBpm, bpm - 1));

  const handleTimeSignatureSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTimeSignatureChange(parseInt(e.target.value, 10));
  };

  const handleSubdivisionSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSubdivisionChange(parseInt(e.target.value, 10));
  };

  const handleVolumeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseInt(e.target.value, 10));
  };
  
  const currentTimeSignatureIndex = timeSignatures.findIndex(
    ts => ts.beatsPerMeasure === timeSignature.beatsPerMeasure && ts.noteValue === timeSignature.noteValue
  );

  const currentSubdivisionIndex = subdivisions.findIndex(
    sd => sd.value === subdivision.value
  );
  
  // Base Tailwind classes for consistent styling
  const inputBaseClasses = "w-full p-2.5 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-200 placeholder-gray-500 transition-colors text-sm";
  const labelBaseClasses = "block text-xs font-medium text-gray-400 mb-1";
  const buttonBaseClasses = "p-2.5 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900";
  const selectBgStyle = { 
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")", 
    backgroundRepeat: 'no-repeat', 
    backgroundPosition: 'right 0.5rem center', 
    backgroundSize: '1.25em 1.25em'
  };

  // Determine what to show in the BPM text field based on tapping state
  const bpmDisplayText = isTappingActive 
    ? (typeof displayedTapBpm === 'number' ? displayedTapBpm.toString() : "TAP")
    : bpmInputText;

  return (
    <div className="mt-6 space-y-5">
      {/* Main BPM Control Area */}
      <div className="flex items-center justify-between space-x-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700/60">
        <button
            onClick={handleDecrementBpm}
            className={`${buttonBaseClasses} bg-gray-700 hover:bg-gray-600 text-sky-300`}
            aria-label="Decrease BPM by 1"
        >
            <MinusIcon className="w-5 h-5"/>
        </button>
        <input
            type="text" // Using text to allow "TAP" string, inputMode for numeric keyboard
            inputMode="numeric" 
            pattern="[0-9]*" // Helps mobile browsers show numeric keyboard
            value={bpmDisplayText}
            onChange={handleBpmTextChange}
            onBlur={handleBpmTextBlur}
            className="w-20 text-center text-3xl font-mono font-bold bg-transparent text-sky-300 focus:outline-none p-1 tabular-nums"
            aria-label={`Current BPM: ${bpm}. Edit to set BPM between ${minBpm} and ${maxBpm}. Or Tap to set.`}
            aria-live="polite" // Announce changes
        />
        <button
            onClick={handleIncrementBpm}
            className={`${buttonBaseClasses} bg-gray-700 hover:bg-gray-600 text-sky-300`}
            aria-label="Increase BPM by 1"
        >
            <PlusIcon className="w-5 h-5"/>
        </button>
        <button
          onClick={onTap}
          className={`${buttonBaseClasses} flex-1 ${isTappingActive ? 'bg-orange-500 hover:bg-orange-400' : 'bg-sky-600 hover:bg-sky-500'} text-white text-lg font-semibold`}
          aria-label="Tap button to set tempo"
          aria-pressed={isTappingActive} // Indicates if tapping mode is active
        >
          {isTappingActive ? (typeof displayedTapBpm === 'number' ? displayedTapBpm : "TAP...") : "TAP"}
        </button>
      </div>

      {/* BPM Slider */}
      <div>
        <label htmlFor="bpm-slider" className="sr-only">BPM Slider</label>
        <input
          type="range"
          id="bpm-slider"
          name="bpm-slider"
          min={minBpm}
          max={maxBpm}
          value={bpm} // Controlled by actual BPM state
          onChange={handleBpmSliderChange}
          aria-label={`Beats per minute slider`}
          aria-valuemin={minBpm}
          aria-valuemax={maxBpm}
          aria-valuenow={bpm}
          aria-valuetext={`${bpm} BPM`}
        />
      </div>

      {/* Play/Pause Button */}
       <button
        onClick={onTogglePlay}
        className={`w-full flex items-center justify-center p-3.5 font-semibold rounded-lg shadow-lg transition-all duration-200 ease-in-out
                    transform active:scale-95 text-lg
                    ${isPlaying 
                      ? 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-400' 
                      : 'bg-teal-600 hover:bg-teal-500 text-white focus:ring-teal-400'}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900`}
        aria-label={isPlaying ? "Pause metronome" : "Play metronome"}
        aria-live="polite" // Announce changes to play/pause state
        aria-pressed={isPlaying}
      >
        {isPlaying ? <PauseIcon className="w-5 h-5 mr-2" /> : <PlayIcon className="w-5 h-5 mr-2" />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </button>

      {/* Settings Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 gap-y-4 pt-2">
        <div>
          <label htmlFor="time-signature" className={labelBaseClasses}>Time Signature</label>
          <select
            id="time-signature"
            value={currentTimeSignatureIndex === -1 ? '' : currentTimeSignatureIndex} // Ensure a valid value for controlled component
            onChange={handleTimeSignatureSelectChange}
            className={`${inputBaseClasses} appearance-none`}
            style={selectBgStyle}
            aria-label={`Current time signature: ${timeSignature.beatsPerMeasure} beats per measure, ${timeSignature.noteValue} note value`}
          >
            {timeSignatures.map((ts, index) => (
              <option key={`${ts.beatsPerMeasure}-${ts.noteValue}-${index}`} value={index}>
                {ts.beatsPerMeasure}/{ts.noteValue}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subdivision" className={labelBaseClasses}>Subdivision</label>
          <select
            id="subdivision"
            value={currentSubdivisionIndex === -1 ? '' : currentSubdivisionIndex}
            onChange={handleSubdivisionSelectChange}
            className={`${inputBaseClasses} appearance-none`}
            style={selectBgStyle}
            aria-label={`Current subdivision: ${subdivision.name}`}
          >
            {subdivisions.map((sd, index) => (
              <option key={`${sd.name}-${index}`} value={index}>
                {sd.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-span-2">
          <ToggleSwitch 
            id="accent-toggle"
            checked={accentOnFirstBeat}
            onChange={onAccentToggle}
            label="Accent First Beat"
          />
        </div>

        <div className="col-span-2 space-y-1">
          <label htmlFor="volume" className={labelBaseClasses}>Volume: <span className="font-semibold text-sky-400">{volume}%</span></label>
          <input
            type="range"
            id="volume"
            name="volume"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeInputChange}
            aria-label={`Volume control`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={volume}
            aria-valuetext={`${volume}%`}
          />
        </div>
      </div>
    </div>
  );
};

export default Controls;