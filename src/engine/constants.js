// ─── FORMAT DEFINITIONS ─────────────────────────────────────────────────────

export const FORMATS = {
  T20: {
    name: 'T20',
    overs: 20,
    label: 'T20 International',
    avgRunRate: 8.25,
    powerplayOvers: [1, 6],
    deathOvers: [16, 20],
    middleOvers: [7, 15],
    newBallOvers: 6,
    maxWickets: 10,
    phases: [
      { name: 'Powerplay', start: 1, end: 6, runRateMultiplier: 1.15, wicketMultiplier: 0.85 },
      { name: 'Middle', start: 7, end: 15, runRateMultiplier: 0.88, wicketMultiplier: 1.1 },
      { name: 'Death', start: 16, end: 20, runRateMultiplier: 1.35, wicketMultiplier: 1.25 },
    ],
  },
  ODI: {
    name: 'ODI',
    overs: 50,
    label: 'One Day International',
    avgRunRate: 5.6,
    powerplayOvers: [1, 10],
    deathOvers: [41, 50],
    middleOvers: [11, 40],
    newBallOvers: 10,
    maxWickets: 10,
    phases: [
      { name: 'Powerplay', start: 1, end: 10, runRateMultiplier: 1.12, wicketMultiplier: 0.9 },
      { name: 'Middle', start: 11, end: 40, runRateMultiplier: 0.85, wicketMultiplier: 1.05 },
      { name: 'Death', start: 41, end: 50, runRateMultiplier: 1.45, wicketMultiplier: 1.3 },
    ],
  },
  TEST: {
    name: 'TEST',
    overs: 90, // per day, 5 days
    label: 'Test Match',
    avgRunRate: 3.2,
    powerplayOvers: null,
    deathOvers: null,
    middleOvers: null,
    newBallOvers: 20,
    maxWickets: 10,
    innings: 4,
    phases: [
      { name: 'New Ball', start: 1, end: 20, runRateMultiplier: 0.85, wicketMultiplier: 1.35 },
      { name: 'Middle', start: 21, end: 60, runRateMultiplier: 1.05, wicketMultiplier: 0.9 },
      { name: 'Old Ball', start: 61, end: 80, runRateMultiplier: 1.15, wicketMultiplier: 0.8 },
      { name: 'Second New Ball', start: 81, end: 90, runRateMultiplier: 0.9, wicketMultiplier: 1.3 },
    ],
  },
};

// ─── BALL OUTCOMES ──────────────────────────────────────────────────────────

export const OUTCOMES = {
  DOT: 0,
  SINGLE: 1,
  DOUBLE: 2,
  TRIPLE: 3,
  FOUR: 4,
  SIX: 6,
  WICKET: -1,
  WIDE: 'wide',
  NO_BALL: 'noball',
  LEG_BYE: 'legbye',
};

// Base probability weights (before modifiers)
export const BASE_PROBABILITIES = {
  T20: {
    0: 0.30,   // dot
    1: 0.30,   // single
    2: 0.10,   // double
    3: 0.01,   // triple
    4: 0.14,   // four
    6: 0.07,   // six
    wicket: 0.035,
    wide: 0.025,
    noball: 0.01,
    legbye: 0.01,
  },
  ODI: {
    0: 0.37,
    1: 0.30,
    2: 0.10,
    3: 0.01,
    4: 0.11,
    6: 0.035,
    wicket: 0.03,
    wide: 0.025,
    noball: 0.008,
    legbye: 0.012,
  },
  TEST: {
    0: 0.48,
    1: 0.27,
    2: 0.08,
    3: 0.01,
    4: 0.08,
    6: 0.01,
    wicket: 0.025,
    wide: 0.015,
    noball: 0.005,
    legbye: 0.015,
  },
};

// ─── BALL CONDITION THRESHOLDS ──────────────────────────────────────────────
// Maps ball age ranges to swing/spin/bounce/seam multipliers

export const BALL_CONDITION_LEVELS = {
  NEW:      { label: 'New',      maxAge: 14,  swing: 1.40, spin: 0.60, bounce: 1.30, seam: 1.50 },
  SEMI_NEW: { label: 'Semi-New', maxAge: 29,  swing: 1.15, spin: 0.80, bounce: 1.10, seam: 1.20 },
  OLD:      { label: 'Old',      maxAge: 59,  swing: 0.70, spin: 1.40, bounce: 0.90, seam: 0.80 },
  VERY_OLD: { label: 'Very Old', maxAge: 999, swing: 0.40, spin: 1.60, bounce: 0.70, seam: 0.50 },
};

// ─── DISMISSAL TYPES ────────────────────────────────────────────────────────
// Base weights — these get modified by ball condition at simulation time

export const DISMISSAL_TYPES = {
  default: [
    { type: 'Bowled', weight: 0.18, commentary: 'is bowled!' },
    { type: 'Caught', weight: 0.42, commentary: 'is caught!' },
    { type: 'LBW', weight: 0.16, commentary: 'is given out LBW!' },
    { type: 'Run Out', weight: 0.08, commentary: 'is run out!' },
    { type: 'Stumped', weight: 0.06, commentary: 'is stumped!' },
    { type: 'Caught & Bowled', weight: 0.05, commentary: 'is caught and bowled!' },
    { type: 'Hit Wicket', weight: 0.02, commentary: 'has hit his own wicket!' },
    { type: 'Caught Behind', weight: 0.03, commentary: 'edges and is caught behind!' },
  ],
  // Pace with new ball — more bowled/caught behind/LBW
  paceNewBall: [
    { type: 'Bowled', weight: 0.28, commentary: 'is bowled! Beaten by sheer pace!' },
    { type: 'Caught', weight: 0.22, commentary: 'is caught! The movement off the seam did the trick!' },
    { type: 'Caught Behind', weight: 0.20, commentary: 'edges and is caught behind! Great seam movement!' },
    { type: 'LBW', weight: 0.18, commentary: 'is given out LBW! Struck on the front pad!' },
    { type: 'Caught & Bowled', weight: 0.04, commentary: 'is caught and bowled! Leading edge!' },
    { type: 'Run Out', weight: 0.05, commentary: 'is run out!' },
    { type: 'Hit Wicket', weight: 0.02, commentary: 'has hit his own wicket! Beaten by the bounce!' },
    { type: 'Stumped', weight: 0.01, commentary: 'is stumped!' },
  ],
  // Spin with old ball — more LBW/stumped/caught close
  spinOldBall: [
    { type: 'LBW', weight: 0.28, commentary: 'is given out LBW! Pinned on the crease by the turn!' },
    { type: 'Stumped', weight: 0.20, commentary: 'is stumped! Drawn out by the flight, beaten by the turn!' },
    { type: 'Caught', weight: 0.22, commentary: 'is caught! Couldn\'t resist the temptation!' },
    { type: 'Bowled', weight: 0.15, commentary: 'is bowled! Clean through the gate! What a delivery!' },
    { type: 'Caught & Bowled', weight: 0.08, commentary: 'is caught and bowled! Mistimed the drive!' },
    { type: 'Run Out', weight: 0.04, commentary: 'is run out!' },
    { type: 'Caught Behind', weight: 0.02, commentary: 'edges and is caught behind! Took the edge with spin!' },
    { type: 'Hit Wicket', weight: 0.01, commentary: 'has hit his own wicket!' },
  ],
};

// ─── PITCH TYPES ────────────────────────────────────────────────────────────

export const PITCH_TYPES = {
  BATTING_PARADISE: { name: 'Batting Paradise', runMultiplier: 1.2, wicketMultiplier: 0.7, spinFactor: 0.6, seamFactor: 0.5 },
  BALANCED: { name: 'Balanced', runMultiplier: 1.0, wicketMultiplier: 1.0, spinFactor: 1.0, seamFactor: 1.0 },
  SEAMER_FRIENDLY: { name: 'Seamer Friendly', runMultiplier: 0.85, wicketMultiplier: 1.3, spinFactor: 0.6, seamFactor: 1.6 },
  SPIN_FRIENDLY: { name: 'Spin Friendly', runMultiplier: 0.9, wicketMultiplier: 1.2, spinFactor: 1.6, seamFactor: 0.7 },
  DUSTBOWL: { name: 'Dustbowl', runMultiplier: 0.75, wicketMultiplier: 1.5, spinFactor: 2.0, seamFactor: 0.5 },
  GREEN_TOP: { name: 'Green Top', runMultiplier: 0.8, wicketMultiplier: 1.4, spinFactor: 0.4, seamFactor: 1.8 },
};

// ─── BOWLER TYPES ───────────────────────────────────────────────────────────

export const BOWLER_TYPES = {
  FAST: 'Fast',
  FAST_MEDIUM: 'Fast Medium',
  MEDIUM: 'Medium',
  OFF_SPIN: 'Off Spin',
  LEG_SPIN: 'Leg Spin',
  LEFT_ARM_SPIN: 'Left Arm Spin',
  LEFT_ARM_FAST: 'Left Arm Fast',
};

export const PACE_TYPES = [BOWLER_TYPES.FAST, BOWLER_TYPES.FAST_MEDIUM, BOWLER_TYPES.LEFT_ARM_FAST, BOWLER_TYPES.MEDIUM];
export const SPIN_TYPES = [BOWLER_TYPES.OFF_SPIN, BOWLER_TYPES.LEG_SPIN, BOWLER_TYPES.LEFT_ARM_SPIN];

// ─── FATIGUE TABLE (TEST ONLY) ──────────────────────────────────────────────
// After N balls faced, batting multiplier degrades

export const FATIGUE_THRESHOLDS = [
  { balls: 0,   factor: 1.00 },  // Fresh
  { balls: 120, factor: 0.98 },  // ~20 overs
  { balls: 300, factor: 0.95 },  // ~50 overs
  { balls: 500, factor: 0.90 },  // Day 2 grind
  { balls: 700, factor: 0.85 },  // Deep innings
];

export function getFatigueFactor(ballsFaced) {
  let factor = 1.0;
  for (const t of FATIGUE_THRESHOLDS) {
    if (ballsFaced >= t.balls) factor = t.factor;
  }
  return factor;
}

// ─── FORMAT-SPECIFIC SCORING MULTIPLIER ─────────────────────────────────────
// Returns a multiplier for how aggressively batsmen score in different phases

export function getFormatScoringMultiplier(format, oversCompleted) {
  if (format === 'TEST') {
    if (oversCompleted < 15) return 0.33;       // First session — cautious
    if (oversCompleted < 45) return 0.50;       // Build phase
    if (oversCompleted < 75) return 0.55;       // Middle session
    return 0.58;                                 // Late push
  }
  if (format === 'ODI') {
    if (oversCompleted < 10) return 1.0;         // Powerplay
    if (oversCompleted < 35) return 0.75;        // Consolidation
    if (oversCompleted < 40) return 0.85;        // Acceleration
    return 1.2;                                  // Death
  }
  if (format === 'T20') {
    if (oversCompleted < 6) return 1.4;          // Powerplay blast
    if (oversCompleted < 15) return 1.0;         // Middle consolidation
    return 1.5;                                  // Death overs slog
  }
  return 1.0;
}
