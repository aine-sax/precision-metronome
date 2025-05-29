export interface TimeSignature {
  beatsPerMeasure: number;
  noteValue: number; // Typically 4 for quarter notes, 8 for eighth notes etc.
}

export const TIME_SIGNATURES: ReadonlyArray<TimeSignature> = [
  { beatsPerMeasure: 2, noteValue: 4 },
  { beatsPerMeasure: 3, noteValue: 4 },
  { beatsPerMeasure: 4, noteValue: 4 },
  { beatsPerMeasure: 5, noteValue: 4 },
  { beatsPerMeasure: 6, noteValue: 8 }, // e.g., 6/8 time
];

// Represents the number of subdivisions per main beat.
// 1: Quarter (no subdivision), 2: Eighth, 3: Triplet, 4: Sixteenth
export type SubdivisionValue = 1 | 2 | 3 | 4; 

export interface Subdivision {
  name: string;
  value: SubdivisionValue;
}

export const SUBDIVISIONS: ReadonlyArray<Subdivision> = [
  { name: "Quarter (1/4)", value: 1 },
  { name: "Eighth (1/8)", value: 2 },
  { name: "Triplets (1/8T)", value: 3 },
  { name: "Sixteenth (1/16)", value: 4 },
];

// Types for simulated synchronization
export type SyncActionType = 
  | 'SET_BPM' 
  | 'SET_TIME_SIGNATURE' 
  | 'SET_IS_PLAYING' 
  | 'SET_SUBDIVISION'
  | 'SET_ACCENT_ON_FIRST_BEAT'
  | 'FULL_STATE'; // For initial sync or full resync

export interface SyncMessage {
  type: SyncActionType;
  payload: any; // Payload type depends on the action type
  sessionId?: string;
  // timestamp removed as it was not used
}

// Represents the complete synchronized state of the metronome
export interface FullSyncState {
  bpm: number;
  timeSignature: TimeSignature;
  subdivision: Subdivision;
  isPlaying: boolean;
  accentOnFirstBeat: boolean;
  currentBeat?: number; // Optional: for syncing mid-measure if needed
}