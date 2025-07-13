import React, { useRef } from 'react';
import { Card, Archetype, Keyword } from '../types';

interface ActionCardProps {
  card: Card;
  isDisabled: boolean;
  displayCost: number;
  onClick?: (card: Card) => void;
  onLongPressStart?: (card: Card) => void;
  onLongPressEnd?: () => void;
  isSelected?: boolean;
  size?: 'normal' | 'tiny';
}

const archetypeColorMap: { [key in Archetype]: { border: string, bg: string, text: string } } = {
  [Archetype.Slasher]:            { border: 'border-red-500',      bg: 'bg-gradient-to-t from-black to-red-900/50',       text: 'text-red-300' },
  [Archetype.Sharpshooter]:       { border: 'border-blue-500',     bg: 'bg-gradient-to-t from-black to-blue-900/50',      text: 'text-blue-300' },
  [Archetype.Playmaker]:          { border: 'border-yellow-500',   bg: 'bg-gradient-to-t from-black to-yellow-900/50',    text: 'text-yellow-300' },
  [Archetype.RimProtector]:       { border: 'border-teal-500',     bg: 'bg-gradient-to-t from-black to-teal-900/50',      text: 'text-teal-300' },
  [Archetype.PerimeterDefender]:  { border: 'border-green-500',    bg: 'bg-gradient-to-t from-black to-green-900/50',     text: 'text-green-300' },
  [Archetype.OnBallDefender]:     { border: 'border-indigo-500',   bg: 'bg-gradient-to-t from-black to-indigo-900/50',    text: 'text-indigo-300' },
  [Archetype.Superstar]:          { border: 'border-yellow-400',   bg: 'bg-gradient-to-t from-black to-yellow-800/60',    text: 'text-yellow-200' },
};

const ActionCard: React.FC<ActionCardProps> = ({ card, onClick, isDisabled, displayCost, onLongPressStart, onLongPressEnd, isSelected, size = 'normal' }) => {
  const { border, bg, text } = archetypeColorMap[card.archetype];
  const isReaction = card.keywords?.includes(Keyword.Reaction);
  const costIsModified = card.hypeCost > 0 && displayCost < card.hypeCost;
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick(card);
    }
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDisabled) return;
    if ('button' in e && e.button !== 0) return;
    
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPressStart?.(card);
    }, 300);
  };

  const handleInteractionEnd = () => {
    if (isDisabled) return;
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

  const isTiny = size === 'tiny';

  const containerClasses = isTiny
    ? `w-16 h-24 border-2 rounded-md`
    : `w-28 h-44 sm:w-32 sm:h-48 md:w-40 md:h-56 border-4 rounded-lg`;

  const costClasses = isTiny
    ? `w-5 h-5 top-1 right-1 text-xs ring-1`
    : `w-7 h-7 sm:w-8 sm:h-8 top-2 right-2 text-lg sm:text-xl ring-2`;

  const nameClasses = isTiny ? 'text-[9px]' : 'text-sm md:text-base';
  const archetypeClasses = isTiny ? 'text-[8px]' : 'text-xs md:text-sm';
  const infoPadding = isTiny ? 'p-1' : 'p-2';

  const CostDisplay = () => {
    const costColor = isReaction ? 'bg-green-500' : costIsModified ? 'bg-green-400' : 'bg-cyan-500';
    return (
      <div className={`absolute ${costClasses} ${costColor} rounded-full flex items-center justify-center text-gray-900 font-bold ring-black/50 z-10`}>
        {displayCost}
      </div>
    );
  };
  
  const hoverEffect = !isDisabled && !isTiny ? 'hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/50' : '';
  const selectedEffect = isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : '';
  
  return (
    <div
      className={`relative ${containerClasses} bg-gray-900 ${border} shadow-lg text-white transform transition-all duration-200 ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${hoverEffect} ${selectedEffect} flex flex-col overflow-hidden flex-shrink-0`}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onMouseLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
    >
      <CostDisplay />
      
      <div className="h-[60%] w-full bg-cover bg-center" style={{ backgroundImage: `url('${card.imageUrl}')`}}>
        {/* Image is background */}
      </div>

      <div className={`h-[40%] w-full ${infoPadding} flex flex-col justify-center items-center text-center ${bg}`}>
        <h3 className={`${nameClasses} font-bold leading-tight`}>{card.name}</h3>
        <p className={`${archetypeClasses} font-semibold ${text}`}>{card.archetype}</p>
      </div>
    </div>
  );
};

export default ActionCard;
