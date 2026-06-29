// app/login.jsx — V4 soft-card login: centered card, spark logo above
// Exports to window: LoginScreen

function Field({ icon, type = "text", value, onChange, placeholder, trailing }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#f4f6f9", borderRadius: 14, padding: "0 14px", height: 54,
      border: `1.5px solid ${focus ? "var(--accent)" : "transparent"}`,
      boxShadow: focus ? "0 0 0 4px var(--accent-shadow)" : "none",
      transition: "border-color .15s ease, box-shadow .15s ease",
    }}>
      <Icon name={icon} size={19} stroke={focus ? "var(--accent)" : "var(--faint)"} />
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        autoCapitalize="none" autoCorrect="off" spellCheck="false"
        style={{ flex: 1, border: "none", outline: "none", background: "none",
          fontFamily: "inherit", fontSize: 15.5, color: "var(--ink)", minWidth: 0 }} />
      {trailing}
    </div>
  );
}

function CodeInput({ value, onChange, len = 6 }) {
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
          return (
            <div key={i} style={{ flex: 1, height: 58, borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: filled ? "var(--accent-wash)" : "#f4f6f9",
              border: `1.5px solid ${active || filled ? "var(--accent)" : "transparent"}`,
              fontSize: 26, fontWeight: 700, color: "var(--ink)",
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

function LoginScreen({ onContinue }) {
  const [step, setStep] = React.useState("creds");
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [code, setCode] = React.useState("");

  const credsReady = /\S+@\S+\.\S+/.test(email) && pw.length >= 4;
  const codeReady = code.length >= 6;

  return (
    <div className="fz-fade" style={{ height: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#edf0f7", overflow: "hidden", padding: "0 22px 24px" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 8 }}>
        <div style={{ width: 54, height: 54, borderRadius: 18, background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 24px rgba(28,63,110,0.28)" }}>
          <Icon name="spark" size={30} stroke="#fff" fill="#fff" />
        </div>
        <span style={{ fontSize: 34, fontWeight: 800, color: "var(--ink)", letterSpacing: -1 }}>Fyzio<span style={{ color: "var(--accent)" }}>Union</span></span>
      </div>
      <div style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 28, textAlign: "center" }}>
        {FYZIO.tagline}
      </div>

      {/* White card — centered */}
      <div key={step} className="fz-fade" style={{ width: "100%",
        background: "#fff", borderRadius: 28, padding: "28px 24px 26px",
        boxShadow: "0 10px 44px rgba(28,40,90,0.10), 0 2px 10px rgba(28,40,90,0.06)" }}>

        {step === "creds" ? (
          <React.Fragment>
            <div style={{ fontSize: 21, fontWeight: 750, color: "var(--ink)", letterSpacing: -0.4, marginBottom: 4 }}>
              Prihláste sa
            </div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 20, lineHeight: 1.5 }}>
              Zadajte e-mail a heslo k svojmu účtu pacienta.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
              <Field icon="mail" type="email" value={email} onChange={setEmail} placeholder="vas@email.sk" />
              <Field icon="lock" type={showPw ? "text" : "password"} value={pw} onChange={setPw} placeholder="••••••••"
                trailing={
                  <button onClick={() => setShowPw((s) => !s)} aria-label="Zobraziť heslo"
                    style={{ border: "none", background: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                    <Icon name={showPw ? "eyeOff" : "eye"} size={19} stroke="var(--faint)" />
                  </button>
                } />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
              <button onClick={() => { setEmail("lucia.kovacova@email.sk"); setPw("heslo123"); }}
                style={{ border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                Zabudli ste heslo?
              </button>
            </div>
            <PrimaryButton onClick={() => credsReady && setStep("code")} disabled={!credsReady}>
              Pokračovať
            </PrimaryButton>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <button onClick={() => setStep("creds")} style={{ display: "flex", alignItems: "center", gap: 5,
              border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 16, padding: 0 }}>
              <Icon name="chevL" size={17} stroke="var(--muted)" /> Späť
            </button>
            <div style={{ fontSize: 21, fontWeight: 750, color: "var(--ink)", letterSpacing: -0.4, marginBottom: 4 }}>
              Prístupový kód
            </div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 20, lineHeight: 1.5 }}>
              Zadajte 6-miestny kód, ktorý ste dostali od fyzioterapeuta.
            </div>
            <CodeInput value={code} onChange={setCode} />
            <button onClick={() => setCode("FYZ7K2")}
              style={{ display: "block", width: "100%", textAlign: "center", marginTop: 14, marginBottom: 20,
                border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 13.5, fontWeight: 600, color: "var(--accent)" }}>
              Použiť ukážkový kód
            </button>
            <PrimaryButton onClick={() => codeReady && onContinue && onContinue()} disabled={!codeReady}>
              Prihlásiť sa
            </PrimaryButton>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              marginTop: 14, fontSize: 12.5, color: "var(--muted)" }}>
              <Icon name="shield" size={15} stroke="var(--muted)" />
              Bezpečné prepojenie s vašou klinikou
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
