// app/checkin.jsx — Morning check-in overlay (raz za deň)
// Exports to window: MorningCheckIn

const CI_DATE_KEY = "fyzio_checkin_date";
const CI_ANSWERS_KEY = "fyzio_checkin_answers";

// ── local icon subset (zap + pill not in global Icon) ────────
const CIIcon = ({ name, size = 22, stroke = "var(--ink)", sw = 1.8, fill = "none" }) => {
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

// ── inject animations once ───────────────────────────────────
(function () {
  if (document.getElementById("ci-styles")) return;
  const s = document.createElement("style");
  s.id = "ci-styles";
  s.textContent = `
    @keyframes ci-fz  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
    @keyframes ci-row { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
    .ci-fz, .ci-row { opacity:1; }
    @media (prefers-reduced-motion: no-preference) {
      .ci-fz  { animation: ci-fz  .28s cubic-bezier(.32,.72,0,1) both; }
      .ci-row { animation: ci-row .30s cubic-bezier(.32,.72,0,1) var(--d,0s) both; }
    }
  `;
  document.head.appendChild(s);
})();

// ── steps ────────────────────────────────────────────────────
const CI_STEPS = [
{ id: "sleep", icon: "moon", q: "Ako sa dnes vyspali?",
  sub: null,
  opts: [{ l: "Výborne", d: 4 }, { l: "Dobre", d: 3 }, { l: "Slabo", d: 2 }, { l: "Zle", d: 1 }] },
{ id: "alcohol", icon: "cup", q: "Pili ste včera alkohol?",
  sub: null, yesno: true },
{ id: "food", icon: "leaf", q: "Ako ste sa stravovali?",
  sub: null,
  opts: [{ l: "Výborne", d: 4 }, { l: "Dobre", d: 3 }, { l: "Slabo", d: 2 }, { l: "Zle", d: 1 }] },
{ id: "stress", icon: "zap", q: "Aká je vaša hladina stresu?",
  sub: null,
  opts: [{ l: "Žiadny", d: 4 }, { l: "Mierny", d: 3 }, { l: "Stredný", d: 2 }, { l: "Silný", d: 1 }] },
{ id: "meds", icon: "pill", q: "Brali ste lieky proti bolesti?",
  sub: null, yesno: true,
  yesLabel: "Áno, bral(a) som", noLabel: "Nie, nebral(a)" },
{ id: "pain", icon: "activity", q: "Aká silná je dnes vaša bolesť?",
  sub: null, pain: true }];


const ciPainHue = (v) => `color-mix(in oklab, var(--accent), #0c1228 ${Math.round(v * 5)}%)`;
const ciPainLabel = (v) => v == null ? "Ťuknite na číslo" : v <= 2 ? "Žiadna alebo mierna" : v <= 5 ? "Mierna bolesť" : v <= 7 ? "Stredná bolesť" : "Silná bolesť";

// ── answer row ───────────────────────────────────────────────
function CIAnswerRow({ idx, dots, label, selected, onClick }) {
  const sel = selected;
  return (
    <button onClick={onClick} className="ci-row" style={{
      ["--d"]: `${idx * 0.05}s`,
      display: "flex", alignItems: "center", gap: 14, width: "100%", height: 62, padding: "0 18px",
      border: sel ? "none" : "1.5px solid var(--line)",
      background: sel ? "var(--accent)" : "#fff", borderRadius: 18, cursor: "pointer", fontFamily: "inherit",
      boxShadow: sel ? "0 8px 22px var(--accent-shadow)" : "0 1px 4px rgba(30,40,70,0.05)",
      transition: "transform .14s ease, background .16s ease",
      transform: sel ? "scale(0.99)" : "scale(1)" }}>
      <div style={{ display: "flex", gap: 4, width: 46, flexShrink: 0 }}>
        {[1, 2, 3, 4].map((d) =>
        <span key={d} style={{ width: 8, height: 8, borderRadius: "50%",
          background: d <= dots ? sel ? "#fff" : "var(--accent)" : sel ? "rgba(255,255,255,0.28)" : "#dfe3ec" }} />
        )}
      </div>
      <span style={{ flex: 1, textAlign: "left", fontSize: 17, fontWeight: 700,
        color: sel ? "#fff" : "var(--ink)" }}>{label}</span>
      <CIIcon name="arrow" size={18} stroke={sel ? "#fff" : "var(--faint)"} sw={2} />
    </button>);

}

// ── done screen ──────────────────────────────────────────────
function CIDoneScreen({ onDone, answers }) {
  return (
    <div className="ci-fz" style={{ flex: 1, display: "flex", flexDirection: "column",
      padding: "0 26px 30px", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 830, color: "var(--ink)", letterSpacing: -1, lineHeight: 1.05 }}>
          Ďakujeme.<br />Poďme cvičiť! 💪
        </div>
        <div style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.55, marginTop: 14, maxWidth: 290 }}>Vaše odpovede boli zaznamenané a odoslané vašemu fyzioterapeutovi

        </div>
      </div>
      <button onClick={() => onDone(answers)} style={{
        width: "100%", border: "none", borderRadius: 16, padding: "18px",
        fontSize: 17, fontWeight: 720, fontFamily: "inherit", cursor: "pointer", color: "#fff",
        background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        boxShadow: "0 10px 26px var(--accent-shadow)" }}>
        Začať cvičenie
        <CIIcon name="arrow" size={20} stroke="#fff" sw={2.2} />
      </button>
    </div>);

}

// ── main component ───────────────────────────────────────────
function MorningCheckIn({ onDone }) {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [done, setDone] = React.useState(false);
  const [sel, setSel] = React.useState(null);
  const [pain, setPain] = React.useState(null);
  const [animKey, setAnimKey] = React.useState(0);

  const step = CI_STEPS[stepIdx];

  const commit = (val) => {
    const next = { ...answers, [step.id]: val };
    setAnswers(next);
    if (stepIdx >= CI_STEPS.length - 1) {
      setTimeout(() => setDone(true), 230);
    } else {
      setTimeout(() => {
        setStepIdx((i) => i + 1);
        setSel(null);setPain(null);setAnimKey((k) => k + 1);
      }, 210);
    }
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 90, background: "var(--bg)",
      display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* dynamic island */}
      <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)",
        width: 126, height: 37, borderRadius: 24, background: "#000", zIndex: 100, flexShrink: 0 }} />

      <IOSStatusBar />

      {/* extra spacing below status bar */}
      <div style={{ height: 16, flexShrink: 0 }} />

      {done ?
      <CIDoneScreen onDone={onDone} answers={answers} /> :

      <React.Fragment>

          {/* progress — pinned below status bar */}
          <div style={{ position: "absolute", top: 62, left: 0, right: 0, padding: "0 22px", zIndex: 5 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {CI_STEPS.map((s, i) =>
            <div key={s.id} style={{ flex: 1, height: 5, borderRadius: 99,
              background: i <= stepIdx ? "var(--accent)" : "var(--line)",
              transition: "background .3s ease" }} />
            )}
            </div>
          </div>

          {/* answers — centered on the FULL screen; question floats above */}
          <div key={animKey + "q"} className="ci-fz" style={{ position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", justifyContent: "center", padding: "0 24px", zIndex: 2 }}>

          <div style={{ position: "relative" }}>

            <div style={{ position: "absolute", left: 0, right: 0, bottom: "100%", paddingBottom: 22,
              fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: -0.8, lineHeight: 1.12, textAlign: "center" }}>{step.q}</div>

            {step.opts &&
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "stretch", justifyContent: "flex-start", textAlign: "left" }}>
                {step.opts.map((o, i) =>
              <CIAnswerRow key={o.l} idx={i} dots={o.d} label={o.l} selected={sel === o.l}
              onClick={() => setSel(o.l)} />
              )}
              </div>
            }

            {step.yesno &&
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
              { l: "Nie", note: step.noLabel || "Žiadny alkohol" },
              { l: "Áno", note: step.yesLabel || "Pil(a) som" }].
              map((o, i) => {
                const s = sel === o.l;
                return (
                  <button key={o.l} onClick={() => setSel(o.l)}
                  className="ci-row"
                  style={{ ["--d"]: `${i * 0.05}s`,
                    display: "flex", alignItems: "center", gap: 14, width: "100%", height: 70, padding: "0 20px",
                    border: s ? "none" : "1.5px solid var(--line)",
                    background: s ? "var(--accent)" : "#fff", borderRadius: 18,
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: s ? "0 8px 22px var(--accent-shadow)" : "0 1px 4px rgba(30,40,70,0.05)",
                    transition: "all .16s ease" }}>
                      <span style={{ flex: 1, textAlign: "left" }}>
                        <span style={{ display: "block", fontSize: 18, fontWeight: 760,
                        color: s ? "#fff" : "var(--ink)" }}>{o.l}</span>
                        <span style={{ display: "block", fontSize: 13,
                        color: s ? "rgba(255,255,255,0.7)" : "var(--faint)", marginTop: 2 }}>{o.note}</span>
                      </span>
                      <CIIcon name="arrow" size={18} stroke={s ? "#fff" : "var(--faint)"} sw={2} />
                    </button>);

              })}
              </div>
            }

            {step.pain &&
            <div className="ci-fz">
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 60, fontWeight: 850, lineHeight: 1, letterSpacing: -2,
                  color: pain == null ? "var(--faint)" : ciPainHue(pain),
                  fontVariantNumeric: "tabular-nums" }}>
                    {pain == null ? "–" : pain}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 680, marginTop: 8,
                  color: pain == null ? "var(--faint)" : ciPainHue(pain) }}>{ciPainLabel(pain)}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 9 }}>
                  {Array.from({ length: 11 }).map((_, n) => {
                  const s = pain === n;
                  return (
                    <button key={n} onClick={() => setPain(n)} style={{
                      width: 46, height: 46, borderRadius: "50%", cursor: "pointer", fontFamily: "inherit",
                      fontSize: 17.5, fontWeight: s ? 780 : 640, flexShrink: 0,
                      border: s ? "none" : "1.5px solid var(--line)",
                      background: s ? ciPainHue(n) : "#fff", color: s ? "#fff" : "var(--muted)",
                      transform: s ? "scale(1.1)" : "none", transition: "all .14s ease", padding: 0 }}>{n}</button>);

                })}
                </div>
              </div>
            }
            </div>
          </div>

          {/* footer — advance only on click */}
          {(() => {
          const val = step.pain ? pain : sel;
          const ready = val != null;
          const isLast = stepIdx >= CI_STEPS.length - 1;
          return (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 5, padding: "12px 24px 47px" }}>
              <button onClick={() => commit(val)} disabled={!ready}
              style={{ width: "100%", border: "none", borderRadius: 16, padding: "17px",
                fontSize: 16.5, fontWeight: 680, fontFamily: "inherit",
                cursor: ready ? "pointer" : "default",
                color: "#fff", background: "var(--accent)", opacity: ready ? 1 : 0.4,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: ready ? "0 8px 22px var(--accent-shadow)" : "none",
                transition: "opacity .2s ease" }}>
                {isLast ? "Dokončiť check-in" : "Ďalej"}
              </button>
            </div>);

        })()}
        </React.Fragment>
      }
    </div>);

}

Object.assign(window, { MorningCheckIn, CI_DATE_KEY, CI_ANSWERS_KEY });