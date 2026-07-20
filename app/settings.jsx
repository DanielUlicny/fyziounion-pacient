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

// ── Add-therapist codes → newly linked therapist + their program ──
const THERAPIST_CODES = {
  "REHAB3": { name: "Mgr. Jana Horváthová", clinic: "RehaCentrum Košice", initials: "JH",
    program: "Stabilizácia bedra", email: "jana.horvathova@rehacentrum.sk", phone: "+421 907 445 112" },
  "FYZ9X4": { name: "PhDr. Martin Buben", clinic: "Fyzio Klinika Žilina", initials: "MB",
    program: "Rehabilitácia kolena", email: "martin.buben@fyzioklinika.sk", phone: "+421 908 332 007" },
};

function AddTherapistSheet({ open, onClose, onLinked }) {
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState(false);
  const [linked, setLinked] = React.useState(null);
  const ready = code.length >= 6;

  React.useEffect(() => {
    if (open) { setCode(""); setError(false); setLinked(null); }
  }, [open]);

  const confirm = () => {
    if (!ready) return;
    const match = THERAPIST_CODES[code.toUpperCase()];
    if (match) { setError(false); setLinked(match); }
    else setError(true);
  };

  const finish = () => { onLinked && onLinked(linked, code.toUpperCase()); onClose(); };

  const LEN = 6;
  const chars = code.toUpperCase().split("");

  if (!open) return null;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} className="fz-scrim" style={{ position: "absolute", inset: 0,
        background: "rgba(20,28,55,0.28)" }} />
      <div className="fz-sheet-up" style={{ position: "absolute", left: 0, right: 0, bottom: 0,
        background: "#fff", borderRadius: "26px 26px 0 0",
        boxShadow: "0 -10px 40px rgba(20,28,55,0.18)",
        padding: "12px 22px calc(26px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "0 auto 16px" }} />

        {linked ? (
          <div style={{ textAlign: "center", padding: "6px 0 4px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--ok-wash)", margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="check" size={30} stroke="var(--ok)" sw={2.4} />
            </div>
            <div style={{ fontSize: 21, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.4 }}>Fyzioterapeut pridaný</div>
            <div style={{ fontSize: 14.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
              <strong style={{ color: "var(--accent-ink)", fontWeight: 700 }}>{linked.name}</strong> ({linked.clinic}) vám pridelil program „{linked.program}".
            </div>
            <button onClick={finish} style={{ width: "100%", marginTop: 22, border: "none", borderRadius: 16,
              padding: "16px 18px", fontSize: 16.5, fontWeight: 650, fontFamily: "inherit", cursor: "pointer",
              color: "#fff", background: "var(--accent)", boxShadow: "0 8px 22px var(--accent-shadow)" }}>Hotovo</button>
          </div>
        ) : (
          <React.Fragment>
            <div style={{ fontSize: 21, fontWeight: 760, color: "var(--ink)", textAlign: "center" }}>Pridať fyzioterapeuta</div>
            <div style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", marginTop: 8, marginBottom: 20, lineHeight: 1.5 }}>
              Zadajte 6-miestny prístupový kód, ktorý ste dostali od nového fyzioterapeuta.
            </div>

            <div style={{ position: "relative" }} onClick={(e) => { const inp = e.currentTarget.querySelector("input"); inp && inp.focus(); }}>
              <input value={code}
                onChange={(e) => { setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, LEN)); setError(false); }}
                maxLength={LEN} autoComplete="off" autoCapitalize="characters" spellCheck="false"
                style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }} />
              <div style={{ display: "flex", gap: 9 }}>
                {Array.from({ length: LEN }).map((_, i) => {
                  const filled = !!chars[i];
                  const bc = error ? "var(--auth-err)" : (filled ? "var(--accent)" : "transparent");
                  return (
                    <div key={i} style={{ flex: 1, height: 56, borderRadius: 14, display: "flex", alignItems: "center",
                      justifyContent: "center", background: filled ? "var(--accent-wash)" : "#f4f6f9",
                      border: `1.5px solid ${bc}`, fontSize: 24, fontWeight: 700, color: "var(--ink)",
                      transition: "border-color .15s ease, background .15s ease" }}>{chars[i] || ""}</div>);
                })}
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14,
                padding: "11px 13px", borderRadius: 12, background: "var(--auth-err-wash)" }}>
                <Icon name="info" size={17} stroke="var(--auth-err)" />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--auth-err)" }}>Kód sa nenašiel, skúste to znova.</span>
              </div>
            )}

            <button onClick={confirm} disabled={!ready} style={{ width: "100%", marginTop: 20, border: "none",
              borderRadius: 16, padding: "16px 18px", fontSize: 16.5, fontWeight: 650, fontFamily: "inherit",
              cursor: ready ? "pointer" : "default", color: ready ? "#fff" : "var(--gray-btn-ink)",
              background: ready ? "var(--accent)" : "var(--gray-btn)", transition: "background .2s ease, color .2s ease" }}>
              Potvrdiť
            </button>
          </React.Fragment>
        )}
      </div>
    </div>);
}

function ProfileField({ label, value, onChange, placeholder, type = "text", inputMode }) {
  const [focus, setFocus] = React.useState(false);
  const ref = React.useRef(null);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 650, color: "var(--text)", marginBottom: 7 }}>{label}</div>
      <div onClick={() => ref.current && ref.current.focus()} style={{ display: "flex", alignItems: "center", cursor: "text",
        background: "#f4f6f9", borderRadius: 13, padding: "0 15px", height: 50,
        border: `1.5px solid ${focus ? "var(--accent)" : "transparent"}`, transition: "border-color .15s ease" }}>
        <input ref={ref} type={type} value={value} placeholder={placeholder} inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          autoCapitalize={type === "email" ? "none" : "sentences"} autoCorrect="off" spellCheck="false"
          style={{ flex: 1, width: "100%", border: "none", outline: "none", background: "none",
            fontFamily: "inherit", fontSize: 15.5, fontWeight: 500, color: "var(--ink)", minWidth: 0 }} />
      </div>
    </div>);
}

function ProfileEditSheet({ open, profile, onClose, onSave }) {
  const [f, setF] = React.useState(profile);
  React.useEffect(() => { if (open) setF(profile); }, [open]);
  const set = (patch) => setF((p) => ({ ...p, ...patch }));
  const ready = f && f.first.trim() && f.last.trim();

  if (!open || !f) return null;

  const sep = { fontSize: 18, fontWeight: 500, color: "var(--faint)" };
  const dobCell = (val, k, ph, max, w) => (
    <input value={val} inputMode="numeric" placeholder={ph}
      onChange={(e) => set({ [k]: e.target.value.replace(/\D/g, "").slice(0, max) })}
      style={{ width: w, textAlign: "center", border: "none", outline: "none", background: "none",
        fontFamily: "inherit", fontSize: 17, fontWeight: 700, color: "var(--ink)", padding: 0 }} />);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} className="fz-scrim" style={{ position: "absolute", inset: 0, background: "rgba(20,28,55,0.28)" }} />
      <div className="fz-sheet-up" style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "92%",
        background: "#fff", borderRadius: "26px 26px 0 0", display: "flex", flexDirection: "column",
        boxShadow: "0 -10px 40px rgba(20,28,55,0.18)" }}>
        <div style={{ flexShrink: 0, padding: "12px 22px 4px" }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "0 auto 14px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 21, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.4 }}>Upraviť profil</span>
            <button onClick={onClose} aria-label="Zavrieť" style={{ width: 34, height: 34, borderRadius: 10,
              border: "none", background: "var(--chip)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="x" size={18} stroke="var(--muted)" />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "12px 22px 4px" }}>
          {/* avatar preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(150deg, var(--accent-light), var(--accent))", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 720 }}>
              {((f.first[0] || "") + (f.last[0] || "")).toUpperCase() || "?"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <div style={{ display: "flex", gap: 11 }}>
              <div style={{ flex: "1 1 0", minWidth: 0 }}><ProfileField label="Meno" value={f.first} onChange={(v) => set({ first: v })} placeholder="Lucia" /></div>
              <div style={{ flex: "1 1 0", minWidth: 0 }}><ProfileField label="Priezvisko" value={f.last} onChange={(v) => set({ last: v })} placeholder="Kováčová" /></div>
            </div>
            <ProfileField label="E-mail" type="email" value={f.email} onChange={(v) => set({ email: v })} placeholder="vas@email.sk" />
            <ProfileField label="Telefón" type="tel" inputMode="tel" value={f.phone} onChange={(v) => set({ phone: v })} placeholder="+421 900 000 000" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 650, color: "var(--text)", marginBottom: 7 }}>Dátum narodenia</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 50,
                background: "#f4f6f9", borderRadius: 13, padding: "0 15px" }}>
                {dobCell(f.dd, "dd", "DD", 2, 40)}<span style={sep}>/</span>
                {dobCell(f.mm, "mm", "MM", 2, 44)}<span style={sep}>/</span>
                {dobCell(f.yyyy, "yyyy", "RRRR", 4, 66)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: "14px 22px calc(26px + env(safe-area-inset-bottom))" }}>
          <button onClick={() => ready && onSave(f)} disabled={!ready} style={{ width: "100%", border: "none",
            borderRadius: 16, padding: "16px 18px", fontSize: 16.5, fontWeight: 650, fontFamily: "inherit",
            cursor: ready ? "pointer" : "default", color: ready ? "#fff" : "var(--gray-btn-ink)",
            background: ready ? "var(--accent)" : "var(--gray-btn)", transition: "background .2s ease, color .2s ease",
            boxShadow: ready ? "0 8px 22px var(--accent-shadow)" : "none" }}>
            Uložiť zmeny
          </button>
        </div>
      </div>
    </div>);
}

function ContactSheet({ therapist, onClose }) {
  const open = !!therapist;
  if (!open) return null;
  const rows = [
    { icon: "mail", label: "E-mail", value: therapist.email, href: `mailto:${therapist.email}` },
    { icon: "phone", label: "Telefón", value: therapist.phone, href: `tel:${therapist.phone.replace(/\s/g, "")}` },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} className="fz-scrim" style={{ position: "absolute", inset: 0, background: "rgba(20,28,55,0.28)" }} />
      <div className="fz-sheet-up" style={{ position: "absolute", left: 0, right: 0, bottom: 0,
        background: "#fff", borderRadius: "26px 26px 0 0", boxShadow: "0 -10px 40px rgba(20,28,55,0.18)",
        padding: "12px 22px calc(26px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "0 auto 16px" }} />

        {/* therapist identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
            background: "var(--accent)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 720 }}>{therapist.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 740, color: "var(--ink)" }}>{therapist.name}</div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>{therapist.clinic}</div>
          </div>
          <button onClick={onClose} aria-label="Zavrieť" style={{ width: 34, height: 34, borderRadius: 10,
            border: "none", background: "var(--chip)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={18} stroke="var(--muted)" />
          </button>
        </div>

        {/* contact rows — tappable */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {rows.map((r) => (
            <a key={r.label} href={r.href} style={{ textDecoration: "none",
              display: "flex", alignItems: "center", gap: 13, padding: "14px 15px", borderRadius: 14,
              border: "1.5px solid var(--line)", background: "#fff" }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: "var(--accent-wash)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={r.icon} size={20} stroke="var(--accent)" />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 12.5, color: "var(--muted)", marginBottom: 2 }}>{r.label}</span>
                <span style={{ display: "block", fontSize: 15.5, fontWeight: 650, color: "var(--ink)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</span>
              </span>
              <Icon name="chevR" size={19} stroke="var(--faint)" />
            </a>
          ))}
        </div>
      </div>
    </div>);
}

function SettingsScreen({ onLogout }) {
  const [contactTh, setContactTh] = React.useState(null);
  const [days, setDays] = React.useState({ ...FYZIO.activeDays });
  const [notif, setNotif] = React.useState(true);
  const [time, setTime] = React.useState(FYZIO.reminderTime);
  const [pickTime, setPickTime] = React.useState(false);
  const [addTherapist, setAddTherapist] = React.useState(false);
  const [extraTherapists, setExtraTherapists] = React.useState([]);
  const [editProfile, setEditProfile] = React.useState(false);
  const [profile, setProfile] = React.useState(() => {
    const parts = FYZIO.patient.name.trim().split(/\s+/);
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "",
      email: "lucia.kovacova@email.sk", phone: "+421 902 345 678",
      dd: "14", mm: "03", yyyy: "1990" };
  });
  const fullName = `${profile.first} ${profile.last}`.trim();
  const initials = ((profile.first[0] || "") + (profile.last[0] || "")).toUpperCase() || FYZIO.patient.initials;
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
          <button onClick={() => setEditProfile(true)} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16,
            width: "100%", textAlign: "left", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(150deg, var(--accent-light), var(--accent))", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 720, color: "var(--ink)" }}>{fullName}</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>Pacient · {FYZIO.program.name}</div>
            </div>
            <Icon name="chevR" size={20} stroke="var(--faint)" />
          </button>
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
                    <button onClick={() => setContactTh(th)} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)", background: "#fff",
                    border: "none", cursor: "pointer", fontFamily: "inherit", borderRadius: 9, padding: "7px 12px" }}>Kontakt</button>
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

          {/* newly linked therapists (via access code) */}
          {extraTherapists.length > 0 &&
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              {extraTherapists.map((t, idx) =>
                <Card key={idx}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                    borderBottom: "1px solid var(--line)", background: "var(--accent-wash)" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: "var(--accent)", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 720 }}>{t.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 1 }}>{t.clinic}</div>
                    </div>
                    <button onClick={() => setContactTh(t)} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)", background: "#fff",
                      border: "none", cursor: "pointer", fontFamily: "inherit", borderRadius: 9, padding: "7px 12px" }}>Kontakt</button>
                  </div>
                  <Row last>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: "var(--accent-wash)",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="activity" size={19} stroke="var(--accent)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 650, color: "var(--ink)" }}>{t.program}</div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>Nový program</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 650, color: "var(--ok-ink)", background: "var(--ok-wash)", borderRadius: 8, padding: "5px 9px" }}>Aktívny</span>
                  </Row>
                </Card>
              )}
            </div>
          }

          {/* add therapist via access code */}
          <button onClick={() => setAddTherapist(true)} style={{ width: "100%", marginTop: 14,
            display: "flex", alignItems: "center", gap: 12,
            border: "1px solid var(--line)", background: "#fff", borderRadius: 16,
            padding: "14px 16px", cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 2px 10px rgba(30,40,70,0.04)" }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: "var(--accent-wash)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" size={20} stroke="var(--accent)" sw={2.2} />
            </span>
            <span style={{ flex: 1, textAlign: "left", fontSize: 15.5, fontWeight: 650, color: "var(--ink)" }}>Pridať fyzioterapeuta</span>
            <Icon name="chevR" size={19} stroke="var(--faint)" />
          </button>

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
        <div style={{ textAlign: "center", fontSize: 12, color: "var(--faint)", paddingBottom: 4 }}>FyzioUnion · verzia 1.0</div>
      </div>
      </div>

      <TimeWheelSheet open={pickTime} value={time}
      onClose={() => setPickTime(false)}
      onConfirm={(v) => {setTime(v);setPickTime(false);}} />

      <AddTherapistSheet open={addTherapist}
      onClose={() => setAddTherapist(false)}
      onLinked={(t) => t && setExtraTherapists((list) => [...list, t])} />

      <ProfileEditSheet open={editProfile} profile={profile}
      onClose={() => setEditProfile(false)}
      onSave={(p) => { setProfile(p); setEditProfile(false); }} />

      <ContactSheet therapist={contactTh} onClose={() => setContactTh(null)} />
    </div>);

}

Object.assign(window, { SettingsScreen });