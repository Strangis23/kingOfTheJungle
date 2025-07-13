import { GameState, Card, Player, Team, Playbook, GamePhase, CardType, Keyword, Archetype, ActionAnimation } from './types';
import { PLAYBOOK_DATA, createCard } from './components/game-data';

const MAX_POSSESSIONS = 40;
const HAND_SIZE = 5;
const MAX_HAND_SIZE = 7;

export enum ActionType {
  SELECT_PLAYER,
  SKIP_PLAYER_SELECT,
  PLAY_CARD,
  PLAY_REACTION_CARD,
  SKIP_REACTION,
  END_TURN,
  AI_ACTION,
  AI_REACTION,
  RESOLVE_ANIMATION,
  SET_DETAILED_CARD,
  SET_DETAILED_PLAYER,
  ADD_TO_LOG,
  SHOW_LOG,
  HIDE_LOG,
}

export type GameAction =
  | { type: ActionType.SELECT_PLAYER; payload: string }
  | { type: ActionType.SKIP_PLAYER_SELECT }
  | { type: ActionType.PLAY_CARD; payload: Card }
  | { type: ActionType.PLAY_REACTION_CARD; payload: Card }
  | { type: ActionType.SKIP_REACTION }
  | { type: ActionType.END_TURN }
  | { type: ActionType.AI_ACTION }
  | { type: ActionType.AI_REACTION }
  | { type: ActionType.RESOLVE_ANIMATION }
  | { type: ActionType.SET_DETAILED_CARD; payload: Card | null }
  | { type: ActionType.SET_DETAILED_PLAYER; payload: Player | null }
  | { type: ActionType.ADD_TO_LOG; payload: string }
  | { type: ActionType.SHOW_LOG }
  | { type: ActionType.HIDE_LOG };


const shuffleDeck = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const drawCards = (
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
};

const getCardHypeCost = (card: Card, state: GameState): number => {
    let cost = card.hypeCost;
    if (state.isFifthGearActive) {
      cost = Math.max(0, cost - 1);
    }
    const activePlayer = state.playerTeam.players.find(p => p.id === state.activePlayerId);
    if (activePlayer) {
      if (activePlayer.archetypes.includes(Archetype.Superstar)) {
        cost = Math.max(0, cost - 1);
      } else if (activePlayer.archetypes.includes(card.archetype)) {
        cost = Math.max(0, cost - 1);
      }
    }
    return cost;
};

const startNewTurn = (currentState: GameState, possession: 'player' | 'opponent'): GameState => {
    let newState = { ...currentState };
    let logMessages: string[] = [];
    
    if(newState.turn >= MAX_POSSESSIONS) {
        newState.phase = GamePhase.GameOver;
        logMessages.push("Final whistle!");
        return { ...newState, gameLog: [...logMessages, ...newState.gameLog]};
    }

    if (possession === 'player') {
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
      newState.playerTeam.players.forEach(p => p.statuses = p.statuses.map(s => ({...s, duration: s.duration - 1})).filter(s => s.duration > 0));

    } else { // Opponent's turn
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
        if (newState.opponentTeam.playbook === Playbook.PaceAndSpace) newState.opponentHype += 1;
      }

      const playerGrit = 2 + (newState.playerTeam.playbook === Playbook.GritAndGrind ? 1 : 0);
      newState.playerGrit = playerGrit;
      logMessages.push(`Player gains ${playerGrit} Grit for defense.`);
      
      newState.opponentTeam.players.forEach(p => p.statuses = p.statuses.map(s => ({...s, duration: s.duration - 1})).filter(s => s.duration > 0));
    }
    
    return { ...newState, gameLog: [...logMessages, ...newState.gameLog] };
}


export const getInitialGameState = (props: { activeRoster: Player[], playerDeck: Card[], playerPlaybook: Playbook, opponentTeam: Team }): GameState => {
    const { activeRoster, playerDeck, playerPlaybook, opponentTeam } = props;
    const playerSignatureMove = createCard(PLAYBOOK_DATA[playerPlaybook].signatureMoveKey);
    const playerTeam: Team = {
      name: 'My Team',
      players: activeRoster,
      deck: playerDeck,
      playbook: playerPlaybook,
      signatureMove: playerSignatureMove,
      courtImage: '',
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
      detailedPlayer: null,
      isLogOpen: false,
    };
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ActionType.SET_DETAILED_CARD:
        return {...state, detailedCard: action.payload};
    case ActionType.SET_DETAILED_PLAYER:
        return {...state, detailedPlayer: action.payload};
    case ActionType.ADD_TO_LOG:
        return {...state, gameLog: [action.payload, ...state.gameLog]};
    case ActionType.SHOW_LOG:
        return { ...state, isLogOpen: true };
    case ActionType.HIDE_LOG:
        return { ...state, isLogOpen: false };

    case ActionType.SELECT_PLAYER: {
      if (state.phase !== GamePhase.PlayerSelect) return state;
      const player = state.playerTeam.players.find(p => p.id === action.payload)!;
      let bonusText = `matching archetype cards cost 1 less Hype.`;
      if (player.archetypes.includes(Archetype.Superstar)) {
          bonusText = `ALL cards cost 1 less Hype this turn!`
      }
      return {
          ...state,
          activePlayerId: action.payload,
          phase: GamePhase.PlayerTurn,
          gameLog: [`${player.name} leads the charge! ${bonusText}`, ...state.gameLog]
      };
    }
    
    case ActionType.SKIP_PLAYER_SELECT: {
        if (state.phase !== GamePhase.PlayerSelect) return state;
        return {
            ...state,
            activePlayerId: null,
            phase: GamePhase.PlayerTurn,
            gameLog: [`Playing without a leader bonus this turn.`, ...state.gameLog]
        };
    }

    case ActionType.END_TURN: {
        if (state.phase !== GamePhase.PlayerTurn) return state;
        const newState = {...state, gameLog: ["Player ends their possession.", ...state.gameLog]};
        return startNewTurn(newState, 'opponent');
    }

    case ActionType.PLAY_CARD: {
      const card = action.payload;
      const currentCost = getCardHypeCost(card, state);
      if (state.phase !== GamePhase.PlayerTurn || state.playerHype < currentCost) return state;
      
      let newState = { ...state };
      newState.playerHype -= currentCost;
      newState.playerHand = state.playerHand.filter(c => c.id !== card.id);
      newState.playerDiscard = [...state.playerDiscard, card];
      
      let log = [`Player plays ${card.name}.`, ...state.gameLog];
      if (card.isSignatureMove) {
          log = ["Signature Move played! Momentum resets.", ...log];
          newState.momentum = 0;
      }

      newState.phase = GamePhase.Reaction;
      newState.pendingCard = { card, by: 'player' };
      newState.gameLog = log;
      return newState;
    }

    case ActionType.AI_ACTION: {
      if (state.phase !== GamePhase.OpponentTurn) return state;
      let newState = { ...state };
      const lockdownStatus = newState.opponentTeam.players.some(p => p.statuses.some(s => s.name === 'CantPlayShots'));

      const sigMove = newState.opponentHand.find(c => c.isSignatureMove);
      if (sigMove && sigMove.hypeCost <= newState.opponentHype) {
          newState.opponentHype -= sigMove.hypeCost;
          newState.opponentHand = newState.opponentHand.filter(c => c.id !== sigMove.id);
          newState.opponentDiscard = [...newState.opponentDiscard, sigMove];
          newState.momentum = 0;
          newState.pendingCard = { card: sigMove, by: 'opponent' };
          newState.phase = GamePhase.Reaction;
          newState.gameLog = [`Opponent plays their Signature Move: ${sigMove.name}!`, ...newState.gameLog];
          return newState;
      }

      const playableCards = newState.opponentHand
          .filter(c => c.hypeCost <= newState.opponentHype && (!lockdownStatus || c.type !== CardType.Shot))
          .sort((a, b) => b.hypeCost - a.hypeCost);
      
      const cardToPlay = playableCards.length > 0 ? playableCards[0] : null;

      if (!cardToPlay) {
          const logState = {...newState, gameLog: ["Opponent has no play and ends their turn.", ...newState.gameLog]};
          return startNewTurn(logState, 'player');
      }
      
      return {
          ...newState,
          opponentHype: newState.opponentHype - cardToPlay.hypeCost,
          opponentHand: newState.opponentHand.filter(c => c.id !== cardToPlay.id),
          opponentDiscard: [...newState.opponentDiscard, cardToPlay],
          phase: GamePhase.Reaction,
          pendingCard: { card: cardToPlay, by: 'opponent' },
          gameLog: [`Opponent plays ${cardToPlay.name}.`, ...newState.gameLog]
      };
    }
    
    // Fallthrough for all reaction-ending actions
    case ActionType.PLAY_REACTION_CARD:
    case ActionType.SKIP_REACTION:
    case ActionType.AI_REACTION: {
      if (state.phase !== GamePhase.Reaction || !state.pendingCard) return state;
      
      let reactionCard: Card | undefined;
      let newState = {...state};
      
      if(action.type === ActionType.PLAY_REACTION_CARD) {
        if (state.possession !== 'opponent') return state; // Player reacting
        reactionCard = action.payload;
        if (reactionCard.gritCost! > state.playerGrit) return state; // Not enough grit
        newState.playerGrit -= reactionCard.gritCost!;
      }
      
      if(action.type === ActionType.AI_REACTION) {
        if(state.possession !== 'player') return state; // Opponent reacting
        const pendingType = state.pendingCard.card.type;
        const possibleReactions = state.opponentHand.filter(c => 
            c.keywords?.includes(Keyword.Reaction) && 
            c.trigger?.includes(pendingType) &&
            c.gritCost! <= state.opponentGrit &&
            !(state.pendingCard?.card.name === 'Wrecking Ball' && c.name === 'Vicious Block')
        );
        if (possibleReactions.length > 0) {
            reactionCard = possibleReactions[0];
            newState.opponentGrit -= reactionCard.gritCost!;
        }
      }

      // Action Resolution Logic
      // This is a simplified version of the old `resolveActionState`
      let logMessages: string[] = [];
      const { card, by } = state.pendingCard;
      let animation: ActionAnimation = { card, reactionCard, by, outcome: 'generic' };
      
      let success = true;
      let isNegated = false;

      const updateMomentum = (st: GameState, change: number): GameState => {
        let tempState = {...st};
        const oldMomentum = tempState.momentum;
        const newMomentum = Math.max(-10, Math.min(10, oldMomentum + change));
        tempState.momentum = newMomentum;

        if (by === 'player' && oldMomentum < 10 && newMomentum >= 10 && !tempState.playerHand.some(c => c.isSignatureMove)) {
            logMessages.push("🔥 ON FIRE! Player's Signature Move added to hand!");
            tempState.playerHand = [...tempState.playerHand, tempState.playerTeam.signatureMove];
        }
        if (by === 'opponent' && oldMomentum > -10 && newMomentum <= -10 && !tempState.opponentHand.some(c => c.isSignatureMove)) {
            logMessages.push("⚠️ UNSTOPPABLE! Opponent's Signature Move added to hand!");
            tempState.opponentHand = [...tempState.opponentHand, tempState.opponentTeam.signatureMove];
        }
        return tempState;
      }

      if (reactionCard) {
        logMessages.push(`${by === 'player' ? 'Opponent' : 'Player'} reacts with ${reactionCard.name}!`);
        switch(reactionCard.name) {
            case 'Vicious Block':
                animation.outcome = 'block';
                isNegated = true;
                newState = updateMomentum(newState, by === 'player' ? -3 : 3);
                logMessages.push(`The shot is BLOCKED! Momentum lost.`);
                break;
            // ... more reaction card logic here ...
        }
      }

      if (isNegated) success = false;

      if (card.type === CardType.Shot && !isNegated) {
          let shotChance = card.successChance || 70;
          if (reactionCard?.name === 'Contest Shot') {
              shotChance -= 40;
              logMessages.push(`Shot is contested! Success chance reduced to ${shotChance}%.`);
          }
          success = Math.random() * 100 < shotChance;
          animation.points = card.name.includes("Three") ? 3 : 2;
          animation.outcome = success ? 'score' : 'miss';
      }

      if (success) {
        // Handle main card effects
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
        } else if(card.type === CardType.Shot && !isNegated) {
            logMessages.push("The shot misses!");
        }

        // Handle utility card effects here
        switch(card.name) {
            case 'Quick Pass':
              const {newHand, newDeck, newDiscard, newLogMessages} = drawCards(by === 'player' ? newState.playerDeck : newState.opponentDeck, by === 'player' ? newState.playerDiscard : newState.opponentDiscard, 1, []);
              if (by === 'player') {
                  newState.playerHand.push(...newHand);
                  newState.playerDeck = newDeck;
                  newState.playerDiscard = newDiscard;
              } else {
                  newState.opponentHand.push(...newHand);
                  newState.opponentDeck = newDeck;
                  newState.opponentDiscard = newDiscard;
              }
              logMessages.push(...newLogMessages);
              break;
            case 'Crossover':
               newState = updateMomentum(newState, by === 'player' ? 2 : -2);
               logMessages.push("Smooth crossover! Momentum up!");
               break;
        }
      }

      return {
          ...newState,
          actionAnimation: animation,
          phase: GamePhase.Animating,
          pendingCard: null,
          gameLog: [...logMessages, ...state.gameLog]
      };
    }
    
    case ActionType.RESOLVE_ANIMATION: {
        if (state.phase !== GamePhase.Animating || !state.actionAnimation) return state;

        const { by, card, outcome } = state.actionAnimation;
        let newState = { ...state, actionAnimation: null };
            
        if (by === 'player') {
            if (card.name === 'Showtime Chain' && outcome === 'score') {
                newState.phase = GamePhase.PlayerTurn;
            } else {
                newState.phase = GamePhase.PlayerTurn;
            }
        } else { // Opponent's turn
            if (card.type === CardType.Shot || outcome === 'steal' || outcome === 'block') {
                newState = startNewTurn(newState, 'player');
            } else {
                newState.phase = GamePhase.OpponentTurn;
            }
        }
        return newState;
    }

    default:
      return state;
  }
}