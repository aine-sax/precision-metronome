export const AudioService = {
  playTick: (
    audioContext: AudioContext,
    timeToPlay: number,    // Precise time from audioContext.currentTime when the sound should start
    isAccent: boolean,     // True if this tick is an accented beat
    volumeFactor: number,  // Overall volume multiplier (0.0 to 1.0)
    isSubdivision: boolean // True if this tick is a subdivision (not a main beat)
  ): void => {
    if (!audioContext || volumeFactor <= 0) return; // Do nothing if no context or volume is zero

    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Sound characteristics based on beat type
    let baseFreq: number;
    let peakVolume: number;
    let attackTime = 0.002; // Very short attack for a percussive click (seconds)
    let decayTime = 0.04;  // How long the sound primarily lasts (seconds)
    let sustainTime = 0;   // No sustain for a simple click

    if (isSubdivision) {
      osc.type = 'sine';   // Softer sine wave for subdivisions
      baseFreq = 1500;     // Higher pitch
      peakVolume = volumeFactor * 0.35; // Quieter
      decayTime = 0.025;   // Shorter duration
    } else if (isAccent) {
      osc.type = 'square'; // Square wave for a sharper, more prominent accent
      baseFreq = 1000;     // Stronger, lower pitch than non-accented main beat
      peakVolume = volumeFactor * 1.0;  // Full volume for accent
      decayTime = 0.05;    // Slightly longer decay for accent
    } else { // Non-accented main beat
      osc.type = 'triangle';// Triangle wave for a clear, but not overly harsh, main beat
      baseFreq = 800;      // Standard pitch
      peakVolume = volumeFactor * 0.65; // Slightly softer than accent
    }
    
    // Set oscillator frequency
    osc.frequency.setValueAtTime(baseFreq, timeToPlay);
    
    // Envelope shaping for the click sound
    gainNode.gain.setValueAtTime(0, timeToPlay); // Start at zero volume
    gainNode.gain.linearRampToValueAtTime(peakVolume, timeToPlay + attackTime); // Quick ramp up to peak
    // Exponential decay is more natural for percussive sounds
    gainNode.gain.exponentialRampToValueAtTime(0.0001, timeToPlay + attackTime + decayTime + sustainTime);

    // Start and stop the oscillator
    osc.start(timeToPlay);
    // Stop slightly after the sound has decayed to ensure full playback and resource cleanup
    osc.stop(timeToPlay + attackTime + decayTime + sustainTime + 0.01); 
  },

  // Helper to ensure AudioContext is resumed, e.g., after user interaction
  ensureContextResumed: async (audioContext: AudioContext | null): Promise<void> => {
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch (err) {
        console.error("AudioService: Error resuming AudioContext:", err);
        // Potentially notify user or handle error appropriately
      }
    }
  }
};