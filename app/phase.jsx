// app/phase.jsx — euneo-style program overview + reminders/days setup
// Exports to window: PhaseIntro

function MetaText({ items }) {
  return (
    <div style={{ fontSize: 15, color: "var(--muted)", fontWeight: 500, lineHeight: 1.5 }}>
      {items.join(" · ")}
    </div>);

}

function Divider() {
  return <div style={{ height: 1, background: "var(--line)", margin: "20px 0" }} />;
}

function PhaseRow({ name, dur }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12,
      border: "1px solid var(--line)", borderRadius: 12, padding: "20px 18px", background: "#fff" }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.3 }}>{name}</span>
      <span style={{ flexShrink: 0, fontSize: 14.5, fontWeight: 500, color: "var(--muted)" }}>{dur}</span>
    </div>
  );
}

function PhaseSwitch({ on, onToggle }) {
  return (
    <button onClick={onToggle} aria-label="Prepnúť pripomienku" style={{ width: 52, height: 31, borderRadius: 12, border: "none",
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
  // wrap-around: three copies of the list, jump back to the middle at the edges
  const reps = 3;
  const loop = React.useMemo(() => Array.from({ length: values.length * reps }, (_, i) => values[i % values.length]), [values]);
  const mid = values.length;
  React.useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = (mid + Math.max(0, values.indexOf(value))) * ITEM_H;
  }, []);
  const onScroll = () => {
    clearTimeout(tmr.current);
    tmr.current = setTimeout(() => {
      const el = ref.current; if (!el) return;
      let idx = Math.round(el.scrollTop / ITEM_H);
      if (idx < values.length * 0.5) { idx += values.length; el.scrollTop = idx * ITEM_H; }
      else if (idx > values.length * (reps - 0.5)) { idx -= values.length; el.scrollTop = idx * ITEM_H; }
      const v = values[((idx % values.length) + values.length) % values.length];
      if (v !== value) onChange(v);
    }, 80);
  };
  return (
    <div ref={ref} onScroll={onScroll} style={{ height: ITEM_H * 5, overflowY: "auto",
      scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch", flex: 1, position: "relative" }}>
      <div style={{ height: ITEM_H * 2 }} />
      {loop.map((v, i) => {
        const sel = v === value;
        return (
          <div key={i} style={{ height: ITEM_H, scrollSnapAlign: "center", display: "flex",
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
    if (open) { const [hh, mm] = (value || "18:00").split(":"); setH(parseInt(hh, 10)); setM(Math.round(parseInt(mm, 10) / 5) * 5 % 60); }
  }, [open]);
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const mins = React.useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []);
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,28,45,0.34)" }} />
      <div className="fz-sheet-up" style={{ position: "absolute", left: 0, right: 0, bottom: 0,
        background: "#fff", borderRadius: "26px 26px 0 0",
        boxShadow: "0 -10px 40px rgba(20,28,55,0.18)",
        padding: "12px 22px calc(26px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "0 auto 14px" }} />
        <div style={{ fontSize: 21, fontWeight: 760, color: "var(--ink)", textAlign: "center", marginBottom: 8 }}>Vyberte čas pripomienky</div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", margin: "8px 0 16px" }}>
          {/* center highlight band */}
          <div style={{ position: "absolute", left: 0, right: 0, top: ITEM_H * 2, height: ITEM_H,
            background: "var(--chip)", borderRadius: 6, pointerEvents: "none" }} />
          <Wheel values={hours} value={h} onChange={setH} pad2 />
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", padding: "0 2px" }}>:</div>
          <Wheel values={mins} value={m} onChange={setM} pad2 />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 6, background: "#fff",
            padding: "16px 18px", fontSize: 16.5, fontWeight: 650, fontFamily: "inherit", color: "var(--ink)", cursor: "pointer" }}>Zrušiť</button>
          <PrimaryButton style={{ flex: 1, width: "auto" }}
            onClick={() => onConfirm(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)}>Potvrdiť</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: reminders + training days ────────────────────────
function SetupStep({ program, onStart, onBack }) {
  const p = program;
  const order = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  const [days, setDays] = React.useState({ ...FYZIO.progActiveDays(p) });
  const [notif, setNotif] = React.useState(true);
  const [time, setTime] = React.useState(FYZIO.reminderTime);
  const [pickTime, setPickTime] = React.useState(false);
  const minRequired = p.minDays || 0;         // therapist-prescribed MINIMUM
  const fixedByTherapist = !!p.daysFixed;     // therapist set the days themselves
  const count = order.filter((d) => days[d]).length;
  const meets = count >= minRequired;
  const missing = Math.max(0, minRequired - count);

  const toggleDay = (d) => { if (fixedByTherapist) return; setDays((s) => ({ ...s, [d]: !s[d] })); };

  const start = () => {
    if (!meets) return;
    if (p) p.activeDays = { ...days };
    FYZIO.activeDays = { ...days };
    FYZIO.reminderTime = time;
    onStart && onStart();
  };

  const card = { background: "#fff", borderRadius: 12, padding: 18, border: "1px solid var(--line)",
    boxShadow: "0 2px 10px rgba(30,40,70,0.04)" };

  return (
    <div className="fz-fade" style={{ height: "100%", position: "relative", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <div style={{ flexShrink: 0, padding: "54px 22px 6px" }}>
        <button onClick={onBack} aria-label="Späť" style={{
          width: 40, height: 40, borderRadius: 6, border: "1px solid var(--line)", background: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="chevL" size={21} stroke="var(--ink)" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch",
        padding: "16px 22px calc(96px + max(env(safe-area-inset-bottom), 26px))" }}>
        <div style={{ fontSize: 28, fontWeight: 780, color: "var(--ink)", letterSpacing: -0.6, lineHeight: 1.15, marginBottom: 8 }}>
          Nastavte si režim
        </div>
        <div style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.45, marginBottom: 22 }}>
          Vyberte dni, kedy budete cvičiť, a čas pripomienky.
        </div>

        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 720, color: "var(--ink)" }}>Dni cvičenia</span>
            {!fixedByTherapist &&
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
              Vybraté {count} · minimum {minRequired}.
            </span>}
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {order.map((d) => {
              const on = days[d];
              return (
                <button key={d} onClick={() => toggleDay(d)} disabled={fixedByTherapist}
                  style={{ flex: 1, aspectRatio: "1", borderRadius: 6, cursor: fixedByTherapist ? "default" : "pointer", fontFamily: "inherit",
                    fontSize: 14, fontWeight: 650, border: on ? "none" : "1px solid var(--line)",
                    background: on ? "var(--accent)" : "#fff", color: on ? "#fff" : "var(--muted)",
                    transition: "background .15s ease, color .15s ease" }}>{d}</button>);

            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.4, color: "var(--muted)",
            display: "flex", gap: 7, alignItems: "flex-start" }}>
            <Icon name="info" size={15} stroke="var(--muted)" style={{ flexShrink: 0, marginTop: 1 }} />
            {fixedByTherapist ?
            <span>Dni cvičenia určil váš fyzioterapeut.</span> :
            <span>
              Váš fyzioterapeut odporučil aspoň {minRequired} dni v týždni. Môžete si vybrať aj viac.
              {missing > 0 &&
              <span style={{ display: "block", marginTop: 4, fontWeight: 650, color: "var(--text)" }}>
                Vyberte ešte {missing} {missing === 1 ? "deň" : missing < 5 ? "dni" : "dní"}.
              </span>}
            </span>}
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

      <div style={{ flexShrink: 0, padding: "12px 22px calc(12px + max(env(safe-area-inset-bottom), 26px))",
        borderTop: "1px solid var(--line)", background: "#fff" }}>
        <PrimaryButton onClick={start} disabled={!meets}>Začať cvičiť</PrimaryButton>
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
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 50, background: "var(--bg)", zIndex: 5 }} />

      <div style={{ flexShrink: 0, padding: "54px 18px 0", position: "relative", zIndex: 6 }}>
        <button onClick={onBack} aria-label="Späť" style={{
          width: 40, height: 40, borderRadius: 6, border: "1px solid var(--line)", background: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="chevL" size={21} stroke="var(--ink)" />
        </button>
      </div>

      <div style={{ position: "absolute", top: 106, left: 0, right: 0, bottom: 0,
        background: "#fff", display: "flex", flexDirection: "column" }}>

        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "18px 22px 18px" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: -0.8, lineHeight: 1.05 }}>{p.name}</div>

          <div style={{ marginTop: 14 }}>
            <MetaText items={[`${p.weeksTotal} ${tyzdne(p.weeksTotal)}`, `${p.phaseTotal} ${fazy(p.phaseTotal)}`]} />
          </div>

          <Divider />

          {/* equipment */}
          <div style={{ fontSize: 21, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.3, marginBottom: 10 }}>Vybavenie</div>
          <MetaText items={p.equipment && p.equipment.length ? p.equipment : ["Žiadne"]} />

          <Divider />

          {/* phases */}
          <div style={{ fontSize: 21, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.3, marginBottom: 14 }}>Fázy</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {p.phases.map((ph, i) => <PhaseRow key={i} name={`Fáza ${i + 1}`} dur={ph.dur} />)}
          </div>

          <div style={{ height: "calc(74px + max(env(safe-area-inset-bottom), 16px))" }} />
        </div>

        {/* CTA */}
        <div style={{ flexShrink: 0, padding: "12px 22px calc(12px + max(env(safe-area-inset-bottom), 26px))",
          borderTop: "1px solid var(--line)", background: "#fff" }}>
          <PrimaryButton onClick={() => setStep("setup")}>Začať program</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PhaseIntro, PhaseSwitch, TimeWheelSheet });
