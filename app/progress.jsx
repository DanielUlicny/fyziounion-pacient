// app/progress.jsx — progress: summary tiles, adherence day marks, pain trend
// Exports to window: ProgressScreen

const PG_DAYS = { "7": 7, "30": 30, "90": 90 };
const skDate = (d) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
const skShort = (d) => `${d.getDate()}. ${d.getMonth() + 1}.`;
const NO_DATA = "Zatiaľ nemáme dosť údajov";
// frozen demo data: the last history entry is "now"
const pgNow = () => {
  const all = FYZIO.adherenceHistory;
  const t = FYZIO.today();
  const t0 = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  return all.length ? Math.min(t0, all[all.length - 1].date.getTime()) : t0;
};
const skDni = (n) => n === 1 ? "deň" : n >= 2 && n <= 4 ? "dni" : "dní";
const skCvik = (n) => n === 1 ? "cvičenie" : n >= 2 && n <= 4 ? "cvičenia" : "cvičení";
const skOdc = (n) => n === 1 ? "odcvičený deň" : n >= 2 && n <= 4 ? "odcvičené dni" : "odcvičených dní";

// ── period slice of the adherence history ────────────────────
function pgSlice(range) {
  const all = FYZIO.adherenceHistory;
  if (range === "7") {
    const last = all[all.length - 1];
    if (!last) return [];
    const a = last.date;
    const mon = new Date(a.getFullYear(), a.getMonth(), a.getDate() - ((a.getDay() + 6) % 7)).getTime();
    return all.filter((x) => x.date.getTime() >= mon);
  }
  return all.slice(-(PG_DAYS[range] || 30));
}
// the grid's period runs to the end of the last drawn week, so upcoming plan days show up
function pgPeriodEnd(days) {
  if (!days.length) return null;
  const b = days[days.length - 1].date;
  return new Date(b.getFullYear(), b.getMonth(), b.getDate() + (6 - ((b.getDay() + 6) % 7))).getTime();
}
const pgDone = (d) => d.doneEx != null ? d.doneEx : d.v > 0 ? d.totalEx || 4 : 0;
const pgTotal = (d) => d.totalEx || 4;
const pgFull = (d) => pgDone(d) >= pgTotal(d);
const pgRatio = (list) => {
  const t = list.reduce((s, d) => s + pgTotal(d), 0);
  return t ? list.reduce((s, d) => s + pgDone(d), 0) / t : null;
};
function pgStats(range) {
  const days = pgSlice(range);
  const train = days.filter((d) => d.isTrain && !d.future);
  // today is still running — it joins the elapsed days only once it's over
  const t0 = (() => { const t = new Date(pgNow()); return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime(); })();
  const elapsed = train.filter((d) => d.date.getTime() < t0);
  const upToToday = train.filter((d) => d.date.getTime() <= pgNow());
  const done = elapsed.filter(pgFull).length;
  const n = PG_DAYS[range] || 30;
  const prev = FYZIO.adherenceHistory.slice(-2 * n, -n);
  const prevTrain = prev.filter((d) => d.isTrain);
  const prevPct = prevTrain.length ? pgRatio(prevTrain) : null;
  const pct = elapsed.length ? pgRatio(elapsed) : null;
  // run of fully completed TRAINING days at the end of the period; rest days are skipped
  let streak = 0;
  let end = days.length - 1;
  // today's training day may not be finished yet — it doesn't count and doesn't break the run
  if (end >= 0 && days[end].isTrain && !pgFull(days[end])) end--;
  for (let i = end; i >= 0; i--) {
    if (!days[i].isTrain) continue;
    if (pgFull(days[i])) streak++;else break;
  }
  return { days, train: elapsed.length, done, streak,
    exDone: upToToday.reduce((s, d) => s + pgDone(d), 0),
    pct: pct == null ? null : Math.round(pct * 100),
    delta: pct == null || prevPct == null ? null : Math.round((pct - prevPct) * 100) };
}

function SummaryTile({ value, label }) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0, background: "#fff", border: "1px solid var(--line)",
      borderRadius: 12, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.035em",
        lineHeight: 1.05, whiteSpace: "nowrap" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 550, lineHeight: 1.2,
        textWrap: "pretty", marginTop: "auto" }}>{label}</div>
    </div>);

}

// ── Adherence: rows of day marks, one row per week ───────────
function DayMarks({ range }) {
  const [sel, setSel] = React.useState(null);
  const [selKey, setSelKey] = React.useState(null);
  React.useEffect(() => { setSel(null); setSelKey(null); }, [range]);
  const { days } = pgStats(range);
  const dKey = (dt) => dt ? `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}` : null;
  const pick = (d, ref) => {
    const k = dKey(d ? d.date : ref);
    if (selKey === k) { setSel(null);setSelKey(null);return; }
    const t = detail(d, ref);if (!t) return;
    setSel(t);setSelKey(k);
  };
  const st = pgStats(range);
  const summary = `Dni splnené na 100 %: ${st.done} z ${st.train} uplynulých.`;
  const tKey = (() => { const t = new Date(pgNow()); return `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`; })();
  const outlineKey = null;
  const wrap = (d, ref, node) => {
    const k = dKey(d ? d.date : ref);
    // today's date is always marked with a thin outline; the selected day gets a heavier, darker one
    const ring = selKey === k ? "0 0 0 2px var(--ink)" : tKey === k ? "0 0 0 1px #9DACBD" : "none";
    return <span style={{ display: "block", borderRadius: 5, padding: 1, boxShadow: ring }}>{node}</span>;
  };
  if (!days.length) return <div style={{ fontSize: 14, color: "var(--muted)" }}>{NO_DATA}</div>;

  const sz = 22;
  const gap = 4;
  const cell = (bg, border) =>
  <span style={{ width: sz, height: sz, borderRadius: 4, background: bg,
    border: border || "1px solid transparent", boxSizing: "border-box", display: "block", margin: "0 auto" }} />;
  const doneDot = cell("#346538");
  const partialDot = cell("#EDF3EC", "1px solid #CBDDCB");
  const missedDot = cell("#AEB9C4");
  const futureDot = cell("#fff", "1.5px solid #C3CCD5");
  const empty = <span style={{ width: sz, height: sz, display: "block", margin: "0 auto" }} />;
  const t0 = (() => { const t = FYZIO.today(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime(); })();
  const lastT = days.length ? days[days.length - 1].date.getTime() : t0;
  const nowT = Math.min(t0, lastT); // frozen demo data: the last history day is "now"
  // a cell with no history entry: derive it from the schedule
  const scheduled = (date) => !!date && FYZIO.planDow.includes(date.getDay());
  const startT = days.length ? days[0].date.getTime() : null;
  const endT = pgPeriodEnd(days);
  const outside = (day) => day && (startT != null && day.getTime() < startT || endT != null && day.getTime() > endT);
  const mark = (d, date) => {
    const day = d ? d.date : date;
    if (!d && outside(day)) return empty;                        // outside the period
    const inPlan = d ? d.isTrain : scheduled(date);
    if (!inPlan) return empty;                                    // rest day → no tile at all
    if (!day || day.getTime() > nowT) return futureDot;           // scheduled, not yet arrived
    const doneEx = d ? d.doneEx != null ? d.doneEx : d.v > 0 ? d.totalEx || 4 : 0 : 0;
    const total = d && d.totalEx || 4;
    if (doneEx <= 0) return missedDot;
    return doneEx >= total ? doneDot : partialDot;
  };
  // tappable day detail
  const detail = (d, date) => {
    const day = d ? d.date : date;
    if (!d && outside(day)) return null;
    const inPlan = d ? d.isTrain : scheduled(date);
    if (!inPlan || !day) return null;
    if (day.getTime() > nowT) return `${skShort(day)} · naplánované cvičenie`;
    const doneEx = d ? d.doneEx != null ? d.doneEx : d.v > 0 ? d.totalEx || 4 : 0 : 0;
    const total = d && d.totalEx || 4;
    return `${skShort(day)} · odcvičené ${doneEx} zo ${total} cvikov`;
  };
  const DOW = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  const todayIdx = (new Date(pgNow()).getDay() + 6) % 7;
  const dowStyle = (k) => ({ fontSize: 11, fontWeight: k === todayIdx ? 800 : 600,
    color: k === todayIdx ? "var(--ink)" : "var(--muted)" });
  const swatch = (bg, border) =>
  <span style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, background: bg,
    border: border || "none", boxSizing: "border-box" }} />;
  const legend =
  <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginTop: 6,
    fontSize: 10.5, color: "var(--muted)", whiteSpace: "nowrap" }}>
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{swatch("#346538")}Odcvičené</span>
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{swatch("#EDF3EC", "1px solid #CBDDCB")}Čiastočne</span>
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{swatch("#AEB9C4")}Neodcvičené</span>
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{swatch("#fff", "1.5px solid #C3CCD5")}Ešte len bude</span>
  </div>;

  // group into calendar weeks — one row per week
  const weeks = [];
  let cur = [];
  days.forEach((d) => {
    if (d.date.getDay() === 1 && cur.length) { weeks.push(cur); cur = []; }
    cur.push(d);
  });
  if (cur.length) weeks.push(cur);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
        <span style={{ width: 62, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap, textAlign: "center" }}>
          {DOW.map((l, k) => <span key={l} style={dowStyle(k)}>{l}</span>)}
        </div>
      </div>
      {weeks.map((w, i) =>
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 62, flexShrink: 0, fontSize: range === "90" ? 10 : 11, color: "var(--muted)", fontWeight: 550 }}>
          {skShort(new Date(w[0].date.getFullYear(), w[0].date.getMonth(),
          w[0].date.getDate() - ((w[0].date.getDay() + 6) % 7)))}
        </span>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap }}>
          {Array.from({ length: 7 }).map((_, k) => {
            const d = w.find((x) => (x.date.getDay() + 6) % 7 === k);
            const base = w[0].date;
            const ref = new Date(base.getFullYear(), base.getMonth(), base.getDate() - ((base.getDay() + 6) % 7) + k);
            return <span key={k} onClick={() => pick(d, ref)}
              style={{ display: "block", cursor: detail(d, ref) ? "pointer" : "default" }}>
              {wrap(d, ref, mark(d, ref))}
            </span>;
          })}
        </div>
      </div>)}
      <div style={{ fontSize: 12.5, fontWeight: 400, color: "var(--text)", marginTop: 6, minHeight: 17,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {sel || summary}
      </div>
      {legend}
    </div>);

}

// ── Pain trend: line with a 0–10 axis ───────────────────────
// pain points inside the SAME period the adherence grid draws — no points before/after it
function pgPainWindow(range) {
  const days = pgSlice(range);
  if (!days.length) return null;
  const a = days[0].date;
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = pgPeriodEnd(days);
  return { start, end: end == null ? start : end };
}
function pgPain(range) {
  const w = pgPainWindow(range);
  if (!w) return [];
  return FYZIO.painHistory.
  filter((x) => x.t >= w.start && x.t <= w.end).
  map((d) => ({ t: d.t, date: new Date(d.t), pain: d.pain }));
}

function PainChart({ range }) {
  const [sel, setSel] = React.useState(null);
  React.useEffect(() => { setSel(null); }, [range]);
  const data = pgPain(range);
  const win = pgPainWindow(range);
  if (!data.length || !win) return <div style={{ fontSize: 13.5, color: "var(--muted)" }}>Bolesť ste v tomto období nezaznačili.</div>;

  const DAY = 86400000;
  const W = 320, H = 112, axisW = 24, padR = 10, padY = 12;
  const span = Math.max(win.end - win.start, DAY);
  const x = (t) => axisW + (t - win.start) / span * (W - axisW - padR);
  const y = (p) => padY + (1 - p / 10) * (H - 2 * padY);
  const pts = data.map((d) => [x(d.t), y(d.pain)]);
  const r = range === "90" ? 3.4 : 4;
  const selD = sel != null ? data[sel] : null;
  // touch anywhere selects the nearest recorded day; dragging moves the selection
  const pickNearest = (ev) => {
    const svg = ev.currentTarget.ownerSVGElement || ev.currentTarget;
    const b = svg.getBoundingClientRect();
    const ux = (ev.clientX - b.left) / b.width * W;
    let best = 0, bd = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(p[0] - ux); if (d < bd) { bd = d;best = i; } });
    setSel(best);
  };
  const drag = React.useRef(false);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 118, overflow: "visible" }}>
      {[10, 5, 0].map((g) =>
      <g key={g}>
        <line x1={axisW} x2={W - padR} y1={y(g)} y2={y(g)} stroke="var(--line)" strokeWidth="1" />
        <text x={axisW - 7} y={y(g) + 3.5} textAnchor="end" fontSize="10" fill="var(--muted)">{g}</text>
      </g>)}
      {selD &&
      <line x1={pts[sel][0]} x2={pts[sel][0]} y1={padY} y2={H - padY}
        stroke="#D6DDE4" strokeWidth="1" />}
      {pts.map((p, i) => {
        const isSel = sel === i;
        return (
          <circle key={i} cx={p[0]} cy={p[1]} r={isSel ? r + 1.6 : r} fill={isSel ? "var(--ink)" : "var(--accent)"}
            stroke="#fff" strokeWidth="2" />);

      })}
      <rect x="0" y="0" width={W} height={H} fill="transparent" style={{ cursor: "pointer", touchAction: "none" }}
        onPointerDown={(ev) => { drag.current = true;ev.currentTarget.setPointerCapture(ev.pointerId);pickNearest(ev); }}
        onPointerMove={(ev) => { if (drag.current) pickNearest(ev); }}
        onPointerUp={() => {drag.current = false;}} onPointerCancel={() => {drag.current = false;}} />
      {selD && (() => {
        const w = 132, h = 26, i = sel;
        // flips at the edges, sits in the band away from the selected dot
        let cx = pts[i][0] - w / 2;
        if (cx < axisW) cx = Math.min(pts[i][0] - 8, W - padR - w);
        if (cx + w > W - padR) cx = Math.max(pts[i][0] + 8 - w, axisW);
        cx = Math.min(Math.max(cx, axisW), W - padR - w);
        const lower = pts[i][1] - h - 10 >= 0;
        const ty = lower ? pts[i][1] - h - 10 : Math.min(pts[i][1] + 10, H - h);
        return (
          <g style={{ pointerEvents: "none" }}>
            <rect x={cx} y={ty} width={w} height={h} rx="6" fill="var(--ink)" />
            <text x={cx + w / 2} y={ty + 17} textAnchor="middle" fontSize="12" fill="#fff" fontWeight="650">
              {skShort(selD.date)} · bolesť {selD.pain} z 10
            </text>
          </g>);

      })()}
    </svg>);

}

function ProgressScreen() {
  const [range, setRange] = React.useState("30");
  const [swap, setSwap] = React.useState(false);
  const changeRange = (v) => { if (v === range) return; setSwap(true); setRange(v); };
  React.useEffect(() => {
    if (!swap) return;
    const id = setTimeout(() => setSwap(false), 30);
    return () => clearTimeout(id);
  }, [swap]);
  const s = pgStats(range);
  const pain = pgPain(range);
  const nowPain = pain.length ? pain[pain.length - 1].pain : null;
  const firstPain = pain.length ? pain[0].pain : null;
  const painLine = nowPain == null ? "Bolesť ste v tomto období nezaznačili." :
  nowPain === firstPain ? `Bolesť ${nowPain} z 10` : `Teraz ${nowPain} z 10 · na začiatku ${firstPain} z 10`;
  const prevPhrase = range === "7" ? "oproti minulému týždňu" : range === "30" ? "oproti minulému mesiacu" :
  "oproti predošlým 3 mesiacom";
  const openPeriod = (() => {
    const end = pgPeriodEnd(s.days);
    return end != null && end > pgNow();
  })();
  const openPhrase = "Obdobie ešte beží";
  const trend = openPeriod ? "Obdobie ešte beží" : nowPain == null || firstPain == null ? null :
  nowPain < firstPain ? "Klesá" : nowPain > firstPain ? "Stúpa" : "Bez zmeny";
  const periodLabel = (() => {
    const d = s.days;
    if (!d.length) return "";
    const a = d[0].date;
    const bEnd = pgPeriodEnd(d);
    const b = bEnd ? new Date(bEnd) : d[d.length - 1].date;
    const sameYear = a.getFullYear() === b.getFullYear();
    return `${a.getDate()}. ${a.getMonth() + 1}.${sameYear ? "" : ` ${a.getFullYear()}`} – ${skDate(b)}`;
  })();

  return (
    <div>
      <div style={{ padding: "10px 20px 6px" }}>
        <div style={{ fontSize: 26, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.5 }}>Pokrok</div>
        <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 3 }}>Vaše zlepšenie v čase</div>
      </div>
      <div style={{ padding: "12px 20px 0" }}>
        <Segmented value={range} onChange={changeRange}
          options={[{ value: "7", label: "Týždeň" }, { value: "30", label: "Mesiac" }, { value: "90", label: "3 mesiace" }]} />
      </div>

      <div style={{ padding: "18px 20px 8px", display: "flex", flexDirection: "column", gap: 30,
        opacity: swap ? 0 : 1, filter: swap ? "blur(2px)" : "blur(0px)",
        transition: swap ? "none" : "opacity .26s ease, filter .26s ease" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <SummaryTile value={s.pct == null ? "—" : `${s.pct} %`} label="dodržiavanie" />
          <SummaryTile value={String(s.streak)} label={`${skDni(s.streak)} v rade`} />
          <SummaryTile value={String(s.exDone)} label="cvičení" />
        </div>

        {/* Adherence */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid var(--line)",
          boxShadow: "0 2px 10px rgba(30,40,70,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>Dodržiavanie plánu</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{periodLabel}</div>
            </div>
            {openPeriod ?
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>{openPhrase}</div>
            </div> :
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>
                {s.delta == null ? "—" : s.delta === 0 ? "Bez zmeny" : `${s.delta > 0 ? "+" : "−"}${Math.abs(s.delta)} %`}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, whiteSpace: "nowrap" }}>
                {prevPhrase}
              </div>
            </div>}
          </div>
          <div style={{ height: 16 }} />
          <DayMarks range={range} />
        </div>

        {/* Pain trend */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid var(--line)",
          boxShadow: "0 2px 10px rgba(30,40,70,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>Priebeh bolesti</div>
            {trend &&
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", whiteSpace: "nowrap" }}>{trend}</span>}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{periodLabel}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, marginBottom: 12 }}>
            {painLine}
          </div>
          {nowPain != null &&
          <React.Fragment>
            <PainChart range={range} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingLeft: 24,
              fontSize: 11, color: "var(--muted)" }}>
              {(() => {
                const w = pgPainWindow(range);
                if (!w) return null;
                const mid = w.start + (w.end - w.start) / 2;
                return [w.start, mid, w.end].map((t, i) =>
                <span key={i} style={{ whiteSpace: "nowrap" }}>{skShort(new Date(t))}</span>);
              })()}
            </div>
          </React.Fragment>}
        </div>

      </div>
    </div>);

}

Object.assign(window, { ProgressScreen });
