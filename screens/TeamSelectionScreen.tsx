import React, { useState } from 'react';
import { Player, Team } from '../types';
import PlayerDisplay from '../components/PlayerDisplay';

interface TeamSelectionScreenProps {
  roster: Player[];
  opponentTeam: Team;
  onConfirmTeam: (selectedPlayers: Player[]) => void;
  onBack: () => void;
}

const TeamSelectionScreen: React.FC<TeamSelectionScreenProps> = ({ roster, opponentTeam, onConfirmTeam, onBack }) => {
  const [selectedPlayerIndices, setSelectedPlayerIndices] = useState<Set<number>>(new Set());

  const handlePlayerClick = (playerIndex: number) => {
    setSelectedPlayerIndices(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(playerIndex)) {
        newSelection.delete(playerIndex);
      } else {
        if (newSelection.size < 3) {
          newSelection.add(playerIndex);
        }
      }
      return newSelection;
    });
  };

  const handleConfirm = () => {
    if (selectedPlayerIndices.size === 3) {
      const selectedPlayers = Array.from(selectedPlayerIndices).map(index => roster[index]);
      onConfirmTeam(selectedPlayers);
    }
  };
  
  const canConfirm = selectedPlayerIndices.size === 3;

  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in">
      <button onClick={onBack} className="absolute top-4 left-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold">
        &larr; Back to Map
      </button>
      
      <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-2 text-center" style={{ fontFamily: 'monospace' }}>SELECT YOUR SQUAD</h1>
      <p className="text-base md:text-lg text-gray-400 mb-2 text-center">Choose 3 players for the match against <span className="text-red-400 font-bold">{opponentTeam.name}</span>.</p>
       <div className="mb-6">
        <h3 className="text-center font-bold text-lg mb-2">Opponent's Roster:</h3>
        <div className="flex justify-center gap-2">
            {opponentTeam.players.map(player => <PlayerDisplay key={player.id} player={player} />)}
        </div>
      </div>
      
      <div className="flex-grow w-full max-w-6xl bg-black/20 rounded-lg border-2 border-gray-600 p-4 mb-6 overflow-y-auto">
        <div className="flex flex-wrap justify-center gap-4">
          {roster.map((player, index) => (
            <PlayerDisplay
              key={index}
              player={player}
              isSelectable={true}
              isSelected={selectedPlayerIndices.has(index)}
              onClick={(_playerId) => handlePlayerClick(index)}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="px-8 py-3 text-xl font-bold rounded-lg transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:opacity-50 bg-green-600 hover:bg-green-500 text-white"
      >
        Confirm Team ({selectedPlayerIndices.size} / 3)
      </button>
    </div>
  );
};

export default TeamSelectionScreen;