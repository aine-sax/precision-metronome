import { TIME_SIGNATURES, SUBDIVISIONS, TimeSignature, Subdivision } from "./types";

// Metronome Engine Defaults
export const DEFAULT_BPM: number = 120;
export const MIN_BPM: number = 20;
export const MAX_BPM: number = 320;
export const DEFAULT_VOLUME: number = 75; // Percentage (0-100)
export const DEFAULT_ACCENT_ON_FIRST_BEAT: boolean = true;

// Time Signature and Subdivision Defaults
export const DEFAULT_TIME_SIGNATURE_INDEX: number = 2; // Corresponds to 4/4 in TIME_SIGNATURES
export const DEFAULT_TIME_SIGNATURE: TimeSignature = TIME_SIGNATURES[DEFAULT_TIME_SIGNATURE_INDEX];

export const DEFAULT_SUBDIVISION_INDEX: number = 0; // Corresponds to Quarter notes in SUBDIVISIONS
export const DEFAULT_SUBDIVISION: Subdivision = SUBDIVISIONS[DEFAULT_SUBDIVISION_INDEX];

// Visualizer Constants
// NEEDLE_MAX_ANGLE removed

// Tap Tempo Constants
export const TAP_TIMEOUT_MS: number = 2000; // Max time between taps to consider them part of the same sequence
export const MIN_TAPS_FOR_BPM_CALCULATION: number = 2; // Need at least 2 taps (which means 1 interval)
export const MAX_TAP_HISTORY: number = 5; // Number of recent taps to average for BPM calculation

// Synchronization Simulation Constants
export const DEFAULT_SYNC_JOIN_BPM: number = 100; // BPM for a client joining a mock session
export const MOCK_SESSION_ID_LENGTH: number = 8;