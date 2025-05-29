import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TimeSignature, TIME_SIGNATURES, Subdivision, SUBDIVISIONS, SyncMessage, FullSyncState } from '../types';
import { 
  DEFAULT_BPM, MIN_BPM, MAX_BPM, DEFAULT_TIME_SIGNATURE, 
  DEFAULT_SUBDIVISION, DEFAULT_VOLUME, 
  DEFAULT_SYNC_JOIN_BPM, MOCK_SESSION_ID_LENGTH,
  TAP_TIMEOUT_MS, MIN_TAPS_FOR_BPM_CALCULATION, MAX_TAP_HISTORY,
  DEFAULT_ACCENT_ON_FIRST_BEAT
} from '../constants';
import { useMetronomeEngine } from '../hooks/useMetronomeEngine';
import Controls from './Controls';
import Visualizer from './Visualizer';
import SyncControls from './SyncControls';
import CollapsibleSection from './CollapsibleSection';
import { AudioService } from '../services/AudioService'; // Import AudioService for ensureContextResumed

const MetronomeDisplay: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>(DEFAULT_TIME_SIGNATURE);
  const [subdivision, setSubdivision] = useState<Subdivision>(DEFAULT_SUBDIVISION);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [accentOnFirstBeat, setAccentOnFirstBeat] = useState(DEFAULT_ACCENT_ON_FIRST_BEAT);
  
  const [currentDisplayBeat, setCurrentDisplayBeat] = useState(0); // For visualizer

  const audioContextRef = useRef<AudioContext | null>(null); // Store AudioContext instance here

  // Sync State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  // Tap Tempo State
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const tapTimeoutIdRef = useRef<number | null>(null); 
  const [isTappingActive, setIsTappingActive] = useState(false);
  const [displayedTapBpm, setDisplayedTapBpm] = useState<string | number>(""); // What's shown during tapping

  // Initialize AudioContext on first interaction or component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
      }
    }
  }, []);
  
  const resetBeatDisplay = useCallback(() => {
    setCurrentDisplayBeat(0);
  }, []);

  const prepareForPlay = useCallback(() => {
    setCurrentDisplayBeat(0); // Visual beat counter resets
  }, []);
  
  // --- Sync Message Handling (Simulated) ---
  const handleIncomingSyncMessage = useCallback((message: SyncMessage) => {
    if (!isSynced || message.sessionId !== sessionId) {
      return; 
    }

    switch (message.type) {
      case 'SET_IS_PLAYING':
        setIsPlaying(prev => {
          const newIsPlaying = message.payload as boolean;
          if (prev !== newIsPlaying) {
            if (newIsPlaying) prepareForPlay(); else resetBeatDisplay();
          }
          return newIsPlaying;
        });
        break;
      case 'SET_BPM':
        setBpm(message.payload as number);
        break;
      case 'SET_TIME_SIGNATURE':
        setTimeSignature(message.payload as TimeSignature);
        if (!isPlaying) resetBeatDisplay(); // Reset visual if paused
        break;
      case 'SET_SUBDIVISION':
        setSubdivision(message.payload as Subdivision);
        break;
      case 'SET_ACCENT_ON_FIRST_BEAT':
        setAccentOnFirstBeat(message.payload as boolean);
        break;
      case 'FULL_STATE':
        const state = message.payload as FullSyncState;
        setBpm(state.bpm);
        setTimeSignature(state.timeSignature);
        setSubdivision(state.subdivision);
        setAccentOnFirstBeat(state.accentOnFirstBeat);
        setIsPlaying(prev => {
          if (prev !== state.isPlaying) {
            if (state.isPlaying) prepareForPlay(); else resetBeatDisplay();
          }
          return state.isPlaying;
        });
        if (state.currentBeat !== undefined) setCurrentDisplayBeat(state.currentBeat);
        break;
      default:
        // Unknown message type
    }
  }, [isSynced, sessionId, resetBeatDisplay, isPlaying, prepareForPlay]);

  const broadcastSyncMessage = useCallback((message: Omit<SyncMessage, 'sessionId'>) => {
    if (!isSynced || !sessionId) return;
    const fullMessage: SyncMessage = { ...message, sessionId }; // Timestamp removed
    handleIncomingSyncMessage(fullMessage); 
  }, [isSynced, sessionId, handleIncomingSyncMessage]);

  const handleUserInteractionForAudio = useCallback(async () => {
     await AudioService.ensureContextResumed(audioContextRef.current);
  }, []);

  // --- Core Controls Handlers ---
  const togglePlay = useCallback(async () => {
    await handleUserInteractionForAudio();
    const newIsPlaying = !isPlaying;
    if (isSynced) {
      broadcastSyncMessage({ type: 'SET_IS_PLAYING', payload: newIsPlaying });
    } else {
      setIsPlaying(newIsPlaying);
      if (newIsPlaying) prepareForPlay(); else resetBeatDisplay();
    }
  }, [isPlaying, isSynced, broadcastSyncMessage, handleUserInteractionForAudio, resetBeatDisplay, prepareForPlay]);

  const handleBpmChange = useCallback((newBpm: number) => {
    const clampedBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(newBpm)));
    if (isSynced) {
      broadcastSyncMessage({ type: 'SET_BPM', payload: clampedBpm });
    } else {
      setBpm(clampedBpm);
    }
  }, [isSynced, broadcastSyncMessage]);

  const handleTimeSignatureChange = useCallback((index: number) => {
    const newTimeSignature = TIME_SIGNATURES[index];
    if (isSynced) {
      broadcastSyncMessage({ type: 'SET_TIME_SIGNATURE', payload: newTimeSignature });
    } else {
      setTimeSignature(newTimeSignature);
      if (!isPlaying) resetBeatDisplay();
    }
  }, [isSynced, broadcastSyncMessage, resetBeatDisplay, isPlaying]);

  const handleSubdivisionChange = useCallback((index: number) => {
    const newSubdivision = SUBDIVISIONS[index];
    if (isSynced) {
      broadcastSyncMessage({ type: 'SET_SUBDIVISION', payload: newSubdivision });
    } else {
      setSubdivision(newSubdivision);
    }
  }, [isSynced, broadcastSyncMessage]);
  
  const handleAccentToggle = useCallback((newAccentState: boolean) => {
    if (isSynced) {
      broadcastSyncMessage({ type: 'SET_ACCENT_ON_FIRST_BEAT', payload: newAccentState });
    } else {
      setAccentOnFirstBeat(newAccentState);
    }
  }, [isSynced, broadcastSyncMessage]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume); // Volume is local, not synced in this simulation
  }, []);
  
  // Callback from metronome engine for each main beat
  const onBeatCallback = useCallback((beatNumber: number) => {
    setCurrentDisplayBeat(beatNumber);
  }, []);

  // Hook up the metronome engine
  useMetronomeEngine({
    audioContext: audioContextRef.current, // Pass the audio context
    isPlaying,
    bpm,
    timeSignature,
    subdivision,
    volume,
    onBeat: onBeatCallback,
    accentOnFirstBeat,
  });
  
  // --- TAP TEMPO LOGIC ---
  const finalizeTapTempo = useCallback(() => {
    if (tapTimes.length >= MIN_TAPS_FOR_BPM_CALCULATION) {
      let averageInterval = 0;
      for (let i = 1; i < tapTimes.length; i++) {
        averageInterval += tapTimes[i] - tapTimes[i - 1];
      }
      averageInterval /= (tapTimes.length - 1);

      if (averageInterval > 0) {
        const calculatedBpm = Math.round(60000 / averageInterval);
        const clampedBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, calculatedBpm));
        handleBpmChange(clampedBpm); 
        setDisplayedTapBpm(clampedBpm); 
      }
    }
    setIsTappingActive(false); 
    setTapTimes([]); 
    if(tapTimeoutIdRef.current) clearTimeout(tapTimeoutIdRef.current);
    tapTimeoutIdRef.current = null;
  }, [tapTimes, handleBpmChange]);

  const handleTap = useCallback(async () => {
    await handleUserInteractionForAudio(); 
    const now = Date.now();
    setIsTappingActive(true);

    if (tapTimeoutIdRef.current) {
      clearTimeout(tapTimeoutIdRef.current);
    }

    const newTapTimes = [...tapTimes, now].slice(-MAX_TAP_HISTORY);
    setTapTimes(newTapTimes);

    if (newTapTimes.length >= MIN_TAPS_FOR_BPM_CALCULATION) {
      let averageInterval = 0;
      for (let i = 1; i < newTapTimes.length; i++) {
        averageInterval += newTapTimes[i] - newTapTimes[i - 1];
      }
      averageInterval /= (newTapTimes.length - 1);
      if (averageInterval > 0) {
        const calculatedBpm = Math.round(60000 / averageInterval);
        setDisplayedTapBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, calculatedBpm)));
      } else {
        setDisplayedTapBpm("TAP"); 
      }
    } else {
      setDisplayedTapBpm("TAP"); 
    }
    
    tapTimeoutIdRef.current = window.setTimeout(finalizeTapTempo, TAP_TIMEOUT_MS);
  }, [tapTimes, finalizeTapTempo, handleUserInteractionForAudio]);
  
  // --- SYNC SESSION HANDLERS (Simulated) ---
  const generateMockSessionId = () => Math.random().toString(36).substring(2, 2 + MOCK_SESSION_ID_LENGTH).toUpperCase();

  const handleCreateSession = useCallback(() => {
    const newSessionId = generateMockSessionId();
    setSessionId(newSessionId);
    setIsSynced(true);
     broadcastSyncMessage({ 
        type: 'FULL_STATE', 
        payload: { bpm, timeSignature, subdivision, isPlaying, accentOnFirstBeat } 
    });
  }, [broadcastSyncMessage, bpm, timeSignature, subdivision, isPlaying, accentOnFirstBeat]);

  const handleJoinSession = useCallback((idToJoin: string) => {
    if (!idToJoin.trim()) {
      alert("Please enter a session ID to join.");
      return;
    }
    const upperId = idToJoin.toUpperCase();
    setSessionId(upperId);
    setIsSynced(true);
    const mockInitialState: FullSyncState = {
        bpm: DEFAULT_SYNC_JOIN_BPM,
        timeSignature: DEFAULT_TIME_SIGNATURE,
        subdivision: DEFAULT_SUBDIVISION,
        accentOnFirstBeat: DEFAULT_ACCENT_ON_FIRST_BEAT,
        isPlaying: false, 
    };
    handleIncomingSyncMessage({type: 'FULL_STATE', payload: mockInitialState, sessionId: upperId});
    if (!mockInitialState.isPlaying) resetBeatDisplay(); 
  }, [handleIncomingSyncMessage, resetBeatDisplay]);

  const handleLeaveSession = useCallback(() => {
    setSessionId(null);
    setIsSynced(false);
  }, []);
  
  return (
    <div className="space-y-4 w-full">
      <CollapsibleSection title="Synchronization (Simulated)">
        <SyncControls
          isSynced={isSynced}
          sessionId={sessionId}
          onCreateSession={handleCreateSession}
          onJoinSession={handleJoinSession}
          onLeaveSession={handleLeaveSession}
        />
      </CollapsibleSection>

      <div className="p-4 md:p-6 bg-gray-900 shadow-2xl rounded-xl border border-gray-700/50">
        <Visualizer 
          bpm={bpm}
          currentBeat={currentDisplayBeat}
          beatsPerMeasure={timeSignature.beatsPerMeasure}
          noteValue={timeSignature.noteValue}
          isTappingActive={isTappingActive}
          displayedTapBpm={displayedTapBpm}
        />
        <Controls
          isPlaying={isPlaying}
          bpm={bpm}
          timeSignature={timeSignature}
          subdivision={subdivision}
          volume={volume}
          accentOnFirstBeat={accentOnFirstBeat}
          onTogglePlay={togglePlay}
          onBpmChange={handleBpmChange}
          onTimeSignatureChange={handleTimeSignatureChange}
          onSubdivisionChange={handleSubdivisionChange}
          onVolumeChange={handleVolumeChange}
          onAccentToggle={handleAccentToggle}
          onTap={handleTap}
          isTappingActive={isTappingActive}
          displayedTapBpm={displayedTapBpm}
          minBpm={MIN_BPM}
          maxBpm={MAX_BPM}
          timeSignatures={TIME_SIGNATURES}
          subdivisions={SUBDIVISIONS}
          isSynced={isSynced} 
        />
      </div>
    </div>
  );
};

export default MetronomeDisplay;