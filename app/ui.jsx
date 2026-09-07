// app/ui.jsx — shared primitives + theme context for fyzio
// Exports to window: TweakCtx, useT, VideoMedia, Tag, StatBadge, BottomNav,
//   PrimaryButton, Segmented, Sheet, ProgressRing

const TweakCtx = React.createContext({});
const useT = () => React.useContext(TweakCtx);

// ── Thumbnail: reveal the clip only once it actually has a decoded frame ──
function VideoThumb({ src, label, r, style }) {
  const ref = React.useRef(null);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    setReady(false);
    const id = setTimeout(() => {
      const v = ref.current;
      if (v && v.videoWidth > 0) setReady(true);
    }, 1500);
    return () => clearTimeout(id);
  }, [src]);
  const reveal = (ev) => { if (ev.currentTarget.videoWidth > 0) setReady(true); };
  return (
    <div style={{ position: "relative", borderRadius: r, overflow: "hidden",
      background: "linear-gradient(160deg,#E7EDF1,#D8E0E6)", ...style }}>
      <video ref={ref} src={/^(blob|data):/.test(src) ? src : src + "#t=0.1"} muted playsInline
        preload="metadata" controls={false} disablePictureInPicture disableRemotePlayback
        controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        aria-label={label || "cvik"}
        onLoadedMetadata={reveal} onLoadedData={reveal} onCanPlay={reveal}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
          opacity: ready ? 1 : 0, transition: "opacity .3s ease" }} />
    </div>);

}

// ── Exercise media: real video in the player, poster in thumbnails ──
const EX_VIDEO = (window.__resources && window.__resources.exVid) || "media/cvik-zapastie.mp4";
const EX_POSTER = (window.__resources && window.__resources.exPos) || "media/cvik-poster.png";

function VideoMedia({ style, label = "video cviku", rounded = 20, playing = false, big = false,
  muted = true, src = EX_VIDEO, poster, onProgress, controlsRef }) {
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

  // thumbnail: without a poster image, use the video's own first frame
  if (!poster) return <VideoThumb src={src} label={label} r={r} style={style} />;
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
      width: "100%", border: "none", borderRadius: 6, cursor: disabled ? "default" : "pointer",
      padding: "16px 18px", fontSize: 16.5, fontWeight: 650, fontFamily: "inherit", whiteSpace: "nowrap",
      color: disabled ? "var(--muted)" : "#fff", background: disabled ? "var(--chip)" : "var(--accent)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: "none",
      transition: "transform .12s ease, background .2s ease", ...style,
    }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.985)"; }}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
      {icon && <Icon name={icon} size={19} stroke={disabled ? "var(--muted)" : "#fff"} />}
      {children}
    </button>
  );
}

// ── Segmented control (timeframe filters) ────────────────────
// sliding thumb + a clipped copy of the labels — no per-tab color flicker
function Segmented({ options, value, onChange }) {
  const n = options.length;
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const [pressed, setPressed] = React.useState(null);
  const seg = 100 / n;
  const clip = `inset(0 ${(n - idx - 1) * seg}% 0 ${idx * seg}% round 10px)`;
  const row = (color, weight) =>
  <div style={{ position: "absolute", inset: 0, display: "flex", gap: 2, pointerEvents: "none" }}>
    {options.map((o) =>
    <span key={o.value} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13.5, fontWeight: weight, color, whiteSpace: "nowrap" }}>{o.label}</span>)}
  </div>;

  return (
    <div style={{ position: "relative", display: "flex", background: "var(--chip)", borderRadius: 13, padding: 4, gap: 2 }}>
      <div aria-hidden="true" style={{ position: "absolute", top: 4, bottom: 4, left: 4, right: 4,
        pointerEvents: "none", clipPath: clip, transition: "clip-path .28s cubic-bezier(.32,.72,0,1)" }}>
        <div style={{ position: "absolute", inset: 0, background: "var(--accent)", borderRadius: 10 }} />
      </div>
      <div aria-hidden="true" style={{ position: "absolute", top: 4, bottom: 4, left: 4, right: 4,
        pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }}>
        {row("var(--muted)", 500)}
        <div style={{ position: "absolute", inset: 0, clipPath: clip,
          transition: "clip-path .28s cubic-bezier(.32,.72,0,1)" }}>
          {row("#fff", 650)}
        </div>
      </div>
      {options.map((o) =>
      <button key={o.value} onClick={() => onChange(o.value)} aria-pressed={o.value === value}
        onPointerDown={() => setPressed(o.value)} onPointerUp={() => setPressed(null)}
        onPointerCancel={() => setPressed(null)} onPointerLeave={() => setPressed(null)}
        style={{ position: "relative", zIndex: 2, flex: 1, border: "none", cursor: "pointer", fontFamily: "inherit",
          background: "transparent", color: "transparent", borderRadius: 10, padding: "0 4px",
          minHeight: 34, height: 34, fontSize: 13.5,
          transform: pressed === o.value ? "scale(0.97)" : "none",
          transition: "transform .12s ease" }}>
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap" }}>{o.label}</span>
      </button>)}
    </div>);
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
      borderTop: "1px solid var(--line)", paddingTop: 10, paddingLeft: 12, paddingRight: 12,
      paddingBottom: "calc(6px + max(env(safe-area-inset-bottom), 16px))",
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
function Sheet({ open, onClose, children, header, height = "auto" }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: open ? "auto" : "none" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,28,45,0.34)",
        opacity: open ? 1 : 0, transition: "opacity .3s ease" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height, maxHeight: "94%",
        background: "#fff", borderRadius: "26px 26px 0 0",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform .32s cubic-bezier(.32,.72,0,1)",
        boxShadow: open ? "0 -10px 40px rgba(20,28,55,0.18)" : "none",
        display: "flex", flexDirection: "column",
        paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}>
        <div style={{ flexShrink: 0, width: 38, height: 5, borderRadius: 3, background: "var(--line)", margin: "10px auto 12px" }} />
        {header && <div style={{ flexShrink: 0, padding: "0 20px 12px", borderBottom: "1px solid var(--line)" }}>{header}</div>}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: header ? "14px 20px 0" : "0 20px" }}>{children}</div>
      </div>
    </div>
  );
}


// ── Series progress color helpers ────────────────────────────
// in-progress steps: slate at 8 / 16 / 24 % over white; done: success wash
// solid mixes of the slate accent over white (interpolable, unlike color-mix())
const SR_SHADES = { 10: "#E8EBEF", 15: "#DDE2E7", 20: "#D3D9E0", 25: "#C8D0D9", 30: "#BEC7D1" };
const srBg = (n, sets) => {
  if (n >= sets) return "var(--ok-wash)";
  if (n <= 0) return "#fff";
  // 2 series → 15 %; otherwise 10 % per completed series
  const pct = sets === 2 ? 15 : Math.min(30, n * 10);
  return SR_SHADES[pct] || SR_SHADES[30];
};
const srIcon = (n, sets) => n >= sets ? "var(--ok-ink)" : "var(--ink)";

// ── Press behaviour: highlight on touch-down, act on touch-up, drag away cancels ──
function usePress(onAction, slop = 10) {
  const [pressed, setPressed] = React.useState(false);
  const ref = React.useRef(null);
  const inside = (e) => {
    const r = ref.current && ref.current.getBoundingClientRect();
    if (!r) return false;
    return e.clientX >= r.left - slop && e.clientX <= r.right + slop &&
    e.clientY >= r.top - slop && e.clientY <= r.bottom + slop;
  };
  return { ref, pressed, handlers: {
      onPointerDown: () => setPressed(true),
      onPointerMove: (e) => { if (pressed && !inside(e)) setPressed(false); },
      onPointerUp: (e) => { const was = pressed; setPressed(false); if (was && inside(e)) onAction(); },
      onPointerCancel: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
      onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAction(); } } } };
}

Object.assign(window, { TweakCtx, useT, VideoMedia, Tag, StatBadge: Tag, BottomNav, PrimaryButton, Segmented, Sheet, ProgressRing, Marquee, exMetrics, srBg, srIcon, usePress });
