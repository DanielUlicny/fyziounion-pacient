// app/progress.jsx — progress: summary cards, adherence + pain charts
// Exports to window: ProgressScreen

function SummaryCard({ icon, value, unit, label, tone }) {
  const tones = {
    accent: { bg: "var(--accent-wash)", ic: "var(--accent)", icbg: "#fff" },
    ok: { bg: "var(--ok-wash)", ic: "var(--ok)", icbg: "#fff" },
    warm: { bg: "var(--warm-wash)", ic: "var(--warm)", icbg: "#fff" },
  };
  const c = tones[tone] || tones.accent;
  return (
    <div style={{ background: c.bg, borderRadius: 18, padding: 15, flex: 1 }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: c.icbg, marginBottom: 12,
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(30,40,70,0.06)" }}>
        <Icon name={icon} size={19} stroke={c.ic} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontSize: 26, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.5 }}>{value}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 550, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function AdherenceChart({ range }) {
  const t = useT();
  const minimal = (t.chartStyle || "soft") === "minimal";

  let data;
  if (range === "7") {
    data = FYZIO.adherence; // existing 7-day Po-Ne weekly data
  } else if (range === "30") {
    // last 30 days grouped every 5 days → 6 clean bars
    const last30 = FYZIO.adherenceHistory.slice(-30);
    data = [];
    for (let i = 0; i < last30.length; i += 5) {
      const chunk = last30.slice(i, i + 5);
      const train = chunk.filter(c => c.isTrain);
      const v = train.length > 0 ? train.filter(c => c.v > 0).length / train.length : 0;
      data.push({ v: Math.round(v * 10) / 10, d: chunk[0].dateStr });
    }
  } else {
    // 3 months: group every 10 days, bar = % compliance
    const last = FYZIO.adherenceHistory.slice(-90);
    data = [];
    for (let i = 0; i < last.length; i += 10) {
      const chunk = last.slice(i, i + 10);
      const train = chunk.filter(c => c.isTrain);
      const v = train.length > 0 ? train.filter(c => c.v > 0).length / train.length : 0;
      data.push({ v: Math.round(v * 10) / 10, d: chunk[0].dateStr });
    }
  }

  const showLabel = i => true;

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end",
      height: 110, padding: "0 2px", overflowX: "hidden" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: "100%", height: 84, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            {minimal ? (
              <div style={{ width: 9, height: `${Math.max(d.v * 100, 6)}%`, borderRadius: 6,
                background: d.v === 0 ? "var(--line)" : d.v < 1 ? "var(--accent-light)" : "var(--accent)" }} />
            ) : (
              <div style={{ width: "78%", maxWidth: 32,
                height: `${Math.max(d.v * 100, 8)}%`, borderRadius: 8,
                background: d.v === 0 ? "var(--chip)" : d.v < 1
                  ? "linear-gradient(var(--accent-light), var(--accent-light))"
                  : "linear-gradient(180deg, var(--accent-light), var(--accent))",
                position: "relative" }}>
                {d.v === 1 && (
                  <span style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)" }}>
                    <Icon name="check" size={12} stroke="var(--ok)" sw={3} />
                  </span>
                )}
              </div>
            )}
          </div>
          {showLabel(i) && (
            <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600,
              whiteSpace: "nowrap" }}>{d.d}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function PainChart({ range }) {
  const t = useT();
  const minimal = (t.chartStyle || "soft") === "minimal";
  const [sel, setSel] = React.useState(null);

  React.useEffect(() => { setSel(null); }, [range]);

  const all = FYZIO.painHistory;

  // Build chart data per range
  let chartData;
  const bucket = (arr) => {
    const avg = arr.reduce((s, x) => s + x.pain, 0) / arr.length;
    return Math.round(avg); // averages are rounded, no decimals
  };
  if (range === "7") {
    // last 7 days, one point per day
    chartData = all.slice(-7).map(d => ({ label: d.dateStr, pain: d.pain, isAvg: false }));
  } else if (range === "30") {
    // last 30 days grouped every 3 days → ~10 points, each a rounded 3-day average
    const last = all.slice(-30);
    chartData = [];
    for (let i = 0; i < last.length; i += 3) {
      const chunk = last.slice(i, i + 3);
      chartData.push({ label: chunk[0].dateStr, pain: bucket(chunk), isAvg: true });
    }
  } else {
    // 3 months grouped every 10 days → rounded 10-day averages
    const last = all.slice(-90);
    chartData = [];
    for (let i = 0; i < last.length; i += 10) {
      const chunk = last.slice(i, i + 10);
      chartData.push({ label: chunk[0].dateStr, pain: bucket(chunk), isAvg: true });
    }
  }

  const showLabel = i => {
    if (range === "7") return true;
    if (range === "30") return i % 2 === 0 || i === chartData.length - 1;
    return true;
  };

  const W = 320, H = 108, padX = 18, padY = 12;
  const pts = chartData.map((d, i) => [
    padX + (i * (W - 2 * padX)) / Math.max(chartData.length - 1, 1),
    H - padY - (d.pain / 10) * (H - 2 * padY),
  ]);

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length-1][0].toFixed(1)} ${(H-padY).toFixed(1)} L${pts[0][0].toFixed(1)} ${(H-padY).toFixed(1)} Z`;

  const dotR = range === "30" ? 3 : range === "90" ? 5 : 4;

  const selD = sel !== null ? chartData[sel] : null;
  const selP = sel !== null ? pts[sel] : null;

  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} style={{ width: "100%", height: 148, overflow: "visible" }}
      onClick={() => setSel(null)}>
      <defs>
        <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.5, 1].map(g => (
        <line key={g} x1={padX} x2={W - padX}
          y1={padY + g * (H - 2 * padY)} y2={padY + g * (H - 2 * padY)}
          stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
      ))}

      {/* Area + line */}
      {!minimal && <path d={areaPath} fill="url(#painGrad)" />}
      <path d={linePath} fill="none" stroke="var(--accent)"
        strokeWidth={minimal ? 2 : 2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + hit targets */}
      {pts.map((p, i) => {
        const isSel = sel === i;
        const isLast = i === pts.length - 1;
        const onClick = e => { e.stopPropagation(); setSel(isSel ? null : i); };
        return (
          <g key={i} style={{ cursor: "pointer" }} onClick={onClick}>
            <circle cx={p[0]} cy={p[1]} r={11} fill="transparent" />
            <circle cx={p[0]} cy={p[1]} r={isSel ? 6 : dotR}
              fill={isSel || isLast ? "var(--accent)" : "#fff"}
              stroke="var(--accent)" strokeWidth={isSel ? 0 : 2} />
            {isSel && <circle cx={p[0]} cy={p[1]} r={10} fill="var(--accent)" fillOpacity="0.14" />}
          </g>
        );
      })}

      {/* X-axis date labels */}
      {chartData.map((d, i) => showLabel(i) && (
        <text key={i} x={pts[i][0]} y={H + 18}
          textAnchor="middle" fontSize="10.5" fontWeight="600"
          fill={sel === i ? "var(--accent)" : "var(--muted)"}>
          {d.label}
        </text>
      ))}

      {/* Tooltip — small badge showing just the pain number */}
      {selD && selP && (() => {
        const r = 19;
        const cx = Math.min(Math.max(selP[0], r + 4), W - r - 4);
        const above = selP[1] > H / 2;
        const cy = above ? selP[1] - r - 10 : selP[1] + r + 10;
        return (
          <g style={{ pointerEvents: "none" }}>
            <line x1={selP[0]} y1={above ? selP[1] - 7 : selP[1] + 7}
              x2={cx} y2={above ? cy + r : cy - r}
              stroke="var(--ink)" strokeWidth="1" strokeOpacity="0.2" />
            <circle cx={cx} cy={cy} r={r} fill="var(--ink)" />
            <text x={cx} y={cy + 6} textAnchor="middle" fontSize="16" fill="white" fontWeight="780">
              {selD.pain}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

function ProgressScreen() {
  const [range, setRange] = React.useState("30");
  return (
    <div>
      <div style={{ padding: "10px 20px 6px" }}>
        <div style={{ fontSize: 26, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.5 }}>Pokrok</div>
        <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 3 }}>Vaše zlepšenie v čase</div>
      </div>
      <div style={{ padding: "12px 20px 0" }}>
        <Segmented value={range} onChange={setRange}
          options={[{ value: "7", label: "7 dní" }, { value: "30", label: "30 dní" }, { value: "90", label: "3 mesiace" }]} />
      </div>

      <div style={{ padding: "16px 20px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <SummaryCard icon="checkCircle" value="86" unit="%" label="Dodržiavanie" tone="accent" />
          <SummaryCard icon="flame" value="5" unit="dní" label="Séria" tone="warm" />
          <SummaryCard icon="award" value="18" unit="" label="Cvičení" tone="ok" />
        </div>

        {/* Adherence */}
        <div style={{ background: "#fff", borderRadius: 22, padding: 18, border: "1px solid var(--line)",
          boxShadow: "0 2px 10px rgba(30,40,70,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>Dodržiavanie plánu</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Tento týždeň</div>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 650, color: "var(--ok-ink)", background: "var(--ok-wash)",
              borderRadius: 9, padding: "5px 10px", whiteSpace: "nowrap", flexShrink: 0 }}>+12 %</span>
          </div>
          <AdherenceChart range={range} />
        </div>

        {/* Pain trend */}
        <div style={{ background: "#fff", borderRadius: 22, padding: 18, border: "1px solid var(--line)",
          boxShadow: "0 2px 10px rgba(30,40,70,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--ink)" }}>Priebeh bolesti</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                {range === "7" ? "Posledných 7 dní" : range === "30" ? "Posledných 30 dní" : "Posledné 3 mesiace"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, fontWeight: 650, color: "var(--ok)" }}>
              <Icon name="chart" size={15} stroke="var(--ok)" /> Klesá
            </div>
          </div>
          <PainChart range={range} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProgressScreen });
