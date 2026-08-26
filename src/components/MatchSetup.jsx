import { useState, useMemo } from 'react';
import { TEAMS, getTeamList } from '../engine/teams';
import { getStadiumsByCountry } from '../engine/stadiums';
import { FORMATS } from '../engine/constants';

export default function MatchSetup({ onStartMatch }) {
  const [team1, setTeam1] = useState('India');
  const [team2, setTeam2] = useState('Australia');
  const [format, setFormat] = useState('T20');
  const [stadium, setStadium] = useState('Wankhede Stadium');

  const teamList = useMemo(() => getTeamList(), []);
  const stadiumsByCountry = useMemo(() => getStadiumsByCountry(), []);

  const team1Data = TEAMS[team1];
  const team2Data = TEAMS[team2];

  const canStart = team1 && team2 && team1 !== team2 && format && stadium;

  const formatCards = [
    { key: 'T20', icon: '⚡', label: 'T20', desc: '20 overs, explosive' },
    { key: 'ODI', icon: '🏆', label: 'ODI', desc: '50 overs, classic' },
    { key: 'TEST', icon: '🎩', label: 'Test', desc: '90 overs/day, gritty' },
  ];

  return (
    <div className="setup-container">
      <div className="setup-hero">
        <h1 id="setup-title">Cricket Simulator</h1>
        <p>Advanced match simulation with ball physics, captaincy, and stadium effects</p>
      </div>

      <div className="setup-grid">
        {/* Teams */}
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
            onClick={() => onStartMatch({ team1, team2, format, stadium })}
            disabled={!canStart}
            id="btn-start-match"
          >
            🏏 Simulate Match
          </button>
          {!canStart && (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginTop: 12 }}>
              Please select two different teams, a format, and a stadium
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
