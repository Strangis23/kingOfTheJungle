
import React from 'react';

interface EndGameModalProps {
  didPlayerWin: boolean;
  isTie?: boolean;
  onClose: () => void;
}

const EndGameModal: React.FC<EndGameModalProps> = ({ didPlayerWin, isTie, onClose }) => {
  const title = isTie ? 'TIE GAME' : didPlayerWin ? 'YOU WIN!' : 'DEFEAT';
  const message = isTie ? "It's a draw! An honorable battle." : didPlayerWin ? 'You dominated the court!' : 'Better luck next time, champ.';
  const bgColor = isTie ? 'bg-gradient-to-br from-gray-800 to-purple-900' : didPlayerWin ? 'bg-gradient-to-br from-gray-800 to-blue-900' : 'bg-gradient-to-br from-gray-800 to-red-900';
  const borderColor = isTie ? 'border-purple-400' : didPlayerWin ? 'border-cyan-400' : 'border-red-500';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className={`p-8 rounded-lg shadow-2xl text-center ${bgColor} border-2 ${borderColor}`}>
        <h2 className="text-4xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-300 mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Return to Map
        </button>
      </div>
    </div>
  );
};

export default EndGameModal;
