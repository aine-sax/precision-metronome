import { useEffect, useRef, useCallback } from 'react';
import { TimeSignature, Subdivision } from '../types';
import { AudioService } from '../services/AudioService';

// Constants for the Web Audio scheduler
const LOOKAHEAD_MS = 25.0; // How often the scheduler function runs (milliseconds)
const SCHEDULE_AHEAD_TIME_S = 0.1; // How far ahead to schedule audio events (seconds)

interface MetronomeEngineProps {
  audioContext: AudioContext | null; // Pass AudioContext instance
  isPlaying: boolean;
  bpm: number;
  timeSignature: TimeSignature;
  subdivision: Subdivision;
  volume: number; // Percentage (0-100)
  onBeat: (beatNumber: number) => void; // Callback for each main beat
  accentOnFirstBeat: boolean;
}

export function useMetronomeEngine({
  audioContext, // Use the passed AudioContext
  isPlaying,
  bpm,
  timeSignature,
  subdivision,
  volume,
  onBeat,
  accentOnFirstBeat,
}: MetronomeEngineProps): void {
  const currentMainBeatInMeasureRef = useRef<number>(1);
  const nextBeatTimeRef = useRef<number>(0); // Time of the next beat to be scheduled
  const schedulerTimerIdRef = useRef<number | null>(null); // ID for setInterval
  
  // Memoize onBeat callback to ensure stability if its definition doesn't change
  const stableOnBeat = useCallback(onBeat, [onBeat]);

  // Scheduler function: schedules audio events in advance
  const scheduleSounds = useCallback(() => {
    if (!audioContext || !isPlaying || bpm <= 0) return; 

    const secondsPerMainBeat = 60.0 / bpm;
    // subdivision.value: 1 (Quarter), 2 (Eighth), 3 (Triplet), 4 (Sixteenth)
    const subdivisionTicksPerMainBeat = subdivision.value; 

    // Loop as long as the next beat time is within the scheduling window
    while (nextBeatTimeRef.current < audioContext.currentTime + SCHEDULE_AHEAD_TIME_S) {
      const isFirstBeatOfMeasure = currentMainBeatInMeasureRef.current === 1;
      const playAccent = isFirstBeatOfMeasure && accentOnFirstBeat;

      // Schedule the main beat
      AudioService.playTick(
        audioContext,
        nextBeatTimeRef.current,
        playAccent,
        volume / 100, // Convert volume from 0-100 to 0.0-1.0
        false // isSubdivision = false for main beats
      );
      stableOnBeat(currentMainBeatInMeasureRef.current); // Notify for main beat

      // Schedule subdivision ticks if subdivisionTicksPerMainBeat > 1
      if (subdivisionTicksPerMainBeat > 1) {
        const secondsPerSubBeat = secondsPerMainBeat / subdivisionTicksPerMainBeat;
        // Loop for the intermediate subdivision ticks (e.g., 2nd and 3rd ticks for triplets)
        for (let i = 1; i < subdivisionTicksPerMainBeat; i++) { 
          const subBeatTime = nextBeatTimeRef.current + (secondsPerSubBeat * i);
          AudioService.playTick(
            audioContext,
            subBeatTime,
            false, // Subdivisions are never accented
            volume / 100,
            true // isSubdivision = true
          );
        }
      }
      
      // Advance to the next main beat time
      nextBeatTimeRef.current += secondsPerMainBeat;
      // Update the beat counter for the measure
      currentMainBeatInMeasureRef.current = (currentMainBeatInMeasureRef.current % timeSignature.beatsPerMeasure) + 1;
    }
  }, [audioContext, isPlaying, bpm, timeSignature.beatsPerMeasure, volume, stableOnBeat, subdivision.value, accentOnFirstBeat]);

  // Main effect for starting/stopping the metronome scheduler
  useEffect(() => {
    if (!audioContext) return;

    const startMetronomeScheduler = () => {
      currentMainBeatInMeasureRef.current = 1; // Reset beat count for the measure
      // Start scheduling slightly in the future to ensure audio context is primed
      nextBeatTimeRef.current = audioContext.currentTime + 0.05; 
      
      if (schedulerTimerIdRef.current) {
        clearInterval(schedulerTimerIdRef.current); // Clear any existing timer
      }
      scheduleSounds(); // Initial call to schedule first batch of sounds
      schedulerTimerIdRef.current = window.setInterval(scheduleSounds, LOOKAHEAD_MS);
    };

    if (isPlaying) {
      if (audioContext.state === 'suspended') {
        // Attempt to resume AudioContext if it was suspended (e.g., by browser auto-play policy)
        audioContext.resume().then(startMetronomeScheduler).catch(err => console.error("Error resuming AudioContext:", err));
      } else {
        startMetronomeScheduler();
      }
    } else { // If not playing
      if (schedulerTimerIdRef.current) {
        clearInterval(schedulerTimerIdRef.current);
        schedulerTimerIdRef.current = null;
      }
    }

    // Cleanup function: clear interval when component unmounts or dependencies change
    return () => {
      if (schedulerTimerIdRef.current) {
        clearInterval(schedulerTimerIdRef.current);
        schedulerTimerIdRef.current = null;
      }
    };
  // 'scheduleSounds' is a key dependency as its definition changes with BPM, time sig, etc.
  }, [audioContext, isPlaying, scheduleSounds]); 

  // Effect to reset and resync the metronome if critical parameters (BPM, time signature, etc.)
  // change *while* the metronome is playing.
  useEffect(() => {
    if (isPlaying && audioContext && audioContext.state === 'running') { 
      // If playing and parameters change, reset timing and restart scheduler
      // This ensures the metronome adapts immediately to new settings.
      currentMainBeatInMeasureRef.current = 1;
      nextBeatTimeRef.current = audioContext.currentTime + 0.05; // Start scheduling slightly ahead

      if (schedulerTimerIdRef.current) {
        clearInterval(schedulerTimerIdRef.current);
      }
      scheduleSounds(); // Call scheduleSounds immediately with new parameters
      schedulerTimerIdRef.current = window.setInterval(scheduleSounds, LOOKAHEAD_MS); 
    }
  // This effect depends on parameters that affect scheduling.
  // 'scheduleSounds' is included because its internal logic depends on these parameters.
  // 'isPlaying' ensures this only runs when relevant.
  // 'audioContext' is included to ensure it's available.
  }, [bpm, timeSignature.beatsPerMeasure, subdivision.value, accentOnFirstBeat, isPlaying, scheduleSounds, audioContext]); 
}