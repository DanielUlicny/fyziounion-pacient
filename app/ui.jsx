// app/ui.jsx — shared primitives + theme context for fyzio
// Exports to window: TweakCtx, useT, VideoMedia, Tag, StatBadge, BottomNav,
//   PrimaryButton, Segmented, Sheet, ProgressRing

const TweakCtx = React.createContext({});
const useT = () => React.useContext(TweakCtx);

// ── Exercise media placeholder ───────────────────────────────
function VideoMedia({ style, label = "video cviku", rounded = 20, playing = false, big = false }) {
  const t = useT();
  const mode = t.imagery || "striped";
  const r = rounded;
  if (mode === "abstract") {
    return (
      <div style={{
        position: "relative", borderRadius: r, overflow: "hidden",
        background: "linear-gradient(150deg, var(--accent-wash) 0%, #fff 55%, var(--accent-wash) 100%)",
        ...style,
      }}>
        <div style={{ position: "absolute", width: "60%", height: "55%", left: "-10%", top: "12%",
          background: "radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", width: "55%", height: "55%", right: "-8%", bottom: "8%",
          background: "radial-gradient(circle, var(--accent-soft2) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: big ? 64 : 38, height: big ? 64 : 38, borderRadius: "50%",
            background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 18px rgba(40,60,120,0.14)" }}>
            <Icon name={playing ? "pause" : "play"} size={big ? 26 : 16} stroke="var(--accent)" />
          </div>
        </div>
      </div>
    );
  }
  // striped
  return (
    <div style={{
      position: "relative", borderRadius: r, overflow: "hidden",
      background: "#eef1f6",
      backgroundImage: "repeating-linear-gradient(135deg, rgba(120,132,165,0.10) 0 8px, transparent 8px 16px)",
      border: "1px solid var(--line)",
      ...style,
    }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: big ? 12 : 6 }}>
        <div style={{ width: big ? 60 : 34, height: big ? 60 : 34, borderRadius: "50%",
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(40,60,120,0.10)" }}>
          <Icon name={playing ? "pause" : "play"} size={big ? 24 : 15} stroke="var(--accent)" />
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: big ? 12 : 9.5, letterSpacing: 0.4,
          color: "#9aa1b6", textTransform: "uppercase" }}>{label}</span>
      </div>
    </div>
  );
}

// ── Exercise metric model (series · time/reps · weight · rest) ──
function exMetrics(ex, { seriesDone = 0, done = false, includeRest = true } = {}) {
  const m = [];
  m.push({ key: "sets", label: "Série", value: done ? `${ex.sets}/${ex.sets}` : `${seriesDone}/${ex.sets}` });
  if (ex.kind === "time") m.push({ key: "time", label: "Výdrž", value: `${ex.hold} s` });
  if (ex.reps) m.push({ key: "reps", label: "Opakovania", value: `${ex.reps}×` });
  if (ex.weight) m.push({ key: "weight", label: "Záťaž", value: `${String(ex.weight).replace(".", ",")} kg` });
  if (includeRest) m.push({ key: "rest", label: "Pauza", value: `${ex.rest} s` });
  return m;
}

// ── Marquee (scrolls long text right→left, loops; static if it fits) ──
function Marquee({ text, style }) {
  const wrapRef = React.useRef(null);
  const txtRef = React.useRef(null);
  const [dist, setDist] = React.useState(0);
  React.useLayoutEffect(() => {
    const measure = () => {
      const w = wrapRef.current, t = txtRef.current;
      if (!w || !t) return;
      const over = t.scrollWidth - w.clientWidth;
      setDist(over > 2 ? over : 0);
    };
    measure();
    const t1 = setTimeout(measure, 350);
    const t2 = setTimeout(measure, 1200);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener("resize", measure); };
  }, [text]);
  const dur = Math.max(5, (dist + 64) / 26);
  return (
    <div ref={wrapRef} style={{ overflow: "hidden", whiteSpace: "nowrap", ...style }}>
      <span ref={txtRef} style={{
        display: "inline-block", willChange: dist ? "transform" : "auto",
        animation: dist ? `fzMarquee ${dur}s ease-in-out infinite` : "none",
        ["--mq-end"]: `${-(dist + 26)}px`,
      }}>{text}</span>
    </div>
  );
}

// ── Small tag (Sets 0 of 2, Time 30s) ────────────────────────
function Tag({ label, value, tone = "default" }) {
  const tones = {
    default: { bg: "var(--chip)", fg: "var(--text)", lab: "var(--ink)" },
    accent: { bg: "var(--accent-wash)", fg: "var(--accent-ink)", lab: "var(--accent)" },
    done: { bg: "var(--ok-wash)", fg: "var(--ok-ink)", lab: "var(--ok)" },
  };
  const c = tones[tone] || tones.default;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, borderRadius: 9, padding: "5px 9px", fontSize: 12.5, fontWeight: 500, color: c.fg }}>
      {label && <span style={{ fontWeight: 700, color: c.lab }}>{label}</span>}
      {value}
    </span>
  );
}

// ── Primary CTA ──────────────────────────────────────────────
function PrimaryButton({ children, onClick, disabled, style, icon }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", border: "none", borderRadius: 16, cursor: disabled ? "default" : "pointer",
      padding: "16px 18px", fontSize: 16.5, fontWeight: 650, fontFamily: "inherit", whiteSpace: "nowrap",
      color: "#fff", background: disabled ? "var(--accent-disabled)" : "var(--accent)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: "none",
      transition: "transform .12s ease, background .2s ease", ...style,
    }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.985)"; }}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
      {icon && <Icon name={icon} size={19} stroke="#fff" />}
      {children}
    </button>
  );
}

// ── Segmented control (timeframe filters) ────────────────────
function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: "var(--chip)", borderRadius: 13, padding: 4, gap: 2 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            flex: 1, border: "none", cursor: "pointer", fontFamily: "inherit",
            borderRadius: 10, padding: "8px 4px", fontSize: 13.5, fontWeight: active ? 650 : 500,
            color: active ? "var(--ink)" : "var(--muted)",
            background: active ? "#fff" : "transparent",
            boxShadow: active ? "0 1px 4px rgba(30,40,70,0.10)" : "none",
            transition: "all .18s ease",
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// ── Progress ring ────────────────────────────────────────────
function ProgressRing({ value, size = 56, sw = 6, children, color = "var(--accent)", track = "var(--ring-track)" }) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

// ── Bottom navigation ────────────────────────────────────────
function BottomNav({ tab, onTab }) {
  const items = [
    { id: "home", label: "Domov", icon: "home" },
    { id: "progress", label: "Pokrok", icon: "chart" },
    { id: "settings", label: "Nastavenia", icon: "gear" },
  ];
  return (
    <div data-tour="nav" style={{
      flexShrink: 0, display: "flex", alignItems: "flex-start",
      background: "#fff",
      borderTop: "1px solid var(--line)", padding: "10px 12px 26px",
    }}>
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => onTab(it.id)} style={{
            flex: 1, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "2px 0",
            color: active ? "var(--accent)" : "var(--nav-idle)",
          }}>
            <Icon name={it.icon} size={24} sw={active ? 2.1 : 1.8} />
            <span style={{ fontSize: 11.5, fontWeight: active ? 650 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Bottom sheet wrapper ─────────────────────────────────────
function Sheet({ open, onClose, children, height = "auto" }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: open ? "auto" : "none" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "transparent" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height, maxHeight: "94%",
        background: "#fff", borderRadius: "26px 26px 0 0",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform .32s cubic-bezier(.32,.72,0,1)",
        boxShadow: "0 -10px 40px rgba(20,28,55,0.18)",
        display: "flex", flexDirection: "column",
        paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}>
        <div style={{ flexShrink: 0, width: 38, height: 5, borderRadius: 3, background: "var(--line)", margin: "10px auto 12px" }} />
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px" }}>{children}</div>
      </div>
    </div>
  );
}


// ── Series progress color helpers ────────────────────────────
const srBg = (n, sets) => {
  if (n >= sets) return "var(--ok)";
  if (n === 0) return "#fff";
  const t = (n - 1) / Math.max(sets - 1, 1);
  return `color-mix(in oklch, var(--accent) ${Math.round(20 + t * 80)}%, white)`;
};
const srIcon = (n, sets) => {
  if (n === 0) return "var(--faint)";
  if (n >= sets) return "#fff";
  const t = (n - 1) / Math.max(sets - 1, 1);
  return t < 0.35 ? "var(--accent)" : "#fff";
};

Object.assign(window, { TweakCtx, useT, VideoMedia, Tag, StatBadge: Tag, BottomNav, PrimaryButton, Segmented, Sheet, ProgressRing, Marquee, exMetrics, srBg, srIcon });
