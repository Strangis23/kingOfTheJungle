import React, { useRef } from 'react';
import { Player, Archetype, PlayerStatusName } from '../types.ts';

interface PlayerDisplayProps {
  player: Player;
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: (playerId: string) => void;
  onLongPressStart?: (player: Player) => void;
  onLongPressEnd?: () => void;
}

const archetypeStyles: { [key in Archetype]: { border: string, bg: string } } = {
  [Archetype.Slasher]:            { border: 'border-red-500',      bg: 'bg-gradient-to-t from-black via-red-900/80 to-red-900/50' },
  [Archetype.Sharpshooter]:       { border: 'border-blue-500',     bg: 'bg-gradient-to-t from-black via-blue-900/80 to-blue-900/50' },
  [Archetype.Playmaker]:          { border: 'border-yellow-500',   bg: 'bg-gradient-to-t from-black via-yellow-900/80 to-yellow-900/50' },
  [Archetype.RimProtector]:       { border: 'border-teal-500',     bg: 'bg-gradient-to-t from-black via-teal-900/80 to-teal-900/50' },
  [Archetype.PerimeterDefender]:  { border: 'border-green-500',    bg: 'bg-gradient-to-t from-black via-green-900/80 to-green-900/50' },
  [Archetype.OnBallDefender]:     { border: 'border-indigo-500',   bg: 'bg-gradient-to-t from-black via-indigo-900/80 to-indigo-900/50' },
  [Archetype.Superstar]:          { border: 'border-yellow-400',   bg: 'bg-gradient-to-t from-black via-yellow-800/80 to-yellow-800/50' },
};

const rarityStyles: { [key in 'Common' | 'Rare' | 'Legendary']: { glow: string } } = {
    Common: { glow: ''},
    Rare: { glow: 'shadow-[0_0_15px_rgba(59,130,246,0.7)]' }, // blue glow
    Legendary: { glow: 'shadow-[0_0_20px_rgba(250,204,21,0.8)]' }, // yellow glow
};

const statusIcons: { [key in PlayerStatusName]: string } = {
    'Locked Down': '🔒',
    'Ankles Broken': '😵',
    'Heated Up': '🔥',
    'Fatigued': '😩',
    'CantPlayShots': '🚫',
    'NoHypeGain': '❄️',
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ player, isSelectable, isSelected, onClick, onLongPressStart, onLongPressEnd }) => {
  const styles = archetypeStyles[player.archetypes[0]];
  const rarityGlow = rarityStyles[player.rarity].glow;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const handleClick = () => {
    if (isSelectable && onClick) {
      onClick(player.id);
    }
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('button' in e && e.button !== 0) return;
    
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPressStart?.(player);
    }, 300);
  };

  const handleInteractionEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isLongPressRef.current) {
      onLongPressEnd?.();
    } else {
      handleClick();
    }
    isLongPressRef.current = false;
  };
  
  const handlePointerLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isLongPressRef.current) {
      onLongPressEnd?.();
      // Do not reset isLongPressRef here. This was the source of the bug.
      // A long press that leaves the element should still be considered a long press
      // and not trigger a click on mouseup. The ref is reset in handleInteractionEnd.
    }
  };
  
  const cursorClass = isSelectable || onLongPressStart ? 'cursor-pointer' : '';
  const selectableClasses = isSelectable ? 'transform hover:scale-105 transition-transform duration-200 hover:shadow-yellow-400/50' : '';
  const selectedClasses = isSelected ? `ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900 ${styles.border}` : styles.border;

  return (
    <div 
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onMouseLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-28 h-36 sm:w-32 sm:h-40 bg-gray-800 border-4 ${selectedClasses} rounded-lg shadow-md ${cursorClass} ${selectableClasses} flex flex-col overflow-hidden transition-shadow duration-300 ${rarityGlow}`}
    >
      {/* Image Area */}
      <div 
        className="h-[65%] w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url('${player.imageUrl}')` }}
      >
        {player.statuses.length > 0 && (
          <div className="absolute top-1 right-1 flex flex-col gap-1">
            {player.statuses.map(status => (
              <div key={status.name} className="w-6 h-6 bg-gray-900/80 rounded-full flex items-center justify-center text-sm ring-1 ring-black/50" title={`${status.name} (${status.duration} turns)`}>
                  {statusIcons[status.name]}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Info Area */}
      <div className={`h-[35%] w-full p-1 flex flex-col justify-center items-center text-center text-white ${styles.bg}`}>
        <h4 className="font-bold text-sm leading-tight">{player.name}</h4>
        <p className="text-[10px] sm:text-xs opacity-80">{player.archetypes.join(' / ')}</p>
      </div>
    </div>
  );
};

export default PlayerDisplay;