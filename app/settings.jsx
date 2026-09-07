// app/settings.jsx — patient settings (M18)
// Sections: Profil → Vaši fyzioterapeuti → Tréningové dni → Pripomienky → Účet a údaje
// Exports to window: SettingsScreen

const ST_CODES = {
  "REHAB3": { name: "Mgr. Jana Horváthová", clinic: "RehaCentrum Košice", initials: "JH",
    email: "jana.horvathova@rehacentrum.sk", phone: "+421 907 445 112" },
  "FYZ7K2": { name: "PhDr. Martin Buben", clinic: "Fyzio Klinika Žilina", initials: "MB",
    email: "martin.buben@fyzioklinika.sk", phone: "+421 908 332 007" } };

function StSwitch({ on, onToggle }) {
  return (
    <button onClick={onToggle} role="switch" aria-checked={on} className="fz-press"
      style={{ width: 50, height: 30, borderRadius: 999, border: "none", cursor: "pointer",
      background: on ? "var(--accent)" : "var(--switch-off)", position: "relative", transition: "background .22s ease", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: "50%",
        background: "#fff", transition: "left .22s cubic-bezier(.4,0,.2,1)" }} />
    </button>);

}

function StCard({ children, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--line)",
      overflow: "hidden", ...style }}>{children}</div>);

}

function StRow({ children, last, onClick, style, disabled }) {
  const [pressed, setPressed] = React.useState(false);
  const on = onClick && !disabled;
  return (
    <div onClick={on ? onClick : undefined} className={on ? "fz-press" : undefined} data-pressed={pressed ? "1" : "0"}
      onPointerDown={() => on && setPressed(true)} onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)} onPointerCancel={() => setPressed(false)}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
        borderBottom: last ? "none" : "1px solid var(--line)", cursor: on ? "pointer" : "default",
        opacity: disabled ? 0.45 : 1, ...style }}>
      {children}
    </div>);

}

function StAvatar({ initials, size = 46, photo, progress }) {
  const R = 46, C = 2 * Math.PI * R;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "#EFF0F3",
        color: "#3A4256", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.33, fontWeight: 700 }}>
        {photo ?
        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> :
        initials}
      </div>
      {progress != null &&
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"
        style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r="50" fill="rgba(255,255,255,0.66)" />
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--line)" strokeWidth="7" />
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - progress)} style={{ transition: "stroke-dashoffset .18s linear" }} />
      </svg>}
    </div>);

}

function StButton({ children, onClick, disabled, tone = "primary", style }) {
  const ghost = tone === "ghost";
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} className="fz-press"
      style={{ width: "100%", borderRadius: 6, padding: "15px 18px", fontSize: 16, fontWeight: 650,
        fontFamily: "inherit", cursor: disabled ? "default" : "pointer", boxShadow: "none",
        border: ghost ? "1px solid var(--line)" : "none",
        background: ghost ? "#fff" : disabled ? "var(--chip)" : "var(--accent)",
        color: ghost ? "var(--ink)" : disabled ? "var(--muted)" : "#fff", ...style }}>{children}</button>);

}

// ── Sheet shell: covers the bottom bar, handle + ✕, same everywhere ──
function StSheet({ open, title, subtitle, onClose, children, footer, hideClose }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80 }}>
      <div onClick={onClose} className="fz-scrim" style={{ position: "absolute", inset: 0, background: "rgba(20,28,45,0.34)" }} />
      <div className="fz-sheet-up" style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "92%",
        background: "#fff", borderRadius: "12px 12px 0 0", display: "flex", flexDirection: "column" }}>
        <div style={{ flexShrink: 0, padding: "12px 20px 4px" }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "0 auto 14px" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 20, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.4 }}>{title}</span>
              {subtitle &&
              <span style={{ display: "block", fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>{subtitle}</span>}
            </span>
            {!hideClose &&
            <button onClick={onClose} aria-label="Zavrieť" className="fz-press" style={{ width: 34, height: 34, borderRadius: 6,
              border: "1px solid var(--line)", background: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="x" size={17} stroke="var(--muted)" />
            </button>}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch",
          padding: footer ? "14px 20px 4px" : "14px 20px calc(18px + max(env(safe-area-inset-bottom), 26px))" }}>{children}</div>
        {footer &&
        <div style={{ flexShrink: 0, padding: "14px 20px calc(14px + max(env(safe-area-inset-bottom), 26px))" }}>{footer}</div>}
      </div>
    </div>);

}

function StField({ label, value, onChange, placeholder, type = "text", inputMode, required }) {
  const [focus, setFocus] = React.useState(false);
  const ref = React.useRef(null);
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 650, color: "var(--text)", marginBottom: 7 }}>{label}</div>
      <div onClick={() => ref.current && ref.current.focus()} style={{ display: "flex", alignItems: "center", cursor: "text",
        background: "#fff", borderRadius: 6, padding: "0 14px", height: 48,
        border: `1px solid ${focus ? "var(--accent)" : "var(--line)"}`, transition: "border-color .15s ease" }}>
        <input ref={ref} type={type} value={value} placeholder={placeholder} inputMode={inputMode}
          required={required} aria-required={required ? "true" : undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          autoCorrect="off" spellCheck="false"
          style={{ flex: 1, width: "100%", border: "none", outline: "none", background: "none",
            fontFamily: "inherit", fontSize: 15.5, fontWeight: 500, color: "var(--ink)", minWidth: 0 }} />
      </div>
    </div>);

}

// ── 1 · Profil ──────────────────────────────────────────────
function PhotoMenuSheet({ open, hasPhoto, onPick, onRemove, onClose }) {
  if (!open) return null;
  const rows = [
    { icon: "camera", label: "Odfotiť", act: () => onPick("camera") },
    { icon: "image", label: "Vybrať z galérie", act: () => onPick("library") }];

  if (hasPhoto) rows.push({ icon: "trash", label: "Odstrániť fotku", danger: true, act: onRemove });
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 86 }}>
      <div onClick={onClose} className="fz-scrim" style={{ position: "absolute", inset: 0, background: "rgba(20,28,45,0.34)" }} />
      <div className="fz-sheet-up" style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#fff",
        borderRadius: "12px 12px 0 0", padding: "12px 20px calc(14px + max(env(safe-area-inset-bottom), 26px))" }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "0 auto 12px" }} />
        <div style={{ fontSize: 17, fontWeight: 720, color: "var(--ink)", marginBottom: 10 }}>Profilová fotka</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map((r, i) =>
          <button key={r.label} onClick={r.act} className="fz-press"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 2px", background: "none",
              border: "none", borderTop: i === 0 ? "none" : "1px solid var(--line)", cursor: "pointer",
              fontFamily: "inherit", textAlign: "left" }}>
            <Icon name={r.icon} size={20} stroke={r.danger ? "#9F2F2D" : "var(--accent)"} />
            <span style={{ fontSize: 15.5, fontWeight: 600, color: r.danger ? "#9F2F2D" : "var(--ink)" }}>{r.label}</span>
          </button>)}
        </div>
        <div style={{ marginTop: 12 }}><StButton tone="ghost" onClick={onClose}>Zrušiť</StButton></div>
      </div>
    </div>);

}

function PhotoCropper({ src, onCancel, onApply }) {
  const S = 268;
  const [zoom, setZoom] = React.useState(1);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [nat, setNat] = React.useState(null);
  const drag = React.useRef(null);
  const imgRef = React.useRef(null);
  const base = nat ? S / Math.min(nat.w, nat.h) : 1;
  const dw = nat ? nat.w * base * zoom : 0;
  const dh = nat ? nat.h * base * zoom : 0;
  const clamp = (p, w, h) => ({
    x: Math.max(-(w - S) / 2, Math.min((w - S) / 2, p.x)),
    y: Math.max(-(h - S) / 2, Math.min((h - S) / 2, p.y)) });

  React.useEffect(() => { setPos((p) => nat ? clamp(p, dw, dh) : p); }, [zoom, nat]);

  const down = (e) => { drag.current = { sx: e.clientX, sy: e.clientY, ...pos }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => {
    const d = drag.current;if (!d) return;
    setPos(clamp({ x: d.x + (e.clientX - d.sx), y: d.y + (e.clientY - d.sy) }, dw, dh));
  };
  const up = () => {drag.current = null;};

  const apply = () => {
    const img = imgRef.current;if (!img) return;
    const OUT = 480, k = OUT / S;
    const c = document.createElement("canvas");c.width = OUT;c.height = OUT;
    const ctx = c.getContext("2d");
    ctx.save();
    ctx.beginPath();ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);ctx.clip();
    ctx.drawImage(img, k * (S / 2 + pos.x - dw / 2), k * (S / 2 + pos.y - dh / 2), k * dw, k * dh);
    ctx.restore();
    onApply(c.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 92, background: "#fff",
      display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, padding: "18px 20px 4px", color: "var(--text, #22303F)", fontSize: 17, fontWeight: 700 }}>Orezať fotku</div>
      <div style={{ flexShrink: 0, padding: "2px 20px 0", color: "var(--muted, #6A7C90)", fontSize: 13.5 }}>
        Posuňte fotku a nastavte priblíženie.
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          style={{ width: S, height: S, borderRadius: "50%", overflow: "hidden", position: "relative",
            background: "#F2F4F6", touchAction: "none", cursor: "grab", boxShadow: "0 0 0 1px #EAEAEA" }}>
          <img ref={imgRef} src={src} alt="" draggable="false"
            onLoad={(e) => setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            style={{ position: "absolute", left: "50%", top: "50%", width: dw || "auto", height: dh || "auto",
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`, maxWidth: "none", userSelect: "none" }} />
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: "0 20px 18px" }}>
        <input type="range" min="1" max="3" step="0.01" value={zoom} aria-label="Priblíženie"
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent)" }} />
      </div>
      <div style={{ flexShrink: 0, display: "flex", gap: 10,
        padding: "0 20px calc(16px + max(env(safe-area-inset-bottom), 26px))" }}>
        <StButton tone="ghost" onClick={onCancel} style={{ background: "#fff", color: "var(--text, #22303F)",
          border: "1px solid #EAEAEA" }}>Zrušiť</StButton>
        <StButton onClick={apply}>Použiť</StButton>
      </div>
    </div>);

}

function ProfileSheet({ open, profile, onClose, onSave }) {
  const [f, setF] = React.useState(profile);
  const [menu, setMenu] = React.useState(false);
  const [crop, setCrop] = React.useState(null);
  const [photoErr, setPhotoErr] = React.useState("");
  const [upload, setUpload] = React.useState(null);
  const fileRef = React.useRef(null);
  const camRef = React.useRef(null);
  React.useEffect(() => { if (open) { setF(profile); setMenu(false); setCrop(null); setPhotoErr(""); setUpload(null); } }, [open]);
  const set = (patch) => setF((p) => ({ ...p, ...patch }));

  const takeFile = (file) => {
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) { setPhotoErr("Tento formát nepodporujeme, použite JPG alebo PNG."); return; }
    if (file.size > 8 * 1024 * 1024) { setPhotoErr("Fotka je príliš veľká, skúste menšiu."); return; }
    setPhotoErr("");
    const r = new FileReader();
    r.onload = () => setCrop(r.result);
    r.readAsDataURL(file);
  };

  const startUpload = (dataUrl) => {
    setCrop(null);
    setUpload(0);
    let p = 0;
    const id = setInterval(() => {
      p += 0.08 + Math.random() * 0.07;
      if (p >= 1) { clearInterval(id); setUpload(null); set({ photo: dataUrl }); }
      else setUpload(p);
    }, 90);
  };

  if (!open || !f) return null;
  const changed = JSON.stringify(f) !== JSON.stringify(profile);
  const ready = !!f.first.trim() && !!f.last.trim() && changed && upload == null;
  const initials = ((f.first[0] || "") + (f.last[0] || "")).toUpperCase() || "?";
  return (
    <React.Fragment>
    <StSheet open={open} title="Upraviť profil" onClose={onClose}
      footer={<StButton onClick={() => ready && onSave(f)} disabled={!ready}>Uložiť zmeny</StButton>}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: photoErr ? 12 : 18 }}>
        <button onClick={() => upload == null && setMenu(true)} className="fz-press" aria-label="Zmeniť profilovú fotku"
          style={{ position: "relative", width: 88, height: 88, padding: 0, border: "none", background: "none",
            cursor: upload == null ? "pointer" : "default", borderRadius: "50%" }}>
          <StAvatar size={88} initials={initials} photo={f.photo} progress={upload} />
          <span style={{ position: "absolute", right: -1, bottom: -1, width: 30, height: 30, borderRadius: "50%",
            background: "var(--accent)", border: "2px solid #fff", display: "flex", alignItems: "center",
            justifyContent: "center" }}>
            <Icon name="camera" size={16} stroke="#fff" />
          </span>
        </button>
      </div>
      {photoErr &&
      <div style={{ borderRadius: 12, padding: "11px 13px", background: "#FDEBEC", color: "#9F2F2D",
        fontSize: 13.5, fontWeight: 600, lineHeight: 1.4, marginBottom: 18 }}>{photoErr}</div>}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png" style={{ display: "none" }}
        onChange={(e) => { takeFile(e.target.files && e.target.files[0]); e.target.value = ""; }} />
      <input ref={camRef} type="file" accept="image/jpeg,image/png" capture="user" style={{ display: "none" }}
        onChange={(e) => { takeFile(e.target.files && e.target.files[0]); e.target.value = ""; }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div style={{ display: "flex", gap: 11 }}>
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <StField label="Meno" value={f.first} onChange={(v) => set({ first: v })} placeholder="Lucia" required />
          </div>
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <StField label="Priezvisko" value={f.last} onChange={(v) => set({ last: v })} placeholder="Kováčová" required />
          </div>
        </div>
        <StField label="Telefón" type="tel" inputMode="tel" value={f.phone}
          onChange={(v) => set({ phone: v })} placeholder="+421 900 000 000" required />
        <div>
          <div style={{ fontSize: 13, fontWeight: 650, color: "var(--text)", marginBottom: 5 }}>Prihlasovací e-mail</div>
          <div style={{ fontSize: 15.5, fontWeight: 550, color: "var(--ink)" }}>{f.email}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>Prihlasovací e-mail sa nedá zmeniť.</div>
        </div>
      </div>
    </StSheet>
    <PhotoMenuSheet open={menu} hasPhoto={!!f.photo} onClose={() => setMenu(false)}
      onPick={(src) => { setMenu(false); (src === "camera" ? camRef : fileRef).current.click(); }}
      onRemove={() => { setMenu(false); setPhotoErr(""); set({ photo: null }); }} />
    {crop && <PhotoCropper src={crop} onCancel={() => setCrop(null)} onApply={startUpload} />}
    </React.Fragment>);

}

// ── 2 · Kontakt + odobranie fyzioterapeuta ──────────────────
function ContactSheet({ therapist, onClose, onRemove }) {
  if (!therapist) return null;
  const rows = [
    { icon: "mail", label: "E-mail", value: therapist.email, href: `mailto:${therapist.email}` },
    { icon: "phone", label: "Telefón", value: therapist.phone, href: `tel:${(therapist.phone || "").replace(/\s/g, "")}` }];

  return (
    <StSheet open={true} title={therapist.name} subtitle={therapist.clinic} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) =>
        <a key={r.label} href={r.href} className="fz-press" style={{ textDecoration: "none",
          display: "flex", alignItems: "center", gap: 13, padding: "13px 14px", borderRadius: 12,
          border: "1px solid var(--line)", background: "#fff" }}>
          <Icon name={r.icon} size={20} stroke="var(--accent)" />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 12.5, color: "var(--muted)" }}>{r.label}</span>
            <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: "var(--ink)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</span>
          </span>
          <Icon name="chevR" size={16} stroke="var(--faint)" />
        </a>)}
        <div onClick={onRemove} className="fz-press" style={{ marginTop: 6, paddingTop: 15,
          borderTop: "1px solid var(--line)", cursor: "pointer" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Odobrať fyzioterapeuta</span>
        </div>
      </div>
    </StSheet>);

}

function ConfirmSheet({ open, title, text, confirmLabel, danger, onConfirm, onClose }) {
  return (
    <StSheet open={open} title={title} onClose={onClose} hideClose
      footer={
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {danger ?
        <React.Fragment>
          <StButton onClick={onConfirm} style={{ background: "#9F2F2D" }}>{confirmLabel}</StButton>
          <StButton tone="ghost" onClick={onClose}>Zrušiť</StButton>
        </React.Fragment> :
        <React.Fragment>
          <StButton onClick={onClose}>Zrušiť</StButton>
          <button onClick={onConfirm} className="fz-press" style={{ width: "100%", border: "none", background: "none",
            cursor: "pointer", fontFamily: "inherit", padding: "13px 18px", fontSize: 15.5, fontWeight: 600,
            color: "var(--text)" }}>{confirmLabel}</button>
        </React.Fragment>}
      </div>}>
      <div style={{ fontSize: 14.5, color: "var(--text)", lineHeight: 1.55, textWrap: "pretty" }}>{text}</div>
    </StSheet>);

}

// ── 6 · Pridať fyzioterapeuta (alfanumerický kód) ───────────
function AddTherapistSheet({ open, onClose, onLinked }) {
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [tries, setTries] = React.useState(0);
  const [lockUntil, setLockUntil] = React.useState(0);
  const [now, setNow] = React.useState(Date.now());
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (open) { setCode(""); setError(""); setTries(0); setLockUntil(0); } }, [open]);
  React.useEffect(() => {
    if (!lockUntil) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [lockUntil]);
  const locked = lockUntil > now;
  const secs = Math.max(0, Math.ceil((lockUntil - now) / 1000));
  const ready = code.length === 6 && !locked;

  const confirm = () => {
    if (!ready) return;
    const hit = ST_CODES[code];
    if (hit) { onLinked && onLinked(hit, code); onClose(); return; }
    const t = tries + 1;
    setTries(t);
    if (t >= 5) { setLockUntil(Date.now() + 30000); setError("Priveľa pokusov. Skúste to znova o 30 sekúnd."); }
    else setError("Kód je neplatný alebo mu vypršala platnosť.");
  };

  return (
    <StSheet open={open} title="Pridať fyzioterapeuta" onClose={onClose}
      footer={<StButton onClick={confirm} disabled={!ready}>Potvrdiť</StButton>}>
      <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5, marginBottom: 16 }}>
        Zadajte 6-znakový kód, ktorý vám dal fyzioterapeut.
      </div>
      <div onClick={() => inputRef.current && inputRef.current.focus()}
        style={{ display: "flex", gap: 8, position: "relative", cursor: "text" }}>
        {Array.from({ length: 6 }).map((_, i) =>
        <div key={i} style={{ flex: 1, height: 56, borderRadius: 6, display: "flex", alignItems: "center",
          justifyContent: "center", background: "#fff", fontSize: 22, fontWeight: 700, color: "var(--ink)",
          border: `1px solid ${error && !locked ? "#9F2F2D" : code.length === i ? "var(--accent)" : "var(--line)"}` }}>
          {code[i] || ""}
        </div>)}
        <input ref={inputRef} value={code} inputMode="text" autoCapitalize="characters" autoCorrect="off"
          spellCheck="false" aria-label="Kód fyzioterapeuta" disabled={locked}
          onChange={(e) => { setError(""); setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)); }}
          style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%",
            border: "none", background: "none", fontSize: 16, color: "transparent", caretColor: "transparent" }} />
      </div>
      {error &&
      <div style={{ marginTop: 12, borderRadius: 12, padding: "11px 13px", background: "#FDEBEC",
        color: "#9F2F2D", fontSize: 13.5, fontWeight: 600 }}>
        {locked ? `Priveľa pokusov. Skúste to znova o ${secs} s.` : error}
      </div>}
      <div style={{ height: 8 }} />
    </StSheet>);

}

// ── Screen ──────────────────────────────────────────────────
function SettingsScreen({ onLogout, onSheet }) {
  const pt = FYZIO.patient;
  const [profile, setProfile] = React.useState(() => {
    const parts = (pt.name || "").split(" ");
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "",
      email: "lucia.kovacova@email.sk", phone: "+421 903 456 789", photo: null };
  });
  const [editProfile, setEditProfile] = React.useState(false);
  const [contactTh, setContactTh] = React.useState(null);
  const [removeTh, setRemoveTh] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [extra, setExtra] = React.useState([]);
  const [removed, setRemoved] = React.useState([]);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [toast, setToast] = React.useState("");

  const prog = FYZIO.runningPrograms()[0] || FYZIO.programs[0];
  const daysFixed = !!prog.daysFixed;
  const minDays = prog.minDays || 3;
  const order = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  const [days, setDays] = React.useState({ ...FYZIO.progActiveDays(prog) });
  const count = order.filter((d) => days[d]).length;
  const [dayNote, setDayNote] = React.useState("");
  const noteTimer = React.useRef(null);
  const toggleDay = (d) => {
    if (daysFixed) return;
    if (days[d] && count <= minDays) {
      setDayNote(`Fyzioterapeut predpísal minimálne ${minDays}× týždenne. Menej dní nie je možné.`);
      clearTimeout(noteTimer.current);
      noteTimer.current = setTimeout(() => setDayNote(""), 3000);
      return;
    }
    clearTimeout(noteTimer.current);
    setDayNote("");
    setDays((s) => ({ ...s, [d]: !s[d] }));
  };

  const [remOn, setRemOn] = React.useState(true);
  const [remTime, setRemTime] = React.useState(FYZIO.reminderTime || "18:00");
  const [pickTime, setPickTime] = React.useState(false);

  const therapists = FYZIO.therapists.filter((t) => !removed.includes(t.id)).concat(extra);
  const progCount = (id) => FYZIO.homePrograms().filter((p) => p.therapistId === id).length;

  const showToast = (t) => { setToast(t); setTimeout(() => setToast(""), 2600); };

  // an open sheet must cover the bottom bar — the bar lives one level up
  const anySheet = editProfile || !!contactTh || !!removeTh || addOpen || confirmDelete || pickTime;
  React.useEffect(() => { onSheet && onSheet(anySheet); }, [anySheet]);

  return (
    <div className="fz-fade" style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <div style={{ height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch",
        paddingBottom: "calc(56px + max(env(safe-area-inset-bottom), 16px))" }}>
        <div style={{ padding: "10px 20px 6px" }}>
          <div style={{ fontSize: 26, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.5 }}>Nastavenia</div>
        </div>

        <div style={{ padding: "12px 20px 8px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* 1 · Profil */}
          <StCard>
            <StRow last onClick={() => setEditProfile(true)}>
              <StAvatar initials={pt.initials} photo={profile.photo} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 720, color: "var(--ink)" }}>{profile.first} {profile.last}</div>
                <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>Pacient</div>
              </div>
              <Icon name="chevR" size={17} stroke="var(--faint)" />
            </StRow>
          </StCard>

          {/* 2 · Vaši fyzioterapeuti */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12.5, fontWeight: 650, color: "var(--muted)", letterSpacing: 0.3,
              textTransform: "uppercase", padding: "0 4px" }}>Vaši fyzioterapeuti</div>
            {therapists.map((th) =>
            <StCard key={th.id || th.name}>
              <StRow last onClick={() => setContactTh(th)}>
                <StAvatar initials={th.initials} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{th.name}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 1 }}>{th.clinic}</div>
                  {progCount(th.id) === 0 &&
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3 }}>Zatiaľ bez programu</div>}
                </div>
                <Icon name="chevR" size={17} stroke="var(--faint)" />
              </StRow>
            </StCard>)}
            <StButton onClick={() => setAddOpen(true)}
              style={{ borderRadius: 6, padding: "13px 18px", fontSize: 15, fontWeight: 650 }}>Pridať fyzioterapeuta</StButton>
          </div>

          {/* 3 · Tréningové dni */}
          <StCard style={{ padding: "16px 16px 18px" }}>
            <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)" }}>Tréningové dni</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{prog.name}</div>
            {daysFixed ?
            <React.Fragment>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 14 }}>
                {order.filter((d) => days[d]).join(" · ")}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>Dni určil váš fyzioterapeut.</div>
            </React.Fragment> :
            <React.Fragment>
              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                {order.map((d) =>
                <button key={d} onClick={() => toggleDay(d)} className="fz-press" aria-pressed={!!days[d]}
                  style={{ flex: 1, minWidth: 0, aspectRatio: "1", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13.5, fontWeight: 650, border: days[d] ? "none" : "1px solid var(--line)",
                    background: days[d] ? "var(--accent)" : "#fff", color: days[d] ? "#fff" : "var(--ink)" }}>{d}</button>)}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.4 }}>
                  Minimálne {minDays}× týždenne
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", flexShrink: 0 }}>
                  Vybrané {count}
                </span>
              </div>
              {dayNote &&
              <div style={{ marginTop: 10, borderRadius: 12, padding: "10px 12px", background: "#FBF3DB",
                color: "#956400", fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{dayNote}</div>}
            </React.Fragment>}
          </StCard>

          {/* 4 · Pripomienky */}
          <StCard>
            <StRow>
              <span style={{ flex: 1, fontSize: 15.5, fontWeight: 650, color: "var(--ink)" }}>Pripomienky</span>
              <StSwitch on={remOn} onToggle={() => setRemOn((v) => !v)} />
            </StRow>
            <StRow last disabled={!remOn} onClick={() => setPickTime(true)}>
              <span style={{ flex: 1, fontSize: 15, color: "var(--text)" }}>Čas</span>
              <span style={{ fontSize: 15, fontWeight: 650, color: "var(--ink)" }}>{remTime}</span>
              <Icon name="chevR" size={16} stroke="var(--faint)" />
            </StRow>
          </StCard>

          {/* 5 · Účet a údaje */}
          <StCard>
            <StRow last onClick={() => showToast("Export vám pošleme e-mailom.")}>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Exportovať moje údaje</span>
            </StRow>
          </StCard>
          <StCard>
            <StRow last onClick={() => onLogout && onLogout()}>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Odhlásiť sa</span>
            </StRow>
          </StCard>
          <StCard style={{ marginTop: 20 }}>
            <StRow last onClick={() => setConfirmDelete(true)}>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#9F2F2D" }}>Vymazať účet</span>
            </StRow>
          </StCard>

          <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--muted)", padding: "2px 0 6px" }}>
            FyzioUnion · verzia 1.0
          </div>
        </div>
      </div>

      <ProfileSheet open={editProfile} profile={profile} onClose={() => setEditProfile(false)}
        onSave={(f) => { setProfile(f); setEditProfile(false); showToast("Zmeny uložené."); }} />
      <ContactSheet therapist={contactTh} onClose={() => setContactTh(null)}
        onRemove={() => { setRemoveTh(contactTh); setContactTh(null); }} />
      <AddTherapistSheet open={addOpen} onClose={() => setAddOpen(false)}
        onLinked={(th, code) => { setExtra((x) => x.concat([{ ...th, id: `x-${code}` }])); showToast("Fyzioterapeut napojený."); }} />
      <ConfirmSheet open={!!removeTh} title="Odobrať fyzioterapeuta"
        text="Fyzioterapeut už neuvidí, ako ďalej cvičíte, ani vašu bolesť a odpovede v dotazníkoch. Jeho programy sa vám skryjú. To, čo ste zaznamenali doteraz, ostáva v jeho zdravotnej dokumentácii."
        confirmLabel="Odobrať" onClose={() => setRemoveTh(null)}
        onConfirm={() => { setRemoved((r) => r.concat([removeTh.id])); setRemoveTh(null); showToast("Fyzioterapeut odobraný."); }} />
      <ConfirmSheet open={confirmDelete} danger title="Vymazať účet"
        text="Vymažú sa všetky vaše záznamy o cvičení, bolesti aj odpovede z dotazníkov. Túto akciu nie je možné vrátiť."
        confirmLabel="Vymazať účet" onClose={() => setConfirmDelete(false)}
        onConfirm={() => { setConfirmDelete(false); onLogout && onLogout(); }} />
      <TimeWheelSheet open={pickTime} value={remTime} onClose={() => setPickTime(false)}
        onConfirm={(t) => { setRemTime(t); setPickTime(false); }} />

      {toast &&
      <div style={{ position: "absolute", left: 24, right: 24, bottom: "calc(24px + max(env(safe-area-inset-bottom), 16px))",
        zIndex: 90, background: "#22303F", color: "#fff", borderRadius: 12, padding: "12px 16px",
        fontSize: 13.5, fontWeight: 600, textAlign: "center", whiteSpace: "nowrap",
        overflow: "hidden", textOverflow: "ellipsis" }}>{toast}</div>}
    </div>);

}

Object.assign(window, { SettingsScreen });
