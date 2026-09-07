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

const TA_LINE = "var(--line)";
const TA_STORE = "fyzio_assess_progress";

// one row inside the grouped options card (radio = single, square = multi)
function QRow({ label, selected, kind, onPick, last, disabled }) {
  const { ref, pressed, handlers } = usePress(() => { if (!disabled) onPick(); });
  return (
    <div ref={ref} {...(disabled ? {} : handlers)} className="fz-press" data-pressed={pressed ? "1" : "0"}
      role={kind === "check" ? "checkbox" : "radio"} aria-checked={selected} aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 16px",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1,
        background: selected ? "var(--accent-wash)" : "#fff",
        borderBottom: last ? "none" : `1px solid ${TA_LINE}` }}>
      {kind === "check" ?
      <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        border: `1.5px solid ${selected ? "var(--accent)" : "var(--faint)"}`,
        background: selected ? "var(--accent)" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <Icon name="check" size={15} stroke="#fff" sw={2.6} />}
      </span> :
      <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${selected ? "var(--accent)" : "var(--faint)"}`,
        background: selected ? "var(--accent)" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
      </span>}
      <span style={{ flex: 1, fontSize: 15.5, lineHeight: 1.35, fontWeight: selected ? 640 : 500,
        color: selected ? "var(--accent-ink)" : "var(--ink)" }}>{label}</span>
    </div>);

}

function OptionsCard({ children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${TA_LINE}`, borderRadius: 12, overflow: "hidden" }}>
      {children}
    </div>);

}

function Assessment({ onClose, onDone, showResult }) {
  const A = FYZIO.assessment;
  const Q = A.questions;
  const total = Q.length;
  const [step, setStep] = React.useState(0);
  const [ans, setAns] = React.useState({}); // id -> value (index for single, array for multi, number for scale)
  const [finished, setFinished] = React.useState(!!showResult);
  const [resumed, setResumed] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [showAnswers, setShowAnswers] = React.useState(false);

  // demo: seed plausible answers so the result screen has data
  React.useEffect(() => {
    if (!showResult) return;
    const seeded = {};
    Q.forEach((q, i) => {
      if (q.type === "multi") seeded[q.id] = (q.useActivities ? A.activities : q.options.map((o) => o.label)).slice(0, 2);
      else if (q.type === "scale") seeded[q.id] = 4 + i % 4;
      else if (q.options) seeded[q.id] = Math.min(q.options.length - 1, 1 + i % 3);
    });
    setAns(seeded);
  }, [showResult]);

  // interrupted questionnaire — restore answers + position
  React.useEffect(() => {
    if (showResult) return;
    try {
      const raw = localStorage.getItem(TA_STORE);
      if (!raw) return;
      const s = JSON.parse(raw);
      const saved = s && s.ans ? s.ans : null;
      const isAnswered = (q) => {
        const v = saved[q.id];
        if (q.type === "multi") return Array.isArray(v) && v.length > 0;
        return v != null;
      };
      if (saved && Q.some(isAnswered)) {
        setAns(saved);
        let first = Q.findIndex((q) => !isAnswered(q));
        if (first < 0) first = Q.length - 1;
        setStep(first);
        setResumed(true);
      }
    } catch (e) {}
  }, []);
  React.useEffect(() => {
    try { localStorage.setItem(TA_STORE, JSON.stringify({ step, ans })); } catch (e) {}
  }, [step, ans]);

  const q = Q[step];
  const cur = ans[q.id];

  const answered = q.type === "multi"
    ? Array.isArray(cur) && cur.length > 0
    : cur != null;

  const goNext = () => { setResumed(false); if (step < total - 1) setStep(step + 1); else { setFinished(true); try { localStorage.removeItem(TA_STORE); } catch (e) {} } };
  const goPrev = () => { setResumed(false); if (step > 0) setStep(step - 1); };

  const pickSingle = (i) => setAns((a) => ({ ...a, [q.id]: i }));
  const pickScale = (n) => setAns((a) => ({ ...a, [q.id]: a[q.id] === n ? null : n }));
  const NONE = "Žiadna z uvedených";
  const toggleMulti = (label) => setAns((a) => {
    if (label === NONE) return { ...a, [q.id]: (a[q.id] || []).includes(NONE) ? [] : [NONE] };
    const list = (a[q.id] || []).filter((x) => x !== NONE);
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
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 50, background: "var(--bg)", zIndex: 19 }} />
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
        <div style={{ flex: 1, overflowY: "auto", textAlign: "center",
          padding: "60px 24px calc(96px + max(env(safe-area-inset-bottom), 26px))" }}>
          <div style={{ width: 78, height: 78, borderRadius: "50%", margin: "0 auto 20px",
            background: "var(--accent-wash)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="checkCircle" size={42} stroke="var(--accent)" />
          </div>
          <div style={{ fontSize: 23, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.4, marginBottom: 8 }}>Dotazník odoslaný</div>
          <div style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.55, maxWidth: 290, margin: "0 auto 24px" }}>
            Ďakujeme. Výsledky boli zdieľané s vaším terapeutom. Ďalšie hodnotenie vás čaká o {A.intervalDays} dní ({(() => {
              const M = ["januára", "februára", "marca", "apríla", "mája", "júna", "júla", "augusta", "septembra", "októbra", "novembra", "decembra"];
              const dd = new Date(); dd.setDate(dd.getDate() + A.intervalDays);
              return `${dd.getDate()}. ${M[dd.getMonth()]}`;
            })()}).
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--line)", padding: "22px 20px",
            boxShadow: "0 2px 10px rgba(30,40,70,0.04)" }}>
            <div style={{ fontSize: 12.5, fontWeight: 650, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Celkové skóre · TENDINS-A</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, margin: "8px 0 14px" }}>
              <span style={{ fontSize: 52, fontWeight: 780, color: "var(--ink)", letterSpacing: -1, lineHeight: 1 }}>{totalScore}</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: "var(--faint)" }}>/ 100</span>
            </div>
            <div style={{ height: 9, borderRadius: 99, background: "var(--ring-track)", overflow: "hidden", marginBottom: 14 }}>
              <div style={{ width: `${Math.max(0, Math.min(100, totalScore / 100 * 100))}%`, height: "100%", borderRadius: 99, background: "var(--accent)", transition: "width .5s ease" }} />
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>Vyššie skóre znamená menšie ťažkosti.</div>

            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {rows.map((r) => (
                <div key={r.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{r.val} / {r.max} · {Math.round(r.val / r.max * 100)} %</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: "var(--ring-track)", overflow: "hidden" }}>
                    <div style={{ width: `${(r.val / r.max) * 100}%`, height: "100%", borderRadius: 99, background: "var(--accent)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${TA_LINE}`, marginTop: 14,
            textAlign: "left", overflow: "hidden" }}>
            <button onClick={() => setShowAnswers((v) => !v)} style={{ width: "100%", display: "flex", alignItems: "center",
              gap: 8, padding: "15px 16px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Vaše odpovede</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                {showAnswers ? "Skryť" : "Zobraziť"}
                <span style={{ display: "inline-flex", transform: showAnswers ? "rotate(180deg)" : "none", transition: "transform .22s ease" }}>
                  <Icon name="chevronDown" size={16} stroke="var(--muted)" />
                </span>
              </span>
            </button>
            {showAnswers &&
            <div>
              {Q.map((qq) => {
                const v = ans[qq.id];
                const txt = qq.type === "multi" ? Array.isArray(v) && v.length ? v.join(", ") : "—" :
                qq.type === "scale" ? v != null ? String(v) : "—" :
                v != null && qq.options && qq.options[v] ? qq.options[v].label : "—";
                return (
                  <div key={qq.id} style={{ padding: "12px 16px", borderTop: `1px solid ${TA_LINE}` }}>
                    <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.4 }}>{qq.q}</div>
                    <div style={{ fontSize: 14, fontWeight: 640, color: "var(--ink)", marginTop: 3, lineHeight: 1.4 }}>{txt}</div>
                  </div>);

              })}
            </div>}
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: "12px 24px 30px", borderTop: "1px solid var(--line)", background: "#fff" }}>
          <PrimaryButton onClick={() => onDone && onDone()} style={{ borderRadius: 6, boxShadow: "none" }}>Hotovo</PrimaryButton>
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
            width: 40, height: 40, borderRadius: 6, border: `1px solid ${TA_LINE}`, background: "#fff",
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

      {/* sticky condensed question once the header scrolls away */}
      {scrolled &&
      <div style={{ flexShrink: 0, padding: "6px 22px 8px", background: "var(--bg)",
        borderBottom: `1px solid ${TA_LINE}` }}>
        <div style={{ fontSize: 13.5, fontWeight: 650, color: "var(--ink)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.q}</div>
      </div>}

      {/* question */}
      <div key={step} className="fz-fade" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 44)}
        style={{ flex: 1, overflowY: "auto", padding: "8px 22px 20px",
          paddingBottom: "calc(110px + max(env(safe-area-inset-bottom), 26px))" }}>
        {resumed &&
        <div style={{ marginBottom: 14, borderRadius: 12, padding: "11px 14px",
          background: "var(--info-wash)", border: "1px solid var(--info-line)", color: "var(--info-ink)",
          fontSize: 13.5, fontWeight: 600 }}>Pokračujete tam, kde ste skončili.</div>}
        <div style={{ fontSize: 20, fontWeight: 720, color: "var(--ink)", lineHeight: 1.32,
          letterSpacing: -0.2, marginBottom: q.help ? 10 : 20, textWrap: "pretty" }}>{q.q}</div>
        {q.help && <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 20 }}>{q.help}</div>}

        {q.type === "multi" && (() => {
          const labels = (q.useActivities ? A.activities : q.options.map((o) => o.label)).concat(["Žiadna z uvedených"]);
          return (
            <OptionsCard>
              {labels.map((label, i) => {
                const noneOn = (cur || []).includes(NONE);
                return (
                  <QRow key={label} label={label} kind="check" selected={(cur || []).includes(label)}
                    disabled={noneOn && label !== NONE}
                    onPick={() => toggleMulti(label)} last={i === labels.length - 1} />);

              })}
            </OptionsCard>);

        })()}

        {q.type === "single" &&
        <OptionsCard>
          {q.options.map((o, i) =>
          <QRow key={o.label} label={o.label} kind="radio" selected={cur === i}
            onPick={() => pickSingle(i)} last={i === q.options.length - 1} />)}
        </OptionsCard>}

        {q.type === "scale" && (() => {
          const tile = (n) => {
            const sel = cur === n;
            return (
              <button key={n} onClick={() => pickScale(n)} aria-pressed={sel} style={{
                width: "calc((100% - 40px) / 6)", flexShrink: 0, height: 46, borderRadius: 6, cursor: "pointer",
                fontFamily: "inherit", fontSize: 16, fontWeight: sel ? 760 : 560,
                border: sel ? "1px solid var(--accent)" : "1px solid var(--line)",
                background: sel ? "var(--accent)" : "#fff", color: sel ? "#fff" : "var(--text)",
                transition: "background .14s ease, color .14s ease", padding: 0 }}>{n}</button>);

          };
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>{[0, 1, 2, 3, 4, 5].map(tile)}</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>{[6, 7, 8, 9, 10].map(tile)}</div>
            </div>);

        })()}
      </div>

      {/* footer */}
      <div style={{ flexShrink: 0, padding: "12px 22px", background: "var(--bg)",
        borderTop: `1px solid ${TA_LINE}`,
        paddingBottom: "calc(12px + max(env(safe-area-inset-bottom), 26px))" }}>
        <button onClick={goNext} disabled={!answered}
          style={{ width: "100%", border: "none", borderRadius: 6, padding: "17px",
            fontSize: 16.5, fontWeight: 680, fontFamily: "inherit",
            cursor: answered ? "pointer" : "default",
            color: answered ? "#fff" : "var(--muted)",
            background: answered ? "var(--accent)" : "var(--chip)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "none", transition: "background .2s ease, color .2s ease" }}>
          {step === total - 1 ? "Odoslať dotazník" : "Ďalej"}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Assessment });
