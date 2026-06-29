// app/onboarding.jsx — post-login setup: training days + reminder time
// Exports to window: OnboardingScreen

function OnbDayGrid({ days, setDays }) {
  const order = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {order.map((d) => {
        const on = days[d];
        return (
          <button key={d} onClick={() => setDays((s) => ({ ...s, [d]: !s[d] }))}
            style={{ flex: 1, aspectRatio: "1", borderRadius: 13, cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: 650, border: on ? "none" : "1.5px solid var(--line)",
              background: on ? "var(--accent)" : "#fff", color: on ? "#fff" : "var(--muted)",
              boxShadow: "none",
              transition: "all .15s ease" }}>{d}</button>
        );
      })}
    </div>
  );
}

function OnbStepBadge({ n }) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: 9, background: "var(--accent)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{n}</div>
  );
}

function OnboardingScreen({ onComplete }) {
  const order = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  const times = ["08:00", "12:00", "17:00", "18:00", "20:00"];
  const [days, setDays] = React.useState({ ...FYZIO.activeDays });
  const [time, setTime] = React.useState(FYZIO.reminderTime);
  const minDays = FYZIO.program.minDays || 0;
  const count = order.filter((d) => days[d]).length;
  const meets = count >= minDays;

  const finish = () => {
    if (!meets) return;
    FYZIO.activeDays = { ...days };
    FYZIO.reminderTime = time;
    onComplete && onComplete();
  };

  const cardStyle = { background: "#fff", borderRadius: 22, padding: 18, border: "1px solid var(--line)",
    boxShadow: "0 2px 10px rgba(30,40,70,0.04)" };

  return (
    <div className="fz-fade" style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "66px 22px 16px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--accent-wash)",
            borderRadius: 999, padding: "6px 12px", marginBottom: 14 }}>
            <Icon name="spark" size={15} stroke="var(--accent)" />
            <span style={{ fontSize: 12.5, fontWeight: 650, color: "var(--accent)" }}>Nastavenie</span>
          </div>
          <div style={{ fontSize: 27, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.6, lineHeight: 1.15 }}>
            Poďme si nastaviť<br />váš tréningový režim
          </div>
          <div style={{ fontSize: 14.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.45 }}>
            Vyberte dni, kedy budete cvičiť, a čas, kedy vám pripomenieme cvičenie.
          </div>
        </div>

        {/* Step 1: training days */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <OnbStepBadge n="1" />
              <span style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)" }}>Tréningové dni</span>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 650, borderRadius: 9, padding: "5px 10px", whiteSpace: "nowrap", flexShrink: 0,
              color: meets ? "var(--ok-ink)" : "var(--danger)",
              background: meets ? "var(--ok-wash)" : "color-mix(in srgb, var(--danger) 12%, white)" }}>
              {count} / {minDays} dni
            </span>
          </div>
          <OnbDayGrid days={days} setDays={setDays} />
          <div style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.4,
            color: meets ? "var(--muted)" : "var(--danger)", display: "flex", gap: 7, alignItems: "flex-start" }}>
            {!meets && <Icon name="info" size={15} stroke="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />}
            <span>{meets
              ? "Pripomienky dostanete iba vo vybraté dni."
              : `Váš fyzioterapeut odporúča aspoň ${minDays} dni v týždni. Vyberte ešte ${minDays - count}.`}</span>
          </div>
        </div>

        {/* Step 2: reminder time */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <OnbStepBadge n="2" />
            <span style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)" }}>Čas pripomienky</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 7 }}>
            {times.map((tm) => {
              const sel = tm === time;
              return (
                <button key={tm} onClick={() => setTime(tm)}
                  style={{ padding: "12px 0", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13.5, fontWeight: sel ? 700 : 600,
                    border: sel ? "none" : "1.5px solid var(--line)",
                    background: sel ? "var(--accent)" : "#fff",
                    color: sel ? "#fff" : "var(--muted)",
                    boxShadow: "none",
                    transition: "all .15s ease" }}>{tm}</button>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12, fontSize: 13, color: "var(--muted)" }}>
            <Icon name="bell" size={15} stroke="var(--muted)" />
            Pripomenieme vám cvičenie každý vybratý deň o {time}.
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ flexShrink: 0, padding: "12px 22px 30px", borderTop: "1px solid var(--line)",
        background: "#fff" }}>
        <PrimaryButton onClick={finish} disabled={!meets} icon="check">Dokončiť nastavenie</PrimaryButton>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen });
