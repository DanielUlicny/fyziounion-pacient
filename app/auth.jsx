// app/auth.jsx — FyzioUnion registration + login flow, integrated into the app
// Exports to window: AuthFlow

const VALID_CODE = "FYZ7K2";
const REG_TOTAL = 6; // terms, creds, name, dob, gender, code

// ── Brand lockup ─────────────────────────────────────────────
function Brand({ compact = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: compact ? 42 : 56, height: compact ? 42 : 56, borderRadius: compact ? 14 : 18,
        background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 24px var(--accent-shadow)" }}>
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
const Title = ({ children, sub }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ fontSize: 26, fontWeight: 780, color: "var(--ink)", letterSpacing: -0.6, lineHeight: 1.18 }}>{children}</div>
    {sub && <div style={{ fontSize: 14.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>{sub}</div>}
  </div>
);

// ── Reusable show/hide password field ────────────────────────
function PasswordField({ value, onChange, placeholder = "••••••••" }) {
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

/* ═══════════════ 1 · WELCOME / METHOD ═══════════════ */
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

      {/* options — order per spec: login link, email, google, apple */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ textAlign: "center", marginBottom: 3 }}>
          <span style={{ fontSize: 14, color: "var(--muted)" }}>Už máte účet? </span>
          <button onClick={() => go("login")} style={{ border: "none", background: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "var(--accent)", padding: "2px 2px" }}>
            Prihlásiť sa
          </button>
        </div>
        <ProviderButton variant="filled" onClick={() => go("terms")}
          logo={<OIcon name="at" size={20} stroke="#fff" />}>Pokračovať cez Email</ProviderButton>
        <ProviderButton logo={<GoogleLogo size={19} />} onClick={() => {}}>Pokračovať cez Google</ProviderButton>
        <ProviderButton logo={<AppleLogo size={20} />} onClick={() => {}}>Pokračovať cez Apple</ProviderButton>
      </div>
    </div>
  );
}

/* ═══════════════ LOGIN ═══════════════ */
function LoginScreen({ go, onLogin, data, setData }) {
  const ready = /\S+@\S+\.\S+/.test(data.email) && data.pw.length >= 4;
  return (
    <Screen footer={
      <button onClick={() => ready && onLogin()} disabled={!ready} style={{ width: "100%", border: "none",
        borderRadius: 16, cursor: ready ? "pointer" : "default", padding: "16px 18px", fontSize: 16.5,
        fontWeight: 650, fontFamily: "inherit", color: "#fff",
        background: ready ? "var(--accent)" : "var(--accent-disabled)",
        transition: "background .2s ease" }}>Prihlásiť sa</button>
    }>
      <ObHeader onBack={() => go("welcome")} />
      <Body>
        <div style={{ marginBottom: 26 }}><Brand compact /></div>
        <Title sub="Zadajte e-mail a heslo k svojmu účtu pacienta.">Prihláste sa</Title>
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

/* ═══════════════ 2 · TERMS & CONSENT ═══════════════ */
function TermsBox({ title, onClick }) {
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
      textAlign: "left", fontFamily: "inherit", cursor: "pointer", padding: "13px 15px", borderRadius: 13,
      border: "1.5px solid var(--line)", background: "#fff" }}>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>{title}</span>
      <OIcon name="external" size={17} stroke="var(--faint)" style={{ flexShrink: 0 }} />
    </button>
  );
}
function TermsScreen({ go, data, setData, openDoc }) {
  return (
    <Screen footer={
      <React.Fragment>
        <div style={{ marginBottom: 14 }}>
          <OCheckbox checked={data.agree} onChange={(v) => setData({ agree: v })}>
            Prečítal som si a súhlasím s Podmienkami používania a Zásadami ochrany osobných údajov.
          </OCheckbox>
        </div>
        <NextButton disabled={!data.agree} onClick={() => data.agree && go("creds")}>Ďalšie</NextButton>
      </React.Fragment>
    }>
      <ObHeader onBack={() => go("welcome")} step={1} total={REG_TOTAL} />
      <Body>
        <div style={{ fontSize: 20.5, fontWeight: 720, color: "var(--ink)", letterSpacing: -0.4, lineHeight: 1.32, marginBottom: 22 }}>
          Súhlasíte s našimi Podmienkami používania a Zásadami ochrany osobných údajov.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <TermsBox title="Podmienky používania" onClick={() => openDoc("Podmienky používania")} />
          <TermsBox title="Zásady ochrany osobných údajov" onClick={() => openDoc("Zásady ochrany osobných údajov")} />
          <TermsBox title="O našich podmienkach" onClick={() => openDoc("O našich podmienkach")} />
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 3 · EMAIL & PASSWORD ═══════════════ */
function CredsScreen({ go, data, setData }) {
  const ready = /\S+@\S+\.\S+/.test(data.email) && data.pw.length >= 8;
  return (
    <Screen footer={<NextButton disabled={!ready} onClick={() => ready && go("name")}>Ďalšie</NextButton>}>
      <ObHeader onBack={() => go("terms")} step={2} total={REG_TOTAL} />
      <Body>
        <Title sub="Tieto údaje použijete pri každom prihlásení.">E-mail, heslo a telefón</Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <OLabel>E-mail</OLabel>
            <OField icon="mail" type="email" value={data.email} onChange={(v) => setData({ email: v })} placeholder="vas@email.sk" />
          </div>
          <div>
            <OLabel>Telefónne číslo</OLabel>
            <OField icon="phone" type="tel" inputMode="tel" value={data.phone} onChange={(v) => setData({ phone: v })} placeholder="+421 900 000 000" />
          </div>
          <div>
            <OLabel>Heslo</OLabel>
            <PasswordField value={data.pw} onChange={(v) => setData({ pw: v })} />
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8, fontSize: 12.5,
              color: data.pw.length >= 8 ? "var(--ok-ink)" : "var(--muted)" }}>
              <OIcon name={data.pw.length >= 8 ? "checkCircle" : "info"} size={14}
                stroke={data.pw.length >= 8 ? "var(--ok)" : "var(--muted)"} />
              Heslo musí mať aspoň 8 znakov.
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
      <ObHeader onBack={() => go("creds")} step={3} total={REG_TOTAL} />
      <Body>
        <Title sub="Aby vás fyzioterapeut vedel identifikovať.">Ako sa voláte?</Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <OLabel>Meno</OLabel>
            <OField icon="user" value={data.first} onChange={(v) => setData({ first: v })} placeholder="Lucia" />
          </div>
          <div>
            <OLabel>Priezvisko</OLabel>
            <OField icon="user" value={data.last} onChange={(v) => setData({ last: v })} placeholder="Kováčová" />
          </div>
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 5 · DATE OF BIRTH ═══════════════ */
function DobScreen({ go, data, setData }) {
  const d = +data.dd, m = +data.mm, y = +data.yyyy;
  const ready = data.dd && data.mm && data.yyyy.length === 4 &&
    d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2025;
  const clean = (v, max) => v.replace(/\D/g, "").slice(0, max);
  return (
    <Screen footer={<NextButton disabled={!ready} onClick={() => ready && go("gender")}>Ďalšie</NextButton>}>
      <ObHeader onBack={() => go("name")} step={4} total={REG_TOTAL} />
      <Body>
        <Title sub="Pomôže nám prispôsobiť váš rehabilitačný plán.">Dátum narodenia</Title>
        <div style={{ display: "flex", gap: 11 }}>
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <OLabel>Deň</OLabel>
            <OField value={data.dd} onChange={(v) => setData({ dd: clean(v, 2) })} placeholder="DD" inputMode="numeric" align="center" />
          </div>
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <OLabel>Mesiac</OLabel>
            <OField value={data.mm} onChange={(v) => setData({ mm: clean(v, 2) })} placeholder="MM" inputMode="numeric" align="center" />
          </div>
          <div style={{ flex: "1.3 1 0", minWidth: 0 }}>
            <OLabel>Rok</OLabel>
            <OField value={data.yyyy} onChange={(v) => setData({ yyyy: clean(v, 4) })} placeholder="RRRR" inputMode="numeric" align="center" />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12, fontSize: 12.5, color: "var(--muted)" }}>
          <OIcon name="calendar" size={15} stroke="var(--muted)" />
          Napríklad 14 / 03 / 1990
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 6 · GENDER ═══════════════ */
function GenderScreen({ go, data, setData }) {
  const opts = ["Muž", "Žena", "Nebinárne", "Nechcem uviesť"];
  return (
    <Screen footer={<NextButton disabled={!data.gender} onClick={() => data.gender && go("code")}>Ďalšie</NextButton>}>
      <ObHeader onBack={() => go("dob")} step={5} total={REG_TOTAL} />
      <Body>
        <Title sub="Vyberte jednu možnosť.">Pohlavie</Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {opts.map((o) => {
            const sel = data.gender === o;
            return (
              <button key={o} onClick={() => setData({ gender: o })} style={{ width: "100%", display: "flex",
                alignItems: "center", gap: 13, textAlign: "left", fontFamily: "inherit", cursor: "pointer",
                padding: "16px 16px", borderRadius: 14,
                border: `1.5px solid ${sel ? "var(--accent)" : "var(--line)"}`,
                background: sel ? "var(--accent-wash)" : "#fff", transition: "all .15s ease" }}>
                <span style={{ width: 23, height: 23, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${sel ? "var(--accent)" : "var(--faint)"}`,
                  background: sel ? "var(--accent)" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {sel && <span style={{ width: 8.5, height: 8.5, borderRadius: "50%", background: "#fff" }} />}
                </span>
                <span style={{ fontSize: 16, fontWeight: sel ? 660 : 500, color: sel ? "var(--accent-ink)" : "var(--ink)" }}>{o}</span>
              </button>
            );
          })}
        </div>
      </Body>
    </Screen>
  );
}

/* ═══════════════ 7 · ACCESS CODE ═══════════════ */
function AuthCode({ value, onChange, len = 6, error }) {
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
          const bc = error ? "var(--auth-err)" : (active || filled ? "var(--accent)" : "transparent");
          return (
            <div key={i} style={{ flex: 1, height: 58, borderRadius: 14, display: "flex", alignItems: "center",
              justifyContent: "center", background: filled ? "var(--accent-wash)" : "#f4f6f9",
              border: `1.5px solid ${bc}`, fontSize: 26, fontWeight: 700, color: "var(--ink)",
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
function CodeScreen({ go, data, setData, onDone }) {
  const [error, setError] = React.useState(false);
  const ready = data.code.length >= 6;
  const confirm = () => {
    if (!ready) return;
    if (data.code.toUpperCase() === VALID_CODE) { setError(false); onDone(); }
    else setError(true);
  };
  return (
    <Screen footer={<NextButton disabled={!ready} onClick={confirm}>Potvrdiť</NextButton>}>
      <ObHeader onBack={() => go("gender")} step={6} total={REG_TOTAL} />
      <Body>
        <Title sub="Zadajte 6-miestny kód, ktorý ste dostali od svojho fyzioterapeuta.">Prístupový kód</Title>
        <AuthCode value={data.code} onChange={(v) => { setData({ code: v }); setError(false); }} error={error} />
        {error && (
          <div className="fz-fade" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14,
            padding: "11px 13px", borderRadius: 12, background: "var(--auth-err-wash)" }}>
            <OIcon name="alert" size={17} stroke="var(--auth-err)" />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--auth-err)" }}>Kód sa nenašiel, skúste to znova.</span>
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

/* ═══════════════ Placeholder doc sheet ═══════════════ */
function DocSheet({ doc, onClose }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,28,55,0.28)" }} />
      <div className="fz-sheet" style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "86%",
        background: "#fff", borderRadius: "26px 26px 0 0", display: "flex", flexDirection: "column",
        paddingBottom: 30, boxShadow: "0 -10px 40px rgba(20,28,55,0.18)" }}>
        <div style={{ flexShrink: 0, width: 38, height: 5, borderRadius: 3, background: "var(--line)", margin: "10px auto 8px" }} />
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 20px 14px" }}>
          <span style={{ fontSize: 18, fontWeight: 740, color: "var(--ink)", letterSpacing: -0.3 }}>{doc}</span>
          <button onClick={onClose} aria-label="Zavrieť" style={{ width: 34, height: 34, borderRadius: 10,
            border: "none", background: "var(--chip)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
function AuthFlow({ onLogin, onEnter }) {
  const [screen, setScreen] = React.useState("welcome");
  const [doc, setDoc] = React.useState(null);
  const [data, setDataRaw] = React.useState({
    email: "", pw: "", phone: "", first: "", last: "", dd: "", mm: "", yyyy: "", gender: "", code: "", agree: false,
  });
  const setData = (patch) => setDataRaw((d) => ({ ...d, ...patch }));
  const go = (s) => setScreen(s);

  const screens = {
    welcome: <WelcomeScreen go={go} />,
    login: <LoginScreen go={go} onLogin={onLogin} data={data} setData={setData} />,
    terms: <TermsScreen go={go} data={data} setData={setData} openDoc={setDoc} />,
    creds: <CredsScreen go={go} data={data} setData={setData} />,
    name: <NameScreen go={go} data={data} setData={setData} />,
    dob: <DobScreen go={go} data={data} setData={setData} />,
    gender: <GenderScreen go={go} data={data} setData={setData} />,
    code: <CodeScreen go={go} data={data} setData={setData} onDone={onEnter} />,
  };

  return (
    <React.Fragment>
      <div key={screen} style={{ height: "100%" }}>{screens[screen]}</div>
      {doc && <DocSheet doc={doc} onClose={() => setDoc(null)} />}
    </React.Fragment>
  );
}

Object.assign(window, { AuthFlow });
