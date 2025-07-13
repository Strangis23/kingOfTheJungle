import React, { useState, useMemo } from 'react';
import { Player, Card } from '../types';
import PlayerDisplay from '../components/PlayerDisplay';
import ActionCard from '../components/ActionCard';
import CardDetailModal from '../components/CardDetailModal';
import PlayerDetailModal from '../components/PlayerDetailModal';

interface CollectionScreenProps {
  roster: Player[];
  collection: Card[];
  activeDeck: Card[];
  onBack: () => void;
  onSaveDeck: (newDeck: Card[]) => void;
}

type SortKey = 'name' | 'rarity' | 'archetype' | 'cost';
interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}


const CollectionScreen: React.FC<CollectionScreenProps> = ({ roster, collection, activeDeck, onBack, onSaveDeck }) => {
  const [detailedCard, setDetailedCard] = useState<Card | null>(null);
  const [detailedPlayer, setDetailedPlayer] = useState<Player | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(activeDeck.map(c => c.id)));
  const [playerSortConfig, setPlayerSortConfig] = useState<SortConfig>({ key: 'rarity', direction: 'desc' });
  const [cardSortConfig, setCardSortConfig] = useState<SortConfig>({ key: 'archetype', direction: 'asc' });

  const handleCardClick = (card: Card) => {
    setSelectedIds(prev => {
      const newIds = new Set(prev);
      if (newIds.has(card.id)) {
        newIds.delete(card.id);
      } else {
        newIds.add(card.id);
      }
      return newIds;
    });
  };

  const handleClearDeck = () => {
    setSelectedIds(new Set());
  };

  const handleSaveDeck = () => {
    const newActiveDeck = collection.filter(c => selectedIds.has(c.id));
    if (newActiveDeck.length < 20) {
        alert("Your deck must contain at least 20 cards.");
        return;
    }
    onSaveDeck(newActiveDeck);
  };
  
  const handleSort = (type: 'player' | 'card', newKey: SortKey) => {
    const isPlayer = type === 'player';
    const currentConfig = isPlayer ? playerSortConfig : cardSortConfig;
    const setConfig = isPlayer ? setPlayerSortConfig : setCardSortConfig;

    if (currentConfig.key === newKey) {
        // Toggle direction if same key is clicked
        setConfig({ key: newKey, direction: currentConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
        // Set new key, with default direction (desc for rarity, asc for others)
        setConfig({ key: newKey, direction: newKey === 'rarity' ? 'desc' : 'asc' });
    }
  };
  
  const rarityOrder = { 'Common': 0, 'Rare': 1, 'Legendary': 2 };

  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => {
        const dir = playerSortConfig.direction === 'asc' ? 1 : -1;
        switch (playerSortConfig.key) {
            case 'rarity':
                return (rarityOrder[a.rarity] - rarityOrder[b.rarity]) * dir;
            case 'archetype':
                return a.archetypes[0].localeCompare(b.archetypes[0]) * dir;
            case 'name':
            default:
                return a.name.localeCompare(b.name) * dir;
        }
    });
  }, [roster, playerSortConfig]);

  const sortedCollection = useMemo(() => {
    return [...collection].sort((a, b) => {
        const dir = cardSortConfig.direction === 'asc' ? 1 : -1;
        switch (cardSortConfig.key) {
            case 'cost':
                return (a.hypeCost - b.hypeCost) * dir;
            case 'rarity':
                return (rarityOrder[a.rarity] - rarityOrder[b.rarity]) * dir;
            case 'archetype':
                return a.archetype.localeCompare(b.archetype) * dir;
            case 'name':
            default:
                return a.name.localeCompare(b.name) * dir;
        }
    });
  }, [collection, cardSortConfig]);

  const SortButton = ({ label, sortKey, currentConfig, onClick }: { label: string, sortKey: SortKey, currentConfig: SortConfig, onClick: (key: SortKey) => void }) => {
    const isActive = currentConfig.key === sortKey;
    const directionIcon = currentConfig.direction === 'asc' ? '▲' : '▼';
    return (
        <button
            onClick={() => onClick(sortKey)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                isActive ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
        >
            {label} {isActive && directionIcon}
        </button>
    );
  };

  const canSave = selectedIds.size >= 20;

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col">
      <CardDetailModal card={detailedCard} />
      <PlayerDetailModal player={detailedPlayer} onEnd={() => setDetailedPlayer(null)} />

      {/* Header */}
      <div className="flex-shrink-0 p-4 sm:p-6 bg-black/20 border-b-2 border-gray-700 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-2xl md:text-4xl font-bold text-yellow-400" style={{ fontFamily: 'monospace' }}>MANAGE TEAM</h1>
        <div className="flex items-center gap-4">
            <div className="text-center">
                <span className="text-lg font-bold">DECK (MIN 20)</span>
                <span className={`ml-2 text-lg font-bold ${canSave ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedIds.size}
                </span>
            </div>
            <button 
                onClick={handleClearDeck}
                className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
            >
                Clear Deck
            </button>
            <button 
                onClick={handleSaveDeck} 
                disabled={!canSave}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Save Deck
            </button>
            <button onClick={onBack} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold">
                &larr; Back
            </button>
        </div>
      </div>

      <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">ROSTER ({roster.length})</h2>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Sort by:</span>
                    <SortButton label="Name" sortKey="name" currentConfig={playerSortConfig} onClick={(key) => handleSort('player', key)} />
                    <SortButton label="Rarity" sortKey="rarity" currentConfig={playerSortConfig} onClick={(key) => handleSort('player', key)} />
                    <SortButton label="Archetype" sortKey="archetype" currentConfig={playerSortConfig} onClick={(key) => handleSort('player', key)} />
                </div>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              {sortedRoster.map(player => (
                <PlayerDisplay 
                    key={player.id} 
                    player={player} 
                    onLongPressStart={setDetailedPlayer}
                    onLongPressEnd={() => setDetailedPlayer(null)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">CARD COLLECTION ({collection.length})</h2>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Sort by:</span>
                    <SortButton label="Name" sortKey="name" currentConfig={cardSortConfig} onClick={(key) => handleSort('card', key)} />
                    <SortButton label="Rarity" sortKey="rarity" currentConfig={cardSortConfig} onClick={(key) => handleSort('card', key)} />
                    <SortButton label="Archetype" sortKey="archetype" currentConfig={cardSortConfig} onClick={(key) => handleSort('card', key)} />
                    <SortButton label="Cost" sortKey="cost" currentConfig={cardSortConfig} onClick={(key) => handleSort('card', key)} />
                </div>
            </div>
            <p className="text-gray-400 mb-4">Click cards to build your active deck (minimum 20 cards).</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              {sortedCollection.map(card => (
                <ActionCard
                  key={card.id}
                  card={card}
                  isDisabled={false}
                  displayCost={card.hypeCost}
                  onLongPressStart={setDetailedCard}
                  onLongPressEnd={() => setDetailedCard(null)}
                  onClick={handleCardClick}
                  isSelected={selectedIds.has(card.id)}
                />
              ))}
            </div>
          </div>
      </div>

    </div>
  );
};

export default CollectionScreen;
