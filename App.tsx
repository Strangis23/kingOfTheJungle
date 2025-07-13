import React, { useState, useEffect } from 'react';
import GameScreen from './screens/GameScreen.tsx';
import MapScreen from './screens/MapScreen.tsx';
import PackOpeningScreen from './screens/PackOpeningScreen.tsx';
import MainMenuScreen from './screens/MainMenuScreen.tsx';
import TeamSelectionScreen from './screens/TeamSelectionScreen.tsx';
import InitialSetupScreen from './screens/InitialSetupScreen.tsx';
import CollectionScreen from './screens/CollectionScreen.tsx';
import { Team, Playbook, Player, Card, MapNode, MapNodeType, CardPack } from './types.ts';
import { CONCRETE_CRUSHERS, NEON_NETS, PLAYBOOK_DATA } from './components/game-data.ts';

type GameView = 'loading' | 'initial_setup' | 'menu' | 'playbook' | 'team_select' | 'map' | 'game' | 'pack' | 'collection';

const initialMapNodes: MapNode[] = [
  { id: 'node-1', type: MapNodeType.Game, opponent: CONCRETE_CRUSHERS, completed: false, position: { x: 20, y: 50 } },
  { id: 'node-2', type: MapNodeType.Pack, completed: false, position: { x: 50, y: 30 } },
  { id: 'node-3', type: MapNodeType.Game, opponent: NEON_NETS, completed: false, position: { x: 50, y: 70 } },
  { id: 'node-4', type: MapNodeType.Rival, opponent: CONCRETE_CRUSHERS, completed: false, position: { x: 80, y: 50 } },
];

const PlaybookSelection: React.FC<{ onSelect: (playbook: Playbook) => void }> = ({ onSelect }) => {
    const playbooks = [Playbook.PaceAndSpace, Playbook.GritAndGrind, Playbook.FastbreakKings];
    
    return (
        <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in">
            <h1 className="text-3xl sm:text-5xl font-bold text-yellow-400 mb-4 text-center" style={{ fontFamily: 'monospace' }}>CHOOSE YOUR PLAYBOOK</h1>
            <p className="text-base sm:text-lg text-gray-400 mb-8 sm:mb-12 text-center">Your playbook defines your team's core strategy and unlocks a powerful Signature Move.</p>
            <div className="flex flex-col md:flex-row gap-8">
                {playbooks.map(p => (
                    <div 
                        key={p} 
                        onClick={() => onSelect(p)} 
                        className="w-full max-w-sm md:w-80 bg-gray-800 border-4 border-gray-600 rounded-lg p-6 flex flex-col justify-between shadow-lg text-white transform transition-all duration-300 hover:-translate-y-2 hover:border-yellow-400 cursor-pointer"
                    >
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">{PLAYBOOK_DATA[p].name}</h2>
                            <p className="text-gray-300 mt-4">{PLAYBOOK_DATA[p].description}</p>
                        </div>
                        <div className="mt-6 border-t-2 border-gray-600 pt-4">
                            <h3 className="text-xl font-bold text-cyan-400">Signature Move:</h3>
                            <p className="text-lg font-semibold">{PLAYBOOK_DATA[p].signatureMoveKey.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const App: React.FC = () => {
  // Meta-progression state (persists across runs)
  const [playerRoster, setPlayerRoster] = useState<Player[]>([]);
  const [playerCardCollection, setPlayerCardCollection] = useState<Card[]>([]);
  const [playerActiveDeck, setPlayerActiveDeck] = useState<Card[]>([]);


  // Run-specific state
  const [playerPlaybook, setPlayerPlaybook] = useState<Playbook | null>(null);
  const [mapNodes, setMapNodes] = useState<MapNode[]>(initialMapNodes);
  
  // View and game-specific state
  const [view, setView] = useState<GameView>('loading');
  const [currentOpponent, setCurrentOpponent] = useState<Team | null>(null);
  const [activeRoster, setActiveRoster] = useState<Player[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    const savedRoster = localStorage.getItem('asphalt-ascendants-roster');
    const savedCollection = localStorage.getItem('asphalt-ascendants-collection');
    const savedActiveDeck = localStorage.getItem('asphalt-ascendants-active-deck');

    if (savedRoster && savedCollection) {
        const collection = JSON.parse(savedCollection);
        setPlayerRoster(JSON.parse(savedRoster));
        setPlayerCardCollection(collection);

        if (savedActiveDeck) {
            setPlayerActiveDeck(JSON.parse(savedActiveDeck));
        } else {
            // If no active deck is saved, create one from the first 20 cards of the collection
            const initialDeck = collection.slice(0, 20);
            setPlayerActiveDeck(initialDeck);
            localStorage.setItem('asphalt-ascendants-active-deck', JSON.stringify(initialDeck));
        }
        setView('menu');
    } else {
        setView('initial_setup');
    }
  }, []);

  const handleResetAll = () => {
    localStorage.removeItem('asphalt-ascendants-roster');
    localStorage.removeItem('asphalt-ascendants-collection');
    localStorage.removeItem('asphalt-ascendants-active-deck');
    setPlayerRoster([]);
    setPlayerCardCollection([]);
    setPlayerActiveDeck([]);
    setView('initial_setup');
  };

  const handleSetupComplete = (initialRoster: Player[], initialCollection: Card[]) => {
    const initialDeck = initialCollection.slice(0, 20);
    setPlayerRoster(initialRoster);
    setPlayerCardCollection(initialCollection);
    setPlayerActiveDeck(initialDeck);
    localStorage.setItem('asphalt-ascendants-roster', JSON.stringify(initialRoster));
    localStorage.setItem('asphalt-ascendants-collection', JSON.stringify(initialCollection));
    localStorage.setItem('asphalt-ascendants-active-deck', JSON.stringify(initialDeck));
    setView('menu');
  };

  const handleNewRun = () => {
     if (playerActiveDeck.length < 20) {
        alert("Your active deck must have 20 cards. Please go to 'Manage Team' to build your deck.");
        return;
    }
    setPlayerPlaybook(null);
    setMapNodes(initialMapNodes.map(n => ({...n, completed: false})));
    setView('playbook');
  };

  const handleResetRun = () => {
    setView('menu');
  };
  
  const handleManageTeam = () => {
    setView('collection');
  };

  const handleSaveDeck = (newActiveDeck: Card[]) => {
    setPlayerActiveDeck(newActiveDeck);
    localStorage.setItem('asphalt-ascendants-active-deck', JSON.stringify(newActiveDeck));
    setView('menu');
  };

  const handleSelectPlaybook = (playbook: Playbook) => {
    setPlayerPlaybook(playbook);
    setView('map');
  };
  
  const handleStartGame = (opponent: Team) => {
    setCurrentOpponent(opponent);
    setView('team_select');
  };

  const handleConfirmTeam = (selectedPlayers: Player[]) => {
      setActiveRoster(selectedPlayers);
      setView('game');
  }

  const handleGameEnd = (didPlayerWin: boolean) => {
    if (didPlayerWin && currentOpponent) {
        const updatedNodes = mapNodes.map(node => {
            if (node.opponent?.name === currentOpponent.name) {
                return {...node, completed: true};
            }
            return node;
        });
        setMapNodes(updatedNodes);
    }
    setCurrentOpponent(null);
    setActiveRoster([]);
    setView('map');
  };

  const handleOpenPack = (nodeId: string) => {
    setActiveNodeId(nodeId);
    setView('pack');
  };

  const handlePackClosed = (pack: CardPack | null) => {
    if (pack) {
        const newRoster = [...playerRoster, pack.player];
        const newCollection = [...playerCardCollection, ...pack.cards];
        setPlayerRoster(newRoster);
        setPlayerCardCollection(newCollection);
        localStorage.setItem('asphalt-ascendants-roster', JSON.stringify(newRoster));
        localStorage.setItem('asphalt-ascendants-collection', JSON.stringify(newCollection));

        const updatedNodes = mapNodes.map(node => {
            if (node.id === activeNodeId) {
                return {...node, completed: true};
            }
            return node;
        });
        setMapNodes(updatedNodes);
    }
    setActiveNodeId(null);
    setView('map');
  };

  const renderView = () => {
    switch(view) {
      case 'loading':
        return <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
      case 'initial_setup':
        return <InitialSetupScreen onSetupComplete={handleSetupComplete} />;
      case 'menu':
        return <MainMenuScreen onNewRun={handleNewRun} onResetAll={handleResetAll} onManageTeam={handleManageTeam} />;
      case 'playbook':
        return <PlaybookSelection onSelect={handleSelectPlaybook} />;
      case 'collection':
        return <CollectionScreen 
                    roster={playerRoster} 
                    collection={playerCardCollection} 
                    activeDeck={playerActiveDeck}
                    onSaveDeck={handleSaveDeck}
                    onBack={() => setView('menu')} 
                />;
      case 'map':
        return <MapScreen mapNodes={mapNodes} onStartGame={handleStartGame} onOpenPack={handleOpenPack} onResetRun={handleResetRun} />;
      case 'team_select':
        if (!currentOpponent) {
            setView('map');
            return null;
        }
        return <TeamSelectionScreen 
                    roster={playerRoster} 
                    onConfirmTeam={handleConfirmTeam} 
                    onBack={() => setView('map')} 
                    opponentTeam={currentOpponent}
                />;
      case 'game':
        if (!currentOpponent || !playerPlaybook || activeRoster.length === 0 || playerActiveDeck.length === 0) {
            setView('map');
            return null;
        }
        return <GameScreen 
                  activeRoster={activeRoster}
                  playerDeck={playerActiveDeck}
                  playerPlaybook={playerPlaybook}
                  opponentTeam={currentOpponent} 
                  onGameEnd={handleGameEnd} 
                />;
      case 'pack':
        return <PackOpeningScreen onBack={handlePackClosed} />;
      default:
        return <MainMenuScreen onNewRun={handleNewRun} onResetAll={handleResetAll} onManageTeam={handleManageTeam} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900">
      {renderView()}
    </div>
  );
};

export default App;