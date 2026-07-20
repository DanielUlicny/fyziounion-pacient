// app/ui.jsx — shared primitives + theme context for fyzio
// Exports to window: TweakCtx, useT, VideoMedia, Tag, StatBadge, BottomNav,
//   PrimaryButton, Segmented, Sheet, ProgressRing

const TweakCtx = React.createContext({});
const useT = () => React.useContext(TweakCtx);

// ── Exercise media: real video in the player, poster in thumbnails ──
const EX_VIDEO = (window.__resources && window.__resources.exVid) || "media/cvik-zapastie.mp4";
const EX_POSTER = (window.__resources && window.__resources.exPos) || "media/cvik-poster.png";

function VideoMedia({ style, label = "video cviku", rounded = 20, playing = false, big = false,
  muted = true, src = EX_VIDEO, poster = EX_POSTER, onProgress, controlsRef }) {
  const r = rounded;
  const vref = React.useRef(null);
  const [loaded, setLoaded] = React.useState(false);

  // big player follows the `playing` prop — plays ONLY while the detail is open
  React.useEffect(() => {
    if (!big) return;
    const v = vref.current; if (!v) return;
    if (playing) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    else v.pause();
  }, [playing, big]);

  // reflect mute state onto the element (React's muted attr alone is unreliable);
  // on unmute set full volume and (re)start playback to satisfy the gesture
  React.useEffect(() => {
    if (!big) return;
    const v = vref.current; if (!v) return;
    v.muted = muted;
    if (!muted) { v.volume = 1; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
  }, [muted, big]);

  // expose a seek() control + report progress to the parent
  React.useEffect(() => {
    if (!big) return;
    if (controlsRef) controlsRef.current = {
      seek: (frac) => {
        const v = vref.current; if (!v) return;
        const d = v.duration;
        if (!d || isNaN(d)) return;
        v.currentTime = Math.max(0, Math.min(1, frac)) * d;
      },
    };
  }, [big, controlsRef]);

  // pause on unmount so nothing keeps playing in the background
  React.useEffect(() => () => { if (vref.current) vref.current.pause(); }, []);

  if (big) {
    const report = () => { const v = vref.current; if (v && onProgress) onProgress(v.currentTime || 0, v.duration || 0); };
    return (
      <div style={{ position: "relative", borderRadius: r, overflow: "hidden", background: "#0c1020", ...style }}>
        {!loaded && <div className="fz-skeleton" style={{ position: "absolute", inset: 0, zIndex: 1 }} />}
        <video ref={vref} src={src} poster={poster} muted={muted} loop playsInline preload="auto"
          controls={false} disablePictureInPicture disableRemotePlayback
          controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
          x-webkit-airplay="deny"
          onLoadedData={() => setLoaded(true)}
          onTimeUpdate={report} onLoadedMetadata={report}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
            opacity: loaded ? 1 : 0, transition: "opacity .4s ease" }} />
      </div>
    );
  }

  // thumbnail: poster image with shimmer skeleton until it loads
  return (
    <div style={{ position: "relative", borderRadius: r, overflow: "hidden", background: "#eef1f6", ...style }}>
      {!loaded && <div className="fz-skeleton" style={{ position: "absolute", inset: 0, zIndex: 1 }} />}
      <img src={poster} alt={label || "cvik"} onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
          opacity: loaded ? 1 : 0, transition: "opacity .4s ease" }} />
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
        boxShadow: open ? "0 -10px 40px rgba(20,28,55,0.18)" : "none",
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
