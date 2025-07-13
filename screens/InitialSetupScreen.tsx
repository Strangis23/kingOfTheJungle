import React, { useState, useEffect } from 'react';
import { Player, Card, CardPack } from '../types';
import { generateCardPack } from '../components/game-data';
import PlayerDisplay from '../components/PlayerDisplay';
import ActionCard from '../components/ActionCard';
import CardDetailModal from '../components/CardDetailModal';


interface InitialSetupScreenProps {
  onSetupComplete: (initialRoster: Player[], initialDeck: Card[]) => void;
}

const CardBack = () => (
    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center border-2 border-black/20 shadow-lg">
        <span className="text-5xl font-bold text-black opacity-50" style={{fontFamily: 'monospace'}}>AA</span>
    </div>
)

const InitialSetupScreen: React.FC<InitialSetupScreenProps> = ({ onSetupComplete }) => {
  const [packs, setPacks] = useState<CardPack[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [detailedCard, setDetailedCard] = useState<Card | null>(null);

  useEffect(() => {
    // Generate 4 common-only packs on mount
    if (packs.length === 0) {
      const newPacks = Array.from({ length: 4 }, () => generateCardPack('Common'));
      setPacks(newPacks);
    }
  }, [packs]);

  const handleRevealAll = () => {
    setIsRevealed(true);
  };

  const handleSetupComplete = () => {
    const initialRoster = packs.map(pack => pack.player);
    const initialDeck = packs.flatMap(pack => pack.cards);
    onSetupComplete(initialRoster, initialDeck);
  };

  if (packs.length === 0) {
    return <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">Generating your first recruits...</div>
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <CardDetailModal card={detailedCard} />
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: 'monospace' }}>
          {isRevealed ? "YOUR FOUNDING TEAM" : "UNPACK YOUR STARTER KITS"}
        </h1>
        <p className="text-base md:text-lg text-gray-400 max-w-2xl">
          {isRevealed ? "These are the first members of your team. Welcome to the league." : "You get 4 packs to start your journey. Let's see who you got."}
        </p>
      </div>
      
      {!isRevealed ? (
        <div className="animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {packs.map((_, index) => (
                    <div key={index} className="w-40 h-56 sm:w-48 sm:h-64 transform transition-transform duration-300 hover:scale-105">
                        <CardBack />
                    </div>
                ))}
            </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl flex flex-col gap-8 mb-8 animate-fade-in">
          {packs.map((pack, index) => (
            <div key={index} className="bg-black/30 p-4 rounded-xl border border-gray-700">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-cyan-400">PACK {index + 1}</span>
                <div className="ml-4 h-px flex-grow bg-gray-700"></div>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start">
                <div className="flex flex-col items-center mx-auto sm:mx-0">
                    <p className="font-bold text-yellow-300 mb-1 text-sm uppercase tracking-wider">Player</p>
                    <PlayerDisplay player={pack.player} />
                </div>
                <div className="flex-grow flex flex-wrap justify-center sm:justify-start gap-3">
                    {pack.cards.map(card => (
                        <ActionCard 
                            key={card.id} 
                            card={card} 
                            isDisabled={true} 
                            displayCost={card.hypeCost}
                            onLongPressStart={setDetailedCard}
                            onLongPressEnd={() => setDetailedCard(null)}
                        />
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-8">
      {!isRevealed ? (
          <button
            onClick={handleRevealAll}
            className="px-8 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all text-xl transform hover:scale-105"
          >
            REVEAL PACKS
          </button>
      ) : (
          <button
            onClick={handleSetupComplete}
            className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-400 transition-all text-xl transform hover:scale-105 animate-fade-in"
          >
            ENTER THE STREETS
          </button>
      )}
      </div>
      
    </div>
  );
};

export default InitialSetupScreen;