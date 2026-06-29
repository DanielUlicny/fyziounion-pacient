// app/settings.jsx — patient settings
// Exports to window: SettingsScreen

function Switch({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width: 50, height: 30, borderRadius: 15, border: "none", cursor: "pointer",
      background: on ? "var(--accent)" : "var(--switch-off)", position: "relative", transition: "background .22s ease", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: "50%",
        background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left .22s cubic-bezier(.4,0,.2,1)" }} />
    </button>);

}

function Card({ children, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--line)",
      boxShadow: "0 2px 10px rgba(30,40,70,0.04)", overflow: "hidden", ...style }}>{children}</div>);

}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 12.5, fontWeight: 650, color: "var(--muted)", letterSpacing: 0.3,
    textTransform: "uppercase", padding: "0 4px 8px" }}>{children}</div>;
}

function Row({ children, last, onClick, style }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
      borderBottom: last ? "none" : "1px solid var(--line)", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>);

}

function SettingsScreen({ onLogout }) {
  const [days, setDays] = React.useState({ ...FYZIO.activeDays });
  const [notif, setNotif] = React.useState(true);
  const [time, setTime] = React.useState(FYZIO.reminderTime);
  const [pickTime, setPickTime] = React.useState(false);
  const order = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  const maxDays = FYZIO.program.minDays || 0; // therapist-prescribed number of days
  const selectedCount = order.filter((d) => days[d]).length;
  const atCap = selectedCount >= maxDays;
  const meetsMin = selectedCount === maxDays;
  const dni = (n) => n === 1 ? "deň" : n >= 2 && n <= 4 ? "dni" : "dní";
  const toggleDay = (d) => setDays((s) => {
    if (!s[d] && atCap) return s; // can't pick more than prescribed
    return { ...s, [d]: !s[d] };
  });

  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ padding: "10px 20px 6px" }}>
        <div style={{ fontSize: 26, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.5 }}>Nastavenia</div>
      </div>

      <div style={{ padding: "14px 20px 8px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Profile */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(150deg, var(--accent-light), var(--accent))", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>
              {FYZIO.patient.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 720, color: "var(--ink)" }}>{FYZIO.patient.name}</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>Pacient · {FYZIO.program.name}</div>
            </div>
          </div>
        </Card>

        {/* Therapists + their programs (grouped, like the programs screen) */}
        <div>
          <SectionLabel>Vaši fyzioterapeuti</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FYZIO.therapists.
              map((th) => ({ th, programs: FYZIO.programs.filter((p) => p.therapistId === th.id) })).
              filter((g) => g.programs.length > 0).
              map(({ th, programs }) =>
              <Card key={th.id}>
                  {/* therapist header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  borderBottom: "1px solid var(--line)", background: "var(--accent-wash)" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    background: "var(--accent)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 720 }}>{th.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{th.name}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 1 }}>{th.clinic}</div>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)", background: "#fff",
                    borderRadius: 9, padding: "6px 11px" }}>Kontakt</span>
                  </div>
                  {/* their programs */}
                  {programs.map((p, i) =>
                <Row key={p.id} last={i === programs.length - 1}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: p.active ? "var(--accent-wash)" : "var(--chip)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name={p.progress >= 1 ? "award" : "activity"} size={19} stroke={p.active ? "var(--accent)" : "var(--faint)"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 650, color: "var(--ink)" }}>{p.name}</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>{p.week}</div>
                      </div>
                      {p.active ?
                  <span style={{ fontSize: 12, fontWeight: 650, color: "var(--ok-ink)", background: "var(--ok-wash)", borderRadius: 8, padding: "5px 9px" }}>Aktívny</span> :
                  p.progress >= 1 ?
                  <span style={{ fontSize: 12, fontWeight: 650, color: "var(--muted)", background: "var(--chip)", borderRadius: 8, padding: "5px 9px" }}>Dokončený</span> :
                  <Icon name="check" size={18} stroke="var(--faint)" />}
                    </Row>
                )}
                </Card>
              )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 4px 0", fontSize: 12.5, color: "var(--faint)" }}>
            <Icon name="info" size={14} stroke="var(--faint)" />
            Programy vytvára a upravuje váš fyzioterapeut.
          </div>
        </div>

        {/* Active days */}
        <div>
          <SectionLabel>Aktívne tréningové dni</SectionLabel>
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                Vybraté dni cvičenia
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 650, borderRadius: 9, padding: "5px 10px",
                  color: meetsMin ? "var(--ok-ink)" : "var(--accent)",
                  background: meetsMin ? "var(--ok-wash)" : "var(--accent-wash)" }}>
                {selectedCount} / {maxDays}
              </span>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              {order.map((d) => {
                  const on = days[d];
                  const locked = !on && atCap;
                  return (
                    <button key={d} onClick={() => toggleDay(d)} disabled={locked}
                    style={{ flex: 1, aspectRatio: "1", borderRadius: 12, cursor: locked ? "default" : "pointer", fontFamily: "inherit",
                      fontSize: 13.5, fontWeight: 650, border: on ? "none" : "1.5px solid var(--line)",
                      background: on ? "var(--accent)" : "#fff", color: on ? "#fff" : locked ? "var(--faint)" : "var(--muted)",
                      opacity: locked ? 0.45 : 1, transition: "all .15s ease" }}>{d}</button>);

                })}
            </div>
          </Card>
        </div>

        {/* Reminders — label + toggle on top, time below (like the active-days card) */}
        <div>
          <SectionLabel>Pripomienky</SectionLabel>
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                marginBottom: notif ? 14 : 0 }}>
              <span style={{ fontSize: 15.5, fontWeight: 650, color: "var(--ink)" }}>Čas pripomienky</span>
              <Switch on={notif} onToggle={() => {
                  setNotif((v) => !v);
                }} />
            </div>
            {notif &&
              <button onClick={() => setPickTime(true)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, border: "none",
                background: "var(--chip)", borderRadius: 14, padding: "12px 14px", cursor: "pointer",
                fontFamily: "inherit", textAlign: "left" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="bell" size={20} stroke="var(--accent)" />
                </div>
                <span style={{ flex: 1, minWidth: 0, fontSize: 24, fontWeight: 760, color: "var(--ink)",
                  letterSpacing: -0.3, fontVariantNumeric: "tabular-nums" }}>{time}</span>
                <Icon name="chevronDown" size={18} stroke="var(--faint)" style={{ transform: "rotate(-90deg)" }} />
              </button>
              }
          </Card>
        </div>

        {/* Logout */}
        <button onClick={onLogout} style={{ width: "100%", border: "1px solid var(--line)", background: "#fff",
            borderRadius: 16, padding: "15px", cursor: "pointer", fontFamily: "inherit", fontSize: 15.5, fontWeight: 650,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "rgb(69, 90, 116)" }}>
          <Icon name="logout" size={19} stroke="var(--accent)" /> Odhlásiť sa
        </button>
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--faint)", paddingBottom: 4 }}>fyzio · verzia 1.0</div>
      </div>
      </div>

      <TimeWheelSheet open={pickTime} value={time}
      onClose={() => setPickTime(false)}
      onConfirm={(v) => {setTime(v);setPickTime(false);}} />
    </div>);

}

Object.assign(window, { SettingsScreen });