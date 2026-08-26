import { useState, useMemo, useRef, useEffect } from 'react';
import { TEAMS } from '../engine/teams';
import { STADIUMS } from '../engine/stadiums';
import { FORMATS } from '../engine/constants';

export default function LiveMatch({ matchData, config, onShowResult }) {
  const [activeInnings, setActiveInnings] = useState(1);
  const [visibleBalls, setVisibleBalls] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1200); // ms per ball
  const commentaryRef = useRef(null);
  const timerRef = useRef(null);

  const innings = activeInnings === 1 ? matchData.firstInnings : matchData.secondInnings;
  const battingTeamName = activeInnings === 1 ? matchData.battingFirst : matchData.bowlingFirst;
  const bowlingTeamName = activeInnings === 1 ? matchData.bowlingFirst : matchData.battingFirst;
  const battingTeam = TEAMS[battingTeamName];
  const bowlingTeam = TEAMS[bowlingTeamName];

  const totalBallsInInnings = innings.ballLog.length;

  // Auto-play through the innings
  useEffect(() => {
    if (!isPlaying) return;

    if (visibleBalls < totalBallsInInnings) {
      timerRef.current = setTimeout(() => {
        setVisibleBalls(prev => prev + 1);
      }, speed);
    } else if (activeInnings === 1 && visibleBalls >= totalBallsInInnings) {
      // Auto switch to 2nd innings
      setTimeout(() => {
        setActiveInnings(2);
        setVisibleBalls(0);
      }, 1500);
    }

    return () => clearTimeout(timerRef.current);
  }, [visibleBalls, isPlaying, totalBallsInInnings, activeInnings, speed]);

  // Scroll commentary
  useEffect(() => {
    if (commentaryRef.current) {
      commentaryRef.current.scrollTop = 0;
    }
  }, [visibleBalls]);

  const visibleLog = useMemo(() => {
    return innings.ballLog.slice(0, visibleBalls).reverse();
  }, [innings.ballLog, visibleBalls]);

  // Current state from last visible ball
  const currentState = useMemo(() => {
    if (visibleBalls === 0) {
      return { totalRuns: 0, wickets: 0, overs: '0.0', runRate: '0.00', phase: '—' };
    }
    const lastBall = innings.ballLog[visibleBalls - 1];
    return {
      totalRuns: lastBall.totalRuns,
      wickets: lastBall.wickets,
      overs: `${Math.floor(lastBall.ball / 6)}.${lastBall.ball % 6}`,
      runRate: lastBall.runRate,
      phase: lastBall.phase || '—',
      battingRole: lastBall.battingRole || '—',
    };
  }, [innings.ballLog, visibleBalls]);

  // Batsman stats up to visible point
  const currentBatsmanStats = useMemo(() => {
    const stats = {};
    for (let i = 0; i < visibleBalls && i < innings.ballLog.length; i++) {
      const ball = innings.ballLog[i];
      const name = ball.striker;
      if (!stats[name]) {
        stats[name] = { runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: '' };
      }
      if (ball.result.type === 'runs') {
        stats[name].balls++;
        stats[name].runs += ball.result.value;
        if (ball.result.value === 4) stats[name].fours++;
        if (ball.result.value === 6) stats[name].sixes++;
      } else if (ball.result.type === 'wicket') {
        stats[name].balls++;
        stats[name].out = true;
      } else if (ball.result.type === 'legbye') {
        stats[name].balls++;
      }
    }
    return Object.entries(stats).map(([name, s]) => ({
      name,
      ...s,
      sr: s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : '0.0',
    }));
  }, [innings.ballLog, visibleBalls]);

  // Bowler stats up to visible point
  const currentBowlerStats = useMemo(() => {
    const stats = {};
    for (let i = 0; i < visibleBalls && i < innings.ballLog.length; i++) {
      const ball = innings.ballLog[i];
      const name = ball.bowler;
      if (!stats[name]) {
        stats[name] = { overs: 0, balls: 0, runs: 0, wickets: 0, dots: 0 };
      }
      if (ball.result.type === 'wide' || ball.result.type === 'noball') {
        stats[name].runs += 1;
      } else {
        stats[name].balls++;
        if (ball.result.type === 'wicket') {
          stats[name].wickets++;
        } else if (ball.result.type === 'runs') {
          stats[name].runs += ball.result.value;
          if (ball.result.value === 0) stats[name].dots++;
        } else if (ball.result.type === 'legbye') {
          stats[name].runs += 1;
        }
      }
    }
    return Object.entries(stats).map(([name, s]) => {
      const totalOvers = Math.floor(s.balls / 6) + (s.balls % 6) / 10;
      return {
        name,
        ...s,
        oversDisplay: `${Math.floor(s.balls / 6)}.${s.balls % 6}`,
        economy: s.balls > 0 ? ((s.runs / (s.balls / 6))).toFixed(1) : '0.0',
      };
    });
  }, [innings.ballLog, visibleBalls]);

  // Over-by-over runs
  const overRuns = useMemo(() => {
    const overs = [];
    let currentOver = 1;
    let runs = 0;
    for (let i = 0; i < visibleBalls && i < innings.ballLog.length; i++) {
      const ball = innings.ballLog[i];
      if (ball.over > currentOver) {
        overs.push({ over: currentOver, runs });
        currentOver = ball.over;
        runs = 0;
      }
      runs += ball.result.value > 0 ? ball.result.value : (ball.result.type === 'wide' || ball.result.type === 'noball' || ball.result.type === 'legbye' ? 1 : 0);
    }
    if (runs > 0 || currentOver > (overs.length > 0 ? overs[overs.length - 1].over : 0)) {
      overs.push({ over: currentOver, runs });
    }
    return overs;
  }, [innings.ballLog, visibleBalls]);

  const maxOverRuns = Math.max(1, ...overRuns.map(o => o.runs));

  function getResultBadge(ball) {
    if (ball.result.type === 'wicket') return <span className="commentary-result-badge result-W">W</span>;
    if (ball.result.type === 'wide') return <span className="commentary-result-badge result-wd">Wd</span>;
    if (ball.result.type === 'noball') return <span className="commentary-result-badge result-nb">Nb</span>;
    if (ball.result.type === 'legbye') return <span className="commentary-result-badge result-lb">Lb</span>;
    if (ball.result.value === 0) return <span className="commentary-result-badge result-dot">•</span>;
    if (ball.result.value === 4) return <span className="commentary-result-badge result-4">4</span>;
    if (ball.result.value === 6) return <span className="commentary-result-badge result-6">6</span>;
    return <span className={`commentary-result-badge result-${ball.result.value}`}>{ball.result.value}</span>;
  }

  function getCommentaryClass(ball) {
    if (ball.result.type === 'wicket') return 'commentary-item wicket';
    if (ball.result.value === 4) return 'commentary-item four';
    if (ball.result.value === 6) return 'commentary-item six';
    return 'commentary-item';
  }

  const isComplete = visibleBalls >= totalBallsInInnings && activeInnings === 2;
  const stadiumData = STADIUMS[config.stadium] || {};

  // Precompute balls remaining for target display
  const ballsRemaining = useMemo(() => {
    const legalBalls = innings.ballLog.slice(0, visibleBalls).filter(
      b => b.result.type !== 'wide' && b.result.type !== 'noball'
    ).length;
    return Math.max(0, FORMATS[config.format].overs * 6 - legalBalls);
  }, [innings.ballLog, visibleBalls, config.format]);
  const runsNeeded = matchData.target ? matchData.target - currentState.totalRuns : 0;

  const handleSkip = () => {
    setIsPlaying(false);
    setVisibleBalls(totalBallsInInnings);
  };

  const handleSkipToResult = () => {
    setIsPlaying(false);
    onShowResult();
  };

  return (
    <div className="live-container">
      {/* Match info */}
      <div className="match-info-bar animate-fade-in" id="match-info-bar">
        <div className="match-info-item">
          <strong>{stadiumData.emoji} {config.stadium}</strong>
          <span>• {stadiumData.city}</span>
        </div>
        <div className="match-info-item">
          <span>Format:</span>
          <strong>{config.format}</strong>
        </div>
        <div className="match-info-item">
          <span>Toss:</span>
          <strong>{matchData.toss.winner}</strong>
          <span>elected to {matchData.toss.decision}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSpeed(s => Math.min(3000, s + 200))} id="btn-slow-down" title="Slower">
            🐌
          </button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', alignSelf: 'center', minWidth: '40px', textAlign: 'center' }} className="mono">
            {(speed / 1000).toFixed(1)}s
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setSpeed(s => Math.max(100, s - 200))} id="btn-speed-up" title="Faster">
            ⚡
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setIsPlaying(p => !p)} id="btn-play-pause">
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleSkip} id="btn-skip-innings">
            ⏭ Skip
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleSkipToResult} id="btn-view-result">
            📊 Result
          </button>
        </div>
      </div>

      {/* Innings tabs */}
      <div className="innings-tabs">
        <button
          className={`innings-tab ${activeInnings === 1 ? 'active' : ''}`}
          onClick={() => { setActiveInnings(1); setVisibleBalls(matchData.firstInnings.ballLog.length); setIsPlaying(false); }}
          id="tab-innings-1"
        >
          1st Innings — {matchData.battingFirst}
        </button>
        <button
          className={`innings-tab ${activeInnings === 2 ? 'active' : ''}`}
          onClick={() => { setActiveInnings(2); setVisibleBalls(0); setIsPlaying(true); }}
          id="tab-innings-2"
        >
          2nd Innings — {matchData.bowlingFirst}
        </button>
      </div>

      {/* Scoreboard */}
      <div className="scoreboard animate-fade-in" id="live-scoreboard">
        <div className="scoreboard-header">
          <div className="scoreboard-team-info">
            <span className="scoreboard-team-flag">{battingTeam?.emoji}</span>
            <div>
              <div className="scoreboard-team-name" style={{ color: battingTeam?.color }}>
                {battingTeamName}
              </div>
              <div className="scoreboard-overs">
                {currentState.overs} overs
                {activeInnings === 2 && matchData.target && (
                  <span style={{ color: 'var(--accent-amber)', marginLeft: 12 }}>
                    Target: {matchData.target}
                    {currentState.totalRuns < matchData.target && ` • Need ${runsNeeded} from ${ballsRemaining} balls`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="scoreboard-score">
              {currentState.totalRuns}<span className="wickets">/{currentState.wickets}</span>
            </div>
          </div>
        </div>

        <div className="scoreboard-meta">
          <div className="scoreboard-meta-item">
            <span className="scoreboard-meta-label">Run Rate</span>
            <span className="scoreboard-meta-value">{currentState.runRate}</span>
          </div>
          <div className="scoreboard-meta-item">
            <span className="scoreboard-meta-label">Phase</span>
            <span className="scoreboard-meta-value" style={{ fontSize: '0.9rem' }}>{currentState.phase}</span>
          </div>
          <div className="scoreboard-meta-item">
            <span className="scoreboard-meta-label">Batting Mode</span>
            <span className="scoreboard-meta-value" style={{
              fontSize: '0.9rem',
              color: currentState.battingRole === 'Aggressive' ? 'var(--accent-red)' :
                     currentState.battingRole === 'Moderate' ? 'var(--accent-amber)' : 'var(--accent-green)',
            }}>
              {currentState.battingRole}
            </span>
          </div>
          <div className="scoreboard-meta-item">
            <span className="scoreboard-meta-label">vs</span>
            <span className="scoreboard-meta-value" style={{ fontSize: '0.9rem', color: bowlingTeam?.color }}>
              {bowlingTeamName}
            </span>
          </div>
        </div>
      </div>

      {/* Over-by-over mini chart */}
      {overRuns.length > 0 && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Over-by-Over
            </span>
          </div>
          <div className="over-chart-bars" style={{ height: 60 }}>
            {overRuns.map((o, i) => (
              <div
                key={i}
                className="over-chart-bar"
                data-runs={o.runs}
                style={{
                  height: `${Math.max(8, (o.runs / maxOverRuns) * 100)}%`,
                  background: o.runs >= 12 ? 'var(--accent-red)' :
                              o.runs >= 8 ? 'var(--accent-amber)' :
                              o.runs >= 5 ? 'var(--accent-primary)' : 'var(--accent-primary-dim)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="live-grid">
        {/* Commentary */}
        <div className="commentary-panel" id="commentary-panel">
          <div className="commentary-header">
            <h3>📝 Ball-by-Ball</h3>
            <span className="badge badge-primary">{visibleBalls}/{totalBallsInInnings} balls</span>
          </div>
          <div className="commentary-list" ref={commentaryRef}>
            {visibleLog.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                Match is about to begin...
              </div>
            )}
            {visibleLog.map((ball, i) => (
              <div key={i} className={getCommentaryClass(ball)}>
                <div className="commentary-over-ball">
                  {ball.over}.{ball.ballInOver}
                </div>
                {getResultBadge(ball)}
                <div className="commentary-content">{ball.commentary}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="side-panel">
          {/* Batting */}
          <div className="panel-card" id="batting-panel">
            <div className="panel-card-header">🏏 Batting</div>
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
                {currentBatsmanStats.map((b, i) => (
                  <tr key={i} className={b.out ? 'batsman-out' : 'batsman-not-out'}>
                    <td>{b.name.split(' ').pop()}</td>
                    <td>{b.runs}</td>
                    <td>{b.balls}</td>
                    <td>{b.fours}</td>
                    <td>{b.sixes}</td>
                    <td>{b.sr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bowling */}
          <div className="panel-card" id="bowling-panel">
            <div className="panel-card-header">🎳 Bowling</div>
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
                {currentBowlerStats.map((b, i) => (
                  <tr key={i}>
                    <td>{b.name.split(' ').pop()}</td>
                    <td>{b.oversDisplay}</td>
                    <td>{b.runs}</td>
                    <td style={{ color: b.wickets > 0 ? 'var(--accent-green)' : 'inherit', fontWeight: b.wickets > 0 ? 700 : 400 }}>
                      {b.wickets}
                    </td>
                    <td>{b.economy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Match Factors */}
          <div className="panel-card" id="factors-panel">
            <div className="panel-card-header">⚙️ Active Factors</div>
            <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Ball condition */}
              <div className="ball-meter">
                <div className="ball-meter-label">
                  <span>🏏 Ball Condition</span>
                  <span style={{ fontWeight: 600, color: visibleBalls < 15 ? 'var(--accent-red)' : visibleBalls < 30 ? 'var(--accent-amber)' : visibleBalls < 60 ? 'var(--accent-cyan)' : 'var(--accent-green)' }}>
                    {visibleBalls < 15 ? 'New' : visibleBalls < 30 ? 'Semi-New' : visibleBalls < 60 ? 'Old' : 'Very Old'}
                  </span>
                </div>
                <div className="ball-meter-bar">
                  <div
                    className="ball-meter-fill"
                    style={{
                      width: `${Math.min(100, (visibleBalls / (FORMATS[config.format].overs * 6)) * 100)}%`,
                      background: visibleBalls < 15 ? 'var(--accent-red)' : visibleBalls < 30 ? 'var(--accent-amber)' : visibleBalls < 60 ? 'var(--accent-cyan)' : 'var(--accent-green)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <span className={`badge ${visibleBalls < 30 ? 'badge-red' : 'badge-primary'}`}>
                    {visibleBalls < 30 ? '⚡ Swing 1.' + (visibleBalls < 15 ? '4' : '15') + 'x' : '🌬️ Swing 0.' + (visibleBalls < 60 ? '7' : '4') + 'x'}
                  </span>
                  <span className={`badge ${visibleBalls > 40 ? 'badge-green' : 'badge-primary'}`}>
                    {visibleBalls > 40 ? '🌀 Spin 1.' + (visibleBalls > 60 ? '6' : '4') + 'x' : '🌀 Spin 0.' + (visibleBalls < 30 ? '6-8' : '8') + 'x'}
                  </span>
                  {visibleBalls > 50 && <span className="badge badge-amber">🔄 Reverse Swing</span>}
                </div>
              </div>

              {/* Stadium info */}
              <div style={{ padding: '0 var(--space-md)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Stadium Effect</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-cyan">{stadiumData.pitchType?.replace(/_/g, ' ')}</span>
                  {stadiumData.spinFriendly && <span className="badge badge-amber">Spin {stadiumData.spinMultiplier || '✓'}x</span>}
                  {stadiumData.seamFriendly && <span className="badge badge-green">Pace {stadiumData.paceMultiplier || '✓'}x</span>}
                  {stadiumData.dew && <span className="badge badge-cyan">💧 Dew</span>}
                  {stadiumData.altitude > 500 && <span className="badge badge-primary">🏔️ High Alt.</span>}
                </div>
              </div>

              {/* Captain */}
              <div style={{ padding: '0 var(--space-md)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Bowling Captain</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  👑 {bowlingTeam?.players[bowlingTeam?.captainIndex]?.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  Rating: {bowlingTeam?.players[bowlingTeam?.captainIndex]?.captainRating}/100
                  {bowlingTeam?.players[bowlingTeam?.captainIndex]?.captainRating > 80 && ' • Elite field IQ (+12% wickets)'}
                </div>
              </div>
            </div>
          </div>

          {/* Show result button */}
          {isComplete && (
            <button
              className="btn btn-primary btn-lg"
              onClick={onShowResult}
              style={{ width: '100%' }}
              id="btn-final-result"
            >
              🏆 View Match Result
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
