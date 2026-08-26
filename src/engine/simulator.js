import {
  FORMATS, BASE_PROBABILITIES, DISMISSAL_TYPES, PITCH_TYPES, BOWLER_TYPES,
  PACE_TYPES, SPIN_TYPES, BALL_CONDITION_LEVELS,
  getFatigueFactor, getFormatScoringMultiplier,
} from './constants';
import { STADIUMS } from './stadiums';

// ─── BALL CONDITION ─────────────────────────────────────────────────────────
// Tracks swing → seam → reverse swing → spin progression over ball age

export class BallCondition {
  constructor() {
    this.ballAge = 0;
    this.roughness = 0;  // 0-100
    this.condition = 'New';
  }

  update() {
    this.ballAge++;
    this.roughness = Math.min(100, this.ballAge * 0.15);
    this._updateConditionLabel();
  }

  _updateConditionLabel() {
    for (const [, level] of Object.entries(BALL_CONDITION_LEVELS)) {
      if (this.ballAge <= level.maxAge) {
        this.condition = level.label;
        return;
      }
    }
    this.condition = 'Very Old';
  }

  _getLevel() {
    for (const [, level] of Object.entries(BALL_CONDITION_LEVELS)) {
      if (this.ballAge <= level.maxAge) return level;
    }
    return BALL_CONDITION_LEVELS.VERY_OLD;
  }

  getSwingFactor()   { return this._getLevel().swing; }
  getSpinFactor()    { return this._getLevel().spin; }
  getBounceFactor()  { return this._getLevel().bounce; }
  getSeamMovement()  { return this._getLevel().seam; }

  /** Reverse swing kicks in after ~50 balls and grows */
  getReverseSwingFactor() {
    if (this.ballAge <= 50) return 0;
    return Math.min(1.0, 0.3 + (this.ballAge - 50) / 40);
  }

  reset() {
    this.ballAge = 0;
    this.roughness = 0;
    this.condition = 'New';
  }
}

// ─── POWERPLAY MANAGER ─────────────────────────────────────────────────────

export class PowerplayManager {
  constructor(format) {
    this.format = FORMATS[format];
    this.formatKey = format;
  }

  getCurrentPhase(overNumber) {
    if (!this.format.phases) return null;
    for (const phase of this.format.phases) {
      if (overNumber >= phase.start && overNumber <= phase.end) return phase;
    }
    return this.format.phases[this.format.phases.length - 1];
  }

  isInPowerplay(overNumber) {
    const phase = this.getCurrentPhase(overNumber);
    return phase && phase.name === 'Powerplay';
  }

  isDeathOvers(overNumber) {
    const phase = this.getCurrentPhase(overNumber);
    return phase && phase.name === 'Death';
  }

  /**
   * Returns multipliers for the current phase,
   * with bowler-type-specific adjustments in powerplay.
   */
  getMultipliers(overNumber, bowlerType) {
    const phase = this.getCurrentPhase(overNumber);
    if (!phase) return { runRate: 1.0, wicket: 1.0, boundary: 1.0, phaseName: '—' };

    let boundaryMult, runRateMult;
    const isPacer = PACE_TYPES.includes(bowlerType);
    const isSpinner = SPIN_TYPES.includes(bowlerType);

    if (phase.name === 'Powerplay') {
      // Pacers are expensive in powerplay; spinners can contain
      runRateMult = isPacer ? phase.runRateMultiplier * 1.18
                   : isSpinner ? phase.runRateMultiplier * 0.85
                   : phase.runRateMultiplier;
      boundaryMult = 1.45;  // 45% more boundaries in powerplay
    } else if (phase.name === 'Death') {
      runRateMult = phase.runRateMultiplier;
      boundaryMult = 1.35;
    } else {
      runRateMult = phase.runRateMultiplier;
      boundaryMult = 0.85;
    }

    return {
      runRate: runRateMult,
      wicket: phase.wicketMultiplier,
      boundary: boundaryMult,
      phaseName: phase.name,
    };
  }
}

// ─── CAPTAINSHIP PROFILE ────────────────────────────────────────────────────

export class CaptainshipProfile {
  constructor(player) {
    this.player = player;
    this.rating = player.captainRating || 50;
    this.experience = player.experience || 50;
    this.pressure = player.pressure || 50;
    // Simulate a win percentage from rating (rating 90 → ~62%, rating 50 → ~50%)
    this._winPct = 0.40 + (this.rating / 100) * 0.25;
  }

  /**
   * Aggressive coefficient — good captains push for wickets.
   * Win% 60 → 1.18 aggressive multiplier.
   */
  get aggressive() {
    return Math.min(1.40, 1.0 + this._winPct * 0.30);
  }

  /**
   * Defensive coefficient — poor captains bleed runs.
   * Win% 40 → 0.88 defensive multiplier.
   */
  get defensive() {
    return Math.max(0.70, 1.0 - (1 - this._winPct) * 0.20);
  }

  /** Better captains place fields better → fewer runs, more wickets */
  getFieldPlacementFactor(matchSituation) {
    let base = 1.0 + (this.rating - 50) / 400;  // ±12.5%

    // Under pressure with many wickets lost — aggressive captains push harder
    if (matchSituation && matchSituation.wicketsLost >= 6) {
      base *= this.aggressive * 1.10;
    }
    return base;
  }

  /** Smart bowler selection — captain picks the right type for conditions */
  getBowlerSelectionBonus(bowler, ballAge) {
    const isSpinner = SPIN_TYPES.includes(bowler.bowling.type);
    const isPacer = PACE_TYPES.includes(bowler.bowling.type);

    // New ball → pace is correct
    if (ballAge < 15 && isPacer) return 1.10;
    // Old ball → spin is correct
    if (ballAge > 40 && isSpinner) return 1.10;
    // Wrong choice
    if (ballAge < 15 && isSpinner) return 0.92;
    if (ballAge > 60 && isPacer) return 0.95;

    return 1.0;
  }

  /** Wicket probability boost from fielding IQ */
  getWicketProbabilityMultiplier() {
    // Experienced captains with high ratings set better fields → +12% max
    if (this.rating > 80) return 1.12;
    if (this.rating > 65) return 1.06;
    return 1.0;
  }

  /** Toss call accuracy */
  getTossCallAccuracy() {
    // rating 50 → 50%, rating 90 → 58%
    return 0.40 + (this.rating / 100) * 0.20;
  }
}

// ─── TOSS ───────────────────────────────────────────────────────────────────

export function simulateToss(team1Captain, team2Captain, format, stadium) {
  const cap1 = new CaptainshipProfile(team1Captain);
  const cap2 = new CaptainshipProfile(team2Captain);

  const acc1 = cap1.getTossCallAccuracy();
  const acc2 = cap2.getTossCallAccuracy();
  const tossWinner = Math.random() < (acc1 / (acc1 + acc2)) ? 0 : 1;

  // Decision logic — uses pitch type, dew, format
  const stadiumData = STADIUMS[stadium];
  const pitch = PITCH_TYPES[stadiumData?.pitchType || 'BALANCED'];
  const hasDew = stadiumData?.dew || false;

  let batFirstProb = 0.50;

  // Pitch conditions
  if (pitch.seamFactor > 1.3) batFirstProb -= 0.20;   // green top → bowl first
  if (pitch.spinFactor > 1.3) batFirstProb += 0.15;   // dustbowl → bat first (deteriorates)
  if (pitch.runMultiplier > 1.1) batFirstProb += 0.05; // flat → bat first

  // Dew → easier to bat second → bowl first
  if (hasDew) batFirstProb -= 0.15;

  // T20s tend to chase
  if (format === 'T20') batFirstProb -= 0.12;
  // Tests traditionally bat first
  if (format === 'TEST') batFirstProb += 0.10;

  batFirstProb = Math.max(0.15, Math.min(0.85, batFirstProb));
  const decision = Math.random() < batFirstProb ? 'bat' : 'bowl';

  return {
    winner: tossWinner,
    decision,
    psychBoost: 1.08,      // +8% psychological boost
    runRateBoost: 1.05,    // +5% run rate advantage
    winProbIncrease: 0.05, // +5% match win probability
    hasDew,
  };
}

// ─── BATTING ROLE ───────────────────────────────────────────────────────────

export function determineBattingRole(player, matchSituation) {
  const {
    currentRR = 0, requiredRR = 0, wicketsLost = 0,
    oversRemaining = 20, isChasing = false, format = 'T20',
    ballsLeft = oversRemaining * 6,
  } = matchSituation;

  const baseAggression = player.batting.aggression || 50;
  let modifier = 0;

  // ─── CHASING PRESSURE ──────────────────────────────────────────────
  if (isChasing && requiredRR > 0) {
    const rrGap = requiredRR - currentRR;
    if (rrGap > 3) modifier += Math.min(40, rrGap * 10);
    else if (rrGap > 0) modifier += rrGap * 5;
    else modifier -= 5; // ahead of the rate → relax
  }

  // Runs per ball pressure (aggressive threshold from guide: > 7 runs per ball)
  const runsNeeded = isChasing ? (requiredRR * oversRemaining) : 0;
  if (isChasing && ballsLeft > 0 && (runsNeeded / ballsLeft) > 1.17) { // >7 runs per over
    modifier += 35;
  }

  // ─── WICKET PRESSURE ──────────────────────────────────────────────
  if (wicketsLost >= 7) modifier -= 30;
  else if (wicketsLost >= 5) modifier -= 15;

  // ─── PHASE PRESSURE ──────────────────────────────────────────────
  if (format !== 'TEST' && oversRemaining <= 5) modifier += 30;      // death overs — go big
  if (format !== 'TEST' && oversRemaining > (FORMATS[format]?.overs - 6)) modifier += 10; // powerplay

  const effectiveAggression = Math.max(5, Math.min(100, baseAggression + modifier));

  // ─── ROLE ASSIGNMENT WITH GRANULAR ATTRIBUTES ──────────────────────
  if (effectiveAggression >= 75) {
    return {
      role: 'Aggressive',
      multiplier: 1.35,
      sixMultiplier: 1.50,
      dotBallTolerance: 0.10,
      riskTaking: 1.30,
      wicketRiskMultiplier: 1.25,
      expectedSR: Math.min(160, (player.batting.strikeRate || 130) * 1.40),
    };
  }
  if (effectiveAggression >= 45) {
    return {
      role: 'Moderate',
      multiplier: 1.00,
      sixMultiplier: 1.00,
      dotBallTolerance: 0.25,
      riskTaking: 1.00,
      wicketRiskMultiplier: 1.00,
      expectedSR: player.batting.strikeRate || 130,
    };
  }
  return {
    role: 'Defensive',
    multiplier: 0.60,
    sixMultiplier: 0.50,
    dotBallTolerance: 0.40,
    riskTaking: 0.40,
    wicketRiskMultiplier: 0.70,
    expectedSR: (player.batting.strikeRate || 130) * 0.65,
  };
}

// ─── NEXT BATTER LOGIC ─────────────────────────────────────────────────────

export function getNextBatterAdjustment(previousBatterPerformance) {
  if (!previousBatterPerformance) return 1.0;

  const { runs, balls, wasAggressive, runsLastOver = 0, partnershipBalls = 0 } = previousBatterPerformance;
  const sr = balls > 0 ? (runs / balls) * 100 : 0;

  // If previous batter scored fast → next should consolidate
  if (sr > 150 && wasAggressive) return 0.85;
  // If partnership established (> 20 balls) → stabilize
  if (partnershipBalls > 20) return 0.92;
  // If previous batter was slow → next should attack
  if (sr < 80 && balls > 10) return 1.15;
  // Quick wicket → be cautious
  if (balls < 5 && runs < 5) return 0.90;
  // Runs drying up (0 runs last over, long partnership) → must accelerate
  if (runsLastOver === 0 && partnershipBalls > 30) return 1.20;

  return 1.0;
}

// ─── FORM FACTOR ────────────────────────────────────────────────────────────
// Uses the player's current `form` attribute (0-100)

function getFormFactor(player) {
  const form = player.form || 70;
  // form 100 → 1.15, form 70 → 1.0, form 40 → 0.85
  return 0.70 + (form / 100) * 0.45;
}

// ─── CONTEXT-AWARE DISMISSAL SELECTION ──────────────────────────────────────

function selectDismissalType(bowler, ballCondition) {
  const isSpinner = SPIN_TYPES.includes(bowler.bowling.type);
  const isNewBall = ballCondition.ballAge < 15;
  const isOldBall = ballCondition.ballAge > 40;

  let table;
  if (!isSpinner && isNewBall) {
    table = DISMISSAL_TYPES.paceNewBall;
  } else if (isSpinner && isOldBall) {
    table = DISMISSAL_TYPES.spinOldBall;
  } else {
    table = DISMISSAL_TYPES.default;
  }

  const rand = Math.random();
  let cumulative = 0;
  for (const dm of table) {
    cumulative += dm.weight;
    if (rand <= cumulative) return dm;
  }
  return table[1]; // fallback: caught
}

// ─── CORE BALL SIMULATION ───────────────────────────────────────────────────

export function simulateBall({
  batsman,
  bowler,
  format,
  stadium,
  overNumber,
  ballCondition,
  powerplayManager,
  captainProfile,
  matchSituation,
  tossWinnerBatting,
  nextBatterAdj = 1.0,
  isBattingFirst = true,
}) {
  const formatKey = format.name || format;
  const baseProbs = { ...BASE_PROBABILITIES[formatKey] };
  const stadiumData = STADIUMS[stadium] || {};
  const pitch = PITCH_TYPES[stadiumData.pitchType || 'BALANCED'];

  const isSpinner = SPIN_TYPES.includes(bowler.bowling.type);
  const isPacer = PACE_TYPES.includes(bowler.bowling.type);

  // ── 1. Phase multipliers (with bowler-type PP adjustment) ──────────
  const phaseMultipliers = powerplayManager.getMultipliers(overNumber, bowler.bowling.type);

  // ── 2. Ball condition factors ─────────────────────────────────────
  const swing = ballCondition.getSwingFactor();
  const spin = ballCondition.getSpinFactor();
  const bounce = ballCondition.getBounceFactor();
  const seam = ballCondition.getSeamMovement();
  const reverseSwing = ballCondition.getReverseSwingFactor();

  let bowlerEffectiveness;
  if (isSpinner) {
    bowlerEffectiveness = spin * pitch.spinFactor;
  } else {
    // Pace bowlers benefit from swing (new ball) or reverse swing (old ball)
    const swingContribution = swing + reverseSwing * 0.6;
    bowlerEffectiveness = swingContribution * seam * pitch.seamFactor;
    // Bounce also helps pacers
    bowlerEffectiveness *= (0.7 + bounce * 0.3);
  }

  // ── 3. Bowler skill factor ────────────────────────────────────────
  const bowlerAvg = bowler.bowling.average || 30;
  const bowlerSR = bowler.bowling.strikeRate || 25;
  const bowlerSkill = (30 / bowlerAvg) * (25 / bowlerSR);
  bowlerEffectiveness *= Math.sqrt(Math.max(0.3, bowlerSkill));

  // ── 4. Captain bowler-selection bonus ─────────────────────────────
  if (captainProfile) {
    bowlerEffectiveness *= captainProfile.getBowlerSelectionBonus(bowler, ballCondition.ballAge);
  }

  // ── 5. Batsman skill factor ───────────────────────────────────────
  const handling = isSpinner
    ? (batsman.batting.spinHandling || 50) / 100
    : (batsman.batting.paceHandling || 50) / 100;
  const batsmanAvg = batsman.batting.average || 35;
  const batsmanSR = batsman.batting.strikeRate || 130;
  const batsmanSkill = (batsmanAvg / 40) * (batsmanSR / 130);
  const batsmanFactor = Math.sqrt(Math.max(0.3, batsmanSkill)) * (0.5 + handling * 0.5);

  // ── 6. Form factor ────────────────────────────────────────────────
  const formMult = getFormFactor(batsman);

  // ── 7. Fatigue factor (Test only) ─────────────────────────────────
  const fatigue = formatKey === 'TEST'
    ? getFatigueFactor(matchSituation.batsmanBallsFaced || 0)
    : 1.0;

  // ── 8. Batting role ───────────────────────────────────────────────
  const role = determineBattingRole(batsman, matchSituation);

  // ── 9. Captain field placement ────────────────────────────────────
  const fieldFactor = captainProfile
    ? captainProfile.getFieldPlacementFactor(matchSituation)
    : 1.0;
  const wicketCaptainMult = captainProfile
    ? captainProfile.getWicketProbabilityMultiplier()
    : 1.0;

  // ── 10. Stadium factors ───────────────────────────────────────────
  const stadiumRunMult = stadiumData.runMultiplier || 1.0;
  const stadiumBoundaryFactor = stadiumData.boundaryFactor || 1.0;
  // Spin/pace multiplier from stadium
  const stadiumBowlerMult = isSpinner
    ? (stadiumData.spinMultiplier || 1.0)
    : (stadiumData.paceMultiplier || 1.0);

  // Second innings pitch deterioration
  const inningsAdj = isBattingFirst ? 1.0 : (stadiumData.secondInningsAdj || 0.95);

  // ── 11. Dew factor ────────────────────────────────────────────────
  // Dew makes the ball wet → harder to grip → less swing/spin, easier batting
  let dewFactor = 1.0;
  if (stadiumData.dew && !isBattingFirst) {
    dewFactor = 1.08; // 8% easier to bat second with dew
  }

  // ── 12. Toss psychological boost ──────────────────────────────────
  const tossBoost = tossWinnerBatting ? 1.04 : 0.96;

  // ── 13. Format-specific scoring multiplier ────────────────────────
  const formatScoring = getFormatScoringMultiplier(formatKey, overNumber);

  // ═══════════════════════════════════════════════════════════════════
  // MODIFY PROBABILITIES
  // ═══════════════════════════════════════════════════════════════════

  const combinedBatMult = batsmanFactor * formMult * fatigue * role.multiplier * tossBoost
                        * nextBatterAdj * dewFactor * inningsAdj;

  // Boundary chances
  baseProbs[4] *= phaseMultipliers.boundary * combinedBatMult * stadiumBoundaryFactor
                * stadiumRunMult * formatScoring;
  baseProbs[6] *= phaseMultipliers.boundary * (combinedBatMult * 0.6 + role.sixMultiplier * 0.4)
                * stadiumBoundaryFactor * stadiumRunMult * formatScoring;

  // Wicket probability
  const bowlerMult = bowlerEffectiveness * stadiumBowlerMult * fieldFactor * wicketCaptainMult;
  baseProbs.wicket *= phaseMultipliers.wicket * bowlerMult
                    * role.wicketRiskMultiplier * (1 / Math.max(0.3, batsmanFactor * formMult))
                    * (stadiumData.wicketMultiplier || 1.0);

  // Singles / Doubles
  baseProbs[1] *= combinedBatMult * phaseMultipliers.runRate * formatScoring;
  baseProbs[2] *= combinedBatMult * phaseMultipliers.runRate * formatScoring * 0.9;

  // Dot balls — inversely affected
  baseProbs[0] *= (1 / Math.max(0.3, role.multiplier)) * bowlerEffectiveness
                * (1 / phaseMultipliers.runRate) * (1 / formatScoring);

  // Extras
  baseProbs.wide *= (1 + (bowler.bowling.economy - 7) * 0.1);
  // Dew increases wides (harder to grip)
  if (stadiumData.dew && !isBattingFirst) baseProbs.wide *= 1.15;

  // ═══════════════════════════════════════════════════════════════════
  // NORMALIZE AND SELECT OUTCOME
  // ═══════════════════════════════════════════════════════════════════

  const outcomes = [
    { type: 'runs', value: 0, weight: baseProbs[0] },
    { type: 'runs', value: 1, weight: baseProbs[1] },
    { type: 'runs', value: 2, weight: baseProbs[2] },
    { type: 'runs', value: 3, weight: baseProbs[3] },
    { type: 'runs', value: 4, weight: baseProbs[4] },
    { type: 'runs', value: 6, weight: baseProbs[6] },
    { type: 'wicket', value: -1, weight: baseProbs.wicket },
    { type: 'wide', value: 1, weight: baseProbs.wide },
    { type: 'noball', value: 1, weight: baseProbs.noball },
    { type: 'legbye', value: 1, weight: baseProbs.legbye },
  ];

  const totalWeight = outcomes.reduce((s, o) => s + Math.max(0, o.weight), 0);
  const rand = Math.random() * totalWeight;
  let cumulative = 0;
  let selected = outcomes[0];
  for (const outcome of outcomes) {
    cumulative += Math.max(0, outcome.weight);
    if (rand <= cumulative) { selected = outcome; break; }
  }

  // Context-aware dismissal type
  let dismissalType = null;
  if (selected.type === 'wicket') {
    dismissalType = selectDismissalType(bowler, ballCondition);
  }

  // Commentary
  const commentary = generateCommentary(selected, batsman, bowler, dismissalType, overNumber, ballCondition);

  return {
    outcome: selected,
    dismissalType,
    commentary,
    phaseName: phaseMultipliers.phaseName,
    battingRole: role.role,
    ballCondition: ballCondition.condition,
    ballConditionAge: ballCondition.ballAge,
    bowlerEffectiveness: bowlerEffectiveness.toFixed(2),
    reverseSwing: ballCondition.getReverseSwingFactor().toFixed(2),
    dewActive: stadiumData.dew && !isBattingFirst,
  };
}

// ─── COMMENTARY GENERATOR ───────────────────────────────────────────────────

function generateCommentary(outcome, batsman, bowler, dismissalType, overNumber, ballCondition) {
  const bName = batsman.name;
  const bowlName = bowler.name;
  const condition = ballCondition.condition;

  if (outcome.type === 'wicket') {
    const dm = dismissalType;
    const exclamations = ['OUT!', 'GONE!', 'WICKET!', 'That\'s the breakthrough!', 'Big wicket!', 'He\'s got him!'];
    let extra = '';
    if (condition === 'New') extra = ' The new ball does the damage!';
    else if (condition === 'Very Old') extra = ' The old ball turning square!';
    return `${exclamations[Math.floor(Math.random() * exclamations.length)]} ${bName} ${dm.commentary} ${bowlName} strikes in over ${overNumber}.${extra}`;
  }

  if (outcome.type === 'wide') {
    const wides = [
      `Wide ball from ${bowlName}. Straying down the leg side.`,
      `Wide! ${bowlName} drags it too wide outside off.`,
      `Called wide. ${bowlName} losing the line here.`,
    ];
    return wides[Math.floor(Math.random() * wides.length)];
  }

  if (outcome.type === 'noball') {
    return `No ball! ${bowlName} overstepped. Free hit coming up.`;
  }

  if (outcome.value === 0) {
    const dots = [
      `Dot ball. ${bowlName} keeps it tight.`,
      `Nothing doing. ${bName} defends solidly.`,
      `Good delivery from ${bowlName}, beaten past the edge.`,
      `Played and missed! ${bowlName} testing ${bName} here.`,
      `Defended back to the bowler. No run.`,
      `Blocked! ${bName} is watchful here.`,
      `Tight line from ${bowlName}. ${bName} can't score off that.`,
    ];
    return dots[Math.floor(Math.random() * dots.length)];
  }

  if (outcome.value === 1) {
    const singles = [
      `Pushed into the gap for a single. ${bName} rotates strike.`,
      `Nudged off the pads. Quick single taken.`,
      `Tapped to mid-off, easy single.`,
      `Worked to midwicket, single taken. Smart cricket.`,
    ];
    return singles[Math.floor(Math.random() * singles.length)];
  }

  if (outcome.value === 2) {
    const doubles = [
      `Good running! ${bName} picks up two.`,
      `Driven through the covers, they come back for two.`,
      `Placed into the gap, excellent running for a brace.`,
      `Clipped through mid-wicket, quick running makes it two.`,
    ];
    return doubles[Math.floor(Math.random() * doubles.length)];
  }

  if (outcome.value === 3) {
    return `Three runs! Great placement by ${bName}, the fielder was slow getting there.`;
  }

  if (outcome.value === 4) {
    const fours = [
      `FOUR! ${bName} cracks it through the covers!`,
      `FOUR! Beautiful drive by ${bName}! Racing to the boundary.`,
      `FOUR! Cut shot! ${bName} is timing it perfectly.`,
      `FOUR! Punched off the back foot! ${bowlName} slightly short.`,
      `FOUR! Swept fine, that's a great shot from ${bName}!`,
      `FOUR! Flicked off the pads! That's elegant from ${bName}!`,
      `FOUR! Square drive! ${bName} is in sublime touch!`,
    ];
    return fours[Math.floor(Math.random() * fours.length)];
  }

  if (outcome.value === 6) {
    const sixes = [
      `SIX! ${bName} launches it into the stands! Massive hit!`,
      `SIX! What a shot! ${bName} has sent that into orbit!`,
      `SIX! Down the ground! ${bName} is in destructive mood!`,
      `SIX! Scooped over fine leg! Audacious from ${bName}!`,
      `SIX! Over long-on! ${bowlName} won't want to see that replay!`,
      `SIX! Flat-batted over mid-off! ${bName} is toying with the bowlers!`,
    ];
    return sixes[Math.floor(Math.random() * sixes.length)];
  }

  return `${outcome.value} run(s) scored.`;
}

// ─── FULL INNINGS SIMULATOR ─────────────────────────────────────────────────

export function simulateInnings({
  battingTeam,
  bowlingTeam,
  format,
  stadium,
  tossResult,
  isBattingFirst,
  target = null,
  onBallComplete = null,
}) {
  const formatData = FORMATS[format];
  const totalBalls = formatData.overs * 6;
  const maxWickets = formatData.maxWickets;

  const ballCondition = new BallCondition();
  const powerplay = new PowerplayManager(format);
  const bowlingCaptain = bowlingTeam.players[bowlingTeam.captainIndex];
  const captainProfile = new CaptainshipProfile(bowlingCaptain);

  // ── Batting order ────────────────────────────────────────────────
  const battingOrder = [...battingTeam.players];
  const roleOrder = { 'Batsman': 0, 'Wicket-Keeper': 1, 'All-Rounder': 2, 'Bowler': 3 };
  battingOrder.sort((a, b) => (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3));

  // ── Bowling rotation ─────────────────────────────────────────────
  const bowlers = bowlingTeam.players.filter(p => p.bowling.canBowl !== false);
  const bowlerOvers = {};

  // ── Scoreboard ───────────────────────────────────────────────────
  let totalRuns = 0;
  let wickets = 0;
  let ballsBowled = 0;
  let extras = { wides: 0, noballs: 0, legbyes: 0 };
  let strikerIndex = 0;
  let nonStrikerIndex = 1;
  let previousBatterPerf = null;
  let partnershipBalls = 0;
  let lastOverRuns = 0;

  const ballLog = [];
  const overSummaries = [];
  const batsmanStats = {};
  const bowlerStats = {};
  const fallOfWickets = [];

  // Batsman ball tracker for fatigue
  const batsmanBallsTracker = {};

  // Initialize
  battingOrder.forEach(p => {
    batsmanStats[p.name] = { runs: 0, balls: 0, fours: 0, sixes: 0, dots: 0, sr: 0, out: false, dismissal: null };
    batsmanBallsTracker[p.name] = 0;
  });
  bowlers.forEach(p => {
    bowlerStats[p.name] = { overs: 0, balls: 0, runs: 0, wickets: 0, wides: 0, noballs: 0, economy: 0, dots: 0 };
  });

  let overRuns = 0;
  let overBalls = 0;
  let previousBowlerName = null;

  while (ballsBowled < totalBalls && wickets < maxWickets) {
    if (target && totalRuns >= target) break;

    const currentOver = Math.floor(ballsBowled / 6) + 1;
    const striker = battingOrder[strikerIndex];
    const currentBowler = selectBowler(bowlers, currentOver, bowlerOvers, format, bowlerStats, previousBowlerName, ballCondition);

    // Match situation
    const matchSituation = {
      currentRR: ballsBowled > 0 ? (totalRuns / (ballsBowled / 6)) : 0,
      requiredRR: target ? ((target - totalRuns) / Math.max(0.1, (totalBalls - ballsBowled) / 6)) : 0,
      wicketsLost: wickets,
      oversRemaining: (totalBalls - ballsBowled) / 6,
      ballsLeft: totalBalls - ballsBowled,
      isChasing: !!target,
      format,
      batsmanBallsFaced: batsmanBallsTracker[striker.name] || 0,
    };

    const nextBatterAdj = getNextBatterAdjustment(previousBatterPerf
      ? { ...previousBatterPerf, partnershipBalls, runsLastOver: lastOverRuns }
      : null
    );
    const tossWinnerBatting = (tossResult.winner === 0 && isBattingFirst) ||
                              (tossResult.winner === 1 && !isBattingFirst);

    // Simulate ball
    const result = simulateBall({
      batsman: striker,
      bowler: currentBowler,
      format: formatData,
      stadium,
      overNumber: currentOver,
      ballCondition,
      powerplayManager: powerplay,
      captainProfile,
      matchSituation,
      tossWinnerBatting,
      nextBatterAdj,
      isBattingFirst,
    });

    // Process result
    const isLegalDelivery = result.outcome.type !== 'wide' && result.outcome.type !== 'noball';

    if (isLegalDelivery) {
      ballsBowled++;
      ballCondition.update();
      overBalls++;
      batsmanStats[striker.name].balls++;
      batsmanBallsTracker[striker.name]++;
      bowlerStats[currentBowler.name].balls++;
      partnershipBalls++;
    }

    if (result.outcome.type === 'wicket') {
      wickets++;
      batsmanStats[striker.name].out = true;
      batsmanStats[striker.name].dismissal = `${result.dismissalType.type} b ${currentBowler.name}`;
      bowlerStats[currentBowler.name].wickets++;
      fallOfWickets.push({
        wicket: wickets,
        runs: totalRuns,
        balls: ballsBowled,
        player: striker.name,
        bowler: currentBowler.name,
        dismissal: result.dismissalType.type,
      });

      previousBatterPerf = {
        runs: batsmanStats[striker.name].runs,
        balls: batsmanStats[striker.name].balls,
        wasAggressive: parseFloat(batsmanStats[striker.name].sr) > 140,
      };
      partnershipBalls = 0;

      const nextBatterIdx = Math.max(strikerIndex, nonStrikerIndex) + 1;
      if (nextBatterIdx < battingOrder.length) {
        strikerIndex = nextBatterIdx;
      } else {
        break;
      }
    } else if (result.outcome.type === 'wide') {
      totalRuns += 1; extras.wides++; overRuns += 1;
      bowlerStats[currentBowler.name].runs += 1;
      bowlerStats[currentBowler.name].wides++;
    } else if (result.outcome.type === 'noball') {
      totalRuns += 1; extras.noballs++; overRuns += 1;
      bowlerStats[currentBowler.name].runs += 1;
      bowlerStats[currentBowler.name].noballs++;
    } else if (result.outcome.type === 'legbye') {
      totalRuns += 1; extras.legbyes++; overRuns += 1;
      bowlerStats[currentBowler.name].runs += 1;
    } else {
      const runs = result.outcome.value;
      totalRuns += runs;
      batsmanStats[striker.name].runs += runs;
      overRuns += runs;
      bowlerStats[currentBowler.name].runs += runs;

      if (runs === 4) batsmanStats[striker.name].fours++;
      if (runs === 6) batsmanStats[striker.name].sixes++;
      if (runs === 0) {
        batsmanStats[striker.name].dots++;
        bowlerStats[currentBowler.name].dots++;
      }

      if (runs % 2 === 1) {
        [strikerIndex, nonStrikerIndex] = [nonStrikerIndex, strikerIndex];
      }
    }

    // Update SR
    const bs = batsmanStats[striker.name];
    bs.sr = bs.balls > 0 ? ((bs.runs / bs.balls) * 100).toFixed(1) : '0.0';

    const ballEntry = {
      ball: ballsBowled,
      over: currentOver,
      ballInOver: overBalls,
      striker: striker.name,
      bowler: currentBowler.name,
      result: result.outcome,
      commentary: result.commentary,
      totalRuns,
      wickets,
      phase: result.phaseName,
      battingRole: result.battingRole,
      ballCondition: result.ballCondition,
      dewActive: result.dewActive,
      runRate: ballsBowled > 0 ? (totalRuns / (ballsBowled / 6)).toFixed(2) : '0.00',
    };

    ballLog.push(ballEntry);

    if (onBallComplete) {
      onBallComplete(ballEntry, {
        totalRuns, wickets, ballsBowled,
        runRate: ballEntry.runRate, target,
        batsmanStats: { ...batsmanStats },
        bowlerStats: { ...bowlerStats },
      });
    }

    // End of over
    if (overBalls === 6) {
      overSummaries.push({ over: currentOver, runs: overRuns, bowler: currentBowler.name });
      bowlerStats[currentBowler.name].overs++;
      bowlerOvers[currentBowler.name] = (bowlerOvers[currentBowler.name] || 0) + 1;
      lastOverRuns = overRuns;

      [strikerIndex, nonStrikerIndex] = [nonStrikerIndex, strikerIndex];
      previousBowlerName = currentBowler.name;
      overRuns = 0;
      overBalls = 0;
    }
  }

  // Final bowler economies
  for (const name of Object.keys(bowlerStats)) {
    const bst = bowlerStats[name];
    const totalOv = bst.overs + (bst.balls % 6) / 6;
    bst.economy = totalOv > 0 ? (bst.runs / totalOv).toFixed(2) : '0.00';
  }

  return {
    totalRuns, wickets, ballsBowled,
    overs: `${Math.floor(ballsBowled / 6)}.${ballsBowled % 6}`,
    runRate: ballsBowled > 0 ? (totalRuns / (ballsBowled / 6)).toFixed(2) : '0.00',
    extras, batsmanStats, bowlerStats, fallOfWickets, ballLog, overSummaries,
    allOut: wickets >= maxWickets,
    target,
    won: target ? totalRuns >= target : null,
  };
}

// ─── BOWLER SELECTION ───────────────────────────────────────────────────────

function selectBowler(bowlers, currentOver, bowlerOvers, format, bowlerStats, previousBowlerName, ballCondition) {
  const maxOvers = format === 'T20' ? 4 : format === 'ODI' ? 10 : 30;

  // Filter available bowlers (not exceeded max overs + not the same as last over)
  const available = bowlers.filter(b => {
    const used = bowlerOvers[b.name] || 0;
    const personalMax = Math.min(b.bowling.maxOvers || maxOvers, maxOvers);
    return used < personalMax && b.name !== previousBowlerName;
  });

  if (available.length === 0) {
    // Fallback: allow same bowler but still check overs
    const fallback = bowlers.filter(b => {
      const used = bowlerOvers[b.name] || 0;
      return used < Math.min(b.bowling.maxOvers || maxOvers, maxOvers);
    });
    return fallback.length > 0 ? fallback[0] : bowlers[0];
  }

  // Smart selection based on ball condition
  const ballAge = ballCondition ? ballCondition.ballAge : currentOver * 6;

  // New ball → prefer fast bowlers
  if (ballAge < 18) {
    const pacers = available.filter(b => PACE_TYPES.includes(b.bowling.type));
    if (pacers.length > 0) return pacers[Math.floor(Math.random() * pacers.length)];
  }

  // Middle overs → prefer spinners (especially if old ball)
  if (currentOver > 10 && currentOver <= 35) {
    const spinners = available.filter(b => SPIN_TYPES.includes(b.bowling.type));
    const spinPref = ballAge > 40 ? 0.75 : 0.55; // prefer spinners more with old ball
    if (spinners.length > 0 && Math.random() < spinPref) {
      return spinners[Math.floor(Math.random() * spinners.length)];
    }
  }

  // Death overs → pace
  if (format !== 'TEST' && currentOver > (FORMATS[format]?.overs || 20) - 5) {
    const pacers = available.filter(b => PACE_TYPES.includes(b.bowling.type));
    if (pacers.length > 0) return pacers[Math.floor(Math.random() * pacers.length)];
  }

  // Economy-based selection among top 3
  const sorted = [...available].sort((a, b) => {
    const aEco = parseFloat(bowlerStats[a.name]?.economy) || a.bowling.economy;
    const bEco = parseFloat(bowlerStats[b.name]?.economy) || b.bowling.economy;
    return aEco - bEco;
  });
  const top = sorted.slice(0, 3);
  return top[Math.floor(Math.random() * top.length)];
}

// ─── FULL MATCH SIMULATOR ───────────────────────────────────────────────────

export function simulateMatch({
  team1,
  team2,
  format,
  stadium,
  onBallComplete = null,
  onInningsComplete = null,
}) {
  const captain1 = team1.players[team1.captainIndex];
  const captain2 = team2.players[team2.captainIndex];

  // Toss
  const tossResult = simulateToss(captain1, captain2, format, stadium);
  const tossWinnerTeam = tossResult.winner === 0 ? team1 : team2;
  const tossLoserTeam = tossResult.winner === 0 ? team2 : team1;

  let battingFirst, bowlingFirst;
  if (tossResult.decision === 'bat') {
    battingFirst = tossWinnerTeam;
    bowlingFirst = tossLoserTeam;
  } else {
    battingFirst = tossLoserTeam;
    bowlingFirst = tossWinnerTeam;
  }

  // First innings
  const firstInnings = simulateInnings({
    battingTeam: battingFirst,
    bowlingTeam: bowlingFirst,
    format, stadium, tossResult,
    isBattingFirst: true,
    target: null,
    onBallComplete: (ball, state) => onBallComplete && onBallComplete(1, ball, state),
  });

  if (onInningsComplete) onInningsComplete(1, firstInnings);

  // Second innings
  const target = firstInnings.totalRuns + 1;
  const secondInnings = simulateInnings({
    battingTeam: bowlingFirst,
    bowlingTeam: battingFirst,
    format, stadium, tossResult,
    isBattingFirst: false,
    target,
    onBallComplete: (ball, state) => onBallComplete && onBallComplete(2, ball, state),
  });

  if (onInningsComplete) onInningsComplete(2, secondInnings);

  // Result
  let result;
  if (secondInnings.totalRuns >= target) {
    result = {
      winner: bowlingFirst.name,
      winnerTeam: bowlingFirst,
      margin: `${FORMATS[format].maxWickets - secondInnings.wickets} wickets`,
      marginType: 'wickets',
    };
  } else {
    result = {
      winner: battingFirst.name,
      winnerTeam: battingFirst,
      margin: `${firstInnings.totalRuns - secondInnings.totalRuns} runs`,
      marginType: 'runs',
    };
  }

  return {
    format, stadium,
    toss: { winner: tossWinnerTeam.name, decision: tossResult.decision, hasDew: tossResult.hasDew },
    battingFirst: battingFirst.name,
    bowlingFirst: bowlingFirst.name,
    firstInnings, secondInnings,
    result, target,
  };
}
