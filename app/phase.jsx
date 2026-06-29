// app/phase.jsx — euneo-style program overview + reminders/days setup
// Exports to window: PhaseIntro

function Chip({ children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap",
      border: "1px solid var(--line)", background: "#fff", borderRadius: 11,
      padding: "9px 14px", fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{children}</span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--line)", margin: "20px 0" }} />;
}

function PhaseRow({ name, dur }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12,
      border: "1px solid var(--line)", borderRadius: 16, padding: "20px 18px", background: "#fff" }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.3 }}>{name}</span>
      <span style={{ flexShrink: 0, border: "1px solid var(--line)", borderRadius: 10, padding: "6px 12px",
        fontSize: 14, fontWeight: 600, color: "var(--text)", background: "var(--bg)" }}>{dur}</span>
    </div>
  );
}

function PhaseSwitch({ on, onToggle }) {
  return (
    <button onClick={onToggle} aria-label="Prepnúť pripomienku" style={{ width: 52, height: 31, borderRadius: 16, border: "none",
      cursor: "pointer", flexShrink: 0, padding: 0, background: on ? "var(--accent)" : "var(--switch-off)",
      position: "relative", transition: "background .22s ease" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 24 : 3, width: 25, height: 25, borderRadius: "50%",
        background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.22)", transition: "left .22s cubic-bezier(.4,0,.2,1)" }} />
    </button>
  );
}

// ── Scroll-wheel time picker (hh : mm) ───────────────────────
const ITEM_H = 44;
function Wheel({ values, value, onChange, pad2 }) {
  const ref = React.useRef(null);
  const tmr = React.useRef(null);
  React.useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = Math.max(0, values.indexOf(value)) * ITEM_H;
  }, []);
  const onScroll = () => {
    clearTimeout(tmr.current);
    tmr.current = setTimeout(() => {
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const v = values[Math.max(0, Math.min(values.length - 1, idx))];
      if (v !== value) onChange(v);
    }, 80);
  };
  return (
    <div ref={ref} onScroll={onScroll} style={{ height: ITEM_H * 5, overflowY: "auto",
      scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch", flex: 1, position: "relative" }}>
      <div style={{ height: ITEM_H * 2 }} />
      {values.map((v) => {
        const sel = v === value;
        return (
          <div key={v} style={{ height: ITEM_H, scrollSnapAlign: "center", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: sel ? 30 : 24, fontWeight: sel ? 700 : 500,
            color: sel ? "var(--ink)" : "var(--faint)", fontVariantNumeric: "tabular-nums",
            transition: "font-size .12s ease, color .12s ease" }}>{pad2 ? String(v).padStart(2, "0") : v}</div>
        );
      })}
      <div style={{ height: ITEM_H * 2 }} />
    </div>
  );
}

function TimeWheelSheet({ open, value, onClose, onConfirm }) {
  const [h, setH] = React.useState(parseInt((value || "18:00").split(":")[0], 10));
  const [m, setM] = React.useState(parseInt((value || "18:00").split(":")[1], 10));
  React.useEffect(() => {
    if (open) { const [hh, mm] = (value || "18:00").split(":"); setH(parseInt(hh, 10)); setM(parseInt(mm, 10)); }
  }, [open]);
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const mins = React.useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, pointerEvents: open ? "auto" : "none" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "transparent" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0,
        background: "#fff", borderRadius: "26px 26px 0 0",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform .32s cubic-bezier(.32,.72,0,1)",
        boxShadow: "0 -10px 40px rgba(20,28,55,0.18)",
        padding: "12px 22px calc(26px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "0 auto 14px" }} />
        <div style={{ fontSize: 21, fontWeight: 760, color: "var(--ink)", textAlign: "center", marginBottom: 8 }}>Vyberte čas pripomienky</div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", margin: "8px 0 16px" }}>
          {/* center highlight band */}
          <div style={{ position: "absolute", left: 0, right: 0, top: ITEM_H * 2, height: ITEM_H,
            background: "var(--chip)", borderRadius: 14, pointerEvents: "none" }} />
          <Wheel values={hours} value={h} onChange={setH} pad2 />
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", padding: "0 2px" }}>:</div>
          <Wheel values={mins} value={m} onChange={setM} pad2 />
        </div>

        <PrimaryButton onClick={() => onConfirm(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)}>Potvrdiť</PrimaryButton>
      </div>
    </div>
  );
}

// ── Step 2: reminders + training days ────────────────────────
function SetupStep({ program, onStart, onBack }) {
  const p = program;
  const order = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  const [days, setDays] = React.useState({ ...FYZIO.activeDays });
  const [notif, setNotif] = React.useState(true);
  const [time, setTime] = React.useState(FYZIO.reminderTime);
  const [pickTime, setPickTime] = React.useState(false);
  const maxDays = p.minDays || 0;             // therapist-prescribed number of training days
  const count = order.filter((d) => days[d]).length;
  const meets = count === maxDays;            // must pick exactly the prescribed number
  const atCap = count >= maxDays;

  const toggleDay = (d) => setDays((s) => {
    if (!s[d] && atCap) return s;             // can't select more than prescribed
    return { ...s, [d]: !s[d] };
  });

  const start = () => {
    if (!meets) return;
    FYZIO.activeDays = { ...days };
    FYZIO.reminderTime = time;
    onStart && onStart();
  };

  const card = { background: "#fff", borderRadius: 22, padding: 18, border: "1px solid var(--line)",
    boxShadow: "0 2px 10px rgba(30,40,70,0.04)" };

  return (
    <div className="fz-fade" style={{ height: "100%", position: "relative", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <div style={{ flexShrink: 0, padding: "54px 22px 6px" }}>
        <button onClick={onBack} aria-label="Späť" style={{
          width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--line)", background: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="chevL" size={21} stroke="var(--ink)" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "16px 22px 16px" }}>
        <div style={{ fontSize: 28, fontWeight: 780, color: "var(--ink)", letterSpacing: -0.6, lineHeight: 1.15, marginBottom: 8 }}>
          Nastavte si režim
        </div>
        <div style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.45, marginBottom: 22 }}>
          Vyberte dni, kedy budete cvičiť, a čas pripomienky.
        </div>

        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 720, color: "var(--ink)" }}>Dni cvičenia</span>
            <span style={{ fontSize: 12.5, fontWeight: 650, borderRadius: 9, padding: "5px 10px", whiteSpace: "nowrap", flexShrink: 0,
              color: meets ? "var(--ok-ink)" : "var(--accent)",
              background: meets ? "var(--ok-wash)" : "var(--accent-wash)" }}>
              {count} / {maxDays}
            </span>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {order.map((d) => {
              const on = days[d];
              const locked = !on && atCap;
              return (
                <button key={d} onClick={() => toggleDay(d)} disabled={locked}
                  style={{ flex: 1, aspectRatio: "1", borderRadius: 13, cursor: locked ? "default" : "pointer", fontFamily: "inherit",
                    fontSize: 14, fontWeight: 650, border: on ? "none" : "1.5px solid var(--line)",
                    background: on ? "var(--accent)" : "#fff", color: on ? "#fff" : locked ? "var(--faint)" : "var(--muted)",
                    opacity: locked ? 0.45 : 1, transition: "all .15s ease" }}>{d}</button>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.4, color: "var(--muted)",
            display: "flex", gap: 7, alignItems: "flex-start" }}>
            <Icon name="info" size={15} stroke="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{meets
              ? "Vybrali ste všetky dni, ktoré vám určil fyzioterapeut."
              : `Váš fyzioterapeut určil ${maxDays} dni v týždni — viac vybrať nemôžete.`}</span>
          </div>
        </div>

        {/* reminder: time on the left, on/off toggle on the right */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => notif && setPickTime(true)} disabled={!notif}
              style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12,
                border: "none", background: "none", cursor: notif ? "pointer" : "default", fontFamily: "inherit",
                textAlign: "left", padding: 0, opacity: notif ? 1 : 0.45 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "var(--accent-wash)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="bell" size={21} stroke="var(--accent)" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Čas pripomienky</div>
                <div style={{ fontSize: 24, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.3,
                  fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "center", gap: 6 }}>
                  {notif ? time : "—"}
                  {notif && <Icon name="chevronDown" size={17} stroke="var(--faint)" />}
                </div>
              </div>
            </button>
            <PhaseSwitch on={notif} onToggle={() => setNotif((v) => !v)} />
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: "12px 22px 30px", borderTop: "1px solid var(--line)", background: "#fff" }}>
        <PrimaryButton onClick={start} disabled={!meets} icon="play">Začať cvičiť</PrimaryButton>
      </div>

      <TimeWheelSheet open={pickTime} value={time}
        onClose={() => setPickTime(false)}
        onConfirm={(v) => { setTime(v); setPickTime(false); }} />
    </div>
  );
}

// ── Step 1: program overview (euneo style) ───────────────────
function PhaseIntro({ program, onStart, onBack }) {
  const p = program || FYZIO.programs[0];
  const [step, setStep] = React.useState("overview");

  const tyzdne = (n) => (n === 1 ? "týždeň" : n >= 2 && n <= 4 ? "týždne" : "týždňov");
  const fazy = (n) => (n === 1 ? "fáza" : n >= 2 && n <= 4 ? "fázy" : "fáz");

  if (step === "setup") {
    return <SetupStep program={p} onStart={onStart} onBack={() => setStep("overview")} />;
  }

  return (
    <div className="fz-fade" style={{ height: "100%", position: "relative", background: "var(--bg)", overflow: "hidden" }}>

      {/* hero image */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 330 }}>
        <image-slot id={`phase-hero-${p.id}`} shape="rect" fit="cover"
          placeholder="Pretiahnite sem fotku cviku"
          style={{ width: "100%", height: "100%", display: "block" }}></image-slot>
      </div>

      {/* floating controls */}
      <button onClick={onBack} aria-label="Späť" style={{
        position: "absolute", top: 56, left: 18, zIndex: 30,
        width: 42, height: 42, borderRadius: "50%", border: "none", cursor: "pointer",
        background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 10px rgba(20,28,55,0.14)" }}>
        <Icon name="chevL" size={22} stroke="var(--ink)" />
      </button>
      <button onClick={onBack} aria-label="Zavrieť" style={{
        position: "absolute", top: 56, right: 18, zIndex: 30,
        width: 42, height: 42, borderRadius: "50%", border: "none", cursor: "pointer",
        background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 10px rgba(20,28,55,0.14)" }}>
        <Icon name="x" size={20} stroke="var(--ink)" />
      </button>

      {/* sheet overlapping the hero */}
      <div style={{ position: "absolute", top: 306, left: 0, right: 0, bottom: 0,
        background: "#fff", borderRadius: "26px 26px 0 0", display: "flex", flexDirection: "column",
        boxShadow: "0 -10px 40px rgba(20,28,55,0.14)" }}>

        <div style={{ flexShrink: 0, width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "10px auto 0" }} />

        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "18px 22px 18px" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: -0.8, lineHeight: 1.05 }}>{p.name}</div>

          {/* meta chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 18 }}>
            <Chip>{p.weeksTotal} {tyzdne(p.weeksTotal)}</Chip>
            <Chip>{p.phaseTotal} {fazy(p.phaseTotal)}</Chip>
          </div>

          <Divider />

          {/* equipment */}
          <div style={{ fontSize: 21, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.3, marginBottom: 14 }}>Vybavenie</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            {(p.equipment && p.equipment.length ? p.equipment : ["Žiadne"]).map((e) => <Chip key={e}>{e}</Chip>)}
          </div>

          <Divider />

          {/* phases */}
          <div style={{ fontSize: 21, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.3, marginBottom: 14 }}>Fázy</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {p.phases.map((ph, i) => <PhaseRow key={i} name={`Fáza ${i + 1}`} dur={ph.dur} />)}
          </div>

          <div style={{ height: 4 }} />
        </div>

        {/* CTA */}
        <div style={{ flexShrink: 0, padding: "12px 22px 30px", borderTop: "1px solid var(--line)", background: "#fff" }}>
          <PrimaryButton onClick={() => setStep("setup")}>Začať program</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PhaseIntro, PhaseSwitch, TimeWheelSheet });
