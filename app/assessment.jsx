// app/assessment.jsx — TENDINS-A: hodnotenie závažnosti tendinopatie Achillovej šľachy
// Exports to window: Assessment

// severity bands for the total /100 (higher = worse)
const TA_BANDS = [
  { max: 24,  label: "Mierna",         col: "oklch(0.62 0.07 258)" },
  { max: 49,  label: "Stredná",        col: "oklch(0.52 0.10 258)" },
  { max: 74,  label: "Závažná",        col: "oklch(0.44 0.12 258)" },
  { max: 100, label: "Veľmi závažná",  col: "oklch(0.36 0.13 258)" },
];
const taBand = (score) => TA_BANDS.find((b) => score <= b.max);

const TA_SECTION_MAX = { pain: 40, symptoms: 30, fn: 30 };

// radio-style option row
function OptionRow({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 13, padding: "15px 16px", borderRadius: 14,
      border: `1.5px solid ${selected ? "var(--accent)" : "var(--line)"}`,
      background: selected ? "var(--accent-wash)" : "#fff",
      transition: "border-color .15s ease, background .15s ease",
    }}>
      <span style={{ width: 23, height: 23, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${selected ? "var(--accent)" : "var(--faint)"}`,
        background: selected ? "var(--accent)" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <span style={{ width: 8.5, height: 8.5, borderRadius: "50%", background: "#fff" }} />}
      </span>
      <span style={{ flex: 1, fontSize: 15.5, lineHeight: 1.35, fontWeight: selected ? 640 : 500,
        color: selected ? "var(--accent-ink)" : "var(--ink)" }}>{label}</span>
    </button>
  );
}

// checkbox-style row (multi-select)
function CheckRow({ label, checked, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", borderRadius: 14,
      border: `1.5px solid ${checked ? "var(--accent)" : "var(--line)"}`,
      background: checked ? "var(--accent-wash)" : "#fff",
      transition: "border-color .15s ease, background .15s ease",
    }}>
      <span style={{ width: 23, height: 23, borderRadius: 7, flexShrink: 0,
        border: `1.5px solid ${checked ? "var(--accent)" : "var(--faint)"}`,
        background: checked ? "var(--accent)" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {checked && <Icon name="check" size={15} stroke="#fff" sw={2.6} />}
      </span>
      <span style={{ flex: 1, fontSize: 15.5, fontWeight: checked ? 620 : 500,
        color: checked ? "var(--accent-ink)" : "var(--ink)" }}>{label}</span>
    </button>
  );
}

function Assessment({ onClose, onDone }) {
  const A = FYZIO.assessment;
  const Q = A.questions;
  const total = Q.length;
  const [step, setStep] = React.useState(0);
  const [ans, setAns] = React.useState({}); // id -> value (index for single, array for multi, number for scale)
  const [finished, setFinished] = React.useState(false);

  const q = Q[step];
  const cur = ans[q.id];

  const answered = q.type === "multi"
    ? true                                   // multi-select is optional (can be none)
    : q.type === "scale"
      ? true                                 // scale is optional (leave blank if unable)
      : cur != null;

  const goNext = () => { if (step < total - 1) setStep(step + 1); else setFinished(true); };
  const goPrev = () => { if (step > 0) setStep(step - 1); };

  const pickSingle = (i) => setAns((a) => ({ ...a, [q.id]: i }));
  const pickScale = (n) => setAns((a) => ({ ...a, [q.id]: a[q.id] === n ? null : n }));
  const toggleMulti = (label) => setAns((a) => {
    const list = a[q.id] || [];
    return { ...a, [q.id]: list.includes(label) ? list.filter((x) => x !== label) : [...list, label] };
  });

  // scoring
  const scoreFor = (sec) => Q.filter((x) => x.section === sec).reduce((s, x) => {
    const v = ans[x.id];
    if (x.type === "scale") return s + (typeof v === "number" ? v : 0);
    if (x.type === "single" && x.options[v] && x.options[v].pts != null) return s + x.options[v].pts;
    return s;
  }, 0);
  const painScore = scoreFor("pain");
  const symScore = scoreFor("symptoms");
  const fnScore = scoreFor("fn");
  const totalScore = painScore + symScore + fnScore;
  const band = taBand(totalScore);

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
    const rows = [
      { label: "Bolesť", val: painScore, max: TA_SECTION_MAX.pain },
      { label: "Symptómy", val: symScore, max: TA_SECTION_MAX.symptoms },
      { label: "Fyzická funkcia", val: fnScore, max: TA_SECTION_MAX.fn },
    ];
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
            <div style={{ fontSize: 12.5, fontWeight: 650, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Celkové skóre · TENDINS-A</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, margin: "8px 0 14px" }}>
              <span style={{ fontSize: 52, fontWeight: 780, color: band.col, letterSpacing: -1, lineHeight: 1 }}>{totalScore}</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: "var(--faint)" }}>/ 100</span>
            </div>
            <div style={{ height: 9, borderRadius: 99, background: "var(--ring-track)", overflow: "hidden", marginBottom: 14 }}>
              <div style={{ width: `${totalScore}%`, height: "100%", borderRadius: 99, background: band.col, transition: "width .5s ease" }} />
            </div>
            <span style={{ display: "inline-block", fontSize: 13.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
              background: band.col, borderRadius: 99, padding: "6px 16px" }}>{band.label} závažnosť</span>

            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {rows.map((r) => (
                <div key={r.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{r.val} / {r.max}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: "var(--ring-track)", overflow: "hidden" }}>
                    <div style={{ width: `${(r.val / r.max) * 100}%`, height: "100%", borderRadius: 99, background: "var(--accent)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: "12px 24px 30px", borderTop: "1px solid var(--line)", background: "#fff" }}>
          <PrimaryButton onClick={() => onDone && onDone()}>Hotovo</PrimaryButton>
        </div>
      </div>
    );
  }

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
      <div key={step} className="fz-fade" style={{ flex: 1, overflowY: "auto", padding: "8px 22px 20px" }}>
        <div style={{ fontSize: 20, fontWeight: 720, color: "var(--ink)", lineHeight: 1.32,
          letterSpacing: -0.2, marginBottom: q.help ? 10 : 20, textWrap: "pretty" }}>{q.q}</div>
        {q.help && <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 20 }}>{q.help}</div>}

        {q.type === "multi" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {(q.useActivities ? A.activities : q.options.map((o) => o.label)).map((label) => (
              <CheckRow key={label} label={label} checked={(cur || []).includes(label)} onClick={() => toggleMulti(label)} />
            ))}
          </div>
        )}

        {q.type === "single" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {q.options.map((o, i) => (
              <OptionRow key={o.label} label={o.label} selected={cur === i} onClick={() => pickSingle(i)} />
            ))}
          </div>
        )}

        {q.type === "scale" && (
          <div>
            <div style={{ textAlign: "center", margin: "4px 0 20px" }}>
              <span style={{ fontSize: 50, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1,
                color: cur == null ? "var(--faint)" : "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
                {cur == null ? "–" : cur}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {Array.from({ length: 11 }).map((_, n) => {
                const sel = cur === n;
                return (
                  <button key={n} onClick={() => pickScale(n)} style={{
                    width: "calc((100% - 40px) / 6)", height: 46, borderRadius: 13, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 16, fontWeight: sel ? 760 : 560,
                    border: sel ? "none" : "1.5px solid var(--line)",
                    background: sel ? "var(--accent)" : "#fff", color: sel ? "#fff" : "var(--text)",
                    boxShadow: sel ? "0 4px 14px var(--accent-shadow)" : "none",
                    transition: "background .14s ease, color .14s ease", padding: 0 }}>{n}</button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, color: "var(--muted)", padding: "0 4px" }}>
              <span>0 · žiadna</span><span>10 · najintenzívnejšia</span>
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <div style={{ flexShrink: 0, padding: "12px 22px 30px" }}>
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
