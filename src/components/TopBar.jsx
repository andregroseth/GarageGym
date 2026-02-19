export default function TopBar({ isDark, onToggleDark }) {
  return (
    <header className="aksel-internalheader gg-topbar">
      <div className="aksel-pageblock aksel-pageblock--md aksel-pageblock--gutters gg-topbar-inner">
        <div className="gg-topbar-title">
          <span className="aksel-heading aksel-heading--xsmall">GarageGym</span>
        </div>

        <div className="gg-topbar-spacer"></div>

        <label className="aksel-switch aksel-switch--small gg-theme-switch">
          <input
            className="aksel-switch__input"
            type="checkbox"
            checked={isDark}
            onChange={(e) => onToggleDark(e.target.checked)}
          />
          <span className="aksel-switch__track" aria-hidden="true"></span>
          <span className="aksel-switch__label-wrapper">
            <span className="aksel-switch__content">
              <span className="aksel-body-short aksel-body-short--small">
                Dark mode
              </span>
            </span>
          </span>
        </label>
      </div>
    </header>
  )
}
