import React, { useState } from 'react';

interface MainMenuScreenProps {
  onNewRun: () => void;
  onResetAll: () => void;
  onManageTeam: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onNewRun, onResetAll, onManageTeam }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleConfirmReset = () => {
    onResetAll();
    setShowResetConfirm(false);
  };

  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-dark.png")', backgroundBlendMode: 'overlay', backgroundColor: '#1a202c' }}>
      <div className="text-center bg-black/60 p-8 sm:p-12 rounded-xl shadow-2xl border-2 border-yellow-500/50">
        <h1 className="text-5xl md:text-7xl font-black text-yellow-400" style={{ fontFamily: 'monospace' }}>ASPHALT</h1>
        <h1 className="text-5xl md:text-7xl font-black text-white" style={{ fontFamily: 'monospace' }}>ASCENDANTS</h1>
        <p className="text-gray-300 mt-4 text-base sm:text-lg">A Roguelite Streetball Card Game</p>
        <div className="flex flex-col items-center mt-8 space-y-4">
          <button
            onClick={onNewRun}
            className="px-10 py-4 bg-yellow-500 text-gray-900 font-bold text-xl sm:text-2xl rounded-lg hover:bg-yellow-400 transition-colors transform hover:scale-105"
          >
            START NEW RUN
          </button>
           <button
            onClick={onManageTeam}
            className="px-8 py-3 bg-gray-700 text-white font-bold text-lg rounded-lg hover:bg-gray-600 transition-colors"
          >
            MANAGE TEAM
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Reset All Progress
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center border-2 border-red-500">
            <h2 className="text-2xl font-bold text-white mb-4">
              Reset All Progress?
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              This will erase all unlocked players and cards.
              <br/>
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenuScreen;
