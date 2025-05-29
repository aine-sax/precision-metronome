import React from 'react';
// Needle import removed

interface VisualizerProps {
  bpm: number;
  currentBeat: number;
  beatsPerMeasure: number;
  noteValue: number; 
  isTappingActive: boolean;
  displayedTapBpm: string | number; 
  // needleAngle and needleTransitionDuration props removed
}

const Visualizer: React.FC<VisualizerProps> = ({ 
  bpm, currentBeat, beatsPerMeasure, noteValue, 
  isTappingActive, displayedTapBpm
}) => {
  
  const bpmDisplayValue = isTappingActive 
    ? (typeof displayedTapBpm === 'number' ? displayedTapBpm : displayedTapBpm.toString().toUpperCase())
    : bpm;

  const bpmLabelText = isTappingActive && typeof displayedTapBpm === 'string' && displayedTapBpm.toUpperCase() === 'TAP'
    ? "TAP"
    : bpmDisplayValue.toString();

  return (
    <div 
      className="relative w-full max-w-[280px] sm:max-w-xs mx-auto mb-4 h-64"
      role="timer" 
      aria-live="off" 
      aria-label={`Metronome visualizer. Current BPM: ${bpm}. Time signature: ${beatsPerMeasure}/${noteValue}. Current beat: ${currentBeat > 0 ? currentBeat : 'none'}. Visual beat indicators at the top.`}
      aria-roledescription="Metronome visual display with light indicators"
    >
      {/* Central pivot point removed */}

      {/* Beat Indicators - Moved to top and enlarged */}
      <div 
        className="absolute top-[15%] left-1/2 -translate-x-1/2 flex items-center justify-center space-x-5 z-20 pointer-events-none"
        aria-hidden="true" 
      >
        {Array.from({ length: beatsPerMeasure }).map((_, index) => (
          <div
            key={`beat-indicator-${index}`}
            className={`w-10 h-10 rounded-full transition-all duration-150 ease-in-out border-2
                        ${currentBeat === index + 1 
                          ? 'bg-sky-400 border-sky-300 scale-110 shadow-[0_0_12px_theme(colors.sky.400)]' 
                          : 'bg-gray-600 border-gray-500 opacity-50'}`}
          ></div>
        ))}
      </div>
      
      {/* Current Beat Number Display - Repositioned below indicators */}
       <div 
        className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none"
        aria-label={`Current beat indicator: ${currentBeat > 0 ? currentBeat : 'Inactive'} of ${beatsPerMeasure}`}
      >
        <span className="text-5xl font-mono font-extrabold text-gray-400/80 drop-shadow-lg">
          {currentBeat > 0 ? currentBeat : '-'}
        </span>
      </div>
      
      {/* BPM Display - Repositioned below current beat */}
      <div className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 
                      text-center z-20 pointer-events-none flex flex-col items-center">
        <div className={`font-mono font-bold tabular-nums tracking-tight
                        text-shadow drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]
                        ${isTappingActive && typeof displayedTapBpm === 'string' && displayedTapBpm.toUpperCase() !== 'TAP...' ? 'text-5xl text-orange-400' : 'text-6xl text-sky-300'}`}>
          {bpmLabelText}
        </div>
        {!isTappingActive && <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">BPM</div>}
      </div>
      
      {/* Needle Container removed */}
    </div>
  );
};

export default Visualizer;