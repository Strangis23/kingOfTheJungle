import React, { useEffect, useRef } from 'react';

interface PlayByPlayProps {
  logs: string[];
  isOpen: boolean;
  onClose: () => void;
}

const PlayByPlay: React.FC<PlayByPlayProps> = ({ logs, isOpen, onClose }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;
  
  // Display logs in chronological order (oldest at top, newest at bottom)
  const reversedLogs = [...logs].reverse();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl h-3/4 bg-gray-900 border-2 border-yellow-400 rounded-lg p-4 flex flex-col shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Play-by-Play</h2>
        <div ref={logContainerRef} className="flex-grow bg-black/30 rounded p-2 overflow-y-auto font-mono text-gray-300 text-sm flex flex-col-reverse space-y-reverse space-y-1">
           <div className="flex-grow"></div>
           {logs.map((log, index) => <p key={logs.length - 1 - index}>{`> ${log}`}</p>)}
        </div>
        <button 
          onClick={onClose} 
          className="mt-4 px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg self-center hover:bg-yellow-400 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PlayByPlay;
