// onb/onb-flow.jsx — FyzioUnion registration + login state machine
// Exports to window: OnboardingFlow

const VALID_CODE = "FYZ7K2";
const PROGRAM_NAME = "Bolesť krku a ramien";
const MIN_DAYS = 3;
// skutočný počet krokov závisí od zvolenej cesty (Google/Apple preskočí e-mail a heslo)
const stepInfo = (provider, name) => {
  const seq = ["code", "signupMethod", ...(provider === "email" ? ["creds"] : []), "name", "dob", "program", "schedule"];
  return { step: seq.indexOf(name) + 1, total: seq.length };
};


// ── Brand lockup ─────────────────────────────────────────────
function Brand({ compact = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: compact ? 42 : 56, height: compact ? 42 : 56, borderRadius: compact ? 14 : 18,
        background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <OIcon name="spark" size={compact ? 24 : 32} stroke="#fff" fill="#fff" />
      </div>
      <span style={{ fontSize: compact ? 26 : 33, fontWeight: 800, color: "var(--ink)", letterSpacing: -1 }}>
        Fyzio<span style={{ color: "var(--accent)" }}>Union</span>
      </span>
    </div>
  );
}

// ── Screen scaffold: header + scroll body + sticky footer ────
function Screen({ children, footer }) {
  return (
    <div className="fz-fade" style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
      {children}
      {footer && (
        <div style={{ flexShrink: 0, padding: "12px 22px 30px" }}>{footer}</div>
      )}
    </div>
  );
}
const Body = ({ children, style }) => (
  <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "10px 22px 8px", ...style }}>
    {children}
  </div>
);
const Title = ({ children, sub, subColor = "var(--muted)" }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ fontSize: 26, fontWeight: 780, color: "var(--ink)", letterSpacing: -0.6, lineHeight: 1.18 }}>{children}</div>
    {sub && <div style={{ fontSize: 14.5, color: subColor, marginTop: 8, lineHeight: 1.5 }}>{sub}</div>}
  </div>
);

// ── Reusable show/hide password field ────────────────────────
function PasswordField({ value, onChange, placeholder = "Vaše heslo" }) {
  const [show, setShow] = React.useState(false);
  return (
    <OField icon="lock" type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder}
      trailing={
        <button onClick={() => setShow((s) => !s)} aria-label="Zobraziť heslo"
          style={{ border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex" }}>
          <OIcon name={show ? "eyeOff" : "eye"} size={19} stroke="var(--faint)" />
        </button>
      } />
  );
}

/* ═══════════════ 1 · WELCOME — two paths ═══════════════ */
function WelcomeScreen({ go }) {
  return (
    <div className="fz-fade" style={{ height: "100%", display: "flex", flexDirection: "column",
      background: "#fff", padding: "0 26px 34px" }}>
      {/* logo + heading block, centered */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Brand />
        <div style={{ fontSize: 27, fontWeight: 800, color: "var(--ink)", letterSpacing: -0.7, marginTop: 34 }}>
          Vitajte vo FyzioUnion
        </div>
        <div style={{ fontSize: 15.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.5, maxWidth: 280 }}>
          Váš rehabilitačný plán, vždy po ruke.
        </div>
      </div>

      {/* dve cesty: nový pacient s kódom · vracajúci sa pacient */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        <NextButton onClick={() => go("code")}>Mám prístupový kód</NextButton>
        <button onClick={() => go("loginMethod")} style={{ border: "none", background: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, color: "var(--accent)", padding: "4px 0" }}>
          Prihlásiť sa
        </button>
      </div>
    </div>
  );
}

/* ═══════════════ LOGIN ═══════════════ */
/* ═══════════════ LOGIN — výber metódy ═══════════════ */
function LoginMethodScreen({ go, setData }) {
  const fail = (p) => { setData({ loginProvider: p }); go("noAccount"); };
  return (
    <Screen footer={
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <ProviderButton variant="filled" onClick={() => go("login")}
          logo={<OIcon name="at" size={20} stroke="#fff" />}>Pokračovať cez e-mail</ProviderButton>
        <ProviderButton logo={<GoogleLogo size={19} />} onClick={() => fail("google")}>Pokračovať cez Google</ProviderButton>
        <ProviderButton logo={<AppleLogo size={20} />} onClick={() => fail("apple")}>Pokračovať cez Apple</ProviderButton>
      </div>
    }>
      <ObHeader onBack={() => go("welcome")} />
      <Body>
        <Title sub="Použite spôsob, ktorým ste si účet vytvorili.">Prihláste sa</Title>
      </Body>
    </Screen>
  );
}

/* ═══════════════ ÚČET SME NENAŠLI ═══════════════ */
function NoAccountScreen({ go, data }) {
  const p = data.loginProvider === "apple" ? "Apple" : "Google";
  return (
    <Screen footer={
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <NextButton onClick={() => go("loginMethod")}>Skúsiť iný spôsob prihlásenia</NextButton>
        <button onClick={() => go("code")} style={{ border: "none", background: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, color: "var(--accent)", padding: "4px 0" }}>
          Zadať prístupový kód
        </button>
      </div>
    }>
      <ObHeader onBack={() => go("loginMethod")} />
      <Body>
        <Title sub={`Účet vytvorený cez ${p} sme nenašli. Ak ste si účet vytvorili iným spôsobom, skúste ho. Nový účet vyžaduje prístupový kód od fyzioterapeuta.`}>Účet sme nenašli</Title>
      </Body>
    </Screen>
  );
}

/* ═══════════════ LOGIN — e-mail a heslo ═══════════════ */
function LoginScreen({ go, data, setData }) {
  const ready = /\S+@\S+\.\S+/.test(data.email) && data.pw.length >= 4;
  return (
    <Screen footer={
      <NextButton disabled={!ready} onClick={() => ready && (window.location.href = "fyzio.html")}>Prihlásiť sa</NextButton>
    }>
      <ObHeader onBack={() => go("loginMethod")} />
      <Body>
        <Title sub="Zadajte e-mail a heslo k svojmu účtu.">Prihláste sa</Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <OField icon="mail" type="email" value={data.email} onChange={(v) => setData({ email: v })} placeholder="vas@email.sk" />
          <PasswordField value={data.pw} onChange={(v) => setData({ pw: v })} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button onClick={() => {}} style={{ border: "none", background: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "var(--accent)" }}>
            Zabudnuté heslo?
          </button>
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 2 · VÝBER METÓDY (až po overení kódu) ═══════════════ */
function DocLink({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ border: "none", background: "none", padding: 0, cursor: "pointer",
      fontFamily: "inherit", fontSize: "inherit", fontWeight: 650, color: "var(--accent)",
      textDecoration: "underline", textUnderlineOffset: 2 }}>{children}</button>
  );
}
function SignupMethodScreen({ go, data, setData, openDoc }) {
  const pick = (p) => { setData({ provider: p }); go(p === "email" ? "creds" : "name"); };
  return (
    <Screen footer={
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <OCheckbox checked={data.marketing} onChange={(v) => setData({ marketing: v })}>
          Chcem dostávať e-maily s novinkami a tipmi na cvičenie (nepovinné).
        </OCheckbox>
        <ProviderButton variant="filled" onClick={() => pick("email")}
          logo={<OIcon name="at" size={20} stroke="#fff" />}>Pokračovať cez e-mail</ProviderButton>
        <ProviderButton logo={<GoogleLogo size={19} />} onClick={() => pick("google")}>Pokračovať cez Google</ProviderButton>
        <ProviderButton logo={<AppleLogo size={20} />} onClick={() => pick("apple")}>Pokračovať cez Apple</ProviderButton>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--muted)", marginTop: 5 }}>
          Pokračovaním súhlasíte s <DocLink onClick={() => openDoc("Podmienky používania")}>Podmienkami používania</DocLink> a <DocLink onClick={() => openDoc("Zásady ochrany osobných údajov")}>Zásadami ochrany osobných údajov</DocLink>.
        </div>
      </div>
    }>
      <ObHeader onBack={() => go("code")} {...stepInfo(data.provider, "signupMethod")} />
      <Body>
        <Title sub="Kód sme overili. Vyberte, ako sa budete prihlasovať.">Vytvorte si účet</Title>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 3 · EMAIL & PASSWORD ═══════════════ */
function CredsScreen({ go, data, setData }) {
  const ready = /\S+@\S+\.\S+/.test(data.email) && data.pw.length >= 8;
  return (
    <Screen footer={<NextButton disabled={!ready} onClick={() => ready && go("name")}>Ďalšie</NextButton>}>
      <ObHeader onBack={() => go("signupMethod")} {...stepInfo("email", "creds")} />
      <Body>
        <Title sub="Tieto údaje použijete pri každom prihlásení.">E-mail a heslo</Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <OLabel>E-mail</OLabel>
            <OField icon="mail" type="email" value={data.email} onChange={(v) => setData({ email: v })} placeholder="vas@email.sk" />
          </div>
          <div>
            <OLabel>Heslo</OLabel>
            <PasswordField value={data.pw} onChange={(v) => setData({ pw: v })} />
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8, fontSize: 12.5,
              color: data.pw.length >= 8 ? "var(--ok-ink)" : "var(--muted)" }}>
              {data.pw.length >= 8 && <OIcon name="checkCircle" size={14} stroke="var(--ok)" />}
              {data.pw.length >= 8 ? "Heslo má dostatočnú dĺžku" : "Heslo musí mať aspoň 8 znakov."}
            </div>
          </div>
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 4 · NAME ═══════════════ */
function NameScreen({ go, data, setData }) {
  const ready = data.first.trim() && data.last.trim();
  return (
    <Screen footer={<NextButton disabled={!ready} onClick={() => ready && go("dob")}>Ďalšie</NextButton>}>
      <ObHeader onBack={() => go(data.provider === "email" ? "creds" : "signupMethod")} {...stepInfo(data.provider, "name")} />
      <Body>
        <Title sub="Aby vás fyzioterapeut vedel identifikovať.">Ako sa voláte?</Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <OLabel>Meno</OLabel>
            <OField icon="user" value={data.first} onChange={(v) => setData({ first: v })} placeholder="Vaše meno" />
          </div>
          <div>
            <OLabel>Priezvisko</OLabel>
            <OField icon="user" value={data.last} onChange={(v) => setData({ last: v })} placeholder="Vaše priezvisko" />
          </div>
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 5 · DATE OF BIRTH ═══════════════ */
function DobScreen({ go, data, setData }) {
  const [focused, setFocused] = React.useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const MINDATE = "1900-01-01";
  const problem = !data.dob ? ""
    : data.dob > today ? "Dátum nemôže byť v budúcnosti."
    : data.dob < MINDATE ? "Zadajte rok medzi 1900 a týmto rokom." : "";
  const ready = !!data.dob && !problem;
  return (
    <Screen footer={<NextButton disabled={!ready} onClick={() => ready && go("program")}>Ďalšie</NextButton>}>
      <ObHeader onBack={() => go("name")} {...stepInfo(data.provider, "dob")} />
      <Body>
        <Title sub="Potrebujeme ho na overenie veku.">Dátum narodenia</Title>
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 54, background: "#fff",
          borderRadius: 6, padding: "0 14px",
          border: `1px solid ${problem ? "var(--danger)" : focused ? "var(--accent)" : "#EAEAEA"}`,
          boxShadow: focused && !problem ? "0 0 0 3px var(--accent-shadow)" : "none",
          transition: "border-color .15s ease, box-shadow .15s ease" }}>
          <OIcon name="calendar" size={19} stroke={focused ? "var(--accent)" : "var(--faint)"} />
          <input type="date" value={data.dob} required aria-required="true"
            min={MINDATE} max={today}
            onChange={(e) => setData({ dob: e.target.value })}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ flex: 1, border: "none", outline: "none", background: "none", fontFamily: "inherit",
              fontSize: 15.5, fontWeight: 500, color: data.dob ? "var(--ink)" : "var(--faint)", minWidth: 0 }} />
        </div>
        {problem && <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 8 }}>{problem}</div>}
      </Body>
    </Screen>
  );
}

/* ═══════════════ ACCESS CODE (krok 1) ═══════════════ */
function CodeInput({ value, onChange, len = 6, error }) {
  const ref = React.useRef(null);
  const [focused, setFocused] = React.useState(false);
  const chars = value.toUpperCase().split("");
  return (
    <div style={{ position: "relative" }} onClick={() => ref.current && ref.current.focus()}>
      <input ref={ref} value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, len))}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        maxLength={len} autoComplete="off" autoCapitalize="characters" spellCheck="false"
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }} />
      <div style={{ display: "flex", gap: 9 }}>
        {Array.from({ length: len }).map((_, i) => {
          const active = focused && i === Math.min(value.length, len - 1);
          const filled = !!chars[i];
          const bc = error ? "var(--danger)" : (active || filled ? "var(--accent)" : "#EAEAEA");
          return (
            <div key={i} style={{ flex: 1, height: 58, borderRadius: 6, display: "flex", alignItems: "center",
              justifyContent: "center", background: "#fff",
              border: `1px solid ${bc}`, fontSize: 26, fontWeight: 700, color: "var(--ink)",
              transition: "border-color .15s ease, background .15s ease" }}>
              {chars[i] || (active
                ? <span style={{ width: 2, height: 26, background: "var(--accent)", borderRadius: 2,
                    animation: "fzBlink 1s steps(2) infinite" }} />
                : "")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function CodeScreen({ go, data, setData }) {
  const [error, setError] = React.useState(false);
  const ready = data.code.length >= 6;
  const confirm = () => {
    if (!ready) return;
    if (data.code.toUpperCase() === VALID_CODE) { setError(false); go("signupMethod"); }
    else setError(true);
  };
  return (
    <Screen footer={<NextButton disabled={!ready} onClick={confirm}>Potvrdiť</NextButton>}>
      <ObHeader onBack={() => go("welcome")} {...stepInfo(data.provider, "code")} />
      <Body>
        <Title sub="Zadajte 6-znakový kód od svojho fyzioterapeuta — veľké písmená a číslice, napríklad FYZ7K2.">Prístupový kód</Title>
        <CodeInput value={data.code} onChange={(v) => { setData({ code: v }); setError(false); }} error={error} />
        {error && (
          <div className="fz-fade" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14,
            padding: "11px 13px", borderRadius: 12, background: "var(--danger-wash)" }}>
            <OIcon name="alert" size={17} stroke="var(--danger)" />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--danger)" }}>Kód sa nenašiel, skúste to znova.</span>
          </div>
        )}
        <button onClick={() => { setData({ code: VALID_CODE }); setError(false); }}
          style={{ display: "block", width: "100%", textAlign: "center", marginTop: 16, border: "none",
            background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "var(--accent)" }}>
          Použiť ukážkový kód
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 18,
          fontSize: 12.5, color: "var(--muted)" }}>
          <OIcon name="shield" size={15} stroke="var(--muted)" />
          Bezpečné prepojenie s vašou klinikou
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 6 · ASSIGNED PROGRAM ═══════════════ */
function ProgramScreen({ go, data }) {
  const meta = [
    { label: "Fázy", value: "3" },
    { label: "Cviky", value: "4" },
    { label: "V tréningový deň", value: "≈ 12 min" },
  ];
  return (
    <Screen footer={
      <NextButton onClick={() => go("schedule")}>Začať</NextButton>
    }>
      <ObHeader onBack={() => go("dob")} {...stepInfo(data.provider, "program")} />
      <Body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--ok-wash)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <OIcon name="checkCircle" size={32} stroke="var(--ok)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 780, color: "var(--ink)", letterSpacing: -0.5 }}>Máte pridelený program</div>
          <div style={{ fontSize: 14.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.5, maxWidth: 290 }}>
            Váš fyzioterapeut vám pripravil rehabilitačný plán na mieru.
          </div>
        </div>

        {/* program card */}
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #EAEAEA", background: "#fff" }}>
          <div style={{ padding: "18px 18px 16px" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 650,
              color: "var(--muted)", marginBottom: 8 }}>Pridelený program</div>
            <div style={{ fontSize: 22, fontWeight: 780, letterSpacing: -0.4, color: "var(--ink)" }}>{PROGRAM_NAME}</div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4 }}>Fáza 1 · Uvoľnenie a mobilita</div>
          </div>
          <div style={{ display: "flex", background: "#fff", borderTop: "1px solid #EAEAEA" }}>
            {meta.map((m, i) => (
              <div key={m.label} style={{ flex: 1, padding: "16px 8px", textAlign: "center",
                borderLeft: i ? "1px solid #EAEAEA" : "none" }}>
                <div style={{ fontSize: 17, fontWeight: 740, color: "var(--ink)" }}>{m.value}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.3 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, padding: "14px 16px", background: "#fff",
            borderTop: "1px solid #EAEAEA" }}>
            <span style={{ fontSize: 12.5, color: "var(--muted)", flexShrink: 0 }}>Potrebné vybavenie</span>
            <span style={{ fontSize: 12.5, fontWeight: 620, color: "var(--ink)", marginLeft: "auto", textAlign: "right" }}>Odporová guma, Penový valec</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, padding: "13px 15px",
          borderRadius: 12, background: "var(--accent-wash)" }}>
          <OIcon name="user" size={17} stroke="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
            Program vám pridelil <strong style={{ color: "var(--accent-ink)", fontWeight: 700 }}>Mgr. Peter Novák</strong>, Fyzio Centrum Bratislava.
          </span>
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 7 · SCHEDULE ═══════════════ */
function ScheduleScreen({ go, data, setData }) {
  const days = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
  const toggle = (d) => setData({ days: data.days.includes(d) ? data.days.filter((x) => x !== d) : [...data.days, d] });
  const [focused, setFocused] = React.useState(false);
  const missing = Math.max(0, MIN_DAYS - data.days.length);
  const ready = missing === 0;
  return (
    <Screen footer={
      <NextButton disabled={!ready} onClick={() => ready && (window.location.href = "fyzio.html")}>Uložiť a začať</NextButton>
    }>
      <ObHeader onBack={() => go("program")} {...stepInfo(data.provider, "schedule")} />
      <Body>
        <Title sub={`Fyzioterapeut predpísal cvičiť aspoň ${MIN_DAYS} dni v týždni. Viac dní je v poriadku.`}>Nastavte si režim</Title>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: -14, marginBottom: 20 }}>Program: {PROGRAM_NAME}</div>
        <OLabel>Tréningové dni</OLabel>
        <div style={{ display: "flex", gap: 7 }}>
          {days.map((d) => {
            const sel = data.days.includes(d);
            return (
              <button key={d} onClick={() => toggle(d)} aria-pressed={sel}
                style={{ flex: 1, height: 48, borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                  fontSize: 14, fontWeight: sel ? 680 : 550,
                  border: `1px solid ${sel ? "var(--accent)" : "#EAEAEA"}`,
                  background: sel ? "var(--accent)" : "#fff", color: sel ? "#fff" : "var(--text)",
                  transition: "background .15s ease, color .15s ease" }}>{d}</button>
            );
          })}
        </div>
        {missing > 0 && (
          <div className="fz-fade" style={{ marginTop: 12, padding: "11px 13px", borderRadius: 12,
            background: "#FBF3DB", color: "#956400", fontSize: 13, lineHeight: 1.45, fontWeight: 600 }}>
            Fyzioterapeut predpísal aspoň {MIN_DAYS} dni v týždni. Vyberte ešte {missing === 1 ? "jeden" : missing === 2 ? "dva" : missing} {missing === 1 ? "deň" : "dni"}.
          </div>
        )}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            paddingBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 620, color: "var(--ink)" }}>Pripomienky</span>
            <button role="switch" aria-checked={data.remind} aria-label="Pripomienky"
              onClick={() => setData({ remind: !data.remind })}
              style={{ width: 48, height: 29, borderRadius: 999, border: "none", cursor: "pointer", padding: 3,
                background: data.remind ? "var(--accent)" : "#DCE0E7", display: "flex",
                justifyContent: data.remind ? "flex-end" : "flex-start",
                transition: "background .18s ease" }}>
              <span style={{ width: 23, height: 23, borderRadius: "50%", background: "#fff",
                transition: "transform .18s ease" }} />
            </button>
          </div>
          <div style={{ opacity: data.remind ? 1 : 0.45, transition: "opacity .18s ease" }}>
            <OLabel>Čas pripomienky</OLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 10, height: 54, background: "#fff",
              borderRadius: 6, padding: "0 14px", border: `1px solid ${focused && data.remind ? "var(--accent)" : "#EAEAEA"}`,
              boxShadow: focused && data.remind ? "0 0 0 3px var(--accent-shadow)" : "none",
              transition: "border-color .15s ease, box-shadow .15s ease" }}>
              <OIcon name="clock" size={19} stroke={focused && data.remind ? "var(--accent)" : "var(--faint)"} />
              <input type="time" value={data.reminder} disabled={!data.remind}
                onChange={(e) => setData({ reminder: e.target.value })}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ flex: 1, border: "none", outline: "none", background: "none", fontFamily: "inherit",
                  fontSize: 15.5, fontWeight: 500, color: "var(--ink)", minWidth: 0 }} />
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
              Pripomienku pošleme len v tréningové dni. Čas platí pre všetky vaše programy a viete ho kedykoľvek zmeniť.
            </div>
          </div>
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ Placeholder doc sheet ═══════════════ */
function DocSheet({ doc, onClose }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,28,55,0.28)" }} />
      <div className="fz-sheet" style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "86%",
        background: "#fff", borderRadius: "12px 12px 0 0", display: "flex", flexDirection: "column",
        paddingBottom: 30, boxShadow: "0 -4px 18px rgba(30,40,70,0.10)" }}>
        <div style={{ flexShrink: 0, width: 38, height: 5, borderRadius: 3, background: "var(--line)", margin: "10px auto 8px" }} />
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 20px 14px" }}>
          <span style={{ fontSize: 18, fontWeight: 740, color: "var(--ink)", letterSpacing: -0.3 }}>{doc}</span>
          <button onClick={onClose} aria-label="Zavrieť" style={{ width: 34, height: 34, borderRadius: 6,
            border: "1px solid #EAEAEA", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <OIcon name="x" size={18} stroke="var(--muted)" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
          {/* placeholder content */}
          {[92, 74, 88, 60].map((w, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <div style={{ height: 13, width: `${w - 40}%`, borderRadius: 6, background: "var(--line)", marginBottom: 12 }} />
              {[100, 96, 90, w].map((lw, j) => (
                <div key={j} style={{ height: 9, width: `${lw}%`, borderRadius: 5,
                  background: "#f0f2f7", marginBottom: 8 }} />
              ))}
            </div>
          ))}
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 0.5, color: "var(--faint)",
            textAlign: "center", padding: "8px 0 4px" }}>[ obsah sa doplní neskôr ]</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ ROOT STATE MACHINE ═══════════════ */
function OnboardingFlow() {
  const [screen, setScreen] = React.useState("welcome");
  const [doc, setDoc] = React.useState(null);
  const [data, setDataRaw] = React.useState({
    email: "", pw: "", first: "", last: "", dob: "", code: "",
    provider: "email", marketing: false, loginProvider: "google",
    days: ["Po", "St", "Pi"], reminder: "18:00", remind: true,
  });
  const setData = (patch) => setDataRaw((d) => ({ ...d, ...patch }));
  const go = (s) => setScreen(s);

  const screens = {
    welcome: <WelcomeScreen go={go} />,
    loginMethod: <LoginMethodScreen go={go} setData={setData} />,
    noAccount: <NoAccountScreen go={go} data={data} />,
    login: <LoginScreen go={go} data={data} setData={setData} />,
    signupMethod: <SignupMethodScreen go={go} data={data} setData={setData} openDoc={setDoc} />,
    creds: <CredsScreen go={go} data={data} setData={setData} />,
    name: <NameScreen go={go} data={data} setData={setData} />,
    dob: <DobScreen go={go} data={data} setData={setData} />,
    code: <CodeScreen go={go} data={data} setData={setData} />,
    program: <ProgramScreen go={go} data={data} />,
    schedule: <ScheduleScreen go={go} data={data} setData={setData} />,
  };

  return (
    <IOSDevice>
      <div key={screen} style={{ height: "100%" }}>{screens[screen]}</div>
      {doc && <DocSheet doc={doc} onClose={() => setDoc(null)} />}
    </IOSDevice>
  );
}

Object.assign(window, { OnboardingFlow });
