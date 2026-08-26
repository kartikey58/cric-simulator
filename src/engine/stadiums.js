// ─── STADIUM DATABASE ───────────────────────────────────────────────────────

export const STADIUMS = {
  // India
  'Eden Gardens': {
    city: 'Kolkata', country: 'India', capacity: 68000,
    pitchType: 'SPIN_FRIENDLY',
    avgScore:    { TEST: 320, ODI: 280, T20: 165 },
    medianScore: { TEST: 305, ODI: 265, T20: 155 },
    avgT20Score: 165, avgODIScore: 280, avgTestScore: 320,
    runMultiplier: 0.95, wicketMultiplier: 1.15,
    spinFriendly: true, seamFriendly: false,
    spinMultiplier: 1.35, paceMultiplier: 0.85,
    boundarySize: { straight: 75, square: 68 },
    boundaryFactor: 0.95,
    dew: false, altitude: 9,
    secondInningsAdj: 0.92,  // spin → deteriorates → harder 2nd innings
    description: 'Historic coliseum with spin assistance, pitch deteriorates as the match progresses.',
    emoji: '🏟️',
  },
  'Wankhede Stadium': {
    city: 'Mumbai', country: 'India', capacity: 33000,
    pitchType: 'BATTING_PARADISE',
    avgScore:    { TEST: 380, ODI: 290, T20: 180 },
    medianScore: { TEST: 370, ODI: 280, T20: 175 },
    avgT20Score: 180, avgODIScore: 290, avgTestScore: 380,
    runMultiplier: 1.15, wicketMultiplier: 0.85,
    spinFriendly: false, seamFriendly: false,
    spinMultiplier: 0.90, paceMultiplier: 0.90,
    boundarySize: { straight: 70, square: 65 },
    boundaryFactor: 1.15,
    dew: true, altitude: 14,
    secondInningsAdj: 1.03,  // dew helps chasing
    description: 'Run-scoring haven with flat tracks, short boundaries, and dew under lights.',
    emoji: '🔥',
  },
  'M. Chinnaswamy Stadium': {
    city: 'Bengaluru', country: 'India', capacity: 40000,
    pitchType: 'BATTING_PARADISE',
    avgScore:    { TEST: 390, ODI: 300, T20: 185 },
    medianScore: { TEST: 380, ODI: 290, T20: 180 },
    avgT20Score: 185, avgODIScore: 300, avgTestScore: 390,
    runMultiplier: 1.2, wicketMultiplier: 0.8,
    spinFriendly: false, seamFriendly: false,
    spinMultiplier: 0.80, paceMultiplier: 0.85,
    boundarySize: { straight: 64, square: 56 },
    boundaryFactor: 1.25,
    dew: true, altitude: 920,  // high altitude = ball carries further
    secondInningsAdj: 1.05,
    description: 'Smallest ground in India, highest altitude. Sixes rain here. Ball carries at elevation.',
    emoji: '💥',
  },
  'MA Chidambaram Stadium': {
    city: 'Chennai', country: 'India', capacity: 50000,
    pitchType: 'DUSTBOWL',
    avgScore:    { TEST: 300, ODI: 255, T20: 155 },
    medianScore: { TEST: 285, ODI: 245, T20: 148 },
    avgT20Score: 155, avgODIScore: 255, avgTestScore: 300,
    runMultiplier: 0.85, wicketMultiplier: 1.25,
    spinFriendly: true, seamFriendly: false,
    spinMultiplier: 1.50, paceMultiplier: 0.75,
    boundarySize: { straight: 75, square: 70 },
    boundaryFactor: 0.90,
    dew: false, altitude: 6,
    secondInningsAdj: 0.85,  // dustbowl — batting last is a nightmare
    description: 'Turning track, dusty conditions. Spinners dominate. CSK fortress.',
    emoji: '🌀',
  },
  'Narendra Modi Stadium': {
    city: 'Ahmedabad', country: 'India', capacity: 132000,
    pitchType: 'BALANCED',
    avgScore:    { TEST: 360, ODI: 280, T20: 170 },
    medianScore: { TEST: 350, ODI: 270, T20: 165 },
    avgT20Score: 170, avgODIScore: 280, avgTestScore: 360,
    runMultiplier: 1.05, wicketMultiplier: 0.95,
    spinFriendly: true, seamFriendly: false,
    spinMultiplier: 1.15, paceMultiplier: 0.95,
    boundarySize: { straight: 82, square: 74 },
    boundaryFactor: 0.85,
    dew: true, altitude: 53,
    secondInningsAdj: 1.00,
    description: 'Largest cricket stadium in the world. Big boundaries, true bounce, dew factor under lights.',
    emoji: '🏆',
  },

  // Australia
  'Melbourne Cricket Ground': {
    city: 'Melbourne', country: 'Australia', capacity: 100024,
    pitchType: 'BALANCED',
    avgScore:    { TEST: 370, ODI: 310, T20: 180 },
    medianScore: { TEST: 360, ODI: 300, T20: 175 },
    avgT20Score: 180, avgODIScore: 310, avgTestScore: 370,
    runMultiplier: 1.1, wicketMultiplier: 0.95,
    spinFriendly: false, seamFriendly: true,
    spinMultiplier: 0.75, paceMultiplier: 1.35,
    boundarySize: { straight: 80, square: 72 },
    boundaryFactor: 1.25,
    dew: true, altitude: 114,
    secondInningsAdj: 1.05,  // dew helps chasing at MCG
    description: 'The G — massive ground. Boxing Day Tests are legendary. Dew factor in night games.',
    emoji: '🦘',
  },
  'Sydney Cricket Ground': {
    city: 'Sydney', country: 'Australia', capacity: 48000,
    pitchType: 'SPIN_FRIENDLY',
    avgScore:    { TEST: 340, ODI: 270, T20: 160 },
    medianScore: { TEST: 330, ODI: 262, T20: 155 },
    avgT20Score: 160, avgODIScore: 270, avgTestScore: 340,
    runMultiplier: 0.95, wicketMultiplier: 1.1,
    spinFriendly: true, seamFriendly: false,
    spinMultiplier: 1.25, paceMultiplier: 0.90,
    boundarySize: { straight: 72, square: 64 },
    boundaryFactor: 1.0,
    dew: false, altitude: 6,
    secondInningsAdj: 0.93,
    description: 'Variable bounce. Spin plays a big role on Day 4-5 Tests.',
    emoji: '🌊',
  },
  'The Gabba': {
    city: 'Brisbane', country: 'Australia', capacity: 42000,
    pitchType: 'SEAMER_FRIENDLY',
    avgScore:    { TEST: 340, ODI: 265, T20: 160 },
    medianScore: { TEST: 328, ODI: 255, T20: 155 },
    avgT20Score: 160, avgODIScore: 265, avgTestScore: 340,
    runMultiplier: 0.9, wicketMultiplier: 1.2,
    spinFriendly: false, seamFriendly: true,
    spinMultiplier: 0.70, paceMultiplier: 1.40,
    boundarySize: { straight: 78, square: 68 },
    boundaryFactor: 0.95,
    dew: false, altitude: 27,
    secondInningsAdj: 0.95,
    description: 'Australia\'s fortress. Pace, bounce and carry. Teams fear coming here.',
    emoji: '⚡',
  },

  // England
  'Lords': {
    city: 'London', country: 'England', capacity: 30000,
    pitchType: 'SEAMER_FRIENDLY',
    avgScore:    { TEST: 330, ODI: 285, T20: 170 },
    medianScore: { TEST: 318, ODI: 275, T20: 165 },
    avgT20Score: 170, avgODIScore: 285, avgTestScore: 330,
    runMultiplier: 0.88, wicketMultiplier: 1.25,
    spinFriendly: false, seamFriendly: true,
    spinMultiplier: 1.10, paceMultiplier: 1.20,
    boundarySize: { straight: 74, square: 70 },
    boundaryFactor: 1.0,
    dew: false, altitude: 5,
    secondInningsAdj: 0.97,
    description: 'The Home of Cricket. Famous slope aids swing. Overcast skies make life tough for batsmen.',
    emoji: '🎩',
  },
  'The Oval': {
    city: 'London', country: 'England', capacity: 25500,
    pitchType: 'BALANCED',
    avgScore:    { TEST: 355, ODI: 275, T20: 165 },
    medianScore: { TEST: 345, ODI: 268, T20: 160 },
    avgT20Score: 165, avgODIScore: 275, avgTestScore: 355,
    runMultiplier: 1.0, wicketMultiplier: 1.0,
    spinFriendly: false, seamFriendly: true,
    spinMultiplier: 0.95, paceMultiplier: 1.10,
    boundarySize: { straight: 72, square: 65 },
    boundaryFactor: 1.05,
    dew: false, altitude: 8,
    secondInningsAdj: 0.98,
    description: 'Historic ground, good for batting when sun\'s out. Fair contest traditionally.',
    emoji: '🏛️',
  },
  'Headingley': {
    city: 'Leeds', country: 'England', capacity: 18350,
    pitchType: 'GREEN_TOP',
    avgScore:    { TEST: 310, ODI: 250, T20: 150 },
    medianScore: { TEST: 295, ODI: 240, T20: 145 },
    avgT20Score: 150, avgODIScore: 250, avgTestScore: 310,
    runMultiplier: 0.82, wicketMultiplier: 1.35,
    spinFriendly: false, seamFriendly: true,
    spinMultiplier: 0.80, paceMultiplier: 1.45,
    boundarySize: { straight: 70, square: 62 },
    boundaryFactor: 0.90,
    dew: false, altitude: 47,
    secondInningsAdj: 0.90,
    description: 'Green top pitches, overcast skies. Paradise for swing bowlers, nightmare for batsmen.',
    emoji: '🌧️',
  },

  // South Africa
  'Newlands': {
    city: 'Cape Town', country: 'South Africa', capacity: 25000,
    pitchType: 'SEAMER_FRIENDLY',
    avgScore:    { TEST: 335, ODI: 265, T20: 160 },
    medianScore: { TEST: 320, ODI: 255, T20: 155 },
    avgT20Score: 160, avgODIScore: 265, avgTestScore: 335,
    runMultiplier: 0.9, wicketMultiplier: 1.2,
    spinFriendly: false, seamFriendly: true,
    spinMultiplier: 0.85, paceMultiplier: 1.30,
    boundarySize: { straight: 76, square: 68 },
    boundaryFactor: 0.95,
    dew: false, altitude: 30,
    secondInningsAdj: 0.96,
    description: 'Stunning Table Mountain backdrop. Pace and bounce with scenic beauty.',
    emoji: '⛰️',
  },

  // West Indies
  'Kensington Oval': {
    city: 'Bridgetown', country: 'West Indies', capacity: 28000,
    pitchType: 'BATTING_PARADISE',
    avgScore:    { TEST: 370, ODI: 285, T20: 175 },
    medianScore: { TEST: 358, ODI: 278, T20: 170 },
    avgT20Score: 175, avgODIScore: 285, avgTestScore: 370,
    runMultiplier: 1.1, wicketMultiplier: 0.9,
    spinFriendly: false, seamFriendly: false,
    spinMultiplier: 0.90, paceMultiplier: 1.05,
    boundarySize: { straight: 68, square: 60 },
    boundaryFactor: 1.15,
    dew: true, altitude: 0,
    secondInningsAdj: 1.02,
    description: 'Caribbean paradise. True bounce, small boundaries. Calypso cricket territory.',
    emoji: '🌴',
  },

  // UAE / Neutral
  'Dubai International': {
    city: 'Dubai', country: 'UAE', capacity: 25000,
    pitchType: 'DUSTBOWL',
    avgScore:    { TEST: 300, ODI: 245, T20: 150 },
    medianScore: { TEST: 288, ODI: 235, T20: 145 },
    avgT20Score: 150, avgODIScore: 245, avgTestScore: 300,
    runMultiplier: 0.8, wicketMultiplier: 1.3,
    spinFriendly: true, seamFriendly: false,
    spinMultiplier: 1.45, paceMultiplier: 0.80,
    boundarySize: { straight: 78, square: 72 },
    boundaryFactor: 0.85,
    dew: true, altitude: 16,
    secondInningsAdj: 0.88,  // dustbowl + spin = batting last is dire
    description: 'Low and slow. Spinners rule from second innings onwards. Dew at night.',
    emoji: '🏜️',
  },
};

export function getStadiumList() {
  return Object.entries(STADIUMS).map(([name, data]) => ({
    name,
    ...data,
  }));
}

export function getStadiumsByCountry() {
  const grouped = {};
  for (const [name, data] of Object.entries(STADIUMS)) {
    if (!grouped[data.country]) grouped[data.country] = [];
    grouped[data.country].push({ name, ...data });
  }
  return grouped;
}

/**
 * Expected score at this stadium for the given format and innings.
 * 2nd innings gets a reduction based on pitch deterioration.
 */
export function getExpectedScore(stadiumName, format, isFirstInnings = true) {
  const s = STADIUMS[stadiumName];
  if (!s) return 250;
  const base = s.avgScore?.[format] || s[`avg${format === 'TEST' ? 'Test' : format}Score`] || 250;
  return isFirstInnings ? base : Math.round(base * (s.secondInningsAdj || 0.95));
}
