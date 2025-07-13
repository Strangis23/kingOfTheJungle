export enum Playbook {
  PaceAndSpace = "Pace and Space",
  GritAndGrind = "Grit and Grind",
  FastbreakKings = "Fastbreak Kings",
}

export enum Archetype {
  Slasher = "Slasher",
  Sharpshooter = "Sharpshooter",
  Playmaker = "Playmaker",
  RimProtector = "Rim Protector",
  PerimeterDefender = "Perimeter Defender",
  OnBallDefender = "On-Ball Defender",
  Superstar = "Superstar",
}

export enum CardType {
  Shot = "Shot",
  Pass = "Pass",
  Dribble = "Dribble",
  Defense = "Defense",
  Utility = "Utility",
}

export enum Keyword {
  Combo = "Combo",
  Clutch = "Clutch",
  Exhaust = "Exhaust",
  Signature = "Signature",
  Reaction = "Reaction",
}

export interface Card {
  id: string;
  name: string;
  description: string;
  hypeCost: number;
  gritCost?: number;
  type: CardType;
  archetype: Archetype;
  rarity: 'Common' | 'Rare' | 'Legendary';
  keywords?: Keyword[];
  effect: (gameState: GameState, payload?: any) => GameState;
  isSignatureMove?: boolean;
  trigger?: CardType[];
  successChance?: number; // e.g., 80 for 80%
  imageUrl: string;
}

export type PlayerStatusName = 'Locked Down' | 'Ankles Broken' | 'Heated Up' | 'Fatigued' | 'CantPlayShots' | 'NoHypeGain';
export interface PlayerStatus {
  name: PlayerStatusName;
  duration: number; // in turns
}

export interface Player {
  id: string;
  name: string;
  archetypes: Archetype[];
  rarity: 'Common' | 'Rare' | 'Legendary';
  statuses: PlayerStatus[];
  isResting?: boolean;
  imageUrl: string;
}

export interface Team {
  name: string;
  players: Player[];
  deck: Card[];
  playbook: Playbook;
  signatureMove: Card;
  courtImage: string;
}

export interface ActionAnimation {
  card: Card;
  reactionCard?: Card;
  outcome: 'score' | 'miss' | 'block' | 'steal' | 'generic' | 'negated';
  points?: number;
  by: 'player' | 'opponent';
}

export enum GamePhase {
  PlayerSelect,
  PlayerTurn,
  Reaction,
  Animating,
  OpponentTurn,
  GameOver,
}

export interface GameState {
  playerTeam: Team;
  opponentTeam: Team;
  playerHand: Card[];
  opponentHand: Card[];
  playerDeck: Card[];
  opponentDeck: Card[];
  playerDiscard: Card[];
  opponentDiscard: Card[];
  playerScore: number;
  opponentScore: number;
  playerHype: number;
  playerMaxHype: number;
  opponentHype: number;
  opponentMaxHype: number;
  playerGrit: number;
  opponentGrit: number;
  momentum: number; // -10 to +10
  possession: 'player' | 'opponent';
  turn: number; // Represents total possessions in the game
  quarter: number; // 1-4
  phase: GamePhase;
  gameLog: string[];
  lastCardTypePlayed?: CardType;
  activePlayerId: string | null;
  actionAnimation: ActionAnimation | null;
  pendingCard: { card: Card; by: 'player' | 'opponent' } | null;
  isFifthGearActive: boolean;
  detailedCard: Card | null;
}

export enum MapNodeType {
  Game,
  EliteGame,
  Trainer,
  Rival,
  HazardCourt,
  Shop,
  Pack,
}

export interface MapNode {
  id: string;
  type: MapNodeType;
  opponent?: Team;
  completed: boolean;
  position: { x: number, y: number };
}

export interface CardPack {
    player: Player;
    cards: Card[];
}