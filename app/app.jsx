// app/app.jsx — root: routing, state, theme tokens, tweaks
// Exports to window: FyzioApp

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#455A74",
  "showLogin": false,
  "loginMood": "deep",
  "homeLayout": "karty",
  "density": "comfy",
  "daySelector": "minimal",
  "chartStyle": "soft",
  "imagery": "striped",
  "painStyle": "čísla",
  "jedenProgram": false,
  "dennyCheckin": false
}/*EDITMODE-END*/;

// Domov = today's plan when exactly one program is running; the program list
// only appears when the patient has two or more running programs.
const fzEntry = () => FYZIO.runningPrograms().length === 1 ? "app" : "programs";

function FyzioApp() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  FYZIO.demoSingle = tw.jedenProgram === true;
  const [route, setRoute] = React.useState(tw.showLogin === false ? fzEntry() : "auth"); // auth | programs | phase | app
  const [tab, setTab] = React.useState("home");
  const [program, setProgram] = React.useState(FYZIO.runningPrograms()[0] || FYZIO.programs[0]);
  const [showPrograms, setShowPrograms] = React.useState(false);
  const [settingsSheet, setSettingsSheet] = React.useState(false);
  const [phaseFrom, setPhaseFrom] = React.useState("programs"); // where the phase intro was opened from
  const [startedPrograms, setStartedPrograms] = React.useState(() => {
    // programs already in progress (or completed) never re-prompt the start/setup flow
    const o = {};
    FYZIO.programs.forEach((p) => { if (p.progress > 0) o[p.id] = true; });
    return o;
  });

  // keep route in sync if the login tweak is toggled while on the auth screen
  React.useEffect(() => {
    if (tw.showLogin === false && route === "auth") setRoute(fzEntry());
    if (tw.showLogin !== false && route === "programs") setRoute("auth");
  }, [tw.showLogin]);

  // one running program → straight into its plan; two or more → the list
  React.useEffect(() => {
    const running = FYZIO.runningPrograms();
    if (route !== "app" && route !== "programs") return;
    if (running.length === 1) { setProgram(running[0]); setRoute("app"); setTab("home"); }
    else if (route === "app" && !running.some((p) => p.id === program.id)) setRoute("programs");
  }, [tw.jedenProgram]);
  const [selectedDay, setSelectedDay] = React.useState(FYZIO.todayKey());
  const [series, setSeries] = React.useState({ e1: 2 }); // id -> completed series count
  const [exId, setExId] = React.useState(null);
  const [showPain, setShowPain] = React.useState(false);
  const [showAssessment, setShowAssessment] = React.useState(false);
  const [assessResult, setAssessResult] = React.useState(false);
  const [showCheckIn, setShowCheckIn] = React.useState(false);
  const checkInShownRef = React.useRef(false);
  // daily gate: per therapist per day — full sequence once, then pain only per program
  const todayISO = new Date().toISOString().slice(0, 10);
  const [ciDoneByTh, setCiDoneByTh] = React.useState({});

  // pain level + assessment are PER-PROGRAM — keyed by program id, not shared
  const [painByProgram, setPainByProgram] = React.useState({});
  const [painSavedByProgram, setPainSavedByProgram] = React.useState({});
  const [assessDoneByProgram, setAssessDoneByProgram] = React.useState({});
  const pid = program.id;
  const pain = painByProgram[pid] ?? null;
  const painSaved = !!painSavedByProgram[pid];
  const assessDone = !!assessDoneByProgram[pid];
  const setPain = (v) => setPainByProgram((m) => ({ ...m, [pid]: v }));
  const setPainSaved = (b) => setPainSavedByProgram((m) => ({ ...m, [pid]: b }));
  const setAssessDone = (b) => setAssessDoneByProgram((m) => ({ ...m, [pid]: b }));
  const [showTour, setShowTour] = React.useState(false);
  const [authStart, setAuthStart] = React.useState("welcome");
  const tourSeen = React.useRef(false);

  // First-run coach-marks: fire once when a new patient first lands on Home
  React.useEffect(() => {
    if (route !== "app" || tab !== "home" || tourSeen.current) return;
    tourSeen.current = true;
    let done = false;
    try { done = localStorage.getItem(TOUR_FLAG) === "1"; } catch (e) {}
    if (!done) {
      const id = setTimeout(() => setShowTour(true), 480);
      return () => clearTimeout(id);
    }
  }, [route, tab]);
  const replayTour = () => setShowTour(true);

  // therapist preview controls (rendered OUTSIDE the phone frame) — jump into the
  // app first so the overlays have somewhere to mount
  const therapistCheckIn = () => {
    setRoute("app"); setTab("home"); setExId(null);
    setTimeout(() => setShowCheckIn(true), 60);
  };
  const therapistTour = () => {
    setRoute("app"); setTab("home"); setExId(null);
    try { localStorage.removeItem(TOUR_FLAG); } catch (e) {}
    setTimeout(() => setShowTour(true), 120);
  };
  const therapistAuth = () => { setExId(null); setRoute("auth"); };
  const therapistPlan = () => { setExId(null); setAuthStart("plan"); setRoute("auth"); };

  const tctx = {
    imagery: tw.imagery, density: tw.density, homeLayout: tw.homeLayout,
    daySelector: tw.daySelector, chartStyle: tw.chartStyle, loginMood: tw.loginMood,
    painStyle: tw.painStyle,
  };

  const accent = tw.primaryColor || "#455A74";
  const dark = route === "login" && tw.loginMood === "deep";

  const goPrograms = () => { setRoute(fzEntry()); if (FYZIO.runningPrograms().length === 1) { setProgram(FYZIO.runningPrograms()[0]); setTab("home"); } };
  // not-yet-started program → show overview + setup; already-started → straight to home
  const selectProgram = (p) => {
    setProgram(p);
    if (startedPrograms[p.id]) { setRoute("app"); setTab("home"); }
    else { setPhaseFrom("programs"); setRoute("phase"); }
  };
  const pickFromHome = (p) => {
    setProgram(p); setShowPrograms(false);
    if (startedPrograms[p.id]) { setRoute("app"); setTab("home"); }
    else { setPhaseFrom("home"); setRoute("phase"); }
  };
  const beginProgram = () => {
    setStartedPrograms((s) => ({ ...s, [program.id]: true }));
    setRoute("app"); setTab("home");
  };
  const openProgram = (p) => { setProgram(p); setRoute("app"); setTab("home"); setShowPrograms(false); };
  const exById = (id) => FYZIO.exercises.find((e) => e.id === id);
  const resetSeries = (id) => setSeries((s) => ({ ...s, [id]: 0 }));
  const addSeries = (id) => setSeries((s) => {
    const ex = exById(id); if (!ex) return s;
    const cur = s[id] || 0;
    const next = cur >= ex.sets ? 0 : cur + 1; // tap past full = reset (undo)
    return { ...s, [id]: next };
  });
  const markExDone = (id) => setSeries((s) => ({ ...s, [id]: exById(id)?.sets || 1 }));
  const unmarkExDone = (id) => setSeries((s) => ({ ...s, [id]: 0 }));
  const openEx = (id) => setExId(id);
  const ex = exById(exId);
  const exDone = ex ? (series[exId] || 0) >= ex.sets : false;
  const exIndex = FYZIO.exercises.findIndex((e) => e.id === exId);
  const nextEx = exIndex >= 0 ? FYZIO.exercises[exIndex + 1] : null;
  const prevEx = exIndex > 0 ? FYZIO.exercises[exIndex - 1] : null;

  // Check-in — opened manually via the tweak button (no auto-start)
  // (kept handler below for when it's triggered)

  const handleCheckInDone = (answers) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem(CI_DATE_KEY, today);
      localStorage.setItem(CI_ANSWERS_KEY, JSON.stringify(answers));
    } catch (e) {}
    setShowCheckIn(false);
  };

  const allExDone = FYZIO.exercises.length > 0 && FYZIO.exercises.every((e) => (series[e.id] || 0) >= e.sets);

  // gate before the daily plan
  const gateTh = FYZIO.therapists.find((x) => x.id === program.therapistId);
  const ciKey = `${program.therapistId}|${todayISO}`;
  const gateMode = !ciDoneByTh[ciKey] ? "full" : !painSavedByProgram[pid] ? "pain" : null;
  const showGate = tw.dennyCheckin === true && route === "app" && tab === "home" && !exId && !!gateMode && !showAssessment;
  const finishGate = (a) => {
    if (a && a.pain != null) setPain(a.pain);
    setPainSaved(true);
    setCiDoneByTh((m) => ({ ...m, [ciKey]: true }));
  };

  const themeVars = {
    "--accent": accent,
    "--accent-light": `color-mix(in oklab, ${accent}, white 24%)`,
    "--accent-ink": `color-mix(in oklab, ${accent}, #0c1228 30%)`,
    "--accent-wash": `color-mix(in srgb, ${accent} 9%, white)`,
    "--accent-wash2": `color-mix(in srgb, ${accent} 15%, white)`,
    "--accent-soft": `color-mix(in srgb, ${accent} 20%, white)`,
    "--accent-soft2": `color-mix(in srgb, ${accent} 12%, white)`,
    "--accent-shadow": `color-mix(in srgb, ${accent} 18%, transparent)`,
    "--accent-disabled": `color-mix(in srgb, ${accent} 42%, white)`,
    "--accent-ink-bg": `color-mix(in oklab, ${accent} 36%, #141b34)`,
  };

  return (
    <TweakCtx.Provider value={tctx}>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "28px 16px", ...themeVars }}>

        {/* Therapist preview controls — live in the space around the phone, not on the screen */}
        <div style={{ position: "fixed", top: 140, left: 40, zIndex: 5, width: 232,
          background: "#fff", borderRadius: 18, border: "1px solid #e7eaf0",
          boxShadow: "0 12px 34px rgba(20,28,55,0.12)", padding: 16,
          fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
            color: "#8b91a7", marginBottom: 13 }}>Funkcie</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <button onClick={therapistCheckIn} style={{ display: "flex", alignItems: "center", gap: 9,
              width: "100%", border: "none", borderRadius: 12, padding: "11px 13px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 650, color: "#fff", background: accent }}>
              <Icon name="activity" size={17} stroke="#fff" /> Spustiť check-in
            </button>
            <button onClick={() => { setAssessResult(true); setShowAssessment(true); }} style={{ display: "flex", alignItems: "center", gap: 9,
              width: "100%", border: "1px solid #e7eaf0", borderRadius: 12, padding: "11px 13px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 650, color: "#33455c", background: "#fff" }}>
              <Icon name="clipboard" size={17} stroke={accent} /> Výsledok dotazníka
            </button>
            <button onClick={therapistTour} style={{ display: "flex", alignItems: "center", gap: 9,
              width: "100%", border: "1px solid #e7eaf0", borderRadius: 12, padding: "11px 13px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 650, color: "#33455c", background: "#fff" }}>
              <Icon name="play" size={17} stroke={accent} /> Návod pre začiatočníkov
            </button>
            <button onClick={therapistAuth} style={{ display: "flex", alignItems: "center", gap: 9,
              width: "100%", border: "1px solid #e7eaf0", borderRadius: 12, padding: "11px 13px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 650, color: "#33455c", background: "#fff" }}>
              <Icon name="user" size={17} stroke={accent} /> Spustiť prihlásenie
            </button>
            <button onClick={therapistPlan} style={{ display: "flex", alignItems: "center", gap: 9,
              width: "100%", border: "none", borderRadius: 12, padding: "11px 13px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13.5, fontWeight: 650, color: "#fff", background: accent }}>
              <Icon name="spark" size={17} stroke="#fff" /> Zobraziť plány predplatného
            </button>
          </div>
        </div>

        <div style={themeVars}>
          <IOSDevice dark={dark}>
            {route === "auth" ? (
              <AuthFlow onLogin={goPrograms} start={authStart}
                onEnter={() => { setProgram(FYZIO.runningPrograms()[0] || FYZIO.programs[0]); setPhaseFrom("programs"); setRoute("phase"); }} />
            ) : route === "programs" ? (
              <ProgramsScreen onOpen={selectProgram}
                onTab={(t) => { if (t !== "home") { setRoute("app"); setTab(t); } }} />
            ) : route === "phase" ? (
              <PhaseIntro program={program}
                onStart={beginProgram}
                onBack={() => setRoute(phaseFrom === "home" ? "app" : "programs")} />
            ) : exId ? (
              <ExerciseDetail ex={ex} done={exDone}
                seriesDone={series[exId] || 0} onAddSeries={() => addSeries(exId)} onReset={() => resetSeries(exId)}
                onBack={() => setExId(null)}
                hasNext={!!nextEx} onNext={() => nextEx && setExId(nextEx.id)}
                hasPrev={!!prevEx} onPrev={() => prevEx && setExId(prevEx.id)} />
            ) : (
              <div data-app-root style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
                <div style={{ height: 50, flexShrink: 0, background: "var(--bg)" }} />
                <div key={tab} className="fz-fade" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
                  {tab === "home" && (
                    <HomeScreen selectedDay={selectedDay} onSelectDay={setSelectedDay}
                      series={series} onAddSeries={addSeries} onOpenEx={openEx}
                      onMarkDone={markExDone} onUndo={unmarkExDone}
                      program={program} onOpenPrograms={() => setShowPrograms(true)}
                      pain={pain} painSaved={painSaved}
                      onPainChange={(v) => { setPain(v); setPainSaved(false); }}
                      onPainSave={() => setPainSaved(true)}
                      assessDone={assessDone} onOpenAssessment={() => setShowAssessment(true)}
                      onOpenPain={() => setShowPain(true)}
                      onOpenCelebrate={() => setShowPain(true)} />
                  )}
                  {tab === "progress" && <ProgressScreen />}
                  {tab === "settings" && <SettingsScreen onSheet={setSettingsSheet}
                    onLogout={() => { setRoute(tw.showLogin === false ? "programs" : "auth"); setShowPain(false); }} />}
                  {tab === "programs-tab" && null}
                </div>
                {!settingsSheet && <BottomNav tab={tab} onTab={setTab} />}
                <Sheet open={showPrograms} onClose={() => setShowPrograms(false)} height="86%"
                  header={
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 760, color: "var(--ink)", letterSpacing: -0.4 }}>Vaše programy</div>
                    <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 3 }}>Prepnite medzi svojimi rehabilitačnými programami.</div>
                  </div>}>
                  <ProgramList onOpen={pickFromHome} currentId={program.id} compact />
                </Sheet>
              </div>
            )}
            {/* Daily gate: check-in → pain → therapist's own questions */}
            {showGate &&
            <MorningCheckIn key={`${pid}-${gateMode}`} therapist={gateTh} mode={gateMode}
              onDone={finishGate} />}
            {/* Morning check-in overlay (preview button) */}
            {route === "app" && showCheckIn &&
            <MorningCheckIn therapist={gateTh} onDone={handleCheckInDone} />}
            {/* Tutorial overlay at device level — persists across home/exercise */}
            {route === "app" && showTour && (
              <Tutorial open={showTour} onClose={() => setShowTour(false)}
                onOpenEx={() => setExId(FYZIO.exercises[0]?.id)}
                onCloseEx={() => setExId(null)} />
            )}
            {showAssessment && (
              <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "var(--bg)" }}>
                <Assessment key={assessResult ? "result" : "quiz"} showResult={assessResult}
                  onClose={() => { setShowAssessment(false); setAssessResult(false); }}
                  onDone={() => { setAssessDone(true); setShowAssessment(false); setAssessResult(false); }} />
              </div>
            )}
            {route === "app" && showPain && (
              <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "var(--bg)" }}>
                <PainScreen value={pain}
                  onChange={(v) => { setPain(v); setPainSaved(false); }}
                  onClose={() => setShowPain(false)}
                  onSave={() => { setPainSaved(true); setShowPain(false); }} />
              </div>
            )}
          </IOSDevice>
        </div>

        <TweaksPanel>
          <TweakSection label="Pacient" />
          <TweakButton label="Zobraziť check-in" onClick={() => setShowCheckIn(true)} />
          <TweakButton label="Výsledok dotazníka" onClick={() => { setAssessResult(true); setShowAssessment(true); }} />
          <TweakButton label="Prehrať návod pre nových" onClick={replayTour} />
          <TweakToggle label="Prihlasovanie" value={tw.showLogin !== false}
            onChange={(v) => setTweak("showLogin", v)} />
          <TweakToggle label="Jeden program" value={tw.jedenProgram === true}
            onChange={(v) => setTweak("jedenProgram", v)} />
          <TweakToggle label="Denný check-in pred plánom" value={tw.dennyCheckin === true}
            onChange={(v) => setTweak("dennyCheckin", v)} />
          <TweakColor label="Akcent" value={tw.primaryColor}
            options={["#455A74", "#2563B8", "#1E4F94", "#15396B"]}
            onChange={(v) => setTweak("primaryColor", v)} />
          <TweakRadio label="Prihlásenie" value={tw.loginMood} options={["deep", "soft", "light"]}
            onChange={(v) => setTweak("loginMood", v)} />
          <TweakRadio label="Obrázky" value={tw.imagery} options={["striped", "abstract"]}
            onChange={(v) => setTweak("imagery", v)} />
          <TweakSection label="Rozloženie" />
          <TweakRadio label="Domov" value={tw.homeLayout} options={["karty", "fokus", "zoznam"]}
            onChange={(v) => setTweak("homeLayout", v)} />
          <TweakRadio label="Hustota kariet" value={tw.density} options={["compact", "regular", "comfy"]}
            onChange={(v) => setTweak("density", v)} />
          <TweakRadio label="Výber dní" value={tw.daySelector} options={["pills", "circles", "minimal"]}
            onChange={(v) => setTweak("daySelector", v)} />
          <TweakRadio label="Grafy" value={tw.chartStyle} options={["soft", "minimal"]}
            onChange={(v) => setTweak("chartStyle", v)} />
        </TweaksPanel>
      </div>
    </TweakCtx.Provider>
  );
}

Object.assign(window, { FyzioApp });
