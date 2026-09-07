// onb/onb-ui.jsx — shared primitives for the FyzioUnion onboarding flow
// Exports to window: OIcon, GoogleLogo, AppleLogo, BrandLock, OField, OCheckbox,
//   ObHeader, NextButton, ProviderButton

// ── Icon subset (matches app/data.jsx line set) ──────────────
function OIcon({ name, size = 22, stroke = "currentColor", fill = "none", sw = 1.8, style }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24",
    fill, stroke, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", style };
  const P = {
    chevL: <path d="M15 5 8 12l7 7" />,
    chevR: <path d="m9 5 7 7-7 7" />,
    mail: <g><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4 7 8 6 8-6" /></g>,
    at: <g><circle cx="12" cy="12" r="3.6" /><path d="M15.6 12v1.4a2.4 2.4 0 0 0 4.8 0V12a8.4 8.4 0 1 0-3.3 6.7" /></g>,
    lock: <g><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
    eye: <g><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></g>,
    eyeOff: <g><path d="M4 4l16 16" /><path d="M9.5 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.4 3.1M6.2 7.7A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 2.8-.44" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></g>,
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
    checkCircle: <g><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></g>,
    user: <g><circle cx="12" cy="8.5" r="3.8" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></g>,
    calendar: <g><rect x="4" y="5.5" width="16" height="15" rx="2.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></g>,
    shield: <path d="M12 3.5 19 6v6c0 4.5-3 7-7 8.5C8 19 5 16.5 5 12V6l7-2.5Z" />,
    spark: <path d="M12 4l1.6 4.9L18.5 10l-4.9 1.6L12 16l-1.6-4.4L5.5 10l4.9-1.1L12 4Z" />,
    doc: <g><path d="M13 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10A1.5 1.5 0 0 0 18.5 19V9L13 3.5Z" /><path d="M13 3.5V9h5.5" /><path d="M8.5 13h7M8.5 16.5h5" /></g>,
    fileLock: <g><path d="M13 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10A1.5 1.5 0 0 0 18.5 19V9L13 3.5Z" /><path d="M13 3.5V9h5.5" /><rect x="9" y="13" width="6" height="4.5" rx="1" /><path d="M10.2 13v-1a1.8 1.8 0 0 1 3.6 0v1" /></g>,
    info: <g><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.8v.2" /></g>,
    alert: <g><path d="M12 4 3 19h18L12 4Z" /><path d="M12 10v4M12 16.6v.2" /></g>,
    activity: <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />,
    external: <g><path d="M14 4.5h5.5V10" /><path d="M19.5 4.5 11 13" /><path d="M18 13.5V18a1.8 1.8 0 0 1-1.8 1.8H6A1.8 1.8 0 0 1 4.2 18V7.8A1.8 1.8 0 0 1 6 6h4.5" /></g>,
    layers: <g><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5M3 8v5m18-5v5" /></g>,
    clock: <g><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></g>,
    x: <path d="M6 6l12 12M18 6L6 18" />,
  };
  return <svg {...common}>{P[name] || null}</svg>;
}

// ── Brand provider logos (visual only) ───────────────────────
function GoogleLogo({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
function AppleLogo({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#111" d="M13.62 9.56c-.02-1.8 1.47-2.66 1.53-2.7-.83-1.22-2.13-1.39-2.6-1.4-1.1-.11-2.16.65-2.72.65-.56 0-1.43-.63-2.35-.62-1.21.02-2.33.7-2.95 1.79-1.26 2.18-.32 5.42.9 7.19.6.87 1.31 1.84 2.24 1.8.9-.03 1.24-.58 2.33-.58 1.08 0 1.39.58 2.34.56.97-.02 1.58-.88 2.17-1.75.68-1 .96-1.97.98-2.02-.02-.01-1.87-.72-1.89-2.85zM11.84 4.3c.5-.6.83-1.44.74-2.28-.71.03-1.58.48-2.09 1.08-.46.53-.86 1.38-.75 2.2.79.06 1.6-.4 2.1-1z" />
    </svg>
  );
}

// ── Text field (mirrors app/login.jsx Field) ─────────────────
function OField({ icon, type = "text", value, onChange, placeholder, trailing,
  inputMode, maxLength, align = "left", autoFocus }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10,
      background: "#fff", borderRadius: 6, padding: icon ? "0 14px" : "0 16px", height: 54,
      border: `1px solid ${focus ? "var(--accent)" : "#EAEAEA"}`,
      boxShadow: focus ? "0 0 0 3px var(--accent-shadow)" : "none",
      transition: "border-color .15s ease, box-shadow .15s ease" }}>
      {icon && <OIcon name={icon} size={19} stroke={focus ? "var(--accent)" : "var(--faint)"} />}
      <input type={type} value={value} placeholder={placeholder} inputMode={inputMode}
        maxLength={maxLength} autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        autoCapitalize="none" autoCorrect="off" spellCheck="false"
        style={{ flex: 1, border: "none", outline: "none", background: "none", textAlign: align,
          fontFamily: "inherit", fontSize: 15.5, fontWeight: 500, color: "var(--ink)", minWidth: 0 }} />
      {trailing}
    </div>
  );
}

// ── Labeled group ────────────────────────────────────────────
function OLabel({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 650, color: "var(--text)", marginBottom: 8 }}>{children}</div>;
}

// ── Checkbox row ─────────────────────────────────────────────
function OCheckbox({ checked, onChange, children }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ display: "flex", gap: 12, alignItems: "flex-start",
      width: "100%", textAlign: "left", border: "none", background: "none", cursor: "pointer",
      fontFamily: "inherit", padding: 0 }}>
      <span style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${checked ? "var(--accent)" : "#EAEAEA"}`,
        background: checked ? "var(--accent)" : "#fff",
        transition: "all .15s ease" }}>
        {checked && <OIcon name="check" size={15} stroke="#fff" sw={2.4} />}
      </span>
      <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--muted)" }}>{children}</span>
    </button>
  );
}

// ── Header: back button + subtle step progress ───────────────
function ObHeader({ onBack, step, total }) {
  const pct = step && total ? (step / total) * 100 : 0;
  return (
    <div style={{ flexShrink: 0, padding: "48px 22px 6px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
        <button onClick={onBack} aria-label="Späť" style={{ width: 40, height: 40, borderRadius: 6,
          flexShrink: 0, border: "1px solid #EAEAEA", background: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <OIcon name="chevL" size={20} stroke="var(--text)" />
        </button>
        {step && total ? (
          <React.Fragment>
            <div style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--line)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: "var(--accent)",
                transition: "width .35s cubic-bezier(.4,0,.2,1)" }} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", flexShrink: 0,
              fontVariantNumeric: "tabular-nums" }}>Krok {step} z {total}</span>
          </React.Fragment>
        ) : <div style={{ flex: 1 }} />}
      </div>
    </div>
  );
}

// ── "Ďalšie" style button: grey when disabled, slate when active ──
function NextButton({ children, onClick, disabled, tone = "auto", icon }) {
  const active = !disabled;
  const bg = tone === "grey" ? "var(--gray-btn)"
    : active ? "var(--accent)" : "var(--gray-btn)";
  const fg = tone === "grey" ? "var(--gray-btn-ink)"
    : active ? "#fff" : "var(--gray-btn-ink)";
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: "100%", border: "none", borderRadius: 6,
      cursor: disabled ? "default" : "pointer", padding: "16px 18px", fontSize: 16.5, fontWeight: 650,
      fontFamily: "inherit", color: fg, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "background .2s ease, color .2s ease, transform .12s ease" }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.985)"; }}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
      {children}
      {icon && <OIcon name={icon} size={19} stroke={fg} />}
    </button>
  );
}

// ── Provider / method button (Email, Google, Apple) ──────────
function ProviderButton({ logo, children, onClick, variant = "outline" }) {
  const filled = variant === "filled";
  return (
    <button onClick={onClick} style={{ width: "100%", borderRadius: 6, cursor: "pointer",
      padding: "15px 18px", fontSize: 16, fontWeight: 620, fontFamily: "inherit",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 11, position: "relative",
      border: filled ? "none" : "1px solid #EAEAEA",
      background: filled ? "var(--accent)" : "#fff",
      color: filled ? "#fff" : "var(--ink)",
      transition: "transform .12s ease" }}
      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.985)"}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
      <span style={{ position: "absolute", left: 18, display: "flex" }}>{logo}</span>
      {children}
    </button>
  );
}

Object.assign(window, { OIcon, GoogleLogo, AppleLogo, OField, OLabel, OCheckbox, ObHeader, NextButton, ProviderButton });
