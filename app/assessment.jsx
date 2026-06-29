// app/assessment.jsx — Index centrálnej senzitizácie (CSI), one question per screen
// Exports to window: Assessment

const CSI_BANDS = [
  { max: 29,  label: "Subklinická", col: "oklch(0.62 0.07 258)" },
  { max: 39,  label: "Mierna",      col: "oklch(0.55 0.10 258)" },
  { max: 49,  label: "Stredná",     col: "oklch(0.48 0.11 258)" },
  { max: 59,  label: "Závažná",     col: "oklch(0.40 0.12 258)" },
  { max: 100, label: "Extrémna",    col: "oklch(0.33 0.13 258)" },
];
const csiBand = (score) => CSI_BANDS.find((b) => score <= b.max);

const CSI_YEARS = (() => {
  const ys = [];
  for (let y = 2026; y >= 1990; y--) ys.push(String(y));
  ys.push("Pred 1990");
  return ys;
})();

// full-width option row (radio style)
function OptionRow({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 13, padding: "16px 16px", borderRadius: 14,
      border: `1.5px solid ${selected ? "var(--accent)" : "var(--line)"}`,
      background: selected ? "var(--accent-wash)" : "#fff",
      transition: "all .15s ease",
    }}>
      <span style={{ width: 23, height: 23, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${selected ? "var(--accent)" : "var(--faint)"}`,
        background: selected ? "var(--accent)" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <span style={{ width: 8.5, height: 8.5, borderRadius: "50%", background: "#fff" }} />}
      </span>
      <span style={{ fontSize: 16, fontWeight: selected ? 660 : 500, color: selected ? "var(--accent-ink)" : "var(--ink)" }}>{label}</span>
    </button>
  );
}

function Assessment({ onClose, onDone }) {
  const A = FYZIO.assessment;
  const total = A.partA.length + A.partB.length;     // 25 + 10
  const [step, setStep] = React.useState(0);
  const [ansA, setAnsA] = React.useState({});
  const [ansB, setAnsB] = React.useState({});
  const [finished, setFinished] = React.useState(false);
  const advT = React.useRef(null);

  React.useEffect(() => () => clearTimeout(advT.current), []);

  const inA = step < A.partA.length;
  const aIdx = step;
  const bIdx = step - A.partA.length;

  const score = Object.values(ansA).reduce((s, v) => s + v, 0);
  const band = csiBand(score);
  const bCount = Object.values(ansB).filter((v) => v && v.has).length;

  const goNext = () => {
    if (step < total - 1) setStep(step + 1);
    else setFinished(true);
  };
  const goPrev = () => { if (step > 0) setStep(step - 1); };

  // answered state for current step
  const answered = inA
    ? ansA[aIdx] != null
    : (ansB[bIdx] && (ansB[bIdx].has === false || (ansB[bIdx].has === true && ansB[bIdx].year)));

  const pickA = (v) => {
    setAnsA((a) => ({ ...a, [aIdx]: v }));
  };
  const pickB = (val) => {
    setAnsB((b) => ({ ...b, [bIdx]: val }));
  };

  // status bar + dynamic island (overlay covers the device chrome)
  const TopChrome = () => (
    <React.Fragment>
      <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)",
        width: 126, height: 37, borderRadius: 24, background: "#000", zIndex: 100 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 }}>
        <IOSStatusBar />
      </div>
    </React.Fragment>
  );

  // ── Results ──
  if (finished) {
    return (
      <div className="fz-fade" style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column",
        background: "var(--bg)", overflow: "hidden" }}>
        <TopChrome />
        <div style={{ flex: 1, overflowY: "auto", padding: "60px 24px 24px", textAlign: "center" }}>
          <div style={{ width: 78, height: 78, borderRadius: "50%", margin: "0 auto 20px",
            background: "var(--accent-wash)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="checkCircle" size={42} stroke="var(--accent)" />
          </div>
          <div style={{ fontSize: 23, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.4, marginBottom: 8 }}>Dotazník odoslaný</div>
          <div style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.55, maxWidth: 290, margin: "0 auto 24px" }}>
            Ďakujeme. Výsledky boli zdieľané s vaším terapeutom. Ďalšie hodnotenie vás čaká o {A.intervalDays} dní.
          </div>
          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--line)", padding: "22px 20px",
            boxShadow: "0 2px 10px rgba(30,40,70,0.04)" }}>
            <div style={{ fontSize: 12.5, fontWeight: 650, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Skóre CSI · časť A</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, margin: "8px 0 14px" }}>
              <span style={{ fontSize: 52, fontWeight: 780, color: band.col, letterSpacing: -1, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: "var(--faint)" }}>/ 100</span>
            </div>
            <div style={{ height: 9, borderRadius: 99, background: "var(--ring-track)", overflow: "hidden", marginBottom: 14 }}>
              <div style={{ width: `${score}%`, height: "100%", borderRadius: 99, background: band.col, transition: "width .5s ease" }} />
            </div>
            <span style={{ display: "inline-block", fontSize: 13.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
              background: band.col, borderRadius: 99, padding: "6px 16px" }}>{band.label} úroveň</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 14, padding: "14px 16px",
            background: "var(--chip)", borderRadius: 16, textAlign: "left" }}>
            <Icon name="clipboard" size={19} stroke="var(--muted)" />
            <span style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.4 }}>
              Uvedené diagnózy: <b style={{ color: "var(--ink)" }}>{bCount}</b> z {A.partB.length}
            </span>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: "12px 24px 30px", borderTop: "1px solid var(--line)", background: "#fff" }}>
          <PrimaryButton onClick={() => onDone && onDone()}>Hotovo</PrimaryButton>
        </div>
      </div>
    );
  }

  const curB = ansB[bIdx] || {};

  return (
    <div className="fz-fade" style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column",
      background: "var(--bg)", overflow: "hidden" }}>

      <TopChrome />

      {/* top bar */}
      <div style={{ flexShrink: 0, padding: "52px 18px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <button onClick={step === 0 ? onClose : goPrev} aria-label="Späť" style={{
            width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--line)", background: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="chevL" size={21} stroke="var(--ink)" />
          </button>
          <div style={{ flex: 1, height: 7, borderRadius: 99, background: "var(--ring-track)", overflow: "hidden" }}>
            <div style={{ width: `${((step + 1) / total) * 100}%`, height: "100%", borderRadius: 99,
              background: "var(--accent)", transition: "width .3s ease" }} />
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 650, color: "var(--muted)", flexShrink: 0,
            fontVariantNumeric: "tabular-nums" }}>{step + 1}/{total}</span>
        </div>
      </div>

      {/* question */}
      <div key={step} className="fz-fade" style={{ flex: 1, overflowY: "auto", padding: "14px 22px 20px" }}>
        {inA ? (
          <React.Fragment>
            <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>{A.partAIntro}</div>
            <div style={{ fontSize: 20, fontWeight: 720, color: "var(--ink)", lineHeight: 1.32,
              letterSpacing: -0.2, marginBottom: 22, textWrap: "pretty" }}>{A.partA[aIdx]}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {A.scale.map((o, i) => (
                <OptionRow key={o} label={o} selected={ansA[aIdx] === i} onClick={() => pickA(i)} />
              ))}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>{A.partBIntro}</div>
            <div style={{ fontSize: 20, fontWeight: 720, color: "var(--ink)", lineHeight: 1.32,
              letterSpacing: -0.2, marginBottom: 22, textWrap: "pretty" }}>{A.partB[bIdx]}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <OptionRow label="Áno" selected={curB.has === true} onClick={() => pickB({ has: true, year: curB.year || "" })} />
              <OptionRow label="Nie" selected={curB.has === false} onClick={() => pickB({ has: false, year: "" })} />
            </div>
            {curB.has === true && (
              <div className="fz-fade" style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 650, color: "var(--ink)", marginBottom: 8 }}>Rok diagnózy</div>
                <select value={curB.year || ""} onChange={(e) => pickB({ has: true, year: e.target.value })}
                  style={{ width: "100%", height: 50, borderRadius: 14, border: "1.5px solid var(--line)",
                    background: "#fff", padding: "0 16px", fontFamily: "inherit", fontSize: 16,
                    fontWeight: 600, color: curB.year ? "var(--ink)" : "var(--faint)", cursor: "pointer", appearance: "none" }}>
                  <option value="" disabled>Vyberte rok…</option>
                  {CSI_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}
          </React.Fragment>
        )}
      </div>

      {/* footer */}
      <div style={{ flexShrink: 0, padding: "12px 22px 30px", borderTop: "1px solid var(--line)", background: "#fff" }}>
        <button onClick={goNext} disabled={!answered}
          style={{ width: "100%", border: "none", borderRadius: 16, padding: "17px",
            fontSize: 16.5, fontWeight: 680, fontFamily: "inherit",
            cursor: answered ? "pointer" : "default",
            color: "#fff", background: "var(--accent)", opacity: answered ? 1 : 0.4,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: answered ? "0 8px 22px var(--accent-shadow)" : "none",
            transition: "opacity .2s ease" }}>
          {step === total - 1 ? "Odoslať dotazník" : "Ďalej"}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Assessment });
