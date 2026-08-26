import { useState, useCallback } from 'react';
import './index.css';
import './App.css';
import MatchSetup from './components/MatchSetup';
import LiveMatch from './components/LiveMatch';
import MatchResult from './components/MatchResult';
import Header from './components/Header';
import { simulateMatch } from './engine/simulator';
import { TEAMS } from './engine/teams';

function App() {
  const [screen, setScreen] = useState('setup'); // 'setup' | 'live' | 'result'
  const [matchConfig, setMatchConfig] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [liveState, setLiveState] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleStartMatch = useCallback((config) => {
    setMatchConfig(config);
    setScreen('live');
    setIsSimulating(true);

    const team1 = TEAMS[config.team1];
    const team2 = TEAMS[config.team2];

    // Run simulation
    const result = simulateMatch({
      team1,
      team2,
      format: config.format,
      stadium: config.stadium,
    });

    setMatchData(result);
    setIsSimulating(false);
  }, []);

  const handleShowResult = useCallback(() => {
    setScreen('result');
  }, []);

  const handleNewMatch = useCallback(() => {
    setScreen('setup');
    setMatchConfig(null);
    setMatchData(null);
    setLiveState(null);
  }, []);

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-gradient-orbs" />
      <div className="app-container">
        <Header onNewMatch={handleNewMatch} currentScreen={screen} />
        <main>
          {screen === 'setup' && (
            <MatchSetup onStartMatch={handleStartMatch} />
          )}
          {screen === 'live' && matchData && (
            <LiveMatch
              matchData={matchData}
              config={matchConfig}
              onShowResult={handleShowResult}
            />
          )}
          {screen === 'result' && matchData && (
            <MatchResult
              matchData={matchData}
              config={matchConfig}
              onNewMatch={handleNewMatch}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default App;
