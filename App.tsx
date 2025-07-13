import React, { useState, useEffect } from 'react';
import GameScreen from './screens/GameScreen';
import MapScreen from './screens/MapScreen';
import PackOpeningScreen from './screens/PackOpeningScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import TeamSelectionScreen from './screens/TeamSelectionScreen';
import InitialSetupScreen from './screens/InitialSetupScreen';
import CollectionScreen from './screens/CollectionScreen';
import PlaybookSelectionScreen from './screens/PlaybookSelectionScreen';
import { Team, Playbook, Player, Card, MapNode, MapNodeType, CardPack } from './types';
import { CONCRETE_CRUSHERS, NEON_NETS } from './components/game-data';

type GameView = 'loading' | 'initial_setup' | 'menu' | 'playbook' | 'team_select' | 'map' | 'game' | 'pack' | 'collection';

const initialMapNodes: MapNode[] = [
  { id: 'node-1', type: MapNodeType.Game, opponent: CONCRETE_CRUSHERS, completed: false, position: { x: 20, y: 50 } },
  { id: 'node-2', type: MapNodeType.Pack, completed: false, position: { x: 50, y: 30 } },
  { id: 'node-3', type: MapNodeType.Game, opponent: NEON_NETS, completed: false, position: { x: 50, y: 70 } },
  { id: 'node-4', type: MapNodeType.Rival, opponent: CONCRETE_CRUSHERS, completed: false, position: { x: 80, y: 50 } },
];


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
        alert("Your active deck must have at least 20 cards. Please go to 'Manage Team' to build your deck.");
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
        return <PlaybookSelectionScreen onSelect={handleSelectPlaybook} />;
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
