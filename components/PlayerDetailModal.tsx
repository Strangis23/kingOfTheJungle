import React from 'react';
import { Player, Archetype } from '../types';

interface PlayerDetailModalProps {
  player: Player | null;
}

const archetypeColorMap: { [key in Archetype]: { text: string, bg: string } } = {
  [Archetype.Slasher]: { text: 'text-red-400', bg: 'bg-red-500/20' },
  [Archetype.Sharpshooter]: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
  [Archetype.Playmaker]: { text: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  [Archetype.RimProtector]: { text: 'text-teal-400', bg: 'bg-teal-500/20' },
  [Archetype.PerimeterDefender]: { text: 'text-green-400', bg: 'bg-green-500/20' },
  [Archetype.OnBallDefender]: { text: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  [Archetype.Superstar]: { text: 'text-yellow-300', bg: 'bg-yellow-500/20' },
};

const rarityStyles: { [key in 'Common' | 'Rare' | 'Legendary']: { text: string } } = {
    Common: { text: 'text-gray-300' },
    Rare: { text: 'text-blue-400' },
    Legendary: { text: 'text-yellow-400' },
};

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player }) => {
  if (!player) return null;

  const rarityStyle = rarityStyles[player.rarity];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in pointer-events-none">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col sm:flex-row bg-gray-900 border-2 border-yellow-400 rounded-xl shadow-2xl overflow-hidden animate-pop-in">
        <img src={player.imageUrl} alt={player.name} className="w-full sm:w-1/2 h-64 sm:h-auto object-cover"/>
        <div className="flex flex-col p-4 sm:p-6 justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{player.name}</h2>
                <span className={`text-lg font-bold ${rarityStyle.text}`}>{player.rarity}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
            {player.archetypes.map(archetype => {
                const archetypeStyle = archetypeColorMap[archetype];
                return (
                    <p key={archetype} className={`text-lg font-semibold px-3 py-1 rounded-full self-start inline-block mr-2 ${archetypeStyle.bg} ${archetypeStyle.text}`}>
                        {archetype}
                    </p>
                )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailModal;
