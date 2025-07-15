
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

  const getInitialGameState = useCallback((): GameState => {
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
      detailedCard: null,
      isFifthGearActive: false,
      playerShotSuccessBonus: 0,
      player3PtSuccessBonus: 0,
      playerBonusMomentumOnScore: 0,
      playerNextShotCostReduction: 0,
      playerNextSharpshooterCostReduction: 0,
      playerNextPassCostReduction: 0,
      playerNextShotSuccessBonus: 0,
      playerIsDeadeyeActive: false,
      playerCannotBeBlocked: false,
      playerBlockSlasherReactions: false,
      playerSuccessfulBlocksGrantPossession: false,
      playerInterceptBonus: 0,
      opponentShotSuccessReduction: 0,
      opponentSlasherCostIncrease: 0,
      opponentCannotReact: false,
      opponentNextCardCostIncrease: 0,
      cardsPlayedThisTurn: [],
      didScoreThisTurn: false,
    };
  }, [activeRoster, playerDeck, playerPlaybook, opponentTeam]);

  const [gameState, setGameState] = useState<GameState>(getInitialGameState);

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
  
  // Clear temporary offensive buffs for the current possessor
  const clearOffensiveEffects = (state: GameState): GameState => {
      const newState = { ...state };
      if (state.possession === 'player') {
          newState.isFifthGearActive = false;
          newState.playerShotSuccessBonus = 0;
          newState.player3PtSuccessBonus = 0;
          newState.playerBonusMomentumOnScore = 0;
          newState.playerNextShotCostReduction = 0;
          newState.playerNextSharpshooterCostReduction = 0;
          newState.playerNextPassCostReduction = 0;
          newState.playerNextShotSuccessBonus = 0;
          newState.playerIsDeadeyeActive = false;
          newState.playerCannotBeBlocked = false;
          newState.playerBlockSlasherReactions = false;
      } else {
          // Add opponent offensive effects here if they exist
      }
      newState.cardsPlayedThisTurn = [];
      newState.didScoreThisTurn = false;
      return newState;
  };

  const getCardHypeCost = useCallback((card: Card, owner: 'player' | 'opponent'): number => {
    let cost = card.hypeCost;
    const currentTurnState = owner === 'player' ? gameState : { ...gameState, activePlayerId: null }; // Simplified for opponent for now

    if (currentTurnState.isFifthGearActive) {
      cost = Math.max(0, cost - 1);
    }
    
    // Archetype matching bonus
    const activePlayer = currentTurnState.playerTeam.players.find(p => p.id === currentTurnState.activePlayerId);
    if (activePlayer) {
      if (activePlayer.archetypes.includes(Archetype.Superstar)) {
        cost = Math.max(0, cost - 1);
      } else if (activePlayer.archetypes.includes(card.archetype)) {
        cost = Math.max(0, cost - 1);
      }
    }

    // Specific card cost reductions
    if (card.type === CardType.Shot && currentTurnState.playerNextShotCostReduction > 0) {
      cost = Math.max(0, cost - currentTurnState.playerNextShotCostReduction);
    }
    if (card.archetype === Archetype.Sharpshooter && currentTurnState.playerNextSharpshooterCostReduction > 0) {
        cost = Math.max(0, cost - currentTurnState.playerNextSharpshooterCostReduction);
    }
    if (card.type === CardType.Pass && currentTurnState.playerNextPassCostReduction > 0) {
        cost = 0;
    }
    if (card.name === 'Quick Shot' && gameState.lastCardTypePlayed === CardType.Pass) {
        cost = 0;
    }
    if (card.name === 'Heat Check' && gameState.momentum >= 5) {
        cost = 0;
    }

    // Cost increases
    if (owner === 'player' && card.archetype === Archetype.Slasher && gameState.opponentSlasherCostIncrease > 0) {
        cost += gameState.opponentSlasherCostIncrease;
    }
     if (owner === 'player' && gameState.opponentNextCardCostIncrease > 0) {
        cost += gameState.opponentNextCardCostIncrease;
    }


    return cost;
  }, [gameState]);
  
  const startNewPlayerTurn = useCallback((currentState: GameState): GameState => {
      let newState = clearOffensiveEffects({ ...currentState });
      
      if(newState.turn >= MAX_POSSESSIONS) {
          newState.phase = GamePhase.GameOver;
          newState.gameLog = ["Final whistle!", ...newState.gameLog];
          return newState;
      }
      
      let logMessages: string[] = ["Player gets possession."];
      const { newHand, newDeck, newDiscard, newLogMessages } = drawCards(newState.playerDeck, [...newState.playerDiscard, ...newState.playerHand], HAND_SIZE - newState.playerHand.length, []);
      logMessages.push(...newLogMessages);
      
      newState.playerHand = [...newState.playerHand, ...newHand];
      newState.playerDeck = newDeck;
      newState.playerDiscard = newDiscard;

      const nextTurn = newState.turn + 1;
      const nextQuarter = Math.min(4, Math.floor(newState.turn / (MAX_POSSESSIONS/4)) + 1);

      if(nextQuarter > newState.quarter) {
          logMessages.push(`End of Quarter ${newState.quarter}.`, `Quarter ${nextQuarter} begins!`);
          newState.quarter = nextQuarter;
      }
      
      newState.turn = nextTurn;
      newState.possession = 'player';
      newState.activePlayerId = null;
      
      newState.playerMaxHype = Math.min(10, newState.playerMaxHype + 1);
      
      if (newState.opponentTeam.players.some(p => p.statuses.some(s => s.name === 'NoHypeGain'))) {
        logMessages.push("THE LOCKDOWN! Player gains no Hype this turn!");
      } else {
        newState.playerHype = newState.playerMaxHype;
        if (newState.playerTeam.playbook === Playbook.PaceAndSpace) {
            newState.playerHype = Math.min(10, newState.playerHype + 1);
            logMessages.push("Pace and Space: Gained 1 extra Hype.");
        }
      }

      // Reset opponent's defensive buffs
      newState.opponentShotSuccessReduction = 0;

      const oppGrit = 2 + (newState.opponentTeam.playbook === Playbook.GritAndGrind ? 1 : 0);
      newState.opponentGrit = oppGrit;
      logMessages.push(`Opponent gains ${oppGrit} Grit for defense.`);
      
      newState.phase = GamePhase.PlayerSelect;

      newState.playerTeam.players.forEach(p => p.statuses = p.statuses.map(s => ({...s, duration: s.duration - 1})).filter(s => s.duration > 0));
      
      return { ...newState, gameLog: [...logMessages, ...newState.gameLog] };
  }, [drawCards]);
  
  const startNewOpponentTurn = useCallback((currentState: GameState): GameState => {
      let newState = clearOffensiveEffects({ ...currentState });

      if(newState.turn >= MAX_POSSESSIONS) {
          newState.phase = GamePhase.GameOver;
          newState.gameLog = ["Final whistle!", ...newState.gameLog];
          return newState;
      }
      
      let logMessages: string[] = ["Opponent gets possession."];

      const { newHand, newDeck, newDiscard, newLogMessages } = drawCards(newState.opponentDeck, [...newState.opponentDiscard, ...newState.opponentHand], HAND_SIZE - newState.opponentHand.length, []);
      logMessages.push(...newLogMessages);
      
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
            newState.opponentHype = Math.min(10, newState.opponentHype + 1);
        }
      }

      // Reset player's defensive buffs
      newState.playerSuccessfulBlocksGrantPossession = false;
      newState.playerInterceptBonus = 0;
      newState.opponentSlasherCostIncrease = 0;


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
    const opponent = by === 'player' ? 'opponent' : 'player';
    let animation: ActionAnimation = { card, reactionCard, by, outcome: 'generic' };
    
    let success = true;
    let possessionChange = false;
    let isNegated = false;

    // --- Helper for drawing cards and updating state ---
    const drawHelper = (count: number, forPlayer: 'player' | 'opponent' = by): Card[] => {
        const { newHand, newDeck, newDiscard, newLogMessages } = drawCards(
            newState[`${forPlayer}Deck`],
            newState[`${forPlayer}Discard`],
            count,
            []
        );
        newState[`${forPlayer}Hand`] = [...newState[`${forPlayer}Hand`], ...newHand];
        newState[`${forPlayer}Deck`] = newDeck;
        newState[`${forPlayer}Discard`] = newDiscard;
        logMessages.push(...newLogMessages);
        return newHand;
    };

    // --- Momentum Helper ---
    const updateMomentum = (state: GameState, change: number): GameState => {
      let tempState = {...state};
      const oldMomentum = tempState.momentum;
      const newMomentum = Math.max(-10, Math.min(10, oldMomentum + change));
      tempState.momentum = newMomentum;

      if (oldMomentum < 10 && newMomentum >= 10 && !tempState.playerHand.some(c => c.isSignatureMove)) {
          logMessages.push("🔥 ON FIRE! Player's Signature Move added to hand!");
          tempState.playerHand.push(tempState.playerTeam.signatureMove);
      }
      if (oldMomentum > -10 && newMomentum <= -10 && !tempState.opponentHand.some(c => c.isSignatureMove)) {
          logMessages.push("⚠️ UNSTOPPABLE! Opponent's Signature Move added to hand!");
          tempState.opponentHand.push(tempState.opponentTeam.signatureMove);
      }
      return tempState;
    }
    
    // --- REACTION CARD LOGIC ---
    if (reactionCard) {
        const reactingPlayer = opponent;
        logMessages.push(`${reactingPlayer === 'player' ? 'Player' : 'Opponent'} reacts with ${reactionCard.name}!`);
        // --- Negation Reactions ---
        const negationMap: {[key: string]: {chance?: number, log: string, sideEffect?: () => void}} = {
            'Clamp God': { log: "Clamped up! The dribble is negated!", sideEffect: () => {
                const targetPlayer = newState[`${by}Team`].players.find(p => p.id === newState.activePlayerId || by === 'opponent'); // simplified target for opponent
                if (targetPlayer) {
                    targetPlayer.statuses.push({ name: 'Locked Down', duration: 2 });
                    logMessages.push(`${targetPlayer.name} is Locked Down!`);
                }
            }},
            'Lateral Quickness': { log: 'Too quick! Dribble negated.', sideEffect: () => newState = updateMomentum(newState, by === 'player' ? -1 : 1) },
            'Read the Play': { log: 'Pass read and negated!', sideEffect: () => logMessages.push(`Opponent's hand is revealed.`) }, // Simplified effect
            'Cut Off the Drive': { log: 'Drive cut off!', sideEffect: () => newState = updateMomentum(newState, by === 'player' ? -1 : 1) },
            'Stay in Front': { log: 'Stayed in front, great defense!' },
            'Vicious Block': { log: `Vicious Block! Turnover!`, sideEffect: () => { possessionChange = true; newState = updateMomentum(newState, by === 'player' ? -3 : 3) } },
            'Chase-Down Block': { log: 'Chase-down block! Denied!', sideEffect: () => { if(newState.momentum <= -5) isNegated = true; else logMessages.push("Not enough momentum for chase-down!") } },
            'Anticipate the Cut': { log: 'Anticipated the cut, pass negated!', sideEffect: () => { drawHelper(1, reactingPlayer); } },
            'Swat': { log: 'Swatted away!', sideEffect: () => { if (newState[`${by}Hand`].length > 0) { const discarded = newState[`${by}Hand`].pop()!; newState[`${by}Discard`].push(discarded); logMessages.push(`${by} is forced to discard ${discarded.name}.`); } } },
            'Wall Off the Paint': { log: 'The paint is walled off!', sideEffect: () => by === 'player' ? (newState.playerBlockSlasherReactions = true) : (/* opponent equivalent */ {}) }
        };
        if(negationMap[reactionCard.name]) {
            isNegated = true;
            logMessages.push(negationMap[reactionCard.name].log);
            negationMap[reactionCard.name].sideEffect?.();
        }

        // --- Chance-based Reactions ---
        if (reactionCard.name === 'Pick Pocket' && Math.random() < 0.33) { isNegated = true; possessionChange = true; logMessages.push("Successful steal! Turnover!"); newState = updateMomentum(newState, by === 'player' ? -3 : 3); }
        if (reactionCard.name === 'Fast Hands' && Math.random() < 0.5) { isNegated = true; logMessages.push("Pass negated!"); drawHelper(1, reactingPlayer); }
        if (reactionCard.name === 'Poke the Ball Loose' && Math.random() < 0.33) { isNegated = true; logMessages.push("Ball poked loose!"); }
        if (reactionCard.name === 'Tip the Pass' && Math.random() < 0.5) { isNegated = true; logMessages.push("Pass tipped and negated!"); }
        
        // --- Conditional Reactions ---
        if (reactionCard.name === 'Draw the Charge' || reactionCard.name === 'Take the Charge') {
            if (card.archetype === Archetype.Slasher) { isNegated = true; possessionChange = true; logMessages.push(`Charge taken! Turnover!`); newState = updateMomentum(newState, by === 'player' ? -3 : 3); }
        }
        if (reactionCard.name === 'Perimeter Lockdown' && (card.name.includes('Three') || card.name.includes('3pt'))) { isNegated = true; logMessages.push("3pt shot locked down!"); }
        if (reactionCard.name === 'Pin the Ball') {
            isNegated = true;
            logMessages.push("Ball pinned! Nasty block!");
            const targetPlayer = newState[`${by}Team`].players.find(p => p.id === newState.activePlayerId || by === 'opponent');
            if(targetPlayer) { targetPlayer.statuses.push({ name: 'Fatigued', duration: 1 }); logMessages.push(`${targetPlayer.name} is now Fatigued.`); }
        }
        
        // --- Non-negating reactions / Side effects ---
        if (reactionCard.name === 'Hedge the Screen') { newState[`${by}Hype`] -= 1; logMessages.push("Screen hedged, attacker loses 1 Hype."); }
        if (reactionCard.name === 'Pressure the Passer') { by === 'player' ? newState.opponentNextCardCostIncrease = 1 : {}; logMessages.push("Passer pressured! Next card costs more."); }
    }
    
    if (isNegated) success = false;

    // --- CARD MAIN EFFECT RESOLUTION (Non-Shots / Utility) ---
    if (success) {
      const effectHandlers: { [key:string]: () => void } = {
          // Slasher
          'Explosive First Step': () => { newState = updateMomentum(newState, by === 'player' ? 1 : -1); drawHelper(1); },
          'Hang Time': () => { if(by==='player') newState.playerShotSuccessBonus += 15; },
          'Spin Cycle': () => { newState = updateMomentum(newState, by === 'player' ? 2 : -2); },
          'Fearless Finisher': () => { if(by==='player') newState.playerBlockSlasherReactions = true; },
          'Hop Step': () => { newState = updateMomentum(newState, by === 'player' ? 1 : -1); if(by==='player') newState.playerNextShotCostReduction = 1; },
          'Relentless Assault': () => { if (newState.didScoreThisTurn) { drawHelper(2); } else { logMessages.push("No score this turn, Relentless Assault whiffs."); }},
          'Ankle Breaker': () => { newState = updateMomentum(newState, by === 'player' ? 3 : -3); if (Math.random() < 0.5) { const target = newState[`${opponent}Team`].players[0]; target.statuses.push({name: 'Ankles Broken', duration: 1}); logMessages.push(`${target.name} has their ankles broken!`); } },
          'Quick Rip': () => { newState = updateMomentum(newState, by === 'player' ? 1 : -1); },
          // Sharpshooter
          'Step-Back Jumper': () => { drawHelper(1); }, // Shot effect is separate
          'Limitless Range': () => { if(by==='player') newState.player3PtSuccessBonus += 20; },
          'Deadeye': () => { if(by==='player') newState.playerIsDeadeyeActive = true; },
          'Hot Streak': () => { if(newState.didScoreThisTurn) { if(by==='player') newState.playerNextShotSuccessBonus += 15; } else { logMessages.push("No score this turn, Hot Streak is cold."); }},
          'Off-Ball Screen': () => { drawHelper(1); if(by==='player') newState.playerNextSharpshooterCostReduction = 1; },
          'Pump Fake': () => { const reaction = newState[`${opponent}Hand`].find(c => c.keywords?.includes(Keyword.Reaction)); if(reaction) { newState[`${opponent}Hand`] = newState[`${opponent}Hand`].filter(c => c.id !== reaction.id); newState[`${opponent}Discard`].push(reaction); logMessages.push(`${opponent} is forced to discard ${reaction.name}.`); }},
          'Spot-Up Shooter': () => { if(by==='player') newState.playerNextShotSuccessBonus += 10; }, // Exhaust is just discarding for now
          'Clutch Shooting': () => { if(newState.quarter === 4) { if(by==='player') newState.playerNextShotSuccessBonus += 30; } else { logMessages.push("Not clutch time yet!"); }},
          'Green Light': () => { if(by==='player') { newState.playerShotSuccessBonus += 10; newState.playerBonusMomentumOnScore += 1; }},
          'Rhythm Dribble': () => { newState = updateMomentum(newState, by === 'player' ? (newState.lastCardTypePlayed === CardType.Dribble ? 4 : 2) : (newState.lastCardTypePlayed === CardType.Dribble ? -4 : -2)); },
          // Playmaker
          'Quick Pass': () => { drawHelper(1); },
          'Crossover': () => { newState = updateMomentum(newState, by === 'player' ? 2 : -2); },
          'Dime': () => { drawHelper(2); if(by==='player') newState.playerNextShotSuccessBonus += 10; },
          'No-Look Pass': () => { drawHelper(2); if(by==='player') newState.opponentCannotReact = true; },
          'Pick and Roll Maestro': () => { drawHelper(1); newState = updateMomentum(newState, by === 'player' ? 2 : -2); },
          'Lob Pass': () => { const drawnCards = drawHelper(1); if (drawnCards.length > 0) { const cardInHand = newState[`${by}Hand`].find(c => c.id === drawnCards[0].id); if (cardInHand) { cardInHand.hypeCost = Math.max(0, cardInHand.hypeCost - 1); cardInHand.temporary = true; } } },
          'Drive and Dish': () => { newState = updateMomentum(newState, by === 'player' ? 1 : -1); drawHelper(2); },
          'Court Vision': () => { drawHelper(1); logMessages.push("Drew 1 card from the top of the deck.")}, // Simplified
          'Floor General': () => { if(by==='player') newState.isFifthGearActive = true; }, // Re-using this flag
          'Bail Out Pass': () => { if(newState[`${by}Hand`].length > 0) { const discarded = newState[`${by}Hand`].pop()!; newState[`${by}Discard`].push(discarded); drawHelper(1); logMessages.push(`Bailed out, discarding ${discarded.name} to draw a card.`); } else { logMessages.push("Bail Out Pass has no card to discard!"); success = false; }},
          'Outlet Pass': () => { if(newState.cardsPlayedThisTurn.length === 1) { drawHelper(2); } else { logMessages.push("Outlet Pass must be played first."); success=false; }},
          'Bounce Pass': () => { drawHelper(1); },
          'Wraparound Pass': () => { drawHelper(1); if(newState.lastCardTypePlayed === CardType.Pass && by==='player') newState.playerNextPassCostReduction = 99; },
          'Give and Go': () => { drawHelper(1); newState = updateMomentum(newState, by === 'player' ? 2 : -2); },
          'Pace Setter': () => { drawHelper(2); newState[`${by}MaxHype`] = Math.min(10, newState[`${by}MaxHype`]+1); },
          'Triple Threat': () => { const drawnCards = drawHelper(1); if(drawnCards.length > 0 && drawnCards[0].type === CardType.Shot) { const cardInHand = newState[`${by}Hand`].find(c => c.id === drawnCards[0].id); if (cardInHand) { cardInHand.hypeCost = Math.max(0, cardInHand.hypeCost - 1); cardInHand.temporary = true; } }},
          'Assist Chain': () => { if(newState.lastCardTypePlayed === CardType.Pass) { drawHelper(2); } else {logMessages.push("No pass played, Assist Chain fails.")}},
          // Defender
          'Full-Court Press': () => { newState[`${opponent}Hype`] -= 2; if (newState[`${opponent}Hand`].length > 0) { const discarded = newState[`${opponent}Hand`].pop()!; newState[`${opponent}Discard`].push(discarded); logMessages.push(`Opponent discards ${discarded.name} and loses 2 Hype.`); }},
          'Defensive Stance': () => { newState[`${by}Grit`] += 2; },
          'Tireless Defender': () => { newState[`${by}Team`].players.forEach(p => p.statuses = []); logMessages.push("All negative statuses cleared."); },
          'Mental Warfare': () => { const target = newState[`${opponent}Team`].players[0]; target.statuses.push({ name: 'Fatigued', duration: 2 }); logMessages.push(`${target.name} is now Fatigued.`); },
          // P. Defender
          'Read the Passing Lanes': () => { if(by==='player') newState.playerInterceptBonus += 0.25; else { /* opponent bonus */ } },
          'Fight Through Screen': () => { newState[`${by}Grit`] += 1; drawHelper(1); },
          'Switch Everything': () => { newState[`${by}Grit`] += 3; logMessages.push("Defense is locked in, gained 3 Grit.") }, // Simplified
          'Communicate': () => { newState[`${by}Grit`] += 3; },
          'Close the Gap': () => { newState[`${by}Grit`] += 1; },
          // Rim Protector
          'Block Party': () => { if(by==='player') newState.playerSuccessfulBlocksGrantPossession = true; },
          'Rebound Machine': () => { /* Logic handled in miss resolution */ },
          'Paint Patrol': () => { if(by==='player') newState.opponentSlasherCostIncrease = 1; },
          'Anchor the Defense': () => { newState[`${by}Grit`] += 3; },
          'No Easy Buckets': () => { if(by==='player') newState.opponentShotSuccessReduction = 20; },
          // Signature Moves
          'Fifth Gear': () => { const cardsToDraw = Math.max(0, MAX_HAND_SIZE - newState.playerHand.length); drawHelper(cardsToDraw, 'player'); newState.playerHype = Math.min(newState.playerMaxHype, newState.playerHype + 5); newState.isFifthGearActive = true; logMessages.push("Fifth Gear! Hand filled, Hype boosted, cards cost less this turn!"); },
          'The Lockdown': () => { logMessages.push("THE LOCKDOWN! Opponent's offense is shut down next turn."); newState.opponentTeam.players.forEach(p => p.statuses.push({ name: 'CantPlayShots', duration: 2 }, { name: 'NoHypeGain', duration: 2 })); },
          'Glitch in the System': () => { const targetCount = Math.min(2, newState.opponentDiscard.length); if(targetCount > 0){ logMessages.push("Glitch in the System! Opponent recovers cards!"); const shuffled = shuffleDeck(newState.opponentDiscard); const recovered = shuffled.slice(0, targetCount).map(c=>({...c, hypeCost: 0, temporary: true})); newState.opponentDiscard = shuffled.slice(targetCount); newState.opponentHand.push(...recovered); }},
      };
      if (effectHandlers[card.name]) {
          logMessages.push(`${by} uses ${card.name}.`);
          effectHandlers[card.name]();
      }
    }
    
    // --- SHOT LOGIC ---
    if (card.type === CardType.Shot && !isNegated) {
        let shotChance = card.successChance || 70;
        let is3pt = card.name.includes("Three") || card.name.includes("3pt") || (card.name === 'Catch and Shoot' && newState.lastCardTypePlayed === CardType.Pass);
        
        // Apply bonuses and penalties
        if (by === 'player') {
            shotChance += newState.playerShotSuccessBonus + newState.playerNextShotSuccessBonus;
            if (is3pt) shotChance += newState.player3PtSuccessBonus;
            shotChance -= newState.opponentShotSuccessReduction;
        } else { // Opponent shot
            shotChance -= newState.playerShotSuccessBonus + newState.playerNextShotSuccessBonus; // Player's defensive buffs act as penalties
        }
        
        // Reaction card modifications
        if (reactionCard && (by === 'player' ? !newState.playerIsDeadeyeActive : true)) {
            const reductionMap: { [key:string]: number } = { 'Tough Contest': 25, 'Contest Shot': 40, 'Closeout': 20, 'Verticality': 25, 'Alter the Shot': 30, 'Intimidator': 20 };
            if (reductionMap[reactionCard.name]) {
                let reduction = reductionMap[reactionCard.name];
                if (card.name === 'Acrobatic Finish' || card.name === 'Fadeaway') { reduction /= 2; logMessages.push("The difficult shot mitigates the defense!"); }
                shotChance -= reduction;
                logMessages.push(`${reactionCard.name} makes it tougher! Success chance reduced by ${reduction}%.`);
            }
        }
        
        logMessages.push(`Base chance ${card.successChance}%, final chance ${Math.round(shotChance)}%.`);
        success = Math.random() * 100 < shotChance;
        animation.points = is3pt ? 3 : 2;
        animation.outcome = success ? 'score' : 'miss';
    }

    // --- POST-ACTION & POST-SHOT EFFECTS ---
    if (success) {
      if (card.type === CardType.Shot) {
        newState.didScoreThisTurn = true;
        const points = animation.points!;
        newState = updateMomentum(newState, by === 'player' ? points + newState.playerBonusMomentumOnScore : -(points + newState.playerBonusMomentumOnScore));
        newState[`${by}Score`] += points;
        logMessages.push(`${by === 'player' ? 'Player' : 'Opponent'} scores ${points} points!`);
        // On-score effects
        if (card.name === 'And-1' || card.name === 'Four-Point Play') { newState[`${by}Hype`] = Math.min(newState[`${by}MaxHype`], newState[`${by}Hype`]+1); logMessages.push("And-1! Hype recovered."); }
        if (card.name === 'Four-Point Play') { newState = updateMomentum(newState, by === 'player' ? 1 : -1); }
        if (card.name === 'Get to the Line') { newState = updateMomentum(newState, by === 'player' ? 2 : -2); }
      }
    } else if (card.type === CardType.Shot && !isNegated) { // Shot missed
        logMessages.push("The shot misses!");
        if (card.name === 'Get to the Line') { newState[`${by}Hype`] = Math.min(newState[`${by}MaxHype`], newState[`${by}Hype`]+1); logMessages.push("Drew a foul on the miss, gained Hype."); }
        if (reactionCard?.name === 'Box Out' || reactionCard?.name === 'Rebound Machine' || reactionCard?.name === 'Second Chance Denial') {
            logMessages.push(`${reactionCard.name} secures the rebound! Turnover!`);
            possessionChange = true;
            if(reactionCard.name === 'Second Chance Denial') newState = updateMomentum(newState, by === 'player' ? -3 : 3);
            if(reactionCard.name === 'Rebound Machine') {
                drawHelper(1, opponent);
                logMessages.push(`${opponent} also draws a card.`);
            }
        }
    }
    
    // Reset "next card" effects after they are consumed
    if (by === 'player') {
        if (card.type === CardType.Shot) newState.playerNextShotSuccessBonus = 0;
        if (card.type === CardType.Shot) newState.playerNextShotCostReduction = 0;
        if (card.archetype === Archetype.Sharpshooter) newState.playerNextSharpshooterCostReduction = 0;
        if (card.type === CardType.Pass) newState.playerNextPassCostReduction = 0;
        newState.playerIsDeadeyeActive = false;
        newState.opponentCannotReact = false;
        newState.opponentNextCardCostIncrease = 0;
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
        drawHelper(2, 'player');
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
    const currentCost = getCardHypeCost(card, 'player');
    if (gameState.phase !== GamePhase.PlayerTurn || gameState.playerHype < currentCost) return;
    
    addToLog(`Player plays ${card.name}.`);
    
    setGameState(prev => {
        let newState = { ...prev };
        newState.playerHype -= currentCost;
        newState.playerHand = prev.playerHand.filter(c => c.id !== card.id);
        newState.playerDiscard = [...newState.playerDiscard, card];
        
        newState.cardsPlayedThisTurn = [...newState.cardsPlayedThisTurn, card];
        newState.lastCardTypePlayed = card.type;

        if (card.isSignatureMove) {
            newState.gameLog = ["Signature Move played! Momentum resets.", ...newState.gameLog];
            newState.momentum = 0;
        }

        if (newState.opponentCannotReact) {
            newState.gameLog = ["Opponent cannot react due to No-Look Pass!", ...newState.gameLog];
            return resolveActionState(newState, { card, by: 'player' });
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
      stateAfterGrit.playerHand = stateAfterGrit.playerHand.filter(c => c.id !== reactionCard.id);
      stateAfterGrit.playerDiscard = [...stateAfterGrit.playerDiscard, reactionCard];
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
        
        const lockdownStatus = newState.opponentTeam.players.some(p => p.statuses.some(s => s.name === 'CantPlayShots'));

        const getOpponentCardCost = (card: Card) => getCardHypeCost(card, 'opponent');
        
        const playableCards = newState.opponentHand
            .filter(c => getOpponentCardCost(c) <= newState.opponentHype && (!lockdownStatus || c.type !== CardType.Shot))
            .sort((a, b) => b.hypeCost - a.hypeCost);
        
        const cardToPlay = playableCards.length > 0 ? playableCards[0] : null;

        if (!cardToPlay) {
            addToLog("Opponent has no play and ends their turn.");
            setGameState(prev => startNewPlayerTurn(prev));
            return;
        }
        
        addToLog(`Opponent plays ${cardToPlay.name}.`);
        setGameState(prev => {
          let nextState = {...prev};
          nextState.opponentHype -= getOpponentCardCost(cardToPlay);
          nextState.opponentHand = prev.opponentHand.filter(c => c.id !== cardToPlay.id);
          nextState.opponentDiscard = [...prev.opponentDiscard, cardToPlay];
          nextState.cardsPlayedThisTurn = [...nextState.cardsPlayedThisTurn, cardToPlay];
          nextState.lastCardTypePlayed = cardToPlay.type;
          nextState.phase = GamePhase.Reaction;
          nextState.pendingCard = { card: cardToPlay, by: 'opponent' };
          return nextState;
        });

    }, 1500);

    return () => clearTimeout(thinkingTimeout);
  }, [gameState.phase, gameState.opponentHype, gameState.opponentHand, addToLog, startNewPlayerTurn, getCardHypeCost]);
  
  // Opponent AI Reaction
  useEffect(() => {
    if (gameState.phase !== GamePhase.Reaction || gameState.possession !== 'player' || !gameState.pendingCard) return;

    const reactionTimeout = setTimeout(() => {
      setGameState(prev => {
        const pendingType = prev.pendingCard!.card.type;
        const pendingCard = prev.pendingCard!.card;

        const possibleReactions = prev.opponentHand.filter(c => 
            c.keywords?.includes(Keyword.Reaction) && 
            c.trigger?.includes(pendingType) &&
            c.gritCost! <= prev.opponentGrit &&
            // AI logic for specific counters
            !(pendingCard.name === 'Wrecking Ball' && c.name === 'Vicious Block') &&
            !(prev.playerBlockSlasherReactions && pendingCard.archetype === Archetype.Slasher)
        ).sort((a, b) => (b.gritCost ?? 0) - (a.gritCost ?? 0)); // Prioritize higher cost reactions

        if (possibleReactions.length > 0) {
            const reactionCard = possibleReactions[0];
            const stateAfterGrit = {...prev, opponentGrit: prev.opponentGrit - reactionCard.gritCost!};
            stateAfterGrit.opponentHand = stateAfterGrit.opponentHand.filter(c => c.id !== reactionCard.id);
            stateAfterGrit.opponentDiscard = [...stateAfterGrit.opponentDiscard, reactionCard];
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
            
            // Turnovers are handled by resolveActionState now.
            if (by === 'player') {
                if (card.name === 'Showtime Chain' && outcome === 'score') {
                    newState.phase = GamePhase.PlayerTurn; // Go back to player turn
                } else {
                   newState.phase = GamePhase.PlayerTurn;
                }
            } else { // Opponent's turn action
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
    <div className="w-full h-full bg-cover bg-center flex flex-col p-2 sm:p-4 text-white relative overflow-hidden" style={{ backgroundImage: `url('${gameState.opponentTeam.courtImage}')`, backgroundColor: '#1a202c', backgroundBlendMode: 'overlay' }}>
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
                      displayCost={getCardHypeCost(card, 'opponent')}
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
                    isDisabled={gameState.phase !== GamePhase.PlayerTurn || gameState.playerHype < getCardHypeCost(card, 'player')} 
                    displayCost={getCardHypeCost(card, 'player')}
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
