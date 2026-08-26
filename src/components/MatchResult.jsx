import { useMemo } from 'react';
import { TEAMS } from '../engine/teams';
import { STADIUMS } from '../engine/stadiums';

export default function MatchResult({ matchData, config, onNewMatch }) {
  const team1 = TEAMS[matchData.battingFirst];
  const team2 = TEAMS[matchData.bowlingFirst];
  const stadiumData = STADIUMS[config.stadium] || {};

  // Aggregate stats
  const stats = useMemo(() => {
    const fi = matchData.firstInnings;
    const si = matchData.secondInnings;

    const totalFours1 = Object.values(fi.batsmanStats).reduce((s, b) => s + b.fours, 0);
    const totalSixes1 = Object.values(fi.batsmanStats).reduce((s, b) => s + b.sixes, 0);
    const totalFours2 = Object.values(si.batsmanStats).reduce((s, b) => s + b.fours, 0);
    const totalSixes2 = Object.values(si.batsmanStats).reduce((s, b) => s + b.sixes, 0);

    // Top scorer
    let topScorer = { name: '', runs: 0, balls: 0 };
    [...Object.entries(fi.batsmanStats), ...Object.entries(si.batsmanStats)].forEach(([name, s]) => {
      if (s.runs > topScorer.runs) topScorer = { name, runs: s.runs, balls: s.balls };
    });

    // Best bowler
    let bestBowler = { name: '', wickets: 0, runs: 999 };
    [...Object.entries(fi.bowlerStats), ...Object.entries(si.bowlerStats)].forEach(([name, s]) => {
      if (s.wickets > bestBowler.wickets || (s.wickets === bestBowler.wickets && s.runs < bestBowler.runs)) {
        bestBowler = { name, wickets: s.wickets, runs: s.runs, overs: s.overs };
      }
    });

    return { totalFours1, totalSixes1, totalFours2, totalSixes2, topScorer, bestBowler };
  }, [matchData]);

  // Sorted batting
  const getTopBatsmen = (inningsStats) => {
    return Object.entries(inningsStats)
      .map(([name, s]) => ({ name, ...s }))
      .filter(s => s.balls > 0)
      .sort((a, b) => b.runs - a.runs);
  };

  const getTopBowlers = (inningsStats) => {
    return Object.entries(inningsStats)
      .map(([name, s]) => ({ name, ...s }))
      .filter(s => s.balls > 0)
      .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs);
  };

  const fi = matchData.firstInnings;
  const si = matchData.secondInnings;

  return (
    <div className="result-container">
      {/* Hero */}
      <div className="result-hero" id="result-hero">
        <div className="result-winner-emoji">🏆</div>
        <div className="result-winner-text">{matchData.result.winner} Win!</div>
        <div className="result-margin">Won by {matchData.result.margin}</div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className="badge badge-primary">{config.format}</span>
          <span className="badge badge-cyan">{stadiumData.emoji} {config.stadium}</span>
          <span className="badge badge-amber">Toss: {matchData.toss.winner} → {matchData.toss.decision}</span>
          {matchData.toss.hasDew && <span className="badge badge-cyan">💧 Dew Factor</span>}
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats-grid" id="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">🏏</div>
          <div className="stat-card-value">{stats.topScorer.runs}</div>
          <div className="stat-card-label">Top Score — {stats.topScorer.name.split(' ').pop()} ({stats.topScorer.balls}b)</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🎳</div>
          <div className="stat-card-value">{stats.bestBowler.wickets}/{stats.bestBowler.runs}</div>
          <div className="stat-card-label">Best Bowling — {stats.bestBowler.name.split(' ').pop()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💥</div>
          <div className="stat-card-value">{stats.totalFours1 + stats.totalFours2}</div>
          <div className="stat-card-label">Total Fours</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🚀</div>
          <div className="stat-card-value">{stats.totalSixes1 + stats.totalSixes2}</div>
          <div className="stat-card-label">Total Sixes</div>
        </div>
      </div>

      {/* Innings cards */}
      <div className="result-summary-grid" id="innings-summaries">
        {/* First innings */}
        <div className="result-innings-card">
          <div className="result-innings-header">
            <div className="result-innings-team">
              <span>{team1?.emoji}</span>
              <span>{matchData.battingFirst}</span>
              <span className="badge badge-primary" style={{ marginLeft: 8 }}>1st</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="result-innings-score" style={{ color: team1?.color }}>
                {fi.totalRuns}/{fi.wickets}
              </div>
              <div className="result-innings-overs">({fi.overs} overs) • RR {fi.runRate}</div>
            </div>
          </div>

          {/* Batting */}
          <div className="scorecard-section">
            <h4>Batting</h4>
            <table className="batsman-table">
              <thead>
                <tr>
                  <th>Batter</th>
                  <th>R</th>
                  <th>B</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                </tr>
              </thead>
              <tbody>
                {getTopBatsmen(fi.batsmanStats).map((b, i) => (
                  <tr key={i} className={b.out ? 'batsman-out' : 'batsman-not-out'}>
                    <td title={b.dismissal || 'not out'}>
                      {b.name}
                      {b.out && <span style={{ fontSize: '0.65rem', color: 'var(--accent-red)', display: 'block' }}>{b.dismissal}</span>}
                      {!b.out && <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)', display: 'block' }}>not out</span>}
                    </td>
                    <td style={{ fontWeight: b.runs >= 50 ? 700 : 400, color: b.runs >= 100 ? 'var(--accent-amber)' : b.runs >= 50 ? 'var(--accent-green)' : 'inherit' }}>
                      {b.runs}{b.runs >= 100 ? '💯' : b.runs >= 50 ? '⭐' : ''}
                    </td>
                    <td>{b.balls}</td>
                    <td>{b.fours}</td>
                    <td>{b.sixes}</td>
                    <td>{b.sr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extras */}
          <div style={{ padding: '12px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Extras: <strong>{fi.extras.wides + fi.extras.noballs + fi.extras.legbyes}</strong>
            <span style={{ fontSize: '0.72rem', marginLeft: 8, color: 'var(--text-tertiary)' }}>
              (W {fi.extras.wides}, NB {fi.extras.noballs}, LB {fi.extras.legbyes})
            </span>
          </div>

          {/* Bowling */}
          <div className="scorecard-section">
            <h4>Bowling</h4>
            <table className="bowler-table">
              <thead>
                <tr>
                  <th>Bowler</th>
                  <th>O</th>
                  <th>R</th>
                  <th>W</th>
                  <th>Eco</th>
                </tr>
              </thead>
              <tbody>
                {getTopBowlers(fi.bowlerStats).map((b, i) => (
                  <tr key={i}>
                    <td>{b.name}</td>
                    <td>{`${Math.floor(b.balls / 6)}.${b.balls % 6}`}</td>
                    <td>{b.runs}</td>
                    <td style={{ fontWeight: b.wickets >= 3 ? 700 : 400, color: b.wickets >= 3 ? 'var(--accent-green)' : 'inherit' }}>
                      {b.wickets}
                    </td>
                    <td>{b.economy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fall of Wickets */}
          {fi.fallOfWickets.length > 0 && (
            <div className="scorecard-section">
              <h4>Fall of Wickets</h4>
              <div className="fow-list">
                {fi.fallOfWickets.map((fow, i) => (
                  <span key={i} className="fow-item" title={`${fow.player} - ${fow.dismissal}`}>
                    {fow.wicket}-{fow.runs}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Second innings */}
        <div className="result-innings-card">
          <div className="result-innings-header">
            <div className="result-innings-team">
              <span>{team2?.emoji}</span>
              <span>{matchData.bowlingFirst}</span>
              <span className="badge badge-amber" style={{ marginLeft: 8 }}>2nd</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="result-innings-score" style={{ color: team2?.color }}>
                {si.totalRuns}/{si.wickets}
              </div>
              <div className="result-innings-overs">({si.overs} overs) • RR {si.runRate}</div>
            </div>
          </div>

          {/* Target */}
          <div className="target-display">
            <div className="target-label">Target</div>
            <div className="target-value">{matchData.target}</div>
          </div>

          {/* Batting */}
          <div className="scorecard-section">
            <h4>Batting</h4>
            <table className="batsman-table">
              <thead>
                <tr>
                  <th>Batter</th>
                  <th>R</th>
                  <th>B</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                </tr>
              </thead>
              <tbody>
                {getTopBatsmen(si.batsmanStats).map((b, i) => (
                  <tr key={i} className={b.out ? 'batsman-out' : 'batsman-not-out'}>
                    <td title={b.dismissal || 'not out'}>
                      {b.name}
                      {b.out && <span style={{ fontSize: '0.65rem', color: 'var(--accent-red)', display: 'block' }}>{b.dismissal}</span>}
                      {!b.out && <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)', display: 'block' }}>not out</span>}
                    </td>
                    <td style={{ fontWeight: b.runs >= 50 ? 700 : 400, color: b.runs >= 100 ? 'var(--accent-amber)' : b.runs >= 50 ? 'var(--accent-green)' : 'inherit' }}>
                      {b.runs}{b.runs >= 100 ? '💯' : b.runs >= 50 ? '⭐' : ''}
                    </td>
                    <td>{b.balls}</td>
                    <td>{b.fours}</td>
                    <td>{b.sixes}</td>
                    <td>{b.sr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extras */}
          <div style={{ padding: '12px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Extras: <strong>{si.extras.wides + si.extras.noballs + si.extras.legbyes}</strong>
            <span style={{ fontSize: '0.72rem', marginLeft: 8, color: 'var(--text-tertiary)' }}>
              (W {si.extras.wides}, NB {si.extras.noballs}, LB {si.extras.legbyes})
            </span>
          </div>

          {/* Bowling */}
          <div className="scorecard-section">
            <h4>Bowling</h4>
            <table className="bowler-table">
              <thead>
                <tr>
                  <th>Bowler</th>
                  <th>O</th>
                  <th>R</th>
                  <th>W</th>
                  <th>Eco</th>
                </tr>
              </thead>
              <tbody>
                {getTopBowlers(si.bowlerStats).map((b, i) => (
                  <tr key={i}>
                    <td>{b.name}</td>
                    <td>{`${Math.floor(b.balls / 6)}.${b.balls % 6}`}</td>
                    <td>{b.runs}</td>
                    <td style={{ fontWeight: b.wickets >= 3 ? 700 : 400, color: b.wickets >= 3 ? 'var(--accent-green)' : 'inherit' }}>
                      {b.wickets}
                    </td>
                    <td>{b.economy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fall of Wickets */}
          {si.fallOfWickets.length > 0 && (
            <div className="scorecard-section">
              <h4>Fall of Wickets</h4>
              <div className="fow-list">
                {si.fallOfWickets.map((fow, i) => (
                  <span key={i} className="fow-item" title={`${fow.player} - ${fow.dismissal}`}>
                    {fow.wicket}-{fow.runs}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Over-by-over comparison */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }} id="over-comparison">
        <h3 style={{ marginBottom: 'var(--space-lg)', fontSize: '0.9rem' }}>📊 Over-by-Over Comparison</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          {[fi, si].map((inn, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 8, fontWeight: 600 }}>
                {idx === 0 ? matchData.battingFirst : matchData.bowlingFirst}
              </div>
              <div className="over-chart-bars" style={{ height: 80 }}>
                {inn.overSummaries.map((o, i) => {
                  const maxRuns = Math.max(1, ...inn.overSummaries.map(ov => ov.runs));
                  return (
                    <div
                      key={i}
                      className="over-chart-bar"
                      data-runs={o.runs}
                      style={{
                        height: `${Math.max(8, (o.runs / maxRuns) * 100)}%`,
                        background: o.runs >= 15 ? 'var(--accent-red)' :
                                    o.runs >= 10 ? 'var(--accent-amber)' :
                                    o.runs >= 6 ? idx === 0 ? team1?.color || 'var(--accent-primary)' : team2?.color || 'var(--accent-cyan)' :
                                    'var(--accent-primary-dim)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New match */}
      <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
        <button className="start-btn" onClick={onNewMatch} id="btn-play-again">
          🏏 Play Another Match
        </button>
      </div>
    </div>
  );
}
