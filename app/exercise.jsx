// app/exercise.jsx — exercise detail: portrait video + draggable detail sheet
// Exports to window: ExerciseDetail

const CARD_DEFAULT = 300;
const CARD_EXPANDED = 512;

function ExerciseDetail({ ex, done, seriesDone = 0, onAddSeries, onBack, hasNext, onNext, hasPrev, onPrev }) {
  const [playing, setPlaying] = React.useState(true);
  const [secLeft, setSecLeft] = React.useState(ex.kind === "time" ? ex.hold : null);
  const [running, setRunning] = React.useState(false);
  const [view, setView] = React.useState("default"); // default | expanded | fullscreen
  const [liveH, setLiveH] = React.useState(null);     // live card height while dragging
  const drag = React.useRef({ y: 0, active: false, moved: false });
  const partial = seriesDone > 0 && !done;
  const hasTimer = ex.kind === "time";

  // switching exercises keeps the current view (e.g. fullscreen) but resets the clip
  React.useEffect(() => {
    setPlaying(true);
    setSecLeft(ex.kind === "time" ? ex.hold : null);
    setRunning(false);
  }, [ex.id]);

  // vertical swipe on the video → next / previous exercise (works in fullscreen too)
  const vSwipe = React.useRef({ y: 0, active: false });
  const onVideoDown = (e) => { vSwipe.current = { y: e.clientY, active: true }; };
  const onVideoUp = (e) => {
    if (!vSwipe.current.active) return;
    const dy = e.clientY - vSwipe.current.y;
    vSwipe.current.active = false;
    if (filled) { setView("default"); setLiveH(null); return; }
    if (dy < -64 && hasNext) onNext && onNext();
    else if (dy > 64 && hasPrev) onPrev && onPrev();
  };

  const baseH = view === "expanded" ? CARD_EXPANDED : view === "fullscreen" ? 0 : CARD_DEFAULT;
  const cardH = liveH != null ? liveH : baseH;
  const filled = cardH < 60; // video fills the screen
  // description reveals once the sheet is pulled up past the default
  const showDetails = view === "expanded" || (liveH != null && liveH > CARD_DEFAULT + 50);

  // ── drag on the sheet handle ──
  const onDown = (e) => {
    drag.current = { y: e.clientY, base: baseH, active: true, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current.active) return;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dy) > 4) drag.current.moved = true;
    let h = drag.current.base - dy; // drag up → taller
    h = Math.max(0, Math.min(CARD_EXPANDED, h));
    setLiveH(h);
  };
  const onUp = () => {
    if (!drag.current.active) return;
    const h = liveH;
    drag.current.active = false;
    setLiveH(null);
    if (!drag.current.moved) { // tap → toggle default/expanded
      setView((v) => (v === "expanded" ? "default" : "expanded"));
      return;
    }
    if (h == null) return;
    if (h < 60) setView("fullscreen");
    else if (h > (CARD_DEFAULT + CARD_EXPANDED) / 2) setView("expanded");
    else setView("default");
  };

  React.useEffect(() => {
    if (!running || secLeft == null) return;
    if (secLeft <= 0) { setRunning(false); setSecLeft(ex.hold); return; }
    const id = setTimeout(() => setSecLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, secLeft]);

  const mm = String(Math.floor((secLeft || 0) / 60)).padStart(1, "0");
  const ss = String((secLeft || 0) % 60).padStart(2, "0");
  const timerActive = hasTimer && (running || (secLeft != null && secLeft < ex.hold));
  const startTimer = () => { setSecLeft(ex.hold); setRunning(true); };
  const cancelTimer = () => { setRunning(false); setSecLeft(ex.hold); };
  const noTrans = liveH != null;
  const ease = "cubic-bezier(.32,.72,0,1)";

  const metrics = exMetrics(ex, { seriesDone, done });
  const compactStat = metrics.length >= 4;

  const Stat = ({ m }) => {
    const tone = m.key === "sets" ? (done ? "ok" : partial ? "accent" : "plain") : "plain";
    const bg = tone === "ok" ? "var(--ok-wash)" : tone === "accent" ? "var(--accent-wash)" : "var(--chip)";
    const fg = tone === "ok" ? "var(--ok-ink)" : tone === "accent" ? "var(--accent-ink)" : "var(--ink)";
    return (
      <div style={{ flex: 1, minWidth: 0, background: bg, borderRadius: 12,
        padding: compactStat ? "7px 4px" : "9px 6px", textAlign: "center" }}>
        <div style={{ fontSize: compactStat ? 15 : 17, fontWeight: 790, letterSpacing: -0.3, lineHeight: 1,
          color: fg, whiteSpace: "nowrap" }}>{m.value}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)",
          marginTop: 4, whiteSpace: "nowrap" }}>{m.label}</div>
      </div>
    );
  };

  return (
    <div style={{ height: "100%", position: "relative", background: filled ? "#0c1020" : "var(--bg)",
      overflow: "hidden", transition: noTrans ? "none" : `background .3s ${ease}` }}>

      {/* ── video stage (narrow phone-rectangle portrait) ── */}
      <div onPointerDown={onVideoDown} onPointerUp={onVideoUp} onPointerCancel={() => { vSwipe.current.active = false; }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: cardH,
        transition: noTrans ? "none" : `bottom .34s ${ease}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        touchAction: "pan-x", padding: filled ? 0 : "64px 20px 12px" }}>

        <div data-tour="ex-video" style={{
          position: "relative",
          height: "100%", width: filled ? "100%" : "auto",
          aspectRatio: filled ? "auto" : "0.62 / 1",
          maxWidth: "100%",
          borderRadius: filled ? 0 : 26, overflow: "hidden",
          boxShadow: filled ? "none" : "0 18px 44px rgba(20,30,70,0.18)",
          transition: noTrans ? "none" : `border-radius .3s ${ease}`,
        }}>
          <VideoMedia big playing={playing} style={{ width: "100%", height: "100%" }}
            rounded={filled ? 0 : 26} label="video cviku" />

          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120,
            background: "linear-gradient(to top, rgba(12,18,40,0.5), transparent)", pointerEvents: "none" }} />

          {!filled && (
            <button onClick={(e) => { e.stopPropagation(); setView((v) => (v === "fullscreen" ? "default" : "fullscreen")); }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Celá obrazovka" style={{
              position: "absolute", top: 14, right: 14, zIndex: 6,
              width: 34, height: 34, borderRadius: "50%", border: "none",
              background: "rgba(12,18,40,0.4)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="expand" size={17} stroke="#fff" sw={2} />
            </button>
          )}

          <button onClick={(e) => { e.stopPropagation(); setPlaying((p) => !p); }} onPointerUp={(e) => e.stopPropagation()} aria-label={playing ? "Pozastaviť" : "Prehrať"} style={{
            position: "absolute", left: 16, bottom: 16, zIndex: 6,
            width: 36, height: 36, border: "none", background: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))" }}>
            <Icon name={playing ? "pause" : "play"} size={22} stroke="#fff" sw={2.2} />
          </button>
          <div style={{ position: "absolute", right: 16, bottom: 16, zIndex: 6,
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))" }}>
            <Icon name="sound" size={22} stroke="#fff" sw={2.2} />
          </div>
        </div>
      </div>

      {/* ── back button — hidden in fullscreen ── */}
      {!filled && (
        <button onClick={onBack} aria-label="Späť" style={{
          position: "absolute", top: 56, left: 18, zIndex: 20,
          width: 42, height: 42, borderRadius: "50%", cursor: "pointer",
          border: "1px solid var(--line)", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(30,40,70,0.08)" }}>
          <Icon name="chevL" size={22} stroke="var(--ink)" />
        </button>
      )}



      {/* ── drag handle when fullscreen — always in DOM so setPointerCapture survives filled→false mid-drag ── */}
      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 48, zIndex: 20,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: 12, cursor: "grab", touchAction: "none",
          opacity: filled ? 1 : 0,
          pointerEvents: filled ? "auto" : "none" }}>
        <div style={{ width: 44, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.4)" }} />
      </div>

      {/* ── bottom detail sheet ── */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: cardH,
        background: "#fff", borderRadius: "24px 24px 0 0",
        boxShadow: "0 -8px 32px rgba(10,15,40,0.12)",
        transition: noTrans ? "none" : `height .34s ${ease}`,
        display: "flex", flexDirection: "column", overflow: "hidden",
        opacity: filled ? 0 : 1, pointerEvents: filled ? "none" : "auto" }}>

        {/* drag handle */}
        <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          style={{ flexShrink: 0, padding: "11px 0 9px", cursor: "grab", touchAction: "none",
            display: "flex", justifyContent: "center" }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: "var(--faint)" }} />
        </div>

        {/* body */}
        <div style={{ flex: 1, minHeight: 0, padding: "0 20px 22px", display: "flex", flexDirection: "column" }}>

          {/* name + variation + completion (flexShrink 0) */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Marquee text={ex.name} style={{ fontSize: 24, fontWeight: 780, color: "#0d1322", lineHeight: 1.18, letterSpacing: -0.5 }} />
              {ex.variation && (
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--muted)", marginTop: 5 }}>{ex.variation}</div>
              )}
            </div>
            <button onClick={onAddSeries} aria-label="Pridať sériu" data-tour="ex-series-btn" style={{
              flexShrink: 0, width: 50, height: 50, borderRadius: 16, cursor: "pointer", fontFamily: "inherit",
              border: seriesDone === 0 ? "1.5px solid var(--line)" : "none",
              background: srBg(seriesDone, ex.sets),
              display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s ease" }}>
              <Icon name="check" size={23} stroke={srIcon(seriesDone, ex.sets)} sw={2.4} />
            </button>
          </div>

          {/* metric stats — série · výdrž · (záťaž) · pauza (flexShrink 0) */}
          <div style={{ flexShrink: 0, display: "flex", gap: 8 }}>
            {metrics.map((m) => <Stat key={m.key} m={m} />)}
          </div>

          {/* MIDDLE — description emerges here, between stats and timer */}
          <div style={{ flex: 1, minHeight: 0, overflowY: showDetails ? "auto" : "hidden",
            display: "flex", flexDirection: "column", justifyContent: showDetails ? "flex-start" : "center" }}>
            {showDetails ? (
              <div className="fz-fade" style={{ padding: "14px 0 8px" }}>
                <div style={{ fontSize: 15.5, color: "#0d1322", lineHeight: 1.55, textWrap: "pretty" }}>
                  {ex.hint} Pohyb robte pomaly a plynulo, bez bolesti.
                </div>
              </div>
            ) : (
              <button onClick={() => setView("expanded")} style={{ alignSelf: "center", whiteSpace: "nowrap",
                border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6, padding: "8px 0",
                fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                <Icon name="chevronDown" size={15} stroke="var(--muted)" style={{ transform: "rotate(180deg)" }} />
                Potiahnite nahor pre popis
              </button>
            )}
          </div>

          {/* TIMER — plain stopwatch row (euneo style), divider above; fixed height so it never jumps */}
          {hasTimer && (
            <div data-tour="ex-timer" style={{ flexShrink: 0, borderTop: "1px solid var(--line)", paddingTop: 16, marginTop: 4, marginBottom: 24 }}>
              {timerActive ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 40 }}>
                  <Icon name="timer" size={26} stroke="var(--ink)" />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 19, fontWeight: 650, color: "var(--ink)",
                    fontVariantNumeric: "tabular-nums" }}>{mm}:{ss}</span>
                  <button onClick={cancelTimer} style={{ flexShrink: 0, border: "1px solid var(--line)", cursor: "pointer",
                    fontFamily: "inherit", background: "#fff", color: "var(--ink)", borderRadius: 10,
                    padding: "8px 16px", fontSize: 15, fontWeight: 600 }}>Zrušiť</button>
                </div>
              ) : (
                <button onClick={startTimer} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, minHeight: 40,
                  background: "transparent", border: "none", padding: 0,
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <Icon name="timer" size={26} stroke="var(--ink)" />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 19, fontWeight: 650, color: "var(--ink)" }}>Nastavte časovač na {ex.hold} sekúnd</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ExerciseDetail });
