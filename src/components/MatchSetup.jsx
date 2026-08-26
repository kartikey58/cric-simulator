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

  const getAvailablePlayers = (category, currentSelectedName) => {
    return playerPool.filter(p =>
      p.category === category &&
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

                const pool1 = getAvailablePlayers(slot.category, p1?.name);
                const pool2 = getAvailablePlayers(slot.category, p2?.name);

                return (
                  <div key={slot.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: 16, alignItems: 'center' }}>
                    {/* Team A Picker */}
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
                          {p.teamEmoji} {p.name} ({p.teamName})
                        </option>
                      ))}
                    </select>

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
                          {p.teamEmoji} {p.name} ({p.teamName})
                        </option>
                      ))}
                    </select>
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
                : 'Please select all 11 players for both teams, a format, and a stadium'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
