export default function Header({ onNewMatch, currentScreen }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo" onClick={onNewMatch} role="button" tabIndex={0} id="logo-home">
          <span className="logo-icon">🏏</span>
          <span>CricSim</span>
        </div>
        <div className="header-actions">
          {currentScreen !== 'setup' && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={onNewMatch}
              id="btn-new-match"
            >
              ⚡ New Match
            </button>
          )}
          <span className="badge badge-primary">Advanced Engine</span>
        </div>
      </div>
    </header>
  );
}
