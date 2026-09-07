# Fyzio — projektové pravidlá

## Dizajn systém — čítaj VŽDY pred prácou
Záväzný zdroj: `uploads/FyzioUnion - Dizajn systém (UI tokeny a pravidlá).md`.
Pred každou úpravou UI si ho prečítaj (read_file) a drž sa ho; pri rozpore s mojím
návrhom vyhráva dokument. Skratka najčastejšie porušovaných pravidiel:

- Tlačidlá: bridlicová sivá, biely text, rádius 6 px, bez tieňa. Rovnaká rola = rovnaký vzhľad.
- Rádiusy: modál/karta/panel 12 px · vstup/dropdown 6 px · tlačidlo 6 px · badge pilulka · avatar kruh.
  `rounded-full` len avatar a štítok.
- Rám, deliace čiary, karty: 1px #EAEAEA. Čiara len na skutočnej hranici sekcie.
- Vstupy: biele pozadie + rám #EAEAEA. Žiadny studený modrastý fill, žiadne teplé (bone) pozadia.
- Sémantické pastely (farba nikdy nie je dekorácia):
  chyba #FDEBEC/#9F2F2D · info #E1F3FE/#1F6C9F · úspech #EDF3EC/#346538 · upozornenie #FBF3DB/#956400.
  Červená len pre nezvratné akcie. Zelená je jedna: #EDF3EC/#346538, sýta zelená nikdy.
  `DOKONČENÉ` je neutrálne sivé. Neutrálne prvky (avatar s iniciálami) bez farebného nádychu.
- Badge len pre stavy (PREBIEHA, PRIPRAVENÝ, POZASTAVENÝ, DOKONČENÉ…): pilulka, veľmi malé
  písmo, VEĽKÉ PÍSMENÁ, letter-spacing 0.05em. Nikdy pre meta k poľu ani pre počty.
- Ovládače: nedokončená funkcia = žiadne tlačidlo (len text + ČOSKORO). Neaktívny vzhľad
  patrí výhradne neaktívnemu stavu, a musí zostať čitateľný. Stlačenie scale(0.97),
  len transform/opacity, ≤ 300 ms, rešpektuj prefers-reduced-motion. Hover ≠ vybraté.
- Formuláre: 12-stĺpcová mriežka, riadky zarovnané na vrch. Označujú sa len NEPOVINNÉ polia
  („(nepovinné)" v popiske); povinné bez značky, ale s `required`/`aria-required`.
  Žiadna hodnota „Žiadne" ako zástupná. Placeholder netvrdí menej než pravidlo pod poľom.
- Toast: jeden komponent, tmavý, dole v strede, ≥ 24 px nad hranou, bez osobných údajov,
  nesmie popierať text nad tlačidlom. Záväzné znenia sú v dokumente §6.
- Typografia a ikony: žiadne Inter/Roboto/Open Sans; ikony výhradne Phosphor
  (nie Lucide/Feather/Heroicons). Žiadne emoji, žiadne ťažké tiene.
- Pasce z §8 kontroluj vždy: štítok tvrdiaci stav, ktorý v dátach nie je; minimum vykreslené
  ako strop; globálne nastavenie pre údaj, ktorý je per program; ikona s dvomi významami;
  dve miesta na to isté prepínanie; sheet so živou spodnou lištou.

## Farby appky (z webovej aplikácie, projekt 90e61943-ad33-4cb2-9ffd-96f0e248eb03)
- primárna (akcent appky) bridlicová #455A74
- modrá z webu #2563B8, hover #1E4F94, soft #E8F0FB, deep #15396B — informačné plochy
- text #22303F, sekundárny #3B4C60, muted #6A7C90, faint #9AA8B7
- pozadie #F7F9FA, plocha #FFFFFF, rám #E2E8EB, neutrálna výplň #EEF2F5
- úspech #1F9D6B, soft #E6F4EE, text #157A52
- upozornenie #E0A500, soft #FBF1D8, text #8A6600
- chyba #DC4B4B, soft #FBEAEA, text #B23A3A

Žiadne nové farby mimo tejto palety; sémantické farby len sémanticky.
