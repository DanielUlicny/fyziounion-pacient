// app/checkin.jsx — Morning check-in (raz za deň) — wizard style zladený s registráciou
// Exports to window: MorningCheckIn

const CI_DATE_KEY = "fyzio_checkin_date";
const CI_ANSWERS_KEY = "fyzio_checkin_answers";

// ── local icon subset (zap + pill not in global Icon) ────────
const CIIcon = ({ name, size = 22, stroke = "var(--ink)", sw = 1.8, fill = "none" }) => {
  const PHM = { arrow: "arrowRight", x: "x", info: "info", check: "check",
    activity: "pulse", moon: null };
  const ph = PHM[name] && window.PH_PATHS && window.PH_PATHS[PHM[name]];
  if (ph) return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill={stroke} aria-hidden="true"><path d={ph}></path></svg>
  );
  const P = {
    moon: <path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z" />,
    cup: <g><path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z" /><path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16" /><path d="M7.5 3.5c-.6.8-.6 1.7 0 2.5M11 3.5c-.6.8-.6 1.7 0 2.5" /></g>,
    leaf: <g><path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 9-4 12-9 12Z" /><path d="M4 20c4-5 7-7 12-8" /></g>,
    activity: <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />,
    check: <path d="M5 12.5 10 17.5 19 6.5" />,
    arrow: <path d="M5 12h13M13 6l6 6-6 6" />,
    zap: <path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H13Z" />,
    pill: <g><path d="m10.5 20.5-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z" /><path d="m8.5 8.5 7 7" /></g>
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {P[name]}
    </svg>);

};

// ── inject animations once (opacity-only — transforms blur text) ──
(function () {
  const old = document.getElementById("ci-styles");
  if (old) old.remove();
  const s = document.createElement("style");
  s.id = "ci-styles";
  s.textContent = `
    @keyframes ci-fz  { from { opacity:0; } to { opacity:1; } }
    .ci-fz { opacity:1; }
    @media (prefers-reduced-motion: no-preference) {
      .ci-fz { animation: ci-fz .26s ease both; }
    }
  `;
  document.head.appendChild(s);
})();

// ── steps ────────────────────────────────────────────────────
const CI_STEPS = [
{ id: "sleep", icon: "moon", q: "Ako ste sa dnes vyspali?",
  opts: [{ l: "Výborne", d: 4 }, { l: "Dobre", d: 3 }, { l: "Slabo", d: 2 }, { l: "Zle", d: 1 }] },
{ id: "food", icon: "leaf", q: "Ako ste sa stravovali?",
  opts: [{ l: "Výborne", d: 4 }, { l: "Dobre", d: 3 }, { l: "Slabo", d: 2 }, { l: "Zle", d: 1 }] },
{ id: "stress", icon: "zap", q: "Aká je vaša hladina stresu?",
  opts: [{ l: "Žiadny", d: 4 }, { l: "Mierny", d: 3 }, { l: "Stredný", d: 2 }, { l: "Silný", d: 1 }] },
{ id: "alcohol", icon: "cup", q: "Pili ste včera alkohol?", yesno: true,
  yesLabel: "Pil(a) som", noLabel: "Žiadny alkohol" },
{ id: "meds", icon: "pill", q: "Brali ste lieky proti bolesti?", yesno: true,
  yesLabel: "Áno, bral(a) som", noLabel: "Nie, nebral(a)" }];


const ciPainLabel = null;

// ── single-choice card (rovnaký vzor ako výber pohlavia v registrácii) ──
function CIOptionRow({ label, note, selected, onClick }) {
  const sel = selected;
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex",
      alignItems: "center", gap: 13, textAlign: "left", fontFamily: "inherit", cursor: "pointer",
      padding: note ? "14px 16px" : "16px 16px", borderRadius: 6,
      border: `1.5px solid ${sel ? "var(--accent)" : "var(--line)"}`,
      background: sel ? "var(--accent-wash)" : "#fff",
      transition: "background .15s ease, border-color .15s ease" }}>
      <span style={{ width: 23, height: 23, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${sel ? "var(--accent)" : "var(--faint)"}`,
        background: sel ? "var(--accent)" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {sel && <span style={{ width: 8.5, height: 8.5, borderRadius: "50%", background: "#fff" }} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: sel ? 660 : 500,
          color: sel ? "var(--accent-ink)" : "var(--ink)" }}>{label}</span>
        {note && <span style={{ display: "block", fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{note}</span>}
      </span>
    </button>);

}

// ── done screen ──────────────────────────────────────────────
function CIDoneScreen({ onDone, answers }) {
  return (
    <div className="ci-fz" style={{ flex: 1, display: "flex", flexDirection: "column",
      padding: "0 26px 30px", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ok-wash)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <CIIcon name="check" size={30} stroke="var(--ok)" sw={2.4} />
        </div>
        <div style={{ flexShrink: 0, fontSize: 30, fontWeight: 800, color: "var(--ink)", letterSpacing: -0.8, lineHeight: 1.2 }}>
          Ďakujeme.<br />Poďme cvičiť!
        </div>
        <div style={{ flexShrink: 0, fontSize: 14.5, color: "var(--muted)", lineHeight: 1.55, marginTop: 12, maxWidth: 280 }}>
          Vaše odpovede boli zaznamenané a odoslané vášmu fyzioterapeutovi.
        </div>
      </div>
      <button onClick={() => onDone(answers)} style={{
        width: "100%", border: "none", borderRadius: 16, padding: "16px 18px",
        fontSize: 16.5, fontWeight: 650, fontFamily: "inherit", cursor: "pointer", color: "#fff",
        background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        whiteSpace: "nowrap", flexShrink: 0,
        boxShadow: "0 8px 22px var(--accent-shadow)" }}>
        Začať cvičenie
        <CIIcon name="arrow" size={19} stroke="#fff" sw={2.2} />
      </button>
    </div>);

}

// ── main component ───────────────────────────────────────────
function CIPainStep({ value, onChange }) {
  const label = value == null ? "Vyberte úroveň" : value <= 2 ? "Žiadna alebo mierna" : value <= 5 ? "Mierna bolesť" : value <= 7 ? "Stredná bolesť" : "Silná bolesť";
  return (
    <div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginTop: -12, marginBottom: 18 }}>
        0 = žiadna bolesť · 10 = najsilnejšia
      </div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1.8, lineHeight: 1,
          color: value == null ? "var(--faint)" : "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
          {value == null ? "–" : value}
        </span>
        <div style={{ fontSize: 15, fontWeight: 660, marginTop: 8,
          color: value == null ? "var(--faint)" : "var(--accent)" }}>{label}</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {Array.from({ length: 11 }).map((_, n) => {
          const sel = value === n;
          return (
            <button key={n} onClick={() => onChange(n)} style={{
              width: 48, height: 48, borderRadius: "50%", cursor: "pointer", fontFamily: "inherit",
              fontSize: 17, fontWeight: sel ? 760 : 560,
              border: sel ? "none" : "1.5px solid var(--line)",
              background: sel ? "var(--accent)" : "#fff", color: sel ? "#fff" : "var(--text)",
              transition: "background .14s ease, color .14s ease", padding: 0 }}>{n}</button>);

        })}
      </div>
    </div>);

}

// mode "full": therapist's enabled check-in questions → pain → his own questions
// mode "pain": only pain (the therapist's questions were already answered today)
function MorningCheckIn({ onDone, therapist, mode = "full" }) {
  const th = therapist || (window.FYZIO && FYZIO.therapists[0]) || {};
  const steps = React.useMemo(() => {
    const pain = { id: "pain", type: "pain", q: "Aká je dnes vaša bolesť?" };
    if (mode === "pain") return [pain];
    const on = th.checkin || CI_STEPS.map((s) => s.id);
    const own = (th.ownQuestions || []).map((q) => ({ id: q.id, q: q.q, opts: q.opts.map((l) => ({ l })) }));
    return [...CI_STEPS.filter((s) => on.includes(s.id)), pain, ...own];
  }, [mode, th.id]);

  const [stepIdx, setStepIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [done, setDone] = React.useState(false);

  const step = steps[stepIdx];
  const val = step ? (answers[step.id] !== undefined ? answers[step.id] : null) : null;
  const setVal = (v) => setAnswers((a) => ({ ...a, [step.id]: v }));
  const isLast = stepIdx >= steps.length - 1;
  const next = () => { if (isLast) setDone(true); else setStepIdx((i) => i + 1); };
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 90, background: "#fff",
      display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* dynamic island */}
      <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)",
        width: 126, height: 37, borderRadius: 24, background: "#000", zIndex: 100, flexShrink: 0 }} />

      <IOSStatusBar />

      {done ?
      <React.Fragment>
        <div style={{ height: 16, flexShrink: 0 }} />
        <CIDoneScreen onDone={onDone} answers={answers} />
      </React.Fragment> :

      <React.Fragment>

          {/* header — šípka späť + progress + Krok X z Y (ako v registrácii) */}
          <div style={{ flexShrink: 0, padding: "8px 22px 6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
              {stepIdx > 0 ? (
                <button onClick={back} aria-label="Späť" style={{ width: 40, height: 40, borderRadius: 12,
                  flexShrink: 0, border: "1px solid var(--line)", background: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <OIcon name="chevL" size={20} stroke="var(--text)" />
                </button>
              ) : (
                <div style={{ width: 40, height: 40, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--line)", overflow: "hidden" }}>
                <div style={{ width: `${((stepIdx + 1) / steps.length) * 100}%`, height: "100%", borderRadius: 99,
                  background: "var(--accent)", transition: "width .35s cubic-bezier(.4,0,.2,1)" }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", flexShrink: 0,
                fontVariantNumeric: "tabular-nums" }}>Krok {stepIdx + 1} z {steps.length}</span>
            </div>
          </div>

          {/* body */}
          <div key={stepIdx} className="ci-fz" style={{ flex: 1, overflowY: "auto",
            WebkitOverflowScrolling: "touch", padding: "10px 22px 8px" }}>

            <div style={{ fontSize: 25, fontWeight: 780, color: "var(--ink)", letterSpacing: -0.6,
              lineHeight: 1.2, marginBottom: 22 }}>{step.q}</div>

            {step.type === "pain" && <CIPainStep value={val} onChange={setVal} />}

            {step.opts &&
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {step.opts.map((o) =>
              <CIOptionRow key={o.l} label={o.l} selected={val === o.l} onClick={() => setVal(o.l)} />
              )}
              </div>
            }

            {step.yesno &&
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <CIOptionRow label="Nie" note={step.noLabel} selected={val === "Nie"} onClick={() => setVal("Nie")} />
                <CIOptionRow label="Áno" note={step.yesLabel} selected={val === "Áno"} onClick={() => setVal("Áno")} />
              </div>
            }
          </div>

          {/* footer — sivé Ďalšie, slate keď je vybrané (ako v registrácii) */}
          <div style={{ flexShrink: 0, padding: "12px 22px 30px" }}>
            <NextButton disabled={val == null} onClick={() => val != null && next()}>
              {isLast ? "Dokončiť" : "Ďalšie"}
            </NextButton>
          </div>
        </React.Fragment>
      }
    </div>);

}

Object.assign(window, { MorningCheckIn, CI_DATE_KEY, CI_ANSWERS_KEY });
