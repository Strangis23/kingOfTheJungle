import React, { useEffect, useReducer, useCallback } from 'react';
import { GameState, GamePhase, Card, Player, Team, ActionAnimation, Playbook, Keyword, Archetype } from '../types';
import { gameReducer, getInitialGameState, ActionType } from '../game-reducer';
import ActionCard from '../components/ActionCard';
import PlayerDisplay from '../components/PlayerDisplay';
import MomentumTrack from '../components/MomentumTrack';
import EndGameModal from '../components/EndGameModal';
import CourtDisplay from '../components/CourtDisplay';
import PlayByPlay from '../components/PlayByPlay';
import CardDetailModal from '../components/CardDetailModal';
import PlayerDetailModal from '../components/PlayerDetailModal';
import MiniLog from '../components/MiniLog';

interface GameScreenProps {
  activeRoster: Player[];
  playerDeck: Card[];
  playerPlaybook: Playbook;
  opponentTeam: Team;
  onGameEnd: (didPlayerWin: boolean) => void;
}

const GameScreen: React.FC<GameScreenProps> = (props) => {
  const [gameState, dispatch] = useReducer(gameReducer, props, getInitialGameState);
  const { onGameEnd, playerDeck } = props;

  const getCardHypeCost = useCallback((card: Card): number => {
    let cost = card.hypeCost;
    if (gameState.isFifthGearActive) {
      cost = Math.max(0, cost - 1);
    }
    const activePlayer = gameState.playerTeam.players.find(p => p.id === gameState.activePlayerId);
    if (activePlayer) {
      if (activePlayer.archetypes.includes(Archetype.Superstar)) {
        cost = Math.max(0, cost - 1);
      } else if (activePlayer.archetypes.includes(card.archetype)) {
        cost = Math.max(0, cost - 1);
      }
    }
    return cost;
  }, [gameState.activePlayerId, gameState.playerTeam.players, gameState.isFifthGearActive]);

  // Opponent AI Turn Logic
  useEffect(() => {
    if (gameState.phase !== GamePhase.OpponentTurn) return;
    const thinkingTimeout = setTimeout(() => dispatch({ type: ActionType.AI_ACTION }), 1500);
    return () => clearTimeout(thinkingTimeout);
  }, [gameState.phase]);
  
  // Opponent AI Reaction Logic
  useEffect(() => {
    if (gameState.phase !== GamePhase.Reaction || gameState.possession !== 'player') return;
    const reactionTimeout = setTimeout(() => dispatch({ type: ActionType.AI_REACTION }), 1000);
    return () => clearTimeout(reactionTimeout);
  }, [gameState.phase, gameState.possession]);

  // Animation Resolution
  useEffect(() => {
    if (gameState.phase !== GamePhase.Animating) return;
    const animationTimeout = setTimeout(() => dispatch({ type: ActionType.RESOLVE_ANIMATION }), 2000);
    return () => clearTimeout(animationTimeout);
  }, [gameState.phase]);
  
  // Game Over Check
  useEffect(() => {
    if (gameState.phase === GamePhase.GameOver && onGameEnd) {
       const didPlayerWin = gameState.playerScore > gameState.opponentScore;
       // The modal will call the actual onGameEnd function
    }
  }, [gameState.phase, gameState.playerScore, gameState.opponentScore, onGameEnd]);


  const didPlayerWin = gameState.playerScore > gameState.opponentScore;
  const isTie = gameState.playerScore === gameState.opponentScore;

  const playerReactionCards = gameState.playerHand.filter(c => 
      c.keywords?.includes(Keyword.Reaction) &&
      gameState.pendingCard &&
      c.trigger?.includes(gameState.pendingCard.card.type)
  );

  return (
    <div className="w-full h-full bg-cover bg-center flex flex-col text-white relative overflow-hidden" style={{ backgroundImage: `url('${props.opponentTeam.courtImage}')`, backgroundColor: '#1a202c', backgroundBlendMode: 'overlay' }}>
      <CardDetailModal card={gameState.detailedCard} />
      <PlayerDetailModal player={gameState.detailedPlayer} onEnd={() => dispatch({ type: ActionType.SET_DETAILED_PLAYER, payload: null })} />
      {gameState.phase === GamePhase.GameOver && <EndGameModal didPlayerWin={didPlayerWin} isTie={isTie} onClose={() => onGameEnd(didPlayerWin)} />}
      <PlayByPlay 
        logs={gameState.gameLog} 
        isOpen={gameState.isLogOpen || !!gameState.detailedPlayer} 
        onClose={() => {
          dispatch({ type: ActionType.HIDE_LOG });
          dispatch({ type: ActionType.SET_DETAILED_PLAYER, payload: null });
        }} 
      />
      
      {/* Reaction Modal */}
       {gameState.phase === GamePhase.Reaction && gameState.possession === 'opponent' && gameState.pendingCard && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-40 animate-fade-in p-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-red-500 mb-4 animate-pulse">REACTION!</h2>
            <p className="text-lg sm:text-xl mb-4">Opponent plays:</p>
            <div className="sm:scale-125 mb-8">
              <ActionCard card={gameState.pendingCard.card} isDisabled={true} displayCost={gameState.pendingCard.card.hypeCost} onLongPressStart={(c) => dispatch({ type: ActionType.SET_DETAILED_CARD, payload: c })} onLongPressEnd={() => dispatch({ type: ActionType.SET_DETAILED_CARD, payload: null })} />
            </div>
            <p className="text-lg sm:text-xl mb-4">Your available reactions ({gameState.playerGrit} Grit):</p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {playerReactionCards.map(card => (
                  <ActionCard key={card.id} card={card} onClick={() => dispatch({ type: ActionType.PLAY_REACTION_CARD, payload: card })} isDisabled={gameState.playerGrit < card.gritCost!} displayCost={card.gritCost!} onLongPressStart={(c) => dispatch({ type: ActionType.SET_DETAILED_CARD, payload: c })} onLongPressEnd={() => dispatch({ type: ActionType.SET_DETAILED_CARD, payload: null })} />
              ))}
              <button onClick={() => dispatch({ type: ActionType.SKIP_REACTION })} className="w-28 h-44 sm:w-32 sm:h-48 md:w-40 md:h-56 bg-gray-600 text-white font-bold text-2xl rounded-lg border-4 border-gray-400 hover:bg-gray-500 transition-colors flex items-center justify-center text-center">
                  DO<br/>NOTHING
              </button>
            </div>
        </div>
      )}

      {/* Main Game Layout */}
      <div className="flex-grow grid grid-rows-[auto_1fr_auto] grid-cols-[1fr_auto_1fr] p-2 gap-2">
        
        {/* Opponent Hand */}
        <div className="col-span-3 row-start-1 h-20 md:h-24 flex-shrink-0">
            <div className="flex w-full h-full overflow-x-auto overflow-y-hidden p-2 justify-center items-center gap-1">
                {gameState.opponentHand.map((card, i) => (
                    <div key={card.id + i} className="-mr-8 md:-mr-10">
                    <ActionCard 
                        card={card}
                        isDisabled={true}
                        displayCost={card.hypeCost}
                        onLongPressStart={(c) => dispatch({ type: ActionType.SET_DETAILED_CARD, payload: c })} onLongPressEnd={() => dispatch({ type: ActionType.SET_DETAILED_CARD, payload: null })}
                        size="tiny"
                    />
                    </div>
                ))}
            </div>
        </div>
      
        {/* Center Row */}
        <div className="col-start-1 row-start-2 flex flex-col justify-end items-center">
             <MiniLog logs={gameState.gameLog} />
        </div>

        <div className="col-start-2 row-start-2 flex flex-col justify-center items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">Q{gameState.quarter}</h2>
            <MomentumTrack momentum={gameState.momentum} />
            <div className="flex-grow flex items-center justify-center relative min-h-0 w-full">
                <CourtDisplay animation={gameState.actionAnimation} />
                {gameState.phase === GamePhase.PlayerSelect && !gameState.actionAnimation && (
                    <div className="text-center bg-black/50 p-6 rounded-lg animate-fade-in">
                        <h2 className="text-2xl sm:text-4xl font-bold text-yellow-400 animate-pulse">SELECT YOUR PLAYER</h2>
                        <p className="text-lg sm:text-xl mt-2">Click a player below for a bonus.</p>
                        <button onClick={() => dispatch({ type: ActionType.SKIP_PLAYER_SELECT })} className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold">
                            Play without Bonus
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="col-start-3 row-start-2 flex justify-center items-center">
             <button onClick={() => dispatch({ type: ActionType.SHOW_LOG })} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400">Log</button>
        </div>


        {/* Player Hand */}
        <div className="col-span-3 row-start-3 h-48 sm:h-56 md:h-64 flex-shrink-0">
             <div className="flex w-full h-full overflow-x-auto overflow-y-hidden p-2 justify-center items-end gap-2 sm:gap-4">
              {gameState.playerHand.map(card => (
                <ActionCard 
                    key={card.id} 
                    card={card} 
                    onClick={() => dispatch({ type: ActionType.PLAY_CARD, payload: card })} 
                    isDisabled={gameState.phase !== GamePhase.PlayerTurn || getCardHypeCost(card) > gameState.playerHype} 
                    isPlayable={gameState.phase === GamePhase.PlayerTurn && getCardHypeCost(card) <= gameState.playerHype}
                    displayCost={getCardHypeCost(card)}
                    onLongPressStart={(c) => dispatch({ type: ActionType.SET_DETAILED_CARD, payload: c })} onLongPressEnd={() => dispatch({ type: ActionType.SET_DETAILED_CARD, payload: null })}
                />
              ))}
               <button onClick={() => dispatch({type: ActionType.END_TURN})} disabled={gameState.phase !== GamePhase.PlayerTurn} className="w-28 h-44 sm:w-32 sm:h-48 md:w-40 md:h-56 bg-red-800 text-white font-bold text-xl md:text-2xl rounded-lg border-4 border-red-500 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-center flex-shrink-0">
                  END<br/>TURN
              </button>
            </div>
        </div>
      </div>


      {/* Player and Opponent Info Overlays */}
      <div className="absolute top-0 left-0 p-4 w-full h-full pointer-events-none flex flex-col justify-between">
          {/* Opponent Info */}
          <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 pointer-events-auto">
                 {gameState.opponentTeam.players.map(p => <PlayerDisplay key={p.id} player={p} onLongPressStart={(pl) => dispatch({ type: ActionType.SET_DETAILED_PLAYER, payload: pl })} onLongPressEnd={() => dispatch({ type: ActionType.SET_DETAILED_PLAYER, payload: null })} />)}
              </div>
              <div className="text-right">
                <h2 className="text-xl sm:text-3xl font-bold">{gameState.opponentTeam.name}</h2>
                <p className="text-5xl sm:text-6xl font-mono">{gameState.opponentScore}</p>
              </div>
          </div>
          {/* Player Info */}
          <div className="flex justify-between items-end">
             <div className="text-left">
                <h2 className="text-xl sm:text-3xl font-bold">Your Team</h2>
                <p className="text-5xl sm:text-6xl font-mono">{gameState.playerScore}</p>
             </div>
             <div className="flex items-center gap-2 pointer-events-auto">
                {gameState.playerTeam.players.map(p => <PlayerDisplay key={p.id} player={p} isSelectable={gameState.phase === GamePhase.PlayerSelect} isSelected={p.id === gameState.activePlayerId} onClick={(id) => dispatch({ type: ActionType.SELECT_PLAYER, payload: id })} onLongPressStart={(pl) => dispatch({ type: ActionType.SET_DETAILED_PLAYER, payload: pl })} onLongPressEnd={() => dispatch({ type: ActionType.SET_DETAILED_PLAYER, payload: null })} />)}
             </div>
          </div>
      </div>
       {/* Resource Bars */}
      <div className="absolute bottom-[280px] md:bottom-[300px] left-4 right-4 flex justify-between pointer-events-none">
          <div className="flex gap-2">
            <div className="text-center bg-black/50 p-2 rounded w-28 sm:w-32">
                <p className="text-lg sm:text-xl font-bold text-cyan-400">HYPE</p>
                <p className="text-xl sm:text-2xl">{gameState.playerHype}/{gameState.playerMaxHype}</p>
            </div>
             <div className="text-center bg-black/50 p-2 rounded w-28 sm:w-32">
                <p className="text-lg sm:text-xl font-bold text-green-400">GRIT</p>
                <p className="text-xl sm:text-2xl">{gameState.playerGrit}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-center bg-black/50 p-2 rounded w-28 sm:w-32">
                <p className="text-lg sm:text-xl font-bold text-red-400">HYPE</p>
                <p className="text-xl sm:text-2xl">{gameState.opponentHype}/{gameState.opponentMaxHype}</p>
            </div>
            <div className="text-center bg-black/50 p-2 rounded w-28 sm:w-32">
                <p className="text-lg sm:text-xl font-bold text-green-400">GRIT</p>
                <p className="text-xl sm:text-2xl">{gameState.opponentGrit}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;