import React from 'react';
import { Card, Archetype, Keyword } from '../types.ts';

interface CardDetailModalProps {
  card: Card | null;
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

const KeywordBadge: React.FC<{ keyword: Keyword }> = ({ keyword }) => {
    let bgColor = 'bg-gray-500';
    if (keyword === Keyword.Combo) bgColor = 'bg-purple-600';
    if (keyword === Keyword.Clutch) bgColor = 'bg-red-700';
    if (keyword === Keyword.Exhaust) bgColor = 'bg-gray-800';
    if (keyword === Keyword.Signature) bgColor = 'bg-yellow-400 text-black';
    if (keyword === Keyword.Reaction) bgColor = 'bg-green-600';

    return <span className={`px-2 py-1 text-xs font-bold rounded ${bgColor}`}>{keyword}</span>
}

const PLACEHOLDER_SVG_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23374151'/%3E%3C/svg%3E"; // bg-gray-700
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  if (e.currentTarget.src !== PLACEHOLDER_SVG_URL) {
    e.currentTarget.src = PLACEHOLDER_SVG_URL;
  }
};


const CardDetailModal: React.FC<CardDetailModalProps> = ({ card }) => {
  if (!card) return null;

  const archetypeStyle = archetypeColorMap[card.archetype];
  const rarityStyle = rarityStyles[card.rarity];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in pointer-events-none">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col sm:flex-row bg-gray-900 border-2 border-yellow-400 rounded-xl shadow-2xl overflow-hidden animate-pop-in">
        <div 
          className="w-full sm:w-1/2 h-64 sm:h-auto bg-gray-700"
          aria-label={card.name}
        >
            <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
            />
        </div>
        <div className="flex flex-col p-4 sm:p-6 justify-between sm:w-1/2">
          <div>
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{card.name}</h2>
                <span className={`text-lg font-bold ${rarityStyle.text}`}>{card.rarity}</span>
            </div>
            <p className="text-gray-300 text-base sm:text-lg">{card.description}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
             <p className={`text-lg font-semibold px-3 py-1 rounded-full self-start inline-block ${archetypeStyle.bg} ${archetypeStyle.text}`}>{card.archetype}</p>
             {card.keywords && card.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                  {card.keywords.map(kw => <KeywordBadge key={kw} keyword={kw} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;