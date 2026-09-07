// app/programs.jsx — programs grouped by the therapist who assigned them
// Exports to window: ProgramsScreen, ProgramList

const PG_PILL = {
  running: { label: "Prebieha", bg: "#EDF3EC", ink: "#346538" },
  waiting: { label: "Pripravený", bg: "#FBF1D8", ink: "#8A6600" },
  paused: { label: "Pozastavený", bg: "#FBF1D8", ink: "#8A6600" },
  done: { label: "Dokončené", bg: "#EEF2F5", ink: "#64757D" } };

const pgState = (p) => p.state || (p.progress >= 1 ? "done" : "running");
const pgCviky = (n) => n === 1 ? "cvik" : n < 5 ? "cviky" : "cvikov";

// today's line — the loudest thing in the row
function pgToday(p) {
  if (pgState(p) !== "running") return null;
  if (!FYZIO.isTrainingToday(p)) return "Dnes · voľno";
  const t = p.today || {};
  if (t.kind === "done") return "Dnes · hotovo";
  const n = t.count || p.exCount;
  return `Dnes · ${n} ${pgCviky(n)}`;
}

// secondary line for programs that have no "today"
function pgSecondary(p) {
  const s = pgState(p);
  if (s === "paused") return "Program dočasne pozastavil váš fyzioterapeut.";
  if (s === "done") return p.endDate ? `Ukončené ${p.endDate}` : "Ukončené";
  if (s === "waiting") return "Začnite, keď vám to vyhovuje.";
  return `${p.phase} · ${p.week}`;
}

// touch-down highlight, action on touch-up, drag-away cancels, ~10px slop
function usePressAction(onAction) {
  const [pressed, setPressed] = React.useState(false);
  const ref = React.useRef(null);
  const near = (e) => {
    const r = ref.current && ref.current.getBoundingClientRect();
    if (!r) return false;
    const s = 10;
    return e.clientX >= r.left - s && e.clientX <= r.right + s &&
    e.clientY >= r.top - s && e.clientY <= r.bottom + s;
  };
  return { ref, pressed, handlers: {
      onPointerDown: () => setPressed(true),
      onPointerMove: (e) => { if (pressed && !near(e)) setPressed(false); },
      onPointerUp: (e) => { const was = pressed; setPressed(false); if (was && near(e)) onAction(); },
      onPointerCancel: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
      onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAction(); } } } };
}

function StatePill({ state }) {
  const s = PG_PILL[state] || PG_PILL.running;
  return (
    <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.05em", color: s.ink, background: s.bg, borderRadius: 999,
      padding: "4px 8px", whiteSpace: "nowrap" }}>{s.label}</span>);

}

function ProgramRow({ p, onOpen, last, current }) {
  const state = pgState(p);
  const today = pgToday(p);
  const { ref, pressed, handlers } = usePressAction(() => onOpen(p));
  return (
    <button ref={ref} {...handlers} className="fz-press" data-pressed={pressed ? "1" : "0"}
      aria-current={current ? "true" : undefined} style={{
      width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
      background: current ? "var(--accent-wash)" : "none", border: "none",
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "14px 10px", borderRadius: current ? 8 : 0,
      borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", letterSpacing: -0.1,
          lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", textWrap: "pretty" }}>{p.name}</div>
        {today ?
        <div style={{ fontSize: 16, fontWeight: 750, color: "var(--ink)", letterSpacing: -0.3 }}>{today}</div> :

        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, lineHeight: 1.35,
          textWrap: "pretty" }}>{pgSecondary(p)}</div>}

      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: 18.2, flexShrink: 0 }}>
        <StatePill state={state} />
        <span style={{ width: 18, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          {current ?
          <Icon name="check" size={17} stroke="var(--accent)" sw={2.6} /> :
          <Icon name="chevR" size={16} stroke="var(--faint)" />}
        </span>
      </div>
    </button>);

}

// actionable first: today's exercise on top, then other running, then waiting, paused, done
const pgRank = (p) => {
  const s = pgState(p);
  if (s === "running") return pgToday(p) === "Dnes · voľno" || pgToday(p) === "Dnes · hotovo" ? 1 : 0;
  return { waiting: 2, paused: 3, done: 4 }[s] ?? 5;
};
const pgSort = (list) => [...list].sort((a, b) => pgRank(a) - pgRank(b));

function TherapistGroup({ th, programs, onOpen, currentId }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--line)",
      boxShadow: "0 2px 10px rgba(30,40,70,0.04)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
        borderBottom: "1px solid var(--line)" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          background: "#EFF0F3", color: "#3A4256",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14.5, fontWeight: 700 }}>{th.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{th.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>{th.clinic}</div>
        </div>
      </div>
      {programs.length === 0 ?
      <div aria-disabled="true" style={{ padding: "16px 16px 18px", fontSize: 13.5, color: "var(--faint)",
        lineHeight: 1.45, pointerEvents: "none" }}>
          Plán čoskoro pripraví váš fyzioterapeut.
        </div> :

      <div style={{ padding: "2px 6px" }}>
          {pgSort(programs).map((p, i, arr) =>
        <ProgramRow key={p.id} p={p} onOpen={onOpen} last={i === arr.length - 1} current={p.id === currentId} />)}
        </div>}

    </div>);

}

// grouped list — used in the programs screen AND the home picker sheet
function ProgramList({ onOpen, currentId }) {
  const groups = FYZIO.homeTherapists().
  map((th) => ({ th, programs: FYZIO.homePrograms().filter((p) => p.therapistId === th.id) })).
  sort((a, b) => (a.programs.length ? 0 : 1) - (b.programs.length ? 0 : 1));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {groups.map((g) => <TherapistGroup key={g.th.id} th={g.th} programs={g.programs} onOpen={onOpen} currentId={currentId} />)}
    </div>);

}

function ProgramsScreen({ onOpen, onTab }) {
  const pt = FYZIO.patient;
  return (
    <div className="fz-fade" style={{ height: "100%", display: "flex", flexDirection: "column",
      background: "var(--bg)", overflow: "hidden" }}>

      {/* header */}
      <div style={{ flexShrink: 0, padding: "58px 22px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
            background: "#EFF0F3", color: "#3A4256",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15.5, fontWeight: 700 }}>{pt.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500 }}>Dobrý deň,</div>
            <div style={{ fontSize: 18, fontWeight: 740, color: "var(--ink)", letterSpacing: -0.3 }}>{pt.name}</div>
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 22px 24px" }}>
        <div style={{ fontSize: 22, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.4, marginBottom: 18 }}>
          Vaše programy
        </div>
        <ProgramList onOpen={onOpen} />
      </div>

      <BottomNav tab="home" onTab={(t) => onTab && onTab(t)} />
    </div>);

}

Object.assign(window, { ProgramsScreen, ProgramList });
