// app/exercise.jsx — exercise detail: portrait video + draggable detail sheet
// Exports to window: ExerciseDetail

const CARD_DEFAULT = 356;
const CARD_EXPANDED = 512;

function fmtTime(s) {
  s = Math.max(0, Math.floor(s || 0));
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function ExerciseDetail({ ex, done, seriesDone = 0, onAddSeries, onReset, onBack, hasNext, onNext, hasPrev, onPrev }) {
  const [playing, setPlaying] = React.useState(true);
  const [muted, setMuted] = React.useState(true);
  const [cur, setCur] = React.useState(0);
  const [dur, setDur] = React.useState(0);
  const vctrl = React.useRef(null);
  const [secLeft, setSecLeft] = React.useState(ex.kind === "time" ? ex.hold : null);
  const [running, setRunning] = React.useState(false);
  const [view, setView] = React.useState("default"); // default | expanded | fullscreen
  const [liveH, setLiveH] = React.useState(null);     // live card height while dragging
  const drag = React.useRef({ y: 0, active: false, moved: false });
  const partial = seriesDone > 0 && !done;
  const hasTimer = ex.kind === "time";
  // controls auto-hide after 3 s of no touch; never while paused
  const [ctrlsOn, setCtrlsOn] = React.useState(true);
  React.useEffect(() => {
    if (!playing) { setCtrlsOn(true); return; }
    if (!ctrlsOn) return;
    const id = setTimeout(() => setCtrlsOn(false), 3000);
    return () => clearTimeout(id);
  }, [ctrlsOn, playing]);
  const poke = () => setCtrlsOn(true);
  const ctrlStyle = { opacity: ctrlsOn ? 1 : 0, transition: "opacity .2s ease",
    pointerEvents: ctrlsOn ? "auto" : "none" };

  // switching exercises keeps the current view (e.g. fullscreen) but resets the clip
  React.useEffect(() => {
    setPlaying(true);
    setSecLeft(ex.kind === "time" ? ex.hold : null);
    setRunning(false);
  }, [ex.id]);

  // vertical swipe on the video → next / previous exercise (works in fullscreen too)
  const vSwipe = React.useRef({ y: 0, active: false });
  const onVideoDown = (e) => { vSwipe.current = { y: e.clientY, active: true, wasOn: ctrlsOn }; poke(); };
  const onVideoUp = (e) => {
    if (!vSwipe.current.active) return;
    const dy = e.clientY - vSwipe.current.y;
    vSwipe.current.active = false;
    if (Math.abs(dy) < 8) { if (vSwipe.current.wasOn) setCtrlsOn(false); return; }
    if (dy < -64 && hasNext) onNext && onNext();
    else if (dy > 64 && hasPrev) onPrev && onPrev();
  };

  const baseH = view === "expanded" ? CARD_EXPANDED : view === "fullscreen" ? 0 : CARD_DEFAULT;
  const cardH = baseH;
  const filled = cardH < 60; // video fills the screen
  const sheetRef = React.useRef(null);
  const [sheetH, setSheetH] = React.useState(CARD_DEFAULT);
  React.useLayoutEffect(() => {
    if (filled) { setSheetH(0); return; }
    const el = sheetRef.current;
    if (el) setSheetH(el.getBoundingClientRect().height);
    const id = setTimeout(() => {
      const el2 = sheetRef.current;
      if (el2 && !filled) setSheetH(el2.getBoundingClientRect().height);
    }, 120);
    return () => clearTimeout(id);
  }, [filled, view, ex.id, seriesDone, running, secLeft]);
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
  const topInset = filled ? "calc(12px + max(env(safe-area-inset-top), 44px))" : 12;
  const botInset = filled ? 34 : 0;
  const noTrans = liveH != null;
  const ease = "cubic-bezier(.32,.72,0,1)";

  // tap = +1 series, long press = reset to 0
  const srTimer = React.useRef(null);
  const srLong = React.useRef(false);
  const seriesPress = {
    onPointerDown: () => { srLong.current = false;
      srTimer.current = setTimeout(() => { srLong.current = true; onReset && onReset(); }, 520); },
    onPointerUp: () => { clearTimeout(srTimer.current); if (!srLong.current) onAddSeries && onAddSeries(); },
    onPointerCancel: () => clearTimeout(srTimer.current),
    onPointerLeave: () => clearTimeout(srTimer.current) };

  // does the description need a "Zobraziť viac" link?
  const descText = `${ex.hint} Pohyb robte pomaly a plynulo, bez bolesti.${ex.note ? " " + ex.note : ""}`;
  const descRef = React.useRef(null);
  const [clamped, setClamped] = React.useState(false);
  React.useEffect(() => {
    const el = descRef.current; if (!el) return;
    const check = () => {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 23;
      setClamped(el.scrollHeight > lh * 3 + 2);
    };
    const id = setTimeout(check, 60);
    return () => clearTimeout(id);
  }, [descText, cardH, showDetails]);

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
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: sheetH,
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
          <VideoMedia big playing={playing} muted={muted}
            src={ex.video} poster={ex.poster}
            onProgress={(c, d) => { setCur(c); setDur(d); }} controlsRef={vctrl}
            style={{ width: "100%", height: "100%" }}
            rounded={filled ? 0 : 26} label="video cviku" />

          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
            opacity: ctrlsOn ? 1 : 0, transition: "opacity .2s ease",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.6) 100%)" }} />

          <button onClick={(e) => { e.stopPropagation(); poke(); setView((v) => v === "fullscreen" ? "default" : "fullscreen"); }}
            onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}
            aria-label={filled ? "Zmenšiť" : "Celá obrazovka"} style={{
            position: "absolute", top: topInset, right: 12, zIndex: 30,
            width: 44, height: 44, borderRadius: 6, border: "none",
            background: "rgba(0,0,0,0.45)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", ...ctrlStyle }}>
            <Icon name={filled ? "collapse" : "expand"} size={19} stroke="#fff" sw={2} />
          </button>

          {/* bottom control cluster — play/pause + sound row, then white scrub bar, then time labels */}
          <button onClick={(e) => { e.stopPropagation(); poke(); setPlaying((p) => !p); }} onPointerUp={(e) => e.stopPropagation()} aria-label={playing ? "Pozastaviť" : "Prehrať"} style={{
            position: "absolute", left: 6, bottom: 48 + botInset, zIndex: 6,
            width: 44, height: 44, border: "none", background: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))", ...ctrlStyle }}>
            <Icon name={playing ? "pause" : "play"} size={21} stroke="#fff" sw={2.2} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); poke(); setMuted((m) => !m); }} onPointerUp={(e) => e.stopPropagation()}
            aria-label={muted ? "Zapnúť zvuk" : "Stlmiť"} style={{
            position: "absolute", right: 12, bottom: 48 + botInset, zIndex: 6,
            width: 44, height: 44, border: "none", background: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))", ...ctrlStyle }}>
            <Icon name={muted ? "soundOff" : "sound"} size={21} stroke="#fff" sw={2.2} />
          </button>

          {/* white seekable timeline — spans from the pause icon to the sound icon */}
          <div onPointerDown={(e) => {
              e.stopPropagation(); e.preventDefault();
              const track = e.currentTarget;
              try { track.setPointerCapture(e.pointerId); } catch (err) {}
              const seek = (clientX) => {
                const rr = track.getBoundingClientRect();
                const frac = (clientX - rr.left) / rr.width;
                vctrl.current && vctrl.current.seek(frac);
              };
              seek(e.clientX);
              const move = (ev) => seek(ev.clientX);
              const up = () => {
                track.removeEventListener("pointermove", move);
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
              };
              track.addEventListener("pointermove", move);
              window.addEventListener("pointermove", move);
              window.addEventListener("pointerup", up);
            }}
            style={{ position: "absolute", left: 22, right: 22, bottom: 30 + botInset, zIndex: 6,
              height: 24, display: "flex", alignItems: "center", cursor: "pointer", touchAction: "none", ...ctrlStyle }}>
            <div style={{ position: "relative", width: "100%", height: 4, borderRadius: 99,
              background: "rgba(255,255,255,0.35)", pointerEvents: "none" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 99,
                width: `${dur ? (cur / dur) * 100 : 0}%`, background: "#fff" }} />
              <div style={{ position: "absolute", top: "50%", left: `${dur ? (cur / dur) * 100 : 0}%`,
                width: 13, height: 13, borderRadius: "50%", background: "#fff",
                transform: "translate(-50%, -50%)", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
            </div>
          </div>

          {/* time labels — current / total */}
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 12 + botInset, zIndex: 6,
            display: "flex", justifyContent: "space-between", pointerEvents: "none",
            opacity: ctrlsOn ? 1 : 0, transition: "opacity .2s ease" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.9)",
              fontVariantNumeric: "tabular-nums", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>{fmtTime(cur)}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.9)",
              fontVariantNumeric: "tabular-nums", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}>{fmtTime(dur)}</span>
          </div>
        </div>
      </div>

      {/* ── back button — hidden in fullscreen ── */}
      {!filled && (
        <button onClick={onBack} aria-label="Späť" style={{
          position: "absolute", top: 56, left: 18, zIndex: 20,
          width: 42, height: 42, borderRadius: 6, cursor: "pointer",
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
      <div ref={sheetRef} style={{ position: "absolute", left: 0, right: 0, bottom: 0,
        height: filled ? 0 : "auto", maxHeight: view === "expanded" ? CARD_EXPANDED : CARD_DEFAULT,
        background: "#fff", borderRadius: "24px 24px 0 0",
        boxShadow: "0 -8px 32px rgba(10,15,40,0.12)",
        transition: "none",
        display: "flex", flexDirection: "column", overflow: "hidden",
        opacity: filled ? 0 : 1, pointerEvents: filled ? "none" : "auto" }}>

        {/* body */}
        <div style={{ flex: 1, minHeight: 0, padding: "18px 20px 22px", display: "flex", flexDirection: "column" }}>

          {/* name + variation + completion (flexShrink 0) */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 780, color: "#0d1322", lineHeight: 1.18, letterSpacing: -0.5,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.name}</div>
              {ex.variation && (
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--muted)", marginTop: 5 }}>{ex.variation}</div>
              )}
            </div>
            <button {...seriesPress} aria-label={done ? "Vynulovať série" : "Pridať sériu"} data-tour="ex-series-btn" style={{
              flexShrink: 0, width: 50, height: 50, borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
              border: "1.5px solid var(--line)",
              backgroundColor: srBg(seriesDone, ex.sets),
              display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color .2s ease" }}>
              {done ?
              <Icon name="check" size={23} stroke={srIcon(seriesDone, ex.sets)} sw={2.4} /> :
              <span style={{ fontSize: 28, fontWeight: 400, lineHeight: 1, color: "var(--ink)", marginTop: -2 }}>+</span>}
            </button>
          </div>

          {/* metric stats — série · výdrž · (záťaž) · pauza (flexShrink 0) */}
          <div style={{ flexShrink: 0, display: "flex", gap: 8 }}>
            {metrics.map((m) => <Stat key={m.key} m={m} />)}
          </div>

          {/* MIDDLE — description, clamped until expanded; link only when it overflows */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
            marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
            <div style={{ flex: showDetails ? 1 : "0 0 auto", minHeight: 0,
              overflowY: showDetails ? "auto" : "hidden" }}>
              <div ref={descRef} onClick={() => clamped && setView((v) => v === "expanded" ? "default" : "expanded")}
                style={{ cursor: clamped ? "pointer" : "default", fontSize: 15, color: "var(--muted)",
                lineHeight: 1.55, textWrap: "pretty",
                ...(showDetails ? {} : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }) }}>
                {descText}
              </div>
            </div>
            {!showDetails && clamped &&
            <button onClick={() => setView("expanded")} style={{ flexShrink: 0, alignSelf: "flex-start",
              marginTop: 6, border: "none", background: "none",
              padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 650, color: "var(--accent)" }}>
              Zobraziť viac
            </button>}
          </div>

          {/* TIMER — plain stopwatch row (euneo style), divider above; fixed height so it never jumps */}
          {hasTimer && (
            <div style={{ flexShrink: 0, borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 4 }}>
              <div data-tour="ex-timer">
              {timerActive ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 40 }}>
                  <Icon name="timer" size={26} stroke="var(--ink)" />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 19, fontWeight: 650, color: "var(--ink)",
                    fontVariantNumeric: "tabular-nums" }}>{mm}:{ss}</span>
                  <button onClick={() => setRunning((r) => !r)} style={{ flexShrink: 0, border: "1px solid var(--line)", cursor: "pointer",
                    fontFamily: "inherit", background: "#fff", color: "var(--ink)", borderRadius: 6,
                    padding: "8px 16px", fontSize: 15, fontWeight: 600 }}>{running ? "Pozastaviť" : "Pokračovať"}</button>
                  <button onClick={cancelTimer} style={{ flexShrink: 0, border: "1px solid var(--line)", cursor: "pointer",
                    fontFamily: "inherit", background: "#fff", color: "var(--ink)", borderRadius: 6,
                    padding: "8px 16px", fontSize: 15, fontWeight: 600 }}>Zrušiť</button>
                </div>
              ) : (
                <button onClick={startTimer} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, minHeight: 40,
                  background: "transparent", border: "none", padding: 0,
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <Icon name="timer" size={26} stroke="var(--ink)" />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 19, fontWeight: 650, color: "var(--ink)" }}>Spustiť časovač · {ex.hold} s</span>
                </button>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ExerciseDetail });
