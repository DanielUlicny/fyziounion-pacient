---
projekt: FyzioUnion
typ: technická dokumentácia
oblasť: dizajn / UI tokeny / komponenty
verzia dokumentu: 1.0
dátum: 2026-08-19
tags: [dizajn, ui, tokeny, komponenty, minimalist-ui, apple-design, emil, dataviz]
súvisiace: "[[FyzioUnion - Štruktúra projektu]] · [[FyzioUnion - Prístupnosť (a11y) požiadavky]]"
---

# FyzioUnion — Dizajn systém (UI tokeny a pravidlá)

> **Prečo tento dokument existuje:** rozhodnutia o farbe tlačidiel, rádiusoch, štítkoch
> a toastoch sa doteraz robili obrazovku po obrazovke a nikde sa neukladali — takže sa
> pri každej ďalšej obrazovke odvodzovali nanovo a vznikali rozdiely. Toto je ich
> jediné miesto.
>
> **Vzťah ku skillom:** východisko je `minimalist-ui` (+ `apple-design`, `dataviz`,
> `emil-design-eng`, `impeccable`). Kde sa od skillu **vedome odchyľujeme**, je to nižšie
> označené ako **ODCHÝLKA** aj s dôvodom. Platí pravidlo z `CLAUDE.md`: *„Skilly sú
> brúsny papier, nie architekt."*

---

## 1. Farba

### 1.1 Tlačidlá — bridlicová sivá, nie čierna (ODCHÝLKA, rozhodnuté)

`minimalist-ui` §5 predpisuje pre primárne CTA plné `#111111`. **FyzioUnion používa
bridlicovú sivú** ako značkový token naprieč celou appkou.

**Prečo odchýlka obstojí:** konzistentný token cez celý produkt poráža literu jedného
pravidla. Rozdiel medzi čiernou a tmavou bridlicou používateľ nevidí; rozdiel medzi
dvomi rôznymi tlačidlami na dvoch obrazovkách vidí okamžite.

**Podmienky, bez ktorých sa odchýlka rozpadne:**
1. **Teplota celej škály musí byť jednotná.** Bridlica je studený (modrastý) neutrál.
   `minimalist-ui` §4 ponúka *teplé* pozadia (`#F7F6F3`, bone) — tie sa s ňou **nesmú**
   kombinovať. Používaj čistú bielu `#FFFFFF` (neutrálna, znesie oboje), nikdy bone/warm off-white.
2. **Bridlica sa nesmie opticky prekrývať s info-modrou** (`#E1F3FE` / text `#1F6C9F`).
   Ak sa priblíži, bridlica musí byť tmavšia a desaturovanejšia.
3. Kontrast textu na tlačidle ≥ 4,5:1 (viď [[FyzioUnion - Prístupnosť (a11y) požiadavky]]).

### 1.2 Sémantické pastely (zo skillu, bez zmeny)

`minimalist-ui` §4 — *„Color is a scarce resource, utilized only for semantic meaning
or subtle accents."* Farba **nikdy** nie je dekorácia.

| Význam | Pozadie | Text |
|---|---|---|
| chyba / deštruktívne | `#FDEBEC` | `#9F2F2D` |
| informácia | `#E1F3FE` | `#1F6C9F` |
| úspech / aktívne | `#EDF3EC` | `#346538` |
| upozornenie / pripravuje sa | `#FBF3DB` | `#956400` |

- **Červená je vyhradená pre deštruktívne a nezvratné akcie** (`apple-design`). Nepoužívaj
  ju na „varovanie", ktoré nič nemaže — na to je žltá.
- `dataviz`: status farby sú **rezervované** a vždy idú s ikonou alebo textom, nikdy
  farba samotná.
- **Zelená je jedna, nie dve (rozhodnuté 2026-08-24).** Úspešný/dokončený stav má **vždy**
  pozadie `#EDF3EC` a obsah `#346538` — platí rovnako pre štítok, pre výplň tlačidla aj pre
  zaškrtnutie odcvičeného cviku. Sýta zelená (`#22C55E` a podobné) sa v appke **nepoužíva**.
- **Neutrálne prvky nesmú mať farebný nádych** — napr. krúžok s iniciálami v profile je
  neutrálna sivá, nie pastel (pastel by sľuboval význam, ktorý nemá).

### 1.3 Štruktúra

- Orámovania, deliace čiary, karty: **`1px solid #EAEAEA`** (`minimalist-ui` §8).
- **Deliaca čiara len tam, kde je štrukturálna hranica.** Čiara medzi popiskom poľa
  a jeho náhľadom vyzerá ako hranica sekcie a klame — nedávaj ju.
- Vstupné polia: biele pozadie + orámovanie `#EAEAEA`. **Nie** vyplnené studenou šedomodrou.

---

## 2. Rádiusy — jedna škála pre celú appku

Nie konštantná hodnota, ale **škála podľa veľkosti prvku** (`minimalist-ui` §5: karty
`8–12px`, tlačidlá `4–6px`). Vysoká karta znesie väčší rádius, nízke tlačidlo nie —
inak sa blíži k pilulke, čo §2 na tlačidlách a veľkých kartách zakazuje.

| Prvok | Rádius |
|---|---|
| modál, karta, panel | 12 px |
| vstupné pole, dropdown | 6 px |
| tlačidlo (všetky veľkosti) | 6 px |
| badge / štítok | pilulka (9999 px) |
| avatar | kruh |

> `rounded-full` je povolený **len** na avataroch a štítkoch. Nikdy na tlačidlách,
> kartách ani veľkých kontajneroch.

---

## 3. Štítky (badge) — **len pre stavy**

Badge je vyhradený výlučne pre **stav, ktorý sa mení v čase**: `ČOSKORO`, `AKTÍVNY`,
`POZVANÝ`, `DOKONČENÉ`, `TRIAL`, `POZASTAVENÝ`.

Vzhľad (`minimalist-ui` §5): pilulka, `text-xs`, VEĽKÉ PÍSMENÁ, `letter-spacing: 0.05em`,
pozadie zo sémantických pastelov §1.2.

> **Badge sa NEPOUŽÍVA na meta-informáciu o poli.** Štítok `POVINNÉ` bol zrušený —
> viď §5 (označujú sa **nepovinné** polia obyčajným textom). Badge je najvýraznejší
> prvok riadka; keď ho dostane každé druhé pole, prestane čokoľvek znamenať.

---

## 4. Stavy ovládačov

- **Ovládač, ktorý nič nerobí, sa neposiela** (`emil-design-eng`). Ak funkcia ešte nie je
  hotová, tlačidlo **odstráň** a nechaj len text so štítkom `ČOSKORO` — nedávaj tam
  mŕtve tlačidlo.
- **Vzhľad musí zodpovedať stavu.** Platné a funkčné tlačidlo nesmie vyzerať neaktívne.
  Bledý vzhľad je vyhradený **výhradne** pre skutočne neaktívny stav.
- **Rovnaká rola = rovnaký vzhľad** (`apple-design`). Všetky „submit" tlačidlá formulárov
  (Uložiť zmeny / Zmeniť e-mail / Zmeniť heslo) vyzerajú rovnako.
- **Hover ≠ vybraté** (`emil-design-eng`) — v bočnej navigácii musí byť rozdiel viditeľný.
- Stlačenie: `scale(0.97–0.98)`, `transform`/`opacity`, `ease-out`, ≤ 300 ms,
  rešpektuj `prefers-reduced-motion` (`emil-design-eng`).

---

## 5. Formuláre

- **12-stĺpcová mriežka pre celý formulár.** Zvislé hrany všetkých riadkov musia lícovať.
  Vzor v Nastaveniach → Profil: `3 / 6 / 3` (tituly – meno – tituly), pod tým `6 / 6`
  (telefón – klinika).
### Povinné vs. nepovinné polia (rozhodnuté)

**Označujú sa NEPOVINNÉ polia, nie povinné.** Jedno pravidlo pre všetky formuláre
v appke — web aj mobil.

- Značka = obyčajný malý sivý text **priamo v popiske**: `Klinika / Pracovisko (nepovinné)`.
- **Povinné pole nemá žiadnu značku.** Žiadna hviezdička, žiadny badge, žiadna legenda.
- Platí **bez ohľadu na pomer** povinných a nepovinných na danej obrazovke — dva rôzne
  dohovory na dvoch obrazovkách sú horšie než jeden mierne neoptimálny.

**Prečo takto** (žiadny z našich skillov to nerieši — zdroj je WCAG + zavedené systémy):
- Hviezdička je holý symbol, ktorý bez legendy nič neznamená (WCAG 3.3.2 *Labels or
  Instructions*), a v slovenčine má druhý význam — poznámka pod čiarou.
- Vo väčšine formulárov FyzioUnion (registrácia, nový pacient, tvorba programu) prevláda
  **povinné**, takže označovanie nepovinných značí menej vecí.
- GOV.UK, Polaris aj Carbon idú rovnakou cestou (označ menšinu / označ nepovinné).

> ⚠️ **Vizuálna značka nie je prístupnosť.** Každé povinné pole musí niesť `required` /
> `aria-required="true"` (mobil: `accessibilityState`). Čítačka sa o povinnosti inak
> nedozvie. Viď [[FyzioUnion - Prístupnosť (a11y) požiadavky]] §1.5.

- **Nepovinné pole nemá zástupnú hodnotu, ktorá vyzerá ako výber.** „Žiadne" v rozbaľovacom
  zozname sa číta ako zvolená hodnota a v enume neexistuje → použi svetlý zástupný text
  „Nepovinné".
- **Zástupný text nesmie tvrdiť menej než pravidlo pod poľom** (napr. placeholder
  „Min. 8 znakov" vs. pravidlo „Aspoň 8 znakov, jedno veľké písmeno a číslica").
  Pravidlo patrí pod pole, placeholder len pomenúva pole.
- **„Uložiť" je neaktívne, kým sa nič nezmenilo.**
- Vysvetľujúci text patrí k tomu, čo vysvetľuje (`apple-design`): text o odoslaní má byť
  bližšie k tlačidlu než k poľu nad ním.
- Limity viacnásobného výberu komunikuj **v zozname** („Vyberte najviac 4 tituly") a po
  dosiahnutí limitu zvyšné možnosti **zošedni** — nezobrazuj chybu.

---

## 6. Toast (potvrdenie akcie)

**Jeden komponent, jeden vzhľad.** Rovnaká šírka podľa obsahu, rovnaký rádius, rovnaké
tmavé pozadie, dole v strede, **min. 24 px nad spodnou hranou okna**, nikdy nepretína
okraj modálu.

**Obsah:**
- Toast **nesmie poprieť** text, ktorý stojí nad tlačidlom. (Prototyp to porušil: nad
  tlačidlom stálo „na novú aj na súčasnú adresu", toast povedal len novú.)
- **Neuvádzaj konkrétnu e-mailovú adresu ani iný osobný údaj** — toast sa často ocitne
  na screenshotoch a v zázname obrazovky. Súvisí s pravidlom z `CLAUDE.md` o citlivých
  údajoch mimo logov a hlásení.
- Po úspechu **vyprázdni polia** (najmä heslá — žiadne heslo nesmie zostať v DOM-e dlhšie,
  než je nutné).

**Záväzné znenia:**

| Akcia | Toast |
|---|---|
| Zmena e-mailu | „Potvrdzovací odkaz sme poslali na **novú aj na súčasnú** adresu. Zmena prebehne až po potvrdení oboch." |
| Zmena hesla | „Heslo zmenené. Ostatné zariadenia sme odhlásili." |

---

## 7. Typografia a ikony (zo skillu, bez zmeny)

- **Zakázané:** Inter, Roboto, Open Sans (`minimalist-ui` §2). Cieľ: `SF Pro Display`,
  `Geist Sans`, `Helvetica Neue`, `Switzer`.
- **Ikony:** Phosphor. Zakázané Lucide / Feather / Heroicons (§2).
- Žiadne emoji v UI, žiadne ťažké tiene.

> ✅ **Uzavreté (2026-08-24):** appka používa **Phosphor** vo webe aj v mobile. Sada je
> zjednotená, nová obrazovka si nesmie priniesť vlastnú.
>
> ⚠️ **Poznámka k posudzovaniu zo screenshotov:** sadu ikon **nie je možné spoľahlivo určiť
> z obrázka** v bežnom rozlíšení. Ak vznikne podozrenie, over to v kóde — netvrď to z pohľadu.

---

## 8. Známe pasce prototypu (opakujú sa — kontroluj ich)

| Pasca | Kde je pravidlo |
|---|---|
| Dvojitá bodka pri tituloch („DrSc..") — skladateľ mena lepí bodku k hodnote, ktorá už bodkou končí | [[FyzioUnion - Technický plán a dátový model]] §Akademické tituly |
| Poradie titulov podľa poradia klikania namiesto akademického postupu | tamtiež |
| Toast, ktorý popiera text nad tlačidlom | §6 vyššie + [[FyzioUnion - Domény a e-maily]] §Auth maily |
| Tlačidlo pre nehotovú funkciu („Nastaviť 2FA") | §4 vyššie |
| Prázdna hodnota vydávaná za výber („Žiadne") | §5 vyššie |
| Studený modrastý fill vo vstupných poliach | §1.3 vyššie |
| Dva vizuálne varianty toho istého komponentu | `apple-design`, §4 vyššie |
| **Štítok tvrdí stav, ktorý v dátach neexistuje** („Program beží" pri `status='draft'` a `start_date = NULL`) | [[FyzioUnion - Technický plán a dátový model]] §`patient_programs` + §12.9 |
| **Ovládač bez tabuľky v dátovom modeli** (tlačidlo, ktoré nemá kam zapisovať) | pred návrhom obrazovky over v dátovom modeli, či cieľ akcie existuje |
| **Rate limit len na jednom z dvoch tlačidiel, ktoré robia to isté** (resend vs. regenerate — obe posielajú e-mail) | [[FyzioUnion - Hardening, výkon a pre-launch checklist]] |
| **Predvyplnené pole s vymysleným údajom** (telefón pacienta, ktorý ešte neexistuje) | [[FyzioUnion - Onboarding a napojenie pacienta]] §2 |
| **Globálne nastavenie pre údaj, ktorý je per program** (jedna karta „tréningové dni" pre pacienta s piatimi programami) | [[FyzioUnion - Technický plán a dátový model]] §12.8, riadok „`training_days` — per program" |
| **Minimum vykreslené ako strop** („4 / 4" pri `min_sessions_per_week`) | tamtiež, `min_sessions_per_week` = **minimálna** frekvencia; viac dní je povolených |
| **Štítok v inej slovnej zásobe, než je rozhodnutá** („Aktívny" namiesto `PREBIEHA`) | §3 vyššie + [[FyzioUnion - Štruktúra projektu]] M9b |
| **Ikona s dvomi významami na jednej obrazovke** (fajfka = odcvičený cvik **aj** stav programu) | §3 vyššie |
| **Editovateľné pole, ktoré dokumentácia zakazuje** (prihlasovací e-mail v profile pacienta) | [[FyzioUnion - Štruktúra projektu]] M18 |
| **Dve miesta na to isté prepínanie** (zoznam programov na Domove aj v Nastaveniach) | [[FyzioUnion - Štruktúra projektu]] §2, callout „Aktuálny program" |
| **Podtitul, ktorý vydáva názov programu za vlastnosť človeka** („Pacient · Bolesť krku a ramien") | v `patients` také pole nie je — over v dátovom modeli |
| **Sheet, pod ktorým ostáva živá spodná lišta** | `apple-design` (modalita) |
| **Číselná OTP klávesnica pre alfanumerický kód** | [[FyzioUnion - Onboarding a napojenie pacienta]] §4: „6 znakov, veľké písmená + čísla" |
| **Dva rozporné odseky v samotnej dokumentácii** (§2 „zmena e-mailu vyžaduje overenie" vs. M18 „pacient takú možnosť nemá") — prototyp poslúchne ten nesprávny | pri rozpore **najprv oprav dokumentáciu**, až potom obrazovku |

---

## 10. Povinný blok do KAŽDÉHO promptu na novú obrazovku

> Skopíruj to na koniec každého promptu do Claude design. Odchýta väčšinu kôl
> „poslal som screenshot → oprav → poslaľ som screenshot".

```
Dodrž tieto pravidlá FyzioUnion — platia pre všetky obrazovky:

MRIEŽKA A ZAROVNANIE
- 12-stĺpcová mriežka; zvislé hrany všetkých riadkov formulára musia lícovať.
- Polia v jednom riadku zarovnaj NA VRCH (align-items: flex-start), nie na stred —
  popisky musía byť na jednej výške aj keď jedno pole narastie do viac riadkov.
- Odsadenie zhora a zdola v modáli musí byť rovnaké; obsah nikdy nekončí na hrane.

FARBA A TVAR
- Tlačidlá: bridlicová sivá (značkový token), biely text, rádius 6px, bez tieňa.
- Vstupné pole/dropdown: biele pozadie, 1px rám #EAEAEA, rádius 6px.
  Žiadny studený modrastý fill, žiadne teplé (bone) pozadia.
- Modál/karta rádius 12px. Badge = pilulka. Avatar = kruh. rounded-full inde NIE.
- Farba len sémanticky: chyba #FDEBEC/#9F2F2D, info #E1F3FE/#1F6C9F,
  úspech #EDF3EC/#346538, upozornenie #FBF3DB/#956400. Červená len pre nezvratné akcie.
- Neutrálne prvky (napr. avatar s iniciálami) bez farebného nádychu.
- Deliaca čiara len na skutočnej hranici sekcie, nie medzi popisom a jeho náhľadom.

OVLÁDAČE
- Nedokončená funkcia = Žiadne tlačidlo. Nechaj len text + štítok ČOSKORO.
- Vzhľad musí zodpovedať stavu: platné a funkčné tlačidlo nikdy nevyzerá neaktívne.
- Všetky submit tlačidlá formulárov vyzerajú rovnako.
- „Uložiť" je neaktívne, kým sa nič nezmenilo.
- Stlačenie: scale(0.97), len transform/opacity, ease-out, do 300 ms,
  rešpektuj prefers-reduced-motion.
- Hover a „vybraté" musia byť vizuálne rozlíšitelné.

FORMULÁRE
- Označujú sa IBA nepovinné polia: malý sivý text v popiske „(nepovinné)".
  Povinné pole nemá žiadnu značku — žiadnu hviezdičku, žiadny badge POVINNÉ.
- Každé povinné pole musí mať required / aria-required="true".
- Badge (pilulka) sa používa LEN pre stavy (ČOSKORO, AKTÍVNY, POZVANÝ…), nikdy pre meta k poľu.
- Nepovinné pole nemá hodnotu „Žiadne" — len svetlý zástupný text.
- Zástupný text nesmie tvrdiť menej než pravidlo pod poľom.
- Zástupný text NIKDY nesimuluje vyplnenú hodnotu (žiadne bodky v poli pre heslo).
- Limit viacnásobného výberu oznám v zozname a po dosiahnutí zošedni zvyšok, nie chybu.
- Vysvetlívka k odoslaniu patrí bližšie k tlačidlu než k poľu nad ním.

TOAST
- JEDEN komponent: max ~420px, tmavé pozadie, dole v strede, min. 24px nad hranou okna,
  nikdy neprekrýva obsah ani neleží na okraji modálu.
- Toast nesmie poprieť text nad tlačidlom. Neuvádzaj v ňom e-mail ani iný osobný údaj.
- Po úspechu vyprázdni polia (najmä heslá).

TEXT A IKONY
- Žiadne Inter/Roboto/Open Sans. Žiadne Lucide/Feather/Heroicons — Phosphor.
- Žiadne emoji v UI, žiadne ťažké tiene.
- Skladánie titulov: nikdy nepridávaj bodku k hodnote, ktorá už bodkou končí.
```

---

## 9. Otvorené (nerozhodnuté)

- [x] ~~Overiť a zjednotiť **sadu ikon** naprieč appkou~~ — **Phosphor, potvrdené 2026-08-24**, web aj mobil.
- [x] ~~Prevziať pre **všetky** štítky pastelové pozadia podľa §1.2~~ — **rozhodnuté**: stavové
      štítky nesú pastely podľa §1.2 v celej appke (`PREBIEHA` zelená, `ČAKÁ NA SPUSTENIE` a
      `POZASTAVENÝ` žltá), **`DOKONČENÉ` ostáva neutrálne sivé** — dokončený stav nevyžaduje
      pozornosť. Platí pre web aj mobil.
- [ ] **Telefón terapeuta viditeľný pacientom — TREBA DOROBIŤ (2026-09-01, odložené).**
      Dnes je vo W16 len jedno pole „telefón (povinný)" a terapeutovi nikde nepovieme, že ho
      **uvidia jeho pacienti** (kontakt sheet v M18). Treba rozhodnúť: buď pri poli pribudne
      veta „Toto číslo uvidia vaši pacienti", alebo vznikne **druhé, samostatné pole** pre
      kontakt zdieľaný s pacientmi. Do rozhodnutia sa kontakt sheet nekreslí ako hotový.
- [ ] **Vek pacienta / maloletí — TREBA ROZHODNÚŤ (2026-09-01, odložené).** `patients.birth_date`
      existuje, účel je vekové obmedzenie, ale nie je jasné, či sa maloletí púšťajú a či treba
      profil zákonného zástupcu. Fyzioterapia má bežne detských pacientov. Do rozhodnutia sa
      pole v mobile **needituje**.
- [ ] Znenie štítku pri oficiálnych dotazníkoch: „Oficiálny" (web) vs. „FyzioUnion" (admin).
- [ ] Premenovať hodnotu enumu `equipment` `'Žiadne'` → `'Bez pomôcok'` (rovnaká pasca ako §5).
