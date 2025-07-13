import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GamePhase, Team, Card, CardType, Player, ActionAnimation, Playbook, Keyword, Archetype } from '../types.ts';
import { PLAYBOOK_DATA, createCard } from '../components/game-data.ts';
import ActionCard from '../components/ActionCard.tsx';
import PlayerDisplay from '../components/PlayerDisplay.tsx';
import MomentumTrack from '../components/MomentumTrack.tsx';
import EndGameModal from '../components/EndGameModal.tsx';
import CourtDisplay from '../components/CourtDisplay.tsx';
import PlayByPlay from '../components/PlayByPlay.tsx';
import CardDetailModal from '../components/CardDetailModal.tsx';

const shuffleDeck = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const MAX_POSSESSIONS = 40;
const HAND_SIZE = 5;
const MAX_HAND_SIZE = 7;

interface GameScreenProps {
  activeRoster: Player[];
  playerDeck: Card[];
  playerPlaybook: Playbook;
  opponentTeam: Team;
  onGameEnd: (didPlayerWin: boolean) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ activeRoster, playerDeck, playerPlaybook, opponentTeam, onGameEnd }) => {
  const [isPlayByPlayOpen, setPlayByPlayOpen] = useState(false);

  const [gameState, setGameState] = useState<GameState>(() => {
    const playerSignatureMove = createCard(PLAYBOOK_DATA[playerPlaybook].signatureMoveKey);
    const playerTeam: Team = {
      name: 'My Team',
      players: activeRoster,
      deck: playerDeck,
      playbook: playerPlaybook,
      signatureMove: playerSignatureMove,
      courtImage: '', // Player team doesn't have a court
    };

    const initialPlayerDeck = shuffleDeck(playerDeck);
    const opponentInitialDeck = shuffleDeck(opponentTeam.deck);

    return {
      playerTeam,
      opponentTeam: { ...opponentTeam, deck: opponentInitialDeck },
      playerHand: initialPlayerDeck.slice(0, HAND_SIZE),
      opponentHand: opponentInitialDeck.slice(0, HAND_SIZE),
      playerDeck: initialPlayerDeck.slice(HAND_SIZE),
      opponentDeck: opponentInitialDeck.slice(HAND_SIZE),
      playerDiscard: [],
      opponentDiscard: [],
      playerScore: 0,
      opponentScore: 0,
      playerHype: 5,
      playerMaxHype: 5,
      opponentHype: 5,
      opponentMaxHype: 5,
      playerGrit: 0,
      opponentGrit: 0,
      momentum: 0,
      possession: 'player',
      turn: 1,
      quarter: 1,
      phase: GamePhase.PlayerSelect,
      gameLog: ['Quarter 1 begins! Select a player for your turn.'],
      lastCardTypePlayed: undefined,
      activePlayerId: null,
      actionAnimation: null,
      pendingCard: null,
      isFifthGearActive: false,
      detailedCard: null,
    };
  });

  const setDetailedCard = (card: Card | null) => {
    setGameState(prev => ({...prev, detailedCard: card}));
  }

  const addToLog = useCallback((message: string) => {
    setGameState(prev => ({ ...prev, gameLog: [message, ...prev.gameLog] }));
  }, []);
  
  const drawCards = useCallback((
    deck: Card[],
    discard: Card[],
    count: number,
    logMessages: string[]
  ): { newHand: Card[], newDeck: Card[], newDiscard: Card[], newLogMessages: string[] } => {
    let currentDeck = [...deck];
    let currentDiscard = [...discard];
    const drawnCards: Card[] = [];
    let newLogs = [...logMessages];

    for (let i = 0; i < count; i++) {
        if (currentDeck.length === 0) {
            if (currentDiscard.length === 0) break;
            newLogs.push("Reshuffling discard pile into deck.");
            currentDeck = shuffleDeck(currentDiscard);
            currentDiscard = [];
        }
        drawnCards.push(currentDeck.pop()!);
    }
    return { newHand: drawnCards, newDeck: currentDeck, newDiscard: currentDiscard, newLogMessages: newLogs };
  }, []);

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
  
  const startNewPlayerTurn = useCallback((currentState: GameState): GameState => {
      let newState = { ...currentState };
      let logMessages: string[] = [];
      
      if(newState.turn >= MAX_POSSESSIONS) {
          newState.phase = GamePhase.GameOver;
          logMessages.push("Final whistle!");
          return { ...newState, gameLog: [...logMessages, ...newState.gameLog]};
      }
      
      logMessages.push("Player gets possession.");
      const { newHand, newDeck, newDiscard, newLogMessages } = drawCards(newState.playerDeck, [...newState.playerDiscard, ...newState.playerHand], HAND_SIZE - newState.playerHand.length, logMessages);
      logMessages = newLogMessages;
      
      newState.playerHand = [...newState.playerHand, ...newHand];
      newState.playerDeck = newDeck;
      newState.playerDiscard = newDiscard;

      const nextTurn = newState.turn + 1;
      const nextQuarter = Math.min(4, Math.floor(newState.turn / (MAX_POSSESSIONS/4)) + 1);

      if(nextQuarter > newState.quarter) {
          logMessages.push(`End of Quarter ${newState.quarter}.`);
          logMessages.push(`Quarter ${nextQuarter} begins!`);
          newState.quarter = nextQuarter;
      }
      
      newState.turn = nextTurn;
      newState.possession = 'player';
      newState.activePlayerId = null;
      newState.isFifthGearActive = false;
      newState.playerMaxHype = Math.min(10, newState.playerMaxHype + 1);
      
      if (newState.opponentTeam.players.some(p => p.statuses.some(s => s.name === 'NoHypeGain'))) {
        logMessages.push("THE LOCKDOWN! Player gains no Hype this turn!");
      } else {
        newState.playerHype = newState.playerMaxHype;
        if (newState.playerTeam.playbook === Playbook.PaceAndSpace) {
            newState.playerHype += 1;
            logMessages.push("Pace and Space: Gained 1 extra Hype.");
        }
      }

      const oppGrit = 2 + (newState.opponentTeam.playbook === Playbook.GritAndGrind ? 1 : 0);
      newState.opponentGrit = oppGrit;
      logMessages.push(`Opponent gains ${oppGrit} Grit for defense.`);
      
      newState.phase = GamePhase.PlayerSelect;

      // Tick down status effects
      newState.playerTeam.players.forEach(p => p.statuses = p.statuses.map(s => ({...s, duration: s.duration - 1})).filter(s => s.duration > 0));
      
      return { ...newState, gameLog: [...logMessages, ...newState.gameLog] };
  }, [drawCards]);
  
  const startNewOpponentTurn = useCallback((currentState: GameState): GameState => {
      let newState = { ...currentState };
      let logMessages: string[] = [];

      if(newState.turn >= MAX_POSSESSIONS) {
          newState.phase = GamePhase.GameOver;
          logMessages.push("Final whistle!");
          return { ...newState, gameLog: [...logMessages, ...newState.gameLog] };
      }
      
      logMessages.push("Opponent gets possession.");

      const { newHand, newDeck, newDiscard, newLogMessages } = drawCards(newState.opponentDeck, [...newState.opponentDiscard, ...newState.opponentHand], HAND_SIZE - newState.opponentHand.length, logMessages);
      logMessages = newLogMessages;
      
      newState.opponentHand = [...newState.opponentHand, ...newHand];
      newState.opponentDeck = newDeck;
      newState.opponentDiscard = newDiscard;

      newState.possession = 'opponent';
      newState.phase = GamePhase.OpponentTurn;
      newState.opponentMaxHype = Math.min(10, newState.opponentMaxHype + 1);
      
      if (newState.playerTeam.players.some(p => p.statuses.some(s => s.name === 'NoHypeGain'))) {
         logMessages.push("THE LOCKDOWN! Opponent gains no Hype this turn!");
      } else {
        newState.opponentHype = newState.opponentMaxHype;
        if (newState.opponentTeam.playbook === Playbook.PaceAndSpace) {
            newState.opponentHype += 1;
        }
      }

      const playerGrit = 2 + (newState.playerTeam.playbook === Playbook.GritAndGrind ? 1 : 0);
      newState.playerGrit = playerGrit;
      logMessages.push(`Player gains ${playerGrit} Grit for defense.`);
      
      newState.opponentTeam.players.forEach(p => p.statuses = p.statuses.map(s => ({...s, duration: s.duration - 1})).filter(s => s.duration > 0));

      return { ...newState, gameLog: [...logMessages, ...newState.gameLog] };
  }, [drawCards]);

  const resolveActionState = useCallback((
    initialState: GameState, 
    pendingCard: { card: Card; by: 'player' | 'opponent' }, 
    reactionCard?: Card
  ): GameState => {
    
    let newState = { ...initialState };
    let logMessages: string[] = [];
    const { card, by } = pendingCard;
    let animation: ActionAnimation = { card, reactionCard, by, outcome: 'generic' };
    
    let success = true;
    let possessionChange = false;
    let isNegated = false;

    // --- Momentum Helper ---
    const updateMomentum = (state: GameState, change: number): GameState => {
      let tempState = {...state};
      const oldMomentum = tempState.momentum;
      const newMomentum = Math.max(-10, Math.min(10, oldMomentum + change));
      tempState.momentum = newMomentum;

      if (oldMomentum < 10 && newMomentum >= 10 && !tempState.playerHand.some(c => c.isSignatureMove)) {
          logMessages.push("🔥 ON FIRE! Player's Signature Move added to hand!");
          tempState.playerHand = [...tempState.playerHand, tempState.playerTeam.signatureMove];
      }
      if (oldMomentum > -10 && newMomentum <= -10 && !tempState.opponentHand.some(c => c.isSignatureMove)) {
          logMessages.push("⚠️ UNSTOPPABLE! Opponent's Signature Move added to hand!");
          tempState.opponentHand = [...tempState.opponentHand, tempState.opponentTeam.signatureMove];
      }
      return tempState;
    }
    
    // --- Reaction Card Logic ---
    if (reactionCard) {
        logMessages.push(`${by === 'player' ? 'Opponent' : 'Player'} reacts with ${reactionCard.name}!`);
        switch(reactionCard.name) {
            case 'Vicious Block':
                animation.outcome = 'block';
                isNegated = true;
                // possessionChange = true; // No longer a turnover
                newState = updateMomentum(newState, by === 'player' ? -2 : 2);
                logMessages.push(`The shot is BLOCKED! The offense keeps possession, but loses momentum.`);
                break;
            case 'Pick Pocket':
                if (Math.random() < 0.33) {
                    animation.outcome = 'steal';
                    isNegated = true;
                    // possessionChange = true; // No longer a turnover
                    newState = updateMomentum(newState, by === 'player' ? -2 : 2);
                    logMessages.push("Successful steal! The play is broken up, but possession is maintained. Momentum lost.");
                } else {
                    logMessages.push("Pick pocket attempt failed!");
                }
                break;
            case 'Intercept':
                animation.outcome = 'negated';
                isNegated = true;
                const drawResult = drawCards(
                    by === 'player' ? newState.opponentDeck : newState.playerDeck, 
                    by === 'player' ? newState.opponentDiscard : newState.playerDiscard, 
                    1, []
                );
                if (by === 'player') {
                    newState.opponentHand = [...newState.opponentHand, ...drawResult.newHand];
                    newState.opponentDeck = drawResult.newDeck;
                    newState.opponentDiscard = drawResult.newDiscard;
                } else {
                    newState.playerHand = [...newState.playerHand, ...drawResult.newHand];
                    newState.playerDeck = drawResult.newDeck;
                    newState.playerDiscard = drawResult.newDiscard;
                }
                if (Math.random() < 0.25) {
                    // possessionChange = true; // No longer a turnover
                    animation.outcome = 'steal'; // Use steal animation for clarity
                    newState = updateMomentum(newState, by === 'player' ? -2 : 2);
                    logMessages.push("Pass intercepted! Play is disrupted, but possession is maintained. Momentum lost.");
                }
                break;
        }
    }
    
    if (isNegated) success = false;

    // --- Shot Logic ---
    if (card.type === CardType.Shot && !isNegated) {
        let shotChance = card.successChance || 70;
        if (reactionCard?.name === 'Contest Shot') {
            shotChance -= 30;
            logMessages.push(`Shot is contested! Success chance reduced to ${shotChance}%.`);
        }
        if (reactionCard?.name === 'Wrecking Ball') {
            // Can't be blocked, but can still be contested. But since this is a reaction logic, it's weird.
            // Let's assume Wrecking Ball is not a reaction. The logic is for when it's the main card.
        }
        success = Math.random() * 100 < shotChance;
        animation.points = card.name.includes("Three") ? 3 : 2;
        animation.outcome = success ? 'score' : 'miss';

        if (!success && card.name === 'Wrecking Ball') {
            logMessages.push("Wrecking Ball misses! Player discards a random card.");
            if(by === 'opponent' && newState.playerHand.length > 0) {
                const cardToDiscard = newState.playerHand[Math.floor(Math.random() * newState.playerHand.length)];
                newState.playerHand = newState.playerHand.filter(c => c.id !== cardToDiscard.id);
                newState.playerDiscard = [...newState.playerDiscard, cardToDiscard];
                logMessages.push(`Player discards ${cardToDiscard.name}.`);
            }
        }
    }

    // --- Card Main Effect Resolution ---
    if (success) {
      switch(card.name) {
          case 'Fifth Gear':
              const cardsToDraw = Math.max(0, MAX_HAND_SIZE - newState.playerHand.length);
              const { newHand, newDeck, newDiscard, newLogMessages } = drawCards(newState.playerDeck, newState.playerDiscard, cardsToDraw, []);
              newState.playerHand.push(...newHand);
              newState.playerDeck = newDeck;
              newState.playerDiscard = newDiscard;
              logMessages.push(...newLogMessages);
              newState.playerHype = Math.min(10, newState.playerHype + 5);
              newState.isFifthGearActive = true;
              logMessages.push("Fifth Gear! Hand filled, Hype boosted, cards cost less this turn!");
              break;
          case 'The Lockdown':
              logMessages.push("THE LOCKDOWN! Opponent's offense is shut down next turn.");
              newState.opponentTeam.players.forEach(p => p.statuses.push({ name: 'CantPlayShots', duration: 1 }, { name: 'NoHypeGain', duration: 1 }));
              break;
          case 'Glitch in the System':
              const targetCount = Math.min(2, newState.opponentDiscard.length);
              if (targetCount > 0) {
                logMessages.push("Glitch in the System! Opponent recovers cards!");
                const shuffledDiscard = shuffleDeck(newState.opponentDiscard);
                const recoveredCards = shuffledDiscard.slice(0, targetCount).map(c => ({...c, hypeCost: 0, temporary: true})); // temp flag to reset cost later
                newState.opponentDiscard = shuffledDiscard.slice(targetCount);
                newState.opponentHand.push(...recoveredCards);
              }
              break;
          case 'Quick Pass':
              const {newHand: drawnCards, newDeck: d, newDiscard: di, newLogMessages: nl} = drawCards(by === 'player' ? newState.playerDeck : newState.opponentDeck, by === 'player' ? newState.playerDiscard : newState.opponentDiscard, 1, []);
              if (by === 'player') {
                  newState.playerHand.push(...drawnCards);
                  newState.playerDeck = d;
                  newState.playerDiscard = di;
              } else {
                  newState.opponentHand.push(...drawnCards);
                  newState.opponentDeck = d;
                  newState.opponentDiscard = di;
              }
              logMessages.push(...nl);
              break;
          case 'Crossover':
               newState = updateMomentum(newState, by === 'player' ? 2 : -2);
               logMessages.push("Smooth crossover! Momentum up!");
               break;
      }
    }
    
    // --- Post-Action Score/Miss updates ---
    if (success && card.type === CardType.Shot) {
        const points = animation.points!;
        if (by === 'player') {
            newState.playerScore += points;
            newState = updateMomentum(newState, points);
        } else {
            newState.opponentScore += points;
            newState = updateMomentum(newState, -points);
        }
        logMessages.push(`${by === 'player' ? 'Player' : 'Opponent'} scores ${points} points!`);
    } else if (card.type === CardType.Shot && !isNegated) {
        logMessages.push("The shot misses!");
    }

    newState.actionAnimation = animation;
    newState.phase = GamePhase.Animating;
    newState.pendingCard = null;
    
    // --- Special Possession Logic (Turnovers) ---
    if (possessionChange) {
        logMessages.push("Turnover!");
        if (by === 'player') { // Opponent stole/blocked from player
            if (newState.opponentTeam.playbook === Playbook.FastbreakKings) {
                logMessages.push("Fastbreak Kings: Opponent gains 3 Momentum!");
                newState = updateMomentum(newState, -3);
            }
            newState.gameLog = [...logMessages, ...newState.gameLog];
            return startNewOpponentTurn(newState);
        } else { // Player stole/blocked from opponent
            if (newState.playerTeam.playbook === Playbook.FastbreakKings) {
                 logMessages.push("Fastbreak Kings: Player gains 3 Momentum!");
                 newState = updateMomentum(newState, 3);
            }
            newState.gameLog = [...logMessages, ...newState.gameLog];
            return startNewPlayerTurn(newState);
        }
    }

    if (success && card.name === 'Showtime Chain') {
        logMessages.push("SHOWTIME! Player keeps the ball!");
        const { newHand, newDeck, newDiscard, newLogMessages } = drawCards(newState.playerDeck, newState.playerDiscard, 2, []);
        newState.playerHand.push(...newHand);
        newState.playerDeck = newDeck;
        newState.playerDiscard = newDiscard;
        logMessages.push(...newLogMessages);
    }
    
    newState.gameLog = [...logMessages, ...newState.gameLog];
    return newState;
  }, [drawCards, startNewPlayerTurn, startNewOpponentTurn]);


  const handleSelectPlayer = (playerId: string) => {
    if (gameState.phase !== GamePhase.PlayerSelect) return;
    const player = gameState.playerTeam.players.find(p => p.id === playerId)!;
    let bonusText = `matching archetype cards cost 1 less Hype.`;
    if (player.archetypes.includes(Archetype.Superstar)) {
        bonusText = `ALL cards cost 1 less Hype this turn!`
    }
    addToLog(`${player.name} leads the charge! ${bonusText}`);
    setGameState(prev => ({ ...prev, activePlayerId: playerId, phase: GamePhase.PlayerTurn }));
  };

  const handleSkipPlayerSelect = () => {
     if (gameState.phase !== GamePhase.PlayerSelect) return;
     addToLog(`Playing without a leader bonus this turn.`);
     setGameState(prev => ({ ...prev, activePlayerId: null, phase: GamePhase.PlayerTurn }));
  };

  const handlePlayCard = (card: Card) => {
    // This function is now the onClick handler for playable cards
    const currentCost = getCardHypeCost(card);
    // The isDisabled prop on ActionCard already handles most of this, but double-checking here is safe.
    if (gameState.phase !== GamePhase.PlayerTurn || gameState.playerHype < currentCost) return;
    
    addToLog(`Player plays ${card.name}.`);
    
    setGameState(prev => {
        let newState = { ...prev };
        newState.playerHype -= currentCost;
        newState.playerHand = prev.playerHand.filter(c => c.id !== card.id);
        newState.playerDiscard = [...newState.playerDiscard, card];
        
        if (card.isSignatureMove) {
            newState.gameLog = ["Signature Move played! Momentum resets.", ...newState.gameLog];
            newState.momentum = 0;
        }

        newState.phase = GamePhase.Reaction;
        newState.pendingCard = { card, by: 'player' };
        return newState;
    });
  };
  
  const handleEndTurn = () => {
    if (gameState.phase !== GamePhase.PlayerTurn) return;
    addToLog("Player ends their possession.");
    setGameState(prev => startNewOpponentTurn(prev));
  };

  // Player Reaction
  const handlePlayReactionCard = (reactionCard: Card) => {
    if (gameState.phase !== GamePhase.Reaction || !gameState.pendingCard || gameState.possession !== 'opponent') return;
    if (reactionCard.gritCost! > gameState.playerGrit) return;
    
    setGameState(prev => {
      const stateAfterGrit = {...prev, playerGrit: prev.playerGrit - reactionCard.gritCost!};
      return resolveActionState(stateAfterGrit, stateAfterGrit.pendingCard!, reactionCard);
    });
  };
  
  const handleSkipReaction = () => {
    if (gameState.phase !== GamePhase.Reaction || !gameState.pendingCard) return;
    setGameState(prev => resolveActionState(prev, prev.pendingCard!));
  };

  // Opponent AI Turn
  useEffect(() => {
    if (gameState.phase !== GamePhase.OpponentTurn) return;

    const thinkingTimeout = setTimeout(() => {
        let newState = { ...gameState };
        
        const lockdownStatus = newState.opponentTeam.players.find(p => p.statuses.some(s => s.name === 'CantPlayShots'));

        // AI Logic: Prioritize signature move, then high-cost cards.
        const sigMove = newState.opponentHand.find(c => c.isSignatureMove);
        if (sigMove && sigMove.hypeCost <= newState.opponentHype) {
            addToLog(`Opponent plays their Signature Move: ${sigMove.name}!`);
            newState.opponentHype -= sigMove.hypeCost;
            newState.opponentHand = newState.opponentHand.filter(c => c.id !== sigMove.id);
            newState.opponentDiscard = [...newState.opponentDiscard, sigMove];
            newState.momentum = 0;
            newState.pendingCard = { card: sigMove, by: 'opponent' };
            setGameState({...newState, phase: GamePhase.Reaction});
            return;
        }

        const playableCards = newState.opponentHand
            .filter(c => c.hypeCost <= newState.opponentHype && (!lockdownStatus || c.type !== CardType.Shot))
            .sort((a, b) => b.hypeCost - a.hypeCost);
        
        const cardToPlay = playableCards.length > 0 ? playableCards[0] : null;

        if (!cardToPlay) {
            addToLog("Opponent has no play and ends their turn.");
            setGameState(prev => startNewPlayerTurn(prev));
            return;
        }

        addToLog(`Opponent plays ${cardToPlay.name}.`);
        setGameState(prev => ({
            ...prev,
            opponentHype: prev.opponentHype - cardToPlay.hypeCost,
            opponentHand: prev.opponentHand.filter(c => c.id !== cardToPlay.id),
            opponentDiscard: [...prev.opponentDiscard, cardToPlay],
            phase: GamePhase.Reaction,
            pendingCard: { card: cardToPlay, by: 'opponent' },
        }));

    }, 1500);

    return () => clearTimeout(thinkingTimeout);
  }, [gameState.phase, gameState.opponentHype, gameState.opponentHand, addToLog, startNewPlayerTurn]);
  
  // Opponent AI Reaction
  useEffect(() => {
    if (gameState.phase !== GamePhase.Reaction || gameState.possession !== 'player' || !gameState.pendingCard) return;

    const reactionTimeout = setTimeout(() => {
      setGameState(prev => {
        const pendingType = prev.pendingCard!.card.type;
        const possibleReactions = prev.opponentHand.filter(c => 
            c.keywords?.includes(Keyword.Reaction) && 
            c.trigger?.includes(pendingType) &&
            c.gritCost! <= prev.opponentGrit &&
            // AI for Wrecking Ball: don't try to block it
            !(prev.pendingCard?.card.name === 'Wrecking Ball' && c.name === 'Vicious Block')
        );

        // Simple AI: play the first possible reaction.
        if (possibleReactions.length > 0) {
            const reactionCard = possibleReactions[0];
            const stateAfterGrit = {...prev, opponentGrit: prev.opponentGrit - reactionCard.gritCost!};
            return resolveActionState(stateAfterGrit, stateAfterGrit.pendingCard!, reactionCard);
        } else {
            return resolveActionState(prev, prev.pendingCard!);
        }
      });
    }, 1000);

    return () => clearTimeout(reactionTimeout);
  }, [gameState.phase, gameState.possession, resolveActionState]);

  // Animation Resolution
  useEffect(() => {
    if (gameState.phase !== GamePhase.Animating || !gameState.actionAnimation) return;

    const { by, card, outcome } = gameState.actionAnimation;

    const animationTimeout = setTimeout(() => {
        setGameState(prev => {
            let newState = { ...prev, actionAnimation: null };
            
            // Turnovers are handled by resolveActionState now. This only handles normal turn progression.
            if (by === 'player') {
                if (card.name === 'Showtime Chain' && outcome === 'score') {
                    newState.phase = GamePhase.PlayerTurn; // Go back to player turn
                } else {
                   // After a player's non-turnover action, it's still player's turn until they end it.
                   newState.phase = GamePhase.PlayerTurn;
                }
            } else { // Opponent's turn action (non-turnover) just ended.
                // Opponent's turn ends after a shot. Otherwise, they continue.
                if (card.type === CardType.Shot) {
                    newState = startNewPlayerTurn(newState);
                } else {
                    newState.phase = GamePhase.OpponentTurn;
                }
            }
            return newState;
        })
    }, 2000);

    return () => clearTimeout(animationTimeout);
  }, [gameState.phase, gameState.actionAnimation, startNewPlayerTurn]);

  const didPlayerWin = gameState.playerScore > gameState.opponentScore;
  const isTie = gameState.playerScore === gameState.opponentScore;

  const playerReactionCards = gameState.playerHand.filter(c => 
      c.keywords?.includes(Keyword.Reaction) &&
      gameState.pendingCard &&
      c.trigger?.includes(gameState.pendingCard.card.type)
  );

  return (
    <div className="w-full h-full bg-cover bg-center flex flex-col p-2 sm:p-4 text-white relative overflow-hidden" style={{ backgroundImage: `url('${opponentTeam.courtImage}')`, backgroundColor: '#1a202c', backgroundBlendMode: 'overlay' }}>
      <CardDetailModal card={gameState.detailedCard} />
      {gameState.phase === GamePhase.GameOver && <EndGameModal didPlayerWin={didPlayerWin} isTie={isTie} onClose={() => onGameEnd(didPlayerWin)} />}
      <PlayByPlay logs={gameState.gameLog} isOpen={isPlayByPlayOpen} onClose={() => setPlayByPlayOpen(false)} />
      
       {gameState.phase === GamePhase.Reaction && gameState.possession === 'opponent' && gameState.pendingCard && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-40 animate-fade-in p-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-red-500 mb-4 animate-pulse">REACTION!</h2>
            <p className="text-lg sm:text-xl mb-4">Opponent plays:</p>
            <div className="sm:scale-125 mb-8">
              <ActionCard card={gameState.pendingCard.card} isDisabled={true} displayCost={gameState.pendingCard.card.hypeCost} onLongPressStart={setDetailedCard} onLongPressEnd={() => setDetailedCard(null)} />
            </div>
            <p className="text-lg sm:text-xl mb-4">Your available reactions ({gameState.playerGrit} Grit):</p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {playerReactionCards.map(card => (
                  <ActionCard key={card.id} card={card} onClick={() => handlePlayReactionCard(card)} isDisabled={gameState.playerGrit < card.gritCost!} displayCost={card.gritCost!} onLongPressStart={setDetailedCard} onLongPressEnd={() => setDetailedCard(null)} />
              ))}
              <button onClick={handleSkipReaction} className="w-28 h-44 sm:w-32 sm:h-48 md:w-40 md:h-56 bg-gray-600 text-white font-bold text-2xl rounded-lg border-4 border-gray-400 hover:bg-gray-500 transition-colors flex items-center justify-center text-center">
                  DO<br/>NOTHING
              </button>
            </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="text-center bg-black/50 p-2 rounded">
            <h2 className="text-xl sm:text-2xl font-bold">Q{gameState.quarter}</h2>
            <h2 className="text-lg sm:text-xl font-bold">Turn: {Math.min(MAX_POSSESSIONS, gameState.turn)}/{MAX_POSSESSIONS}</h2>
        </div>
        <button onClick={() => setPlayByPlayOpen(true)} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400">Log</button>
      </div>

       {/* Opponent's Hand */}
      <div className="h-28 md:h-32 w-full flex-shrink-0">
          <div className="flex w-full h-full overflow-x-auto overflow-y-hidden p-2 justify-center items-center gap-2">
              {gameState.opponentHand.map((card) => (
                  <ActionCard 
                      key={card.id}
                      card={card}
                      isDisabled={true}
                      displayCost={card.hypeCost}
                      onLongPressStart={setDetailedCard}
                      onLongPressEnd={() => setDetailedCard(null)}
                      size="tiny"
                  />
              ))}
          </div>
      </div>
      
      {/* Opponent's Info */}
      <div className="flex flex-col sm:flex-row justify-around items-center gap-2 my-1">
        <div className="flex-1 flex justify-center sm:justify-start gap-1 flex-wrap order-2 sm:order-1">
          {gameState.opponentTeam.players.map(p => <PlayerDisplay key={p.id} player={p} />)}
        </div>
        <div className="text-center order-1 sm:order-2">
            <h2 className="text-xl sm:text-3xl font-bold">{gameState.opponentTeam.name}</h2>
            <p className="text-5xl sm:text-6xl font-mono">{gameState.opponentScore}</p>
        </div>
         <div className="flex-1 flex justify-center sm:justify-end items-center order-3 gap-2">
            <div className="text-center bg-black/50 p-2 rounded w-28 sm:w-32">
                <p className="text-lg sm:text-xl font-bold text-red-400">HYPE</p>
                <p className="text-xl sm:text-2xl">{gameState.opponentHype}/{gameState.opponentMaxHype}</p>
                <p className="text-xs sm:text-base">Deck: {gameState.opponentDeck.length}</p>
            </div>
            <div className="text-center bg-black/50 p-2 rounded w-28 sm:w-32">
                <p className="text-lg sm:text-xl font-bold text-green-400">GRIT</p>
                <p className="text-xl sm:text-2xl">{gameState.opponentGrit}</p>
                <p className="text-xs sm:text-sm">For Defense</p>
            </div>
        </div>
      </div>
      
      <MomentumTrack momentum={gameState.momentum} />

      <div className="flex-grow flex items-center justify-center relative min-h-0">
          <CourtDisplay animation={gameState.actionAnimation} />
          <div className="w-full max-w-3xl flex flex-col items-center justify-center space-y-4">
              {gameState.phase === GamePhase.PlayerSelect && !gameState.actionAnimation && (
                <div className="text-center bg-black/50 p-6 rounded-lg animate-fade-in">
                    <h2 className="text-2xl sm:text-4xl font-bold text-yellow-400 animate-pulse">SELECT YOUR PLAYER</h2>
                    <p className="text-lg sm:text-xl mt-2">Click a player below for a bonus.</p>
                    <button onClick={handleSkipPlayerSelect} className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold">
                        Play without Bonus
                    </button>
                </div>
              )}
          </div>
      </div>
      
      {/* Player's Info */}
      <div className="flex flex-col-reverse sm:flex-row justify-around items-center gap-2 my-1">
         <div className="flex-1 flex justify-center sm:justify-start items-center gap-2 order-3 sm:order-1">
            <div className="text-center bg-black/50 p-2 rounded w-28 sm:w-32">
                <p className="text-lg sm:text-xl font-bold text-cyan-400">HYPE</p>
                <p className="text-xl sm:text-2xl">{gameState.playerHype}/{gameState.playerMaxHype}</p>
                <p className="text-xs sm:text-base">Deck: {gameState.playerDeck.length}</p>
            </div>
             <div className="text-center bg-black/50 p-2 rounded w-28 sm:w-32">
                <p className="text-lg sm:text-xl font-bold text-green-400">GRIT</p>
                <p className="text-xl sm:text-2xl">{gameState.playerGrit}</p>
                <p className="text-xs sm:text-sm">For Defense</p>
            </div>
         </div>
         <div className="text-center order-1 sm:order-2">
            <h2 className="text-xl sm:text-3xl font-bold">Your Team</h2>
            <p className="text-5xl sm:text-6xl font-mono">{gameState.playerScore}</p>
        </div>
        <div className="flex-1 flex justify-center sm:justify-end gap-1 flex-wrap order-2 sm:order-3">
          {gameState.playerTeam.players.map(p => <PlayerDisplay key={p.id} player={p} isSelectable={gameState.phase === GamePhase.PlayerSelect} isSelected={p.id === gameState.activePlayerId} onClick={handleSelectPlayer} />)}
        </div>
      </div>
      
      {/* Player's Hand */}
      <div className="h-48 sm:h-56 md:h-64 w-full flex-shrink-0">
          <div className="flex w-full h-full overflow-x-auto overflow-y-hidden p-2 justify-center items-end gap-2 sm:gap-4">
              {gameState.playerHand.map(card => (
                <ActionCard 
                    key={card.id} 
                    card={card} 
                    onClick={handlePlayCard} 
                    isDisabled={gameState.phase !== GamePhase.PlayerTurn || gameState.playerHype < getCardHypeCost(card)} 
                    displayCost={getCardHypeCost(card)}
                    onLongPressStart={setDetailedCard}
                    onLongPressEnd={() => setDetailedCard(null)}
                />
              ))}
               <button onClick={handleEndTurn} disabled={gameState.phase !== GamePhase.PlayerTurn} className="w-28 h-44 sm:w-32 sm:h-48 md:w-40 md:h-56 bg-red-800 text-white font-bold text-xl md:text-2xl rounded-lg border-4 border-red-500 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-center flex-shrink-0">
                  END<br/>TURN
              </button>
          </div>
      </div>
    </div>
  );
};

export default GameScreen;