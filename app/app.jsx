// app/app.jsx — root: routing, state, theme tokens, tweaks
// Exports to window: FyzioApp

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  primaryColor: "#455A74",
  showLogin: true,
  loginMood: "deep",
  homeLayout: "karty",
  density: "comfy",
  daySelector: "minimal",
  chartStyle: "soft",
  imagery: "striped",
  painStyle: "čísla",
}; /*EDITMODE-END*/

function FyzioApp() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState(
    tw.showLogin === false ? "programs" : "login",
  ); // login | programs | phase | app
  const [tab, setTab] = React.useState("home");
  const [program, setProgram] = React.useState(FYZIO.programs[0]);
  const [showPrograms, setShowPrograms] = React.useState(false);
  const [phaseFrom, setPhaseFrom] = React.useState("programs"); // where the phase intro was opened from
  const [startedPrograms, setStartedPrograms] = React.useState(() => {
    // programs already in progress (or completed) never re-prompt the start/setup flow
    const o = {};
    FYZIO.programs.forEach((p) => {
      if (p.progress > 0) o[p.id] = true;
    });
    return o;
  });

  // keep route in sync if the login tweak is toggled while on the auth screen
  React.useEffect(() => {
    if (tw.showLogin === false && route === "login") setRoute("programs");
    if (tw.showLogin !== false && route === "programs") setRoute("login");
  }, [tw.showLogin]);
  const [selectedDay, setSelectedDay] = React.useState("d08");
  const [series, setSeries] = React.useState({ e1: 2 }); // id -> completed series count
  const [exId, setExId] = React.useState(null);
  const [pain, setPain] = React.useState(null);
  const [painSaved, setPainSaved] = React.useState(false);
  const [showPain, setShowPain] = React.useState(false);
  const [showAssessment, setShowAssessment] = React.useState(false);
  const [showCheckIn, setShowCheckIn] = React.useState(false);
  const checkInShownRef = React.useRef(false);
  const [assessDone, setAssessDone] = React.useState(false);
  const [showTour, setShowTour] = React.useState(false);
  const tourSeen = React.useRef(false);

  // First-run coach-marks: fire once when a new patient first lands on Home
  React.useEffect(() => {
    if (route !== "app" || tab !== "home" || tourSeen.current) return;
    tourSeen.current = true;
    let done = false;
    try {
      done = localStorage.getItem(TOUR_FLAG) === "1";
    } catch (e) {}
    // Intentionally do not auto-open the tour on first visit. The tour
    // can be launched manually via the UI buttons so it doesn't interrupt
    // the user's initial flow.
  }, [route, tab]);
  const replayTour = () => setShowTour(true);

  const tctx = {
    imagery: tw.imagery,
    density: tw.density,
    homeLayout: tw.homeLayout,
    daySelector: tw.daySelector,
    chartStyle: tw.chartStyle,
    loginMood: tw.loginMood,
    painStyle: tw.painStyle,
  };

  const accent = tw.primaryColor || "#455A74";
  const dark = route === "login" && tw.loginMood === "deep";

  const goPrograms = () => {
    setRoute("programs");
  };
  // not-yet-started program → show overview + setup; already-started → straight to home
  const selectProgram = (p) => {
    setProgram(p);
    if (startedPrograms[p.id]) {
      setRoute("app");
      setTab("home");
    } else {
      setPhaseFrom("programs");
      setRoute("phase");
    }
  };
  const pickFromHome = (p) => {
    setProgram(p);
    setShowPrograms(false);
    if (startedPrograms[p.id]) {
      setRoute("app");
      setTab("home");
    } else {
      setPhaseFrom("home");
      setRoute("phase");
    }
  };
  const beginProgram = () => {
    setStartedPrograms((s) => ({ ...s, [program.id]: true }));
    setRoute("app");
    setTab("home");
  };
  const openProgram = (p) => {
    setProgram(p);
    setRoute("app");
    setTab("home");
    setShowPrograms(false);
  };
  const exById = (id) => FYZIO.exercises.find((e) => e.id === id);
  const addSeries = (id) =>
    setSeries((s) => {
      const ex = exById(id);
      if (!ex) return s;
      const cur = s[id] || 0;
      const next = cur >= ex.sets ? 0 : cur + 1; // tap past full = reset (undo)
      return { ...s, [id]: next };
    });
  const markExDone = (id) =>
    setSeries((s) => ({ ...s, [id]: exById(id)?.sets || 1 }));
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
    if (answers.pain != null) {
      setPain(answers.pain);
      setPainSaved(true);
    }
    setShowCheckIn(false);
  };

  const allExDone =
    FYZIO.exercises.length > 0 &&
    FYZIO.exercises.every((e) => (series[e.id] || 0) >= e.sets);

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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px 16px",
          ...themeVars,
        }}
      >
        <div style={themeVars}>
          <IOSDevice dark={dark}>
            {route === "login" ? (
              <LoginScreen onContinue={goPrograms} />
            ) : route === "programs" ? (
              <ProgramsScreen onOpen={selectProgram} />
            ) : route === "phase" ? (
              <PhaseIntro
                program={program}
                onStart={beginProgram}
                onBack={() =>
                  setRoute(phaseFrom === "home" ? "app" : "programs")
                }
              />
            ) : exId ? (
              <ExerciseDetail
                ex={ex}
                done={exDone}
                seriesDone={series[exId] || 0}
                onAddSeries={() => addSeries(exId)}
                onBack={() => setExId(null)}
                hasNext={!!nextEx}
                onNext={() => nextEx && setExId(nextEx.id)}
                hasPrev={!!prevEx}
                onPrev={() => prevEx && setExId(prevEx.id)}
              />
            ) : (
              <div
                data-app-root
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--bg)",
                }}
              >
                <div
                  style={{ height: 50, flexShrink: 0, background: "var(--bg)" }}
                />
                <div
                  key={tab}
                  className="fz-fade"
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {tab === "home" && (
                    <HomeScreen
                      selectedDay={selectedDay}
                      onSelectDay={setSelectedDay}
                      series={series}
                      onAddSeries={addSeries}
                      onOpenEx={openEx}
                      onMarkDone={markExDone}
                      onUndo={unmarkExDone}
                      program={program}
                      onOpenPrograms={() => setShowPrograms(true)}
                      pain={pain}
                      painSaved={painSaved}
                      onPainChange={(v) => {
                        setPain(v);
                        setPainSaved(false);
                      }}
                      onPainSave={() => setPainSaved(true)}
                      assessDone={assessDone}
                      onOpenAssessment={() => setShowAssessment(true)}
                      onOpenPain={() => setShowPain(true)}
                      onOpenCelebrate={() => setShowPain(true)}
                    />
                  )}
                  {tab === "progress" && <ProgressScreen />}
                  {tab === "settings" && (
                    <SettingsScreen
                      onLogout={() => {
                        setRoute(tw.showLogin === false ? "programs" : "login");
                        setShowPain(false);
                      }}
                    />
                  )}
                  {tab === "programs-tab" && null}
                </div>
                <BottomNav tab={tab} onTab={setTab} />
                <Sheet
                  open={showPrograms}
                  onClose={() => setShowPrograms(false)}
                  height="86%"
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 760,
                      color: "var(--ink)",
                      letterSpacing: -0.4,
                      marginBottom: 4,
                    }}
                  >
                    Vaše programy
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "var(--muted)",
                      marginBottom: 18,
                    }}
                  >
                    Prepnite medzi svojimi rehabilitačnými programami.
                  </div>
                  <ProgramList onOpen={pickFromHome} compact />
                </Sheet>
                <Sheet open={showPain} onClose={() => setShowPain(false)}>
                  <div style={{ marginBottom: 18 }}>
                    <div
                      style={{
                        fontSize: 19,
                        fontWeight: 730,
                        color: "var(--ink)",
                        marginBottom: 4,
                      }}
                    >
                      Aká je dnes vaša bolesť?
                    </div>
                    <div
                      style={{
                        fontSize: 13.5,
                        color: "var(--muted)",
                        lineHeight: 1.45,
                      }}
                    >
                      Zaznamenajte silu bolesti pred dnešným cvičením — škála 0
                      (žiadna) až 10 (najsilnejšia).
                    </div>
                  </div>
                  <PainPicker
                    value={pain}
                    onChange={(v) => {
                      setPain(v);
                      setPainSaved(false);
                    }}
                  />
                  <div style={{ marginTop: 20 }}>
                    <PrimaryButton
                      onClick={() => {
                        setPainSaved(true);
                        setShowPain(false);
                      }}
                      disabled={pain == null}
                    >
                      Uložiť
                    </PrimaryButton>
                  </div>
                </Sheet>
              </div>
            )}
            {/* Morning check-in overlay */}
            {route === "app" && showCheckIn && (
              <MorningCheckIn onDone={handleCheckInDone} />
            )}
            {/* Tutorial overlay at device level — persists across home/exercise */}
            {route === "app" && showTour && (
              <Tutorial
                open={showTour}
                onClose={() => setShowTour(false)}
                onOpenEx={() => setExId(FYZIO.exercises[0]?.id)}
                onCloseEx={() => setExId(null)}
              />
            )}
            {showAssessment && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 100,
                  background: "var(--bg)",
                }}
              >
                <Assessment
                  onClose={() => setShowAssessment(false)}
                  onDone={() => {
                    setAssessDone(true);
                    setShowAssessment(false);
                  }}
                />
              </div>
            )}
          </IOSDevice>

          {/* Fixed helper controls outside the device frame */}
          {route === "app" && (
            <div
              style={{
                position: "fixed",
                left: 20,
                bottom: 20,
                zIndex: 250,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <button
                onClick={() => setShowCheckIn(true)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Spustiť ranný check-in
              </button>
              <button
                onClick={() => setShowTour(true)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,.06)",
                  background: "#fff",
                  color: "var(--accent-ink)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Návod pre nových
              </button>
            </div>
          )}
        </div>

        <TweaksPanel>
          <TweakSection label="Pacient" />
          <TweakButton
            label="Zobraziť ranný check-in"
            onClick={() => setShowCheckIn(true)}
          />
          <TweakButton label="Prehrať návod pre nových" onClick={replayTour} />
          <TweakToggle
            label="Prihlasovanie"
            value={tw.showLogin !== false}
            onChange={(v) => setTweak("showLogin", v)}
          />
          <TweakColor
            label="Akcent"
            value={tw.primaryColor}
            options={["#455A74", "#1c3f6e", "#3b6fe0", "#2f5fa6"]}
            onChange={(v) => setTweak("primaryColor", v)}
          />
          <TweakRadio
            label="Prihlásenie"
            value={tw.loginMood}
            options={["deep", "soft", "light"]}
            onChange={(v) => setTweak("loginMood", v)}
          />
          <TweakRadio
            label="Obrázky"
            value={tw.imagery}
            options={["striped", "abstract"]}
            onChange={(v) => setTweak("imagery", v)}
          />
          <TweakSection label="Rozloženie" />
          <TweakRadio
            label="Domov"
            value={tw.homeLayout}
            options={["karty", "fokus", "zoznam"]}
            onChange={(v) => setTweak("homeLayout", v)}
          />
          <TweakRadio
            label="Hustota kariet"
            value={tw.density}
            options={["compact", "regular", "comfy"]}
            onChange={(v) => setTweak("density", v)}
          />
          <TweakRadio
            label="Výber dní"
            value={tw.daySelector}
            options={["pills", "circles", "minimal"]}
            onChange={(v) => setTweak("daySelector", v)}
          />
          <TweakRadio
            label="Grafy"
            value={tw.chartStyle}
            options={["soft", "minimal"]}
            onChange={(v) => setTweak("chartStyle", v)}
          />
        </TweaksPanel>
      </div>
    </TweakCtx.Provider>
  );
}

Object.assign(window, { FyzioApp });
