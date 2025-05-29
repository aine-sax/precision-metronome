import React from 'react';
import MetronomeDisplay from './components/MetronomeDisplay';
// Note: SyncControls and CollapsibleSection are used internally by MetronomeDisplay

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col items-center p-4 selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center pt-4 pb-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-100 pb-1">
            Precision Metronome
          </h1>
          <p className="text-gray-500 text-xs">Tap. Sync. Groove.</p>
        </header>

        <MetronomeDisplay />
        
        <footer className="pt-8 pb-4 text-center text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} Precision Metronome. Inspired by precision.</p>
          <p className="mt-1">
            Sync is <span className="font-semibold text-sky-500">simulated</span>.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;