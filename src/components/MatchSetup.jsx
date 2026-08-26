import { useState, useMemo } from 'react';
import { TEAMS, getTeamList } from '../engine/teams';
import { getStadiumsByCountry } from '../engine/stadiums';
import { FORMATS } from '../engine/constants';

// Openers list for classification
const OPENERS = [
  "Rohit Sharma", "Shubman Gill",
  "Travis Head", "Steve Smith",
  "Phil Salt", "Jos Buttler",
  "Aiden Markram", "Quinton de Kock",
  "Babar Azam", "Imam-ul-Haq", "Mohammad Rizwan",
  "Kane Williamson", "Devon Conway", "Tom Latham"
];

const DRAFT_SLOTS = [
  { id: 0, label: 'Opener 1', category: 'opener' },
  { id: 1, label: 'Opener 2', category: 'opener' },
  { id: 2, label: 'No. 3 Batsman', category: 'middle' },
  { id: 3, label: 'No. 4 Batsman', category: 'middle' },
  { id: 4, label: 'No. 5 Batsman', category: 'middle' },
  { id: 5, label: 'Wicket Keeper', category: 'keeper' },
  { id: 6, label: 'All-Rounder 1', category: 'all-rounder' },
  { id: 7, label: 'All-Rounder 2', category: 'all-rounder' },
  { id: 8, label: 'Bowler 1', category: 'bowler' },
  { id: 9, label: 'Bowler 2', category: 'bowler' },
  { id: 10, label: 'Bowler 3', category: 'bowler' },
];

const countries = [
  { name: 'India', emoji: '🇮🇳', color: '#1E90FF' },
  { name: 'Australia', emoji: '🇦🇺', color: '#FFD700' },
  { name: 'England', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#003366' },
  { name: 'South Africa', emoji: '🇿🇦', color: '#007A4D' },
  { name: 'Pakistan', emoji: '🇵🇰', color: '#006600' },
  { name: 'New Zealand', emoji: '🇳🇿', color: '#111111' },
];

export default function MatchSetup({ onStartMatch }) {
  const [mode, setMode] = useState('preset'); // 'preset' | 'draft'
  const [team1, setTeam1] = useState('India');
  const [team2, setTeam2] = useState('Australia');
  const [format, setFormat] = useState('T20');
  const [stadium, setStadium] = useState('Wankhede Stadium');

  // Draft mode setup states
  const [draftTeam1Name, setDraftTeam1Name] = useState('Team Alpha');
  const [draftTeam2Name, setDraftTeam2Name] = useState('Team Beta');
  const [draftTeam1Players, setDraftTeam1Players] = useState(Array(11).fill(null));
  const [draftTeam2Players, setDraftTeam2Players] = useState(Array(11).fill(null));

  // Turn-based Draft Game states
  const [draftStage, setDraftStage] = useState('setup'); // 'setup' | 'toss' | 'drafting' | 'complete'
  const [tossWinner, setTossWinner] = useState(null); // 'team1' | 'team2'
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);
  
  const [currentTurn, setCurrentTurn] = useState(0); // 0 to 21 (22 players total)
  const [turnSpunCountry, setTurnSpunCountry] = useState(null); // Country spun for the current pick
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [spunResultObject, setSpunResultObject] = useState(null);

  const teamList = useMemo(() => getTeamList(), []);
  const stadiumsByCountry = useMemo(() => getStadiumsByCountry(), []);

  // Player pool compiled from all TEAMS
  const playerPool = useMemo(() => {
    return Object.entries(TEAMS).flatMap(([teamName, team]) =>
      team.players.map(p => {
        let category = 'middle'; // default
        if (OPENERS.includes(p.name)) {
          category = 'opener';
        } else if (p.role === 'Wicket-Keeper') {
          category = 'keeper';
        } else if (p.role === 'All-Rounder') {
          category = 'all-rounder';
        } else if (p.role === 'Bowler') {
          category = 'bowler';
        }
        return {
          ...p,
          teamName,
          teamEmoji: team.emoji,
          category
        };
      })
    );
  }, []);

  const team1Data = TEAMS[team1];
  const team2Data = TEAMS[team2];

  // Dynamic turn calculations
  const turnDetails = useMemo(() => {
    if (draftStage !== 'drafting') return null;
    const isTeam1First = tossWinner === 'team1';
    const isTeam1Turn = (currentTurn % 2 === 0) ? isTeam1First : !isTeam1First;
    const slotIndex = Math.floor(currentTurn / 2);
    
    return {
      teamKey: isTeam1Turn ? 'team1' : 'team2',
      teamName: isTeam1Turn ? draftTeam1Name : draftTeam2Name,
      slotId: slotIndex,
      slotLabel: DRAFT_SLOTS[slotIndex].label,
      category: DRAFT_SLOTS[slotIndex].category
    };
  }, [draftStage, currentTurn, tossWinner, draftTeam1Name, draftTeam2Name]);

  // Names already drafted by either team
  const draftedNames = useMemo(() => {
    return [
      ...draftTeam1Players.filter(Boolean).map(p => p.name),
      ...draftTeam2Players.filter(Boolean).map(p => p.name),
    ];
  }, [draftTeam1Players, draftTeam2Players]);

  const getAvailablePlayers = (category, country) => {
    return playerPool.filter(p =>
      p.category === category &&
      p.teamName === country &&
      !draftedNames.includes(p.name)
    );
  };

  const isDraftComplete = draftTeam1Players.filter(Boolean).length === 11 &&
                          draftTeam2Players.filter(Boolean).length === 11;

  const canStart = format && stadium &&
    (mode === 'preset' ? (team1 && team2 && team1 !== team2) : isDraftComplete);

  const formatCards = [
    { key: 'T20', icon: '⚡', label: 'T20', desc: '20 overs, explosive' },
    { key: 'ODI', icon: '🏆', label: 'ODI', desc: '50 overs, classic' },
    { key: 'TEST', icon: '🎩', label: 'Test', desc: '90 overs/day, gritty' },
  ];

  const handleStart = () => {
    if (!canStart) return;

    if (mode === 'preset') {
      onStartMatch({ team1, team2, format, stadium, isDraft: false });
    } else {
      // Determine captain by highest captainRating
      const getCaptIndex = (players) => {
        let bestIdx = 0;
        for (let i = 1; i < players.length; i++) {
          if ((players[i]?.captainRating || 0) > (players[bestIdx]?.captainRating || 0)) {
            bestIdx = i;
          }
        }
        return bestIdx;
      };

      const customTeam1 = {
        name: draftTeam1Name || "Team Alpha",
        code: "T1",
        color: "#6366f1",
        colorSecondary: "#8b5cf6",
        emoji: "🛡️",
        captainIndex: getCaptIndex(draftTeam1Players),
        players: draftTeam1Players
      };

      const customTeam2 = {
        name: draftTeam2Name || "Team Beta",
        code: "T2",
        color: "#06b6d4",
        colorSecondary: "#3b82f6",
        emoji: "⚔️",
        captainIndex: getCaptIndex(draftTeam2Players),
        players: draftTeam2Players
      };

      onStartMatch({
        isDraft: true,
        draftTeam1: customTeam1,
        draftTeam2: customTeam2,
        format,
        stadium
      });
    }
  };

  // Toss flip trigger
  const triggerToss = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTossWinner(null);

    const winner = Math.random() < 0.5 ? 'team1' : 'team2';
    // Spin animation angle
    const targetRotation = 1440 + (winner === 'team1' ? 0 : 180);
    setCoinRotation(targetRotation);

    setTimeout(() => {
      setTossWinner(winner);
      setIsFlipping(false);
    }, 1800);
  };

  // Turn-based Spin Wheel trigger (opens Pop-Out Modal)
  const triggerSpin = () => {
    if (isSpinning) return;
    setIsSpinning(false); // Snap to no-transition
    setIsWheelModalOpen(true);
    setSpunResultObject(null);
    setTurnSpunCountry(null);
    setWheelRotation(0); // Snap back to 0deg instantly

    const targetIdx = Math.floor(Math.random() * 6);
    const rotation = 1800 + (360 - (targetIdx * 60 + 30));

    // Delay target rotation to let the Modal mount at 0deg first
    setTimeout(() => {
      setIsSpinning(true);
      setWheelRotation(rotation);
    }, 50);

    setTimeout(() => {
      const countryObj = countries[targetIdx];
      const countryName = countryObj.fullName || countryObj.name;
      setSpunResultObject(countryObj);
      setTurnSpunCountry(countryName);
      setIsSpinning(false);

      // Auto close pop-out modal after 1.0s celebratory preview
      setTimeout(() => {
        setIsWheelModalOpen(false);
      }, 1000);
    }, 2550); // Match delay offset
  };

  // Selects player and advances the draft turn
  const handleDraftPlayer = (player) => {
    const isTeam1 = turnDetails.teamKey === 'team1';
    const updated = isTeam1 ? [...draftTeam1Players] : [...draftTeam2Players];
    updated[turnDetails.slotId] = player;

    if (isTeam1) {
      setDraftTeam1Players(updated);
    } else {
      setDraftTeam2Players(updated);
    }

    setTurnSpunCountry(null);
    if (currentTurn < 21) {
      setCurrentTurn(prev => prev + 1);
    } else {
      setDraftStage('complete');
    }
  };

  const handleResetDraft = () => {
    setDraftTeam1Players(Array(11).fill(null));
    setDraftTeam2Players(Array(11).fill(null));
    setCurrentTurn(0);
    setTurnSpunCountry(null);
    setTossWinner(null);
    setDraftStage('setup');
  };

  return (
    <div className="setup-container">
      <div className="setup-hero">
        <h1 id="setup-title">Cricket Simulator</h1>
        <p>Advanced match simulation with ball physics, captaincy, and stadium effects</p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
        <button
          className={`btn ${mode === 'preset' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('preset')}
          style={{ padding: '10px 24px', borderRadius: '10px' }}
          id="btn-mode-preset"
        >
          🌍 International Teams
        </button>
        <button
          className={`btn ${mode === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('draft')}
          style={{ padding: '10px 24px', borderRadius: '10px' }}
          id="btn-mode-draft"
        >
          ⚔️ Custom Squad Draft
        </button>
      </div>

      <div className="setup-grid">
        {/* PRESET TEAM SELECTOR */}
        {mode === 'preset' && (
          <div className="setup-section" id="section-teams">
            <div className="setup-section-title">
              <span>🏏 Select Teams</span>
            </div>
            <div className="team-selector-grid">
              <div className="team-select-wrapper">
                <label htmlFor="team1-select">Home Team</label>
                <select
                  id="team1-select"
                  className="select-field"
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                >
                  {teamList.map(t => (
                    <option key={t.name} value={t.name} disabled={t.name === team2}>
                      {t.emoji} {t.name}
                    </option>
                  ))}
                </select>
                {team1Data && (
                  <div className="team-preview">
                    <span className="team-preview-emoji">{team1Data.emoji}</span>
                    <div>
                      <div>{team1Data.players.length} Players</div>
                      <div className="team-preview-captain">
                        👑 {team1Data.players[team1Data.captainIndex]?.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="vs-badge">VS</div>

              <div className="team-select-wrapper">
                <label htmlFor="team2-select">Away Team</label>
                <select
                  id="team2-select"
                  className="select-field"
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                >
                  {teamList.map(t => (
                    <option key={t.name} value={t.name} disabled={t.name === team1}>
                      {t.emoji} {t.name}
                    </option>
                  ))}
                </select>
                {team2Data && (
                  <div className="team-preview">
                    <span className="team-preview-emoji">{team2Data.emoji}</span>
                    <div>
                      <div>{team2Data.players.length} Players</div>
                      <div className="team-preview-captain">
                        👑 {team2Data.players[team2Data.captainIndex]?.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM SQUAD DRAFT MODE */}
        {mode === 'draft' && (
          <div className="setup-section animate-fade-in" id="section-draft" style={{ gridColumn: 'span 2' }}>
            {/* STAGE 1: DRAFT SETUP */}
            {draftStage === 'setup' && (
              <div style={{ padding: 'var(--space-md)' }}>
                <div className="setup-section-title" style={{ marginBottom: 24 }}>
                  <span>🛡️ Name Custom Squads</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Home Custom Team Name
                    </label>
                    <input 
                      type="text" 
                      className="select-field" 
                      value={draftTeam1Name}
                      onChange={(e) => setDraftTeam1Name(e.target.value)}
                      style={{ backgroundImage: 'none', padding: '12px 16px', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Away Custom Team Name
                    </label>
                    <input 
                      type="text" 
                      className="select-field" 
                      value={draftTeam2Name}
                      onChange={(e) => setDraftTeam2Name(e.target.value)}
                      style={{ backgroundImage: 'none', padding: '12px 16px', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '14px 40px', fontSize: '0.95rem', fontWeight: 700, borderRadius: '25px' }}
                    onClick={() => setDraftStage('toss')}
                  >
                    🪙 Proceed to Toss
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: DRAFT TOSS */}
            {draftStage === 'toss' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-xl) 0' }}>
                <h3 style={{ marginBottom: 12 }}>🪙 The Custom Draft Toss</h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 32, textAlign: 'center' }}>
                  Winner of the coin toss gets the advantage of drafting their first player first!
                </p>

                {/* Coin Flipping Box */}
                <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: 32 }}>
                  <div style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #ffe066 0%, #ca8a04 100%)',
                    border: '4px solid #ffffff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    transition: isFlipping ? 'transform 1.8s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none',
                    transform: `rotateX(${coinRotation}deg)`
                  }}>
                    🏏
                  </div>
                </div>

                <div style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {tossWinner ? (
                    <div style={{ textAlign: 'center' }} className="animate-scale-in">
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: 16 }}>
                        🎉 {tossWinner === 'team1' ? draftTeam1Name : draftTeam2Name} won the toss!
                      </div>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '12px 32px', borderRadius: '20px', fontWeight: 600 }}
                        onClick={() => setDraftStage('drafting')}
                      >
                        🚀 Start Live Draft
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      style={{ padding: '12px 32px', borderRadius: '20px', fontWeight: 600 }}
                      onClick={triggerToss}
                      disabled={isFlipping}
                    >
                      {isFlipping ? 'Flipping...' : 'Flip Coin'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 3: LIVE DRAFTING GAME */}
            {draftStage === 'drafting' && turnDetails && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '260px 1fr 260px',
                gap: 20,
                padding: '10px 0',
                alignItems: 'start',
                width: '100%'
              }}>
                
                {/* 1. Left Sidebar: Team A Squad Progression */}
                <div className="card" style={{ padding: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border-medium)', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)', paddingBottom: 8, marginBottom: 16, textAlign: 'center' }}>
                    🛡️ {draftTeam1Name}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {DRAFT_SLOTS.map((slot) => {
                      const p = draftTeam1Players[slot.id];
                      const isCurrent = turnDetails.teamKey === 'team1' && turnDetails.slotId === slot.id;
                      return (
                        <div key={slot.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                          border: isCurrent ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          boxShadow: isCurrent ? '0 0 10px rgba(99, 102, 241, 0.25)' : 'none',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          minHeight: '44px',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                              {slot.label}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: p ? 600 : 400, color: p ? 'var(--text-primary)' : 'var(--text-tertiary)', fontStyle: p ? 'normal' : 'italic' }}>
                              {p ? `${p.teamEmoji} ${p.name}` : (isCurrent ? '📝 Drafting...' : 'waiting...')}
                            </span>
                          </div>
                          {p && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 4px', borderRadius: '4px' }}>
                              ★ {p.batting.average || p.bowling.average}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Center Column: Active Drafting Control Hub */}
                <div className="card" style={{ padding: '24px', background: 'var(--glass-bg)', border: '1px solid var(--border-medium)', minHeight: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '12px' }}>
                  <div style={{ width: '100%', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Pick {currentTurn + 1} / 22</span>
                      <button 
                        className="btn-ghost" 
                        style={{ fontSize: '0.72rem', color: 'var(--accent-red)', cursor: 'pointer', background: 'none', border: 'none' }}
                        onClick={handleResetDraft}
                      >
                        ❌ Cancel Draft
                      </button>
                    </div>
                    <h3 style={{ marginTop: 8, fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}>
                      ⚔️ {turnDetails.teamName} Turn
                    </h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginTop: 4, textAlign: 'center' }}>
                      Drafting Duty: <strong style={{ color: turnDetails.teamKey === 'team1' ? 'var(--accent-primary-light)' : 'var(--accent-cyan)' }}>{turnDetails.slotLabel}</strong>
                    </p>
                  </div>

                  {/* Flow State A: Spin country wheel CTA */}
                  {!turnSpunCountry && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '30px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '3.5rem', marginBottom: 16 }} className="animate-bounce">🎰</div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
                        Ready to Spin for {turnDetails.slotLabel}?
                      </h4>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: 28, maxWidth: '340px', lineHeight: 1.5 }}>
                        Click below to pop out the wheel and spin for a random country!
                      </p>
                      <button
                        className="btn btn-primary"
                        style={{
                          padding: '16px 44px',
                          borderRadius: '30px',
                          fontWeight: 800,
                          fontSize: '1rem',
                          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                          letterSpacing: '0.5px'
                        }}
                        onClick={triggerSpin}
                        disabled={isSpinning}
                      >
                        🎰 SPIN COUNTRY WHEEL
                      </button>
                    </div>
                  )}

                  {/* Flow State B: Country Spun, spacious player selection */}
                  {turnSpunCountry && (
                    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }} className="animate-scale-in">
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        background: 'rgba(99, 102, 241, 0.08)', 
                        padding: '12px 20px', 
                        borderRadius: '10px', 
                        border: '1px solid var(--accent-primary-light)',
                        marginBottom: 20
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '1.8rem' }}>
                            {countries.find(c => c.name === turnSpunCountry)?.emoji}
                          </span>
                          <div>
                            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>Result</div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                              {turnSpunCountry}
                            </div>
                          </div>
                        </div>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, borderRadius: '8px' }}
                          onClick={triggerSpin}
                        >
                          🔄 Respin Wheel
                        </button>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14, fontWeight: 700 }}>
                        Available Players for <span style={{ color: 'var(--accent-cyan)' }}>{turnDetails.slotLabel}</span>:
                      </div>

                      {/* Spacious Player Cards Grid */}
                      <div style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        maxHeight: '340px', 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                        gap: 12, 
                        paddingRight: 4 
                      }}>
                        {getAvailablePlayers(turnDetails.category, turnSpunCountry).length > 0 ? (
                          getAvailablePlayers(turnDetails.category, turnSpunCountry).map(p => (
                            <div
                              key={p.name}
                              onClick={() => handleDraftPlayer(p)}
                              style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'flex-start',
                                padding: '14px 16px', 
                                borderRadius: '10px', 
                                border: '1.5px solid var(--border-subtle)',
                                background: 'var(--bg-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                e.currentTarget.style.background = 'var(--bg-secondary)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 4 }}>
                                <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{p.name}</strong>
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                                  ★{p.batting.average || p.bowling.average}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                                {p.role} • {p.bowling.type.replace(/_/g, ' ')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', border: '1px dashed var(--accent-red)', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--accent-red)', marginBottom: 12, fontWeight: 700 }}>
                              No players left from {turnSpunCountry} for this duty!
                            </div>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              style={{ fontWeight: 700, padding: '8px 20px' }}
                              onClick={triggerSpin}
                            >
                              🔄 Respin Wheel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Right Sidebar: Team B Squad Progression */}
                <div className="card" style={{ padding: '16px', background: 'var(--glass-bg)', border: '1px solid var(--border-medium)', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', borderBottom: '2px solid var(--accent-cyan)', paddingBottom: 8, marginBottom: 16, textAlign: 'center' }}>
                    ⚔️ {draftTeam2Name}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {DRAFT_SLOTS.map((slot) => {
                      const p = draftTeam2Players[slot.id];
                      const isCurrent = turnDetails.teamKey === 'team2' && turnDetails.slotId === slot.id;
                      return (
                        <div key={slot.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isCurrent ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-secondary)',
                          border: isCurrent ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          boxShadow: isCurrent ? '0 0 10px rgba(6, 182, 212, 0.25)' : 'none',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          minHeight: '44px',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                              {slot.label}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: p ? 600 : 400, color: p ? 'var(--text-primary)' : 'var(--text-tertiary)', fontStyle: p ? 'normal' : 'italic' }}>
                              {p ? `${p.teamEmoji} ${p.name}` : (isCurrent ? '📝 Drafting...' : 'waiting...')}
                            </span>
                          </div>
                          {p && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 4px', borderRadius: '4px' }}>
                              ★ {p.batting.average || p.bowling.average}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* STAGE 4: DRAFT COMPLETED */}
            {draftStage === 'complete' && (
              <div style={{ padding: 'var(--space-md)' }} className="animate-fade-in">
                <div className="setup-section-title" style={{ marginBottom: 16 }}>
                  <span>🏆 Custom Draft Completed!</span>
                </div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 24, textAlign: 'center' }}>
                  Both squads have been drafted using the Spin Wheel. Review your teams below:
                </p>

                {/* Squad reviews */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                  {/* Team A */}
                  <div className="card" style={{ padding: '20px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                    <h4 style={{ color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8, marginBottom: 12 }}>
                      🛡️ {draftTeam1Name}
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {draftTeam1Players.map((p, i) => (
                        <li key={i} style={{ fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{p?.teamEmoji} {p?.name}</span>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>{DRAFT_SLOTS[i].label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Team B */}
                  <div className="card" style={{ padding: '20px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                    <h4 style={{ color: 'var(--accent-cyan)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8, marginBottom: 12 }}>
                      ⚔️ {draftTeam2Name}
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {draftTeam2Players.map((p, i) => (
                        <li key={i} style={{ fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{p?.teamEmoji} {p?.name}</span>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>{DRAFT_SLOTS[i].label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '12px 28px', borderRadius: '20px' }}
                    onClick={handleResetDraft}
                  >
                    🔄 Restart Draft
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Format Selector (only show in preset mode OR draft mode stage complete) */}
        {(mode === 'preset' || draftStage === 'complete') && (
          <div className="setup-section animate-fade-in" id="section-format">
            <div className="setup-section-title">
              <span>📋 Match Format</span>
            </div>
            <div className="format-options">
              {formatCards.map(f => (
                <div
                  key={f.key}
                  className={`format-card ${format === f.key ? 'active' : ''}`}
                  onClick={() => setFormat(f.key)}
                  role="button"
                  tabIndex={0}
                  id={`format-${f.key}`}
                >
                  <div className="format-card-icon">{f.icon}</div>
                  <h3>{f.label}</h3>
                  <p>{f.desc}</p>
                  <p style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    {FORMATS[f.key].overs} overs {f.key === 'TEST' ? '/ day' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stadium Selector (only show in preset mode OR draft mode stage complete) */}
        {(mode === 'preset' || draftStage === 'complete') && (
          <div className="setup-section animate-fade-in" id="section-stadium">
            <div className="setup-section-title">
              <span>🏟️ Select Stadium</span>
            </div>
            <div className="stadium-grid">
              {Object.entries(stadiumsByCountry).map(([country, stadiums]) =>
                stadiums.map(s => (
                  <div
                    key={s.name}
                    className={`stadium-card ${stadium === s.name ? 'active' : ''}`}
                    onClick={() => setStadium(s.name)}
                    role="button"
                    tabIndex={0}
                    id={`stadium-${s.name.replace(/\s/g, '-')}`}
                  >
                    <div className="stadium-card-header">
                      <span className="stadium-emoji">{s.emoji}</span>
                      <span className="stadium-name">{s.name}</span>
                    </div>
                    <div className="stadium-city">{s.city}, {s.country}</div>
                    <div className="stadium-stats">
                      <span className="stadium-stat">
                        {format === 'T20' ? `T20: ${s.avgT20Score}` : format === 'ODI' ? `ODI: ${s.avgODIScore}` : `Test: ${s.avgTestScore}`}
                      </span>
                      <span className="stadium-stat">{s.pitchType.replace(/_/g, ' ').toLowerCase()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Start Button (only show in preset mode OR draft mode stage complete) */}
        {(mode === 'preset' || draftStage === 'complete') && (
          <div className="setup-start" style={{ gridColumn: 'span 2' }}>
            <button
              className="start-btn"
              onClick={handleStart}
              disabled={!canStart}
              id="btn-start-match"
            >
              🏏 Simulate Match
            </button>
            {!canStart && (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginTop: 12 }}>
                {mode === 'preset' 
                  ? 'Please select two different teams, a format, and a stadium' 
                  : 'Please draft all 11 players for both teams, a format, and a stadium'}
              </p>
            )}
          </div>
        )}
      </div>
      {/* POP-OUT WHEEL MODAL */}
      {isWheelModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 7, 15, 0.82)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} className="animate-fade-in">
          <div className="card animate-scale-in" style={{
            width: '420px',
            maxWidth: '92vw',
            background: 'var(--bg-secondary)',
            border: '1.5px solid var(--border-medium)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <h3 style={{ marginBottom: 6, fontSize: '1.25rem', fontWeight: 800 }}>🎯 Country Selection Spin</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 20, textAlign: 'center' }}>
              Spinning for <strong style={{ color: 'var(--text-primary)' }}>{turnDetails?.teamName}</strong> — Duty: <strong style={{ color: 'var(--accent-cyan)' }}>{turnDetails?.slotLabel}</strong>
            </p>

            {/* Wheel Graphic Box */}
            <div style={{ position: 'relative', margin: '16px 0', width: '310px', height: '310px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {/* Top Pointer */}
              <div style={{
                position: 'absolute',
                top: '-5px',
                left: 'calc(50% - 15px)',
                width: 0, height: 0,
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderTop: '25px solid var(--accent-red)',
                zIndex: 10,
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
              }} />

              {/* The Wheel */}
              <div style={{
                width: '290px',
                height: '290px',
                borderRadius: '50%',
                border: '8px solid var(--border-medium)',
                boxShadow: '0 0 25px rgba(99, 102, 241, 0.35), inset 0 0 15px rgba(0,0,0,0.6)',
                background: 'conic-gradient(#1E90FF 0deg 60deg, #FFD700 60deg 120deg, #003366 120deg 180deg, #007A4D 180deg 240deg, #006600 240deg 300deg, #111111 300deg 360deg)',
                position: 'relative',
                overflow: 'hidden',
                transition: isSpinning ? 'transform 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                transform: `rotate(${wheelRotation}deg)`,
              }}>
                {/* Sector Dividers */}
                {countries.map((_, i) => (
                  <div
                    key={`line-${i}`}
                    style={{
                      position: 'absolute',
                      top: 0, left: '144px',
                      width: '2px', height: '145px',
                      background: 'rgba(255, 255, 255, 0.25)',
                      transform: `rotate(${i * 60}deg)`,
                      transformOrigin: '1px 145px',
                      zIndex: 2,
                    }}
                  />
                ))}

                {/* Sector Labels */}
                {countries.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%', height: '100%',
                      transform: `rotate(${i * 60 + 90}deg)`,
                      transformOrigin: '50% 50%',
                      display: 'flex',
                      justifyContent: 'center',
                      zIndex: 3
                    }}
                  >
                    <div style={{
                      paddingTop: '22px',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      textShadow: '0 2px 4px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.85)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.25rem', marginBottom: 2 }}>{c.emoji}</div>
                      <div>{c.name}</div>
                    </div>
                  </div>
                ))}

                {/* Casino glowing lights on outer rim */}
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={`bulb-${idx}`}
                    style={{
                      position: 'absolute',
                      top: '4px', left: '139px',
                      width: '12px', height: '12px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 0 8px #ffffff, 0 0 15px #ffe066',
                      transform: `rotate(${idx * 30}deg)`,
                      transformOrigin: '6px 141px',
                      zIndex: 4,
                    }}
                  />
                ))}

                {/* Inner Center Circle Peg */}
                <div style={{
                  position: 'absolute',
                  top: '115px', left: '115px',
                  width: '60px', height: '60px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #ffe066 0%, #ca8a04 100%)',
                  border: '4px solid #ffffff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.6)',
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>
                  🏏
                </div>
              </div>
            </div>

            {/* Result announcement */}
            <div style={{ marginTop: 12, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {spunResultObject ? (
                <div className="animate-scale-in" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                  🎉 {spunResultObject.emoji} {spunResultObject.name}!
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  🌀 Wheel Spinning...
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
