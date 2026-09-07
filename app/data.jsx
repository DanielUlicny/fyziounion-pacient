// app/data.jsx — Slovak content model + icon set for fyzio
// FZ_PLAN_DOW: the one weekday set the plan runs on (0=Sun … 6=Sat).
// Both the adherence/pain history and the progress grid read it, so they can never disagree.
const FZ_PLAN_DOW = [1, 2, 4, 5]; // Po, Ut, Št, Pi
// Exports to window: FYZIO, Icon

// Resolve media through the standalone bundler's inlined blobs when present,
// otherwise fall back to the relative path (live/preview).
const RES = (id, path) => (window.__resources && window.__resources[id]) || path;

// ── Program + exercises ──────────────────────────────────────
const FYZIO = {
  brand: "fyzio",
  tagline: "Vaša rehabilitácia, krok za krokom.",
  patient: { name: "Lucia Kováčová", initials: "LK" },
  therapist: {
    name: "Mgr. Peter Novák",
    clinic: "Fyzio Centrum Bratislava",
    initials: "PN"
  },
  therapists: [
  { id: "t1", name: "Mgr. Peter Novák", clinic: "Fyzio Centrum Bratislava", initials: "PN",
    email: "peter.novak@fyziocentrum.sk", phone: "+421 903 112 244",
    checkin: ["sleep", "stress", "meds"],
    ownQuestions: [
    { id: "t1q1", q: "Cítili ste dnes trňutie do ruky?", opts: ["Nie", "Občas", "Často"] }] },
  { id: "t2", name: "Mgr. Eva Horváthová", clinic: "Rehab Klinika Košice", initials: "EH",
    email: "eva.horvathova@rehabklinika.sk", phone: "+421 905 778 991",
    checkin: ["sleep", "food", "alcohol"],
    ownQuestions: [
    { id: "t2q1", q: "Zvládli ste chôdzu po schodoch?", opts: ["Bez bolesťí", "S námahou", "Nezvládol/la"] }] },
  { id: "t3", name: "Mgr. Jana Bieliková", clinic: "Fyzio Štúdio Nitra", initials: "JB",
    email: "jana.bielikova@fyziostudio.sk", phone: "+421 907 445 120",
    checkin: ["sleep"], ownQuestions: [] }],

  program: {
    name: "Bolesť krku a ramien",
    phase: "Fáza 1",
    weekLabel: "Fáza 1 · 3. týždeň z 8",
    progress: 0.36,
    minDays: 4
  },
  // state: waiting | running | paused | done
  // today: { kind: "exercise" | "rest" | "done", count } — only for running programs
  programs: [
  { id: "p1", name: "Bolesť krku a ramien", therapistId: "t1", phase: "Fáza 1", phaseNum: 1, phaseTotal: 3,
    phaseName: "Uvoľnenie a mobilita", week: "3. týždeň z 8", progress: 0.36, exCount: 4,
    mins: 12, minDays: 4, active: true, state: "running", today: { kind: "exercise", count: 4 }, isNew: true, startedDaysAgo: 16,
    activeDays: { Po: true, Ut: true, St: false, "Št": true, Pi: true, So: false, Ne: false },
    weeksTotal: 11, equipment: ["Odporová guma", "Lavička"],
    phaseGoal: "V tejto fáze sa sústredíme na uvoľnenie a obnovenie rozsahu pohybu krku a ramien. Cviky sú mierne a robte ich pomaly, bez švihu.",
    phases: [
    { name: "Uvoľnenie a mobilita", weeks: "1.–3. týždeň", dur: "7 dní" },
    { name: "Posilnenie", weeks: "4.–6. týždeň", dur: "4 týždne" },
    { name: "Návrat k záťaži", weeks: "7.–8. týždeň", dur: "6 týždňov" }]
  },
  { id: "p6", name: "Posilnenie stredu tela", therapistId: "t1", phase: "Dokončené", phaseNum: 3, phaseTotal: 3,
    phaseName: "Návrat k záťaži", week: "10 týždňov", progress: 1, exCount: 5,
    mins: 14, minDays: 3, active: false, state: "done", endDate: "3. 4. 2026", isNew: false,
    weeksTotal: 10, equipment: ["Podložka", "Odporová guma"],
    phaseGoal: "Posilňujeme hlboký stabilizačný systém. Cviky robte pomaly a s dôrazom na dýchanie.",
    phases: [
    { name: "Aktivácia", weeks: "1.–4. týždeň", dur: "4 týždne" },
    { name: "Posilnenie", weeks: "5.–8. týždeň", dur: "4 týždne" },
    { name: "Návrat k záťaži", weeks: "9.–10. týždeň", dur: "2 týždne" }]
  },
  { id: "p4", name: "Rehabilitácia kolena po artroskopii", therapistId: "t2", phase: "Fáza 1", phaseNum: 1, phaseTotal: 3,
    phaseName: "Rozsah pohybu", week: "2. týždeň z 12", progress: 0.14, exCount: 4,
    mins: 10, minDays: 4, active: true, state: "running", today: { kind: "rest" }, isNew: false, startedDaysAgo: 9,
    activeDays: { Po: true, Ut: false, St: true, "Št": false, Pi: true, So: true, Ne: false },
    weeksTotal: 12, equipment: ["Podložka", "Uterák"],
    phaseGoal: "Obnovujeme rozsah pohybu kolena. Nikdy necvičte cez bolesť.",
    phases: [
    { name: "Rozsah pohybu", weeks: "1.–4. týždeň", dur: "4 týždne" },
    { name: "Sila", weeks: "5.–9. týždeň", dur: "5 týždňov" },
    { name: "Návrat k športu", weeks: "10.–12. týždeň", dur: "3 týždne" }]
  },
  { id: "p5", name: "Bolesť dolnej časti chrbta", therapistId: "t2", phase: "Fáza 2", phaseNum: 2, phaseTotal: 3,
    phaseName: "Stabilizácia", week: "4. týždeň z 9", progress: 0.28, exCount: 5,
    mins: 13, minDays: 4, active: false, state: "paused", isNew: false, startedDaysAgo: 22,
    activeDays: { Po: false, Ut: true, St: true, "Št": true, Pi: false, So: false, Ne: true },
    weeksTotal: 9, equipment: ["Podložka"],
    phaseGoal: "Program je dočasne pozastavený vaším fyzioterapeutom.",
    phases: [
    { name: "Uvoľnenie", weeks: "1.–3. týždeň", dur: "3 týždne" },
    { name: "Stabilizácia", weeks: "4.–6. týždeň", dur: "3 týždne" },
    { name: "Záťaž", weeks: "7.–9. týždeň", dur: "3 týždne" }]
  },
  { id: "p2", name: "Mobilita ramena", therapistId: "t2", phase: "Dokončené", phaseNum: 3, phaseTotal: 3,
    phaseName: "Návrat k záťaži", week: "6 týždňov", progress: 1, exCount: 5,
    mins: 15, minDays: 3, active: false, state: "done", endDate: "12. 5. 2026", isNew: false,
    weeksTotal: 6, equipment: ["Odporová guma", "Činka 2 kg"],
    phaseGoal: "Program je dokončený. Skvelá práca!",
    phases: [
    { name: "Mobilizácia", weeks: "1.–2. týždeň", dur: "2 týždne" },
    { name: "Stabilita", weeks: "3.–4. týždeň", dur: "2 týždne" },
    { name: "Návrat k záťaži", weeks: "5.–6. týždeň", dur: "2 týždne" }]
  },
  { id: "p3", name: "Stabilizácia bedrového kĺbu", therapistId: "t1", phase: "Fáza 1", phaseNum: 1, phaseTotal: 3,
    phaseName: "Aktivácia", week: "1. týždeň z 8", progress: 0, exCount: 4,
    mins: 11, minDays: 3, active: false, state: "waiting", isNew: true, daysFixed: false,
    activeDays: { Po: true, Ut: false, St: true, "Št": false, Pi: true, So: false, Ne: false },
    weeksTotal: 8, equipment: ["Odporová guma", "Lavička"],
    phaseGoal: "Začíname aktiváciou sedacích svalov. Cviky robte pomaly a bez švihu.",
    phases: [
    { name: "Aktivácia", weeks: "1.–3. týždeň", dur: "3 týždne" },
    { name: "Stabilita", weeks: "4.–6. týždeň", dur: "3 týždne" },
    { name: "Záťaž", weeks: "7.–8. týždeň", dur: "2 týždne" }]
  }],

  // weekday selector — generated per real calendar week (Monday first)
  days: [],

  exercises: [
  {
    id: "e1",
    name: "Aktívna flexia a extenzia krku",
    video: RES("flexExtVid", "uploads/Aktívna-Flexia-A-Extenzia-Krku-Bez-Variácie.mp4"),
    hint: "Pomaly predkláňajte a zakláňajte hlavu.",
    note: "Lucia, seďte vzpriamene a pohyb veďte plynulo. Otáčajte len po hranicu, kde necítite bolesť.",
    sets: 2,
    kind: "time",
    hold: 20,
    rest: 20,
    mins: 2
  },
  {
    id: "e2",
    name: "Aktívna bočná flexia krku",
    video: RES("bocnaVid", "uploads/Aktívna-Bočná-Flexia-Krku-Bez-Variácie.mp4"),
    hint: "Nakláňajte ucho k ramenu, striedavo na obe strany.",
    sets: 2,
    kind: "time",
    hold: 20,
    rest: 20,
    mins: 2
  },
  {
    id: "e3",
    name: "Aktívna flexia a extenzia krku",
    variation: "S oporou o stôl",
    video: RES("oporaVid", "uploads/Aktívna-Flexia-A-Extenzia-Krku-S-Oporou-O-Stôl.mp4"),
    hint: "Predlaktia oprite o stôl a pohyb veďte plynulo.",
    note: "Pohyb veďte kontrolovane, na konci rozsahu krátko podržte. Neprepínajte záklon.",
    sets: 3,
    kind: "reps",
    reps: 12,
    rest: 30,
    mins: 3
  },
  {
    id: "e4",
    name: "Aktívna flexia a extenzia krku",
    variation: "Štvornožka",
    video: RES("stvorVid", "uploads/Aktívna-Flexia-A-Extenzia-Krku-Štvornožka.mp4"),
    hint: "V pozícii na štyroch pomaly predkláňajte a zakláňajte hlavu.",
    sets: 2,
    kind: "reps",
    reps: 10,
    rest: 20,
    mins: 3
  }],

  // progress
  adherence: [
  { d: "Po", v: 1 }, { d: "Ut", v: 1 }, { d: "St", v: 0, rest: true },
  { d: "Št", v: 1 }, { d: "Pi", v: 1 }, { d: "So", v: 0, rest: true }, { d: "Ne", v: 0, rest: true }],

  painTrend: [6, 6, 5, 5, 4, 3, 3, 2, 2],
  painLabels: ["", "", "", "", "", "", "", "", "Dnes"],
  adherenceHistory: (() => {
    const today = new Date(2026, 5, 9);
    const out = [];
    const trainDays = FZ_PLAN_DOW;
    for (let i = 187; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      const isTrain = trainDays.includes(dow);
      const prog = (187 - i) / 187;
      const compliance = 0.55 + prog * 0.35; // improves over time
      const total = 4;
      // repeating pattern over training days: full, full, partial, full, missed, full, partial
      const tIdx = out.filter((x) => x.isTrain).length;
      const pat = [total, total, 2, total, 0, total, 3];
      const doneEx = !isTrain ? 0 : pat[tIdx % pat.length];
      out.push({ v: doneEx > 0 ? 1 : 0, doneEx, totalEx: total, date: d,
        dateStr: `${d.getDate()}.${d.getMonth() + 1}`, isTrain });
    }
    return out;
  })(),
  painHistory: (() => {
    const today = new Date(2026, 5, 9); // June 9, 2026
    const skM = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    const trainDays = FZ_PLAN_DOW;
    const out = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (!trainDays.includes(d.getDay())) continue; // bolesť sa zadáva len v cvičebné dni
      const prog = (89 - i) / 89;
      const base = 8 - prog * 6;
      const noise = Math.sin(i * 1.7) * 1.1 + Math.cos(i * 3.1) * 0.5;
      const pain = Math.max(1, Math.min(10, Math.round(base + noise))); // len celé čísla
      out.push({
        t: d.getTime(),
        dateStr: `${d.getDate()}.${d.getMonth() + 1}`,
        month: d.getMonth() + 1,
        monthLabel: skM[d.getMonth() + 1],
        pain
      });
    }
    return out;
  })(),
  reminderTime: "18:00",
  activeDays: { Po: true, Ut: true, St: false, Št: true, Pi: true, So: false, Ne: false },
  // periodic assessment — TENDINS-A (hodnotenie závažnosti tendinopatie Achillovej šľachy)
  assessment: {
    title: "Závažnosť tendinopatie – Achillova šľacha",
    short: "TENDINS-A",
    dueLabel: "Dnes",
    due: true,
    intervalDays: 14,
    lastDate: "2. jún",
    maxScore: 100,
    intro: "Dotazník posudzuje bolesť a symptómy spojené s Achillovou šľachou. Zhoršujúca činnosť je akákoľvek činnosť, ktorá spôsobuje bolesť alebo symptómy počas jej vykonávania alebo po ňom.",
    // shared activity list for the multi-select questions
    activities: [
    "Pomalá chôdza",
    "Rýchla chôdza",
    "Chôdza hore a dolu schodmi",
    "Pomalý beh (jogging)",
    "Rýchly beh (šprint)",
    "Beh hore a dolu schodmi",
    "Poskakovanie a skákanie",
    "Rýchle zmeny smeru počas behu",
    "Iné"],

    // section labels shown above each question
    sections: {
      unscored: "Nebodovaná sekcia",
      pain: "Bolesť",
      symptoms: "Symptómy",
      fn: "Fyzická funkcia" },

    questions: [
    // ── unscored ──
    { id: "A", section: "unscored", type: "multi", useActivities: true,
      q: "Vyberte všetky činnosti, ktoré zhoršujú vašu bolesť alebo symptómy Achillovej šľachy.",
      help: "Napríklad ak cítite bolesť počas behu, ale nie pri chôdzi, označte beh, nie chôdzu." },
    { id: "B", section: "unscored", type: "multi", useActivities: true,
      q: "Vyberte všetky činnosti, ktoré vykonávate počas bežného dňa.",
      help: "Napríklad ak chodíte pešo alebo pomaly beháte, ale nešprintujete, zvoľte chôdzu alebo pomalý beh." },
    { id: "C", section: "unscored", type: "single",
      q: "Ak vykonávate činnosť, ktorá najviac zhoršuje bolesť Achillovej šľachy, kedy je bolesť najintenzívnejšia?",
      options: [
      { label: "Na začiatku alebo počas zhoršujúcej aktivity" },
      { label: "Do dvoch hodín po skončení činnosti" },
      { label: "Do dvoch až šiestich hodín po skončení činnosti" },
      { label: "Po prebudení nasledujúci deň po zhoršujúcej aktivite" }] },

    { id: "D", section: "unscored", type: "single",
      q: "Kedy je vaša Achillova šľacha najviac stuhnutá/napätá/má obmedzený pohyb po zhoršujúcej činnosti?",
      options: [
      { label: "Na začiatku alebo počas zhoršujúcej aktivity" },
      { label: "Medzi 15–30 minútami" },
      { label: "Do dvoch hodín po skončení činnosti" },
      { label: "Po prebudení nasledujúci deň po zhoršujúcej aktivite" }] },

    { id: "E", section: "unscored", type: "single",
      q: "Ako dlho by ste teraz dokázali vykonávať najviac zhoršujúcu činnosť, kým by ste ju museli ukončiť pre bolesť alebo symptómy?",
      options: [
      { label: "Nemusel/a by som činnosť prerušiť" },
      { label: "Dlhšie než 30 minút" },
      { label: "Kratšie než 15 minút" }] },

    // ── pain (/40) ──
    { id: "Q1", section: "pain", type: "single",
      q: "Ako veľmi ste museli zmeniť úroveň vykonávania zhoršujúcich činností od nástupu bolesti Achillovej šľachy?",
      options: [
      { label: "Vykonávam ich na vyššej úrovni ako pred ťažkosťami", pts: 0 },
      { label: "Vykonávam ich na rovnakej úrovni ako pred ťažkosťami", pts: 0 },
      { label: "Vykonávam ich na nižšej úrovni ako pred ťažkosťami", pts: 10 },
      { label: "Už nie som schopný/á vykonávať žiadnu z týchto aktivít", pts: 20 }] },

    { id: "Q2", section: "pain", type: "single",
      q: "Počas vykonávania zhoršujúcich činností sa bolesť Achillovej šľachy:",
      options: [
      { label: "Zlepší (rozcvičenie)", pts: 0 },
      { label: "Zlepší (rozcvičenie) a následne sa vráti počas aktivity", pts: 3 },
      { label: "Je stále rovnaká", pts: 6 },
      { label: "Zhoršuje sa úmerne s časom vykonávania činnosti", pts: 10 }] },

    { id: "Q3", section: "pain", type: "single",
      q: "Objaví sa bolesť Achillovej šľachy po tom, ako si oddýchnete po zhoršujúcich aktivitách?",
      options: [
      { label: "Nie, po odpočinku necítim žiadnu bolesť", pts: 0 },
      { label: "Áno, trvá menej ako 15 minút", pts: 3 },
      { label: "Áno, trvá 15 až 30 minút", pts: 6 },
      { label: "Áno, trvá viac ako 30 minút", pts: 10 }] },

    // ── symptoms (/30) ──
    { id: "Q4", section: "symptoms", type: "single",
      q: "Pociťujete stuhnutosť/napätie/obmedzenie pohybu v oblasti Achillovej šľachy pri prebudení a vstávaní z postele?",
      options: [{ label: "Áno", pts: 5 }, { label: "Nie", pts: 0 }] },
    { id: "Q5", section: "symptoms", type: "single",
      q: "V priemere za posledný týždeň, ako dlho po prebudení pretrvávala stuhnutosť, napätie alebo obmedzenie pohybu?",
      options: [
      { label: "Menej ako 5 minút", pts: 0 },
      { label: "5–10 minút", pts: 3 },
      { label: "11–20 minút", pts: 6 },
      { label: "Dlhšie ako 20 minút", pts: 10 }] },

    { id: "Q6", section: "symptoms", type: "single",
      q: "Je stuhnutosť po prebudení horšia deň po vykonaní zhoršujúcej činnosti?",
      options: [{ label: "Áno", pts: 5 }, { label: "Nie", pts: 0 }] },
    { id: "Q7", section: "symptoms", type: "single",
      q: "Po dlhšom sedení (dve alebo viac hodín), ako dlho by trvalo, kým by ste pocítili uvoľnenie alebo rozcvičenie Achillovej šľachy?",
      options: [
      { label: "Menej ako 5 minút", pts: 0 },
      { label: "5–10 minút", pts: 3 },
      { label: "11–20 minút", pts: 6 },
      { label: "Dlhšie ako 20 minút", pts: 10 }] },

    // ── physical function (/30) — 0–10 pain scale ──
    { id: "Q8", section: "fn", type: "scale",
      q: "Vo vzpriamenej polohe s vystretým kolenom vykonajte 5 neprerušovaných výponov (postavenie sa na špičku) na bolestivej nohe. Uveďte intenzitu bolesti.",
      help: "0 = žiadna bolesť · 10 = najintenzívnejšia bolesť" },
    { id: "Q9", section: "fn", type: "scale",
      q: "Vo vzpriamenej polohe s vystretými kolenami vykonajte 5 neprerušovaných výskokov na oboch nohách. Uveďte intenzitu bolesti.",
      help: "0 = žiadna bolesť · 10 = najintenzívnejšia bolesť" },
    { id: "Q10", section: "fn", type: "scale",
      q: "Vo vzpriamenej polohe s vystretým kolenom vykonajte 5 neprerušovaných poskokov na bolestivej nohe. Uveďte intenzitu bolesti.",
      help: "0 = žiadna bolesť · 10 = najintenzívnejšia bolesť" }]

  }
};

// ── Calendar week helpers (Monday-first, driven by the real date) ──────
const FZ_DOW = ["Ne", "Po", "Ut", "St", "Št", "Pi", "So"];
const fzKey = (d) => "d" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
const fzMonday = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const off = (x.getDay() + 6) % 7; x.setDate(x.getDate() - off); return x; };
FYZIO.today = () => new Date();
FYZIO.todayKey = () => fzKey(FYZIO.today());
// the seven days of the calendar week that contains today + offset weeks
FYZIO.weekDays = (offset = 0) => {
  const today = FYZIO.today();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const start = fzMonday(today);
  start.setDate(start.getDate() + offset * 7);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dow = FZ_DOW[d.getDay()];
    const train = !!FYZIO.activeDays[dow];
    const t = d.getTime();
    const status = t === t0 ? "today" : !train ? "rest" : t < t0 ? FYZIO.pastStatus(fzKey(d)) : "exercise";
    return { key: fzKey(d), dow, num: d.getDate(), date: d, status, isTraining: train, past: t < t0, future: t > t0 };
  });
};
// a scrollable range of whole weeks (Monday first) around the week of a given day
FYZIO.planDow = FZ_PLAN_DOW;
FYZIO.progActiveDays = (prog) => prog && prog.activeDays ? prog.activeDays : FYZIO.activeDays;
// is today a training day for this program?
FYZIO.isTrainingToday = (prog) => {
  if (!prog || FYZIO.pState(prog) !== "running") return false;
  return !!FYZIO.progActiveDays(prog)[FZ_DOW[FYZIO.today().getDay()]];
};
FYZIO.progStart = (prog) => {
  if (!prog) return null;
  if (prog.startDate) { const p = FYZIO.keyToDate(prog.startDate); if (p) return p; }
  if (prog.startedDaysAgo == null) return null;
  const t = FYZIO.today();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() - prog.startedDaysAgo);
};
FYZIO.dayRange = (centerKey, weeksBack = 3, weeksFwd = 3, prog = null) => {
  const act = FYZIO.progActiveDays(prog);
  const paused = prog ? FYZIO.pState(prog) === "paused" : false;
  const startD = FYZIO.progStart(prog);
  const startT = startD ? startD.getTime() : null;
  const today = FYZIO.today();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const c = FYZIO.keyToDate(centerKey) || new Date(t0);
  const start = fzMonday(c);
  start.setDate(start.getDate() - weeksBack * 7);
  return Array.from({ length: (weeksBack + weeksFwd + 1) * 7 }).map((_, i) => {
    const x = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    x.setDate(x.getDate() + i);
    const dow = FZ_DOW[x.getDay()];
    const t = x.getTime();
    const before = startT != null && t < startT;
    const train = !!act[dow] && !before;
    const status = before ? "notstarted" : t === t0 ? "today" : !train ? "rest" :
    t < t0 ? FYZIO.pastStatus(fzKey(x), prog) : "exercise";
    return { key: fzKey(x), dow, num: x.getDate(), date: x, status, isTraining: train && !paused,
      paused, notStarted: before, past: t < t0, future: t > t0 };
  });
};
// mock adherence per program: the seed shifts so two programs never share a history
FYZIO.pastStatus = (key, prog) => {
  const n = parseInt(String(key).slice(-2), 10) || 0;
  const seed = prog ? (String(prog.id).charCodeAt(1) || 0) % 3 : 0;
  return (n + seed) % 3 === 0 ? "missed" : "done";
};
FYZIO.keyToDate = (key) => {
  const m = /^d(\d{4})(\d{2})(\d{2})$/.exec(key || "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};

// which week (offset from the current one) a given day key belongs to
FYZIO.weekOffsetOf = (key) => {
  for (let o = -8; o <= 8; o++) if (FYZIO.weekDays(o).some((d) => d.key === key)) return o;
  return 0;
};
FYZIO.dayByKey = (key) => { const o = FYZIO.weekOffsetOf(key); return FYZIO.weekDays(o).find((d) => d.key === key); };
FYZIO.days = FYZIO.weekDays(0);

// ── Program state helpers ────────────────────────────────────
// demoSingle = mockup switch: pretend the patient has a single therapist + program
FYZIO.demoSingle = false;
FYZIO.pState = (p) => p.state || (p.progress >= 1 ? "done" : "running");
FYZIO.allPrograms = () => FYZIO.demoSingle ?
FYZIO.programs.filter((p) => p.therapistId === "t1" && p.id === "p1") : FYZIO.programs;
FYZIO.homeTherapists = () => FYZIO.demoSingle ?
FYZIO.therapists.filter((t) => t.id === "t1") : FYZIO.therapists;
// Domov shows only live programs — finished ones live in Pokrok › História
FYZIO.homePrograms = () => FYZIO.allPrograms().filter((p) => FYZIO.pState(p) !== "done");
FYZIO.runningPrograms = () => FYZIO.allPrograms().filter((p) => FYZIO.pState(p) === "running");
FYZIO.donePrograms = () => {
  const ts = (s) => { const m = /(\d+)\.\s*(\d+)\.\s*(\d+)/.exec(s || ""); return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : 0; };
  return FYZIO.allPrograms().filter((p) => FYZIO.pState(p) === "done").
  slice().sort((a, b) => ts(b.endDate) - ts(a.endDate));
};

// ── Icons (simple line set) ──────────────────────────────────
// Phosphor Bold overrides — filled glyphs on a 256 viewBox; `stroke` becomes the fill
const PH_MAP = { home: "house", gear: "gear", chevR: "caretRight", chevL: "caretLeft",
  chevronDown: "caretDown", x: "x", info: "info", spark: "sparkle",
  arrowR: "arrowRight", external: "arrowSquareOut",
  activity: "pulse", clipboard: "clipboardText", award: "medal", shield: "shieldCheck",
  check: "check", checkCircle: "checkCircle", flame: "flame",
  circle: "circle",
  play: "play", pause: "pause", skipForward: "skipForward", timer: "timer",
  sound: "speakerHigh", soundOff: "speakerX",
  expand: "cornersOut", collapse: "cornersIn",
  square: "square", checkSquare: "checkSquare",
  mail: "envelope", phone: "phone", lock: "lock", eye: "eye", eyeOff: "eyeSlash",
  user: "user", at: "at",
  camera: "camera", image: "image",
  bell: "bell", logout: "signOut", question: "question", trash: "trash", linkBreak: "linkBreak",
  trendDown: "trendDown", trendUp: "trendUp" };

function Icon({ name, size = 22, stroke = "currentColor", fill = "none", sw = 1.8, style }) {
  const ph = PH_MAP[name] && window.PH_PATHS && window.PH_PATHS[PH_MAP[name]];
  if (ph) return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill={stroke === "currentColor" ? "currentColor" : stroke} style={style} aria-hidden="true"><path d={ph}></path></svg>
  );
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill, stroke, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round",
    style
  };
  const P = {
    home: <path d="M3 10.5 12 4l9 6.5M5.5 9.5V19a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5" />,
    chart: <g><path d="M5 20V11" /><path d="M12 20V5" /><path d="M19 20v-6" /></g>,
    gear: <g><circle cx="12" cy="12" r="3.2" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.3 2.5h4l.3-2.5a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12Z" /></g>,
    chevL: <path d="M15 5 8 12l7 7" />,
    chevR: <path d="m9 5 7 7-7 7" />,
    plus: <g><path d="M12 6v12" /><path d="M6 12h12" /></g>,
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
    checkCircle: <g><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></g>,
    clock: <g><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></g>,
    timer: <g><circle cx="12" cy="13" r="7.5" /><path d="M12 13V8.5" /><path d="M9.5 2.5h5" /></g>,
    bell: <g><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></g>,
    play: <path d="M8 5.5v13l11-6.5-11-6.5Z" fill={stroke} stroke="none" />,
    pause: <g><rect x="7" y="6" width="3.2" height="12" rx="1" fill={stroke} stroke="none" /><rect x="13.8" y="6" width="3.2" height="12" rx="1" fill={stroke} stroke="none" /></g>,
    sound: <g><path d="M4 9.5v5h3l5 4V5.5l-5 4H4Z" /><path d="M16 9a4 4 0 0 1 0 6" /></g>,
    soundOff: <g><path d="M4 9.5v5h3l5 4V5.5l-5 4H4Z" /><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" /></g>,
    flame: <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.5-4 .2 1 1 1.8 1.8 1.8C11 9.8 10 7 12 3Z" />,
    moon: <path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z" />,
    calendar: <g><rect x="4" y="5.5" width="16" height="15" rx="2.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></g>,
    bolt: <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />,
    user: <g><circle cx="12" cy="8.5" r="3.8" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></g>,
    logout: <g><path d="M14 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8" style={{ stroke: "rgb(69, 90, 116)" }} /><path d="M16 15l3-3-3-3M9 12h10" /></g>,
    info: <g><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.8v.2" /></g>,
    shield: <path d="M12 3.5 19 6v6c0 4.5-3 7-7 8.5C8 19 5 16.5 5 12V6l7-2.5Z" />,
    spark: <path d="M12 4l1.6 4.9L18.5 10l-4.9 1.6L12 16l-1.6-4.4L5.5 10l4.9-1.1L12 4Z" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    mail: <g><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4 7 8 6 8-6" /></g>,
    phone: <path d="M6.5 3.5H9l1.5 4-2 1.5a11 11 0 0 0 4.5 4.5l1.5-2 4 1.5V17a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />,
    lock: <g><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
    eye: <g><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></g>,
    eyeOff: <g><path d="M4 4l16 16" /><path d="M9.5 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.4 3.1M6.2 7.7A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 2.8-.44" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></g>,
    expand: <g><path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" /></g>,
    refresh: <g><path d="M20 11a8 8 0 1 0-.5 4" /><path d="M20 4v5h-5" /></g>,
    x: <path d="M6 6l12 12M18 6L6 18" />,
    clipboard: <g><rect x="5" y="4.5" width="14" height="16" rx="2.5" /><path d="M9 4.5h6v3H9z" /><path d="M8.5 12h7M8.5 16h5" /></g>,
    activity: <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />,
    award: <g><circle cx="12" cy="9" r="5" /><path d="M9 13.5 7.5 21l4.5-2.5L16.5 21 15 13.5" /></g>
  };
  return <svg {...common}>{P[name] || null}</svg>;
}

Object.assign(window, { FYZIO, Icon });