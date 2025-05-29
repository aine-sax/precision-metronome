import React, { useState } from 'react';

interface SyncControlsProps {
  isSynced: boolean;
  sessionId: string | null;
  onCreateSession: () => void;
  onJoinSession: (sessionIdToJoin: string) => void;
  onLeaveSession: () => void;
}

const SyncControls: React.FC<SyncControlsProps> = ({
  isSynced,
  sessionId,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
}) => {
  const [joinSessionIdInput, setJoinSessionIdInput] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (joinSessionIdInput.trim()) {
      onJoinSession(joinSessionIdInput.trim());
      setJoinSessionIdInput(''); // Clear input after attempting to join
    } else {
      alert("Please enter a Session ID to join."); // Simple validation feedback
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinSessionIdInput(e.target.value.toUpperCase().trim()); // Auto-uppercase and trim
  };

  // Base Tailwind classes for consistent styling
  const buttonBaseClasses = "w-full px-4 py-2 text-sm font-medium rounded-md shadow transition-all duration-150 ease-in-out transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  const inputBaseClasses = "flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-gray-200 placeholder-gray-400 text-sm";

  return (
    <div className="space-y-4">
      {isSynced && sessionId ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-green-400" aria-live="polite">
            Status: <span className="font-semibold">Synced</span>
          </p>
          <p className="text-xs text-gray-400">
            Session ID: <span className="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-sky-300 text-xs" aria-label={`Current session ID: ${sessionId}`}>{sessionId}</span>
          </p>
          <button
            onClick={onLeaveSession}
            className={`${buttonBaseClasses} bg-yellow-600 hover:bg-yellow-500 text-white focus:ring-yellow-400`}
            aria-label="Leave current synchronization session"
          >
            Leave Sync Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
             <p className="text-sm text-gray-400 mb-1" aria-live="polite">Status: <span className="font-semibold">Local Mode</span></p>
            <button
              onClick={onCreateSession}
              className={`${buttonBaseClasses} bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-400`}
              aria-label="Create a new synchronization session"
            >
              Create New Session (Simulated)
            </button>
          </div>
          <form onSubmit={handleJoinSubmit} className="space-y-2">
            <label htmlFor="join-session-id" className="block text-xs font-medium text-gray-400 text-center">
              Or Join Existing Session (Simulated):
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="join-session-id"
                value={joinSessionIdInput}
                onChange={handleInputChange}
                placeholder="Enter Session ID"
                className={inputBaseClasses}
                aria-label="Enter Session ID to join existing session"
                aria-describedby="join-session-hint"
                maxLength={12} // Example max length
              />
              <button
                type="submit"
                className={`${buttonBaseClasses} bg-teal-600 hover:bg-teal-500 text-white focus:ring-teal-400 w-auto px-5`}
                aria-label="Join existing synchronization session with entered ID"
              >
                Join
              </button>
            </div>
            <p id="join-session-hint" className="sr-only">Enter the ID of the session you wish to join.</p>
          </form>
        </div>
      )}
    </div>
  );
};

export default SyncControls;