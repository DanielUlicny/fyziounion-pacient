// app/home.jsx — Home: day selector, daily plan, pain check-in, reminder
// Exports to window: HomeScreen

// ── Day selector ─────────────────────────────────────────────
function DaySelector({ days, selected, onSelect }) {
  const t = useT();
  const style = t.daySelector || "pills";
  const railRef = React.useRef(null);
  React.useEffect(() => {
    const el = railRef.current; if (!el) return;
    const active = el.querySelector("[data-today]");
    if (active) el.scrollLeft = active.offsetLeft - 120;
  }, []);

  const statusDot = (s) => {
    if (s === "done") return <Icon name="check" size={12} stroke="var(--ok)" sw={2.6} />;
    if (s === "rest") return <Icon name="moon" size={11} stroke="var(--muted)" />;
    return <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />;
  };

  return (
    <div ref={railRef} style={{ display: "flex", gap: 9, overflowX: "auto", padding: "2px 18px 4px",
      scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
      {days.map((d) => {
        const isSel = d.key === selected;
        const isToday = d.status === "today";
        if (style === "circles") {
          return (
            <button key={d.key} data-today={isToday || undefined} onClick={() => onSelect(d.key)}
              style={{ border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: 0, flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: isSel ? "var(--accent)" : "var(--muted)" }}>{d.dow}</span>
              <span style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 650,
                background: isSel ? "var(--accent)" : isToday ? "var(--accent-wash)" : "#fff",
                color: isSel ? "#fff" : isToday ? "var(--accent)" : "var(--ink)",
                border: `1.5px solid ${isSel ? "var(--accent)" : "var(--line)"}`,
                transition: "all .18s ease" }}>{d.num}</span>
              <span style={{ height: 12, display: "flex", alignItems: "center" }}>{!isSel && statusDot(d.status)}</span>
            </button>
          );
        }
        if (style === "minimal") {
          return (
            <button key={d.key} data-today={isToday || undefined} onClick={() => onSelect(d.key)}
              style={{ border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 12px",
                borderRadius: 12, minWidth: 46,
                background: isSel ? "var(--accent)" : "transparent",
                color: isSel ? "#fff" : isToday ? "var(--accent)" : "var(--muted)" }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, opacity: isSel ? 0.85 : 1 }}>{d.dow}</span>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{d.num}</span>
              <span style={{ width: 5, height: 5, borderRadius: "50%",
                background: isSel ? "rgba(255,255,255,0.8)" : d.status === "done" ? "var(--ok)" : d.status === "rest" ? "var(--line)" : "var(--accent)" }} />
            </button>
          );
        }
        // pills (default)
        return (
          <button key={d.key} data-today={isToday || undefined} onClick={() => onSelect(d.key)}
            style={{ border: `1.5px solid ${isSel ? "var(--accent)" : "var(--line)"}`,
              background: isSel ? "var(--accent-wash)" : "#fff", cursor: "pointer", fontFamily: "inherit",
              borderRadius: 16, padding: "9px 13px", flexShrink: 0, minWidth: 58,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              boxShadow: isSel ? "none" : "0 1px 2px rgba(30,40,70,0.03)", transition: "all .18s ease" }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: isSel ? "var(--accent)" : "var(--muted)" }}>
              {isToday ? "Dnes" : d.dow}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: isSel ? "var(--accent-ink)" : "var(--ink)" }}>{d.num}</span>
            <span style={{ height: 14, display: "flex", alignItems: "center" }}>{statusDot(d.status)}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Exercise card ────────────────────────────────────────────
function ExerciseCard({ ex, done, seriesDone, onAddSeries, onOpen, tour, onMarkDone, onUndo }) {
  const t = useT();
  const swipe = React.useRef({ x: 0, active: false, moved: false, dx: 0 });
  const [offset, setOffset] = React.useState(0);
  const onPtrDown = (e) => { swipe.current = { x: e.clientX, active: true, moved: false, dx: 0 }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const onPtrMove = (e) => { if (!swipe.current.active) return; const dx = e.clientX - swipe.current.x; swipe.current.dx = dx; if (Math.abs(dx) > 6) swipe.current.moved = true; setOffset(Math.max(-80, Math.min(50, dx * 0.55))); };
  const onPtrUp = () => { if (!swipe.current.active) return; swipe.current.active = false; const dx = swipe.current.dx; setOffset(0); if (!swipe.current.moved) { onOpen(); return; } if (dx < -60) { onMarkDone?.(); } else if (dx > 60 && done) { onUndo?.(); } };
  const d = t.density || "regular";
  const pad = d === "compact" ? 12 : d === "comfy" ? 18 : 15;
  const thumbW = d === "compact" ? 48 : d === "comfy" ? 64 : 56;
  const minH = d === "compact" ? 108 : d === "comfy" ? 144 : 126;
  const partial = seriesDone > 0 && !done;
  return (
    <div onPointerDown={onPtrDown} onPointerMove={onPtrMove} onPointerUp={onPtrUp} onPointerCancel={onPtrUp}
      data-tour={tour || undefined}
      style={{ background: "#fff", borderRadius: 20, padding: pad,
        border: done ? "1.5px solid var(--ok-line)" : "1px solid var(--line)",
        boxShadow: "0 2px 10px rgba(30,40,70,0.04)",
        display: "flex", gap: pad - 2, alignItems: "stretch", cursor: "pointer", minHeight: minH,
        transform: `translateX(${offset}px)`,
        transition: offset === 0 ? "transform .22s ease, border-color .25s ease" : "none",
        touchAction: "pan-y", userSelect: "none" }}>
      <VideoMedia style={{ width: thumbW, alignSelf: "stretch", flexShrink: 0 }} rounded={14} label="cvik" />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Marquee text={ex.name} style={{ fontSize: d === "compact" ? 17 : 18.5, fontWeight: 720,
          color: "var(--ink)", letterSpacing: -0.3, lineHeight: 1.2 }} />
        {ex.variation && (
          <div style={{ fontSize: 14.5, color: "var(--muted)", fontWeight: 500, lineHeight: 1.3, marginTop: 2,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.variation}</div>
        )}
        <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 12, flexWrap: "nowrap" }}>
          {exMetrics(ex, { seriesDone, done, includeRest: false }).map((m) => {
            const tone = m.key === "sets" ? (done ? "ok" : partial ? "accent" : "plain") : "plain";
            return (
              <span key={m.key} style={{ display: "inline-flex", alignItems: "center", borderRadius: 10,
                padding: "8px 14px", whiteSpace: "nowrap", fontSize: 15, fontWeight: 740, flexShrink: 0,
                background: tone === "ok" ? "var(--ok-wash)" : tone === "accent" ? srBg(seriesDone, ex.sets) : "var(--chip)",
                color: tone === "ok" ? "var(--ok-ink)" : tone === "accent" ? srIcon(seriesDone, ex.sets) : "var(--ink)" }}>{m.value}</span>
            );
          })}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onAddSeries(); }} onPointerDown={(e) => e.stopPropagation()} aria-label="Pripočítať sériu"
        style={{ alignSelf: "center", flexShrink: 0, width: 46, height: 46, borderRadius: 14, cursor: "pointer",
          padding: 0, border: seriesDone === 0 ? "1.5px solid var(--line)" : "none",
          background: srBg(seriesDone, ex.sets),
          display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s ease" }}>
        <Icon name="check" size={22} stroke={srIcon(seriesDone, ex.sets)} sw={2.4} />
      </button>
    </div>
  );
}

// ── Pain check-in helpers ────────────────────────────────────
const painHue = (v) => `oklch(${(0.62 - v * 0.027).toFixed(3)} 0.11 258)`;
const painLabel = (v) => v == null ? "Vyberte úroveň" : v <= 2 ? "Žiadna alebo mierna" : v <= 5 ? "Mierna bolesť" : v <= 7 ? "Stredná bolesť" : "Silná bolesť";

// ── V1: čísla — numeric button grid ─────────────────────────
function PainNumbers({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "space-between" }}>
      {Array.from({ length: 11 }).map((_, n) => {
        const sel = value === n;
        return (
          <button key={n} onClick={() => onChange(n)} style={{
            flex: 1, height: 42, borderRadius: 12, cursor: "pointer",
            fontFamily: "inherit", fontSize: 14, fontWeight: sel ? 720 : 550,
            border: sel ? "none" : "1.5px solid var(--line)",
            background: sel ? painHue(n) : "var(--chip)",
            color: sel ? "#fff" : "var(--muted)",
            boxShadow: sel ? `0 4px 14px ${painHue(n)}50` : "none",
            transform: sel ? "scale(1.08)" : "none",
            transition: "all .14s ease", padding: 0
          }}>{n}</button>
        );
      })}
    </div>
  );
}

// ── V2: slider — gradient track ──────────────────────────────
function PainSlider({ value, onChange }) {
  const thumbCol = painHue(value ?? 5);
  return (
    <div>
      <style>{`
        .pain-range { -webkit-appearance: none; appearance: none;
          width: 100%; height: 6px; border-radius: 6px; outline: none; cursor: pointer;
          background: linear-gradient(to right,
            oklch(0.66 0.07 258) 0%, oklch(0.50 0.11 258) 55%,
            oklch(0.35 0.12 258) 100%); }
        .pain-range::-webkit-slider-thumb { -webkit-appearance: none; width: 28px; height: 28px;
          border-radius: 50%; background: ${thumbCol}; border: 3px solid #fff;
          box-shadow: 0 3px 10px rgba(0,0,0,0.22); cursor: pointer;
          transition: background .14s ease; }
        .pain-range::-moz-range-thumb { width: 26px; height: 26px;
          border-radius: 50%; background: ${thumbCol}; border: 3px solid #fff;
          box-shadow: 0 3px 10px rgba(0,0,0,0.22); cursor: pointer; }
      `}</style>
      <div style={{ position: "relative", padding: "10px 0 6px" }}>
        <input type="range" className="pain-range" min={0} max={10} step={1}
          value={value ?? 5}
          onChange={(e) => onChange(Number(e.target.value))} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
          <span key={n} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: value === n ? 700 : 500,
            color: value === n ? painHue(n) : "var(--faint)" }}>{n}</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)" }}>žiadna</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)" }}>najsilnejšia</span>
      </div>
    </div>
  );
}

// ── V3: zóny — four tappable color zones ─────────────────────
const PAIN_ZONES = [
  { min: 0, max: 2,  mid: 1,  label: "Žiadna",  sub: "0 – 2",  col: "oklch(0.62 0.08 258)" },
  { min: 3, max: 5,  mid: 4,  label: "Mierna",  sub: "3 – 5",  col: "oklch(0.52 0.10 258)" },
  { min: 6, max: 7,  mid: 6,  label: "Stredná", sub: "6 – 7",  col: "oklch(0.43 0.11 258)"  },
  { min: 8, max: 10, mid: 9,  label: "Silná",   sub: "8 – 10", col: "oklch(0.34 0.12 258)"  },
];
function PainZones({ value, onChange }) {
  const activeZone = value != null ? PAIN_ZONES.find(z => value >= z.min && value <= z.max) : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {PAIN_ZONES.map((z) => {
          const sel = activeZone === z;
          return (
            <button key={z.label} onClick={() => onChange(z.mid)}
              style={{ flex: 1, border: "none", cursor: "pointer", fontFamily: "inherit",
                borderRadius: 18, padding: "16px 4px 14px",
                background: sel ? z.col : "var(--chip)",
                boxShadow: sel ? `0 6px 20px ${z.col}55` : "none",
                transform: sel ? "scale(1.04)" : "none",
                transition: "all .18s ease",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 15, fontWeight: 720,
                color: sel ? "#fff" : "var(--ink)", lineHeight: 1.1 }}>{z.label}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600,
                color: sel ? "rgba(255,255,255,0.72)" : "var(--muted)" }}>{z.sub}</span>
            </button>
          );
        })}
      </div>
      {activeZone && (
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: 11 }).map((_, n) => {
            const inZone = n >= activeZone.min && n <= activeZone.max;
            const sel = n === value;
            return (
              <button key={n} onClick={() => onChange(n)} style={{
                flex: 1, height: 32, borderRadius: 8, cursor: "pointer",
                fontFamily: "inherit", fontSize: 12.5, fontWeight: sel ? 720 : 500,
                border: sel ? "none" : `1.5px solid ${inZone ? activeZone.col + "55" : "var(--line)"}`,
                background: sel ? activeZone.col : inZone ? activeZone.col + "18" : "#fff",
                color: sel ? "#fff" : inZone ? "var(--ink)" : "var(--faint)",
                transition: "all .12s ease", padding: 0
              }}>{n}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Pain check-in ────────────────────────────────────────────
function PainCheckIn({ value, saved, onChange, onSave, bare }) {
  const t = useT();
  const style = t.painStyle || "čísla";
  const body = (
    <React.Fragment>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent-wash)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="activity" size={18} stroke="var(--accent)" />
        </div>
        <div style={{ fontSize: 16.5, fontWeight: 680, color: "var(--ink)" }}>Aká je dnes vaša bolesť?</div>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, paddingLeft: 41 }}>
        0 znamená žiadnu bolesť, 10 najsilnejšiu.
      </div>
      {style === "čísla"  && <PainNumbers value={value} onChange={onChange} />}
      {style === "slider" && <PainSlider  value={value} onChange={onChange} />}
      {style === "zóny"   && <PainZones   value={value} onChange={onChange} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, minHeight: 36 }}>
        <span style={{ fontSize: 13.5, color: value == null ? "var(--faint)" : "var(--text)", fontWeight: 550 }}>{painLabel(value)}</span>
        {value != null && (
          saved ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13.5, fontWeight: 600, color: "var(--ok)" }}>
              <Icon name="check" size={16} stroke="var(--ok)" sw={2.4} /> Uložené
            </span>
          ) : (
            <button onClick={onSave} style={{ border: "none", cursor: "pointer", fontFamily: "inherit",
              background: "var(--accent)", color: "#fff", borderRadius: 11, padding: "9px 18px", fontSize: 14, fontWeight: 620 }}>Uložiť</button>
          )
        )}
      </div>
    </React.Fragment>
  );
  if (bare) return body;
  return (
    <div style={{ background: "#fff", borderRadius: 22, padding: 18, border: "1px solid var(--line)",
      boxShadow: "0 2px 10px rgba(30,40,70,0.04)" }}>{body}</div>
  );
}

// ── Reminder card ────────────────────────────────────────────
function ReminderCard() {
  const order = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  return (
    <div style={{ background: "var(--accent-ink-bg)", borderRadius: 22, padding: 18, color: "#fff",
      boxShadow: "0 10px 28px rgba(28,40,90,0.22)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4, letterSpacing: 0.2 }}>TRÉNINGOVÉ DNI</div>
          <div style={{ fontSize: 16.5, fontWeight: 680 }}>4 dni v týždni</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)",
          borderRadius: 11, padding: "7px 11px" }}>
          <Icon name="bell" size={15} stroke="#fff" />
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{FYZIO.reminderTime}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
        {order.map((d) => {
          const on = FYZIO.activeDays[d];
          return (
            <div key={d} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 10,
              fontSize: 12.5, fontWeight: 600,
              background: on ? "rgba(255,255,255,0.18)" : "transparent",
              color: on ? "#fff" : "rgba(255,255,255,0.4)" }}>{d}</div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
        <Icon name="clock" size={14} stroke="rgba(255,255,255,0.72)" />
        Ďalšia pripomienka dnes o {FYZIO.reminderTime}
      </div>
    </div>
  );
}

// ── Rest day state ───────────────────────────────────────────
function RestState() {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "18px 18px", border: "1px solid var(--line)",
      boxShadow: "0 2px 10px rgba(30,40,70,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: "var(--rest-wash)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="moon" size={24} stroke="var(--rest)" />
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>Oddýchnite si</div>
    </div>
  );
}

// ── Completed (past) day state ───────────────────────────────
function CompletedState({ count }) {
  return (
    <div style={{ background: "var(--ok-wash)", borderRadius: 22, padding: "28px 24px", border: "1px solid var(--ok-line)",
      textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 14px",
        background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(30,40,70,0.08)" }}>
        <Icon name="check" size={32} stroke="var(--ok)" sw={2.6} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ok-ink)", marginBottom: 6 }}>Hotovo</div>
      <div style={{ fontSize: 14.5, color: "var(--ok-ink)", opacity: 0.8 }}>Dokončili ste všetky cviky ({count} z {count}).</div>
    </div>
  );
}

// ── Focus hero (alt direction) ───────────────────────────────
function FocusHero({ exs, series, onOpenEx }) {
  const isDone = (e) => (series[e.id] || 0) >= e.sets;
  const doneCount = exs.filter(isDone).length;
  const next = exs.find((e) => !isDone(e));
  const allDone = doneCount === exs.length;
  const remaining = exs.filter((e) => !isDone(e)).reduce((s, e) => s + e.mins, 0);
  return (
    <div style={{ background: "var(--accent-ink-bg)", borderRadius: 24, padding: 20, color: "#fff",
      boxShadow: "0 14px 34px rgba(28,40,90,0.26)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ProgressRing value={doneCount / exs.length} size={64} sw={6} color="#fff" track="rgba(255,255,255,0.22)">
          <span style={{ fontSize: 14, fontWeight: 760, color: "#fff" }}>{doneCount}/{exs.length}</span>
        </ProgressRing>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.62)", letterSpacing: 0.2 }}>DNEŠNÝ TRÉNING</div>
          <div style={{ fontSize: 19, fontWeight: 720, marginTop: 2 }}>
            {allDone ? "Hotovo na dnes" : `Ostáva ~${remaining} min`}
          </div>
        </div>
      </div>
      {!allDone && (
        <button onClick={() => onOpenEx(next.id)} style={{ marginTop: 16, width: "100%", border: "none", cursor: "pointer",
          fontFamily: "inherit", background: "#fff", color: "var(--accent-ink)", borderRadius: 14, padding: "14px",
          fontSize: 15.5, fontWeight: 680, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="play" size={17} stroke="var(--accent)" /> Pokračovať: {next.name.split(" ").slice(0, 2).join(" ")}…
        </button>
      )}
    </div>
  );
}

// ── Compact exercise row (alt direction) ─────────────────────
function ExerciseRow({ ex, done, seriesDone, onAddSeries, onOpen }) {
  const partial = seriesDone > 0 && !done;
  return (
    <div onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
      background: "#fff", borderRadius: 16,
      border: done ? "1.5px solid var(--ok-line)" : "1px solid var(--line)", cursor: "pointer",
      transition: "border-color .25s ease" }}>
      <VideoMedia style={{ width: 46, height: 46, flexShrink: 0 }} rounded={12} label="" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 650, color: "var(--ink)", lineHeight: 1.25,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.name}</div>
        <div style={{ fontSize: 12.5, marginTop: 2, fontWeight: done || partial ? 600 : 400,
          color: done ? "var(--ok-ink)" : partial ? "var(--accent)" : "var(--muted)",
          display: "flex", alignItems: "center", gap: 5 }}>
          {done && <Icon name="check" size={13} stroke="var(--ok)" sw={2.6} />}
          {done ? "Odcvičené" : `${seriesDone} z ${ex.sets} sérií`} · {ex.kind === "time" ? `${ex.hold} s` : `${ex.reps}×`}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onAddSeries(); }} style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 12,
        cursor: "pointer", padding: 0, border: seriesDone === 0 ? "1.5px solid var(--line)" : "none",
        background: srBg(seriesDone, ex.sets),
        display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s ease" }}>
        <Icon name="check" size={17} stroke={srIcon(seriesDone, ex.sets)} sw={2.4} />
      </button>
    </div>
  );
}

// ── Daily pain prompt (top of Home, collapsible) ───────────
function DailyPainCard({ value, onOpen }) {
  const has = value != null;
  return (
    <button onClick={onOpen} style={{ width: "100%", background: "#fff", borderRadius: 16,
      border: "1px solid var(--line)", boxShadow: "0 2px 10px rgba(30,40,70,0.04)",
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      display: "flex", alignItems: "center", gap: 12, padding: "13px 15px" }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: has ? painHue(value) : "var(--accent-wash)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {has ? <span style={{ fontSize: 17, fontWeight: 760, color: "#fff" }}>{value}</span>
             : <Icon name="activity" size={19} stroke="var(--accent)" />}
      </div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Akú máte dnes bolesť?</div>
      <Icon name="chevR" size={19} stroke="var(--muted)" />
    </button>
  );
}

// ── Pain picker (used in the slide-up sheet) ─────────────────
function PainPicker({ value, onChange }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)" }}>Žiadna bolesť</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", textAlign: "right" }}>najväčšia bolesť na svete</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
        {Array.from({ length: 11 }).map((_, n) => {
          const sel = value === n;
          return (
            <button key={n} onClick={() => onChange(n)} style={{
              width: 46, height: 46, borderRadius: "50%", cursor: "pointer", fontFamily: "inherit",
              fontSize: 18, fontWeight: sel ? 760 : 620, flexShrink: 0,
              border: sel ? "none" : "1.5px solid var(--line)",
              background: sel ? painHue(n) : "#fff",
              color: sel ? "#fff" : "var(--muted)",
              transform: sel ? "scale(1.08)" : "none",
              transition: "all .14s ease", padding: 0 }}>{n}</button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 18, minHeight: 24 }}>
        <span style={{ fontSize: 16, fontWeight: 680, color: value == null ? "var(--faint)" : painHue(value) }}>{painLabel(value)}</span>
      </div>
    </div>
  );
}

// ── Compact metric pill (value over label) ───────────────────
function MiniStat({ big, label, tone }) {
  const c = tone === "ok" ? { bg: "var(--ok-wash)", v: "var(--ok-ink)" }
          : tone === "accent" ? { bg: "var(--accent-wash)", v: "var(--accent)" }
          : { bg: "var(--chip)", v: "var(--ink)" };
  return (
    <div style={{ background: c.bg, borderRadius: 11, padding: "6px 13px", textAlign: "center", minWidth: 0 }}>
      <div style={{ fontSize: 16, fontWeight: 780, lineHeight: 1.05, color: c.v, whiteSpace: "nowrap" }}>{big}</div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--muted)", marginTop: 2, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

// ── Assessment due card (CSI) ──────────────────────────
function AssessmentCard({ onOpen }) {
  return (
    <button onClick={onOpen} style={{ width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
      border: "none", borderRadius: 22, padding: 18, background: "var(--accent)", color: "#fff",
      display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: "rgba(255,255,255,0.14)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="clipboard" size={24} stroke="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 650, color: "rgba(255,255,255,0.62)", letterSpacing: 0.3, textTransform: "uppercase" }}>Hodnotiaci nástroj</div>
        <div style={{ fontSize: 16.5, fontWeight: 700, marginTop: 2 }}>Index centrálnej senzitizácie (CSI) · ~5 minút</div>
      </div>
      <Icon name="chevR" size={20} stroke="rgba(255,255,255,0.9)" />
    </button>
  );
}

function HomeScreen({ selectedDay, onSelectDay, series, onAddSeries, onOpenEx, onMarkDone, onUndo, onOpenPain, onOpenCelebrate, program, onOpenPrograms, pain, painSaved, onPainChange, onPainSave, assessDone, onOpenAssessment }) {
  const t = useT();
  const layout = t.homeLayout || "karty";
  const [showDone, setShowDone] = React.useState(false);
  const day = FYZIO.days.find((d) => d.key === selectedDay) || FYZIO.days.find((d) => d.status === "today");
  const isExerciseDay = day.status === "today" || day.status === "exercise";
  const isRest = day.status === "rest";
  const isDone = day.status === "done";
  const isToday = day.status === "today";
  const exs = FYZIO.exercises;
  const seriesOf = (e) => series[e.id] || 0;
  const isExDone = (e) => seriesOf(e) >= e.sets;
  const activeExs = exs.filter((e) => !isExDone(e));
  const doneExs = exs.filter(isExDone);
  const doneCount = doneExs.length;
  const allDone = doneCount === exs.length;

  const renderCard = (ex, first) => layout === "zoznam"
    ? <ExerciseRow key={ex.id} ex={ex} done={isExDone(ex)} seriesDone={seriesOf(ex)}
        onAddSeries={() => onAddSeries(ex.id)} onOpen={() => onOpenEx(ex.id)} />
    : <ExerciseCard key={ex.id} ex={ex} done={isExDone(ex)} seriesDone={seriesOf(ex)}
        onAddSeries={() => onAddSeries(ex.id)} onOpen={() => onOpenEx(ex.id)}
        tour={first ? "card" : undefined}
        onMarkDone={() => onMarkDone?.(ex.id)} onUndo={() => onUndo?.(ex.id)} />;

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "8px 20px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <button onClick={onOpenPrograms} data-tour="program" style={{ minWidth: 0, border: "none", background: "none",
            cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 24, fontWeight: 750, color: "var(--ink)", letterSpacing: -0.4, lineHeight: 1.1 }}>{(program || FYZIO.program).name}</span>
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--chip)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="chevronDown" size={17} stroke="var(--muted)" />
              </span>
            </div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>{(program || FYZIO.program).phase} · {(program || FYZIO.program).week || FYZIO.program.weekLabel}</div>
          </button>
          <ProgressRing value={isExerciseDay ? doneCount / exs.length : isDone ? 1 : 0} size={52} sw={5}>
            <span style={{ fontSize: 13, fontWeight: 750, color: "var(--ink)" }}>
              {isExerciseDay ? `${doneCount}/${exs.length}` : isDone ? "✓" : "–"}
            </span>
          </ProgressRing>
        </div>
      </div>

      {/* Day selector */}
      <div data-tour="days">
        <DaySelector days={FYZIO.days} selected={day.key} onSelect={onSelectDay} />
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
        {isToday && !assessDone && <AssessmentCard onOpen={onOpenAssessment} />}
        {isExerciseDay && (
          <React.Fragment>
            {layout === "fokus" && <FocusHero exs={exs} series={series} onOpenEx={onOpenEx} />}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 720, color: "var(--ink)", whiteSpace: "nowrap" }}>Dnešný plán</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: allDone ? "var(--ok)" : "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                {allDone ? "Všetko hotové" : `${doneCount} z ${exs.length} cvikov`}
              </span>
            </div>
            {allDone && (
              <div style={{ width: "100%",
                background: "var(--accent-wash)", border: "1px solid var(--accent-soft2)", borderRadius: 16,
                padding: "12px 14px", display: "flex", alignItems: "center", gap: 11 }}>
                <Icon name="checkCircle" size={22} stroke="var(--accent)" />
                <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: "var(--accent-ink)", fontWeight: 650 }}>Skvelá práca! Dnešné cviky máte za sebou.</span>
              </div>
            )}

            {/* Active exercises */}
            {activeExs.map((ex, i) => renderCard(ex, i === 0))}

            {/* Completed (vybavené) — collapsible */}
            {doneExs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button onClick={() => setShowDone((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 9,
                  width: "100%", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", padding: "2px 0" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: "var(--ok-wash)", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="check" size={14} stroke="var(--ok)" sw={2.6} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Odcvičené</span>
                  <span style={{ fontSize: 13, fontWeight: 650, color: "var(--ok-ink)", background: "var(--ok-wash)",
                    borderRadius: 8, padding: "2px 8px" }}>{doneExs.length}</span>
                  <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
                    fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                    {showDone ? "Skryť" : "Zobraziť"}
                    <span style={{ display: "inline-flex", transform: showDone ? "rotate(180deg)" : "none", transition: "transform .22s ease" }}>
                      <Icon name="chevronDown" size={16} stroke="var(--muted)" />
                    </span>
                  </span>
                </button>
                {showDone && doneExs.map(renderCard)}
              </div>
            )}

          </React.Fragment>
        )}
        {isRest && (
          <React.Fragment>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 720, color: "var(--ink)", whiteSpace: "nowrap" }}>Dnešný plán</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>0 cvikov</span>
            </div>
            <RestState />
          </React.Fragment>
        )}
        {isDone && <CompletedState count={exs.length} />}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, PainCheckIn, PainPicker });
