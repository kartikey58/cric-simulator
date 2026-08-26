import { BOWLER_TYPES } from './constants';

// ─── TEAM ROSTERS ───────────────────────────────────────────────────────────
// Stats are representative performance indicators (0-100 scale + specific metrics)

function createPlayer(name, role, batting, bowling, fielding, extras = {}) {
  return {
    name,
    role,               // 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'
    batting: {
      average: batting.average || 35,
      strikeRate: batting.strikeRate || 130,
      aggression: batting.aggression || 50,        // 0-100: defensive to ultra-aggressive
      spinHandling: batting.spinHandling || 50,     // 0-100: poor to excellent vs spin
      paceHandling: batting.paceHandling || 50,     // 0-100: poor to excellent vs pace
      boundaryPercent: batting.boundaryPercent || 50, // % of runs from boundaries
      ...batting,
    },
    bowling: {
      type: bowling.type || BOWLER_TYPES.MEDIUM,
      economy: bowling.economy || 8.0,
      average: bowling.average || 30,
      strikeRate: bowling.strikeRate || 25,
      canBowl: bowling.canBowl !== undefined ? bowling.canBowl : true,
      maxOvers: bowling.maxOvers || 4,
      ...bowling,
    },
    fielding: {
      catching: fielding.catching || 50,
      speed: fielding.speed || 50,
      throwAccuracy: fielding.throwAccuracy || 50,
      ...fielding,
    },
    captainRating: extras.captainRating || 50,
    experience: extras.experience || 50,     // 0-100
    fitness: extras.fitness || 85,            // 0-100
    form: extras.form || 70,                  // 0-100 current form
    pressure: extras.pressure || 50,          // 0-100 handling pressure
    ...extras,
  };
}

// ─── INDIA ──────────────────────────────────────────────────────────────────

const INDIA = {
  name: 'India',
  code: 'IND',
  color: '#1E90FF',
  colorSecondary: '#FF9933',
  emoji: '🇮🇳',
  captainIndex: 0,
  players: [
    createPlayer('Rohit Sharma', 'Batsman', {
      average: 48, strikeRate: 140, aggression: 75, spinHandling: 85, paceHandling: 80, boundaryPercent: 65,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 9.0, canBowl: false }, {
      catching: 60, speed: 40, throwAccuracy: 55,
    }, { captainRating: 82, experience: 95, form: 80, pressure: 78 }),

    createPlayer('Shubman Gill', 'Batsman', {
      average: 42, strikeRate: 135, aggression: 65, spinHandling: 72, paceHandling: 75, boundaryPercent: 55,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 9.5, canBowl: false }, {
      catching: 70, speed: 75, throwAccuracy: 70,
    }, { experience: 55, form: 78, pressure: 65 }),

    createPlayer('Virat Kohli', 'Batsman', {
      average: 52, strikeRate: 138, aggression: 70, spinHandling: 88, paceHandling: 92, boundaryPercent: 58,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 9.5, canBowl: false }, {
      catching: 75, speed: 70, throwAccuracy: 80,
    }, { captainRating: 90, experience: 98, form: 85, pressure: 92 }),

    createPlayer('Suryakumar Yadav', 'Batsman', {
      average: 38, strikeRate: 170, aggression: 90, spinHandling: 82, paceHandling: 78, boundaryPercent: 72,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 10.0, canBowl: false }, {
      catching: 65, speed: 60, throwAccuracy: 60,
    }, { experience: 60, form: 88, pressure: 70 }),

    createPlayer('KL Rahul', 'Wicket-Keeper', {
      average: 40, strikeRate: 130, aggression: 55, spinHandling: 75, paceHandling: 78, boundaryPercent: 50,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 80, speed: 55, throwAccuracy: 70,
    }, { experience: 75, form: 72, pressure: 68 }),

    createPlayer('Hardik Pandya', 'All-Rounder', {
      average: 30, strikeRate: 150, aggression: 85, spinHandling: 60, paceHandling: 65, boundaryPercent: 68,
    }, { type: BOWLER_TYPES.FAST_MEDIUM, economy: 8.0, average: 30, strikeRate: 22 }, {
      catching: 65, speed: 65, throwAccuracy: 65,
    }, { experience: 70, form: 75, pressure: 72 }),

    createPlayer('Ravindra Jadeja', 'All-Rounder', {
      average: 28, strikeRate: 125, aggression: 60, spinHandling: 70, paceHandling: 55, boundaryPercent: 48,
    }, { type: BOWLER_TYPES.LEFT_ARM_SPIN, economy: 6.8, average: 26, strikeRate: 20 }, {
      catching: 90, speed: 85, throwAccuracy: 92,
    }, { experience: 88, form: 82, pressure: 80 }),

    createPlayer('Jasprit Bumrah', 'Bowler', {
      average: 8, strikeRate: 90, aggression: 30, spinHandling: 30, paceHandling: 30, boundaryPercent: 40,
    }, { type: BOWLER_TYPES.FAST, economy: 6.5, average: 22, strikeRate: 17 }, {
      catching: 50, speed: 55, throwAccuracy: 60,
    }, { experience: 82, form: 92, pressure: 88 }),

    createPlayer('Kuldeep Yadav', 'Bowler', {
      average: 10, strikeRate: 100, aggression: 35, spinHandling: 40, paceHandling: 25, boundaryPercent: 35,
    }, { type: BOWLER_TYPES.LEFT_ARM_SPIN, economy: 7.2, average: 25, strikeRate: 22 }, {
      catching: 45, speed: 40, throwAccuracy: 50,
    }, { experience: 65, form: 85, pressure: 60 }),

    createPlayer('Mohammed Siraj', 'Bowler', {
      average: 6, strikeRate: 80, aggression: 25, spinHandling: 20, paceHandling: 20, boundaryPercent: 30,
    }, { type: BOWLER_TYPES.FAST, economy: 7.5, average: 28, strikeRate: 23 }, {
      catching: 40, speed: 50, throwAccuracy: 55,
    }, { experience: 60, form: 78, pressure: 65 }),

    createPlayer('Arshdeep Singh', 'Bowler', {
      average: 5, strikeRate: 75, aggression: 20, spinHandling: 15, paceHandling: 15, boundaryPercent: 25,
    }, { type: BOWLER_TYPES.LEFT_ARM_FAST, economy: 7.8, average: 27, strikeRate: 21 }, {
      catching: 35, speed: 45, throwAccuracy: 50,
    }, { experience: 50, form: 80, pressure: 58 }),
  ],
};

// ─── AUSTRALIA ───────────────────────────────────────────────────────────────

const AUSTRALIA = {
  name: 'Australia',
  code: 'AUS',
  color: '#FFD700',
  colorSecondary: '#006400',
  emoji: '🇦🇺',
  captainIndex: 0,
  players: [
    createPlayer('Pat Cummins', 'Bowler', {
      average: 18, strikeRate: 110, aggression: 45, spinHandling: 50, paceHandling: 45, boundaryPercent: 40,
    }, { type: BOWLER_TYPES.FAST, economy: 6.8, average: 21, strikeRate: 16 }, {
      catching: 55, speed: 50, throwAccuracy: 60,
    }, { captainRating: 85, experience: 90, form: 88, pressure: 85 }),

    createPlayer('Travis Head', 'Batsman', {
      average: 44, strikeRate: 145, aggression: 80, spinHandling: 70, paceHandling: 82, boundaryPercent: 62,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 9.0, canBowl: false }, {
      catching: 65, speed: 55, throwAccuracy: 60,
    }, { experience: 72, form: 92, pressure: 75 }),

    createPlayer('Steve Smith', 'Batsman', {
      average: 50, strikeRate: 125, aggression: 45, spinHandling: 92, paceHandling: 88, boundaryPercent: 48,
    }, { type: BOWLER_TYPES.LEG_SPIN, economy: 8.5, average: 45, strikeRate: 40, canBowl: true, maxOvers: 2 }, {
      catching: 60, speed: 45, throwAccuracy: 55,
    }, { captainRating: 88, experience: 95, form: 82, pressure: 90 }),

    createPlayer('Marnus Labuschagne', 'Batsman', {
      average: 46, strikeRate: 120, aggression: 35, spinHandling: 80, paceHandling: 85, boundaryPercent: 42,
    }, { type: BOWLER_TYPES.LEG_SPIN, economy: 8.0, average: 40, strikeRate: 35, canBowl: true, maxOvers: 3 }, {
      catching: 70, speed: 60, throwAccuracy: 65,
    }, { experience: 70, form: 78, pressure: 72 }),

    createPlayer('Alex Carey', 'Wicket-Keeper', {
      average: 34, strikeRate: 130, aggression: 60, spinHandling: 65, paceHandling: 70, boundaryPercent: 52,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 85, speed: 55, throwAccuracy: 72,
    }, { experience: 65, form: 75, pressure: 70 }),

    createPlayer('Glenn Maxwell', 'All-Rounder', {
      average: 32, strikeRate: 158, aggression: 92, spinHandling: 60, paceHandling: 65, boundaryPercent: 70,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 7.5, average: 33, strikeRate: 28 }, {
      catching: 80, speed: 65, throwAccuracy: 75,
    }, { experience: 80, form: 85, pressure: 65 }),

    createPlayer('Mitchell Marsh', 'All-Rounder', {
      average: 30, strikeRate: 140, aggression: 72, spinHandling: 55, paceHandling: 68, boundaryPercent: 58,
    }, { type: BOWLER_TYPES.FAST_MEDIUM, economy: 8.0, average: 35, strikeRate: 30 }, {
      catching: 60, speed: 50, throwAccuracy: 60,
    }, { experience: 68, form: 78, pressure: 68 }),

    createPlayer('Mitchell Starc', 'Bowler', {
      average: 12, strikeRate: 95, aggression: 40, spinHandling: 25, paceHandling: 30, boundaryPercent: 45,
    }, { type: BOWLER_TYPES.LEFT_ARM_FAST, economy: 7.0, average: 23, strikeRate: 18 }, {
      catching: 50, speed: 55, throwAccuracy: 60,
    }, { experience: 88, form: 85, pressure: 80 }),

    createPlayer('Josh Hazlewood', 'Bowler', {
      average: 10, strikeRate: 85, aggression: 20, spinHandling: 20, paceHandling: 25, boundaryPercent: 30,
    }, { type: BOWLER_TYPES.FAST, economy: 6.5, average: 22, strikeRate: 19 }, {
      catching: 45, speed: 45, throwAccuracy: 55,
    }, { experience: 85, form: 80, pressure: 78 }),

    createPlayer('Adam Zampa', 'Bowler', {
      average: 8, strikeRate: 90, aggression: 25, spinHandling: 35, paceHandling: 20, boundaryPercent: 28,
    }, { type: BOWLER_TYPES.LEG_SPIN, economy: 7.0, average: 24, strikeRate: 21 }, {
      catching: 40, speed: 40, throwAccuracy: 50,
    }, { experience: 75, form: 82, pressure: 65 }),

    createPlayer('Nathan Lyon', 'Bowler', {
      average: 12, strikeRate: 88, aggression: 30, spinHandling: 38, paceHandling: 22, boundaryPercent: 32,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 6.8, average: 26, strikeRate: 24 }, {
      catching: 55, speed: 35, throwAccuracy: 48,
    }, { experience: 92, form: 78, pressure: 82 }),
  ],
};

// ─── ENGLAND ────────────────────────────────────────────────────────────────

const ENGLAND = {
  name: 'England',
  code: 'ENG',
  color: '#003366',
  colorSecondary: '#CF142B',
  emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  captainIndex: 0,
  players: [
    createPlayer('Jos Buttler', 'Wicket-Keeper', {
      average: 38, strikeRate: 155, aggression: 88, spinHandling: 70, paceHandling: 78, boundaryPercent: 68,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 82, speed: 50, throwAccuracy: 68,
    }, { captainRating: 78, experience: 85, form: 82, pressure: 75 }),

    createPlayer('Phil Salt', 'Batsman', {
      average: 35, strikeRate: 160, aggression: 90, spinHandling: 55, paceHandling: 75, boundaryPercent: 72,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 65, speed: 70, throwAccuracy: 65,
    }, { experience: 45, form: 88, pressure: 60 }),

    createPlayer('Joe Root', 'Batsman', {
      average: 50, strikeRate: 120, aggression: 40, spinHandling: 90, paceHandling: 88, boundaryPercent: 45,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 7.5, average: 42, strikeRate: 38, canBowl: true, maxOvers: 3 }, {
      catching: 75, speed: 55, throwAccuracy: 70,
    }, { captainRating: 80, experience: 95, form: 85, pressure: 88 }),

    createPlayer('Harry Brook', 'Batsman', {
      average: 42, strikeRate: 148, aggression: 78, spinHandling: 72, paceHandling: 80, boundaryPercent: 62,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 9.5, canBowl: false }, {
      catching: 60, speed: 65, throwAccuracy: 62,
    }, { experience: 50, form: 90, pressure: 68 }),

    createPlayer('Ben Stokes', 'All-Rounder', {
      average: 38, strikeRate: 145, aggression: 82, spinHandling: 65, paceHandling: 78, boundaryPercent: 60,
    }, { type: BOWLER_TYPES.FAST_MEDIUM, economy: 7.8, average: 32, strikeRate: 26 }, {
      catching: 85, speed: 70, throwAccuracy: 82,
    }, { captainRating: 86, experience: 90, form: 78, pressure: 92 }),

    createPlayer('Liam Livingstone', 'All-Rounder', {
      average: 28, strikeRate: 165, aggression: 92, spinHandling: 58, paceHandling: 62, boundaryPercent: 72,
    }, { type: BOWLER_TYPES.LEG_SPIN, economy: 8.0, average: 35, strikeRate: 28 }, {
      catching: 60, speed: 55, throwAccuracy: 58,
    }, { experience: 55, form: 82, pressure: 55 }),

    createPlayer('Moeen Ali', 'All-Rounder', {
      average: 26, strikeRate: 138, aggression: 70, spinHandling: 68, paceHandling: 60, boundaryPercent: 55,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 7.2, average: 30, strikeRate: 24 }, {
      catching: 70, speed: 45, throwAccuracy: 55,
    }, { experience: 82, form: 72, pressure: 70 }),

    createPlayer('Jofra Archer', 'Bowler', {
      average: 8, strikeRate: 85, aggression: 30, spinHandling: 22, paceHandling: 28, boundaryPercent: 35,
    }, { type: BOWLER_TYPES.FAST, economy: 7.0, average: 23, strikeRate: 17 }, {
      catching: 55, speed: 65, throwAccuracy: 60,
    }, { experience: 60, form: 85, pressure: 72 }),

    createPlayer('Mark Wood', 'Bowler', {
      average: 6, strikeRate: 95, aggression: 35, spinHandling: 18, paceHandling: 20, boundaryPercent: 32,
    }, { type: BOWLER_TYPES.FAST, economy: 7.5, average: 26, strikeRate: 20 }, {
      catching: 40, speed: 55, throwAccuracy: 55,
    }, { experience: 65, form: 78, pressure: 60 }),

    createPlayer('Adil Rashid', 'Bowler', {
      average: 10, strikeRate: 90, aggression: 28, spinHandling: 40, paceHandling: 22, boundaryPercent: 30,
    }, { type: BOWLER_TYPES.LEG_SPIN, economy: 7.2, average: 26, strikeRate: 23 }, {
      catching: 50, speed: 40, throwAccuracy: 50,
    }, { experience: 85, form: 80, pressure: 68 }),

    createPlayer('Chris Woakes', 'Bowler', {
      average: 18, strikeRate: 100, aggression: 35, spinHandling: 42, paceHandling: 48, boundaryPercent: 40,
    }, { type: BOWLER_TYPES.FAST_MEDIUM, economy: 7.0, average: 25, strikeRate: 22 }, {
      catching: 65, speed: 50, throwAccuracy: 65,
    }, { experience: 82, form: 75, pressure: 75 }),
  ],
};

// ─── SOUTH AFRICA ───────────────────────────────────────────────────────────

const SOUTH_AFRICA = {
  name: 'South Africa',
  code: 'SA',
  color: '#007A4D',
  colorSecondary: '#FFB612',
  emoji: '🇿🇦',
  captainIndex: 0,
  players: [
    createPlayer('Aiden Markram', 'Batsman', {
      average: 36, strikeRate: 135, aggression: 60, spinHandling: 68, paceHandling: 75, boundaryPercent: 52,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 8.0, average: 38, strikeRate: 32, canBowl: true, maxOvers: 3 }, {
      catching: 65, speed: 60, throwAccuracy: 65,
    }, { captainRating: 72, experience: 65, form: 78, pressure: 65 }),

    createPlayer('Quinton de Kock', 'Wicket-Keeper', {
      average: 42, strikeRate: 142, aggression: 78, spinHandling: 65, paceHandling: 80, boundaryPercent: 62,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 85, speed: 55, throwAccuracy: 70,
    }, { experience: 82, form: 80, pressure: 72 }),

    createPlayer('Rassie van der Dussen', 'Batsman', {
      average: 44, strikeRate: 125, aggression: 45, spinHandling: 75, paceHandling: 80, boundaryPercent: 45,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 9.5, canBowl: false }, {
      catching: 60, speed: 50, throwAccuracy: 58,
    }, { experience: 60, form: 75, pressure: 78 }),

    createPlayer('Heinrich Klaasen', 'Batsman', {
      average: 38, strikeRate: 165, aggression: 92, spinHandling: 85, paceHandling: 70, boundaryPercent: 72,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 60, speed: 45, throwAccuracy: 55,
    }, { experience: 55, form: 90, pressure: 68 }),

    createPlayer('David Miller', 'Batsman', {
      average: 32, strikeRate: 148, aggression: 80, spinHandling: 72, paceHandling: 68, boundaryPercent: 65,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 70, speed: 65, throwAccuracy: 70,
    }, { experience: 80, form: 82, pressure: 82 }),

    createPlayer('Marco Jansen', 'All-Rounder', {
      average: 22, strikeRate: 120, aggression: 55, spinHandling: 40, paceHandling: 50, boundaryPercent: 45,
    }, { type: BOWLER_TYPES.LEFT_ARM_FAST, economy: 7.2, average: 24, strikeRate: 19 }, {
      catching: 55, speed: 60, throwAccuracy: 60,
    }, { experience: 50, form: 82, pressure: 62 }),

    createPlayer('Keshav Maharaj', 'All-Rounder', {
      average: 15, strikeRate: 95, aggression: 30, spinHandling: 45, paceHandling: 30, boundaryPercent: 35,
    }, { type: BOWLER_TYPES.LEFT_ARM_SPIN, economy: 7.0, average: 27, strikeRate: 24 }, {
      catching: 50, speed: 35, throwAccuracy: 50,
    }, { experience: 72, form: 78, pressure: 70 }),

    createPlayer('Kagiso Rabada', 'Bowler', {
      average: 10, strikeRate: 88, aggression: 32, spinHandling: 25, paceHandling: 28, boundaryPercent: 35,
    }, { type: BOWLER_TYPES.FAST, economy: 7.2, average: 23, strikeRate: 18 }, {
      catching: 45, speed: 55, throwAccuracy: 58,
    }, { experience: 80, form: 85, pressure: 78 }),

    createPlayer('Anrich Nortje', 'Bowler', {
      average: 5, strikeRate: 80, aggression: 25, spinHandling: 15, paceHandling: 18, boundaryPercent: 28,
    }, { type: BOWLER_TYPES.FAST, economy: 7.5, average: 25, strikeRate: 19 }, {
      catching: 35, speed: 50, throwAccuracy: 50,
    }, { experience: 55, form: 82, pressure: 62 }),

    createPlayer('Lungi Ngidi', 'Bowler', {
      average: 6, strikeRate: 78, aggression: 22, spinHandling: 18, paceHandling: 20, boundaryPercent: 30,
    }, { type: BOWLER_TYPES.FAST, economy: 7.8, average: 27, strikeRate: 21 }, {
      catching: 40, speed: 48, throwAccuracy: 52,
    }, { experience: 58, form: 75, pressure: 58 }),

    createPlayer('Tabraiz Shamsi', 'Bowler', {
      average: 4, strikeRate: 72, aggression: 18, spinHandling: 20, paceHandling: 12, boundaryPercent: 22,
    }, { type: BOWLER_TYPES.LEFT_ARM_SPIN, economy: 7.0, average: 25, strikeRate: 22 }, {
      catching: 30, speed: 30, throwAccuracy: 42,
    }, { experience: 62, form: 78, pressure: 55 }),
  ],
};

// ─── PAKISTAN ────────────────────────────────────────────────────────────────

const PAKISTAN = {
  name: 'Pakistan',
  code: 'PAK',
  color: '#006600',
  colorSecondary: '#FFFFFF',
  emoji: '🇵🇰',
  captainIndex: 0,
  players: [
    createPlayer('Babar Azam', 'Batsman', {
      average: 50, strikeRate: 130, aggression: 55, spinHandling: 82, paceHandling: 85, boundaryPercent: 52,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 70, speed: 60, throwAccuracy: 68,
    }, { captainRating: 75, experience: 85, form: 78, pressure: 72 }),

    createPlayer('Mohammad Rizwan', 'Wicket-Keeper', {
      average: 42, strikeRate: 125, aggression: 45, spinHandling: 78, paceHandling: 75, boundaryPercent: 45,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 88, speed: 50, throwAccuracy: 72,
    }, { experience: 75, form: 82, pressure: 80 }),

    createPlayer('Fakhar Zaman', 'Batsman', {
      average: 36, strikeRate: 140, aggression: 78, spinHandling: 58, paceHandling: 72, boundaryPercent: 60,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 55, speed: 55, throwAccuracy: 55,
    }, { experience: 65, form: 72, pressure: 58 }),

    createPlayer('Iftikhar Ahmed', 'All-Rounder', {
      average: 28, strikeRate: 138, aggression: 72, spinHandling: 55, paceHandling: 60, boundaryPercent: 55,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 7.8, average: 35, strikeRate: 30 }, {
      catching: 55, speed: 40, throwAccuracy: 52,
    }, { experience: 58, form: 68, pressure: 55 }),

    createPlayer('Shadab Khan', 'All-Rounder', {
      average: 24, strikeRate: 132, aggression: 68, spinHandling: 52, paceHandling: 55, boundaryPercent: 50,
    }, { type: BOWLER_TYPES.LEG_SPIN, economy: 7.2, average: 28, strikeRate: 23 }, {
      catching: 72, speed: 70, throwAccuracy: 72,
    }, { experience: 62, form: 78, pressure: 62 }),

    createPlayer('Imam-ul-Haq', 'Batsman', {
      average: 45, strikeRate: 118, aggression: 35, spinHandling: 72, paceHandling: 70, boundaryPercent: 42,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 55, speed: 45, throwAccuracy: 52,
    }, { experience: 55, form: 72, pressure: 60 }),

    createPlayer('Mohammad Nawaz', 'All-Rounder', {
      average: 20, strikeRate: 125, aggression: 55, spinHandling: 48, paceHandling: 42, boundaryPercent: 42,
    }, { type: BOWLER_TYPES.LEFT_ARM_SPIN, economy: 7.5, average: 30, strikeRate: 26 }, {
      catching: 55, speed: 45, throwAccuracy: 55,
    }, { experience: 55, form: 70, pressure: 55 }),

    createPlayer('Shaheen Afridi', 'Bowler', {
      average: 8, strikeRate: 82, aggression: 28, spinHandling: 20, paceHandling: 25, boundaryPercent: 32,
    }, { type: BOWLER_TYPES.LEFT_ARM_FAST, economy: 7.0, average: 22, strikeRate: 17 }, {
      catching: 48, speed: 55, throwAccuracy: 58,
    }, { experience: 68, form: 88, pressure: 72 }),

    createPlayer('Haris Rauf', 'Bowler', {
      average: 5, strikeRate: 78, aggression: 22, spinHandling: 15, paceHandling: 18, boundaryPercent: 28,
    }, { type: BOWLER_TYPES.FAST, economy: 8.0, average: 28, strikeRate: 22 }, {
      catching: 35, speed: 50, throwAccuracy: 50,
    }, { experience: 50, form: 78, pressure: 55 }),

    createPlayer('Naseem Shah', 'Bowler', {
      average: 6, strikeRate: 80, aggression: 25, spinHandling: 18, paceHandling: 20, boundaryPercent: 25,
    }, { type: BOWLER_TYPES.FAST, economy: 7.5, average: 25, strikeRate: 20 }, {
      catching: 40, speed: 52, throwAccuracy: 52,
    }, { experience: 42, form: 80, pressure: 58 }),

    createPlayer('Mohammad Wasim Jr', 'Bowler', {
      average: 10, strikeRate: 95, aggression: 32, spinHandling: 22, paceHandling: 28, boundaryPercent: 35,
    }, { type: BOWLER_TYPES.FAST_MEDIUM, economy: 8.2, average: 30, strikeRate: 25 }, {
      catching: 42, speed: 55, throwAccuracy: 55,
    }, { experience: 35, form: 72, pressure: 48 }),
  ],
};

// ─── NEW ZEALAND ────────────────────────────────────────────────────────────

const NEW_ZEALAND = {
  name: 'New Zealand',
  code: 'NZ',
  color: '#000000',
  colorSecondary: '#FFFFFF',
  emoji: '🇳🇿',
  captainIndex: 0,
  players: [
    createPlayer('Kane Williamson', 'Batsman', {
      average: 48, strikeRate: 125, aggression: 40, spinHandling: 88, paceHandling: 85, boundaryPercent: 45,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 8.5, canBowl: false }, {
      catching: 72, speed: 50, throwAccuracy: 68,
    }, { captainRating: 92, experience: 95, form: 80, pressure: 90 }),

    createPlayer('Devon Conway', 'Batsman', {
      average: 40, strikeRate: 130, aggression: 55, spinHandling: 72, paceHandling: 78, boundaryPercent: 50,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 65, speed: 55, throwAccuracy: 60,
    }, { experience: 55, form: 78, pressure: 72 }),

    createPlayer('Daryl Mitchell', 'All-Rounder', {
      average: 38, strikeRate: 140, aggression: 72, spinHandling: 62, paceHandling: 70, boundaryPercent: 55,
    }, { type: BOWLER_TYPES.FAST_MEDIUM, economy: 8.5, average: 38, strikeRate: 32, canBowl: true, maxOvers: 3 }, {
      catching: 60, speed: 60, throwAccuracy: 62,
    }, { experience: 65, form: 85, pressure: 75 }),

    createPlayer('Tom Latham', 'Wicket-Keeper', {
      average: 42, strikeRate: 120, aggression: 42, spinHandling: 75, paceHandling: 78, boundaryPercent: 44,
    }, { type: BOWLER_TYPES.MEDIUM, economy: 10.0, canBowl: false }, {
      catching: 82, speed: 48, throwAccuracy: 65,
    }, { experience: 80, form: 75, pressure: 78 }),

    createPlayer('Glenn Phillips', 'Batsman', {
      average: 30, strikeRate: 152, aggression: 85, spinHandling: 58, paceHandling: 65, boundaryPercent: 65,
    }, { type: BOWLER_TYPES.OFF_SPIN, economy: 8.0, average: 35, strikeRate: 28, canBowl: true, maxOvers: 4 }, {
      catching: 68, speed: 65, throwAccuracy: 68,
    }, { experience: 55, form: 82, pressure: 62 }),

    createPlayer('Rachin Ravindra', 'All-Rounder', {
      average: 35, strikeRate: 132, aggression: 62, spinHandling: 65, paceHandling: 68, boundaryPercent: 52,
    }, { type: BOWLER_TYPES.LEFT_ARM_SPIN, economy: 7.5, average: 32, strikeRate: 28 }, {
      catching: 62, speed: 58, throwAccuracy: 60,
    }, { experience: 42, form: 85, pressure: 58 }),

    createPlayer('Mitchell Santner', 'All-Rounder', {
      average: 22, strikeRate: 118, aggression: 48, spinHandling: 55, paceHandling: 48, boundaryPercent: 42,
    }, { type: BOWLER_TYPES.LEFT_ARM_SPIN, economy: 7.0, average: 28, strikeRate: 24 }, {
      catching: 72, speed: 55, throwAccuracy: 62,
    }, { experience: 72, form: 75, pressure: 68 }),

    createPlayer('Trent Boult', 'Bowler', {
      average: 10, strikeRate: 90, aggression: 28, spinHandling: 22, paceHandling: 25, boundaryPercent: 35,
    }, { type: BOWLER_TYPES.LEFT_ARM_FAST, economy: 7.2, average: 24, strikeRate: 19 }, {
      catching: 55, speed: 50, throwAccuracy: 55,
    }, { experience: 90, form: 80, pressure: 78 }),

    createPlayer('Tim Southee', 'Bowler', {
      average: 15, strikeRate: 100, aggression: 38, spinHandling: 28, paceHandling: 32, boundaryPercent: 40,
    }, { type: BOWLER_TYPES.FAST_MEDIUM, economy: 7.5, average: 27, strikeRate: 22 }, {
      catching: 60, speed: 45, throwAccuracy: 58,
    }, { experience: 92, form: 72, pressure: 75 }),

    createPlayer('Matt Henry', 'Bowler', {
      average: 8, strikeRate: 85, aggression: 25, spinHandling: 20, paceHandling: 22, boundaryPercent: 30,
    }, { type: BOWLER_TYPES.FAST_MEDIUM, economy: 7.0, average: 25, strikeRate: 20 }, {
      catching: 48, speed: 48, throwAccuracy: 52,
    }, { experience: 62, form: 82, pressure: 65 }),

    createPlayer('Lockie Ferguson', 'Bowler', {
      average: 5, strikeRate: 78, aggression: 22, spinHandling: 15, paceHandling: 18, boundaryPercent: 28,
    }, { type: BOWLER_TYPES.FAST, economy: 7.5, average: 24, strikeRate: 18 }, {
      catching: 38, speed: 55, throwAccuracy: 52,
    }, { experience: 55, form: 80, pressure: 60 }),
  ],
};

// ─── EXPORT ALL TEAMS ───────────────────────────────────────────────────────

export const TEAMS = {
  India: INDIA,
  Australia: AUSTRALIA,
  England: ENGLAND,
  'South Africa': SOUTH_AFRICA,
  Pakistan: PAKISTAN,
  'New Zealand': NEW_ZEALAND,
};

export function getTeamList() {
  return Object.entries(TEAMS).map(([name, team]) => ({
    name,
    code: team.code,
    emoji: team.emoji,
    color: team.color,
    playerCount: team.players.length,
    captain: team.players[team.captainIndex]?.name,
  }));
}
