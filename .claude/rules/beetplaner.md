---
paths:
  - "index.html"
  - "beetplaner/**"
  - "tests/**"
  - "playwright.config.mjs"
  - ".github/workflows/**"
---

# Beetplaner (Viewer auf GitHub Pages)

- Reines HTML/CSS/JS-Modul ohne Build-Schritt; einzige Laufzeit-Abhängigkeit ist das mitgelieferte
  `beetplaner/vendor/js-yaml.mjs`. Keine CDNs, keine externen Fonts, kein Tracking. Einzige externe Anfrage ist die
  Wettervorhersage von Open-Meteo (ohne Schlüssel und Cookies); E2E-Tests simulieren sie (`wetterSimulieren`).
- Gemeinsame Logik (Positionen, Datum, Prüfung) steht in `beetplaner/modell.js` und läuft im Browser und in Node –
  dort ändern, nicht doppelt im Viewer oder in `pruefen.mjs`.
- Design nach naturgarten.bio (`docs/DESIGN.md` in `apachler/pacnaturgarten`): nur die Farb-Tokens aus `style.css`,
  Cormorant Garamond für Titel, Open Sans für Text, `rounded-xl`, Grün als einziger Akzent, Hover nur auf Klickbarem.
- Mobil zuerst: nichts darf auf 360 px oder 390 px horizontal überlaufen (der E2E-Test prüft jedes Element).
- Neue Funktionen bekommen einen Unit-Test (`tests/*.test.mjs`) bzw. einen E2E-Test (`tests/e2e/`). Vorher prüfen, dass
  der Test ohne die Änderung fehlschlägt.
- Fertig erst, wenn `npm run pruefen`, `npm test` und `npm run test:e2e` grün sind.
- Pages-Workflow kopiert nur `index.html`, `.nojekyll`, `beetplaner/` und `Gemüsegarten/`; neue Laufzeitdateien dort ergänzen.
