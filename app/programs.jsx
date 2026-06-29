// app/programs.jsx — programs grouped by the therapist who assigned them
// Exports to window: ProgramsScreen, ProgramList

function ProgramRow({ p, onOpen, last }) {
  const done = p.progress >= 1;
  return (
    <button onClick={() => onOpen(p)} style={{
      width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
      background: "none", border: "none", display: "flex", alignItems: "center", gap: 13,
      padding: "15px 4px", borderBottom: last ? "none" : "1px solid var(--line)" }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: done ? "var(--chip)" : "var(--accent-wash)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={done ? "award" : "activity"} size={21} stroke={done ? "var(--muted)" : "var(--accent)"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", letterSpacing: -0.2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2, fontWeight: 500 }}>
          {done ? "Dokončené" : `${p.phase} · ${p.week}`}
        </div>
      </div>
      <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 650,
        color: done ? "var(--muted)" : "var(--accent)",
        background: done ? "var(--chip)" : "var(--accent-wash)",
        borderRadius: 8, padding: "5px 10px" }}>{p.status}</span>
      <Icon name="chevR" size={18} stroke="var(--faint)" />
    </button>);

}

function TherapistGroup({ th, programs, onOpen }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--line)",
      boxShadow: "0 2px 10px rgba(30,40,70,0.04)", overflow: "hidden" }}>
      {/* therapist header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px",
        borderBottom: "1px solid var(--line)", background: "var(--accent-wash)" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: "var(--accent)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 720 }}>{th.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{th.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>{th.clinic}</div>
        </div>
        <Icon name="shield" size={18} stroke="var(--accent)" />
      </div>
      {/* assigned programs */}
      <div style={{ padding: "2px 14px" }}>
        {programs.map((p, i) => <ProgramRow key={p.id} p={p} onOpen={onOpen} last={i === programs.length - 1} />)}
      </div>
    </div>);

}

// grouped list — used in the post-login screen AND the home picker sheet
function ProgramList({ onOpen }) {
  const groups = FYZIO.therapists.
  map((th) => ({ th, programs: FYZIO.programs.filter((p) => p.therapistId === th.id) })).
  filter((g) => g.programs.length > 0);
  const multiTherapist = groups.length > 1;
  if (!multiTherapist) {
    // single therapist — flat list without the header block
    return (
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--line)",
        boxShadow: "0 2px 10px rgba(30,40,70,0.04)", overflow: "hidden", padding: "2px 14px" }}>
        {FYZIO.programs.map((p, i) =>
        <ProgramRow key={p.id} p={p} onOpen={onOpen} last={i === FYZIO.programs.length - 1} />)}
      </div>);

  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {groups.map((g) => <TherapistGroup key={g.th.id} th={g.th} programs={g.programs} onOpen={onOpen} />)}
    </div>);

}

function ProgramsScreen({ onOpen }) {
  const pt = FYZIO.patient;
  return (
    <div className="fz-fade" style={{ height: "100%", display: "flex", flexDirection: "column",
      background: "var(--bg)", overflow: "hidden" }}>

      {/* header */}
      <div style={{ flexShrink: 0, padding: "58px 22px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
            background: "var(--accent)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 720 }}>{pt.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500 }}>Dobrý deň,</div>
            <div style={{ fontSize: 18, fontWeight: 740, color: "var(--ink)", letterSpacing: -0.3 }}>{pt.name}</div>
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 22px 24px" }}>
        <div style={{ fontSize: 22, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.4, marginBottom: 4 }}>
          Vaše programy
        </div>
        <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5, marginBottom: 20 }}>Programy pridelené vašimi fyzioterapeutmi.

        </div>

        <ProgramList onOpen={onOpen} />
      </div>
    </div>);

}

Object.assign(window, { ProgramsScreen, ProgramList });