import React from 'react';
import { ActionAnimation } from '../types';
import ActionCard from './ActionCard';

const outcomeTextMap: { [key in ActionAnimation['outcome']]: string } = {
  score: 'SWISH!',
  miss: 'BRICK!',
  block: 'BLOCKED!',
  steal: 'STOLEN!',
  negated: 'NEGATED!',
  generic: '',
};

const outcomeColorMap: { [key in ActionAnimation['outcome']]: string } = {
  score: 'text-green-400',
  miss: 'text-gray-400',
  block: 'text-red-500',
  steal: 'text-yellow-400',
  negated: 'text-orange-500',
  generic: 'text-white',
};

const CourtDisplay: React.FC<{ animation: ActionAnimation | null }> = ({ animation }) => {
  if (!animation) {
    return <div className="w-full h-full pointer-events-none" />;
  }

  const { card, reactionCard, outcome, points } = animation;

  const text = outcomeTextMap[outcome];
  const color = outcomeColorMap[outcome];

  const fullText = outcome === 'score' ? `${text} +${points}` : text;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-20 animate-fade-in pointer-events-none p-4">
      <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-8 animate-pop-in">
        {reactionCard && (
          <div className="flex flex-col items-center">
            <p className="text-xl font-bold mb-2 text-red-400">REACTION</p>
            <ActionCard card={reactionCard} isDisabled={true} displayCost={reactionCard.gritCost || 0} />
          </div>
        )}
        <div className="flex flex-col items-center">
          <p className="text-xl font-bold mb-2 text-cyan-400">ACTION</p>
          <ActionCard card={card} isDisabled={true} displayCost={card.hypeCost} />
        </div>
      </div>
      {fullText && (
        <p className={`text-6xl md:text-8xl font-black mt-4 text-center animate-dramatic-text ${color}`} style={{ WebkitTextStroke: '2px black' }}>
          {fullText}
        </p>
      )}
    </div>
  );
};

export default CourtDisplay;
