import { Team, Player, Card, Archetype, CardType, Keyword, Playbook, CardPack } from '../types.ts';

const archetypeColors: { [key in Archetype]: string } = {
  [Archetype.Slasher]: '7F1D1D',
  [Archetype.Sharpshooter]: '1E3A8A',
  [Archetype.Playmaker]: 'B45309',
  [Archetype.RimProtector]: '047857',
  [Archetype.PerimeterDefender]: '166534',
  [Archetype.OnBallDefender]: '3730A3',
  [Archetype.Superstar]: 'D97706',
};

const createCardImageUrl = (cardName: string, archetype: Archetype) => {
    const color = archetypeColors[archetype] || '1E293B';
    const text = encodeURIComponent(cardName);
    return `https://placehold.co/300x200/${color}/FFFFFF/?text=${text}`;
};

const createPlayerImageUrl = (playerName: string, primaryArchetype: Archetype) => {
    const color = archetypeColors[primaryArchetype] || '1E293B';
    const text = encodeURIComponent(playerName);
    return `https://placehold.co/200x280/${color}/FFFFFF/?text=${text}`;
};

const createCourtImageUrl = (courtName: string) => {
    const text = encodeURIComponent(courtName);
    return `https://placehold.co/1280x720/222222/555555/?text=${text}`;
};

// --- CARDS ---

const CARDS_DATA: { [key: string]: Omit<Card, 'id' | 'effect' | 'imageUrl'> & { archetype: Archetype } } = {
  // --- Slasher Cards ---
  DRIVE_TO_BASKET: { name: 'Drive to Basket', rarity: 'Common', hypeCost: 2, type: CardType.Shot, archetype: Archetype.Slasher, description: 'Attempt a 2-point layup. High success rate.', successChance: 80 },
  POSTERIZER_DUNK: { name: 'Posterizer Dunk', rarity: 'Rare', hypeCost: 4, type: CardType.Shot, archetype: Archetype.Slasher, description: 'Attempt a powerful 2-point dunk. High success, high momentum gain.', successChance: 75 },
  EXPLOSIVE_FIRST_STEP: { name: 'Explosive First Step', rarity: 'Common', hypeCost: 1, type: CardType.Dribble, archetype: Archetype.Slasher, description: 'Gain +1 Momentum and draw a card.' },
  EURO_STEP: { name: 'Euro Step', rarity: 'Common', hypeCost: 2, type: CardType.Shot, archetype: Archetype.Slasher, description: '2pt layup. Combo: Higher success chance if a Dribble card was played this turn.', keywords: [Keyword.Combo], successChance: 75 },
  HANG_TIME: { name: 'Hang Time', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.Slasher, description: 'For this turn, your Shot cards have +15% success chance.' },
  ACROBATIC_FINISH: { name: 'Acrobatic Finish', rarity: 'Rare', hypeCost: 3, type: CardType.Shot, archetype: Archetype.Slasher, description: 'Attempt a 2pt shot. Less affected by defensive reactions.', successChance: 70 },
  SPIN_CYCLE: { name: 'Spin Cycle', rarity: 'Common', hypeCost: 2, type: CardType.Dribble, archetype: Archetype.Slasher, description: 'Gain +2 Momentum.' },
  AND_1: { name: 'And-1', rarity: 'Rare', hypeCost: 3, type: CardType.Shot, archetype: Archetype.Slasher, description: 'Attempt a 2pt shot. On score, gain 1 Hype back.', successChance: 65 },
  FEARLESS_FINISHER: { name: 'Fearless Finisher', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.Slasher, description: 'This turn, opponents cannot play Shot reaction cards against your Slasher cards.' },
  BASELINE_DRIVE: { name: 'Baseline Drive', rarity: 'Common', hypeCost: 2, type: CardType.Shot, archetype: Archetype.Slasher, description: 'Attempt a 2pt reverse layup.', successChance: 75 },
  HOP_STEP: { name: 'Hop Step', rarity: 'Common', hypeCost: 1, type: CardType.Dribble, archetype: Archetype.Slasher, description: 'Gain +1 Momentum. Your next Shot card this turn costs 1 less Hype.' },
  FLOATER: { name: 'Floater', rarity: 'Common', hypeCost: 2, type: CardType.Shot, archetype: Archetype.Slasher, description: 'A 2pt teardrop shot. More effective against Rim Protector reactions.', successChance: 70 },
  RELENTLESS_ASSAULT: { name: 'Relentless Assault', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.Slasher, description: 'Combo: If you scored with a Shot card this turn, draw 2 cards.', keywords: [Keyword.Combo] },
  ANKLE_BREAKER: { name: 'Ankle Breaker', rarity: 'Rare', hypeCost: 3, type: CardType.Dribble, archetype: Archetype.Slasher, description: 'Gain +3 Momentum. 50% chance to apply "Ankles Broken" to a random opponent for 1 turn.' },
  CONTACT_FINISH: { name: 'Contact Finish', rarity: 'Rare', hypeCost: 3, type: CardType.Shot, archetype: Archetype.Slasher, description: 'A powerful 2pt shot with +10% success chance.', successChance: 75 },
  QUICK_RIP: { name: 'Quick Rip', rarity: 'Common', hypeCost: 1, type: CardType.Dribble, archetype: Archetype.Slasher, description: 'Gain +1 Momentum.' },
  GET_TO_THE_LINE: { name: 'Get to the Line', rarity: 'Rare', hypeCost: 2, type: CardType.Shot, archetype: Archetype.Slasher, description: '2pt shot. On score, gain +2 Momentum. On miss, gain 1 Hype.', successChance: 60 },

  // --- Sharpshooter Cards ---
  PULL_UP_JUMPER: { name: 'Pull-up Jumper', rarity: 'Common', hypeCost: 2, type: CardType.Shot, archetype: Archetype.Sharpshooter, description: 'Attempt a 2-point shot.', successChance: 70 },
  THREE_POINTER: { name: 'Three-Pointer', rarity: 'Rare', hypeCost: 3, type: CardType.Shot, archetype: Archetype.Sharpshooter, description: 'Attempt a 3-point shot.', successChance: 50 },
  CATCH_AND_SHOOT: { name: 'Catch and Shoot', rarity: 'Rare', hypeCost: 2, type: CardType.Shot, archetype: Archetype.Sharpshooter, description: '2pt Shot. Combo: Becomes a 3pt shot if you played a Pass card this turn.', keywords: [Keyword.Combo], successChance: 75 },
  STEP_BACK_JUMPER: { name: 'Step-Back Jumper', rarity: 'Rare', hypeCost: 3, type: CardType.Shot, archetype: Archetype.Sharpshooter, description: 'Attempt a 3pt shot and draw a card.', successChance: 50 },
  LIMITLESS_RANGE: { name: 'Limitless Range', rarity: 'Legendary', hypeCost: 4, type: CardType.Utility, archetype: Archetype.Sharpshooter, description: 'For this turn, your 3pt shots have +20% success chance.' },
  DEADEYE: { name: 'Deadeye', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.Sharpshooter, description: 'Your next shot this turn cannot have its success chance reduced by opponent cards.' },
  HOT_STREAK: { name: 'Hot Streak', rarity: 'Common', hypeCost: 2, type: CardType.Utility, archetype: Archetype.Sharpshooter, description: 'Combo: If you scored with a Shot card this turn, your next shot has +15% success chance.', keywords: [Keyword.Combo] },
  OFF_BALL_SCREEN: { name: 'Off-Ball Screen', rarity: 'Common', hypeCost: 1, type: CardType.Pass, archetype: Archetype.Sharpshooter, description: 'Draw 1 card. The next Sharpshooter card you play this turn costs 1 less Hype.' },
  PUMP_FAKE: { name: 'Pump Fake', rarity: 'Common', hypeCost: 1, type: CardType.Dribble, archetype: Archetype.Sharpshooter, description: 'Opponent must discard a random reaction card from their hand, if able.' },
  FADEAWAY: { name: 'Fadeaway', rarity: 'Rare', hypeCost: 3, type: CardType.Shot, archetype: Archetype.Sharpshooter, description: 'A difficult 2pt shot that is harder to block.', successChance: 60 },
  SPOT_UP_SHOOTER: { name: 'Spot-Up Shooter', rarity: 'Common', hypeCost: 0, type: CardType.Utility, archetype: Archetype.Sharpshooter, description: 'Exhaust: Your next shot this turn has +10% success chance.', keywords: [Keyword.Exhaust] },
  CLUTCH_SHOOTING: { name: 'Clutch Shooting', rarity: 'Legendary', hypeCost: 3, type: CardType.Utility, archetype: Archetype.Sharpshooter, description: 'Clutch: If it is Quarter 4, your next shot this turn has +30% success chance.', keywords: [Keyword.Clutch] },
  GREEN_LIGHT: { name: 'Green Light', rarity: 'Legendary', hypeCost: 5, type: CardType.Utility, archetype: Archetype.Sharpshooter, description: 'For this turn, your shots have +10% success chance and grant +1 Momentum on score.' },
  FOUR_POINT_PLAY: { name: 'Four-Point Play', rarity: 'Legendary', hypeCost: 4, type: CardType.Shot, archetype: Archetype.Sharpshooter, description: '3pt shot. On score, gain 1 Hype back and +1 Momentum.', successChance: 50 },
  RHYTHM_DRIBBLE: { name: 'Rhythm Dribble', rarity: 'Rare', hypeCost: 2, type: CardType.Dribble, archetype: Archetype.Sharpshooter, description: 'Gain +2 Momentum. Combo: Gain +4 Momentum instead if you played a Dribble card this turn.', keywords: [Keyword.Combo] },
  HEAT_CHECK: { name: 'Heat Check', rarity: 'Legendary', hypeCost: 2, type: CardType.Shot, archetype: Archetype.Sharpshooter, description: '3pt shot. If your Momentum is 5 or higher, this costs 0 Hype.', successChance: 40 },
  CORNER_SPECIALIST: { name: 'Corner Specialist', rarity: 'Rare', hypeCost: 3, type: CardType.Shot, archetype: Archetype.Sharpshooter, description: 'A 3pt shot with an additional +10% success chance.', successChance: 60 },

  // --- Playmaker Cards ---
  QUICK_PASS: { name: 'Quick Pass', rarity: 'Common', hypeCost: 1, type: CardType.Pass, archetype: Archetype.Playmaker, description: 'Draw 1 card.' },
  CROSSOVER: { name: 'Crossover', rarity: 'Common', hypeCost: 2, type: CardType.Dribble, archetype: Archetype.Playmaker, description: 'Gain +2 Momentum.' },
  QUICK_SHOT: { name: 'Quick Shot', rarity: 'Rare', hypeCost: 2, type: CardType.Shot, archetype: Archetype.Playmaker, description: 'Attempt a 2-point shot. Combo: If you played a "Pass" card this turn, this costs 0 Hype.', keywords: [Keyword.Combo], successChance: 70 },
  DIME: { name: 'Dime', rarity: 'Rare', hypeCost: 2, type: CardType.Pass, archetype: Archetype.Playmaker, description: 'Draw 2 cards. Your next Shot card this turn has +10% success chance.' },
  NO_LOOK_PASS: { name: 'No-Look Pass', rarity: 'Rare', hypeCost: 2, type: CardType.Pass, archetype: Archetype.Playmaker, description: 'Draw 2 cards. Opponent cannot react to the next card you play this turn.' },
  ALLEY_OOP: { name: 'Alley-Oop', rarity: 'Rare', hypeCost: 3, type: CardType.Shot, archetype: Archetype.Playmaker, description: 'Your active player attempts a high-percentage 2-point shot.', successChance: 85 },
  PICK_AND_ROLL_MAESTRO: { name: 'Pick and Roll Maestro', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.Playmaker, description: 'Draw 1 card and gain +2 Momentum.' },
  LOB_PASS: { name: 'Lob Pass', rarity: 'Common', hypeCost: 1, type: CardType.Pass, archetype: Archetype.Playmaker, description: 'Draw a card. It costs 1 less Hype this turn.' },
  DRIVE_AND_DISH: { name: 'Drive and Dish', rarity: 'Rare', hypeCost: 2, type: CardType.Dribble, archetype: Archetype.Playmaker, description: 'Gain +1 Momentum and draw 2 cards.' },
  COURT_VISION: { name: 'Court Vision', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.Playmaker, description: 'Look at the top 3 cards of your deck. Add one to your hand.' },
  FLOOR_GENERAL: { name: 'Floor General', rarity: 'Legendary', hypeCost: 4, type: CardType.Utility, archetype: Archetype.Playmaker, description: 'For this turn, all your cards cost 1 less Hype.' },
  BAIL_OUT_PASS: { name: 'Bail Out Pass', rarity: 'Common', hypeCost: 0, type: CardType.Pass, archetype: Archetype.Playmaker, description: 'Discard a card from your hand to draw a new card.' },
  OUTLET_PASS: { name: 'Outlet Pass', rarity: 'Common', hypeCost: 1, type: CardType.Pass, archetype: Archetype.Playmaker, description: 'Can only be played as the first card of your turn. Draw 2 cards.' },
  BOUNCE_PASS: { name: 'Bounce Pass', rarity: 'Common', hypeCost: 1, type: CardType.Pass, archetype: Archetype.Playmaker, description: 'Draw 1 card. It is harder for this pass to be intercepted.' },
  WRAPAROUND_PASS: { name: 'Wraparound Pass', rarity: 'Rare', hypeCost: 2, type: CardType.Pass, archetype: Archetype.Playmaker, description: 'Draw 1 card. Combo: Your next Pass card this turn costs 0 Hype.', keywords: [Keyword.Combo] },
  GIVE_AND_GO: { name: 'Give and Go', rarity: 'Rare', hypeCost: 2, type: CardType.Pass, archetype: Archetype.Playmaker, description: 'Draw 1 card and gain +2 Momentum.' },
  PACE_SETTER: { name: 'Pace Setter', rarity: 'Rare', hypeCost: 3, type: CardType.Utility, archetype: Archetype.Playmaker, description: 'Draw 2 cards and gain +1 Max Hype for the rest of the game.' },
  TRIPLE_THREAT: { name: 'Triple Threat', rarity: 'Common', hypeCost: 1, type: CardType.Utility, archetype: Archetype.Playmaker, description: 'Draw a card. If it is a Shot card, it costs 1 less Hype this turn.' },
  ASSIST_CHAIN: { name: 'Assist Chain', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.Playmaker, description: 'Combo: If you played a Pass card this turn, draw 2 cards.', keywords: [Keyword.Combo] },

  // --- On-Ball Defender Cards ---
  PICK_POCKET: { name: 'Pick Pocket', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: 'Reaction to: Dribble. 33% chance to steal. If successful, gain Possession.', keywords: [Keyword.Reaction], trigger: [CardType.Dribble] },
  CLAMP_GOD: { name: 'Clamp God', rarity: 'Legendary', hypeCost: 0, gritCost: 3, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: "Reaction to: Dribble. Negate. Apply 'Locked Down' for 2 turns to the active opponent.", keywords: [Keyword.Reaction], trigger: [CardType.Dribble] },
  FAST_HANDS: { name: 'Fast Hands', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: 'Reaction to: Pass. 50% chance to negate and draw 1 card.', keywords: [Keyword.Reaction], trigger: [CardType.Pass] },
  LATERAL_QUICKNESS: { name: 'Lateral Quickness', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: 'Reaction to: Dribble. Negate the action and gain +1 Momentum.', keywords: [Keyword.Reaction], trigger: [CardType.Dribble] },
  TOUGH_CONTEST: { name: 'Tough Contest', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: 'Reaction to: Shot. Reduce success chance by 25%.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  FULL_COURT_PRESS: { name: 'Full-Court Press', rarity: 'Rare', hypeCost: 3, type: CardType.Utility, archetype: Archetype.OnBallDefender, description: 'Opponent discards a random card and loses 2 Hype.' },
  READ_THE_PLAY: { name: 'Read the Play', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: "Reaction to: Pass. Negate. Look at the opponent's hand.", keywords: [Keyword.Reaction], trigger: [CardType.Pass] },
  CUT_OFF_THE_DRIVE: { name: 'Cut Off the Drive', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: 'Reaction to: Dribble. Negate the action. Opponent loses 1 Momentum.', keywords: [Keyword.Reaction], trigger: [CardType.Dribble] },
  DEFENSIVE_STANCE: { name: 'Defensive Stance', rarity: 'Common', hypeCost: 1, type: CardType.Utility, archetype: Archetype.OnBallDefender, description: "Gain 2 Grit for the opponent's next turn." },
  FORCE_THE_TURNOVER: { name: 'Force the Turnover', rarity: 'Legendary', hypeCost: 0, gritCost: 3, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: 'Reaction: Any. 50% chance to negate the action and gain possession.', keywords: [Keyword.Reaction], trigger: [CardType.Shot, CardType.Dribble, CardType.Pass] },
  DRAW_THE_CHARGE: { name: 'Draw the Charge', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: 'Reaction to: Shot. If it is a Slasher card, negate it and gain possession.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  STAY_IN_FRONT: { name: 'Stay in Front', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: 'Reaction to: Dribble. Negate the action.', keywords: [Keyword.Reaction], trigger: [CardType.Dribble] },
  POKE_THE_BALL_LOOSE: { name: 'Poke the Ball Loose', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.OnBallDefender, description: 'Reaction to: Dribble. 33% chance to negate the action.', keywords: [Keyword.Reaction], trigger: [CardType.Dribble] },
  TIRELESS_DEFENDER: { name: 'Tireless Defender', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.OnBallDefender, description: 'Remove all negative status effects from one of your players.' },
  MENTAL_WARFARE: { name: 'Mental Warfare', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.OnBallDefender, description: "Apply 'Fatigued' status to a random opponent for 2 turns." },

  // --- Perimeter Defender Cards ---
  INTERCEPT: { name: 'Intercept', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Pass. Negate Pass & draw 1. 25% chance to steal.', keywords: [Keyword.Reaction], trigger: [CardType.Pass] },
  CONTEST_SHOT: { name: 'Contest Shot', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Shot. Reduce success chance by 40%.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  CLOSEOUT: { name: 'Closeout', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Shot. Reduce success chance by 20%.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  DENY_THE_BALL: { name: 'Deny the Ball', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Pass. Negate the action. Opponent discards a card.', keywords: [Keyword.Reaction], trigger: [CardType.Pass] },
  READ_THE_PASSING_LANES: { name: 'Read the Passing Lanes', rarity: 'Common', hypeCost: 1, type: CardType.Utility, archetype: Archetype.PerimeterDefender, description: 'On your next defensive possession, your Intercept cards are more effective.' },
  HEDGE_THE_SCREEN: { name: 'Hedge the Screen', rarity: 'Rare', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Dribble or Pass. Opponent loses 1 Hype. Does not negate.', keywords: [Keyword.Reaction], trigger: [CardType.Dribble, CardType.Pass] },
  FIGHT_THROUGH_SCREEN: { name: 'Fight Through Screen', rarity: 'Common', hypeCost: 1, type: CardType.Utility, archetype: Archetype.PerimeterDefender, description: 'Gain 1 Grit and draw a card.' },
  TIP_THE_PASS: { name: 'Tip the Pass', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Pass. 50% chance to negate the pass.', keywords: [Keyword.Reaction], trigger: [CardType.Pass] },
  PERIMETER_LOCKDOWN: { name: 'Perimeter Lockdown', rarity: 'Legendary', hypeCost: 0, gritCost: 3, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Shot. If it is a 3-point shot, negate it.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  SWITCH_EVERYTHING: { name: 'Switch Everything', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.PerimeterDefender, description: "On opponent's next turn, your players can use any defensive reaction cards regardless of archetype." },
  ANTICIPATE_THE_CUT: { name: 'Anticipate the Cut', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Pass. Negate the action and draw a card.', keywords: [Keyword.Reaction], trigger: [CardType.Pass] },
  PRESSURE_THE_PASSER: { name: 'Pressure the Passer', rarity: 'Rare', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: "Reaction to: Pass. The opponent's next card this turn costs 1 more Hype.", keywords: [Keyword.Reaction], trigger: [CardType.Pass] },
  BOX_OUT: { name: 'Box Out', rarity: 'Rare', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Shot. If the shot misses, you gain possession.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  COMMUNICATE: { name: 'Communicate', rarity: 'Common', hypeCost: 1, type: CardType.Utility, archetype: Archetype.PerimeterDefender, description: 'Gain 3 Grit for your next defensive possession.' },
  FORCE_THE_EXTRA_PASS: { name: 'Force the Extra Pass', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.PerimeterDefender, description: 'Reaction to: Shot. Negate the shot. The opponent draws a card instead.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  CLOSE_THE_GAP: { name: 'Close the Gap', rarity: 'Common', hypeCost: 0, type: CardType.Utility, archetype: Archetype.PerimeterDefender, description: 'Exhaust: Gain 1 Grit.', keywords: [Keyword.Exhaust] },
  
  // --- Rim Protector Cards ---
  VICIOUS_BLOCK: { name: 'Vicious Block', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.RimProtector, description: 'Reaction to: Shot. Negate the action. Gain Possession.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  BLOCK_PARTY: { name: 'Block Party', rarity: 'Legendary', hypeCost: 4, type: CardType.Utility, archetype: Archetype.RimProtector, description: "For the opponent's next turn, your successful blocks also grant you possession." },
  INTIMIDATOR: { name: 'Intimidator', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.RimProtector, description: 'Reaction to: Shot. Reduce success chance by 20%. If it misses, opponent loses 2 momentum.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  REBOUND_MACHINE: { name: 'Rebound Machine', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.RimProtector, description: "On opponent's next turn, if they miss a shot, you gain possession and draw a card." },
  CHASE_DOWN_BLOCK: { name: 'Chase-Down Block', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.RimProtector, description: 'Reaction to: Shot. Can only be played if opponent has 5+ momentum. Negate the shot.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  TAKE_THE_CHARGE: { name: 'Take the Charge', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.RimProtector, description: 'Reaction to: Shot. If the card is a Slasher card, negate it and gain possession.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  VERTICALITY: { name: 'Verticality', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.RimProtector, description: 'Reaction to: Shot. Reduce success chance by 25%.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  PAINT_PATROL: { name: 'Paint Patrol', rarity: 'Rare', hypeCost: 3, type: CardType.Utility, archetype: Archetype.RimProtector, description: "On opponent's next turn, their Slasher cards cost 1 more Hype to play." },
  SECOND_CHANCE_DENIAL: { name: 'Second Chance Denial', rarity: 'Rare', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.RimProtector, description: 'Reaction to: Shot. If the shot misses, you gain possession and +3 Momentum.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  SWAT: { name: 'Swat', rarity: 'Rare', hypeCost: 0, gritCost: 2, type: CardType.Defense, archetype: Archetype.RimProtector, description: 'Reaction to: Shot. Negate the shot. Opponent discards a random card.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  ALTER_THE_SHOT: { name: 'Alter the Shot', rarity: 'Common', hypeCost: 0, gritCost: 1, type: CardType.Defense, archetype: Archetype.RimProtector, description: 'Reaction to: Shot. Reduce success chance by 30%.', keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  WALL_OFF_THE_PAINT: { name: 'Wall Off the Paint', rarity: 'Legendary', hypeCost: 0, gritCost: 3, type: CardType.Defense, archetype: Archetype.RimProtector, description: "Reaction to: Dribble/Shot. For the rest of the opponent's turn, they cannot play Slasher cards.", keywords: [Keyword.Reaction], trigger: [CardType.Dribble, CardType.Shot] },
  ANCHOR_THE_DEFENSE: { name: 'Anchor the Defense', rarity: 'Rare', hypeCost: 2, type: CardType.Utility, archetype: Archetype.RimProtector, description: 'Gain 3 Grit for your next defensive possession.' },
  PIN_THE_BALL: { name: 'Pin the Ball', rarity: 'Legendary', hypeCost: 0, gritCost: 3, type: CardType.Defense, archetype: Archetype.RimProtector, description: "Reaction to: Shot. Negate. The opponent player who played the card gets 'Fatigued' status.", keywords: [Keyword.Reaction], trigger: [CardType.Shot] },
  NO_EASY_BUCKETS: { name: 'No Easy Buckets', rarity: 'Legendary', hypeCost: 5, type: CardType.Utility, archetype: Archetype.RimProtector, description: "For the opponent's next turn, all their shots have -20% success chance." },

  // --- Player Signature Moves ---
  FIFTH_GEAR: { name: 'Fifth Gear', rarity: 'Legendary', hypeCost: 0, type: CardType.Utility, archetype: Archetype.Playmaker, description: 'Draw until your hand is full (7 cards). Gain 5 Hype. For the rest of this turn, cards cost 1 less Hype.', keywords: [Keyword.Signature], isSignatureMove: true },
  THE_LOCKDOWN: { name: 'The Lockdown', rarity: 'Legendary', hypeCost: 0, type: CardType.Utility, archetype: Archetype.PerimeterDefender, description: "Opponent's next turn: they can't play Shot cards and gain no base Hype.", keywords: [Keyword.Signature], isSignatureMove: true },
  SHOWTIME_CHAIN: { name: 'Showtime Chain', rarity: 'Legendary', hypeCost: 0, type: CardType.Shot, archetype: Archetype.Slasher, description: 'Attempt a 2pt shot (high success). On score: keep possession, draw 2 cards, continue turn.', keywords: [Keyword.Signature], isSignatureMove: true, successChance: 90 },

  // --- Opponent-Only Signature Moves ---
  WRECKING_BALL: { name: 'Wrecking Ball', rarity: 'Legendary', hypeCost: 0, type: CardType.Shot, archetype: Archetype.Slasher, description: "Attempt a 2pt shot that can't be blocked. If it misses, opponent discards a random card.", keywords: [Keyword.Signature], isSignatureMove: true, successChance: 75},
  GLITCH_IN_THE_SYSTEM: { name: 'Glitch in the System', rarity: 'Legendary', hypeCost: 0, type: CardType.Utility, archetype: Archetype.Playmaker, description: "Return 2 random cards from your discard pile to your hand. They cost 0 Hype this turn.", keywords: [Keyword.Signature], isSignatureMove: true},
};

export const createCard = (cardKey: string): Card => {
  const cardData = CARDS_DATA[cardKey];
  if (!cardData) throw new Error(`Card with key ${cardKey} not found.`);
  return {
    id: `${cardKey}-${Math.random()}`,
    ...cardData,
    imageUrl: createCardImageUrl(cardData.name, cardData.archetype),
    effect: (gameState, payload) => gameState // Placeholder effect
  };
};

export const PLAYBOOK_DATA: { [key in Playbook]: { name: string, description: string, signatureMoveKey: string } } = {
  [Playbook.PaceAndSpace]: { name: "Pace and Space", description: "Passive: Your base Hype per turn is 6 instead of 5.", signatureMoveKey: 'FIFTH_GEAR' },
  [Playbook.GritAndGrind]: { name: "Grit and Grind", description: "Passive: You start each defensive possession with 1 extra Grit.", signatureMoveKey: 'THE_LOCKDOWN' },
  [Playbook.FastbreakKings]: { name: "Fastbreak Kings", description: "Passive: Whenever you gain possession via a steal or block, you also gain +3 Momentum.", signatureMoveKey: 'SHOWTIME_CHAIN' },
};

// --- CARD & PLAYER POOLS FOR PACKS ---

const ALL_PLAYERS: Player[] = [
  // == Existing Players ==
  // Commons (4)
  { id: 'p1', name: 'Leo "The Lion" Chen', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Leo "The Lion" Chen', Archetype.Slasher) },
  { id: 'p2', name: 'Maya "Deadeye" Singh', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Maya "Deadeye" Singh', Archetype.Sharpshooter) },
  { id: 'p3', name: 'Sam "Dime" Jones', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Sam "Dime" Jones', Archetype.Playmaker) },
  { id: 'p4', name: 'Kenji "The Wall" Tanaka', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Kenji "The Wall" Tanaka', Archetype.RimProtector) },
  // Rares (3)
  { id: 'player-rare-1', name: 'Isabelle "Matrix" Moreau', archetypes: [Archetype.Playmaker, Archetype.OnBallDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Isabelle "Matrix" Moreau', Archetype.Playmaker) },
  { id: 'player-rare-2', name: 'Jaxson "Apex" Williams', archetypes: [Archetype.Slasher, Archetype.RimProtector], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Jaxson "Apex" Williams', Archetype.Slasher) },
  { id: 'player-rare-3', name: 'Caden "Tripod" Lee', archetypes: [Archetype.Sharpshooter, Archetype.PerimeterDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Caden "Tripod" Lee', Archetype.Sharpshooter) },
  // Legendary (1)
  { id: 'player-legend-1', name: 'Kaito "Starlight" Ito', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Kaito "Starlight" Ito', Archetype.Superstar) },

  // == New Commons (56) ==
  // Slashers
  { id: 'c1', name: 'Dante "Dash" Jones', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Dante "Dash" Jones', Archetype.Slasher) },
  { id: 'c2', name: 'Aisha "Sky" Williams', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Aisha "Sky" Williams', Archetype.Slasher) },
  { id: 'c3', name: 'Marco "Momentum" Petrov', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Marco "Momentum" Petrov', Archetype.Slasher) },
  { id: 'c4', name: 'Tariq "The Blur" Ali', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Tariq "The Blur" Ali', Archetype.Slasher) },
  { id: 'c5', name: 'Keisha "Charge" Brown', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Keisha "Charge" Brown', Archetype.Slasher) },
  { id: 'c6', name: 'Ivan "The Invader" Kuznetsov', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Ivan "The Invader" Kuznetsov', Archetype.Slasher) },
  { id: 'c7', name: 'Lila "Leap" Chen', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Lila "Leap" Chen', Archetype.Slasher) },
  { id: 'c8', name: 'Omar "Orbit" Hassan', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Omar "Orbit" Hassan', Archetype.Slasher) },
  { id: 'c9', name: 'Nadia "Nitro" Kim', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Nadia "Nitro" Kim', Archetype.Slasher) },
  // Sharpshooters
  { id: 'c10', name: 'Ray "Rainman" Allen Jr.', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Ray "Rainman" Allen Jr.', Archetype.Sharpshooter) },
  { id: 'c11', name: 'Brenda "Bullseye" Lee', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Brenda "Bullseye" Lee', Archetype.Sharpshooter) },
  { id: 'c12', name: 'Sung "Swish" Park', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Sung "Swish" Park', Archetype.Sharpshooter) },
  { id: 'c13', name: 'Fiona "Flames" O\'Malley', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Fiona "Flames" O\'Malley', Archetype.Sharpshooter) },
  { id: 'c14', name: 'Carlos "Comet" Garcia', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Carlos "Comet" Garcia', Archetype.Sharpshooter) },
  { id: 'c15', name: 'Heidi "Hailstorm" Schmidt', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Heidi "Hailstorm" Schmidt', Archetype.Sharpshooter) },
  { id: 'c16', name: 'Dev "Downtown" Patel', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Dev "Downtown" Patel', Archetype.Sharpshooter) },
  { id: 'c17', name: 'Katya "Cannon" Ivanova', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Katya "Cannon" Ivanova', Archetype.Sharpshooter) },
  { id: 'c18', name: 'Wei "Whisper" Zhang', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Wei "Whisper" Zhang', Archetype.Sharpshooter) },
  // Playmakers
  { id: 'c19', name: 'Andre "Maestro" Dubois', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Andre "Maestro" Dubois', Archetype.Playmaker) },
  { id: 'c20', name: 'Chloe "Connect" Nguyen', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Chloe "Connect" Nguyen', Archetype.Playmaker) },
  { id: 'c21', name: 'Pedro "Puppetmaster" Silva', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Pedro "Puppetmaster" Silva', Archetype.Playmaker) },
  { id: 'c22', name: 'Yuki "Vision" Sato', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Yuki "Vision" Sato', Archetype.Playmaker) },
  { id: 'c23', name: 'Fatima "Flow" Khan', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Fatima "Flow" Khan', Archetype.Playmaker) },
  { id: 'c24', name: 'Leo "Link" Rossi', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Leo "Link" Rossi', Archetype.Playmaker) },
  { id: 'c25', name: 'Jada "The General" Davis', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Jada "The General" Davis', Archetype.Playmaker) },
  { id: 'c26', name: 'Viktor "Vector" Novak', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Viktor "Vector" Novak', Archetype.Playmaker) },
  { id: 'c27', name: 'Zoe "Zenith" Bell', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Zoe "Zenith" Bell', Archetype.Playmaker) },
  // Rim Protectors
  { id: 'c28', name: 'Dmitri "The Denier" Volkov', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Dmitri "The Denier" Volkov', Archetype.RimProtector) },
  { id: 'c29', name: 'Bao "The Barricade" Tran', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Bao "The Barricade" Tran', Archetype.RimProtector) },
  { id: 'c30', name: 'Hannah "Highrise" Johnson', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Hannah "Highrise" Johnson', Archetype.RimProtector) },
  { id: 'c31', name: 'Gunnar "The Gatekeeper" Olsen', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Gunnar "The Gatekeeper" Olsen', Archetype.RimProtector) },
  { id: 'c32', name: 'Chika "Ceiling" Adebayo', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Chika "Ceiling" Adebayo', Archetype.RimProtector) },
  { id: 'c33', name: 'Sergei "Summit" Popov', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Sergei "Summit" Popov', Archetype.RimProtector) },
  { id: 'c34', name: 'Isla "The Island" McGregor', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Isla "The Island" McGregor', Archetype.RimProtector) },
  { id: 'c35', name: 'Mateo "Mountain" Diaz', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Mateo "Mountain" Diaz', Archetype.RimProtector) },
  { id: 'c36', name: 'Priya "Peak" Sharma', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Priya "Peak" Sharma', Archetype.RimProtector) },
  { id: 'c37', name: 'Boris "The Bear" Orlov', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Boris "The Bear" Orlov', Archetype.RimProtector) },
  // Perimeter Defenders
  { id: 'c38', name: 'Gwen "Guardian" Evans', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Gwen "Guardian" Evans', Archetype.PerimeterDefender) },
  { id: 'c39', name: 'Hector "Hawk" Morales', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Hector "Hawk" Morales', Archetype.PerimeterDefender) },
  { id: 'c40', name: 'Ingrid "The Interceptor" Larsen', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Ingrid "The Interceptor" Larsen', Archetype.PerimeterDefender) },
  { id: 'c41', name: 'Jin "The Shadow" Kim', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Jin "The Shadow" Kim', Archetype.PerimeterDefender) },
  { id: 'c42', name: 'Kara "Kestrel" Wallace', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Kara "Kestrel" Wallace', Archetype.PerimeterDefender) },
  { id: 'c43', name: 'Luis "Lock" Fernandez', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Luis "Lock" Fernandez', Archetype.PerimeterDefender) },
  { id: 'c44', name: 'Mina "Mirage" Gupta', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Mina "Mirage" Gupta', Archetype.PerimeterDefender) },
  { id: 'c45', name: 'Niko "Net" Jansson', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Niko "Net" Jansson', Archetype.PerimeterDefender) },
  { id: 'c46', name: 'Olga "The Owl" Petrova', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Olga "The Owl" Petrova', Archetype.PerimeterDefender) },
  { id: 'c47', name: 'Ravi "Raptor" Kumar', archetypes: [Archetype.PerimeterDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Ravi "Raptor" Kumar', Archetype.PerimeterDefender) },
  // On-Ball Defenders
  { id: 'c48', name: 'Sasha "The Static" Belov', archetypes: [Archetype.OnBallDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Sasha "The Static" Belov', Archetype.OnBallDefender) },
  { id: 'c49', name: 'Tiana "The Trap" Wright', archetypes: [Archetype.OnBallDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Tiana "The Trap" Wright', Archetype.OnBallDefender) },
  { id: 'c50', name: 'Uri "The Urchin" Cohen', archetypes: [Archetype.OnBallDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Uri "The Urchin" Cohen', Archetype.OnBallDefender) },
  { id: 'c51', name: 'Vera "Vise" Romano', archetypes: [Archetype.OnBallDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Vera "Vise" Romano', Archetype.OnBallDefender) },
  { id: 'c52', name: 'Will "The Web" Jackson', archetypes: [Archetype.OnBallDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Will "The Web" Jackson', Archetype.OnBallDefender) },
  { id: 'c53', name: 'Xena "X-Factor" Li', archetypes: [Archetype.OnBallDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Xena "X-Factor" Li', Archetype.OnBallDefender) },
  { id: 'c54', name: 'Yara "Yardstick" Al-Jamil', archetypes: [Archetype.OnBallDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Yara "Yardstick" Al-Jamil', Archetype.OnBallDefender) },
  { id: 'c55', name: 'Zane "The Zone" Miller', archetypes: [Archetype.OnBallDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Zane "The Zone" Miller', Archetype.OnBallDefender) },
  { id: 'c56', name: 'Anika "Anchor" Sharma', archetypes: [Archetype.OnBallDefender], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Anika "Anchor" Sharma', Archetype.OnBallDefender) },

  // == New Rares (27) ==
  { id: 'r1', name: 'Elias "Echo" Vance', archetypes: [Archetype.Playmaker, Archetype.Sharpshooter], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Elias "Echo" Vance', Archetype.Playmaker) },
  { id: 'r2', name: 'Bianca "Blitz" Romano', archetypes: [Archetype.Slasher, Archetype.OnBallDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Bianca "Blitz" Romano', Archetype.Slasher) },
  { id: 'r3', name: 'Cyrus "The Cyclone" Khan', archetypes: [Archetype.Slasher, Archetype.Playmaker], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Cyrus "The Cyclone" Khan', Archetype.Slasher) },
  { id: 'r4', name: 'Daria "The Fortress" Ivanova', archetypes: [Archetype.RimProtector, Archetype.PerimeterDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Daria "The Fortress" Ivanova', Archetype.RimProtector) },
  { id: 'r5', name: 'Finn "The Finisher" O\'Connell', archetypes: [Archetype.Slasher, Archetype.Sharpshooter], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Finn "The Finisher" O\'Connell', Archetype.Slasher) },
  { id: 'r6', name: 'Gabriela "Gravity" Santos', archetypes: [Archetype.RimProtector, Archetype.Playmaker], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Gabriela "Gravity" Santos', Archetype.RimProtector) },
  { id: 'r7', name: 'Hiroki "The Hurricane" Tanaka', archetypes: [Archetype.OnBallDefender, Archetype.Playmaker], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Hiroki "The Hurricane" Tanaka', Archetype.OnBallDefender) },
  { id: 'r8', name: 'Imani "Impact" Adebayo', archetypes: [Archetype.RimProtector, Archetype.Slasher], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Imani "Impact" Adebayo', Archetype.RimProtector) },
  { id: 'r9', name: 'Javier "Jaguar" Reyes', archetypes: [Archetype.PerimeterDefender, Archetype.Slasher], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Javier "Jaguar" Reyes', Archetype.PerimeterDefender) },
  { id: 'r10', name: 'Kira "The Key" Volkov', archetypes: [Archetype.OnBallDefender, Archetype.Sharpshooter], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Kira "The Key" Volkov', Archetype.OnBallDefender) },
  { id: 'r11', name: 'Liam "Longshot" Murphy', archetypes: [Archetype.Sharpshooter, Archetype.Playmaker], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Liam "Longshot" Murphy', Archetype.Sharpshooter) },
  { id: 'r12', name: 'Mona "The Magnet" Al-Farsi', archetypes: [Archetype.PerimeterDefender, Archetype.OnBallDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Mona "The Magnet" Al-Farsi', Archetype.PerimeterDefender) },
  { id: 'r13', name: 'Nikolai "The Navigator" Orlov', archetypes: [Archetype.Playmaker, Archetype.PerimeterDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Nikolai "The Navigator" Orlov', Archetype.Playmaker) },
  { id: 'r14', name: 'Owen "The Overlord" Davies', archetypes: [Archetype.RimProtector, Archetype.Sharpshooter], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Owen "The Overlord" Davies', Archetype.RimProtector) },
  { id: 'r15', name: 'Priya "The Phantom" Singh', archetypes: [Archetype.OnBallDefender, Archetype.Slasher], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Priya "The Phantom" Singh', Archetype.OnBallDefender) },
  { id: 'r16', name: 'Quinn "Quake" Taylor', archetypes: [Archetype.Slasher, Archetype.RimProtector], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Quinn "Quake" Taylor', Archetype.Slasher) },
  { id: 'r17', name: 'Rohan "The Rifle" Joshi', archetypes: [Archetype.Sharpshooter, Archetype.PerimeterDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Rohan "The Rifle" Joshi', Archetype.Sharpshooter) },
  { id: 'r18', name: 'Seraphina "The Sage" Dubois', archetypes: [Archetype.Playmaker, Archetype.Sharpshooter], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Seraphina "The Sage" Dubois', Archetype.Playmaker) },
  { id: 'r19', name: 'Titus "Titan" Wallace', archetypes: [Archetype.RimProtector, Archetype.OnBallDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Titus "Titan" Wallace', Archetype.RimProtector) },
  { id: 'r20', name: 'Uma "The Uprising" Chen', archetypes: [Archetype.PerimeterDefender, Archetype.Playmaker], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Uma "The Uprising" Chen', Archetype.PerimeterDefender) },
  { id: 'r21', name: 'Victor "Vortex" Morales', archetypes: [Archetype.Slasher, Archetype.Playmaker], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Victor "Vortex" Morales', Archetype.Slasher) },
  { id: 'r22', name: 'Willa "The Warden" Kowalski', archetypes: [Archetype.RimProtector, Archetype.PerimeterDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Willa "The Warden" Kowalski', Archetype.RimProtector) },
  { id: 'r23', name: 'Xavier "X-Ray" Johnson', archetypes: [Archetype.Sharpshooter, Archetype.OnBallDefender], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Xavier "X-Ray" Johnson', Archetype.Sharpshooter) },
  { id: 'r24', name: 'Yara "The Yoke" Schmidt', archetypes: [Archetype.OnBallDefender, Archetype.RimProtector], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Yara "The Yoke" Schmidt', Archetype.OnBallDefender) },
  { id: 'r25', name: 'Zane "The Zealot" Al-Jamil', archetypes: [Archetype.PerimeterDefender, Archetype.Sharpshooter], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Zane "The Zealot" Al-Jamil', Archetype.PerimeterDefender) },
  { id: 'r26', name: 'Adrian "The Artist" Bell', archetypes: [Archetype.Playmaker, Archetype.Slasher], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Adrian "The Artist" Bell', Archetype.Playmaker) },
  { id: 'r27', name: 'Cassia "The Comet" Li', archetypes: [Archetype.Sharpshooter, Archetype.Slasher], rarity: 'Rare', statuses: [], imageUrl: createPlayerImageUrl('Cassia "The Comet" Li', Archetype.Sharpshooter) },
  
  // == New Legendaries ("Superstars") (9) ==
  { id: 'l1', name: 'Orion "The Oracle" Hayes', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Orion "The Oracle" Hayes', Archetype.Superstar) },
  { id: 'l2', name: 'Serena "The Sovereign" Cruz', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Serena "The Sovereign" Cruz', Archetype.Superstar) },
  { id: 'l3', name: 'Maximus "The Monarch" Antonov', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Maximus "The Monarch" Antonov', Archetype.Superstar) },
  { id: 'l4', name: 'Astra "The Anomaly" Novak', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Astra "The Anomaly" Novak', Archetype.Superstar) },
  { id: 'l5', name: 'Ronin "The Ronin" Kim', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Ronin "The Ronin" Kim', Archetype.Superstar) },
  { id: 'l6', name: 'Celeste "The Celestial" Moreau', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Celeste "The Celestial" Moreau', Archetype.Superstar) },
  { id: 'l7', name: 'Goliath "The Gatecrasher" Goliath', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Goliath "The Gatecrasher" Goliath', Archetype.Superstar) },
  { id: 'l8', name: 'Vesper "The Viper" Lin', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Vesper "The Viper" Lin', Archetype.Superstar) },
  { id: 'l9', name: 'Silas "The Silent" Kane', archetypes: [Archetype.Superstar], rarity: 'Legendary', statuses: [], imageUrl: createPlayerImageUrl('Silas "The Silent" Kane', Archetype.Superstar) },
];


const CARD_POOL_KEYS = Object.keys(CARDS_DATA).filter(key => !CARDS_DATA[key].isSignatureMove);

const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const generateCardPack = (rarityLock: 'Common' | null = null): CardPack => {
    // --- Player Selection ---
    let availablePlayers: Player[];

    if (rarityLock === 'Common') {
        availablePlayers = ALL_PLAYERS.filter(p => p.rarity === 'Common');
    } else {
        // Rarity distribution: 80% Common, 15% Rare, 5% Legendary
        const playerRoll = Math.random();
        if (playerRoll < 0.05) { // 5% for Legendary
            availablePlayers = ALL_PLAYERS.filter(p => p.rarity === 'Legendary');
        } else if (playerRoll < 0.20) { // 15% for Rare
            availablePlayers = ALL_PLAYERS.filter(p => p.rarity === 'Rare');
        } else { // 80% for Common
            availablePlayers = ALL_PLAYERS.filter(p => p.rarity === 'Common');
        }
    }

    if (availablePlayers.length === 0) availablePlayers = ALL_PLAYERS.filter(p => p.rarity === 'Common');
    if (availablePlayers.length === 0) availablePlayers = ALL_PLAYERS;
    
    const player = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];

    // --- Card Selection ---
    const allCardsPool = Object.keys(CARDS_DATA)
        .filter(key => !CARDS_DATA[key].isSignatureMove)
        .map(key => createCard(key));

    const cards: Card[] = [];

    if (rarityLock === 'Common') {
        const commonCards = allCardsPool.filter(c => c.rarity === 'Common');
        cards.push(...shuffleArray(commonCards).slice(0, 9));
    } else {
        const commonPool = shuffleArray(allCardsPool.filter(c => c.rarity === 'Common'));
        const rarePool = shuffleArray(allCardsPool.filter(c => c.rarity === 'Rare'));
        const legendaryPool = shuffleArray(allCardsPool.filter(c => c.rarity === 'Legendary'));

        for (let i = 0; i < 9; i++) {
            const cardRoll = Math.random();
            // Card rarity distribution: 84% common, 15% rare, 1% legendary
            if (cardRoll < 0.01 && legendaryPool.length > 0) { // 1% Legendary
                cards.push(legendaryPool.pop()!);
            } else if (cardRoll < 0.16 && rarePool.length > 0) { // 15% Rare (1% + 15% = 16%)
                cards.push(rarePool.pop()!);
            } else if (commonPool.length > 0) { // 84% Common
                cards.push(commonPool.pop()!);
            } else if (rarePool.length > 0) { // Fallback if common pool runs out
                cards.push(rarePool.pop()!);
            } else if (legendaryPool.length > 0) { // Fallback if both run out
                cards.push(legendaryPool.pop()!);
            }
        }
    }
    
    // Ensure we have exactly 9 cards, even if pools run dry
    while (cards.length < 9) {
        const fallbackCardKey = CARD_POOL_KEYS[Math.floor(Math.random() * CARD_POOL_KEYS.length)];
        cards.push(createCard(fallbackCardKey));
    }

    return { player, cards: cards.slice(0, 9) };
};


// --- OPPONENT TEAMS ---
export const CONCRETE_CRUSHERS: Team = {
  name: 'The Concrete Crushers',
  playbook: Playbook.GritAndGrind,
  signatureMove: createCard('WRECKING_BALL'),
  courtImage: createCourtImageUrl('The Concrete Crushers'),
  players: [
    { id: 'op1', name: 'Brick', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Brick', Archetype.Slasher) },
    { id: 'op2', name: 'Steel', archetypes: [Archetype.RimProtector], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Steel', Archetype.RimProtector) },
    { id: 'op3', name: 'Hammer', archetypes: [Archetype.Slasher], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Hammer', Archetype.Slasher) },
  ],
  deck: [
    // Shots (7)
    createCard('DRIVE_TO_BASKET'), createCard('DRIVE_TO_BASKET'), createCard('DRIVE_TO_BASKET'),
    createCard('POSTERIZER_DUNK'), createCard('POSTERIZER_DUNK'),
    createCard('PULL_UP_JUMPER'), createCard('PULL_UP_JUMPER'),
    // Defense (9)
    createCard('CONTEST_SHOT'), createCard('CONTEST_SHOT'), createCard('CONTEST_SHOT'),
    createCard('VICIOUS_BLOCK'), createCard('VICIOUS_BLOCK'), createCard('VICIOUS_BLOCK'),
    createCard('PICK_POCKET'), createCard('PICK_POCKET'), createCard('PICK_POCKET'),
    // Utility (4)
    createCard('CROSSOVER'), createCard('CROSSOVER'),
    createCard('QUICK_PASS'), createCard('QUICK_PASS'),
  ],
};

export const NEON_NETS: Team = {
  name: 'The Neon Nets',
  playbook: Playbook.PaceAndSpace,
  signatureMove: createCard('GLITCH_IN_THE_SYSTEM'),
  courtImage: createCourtImageUrl('The Neon Nets'),
  players: [
    { id: 'op4', name: 'Flash', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Flash', Archetype.Sharpshooter) },
    { id: 'op5', name: 'Glitch', archetypes: [Archetype.Playmaker], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Glitch', Archetype.Playmaker) },
    { id: 'op6', name: 'Vapor', archetypes: [Archetype.Sharpshooter], rarity: 'Common', statuses: [], imageUrl: createPlayerImageUrl('Vapor', Archetype.Sharpshooter) },
  ],
  deck: [
    // Shots (9)
    createCard('PULL_UP_JUMPER'), createCard('PULL_UP_JUMPER'), createCard('PULL_UP_JUMPER'),
    createCard('THREE_POINTER'), createCard('THREE_POINTER'), createCard('THREE_POINTER'),
    createCard('QUICK_SHOT'), createCard('QUICK_SHOT'), createCard('QUICK_SHOT'),
    // Playmaking (6)
    createCard('QUICK_PASS'), createCard('QUICK_PASS'), createCard('QUICK_PASS'),
    createCard('CROSSOVER'), createCard('CROSSOVER'), createCard('CROSSOVER'),
    // Defense (5)
    createCard('CONTEST_SHOT'), createCard('CONTEST_SHOT'),
    createCard('PICK_POCKET'), createCard('PICK_POCKET'),
    createCard('INTERCEPT'),
  ],
};
