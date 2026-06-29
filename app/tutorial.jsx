// app/tutorial.jsx — first-run coach-marks for new patients (Home + Exercise screens)
// Exports to window: Tutorial, TOUR_FLAG

const TOUR_FLAG = "fyzio_tour_done_v1";

// navigate: "exercise" = open first exercise before this step
//           "home"     = return to home before this step
//           undefined  = no nav change
const TOUR_STEPS = [
  {
    sel: null, icon: "spark", navigate: "home",
    title: "Vitajte v aplikácii",
    body: "Toto je váš domov pre rehabilitáciu. Ukážeme vám v skratke, ako všetko funguje. Potrvá to len chvíľu.",
  },
  {
    sel: "program", icon: "clipboard", place: "below", navigate: "home",
    title: "Váš program",
    body: "Hore vidíte názov programu a fázu. Klepnutím sem môžete prepínať medzi programami, ktoré vám priradili fyzioterapeuti.",
  },
  {
    sel: "days", icon: "calendar", place: "below", navigate: "home",
    title: "Plán deň po dni",
    body: "Posúvaním kalendára si pozriete plán na ktorýkoľvek deň. Vybraný deň je zvýraznený a dni cvičenia sú označené modrou bodkou.",
  },
  {
    sel: "card", icon: "play", place: "below", navigate: "home",
    title: "Vaše cviky na dnes",
    body: "Klepnutím na cvik otvoríte návod. Na štvorček s fajfkou vpravo klepnite po každej dokončenej sérii — keď ich dokončíte všetky, cvik sa označí ako odcvičený.",
  },
  {
    sel: "ex-video", icon: "play", place: "below", navigate: "exercise",
    title: "Video s návodom",
    body: "Video sa prehrá automaticky. Potiahnutím lišty nahor zobrazíte popis cviku. Potiahnutím lišty nadol zväčšíte cvik na celú obrazovku.",
  },
  {
    sel: "ex-series-btn", icon: "check", place: "left", navigate: "exercise",
    title: "Odpočítajte série",
    body: "Po každej dokončenej sérii klepnite sem. Keď ich spravíte všetky, cvik sa automaticky označí ako odcvičený.",
  },
  {
    sel: "ex-timer", icon: "timer", place: "above", navigate: "exercise",
    title: "Časovač výdrže",
    body: "Ak má cvik nastavenú výdrž, nájdete tu časovač. Klepnutím naň spustíte odpočet.",
  },
  {
    sel: null, icon: "activity", navigate: "home",
    title: "Denný check-in",
    body: "Každý deň dostanete pár krátkych otázok o spánku, strese a bolesti. Pomáha to vášmu fyzioterapeutovi sledovať vaše zotavenie a prispôsobiť cvičenie.",
  },
  {
    sel: "nav", icon: "chart", place: "above", navigate: "home",
    title: "Pokrok a nastavenia",
    body: "Dole prepínate medzi Domovom, Pokrokom (grafy plnenia plánu a bolesti) a Nastaveniami, kde si upravíte dni cvičenia a pripomienky.",
  },
  {
    sel: null, icon: "check", navigate: "home",
    title: "Všetko pripravené",
    body: "To je všetko! Začnite svojím prvým cvikom.",
    last: true,
  },
];

function getScrollParent(el) {
  let n = el && el.parentElement;
  while (n) {
    const oy = getComputedStyle(n).overflowY;
    if ((oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight) return n;
    n = n.parentElement;
  }
  return null;
}

function Tutorial({ open, onClose, onOpenEx, onCloseEx }) {
  const [i, setI] = React.useState(0);
  const [rect, setRect] = React.useState(null);
  const overlayRef = React.useRef(null);
  const rafRef = React.useRef(0);

  const step = TOUR_STEPS[i];

  React.useEffect(() => { if (open) setI(0); }, [open]);

  // Drive navigation when step changes
  React.useEffect(() => {
    if (!open) return;
    if (step.navigate === "exercise") { onOpenEx && onOpenEx(); }
    else { onCloseEx && onCloseEx(); }
  }, [i, open]);

  // Measure the current target
  React.useLayoutEffect(() => {
    if (!open) return;
    let cancelled = false;

    const measure = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      if (!step.sel) { setRect(null); return; }
      const target = document.querySelector(`[data-tour="${step.sel}"]`);
      if (!target) { setRect(null); return; }
      const o = overlay.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      if (cancelled) return;
      setRect({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height });
    };

    // Scroll target into view
    if (step.sel) {
      const target = document.querySelector(`[data-tour="${step.sel}"]`);
      if (target) {
        const sc = getScrollParent(target);
        if (sc) {
          const sr = sc.getBoundingClientRect();
          const tr = target.getBoundingClientRect();
          const desired = sr.top + 100;
          sc.scrollTop += (tr.top - desired);
        }
      }
    }

    rafRef.current = requestAnimationFrame(() => requestAnimationFrame(measure));
    const t = setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    return () => { cancelled = true; cancelAnimationFrame(rafRef.current); clearTimeout(t); window.removeEventListener("resize", measure); };
  }, [open, i, step.sel]);

  if (!open) return null;

  const next = () => { if (step.last) finish(); else setI((v) => Math.min(v + 1, TOUR_STEPS.length - 1)); };
  const back = () => setI((v) => Math.max(v - 1, 0));
  const finish = () => {
    try { localStorage.setItem(TOUR_FLAG, "1"); } catch (e) {}
    onCloseEx && onCloseEx();
    onClose && onClose();
  };

  const PAD = 8;
  const ring = rect && {
    left: rect.x - PAD, top: rect.y - PAD,
    width: rect.w + PAD * 2, height: rect.h + PAD * 2,
  };

  const CARD_W = 304, MARGIN = 16, SCREEN_H = 874, SCREEN_W = 402;
  let cardStyle;
  if (!rect) {
    cardStyle = { left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: CARD_W };
  } else {
    const place = step.place || "below";
    const cx = rect.x + rect.w / 2;
    const left = Math.min(Math.max(cx - CARD_W / 2, MARGIN), SCREEN_W - CARD_W - MARGIN);
    const top = (place === "below" || place === "left") ? ring.top + ring.height + 14 : undefined;
    const bottom = place === "above" ? SCREEN_H - ring.top + 14 : undefined;
    cardStyle = { left, top, bottom, width: CARD_W };
  }

  return (
    <div ref={overlayRef} style={{ position: "absolute", inset: 0, zIndex: 70, overflow: "hidden",
      fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", inset: 0,
        background: rect ? "transparent" : "rgba(11,17,36,0.66)" }} />

      {ring && (
        <div style={{ position: "absolute", ...ring, borderRadius: 18,
          boxShadow: "0 0 0 3px rgba(255,255,255,0.92), 0 0 0 9999px rgba(11,17,36,0.66)",
          transition: "left .3s ease, top .3s ease, width .3s ease, height .3s ease",
          pointerEvents: "none" }} />
      )}

      <div style={{ position: "absolute", ...cardStyle, background: "#fff", borderRadius: 20,
        padding: "18px 18px 16px", boxShadow: "0 18px 50px rgba(11,17,36,0.32)",
        transition: "left .3s ease, top .3s ease, bottom .3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: "var(--accent-wash)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={step.icon} size={20} stroke="var(--accent)" />
          </div>
          <div style={{ fontSize: 17.5, fontWeight: 740, color: "var(--ink)", letterSpacing: -0.3 }}>{step.title}</div>
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--muted)", textWrap: "pretty" }}>{step.body}</div>

        <div style={{ display: "flex", gap: 6, marginTop: 16, marginBottom: 14 }}>
          {TOUR_STEPS.map((_, n) => (
            <span key={n} style={{ height: 6, borderRadius: 3, flex: n === i ? "0 0 20px" : "0 0 6px",
              background: n === i ? "var(--accent)" : "var(--line)", transition: "all .25s ease" }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={finish} style={{ border: "none", background: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "var(--muted)", padding: "8px 4px" }}>
            Preskočiť
          </button>
          <div style={{ flex: 1 }} />
          {i > 0 && (
            <button onClick={back} style={{ border: "1px solid var(--line)", background: "#fff", cursor: "pointer",
              fontFamily: "inherit", fontSize: 14.5, fontWeight: 620, color: "var(--ink)", borderRadius: 12, padding: "9px 16px" }}>
              Späť
            </button>
          )}
          <button onClick={next} style={{ border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 14.5, fontWeight: 660, color: "#fff", background: "var(--accent)", borderRadius: 12,
            padding: "9px 18px", display: "inline-flex", alignItems: "center", gap: 7 }}>
            {step.last ? "Začať" : "Ďalej"}
            {!step.last && <Icon name="chevR" size={16} stroke="#fff" sw={2.4} />}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Tutorial, TOUR_FLAG });
