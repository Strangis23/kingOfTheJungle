import React, { useState, useEffect } from 'react';
import { Card, CardPack } from '../types';
import { generateCardPack } from '../components/game-data';
import PlayerDisplay from '../components/PlayerDisplay';
import ActionCard from '../components/ActionCard';
import CardDetailModal from '../components/CardDetailModal';

interface PackOpeningScreenProps {
  onBack: (pack: CardPack | null) => void;
}

const CardBack = () => (
    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
        <span className="text-4xl font-bold text-black opacity-50">?</span>
    </div>
)

const PackOpeningScreen: React.FC<PackOpeningScreenProps> = ({ onBack }) => {
  const [pack, setPack] = useState<CardPack | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [detailedCard, setDetailedCard] = useState<Card | null>(null);

  useEffect(() => {
    setPack(generateCardPack());
  }, []);
  
  if (!pack) {
      return <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">Generating your pack...</div>
  }
  
  const allItems = [pack.player, ...pack.cards];

  const handleRevealAll = () => {
      setIsRevealed(true);
      allItems.forEach((_, index) => {
          setTimeout(() => {
              setRevealedIndices(prev => [...prev, index]);
          }, index * 100);
      });
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8">
      <CardDetailModal card={detailedCard} />
      <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-2 text-center" style={{ fontFamily: 'monospace' }}>NEW RECRUITS!</h1>
      <p className="text-base md:text-lg text-gray-400 mb-6 text-center">Add a new player and cards to your team.</p>
      
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-8">
        {allItems.map((item, index) => (
          <div key={index} className={`card-container w-28 h-44 sm:w-32 sm:h-40 md:h-48 ${revealedIndices.includes(index) ? 'flipped' : ''}`}>
              <div className="card-inner">
                  <div className="card-front"><CardBack /></div>
                  <div className="card-back">
                      {'archetypes' in item ? 
                          <PlayerDisplay player={item} /> : 
                          <ActionCard 
                            card={item} 
                            isDisabled={true} 
                            displayCost={item.hypeCost} 
                            onLongPressStart={setDetailedCard}
                            onLongPressEnd={() => setDetailedCard(null)}
                          />
                      }
                  </div>
              </div>
          </div>
        ))}
      </div>
      
      {!isRevealed ? (
          <button
            onClick={handleRevealAll}
            className="px-8 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all text-xl transform hover:scale-105"
          >
            REVEAL PACK
          </button>
      ) : (
          <button
            onClick={() => onBack(pack)}
            className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 transition-all text-xl transform hover:scale-105 animate-fade-in"
          >
            ADD TO TEAM
          </button>
      )}
      
    </div>
  );
};

export default PackOpeningScreen;
