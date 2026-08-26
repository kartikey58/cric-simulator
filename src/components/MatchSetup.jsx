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
  { name: 'England', emoji: '🏴&apos; England', color: '#003366', fullName: 'England' }, // Custom name mapping
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

  // Draft mode states
  const [draftTeam1Name, setDraftTeam1Name] = useState('Team Alpha');
  const [draftTeam2Name, setDraftTeam2Name] = useState('Team Beta');
  const [draftTeam1Players, setDraftTeam1Players] = useState(Array(11).fill(null));
  const [draftTeam2Players, setDraftTeam2Players] = useState(Array(11).fill(null));

  // Spin the wheel states
  const [spinningSlot, setSpinningSlot] = useState(null); // { team: 'team1'|'team2', slotId: number }
  const [spunCountries, setSpunCountries] = useState({ team1: {}, team2: {} });
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedCountryResult, setSelectedCountryResult] = useState(null);

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

  // Names already drafted by either team
  const draftedNames = useMemo(() => {
    return [
      ...draftTeam1Players.filter(Boolean).map(p => p.name),
      ...draftTeam2Players.filter(Boolean).map(p => p.name),
    ];
  }, [draftTeam1Players, draftTeam2Players]);

  const getAvailablePlayers = (category, country, currentSelectedName) => {
    return playerPool.filter(p =>
      p.category === category &&
      p.teamName === country &&
      (!draftedNames.includes(p.name) || p.name === currentSelectedName)
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

  const triggerSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedCountryResult(null);

    // Pick random country index
    const targetIdx = Math.floor(Math.random() * 6);
    // Align sector to pointer (0 degrees pointing down or top)
    // Sector center is i * 60 + 30 degrees. To align top, we rotate 360 - (i * 60 + 30)
    const rotation = 1800 + (360 - (targetIdx * 60 + 30));
    setWheelRotation(rotation);

    setTimeout(() => {
      const countryObj = countries[targetIdx];
      const countryName = countryObj.fullName || countryObj.name;
      setSelectedCountryResult(countryObj);

      // Save country for that slot
      const updated = { ...spunCountries };
      if (!updated[spinningSlot.team]) updated[spinningSlot.team] = {};
      updated[spinningSlot.team][spinningSlot.slotId] = countryName;
      setSpunCountries(updated);

      // Clean up player slot if it was already selected but from a different country
      const currentSlotPlayer = spinningSlot.team === 'team1' 
        ? draftTeam1Players[spinningSlot.slotId] 
        : draftTeam2Players[spinningSlot.slotId];
        
      if (currentSlotPlayer && currentSlotPlayer.teamName !== countryName) {
        const updatedPlayers = spinningSlot.team === 'team1' ? [...draftTeam1Players] : [...draftTeam2Players];
        updatedPlayers[spinningSlot.slotId] = null;
        if (spinningSlot.team === 'team1') setDraftTeam1Players(updatedPlayers);
        else setDraftTeam2Players(updatedPlayers);
      }

      setIsSpinning(false);
      // Wait a moment so player sees the final result before modal closes
      setTimeout(() => {
        setSpinningSlot(null);
        setWheelRotation(0);
        setSelectedCountryResult(null);
      }, 1500);
    }, 2500);
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
        {/* Preset Selector */}
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

        {/* Custom Draft Board */}
        {mode === 'draft' && (
          <div className="setup-section animate-fade-in" id="section-draft">
            <div className="setup-section-title">
              <span>⚔️ Squad Draft Board</span>
            </div>
            
            {/* Custom Team Names */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Draft Team A (Home)
                </label>
                <input 
                  type="text" 
                  className="select-field" 
                  value={draftTeam1Name}
                  onChange={(e) => setDraftTeam1Name(e.target.value)}
                  style={{ backgroundImage: 'none', padding: '10px 16px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Draft Team B (Away)
                </label>
                <input 
                  type="text" 
                  className="select-field" 
                  value={draftTeam2Name}
                  onChange={(e) => setDraftTeam2Name(e.target.value)}
                  style={{ backgroundImage: 'none', padding: '10px 16px' }}
                />
              </div>
            </div>

            {/* Grid of Slots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: 16, alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{draftTeam1Name}</div>
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Duty</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{draftTeam2Name}</div>
              </div>

              {DRAFT_SLOTS.map((slot) => {
                const p1 = draftTeam1Players[slot.id];
                const p2 = draftTeam2Players[slot.id];

                const country1 = spunCountries.team1[slot.id];
                const country2 = spunCountries.team2[slot.id];

                const pool1 = country1 ? getAvailablePlayers(slot.category, country1, p1?.name) : [];
                const pool2 = country2 ? getAvailablePlayers(slot.category, country2, p2?.name) : [];

                return (
                  <div key={slot.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: 16, alignItems: 'center' }}>
                    {/* Team A Picker */}
                    {country1 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Country: {countries.find(c => (c.fullName || c.name) === country1)?.emoji} {country1}</span>
                          <button 
                            className="btn-ghost" 
                            style={{ padding: '0 4px', fontSize: '0.65rem', color: 'var(--accent-red)', cursor: 'pointer', background: 'none', border: 'none' }}
                            onClick={() => setSpinningSlot({ team: 'team1', slotId: slot.id })}
                            title="Respin Country"
                          >
                            🔄 Respin
                          </button>
                        </div>
                        {pool1.length > 0 ? (
                          <select
                            className="select-field"
                            style={{ fontSize: '0.82rem', padding: '8px 12px', height: '38px', backgroundPosition: 'right 8px center' }}
                            value={p1 ? p1.name : ''}
                            onChange={(e) => {
                              const selected = pool1.find(p => p.name === e.target.value);
                              const updated = [...draftTeam1Players];
                              updated[slot.id] = selected || null;
                              setDraftTeam1Players(updated);
                            }}
                          >
                            <option value="">— Select {slot.label} —</option>
                            {pool1.map(p => (
                              <option key={p.name} value={p.name}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-red)', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--accent-red)', borderRadius: 'var(--radius-sm)' }}>
                            No players left! Respin 🔄
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ height: '38px', width: '100%', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                        onClick={() => setSpinningSlot({ team: 'team1', slotId: slot.id })}
                      >
                        🎯 Spin Country
                      </button>
                    )}

                    {/* Duty Label */}
                    <div style={{ 
                      textAlign: 'center', 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      color: slot.category === 'opener' ? 'var(--accent-red)' :
                             slot.category === 'middle' ? 'var(--accent-amber)' :
                             slot.category === 'keeper' ? 'var(--accent-cyan)' :
                             slot.category === 'all-rounder' ? 'var(--accent-pink)' : 'var(--accent-primary-light)',
                      background: 'var(--bg-secondary)',
                      padding: '6px 4px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {slot.label}
                    </div>

                    {/* Team B Picker */}
                    {country2 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Country: {countries.find(c => (c.fullName || c.name) === country2)?.emoji} {country2}</span>
                          <button 
                            className="btn-ghost" 
                            style={{ padding: '0 4px', fontSize: '0.65rem', color: 'var(--accent-red)', cursor: 'pointer', background: 'none', border: 'none' }}
                            onClick={() => setSpinningSlot({ team: 'team2', slotId: slot.id })}
                            title="Respin Country"
                          >
                            🔄 Respin
                          </button>
                        </div>
                        {pool2.length > 0 ? (
                          <select
                            className="select-field"
                            style={{ fontSize: '0.82rem', padding: '8px 12px', height: '38px', backgroundPosition: 'right 8px center' }}
                            value={p2 ? p2.name : ''}
                            onChange={(e) => {
                              const selected = pool2.find(p => p.name === e.target.value);
                              const updated = [...draftTeam2Players];
                              updated[slot.id] = selected || null;
                              setDraftTeam2Players(updated);
                            }}
                          >
                            <option value="">— Select {slot.label} —</option>
                            {pool2.map(p => (
                              <option key={p.name} value={p.name}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-red)', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--accent-red)', borderRadius: 'var(--radius-sm)' }}>
                            No players left! Respin 🔄
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ height: '38px', width: '100%', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                        onClick={() => setSpinningSlot({ team: 'team2', slotId: slot.id })}
                      >
                        🎯 Spin Country
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Format */}
        <div className="setup-section" id="section-format">
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

        {/* Stadium */}
        <div className="setup-section" id="section-stadium">
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

        {/* Start */}
        <div className="setup-start">
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
                : 'Please spin and select all 11 players for both teams, a format, and a stadium'}
            </p>
          )}
        </div>
      </div>

      {/* ─── SPIN THE WHEEL MODAL ──────────────────────────────────────────────── */}
      {spinningSlot && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 10, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{
            width: '420px',
            padding: '32px',
            textAlign: 'center',
            border: '1px solid var(--border-medium)',
            background: 'var(--glass-bg)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>🎯 Country Selection Spin</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem', marginBottom: 24 }}>
              Spinning for <strong>{spinningSlot.team === 'team1' ? draftTeam1Name : draftTeam2Name}</strong> — Duty: <strong>{DRAFT_SLOTS[spinningSlot.slotId].label}</strong>
            </p>

            {/* Spinner Board Container */}
            <div style={{ position: 'relative', margin: '20px 0', width: '310px', height: '310px', display: 'flex', justifyContent: 'center' }}>
              {/* Top Pointer */}
              <div style={{
                position: 'absolute',
                top: '-15px',
                width: 0, height: 0,
                borderLeft: '15px solid transparent',
                borderRight: '15px solid transparent',
                borderTop: '25px solid var(--accent-red)',
                zIndex: 10,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
              }} />

              {/* The Wheel */}
              <div style={{
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                border: '6px solid var(--border-medium)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.25), inset 0 0 10px rgba(0,0,0,0.5)',
                background: 'conic-gradient(#1E90FF 0deg 60deg, #FFD700 60deg 120deg, #003366 120deg 180deg, #007A4D 180deg 240deg, #006600 240deg 300deg, #111111 300deg 360deg)',
                position: 'relative',
                overflow: 'hidden',
                transition: isSpinning ? 'transform 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                transform: `rotate(${wheelRotation}deg)`,
              }}>
                {/* Sector Labels */}
                {countries.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%', height: '100%',
                      transform: `rotate(${i * 60}deg)`,
                      transformOrigin: '50% 50%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{
                      transform: 'rotate(30deg)',
                      transformOrigin: '50% 0px',
                      paddingTop: '24px',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textShadow: '0 2px 4px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.85)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: 2 }}>{c.emoji}</div>
                      <div>{c.name}</div>
                    </div>
                  </div>
                ))}

                {/* Inner Center Circle peg */}
                <div style={{
                  position: 'absolute',
                  top: '125px', left: '125px',
                  width: '50px', height: '50px',
                  borderRadius: '50%',
                  background: 'var(--bg-primary)',
                  border: '4px solid var(--border-medium)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  zIndex: 5
                }} />
              </div>
            </div>

            {/* Spin / Status Panel */}
            <div style={{ marginTop: 12, height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {selectedCountryResult ? (
                <div className="animate-scale-in" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                  🎉 {selectedCountryResult.emoji} {selectedCountryResult.fullName || selectedCountryResult.name}!
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ padding: '12px 32px', fontSize: '0.9rem', fontWeight: 600, borderRadius: '20px' }}
                  onClick={triggerSpin}
                  disabled={isSpinning}
                >
                  {isSpinning ? '🌀 Spinning...' : '🎰 Spin the Wheel'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
