# Beetplaner

Webansicht der Beetpläne für Handy und PC, veröffentlicht über GitHub Pages:
**https://apachler.github.io/pac-naturgarten-eberndorf/**

Direkt auf ein Jahr und eine Fläche springen: `…/#2026/west`, `…/#2027/ost`, `…/#2026/tomatenhaus`

Am Handy über „Zum Home-Bildschirm hinzufügen“ wie eine App nutzen.

Veröffentlicht wird bei jedem Push auf `main` vom Workflow `.github/workflows/pages.yml` (Pages-Quelle: „GitHub Actions“). Er stellt `index.html`, `beetplaner/` und `Gemüsegarten/` zusammen.

## Funktionen

- **Plan:** Draufsicht mit Norden oben, Raster alle 50 cm. Mit dem **Zeitregler** (in Wochenschritten) siehst du, was in einer Woche im Beet steht. Pflanze antippen zeigt Details, Ist-Stand, Prüfmeldungen und Kulturwissen.
  - *Ist-Stand:* zeigt die tatsächliche Lage (`ist:` mit punkte/reihen/bereich in plan.yaml) und den Status, dazu die tatsächliche Einteilung des Beets, falls erfasst (`flaechen.<id>.ist:` mit eigenen `zonen`/`wege`). Nicht Gepflanztes wird ausgeblendet, was noch im Beet steht, bleibt bis heute sichtbar.
  - *Alle Kulturen:* zeigt auch Kulturen, die zum gewählten Datum nicht im Beet stehen (blass)
  - *Vorjahr:* blendet ein, was beim letzten Anbau auf dieser Fläche stand (Fruchtfolge)
- **Über das Beet:** allgemeine Infos zur Fläche, Anbauhistorie aus allen Jahresplänen, offene Fragen und Gartendaten
- **Detailblatt:** Steckbrief der Art aus `kulturen.yaml` mit unseren Erfahrungen und erprobten Sorten
- **Kalender:** Gantt-Ansicht aller Kulturen über das Jahr bis März des Folgejahres
- **Liste:** Stückzahlen Plan, Wunsch und Ist sowie die Ernte
- **Naturjahreszeit:** zu jedem Datum die Naturjahreszeit in Eberndorf mit Zeigerpflanze, dazu die Aufgaben aus dem Gartenjahr von naturgarten.bio und unsere eigenen. Der Kalender hat ein Band mit den Naturjahreszeiten. Daten in `naturjahr.js`, Standort in `Gemüsegarten/Grundlagen/standort.yaml`.
- **Prüfung:** automatische Kontrolle des Plans. Antippen springt zu den betroffenen Pflanzen.

## Daten

Alle Daten liegen als YAML unter `Gemüsegarten/`. Der Beetplaner zeigt sie nur an.

| Datei | Inhalt |
|-------|--------|
| `Gemüsegarten/jahre.yaml` | Verzeichnis der Jahrespläne |
| `Gemüsegarten/<Jahr>/plan.yaml` | Plan eines Jahres: Flächen, Zonen, Wege, Pflanzungen, Ist-Stand |
| `Gemüsegarten/Grundlagen/kulturen.yaml` | **Datenquelle aller Gemüsearten**: Platz, Licht, Boden, Wurzel, Nährstoffe, Wasser, Frost, Termine, Nachbarn, Schädlinge, Küchenbedarf, Sorten, Erfahrungen |
| `Gemüsegarten/Grundlagen/familien.yaml` | Pflanzenfamilien mit Anbaupause (Fruchtfolge-Prüfung) |
| `Gemüsegarten/Grundlagen/flaechen.yaml` | Beete und Tomatenhaus: Maße, Ausrichtung, Boden, Aufbau, Rhythmus, Besonderheiten, offene Fragen |
| `Gemüsegarten/Grundlagen/standort.yaml` | Garten: Ort, Höhe, Klima, Wasser, Anzucht |
| `Gemüsegarten/Vorlagen/plan.yaml` | Vorlage für ein neues Jahr |

Koordinaten in cm, Ursprung = Südwest-Ecke, x nach Osten, y nach Norden. Das Format ist am Anfang von `2026/plan.yaml` beschrieben.

## Design

Der Beetplaner folgt dem Design-System von naturgarten.bio (`docs/DESIGN.md` im Repo `apachler/pacnaturgarten`):
- Farben als Tokens: Hintergrund #FAFAFA, Text #2D2D2D, Grün #4f7a00 als einziger Akzent, Secondary #B8D4A0 für Ränder und Chips, Notice-Farben für Hinweise
- Titel in Cormorant Garamond (heading-*-Skala), Text in Open Sans. Die Schriften liegen unter `fonts/` und stehen unter der SIL Open Font License.
- Karten und Boxen `rounded-xl` mit `border-secondary/30`, Chips als Pillen, Badges eine Farbe je Bedeutung, Hover nur auf Klickbarem

Die Farben und Symbole der Kulturen im Plan sind Daten (`kulturen.yaml`), keine UI-Farben.

## Prüfung

```bash
npm install
npm run pruefen          # alle Jahre
node beetplaner/pruefen.mjs 2027
```

Geprüft werden Stückzahlen gegen den Wunsch, Lage außerhalb des Beetes oder auf Wegen, Mindestabstände, schlechte Nachbarn, Platz für Vor- und Nachkulturen, frostempfindliche Kulturen vor den Eisheiligen und die Fruchtfolge (gleiche Pflanzenfamilie an derselben Stelle wie beim letzten Anbau). Die Prüfung läuft bei jedem Push als GitHub Action. Nur **Fehler** lassen sie scheitern, Warnungen und Hinweise nicht.

Die Prüflogik steckt in `modell.js` und wird vom Browser und vom Script gemeinsam genutzt.

## Tests

```bash
npm ci
npm run pruefen     # Pläne prüfen, Kulturdaten validieren, Kulturwissen.md aktuell?
npm run kulturwissen  # Kulturwissen.md aus kulturen.yaml/familien.yaml erzeugen
npm test            # Unit-Tests: Positionen, Stückzahlen, Prüfung, Fruchtfolge, Kulturdaten, Naturjahreszeiten
npm run test:e2e    # Browser-Tests (Playwright, Chrome) auf Handy, kleinem Handy und Desktop
```

Die Browser-Tests prüfen unter anderem:
- dass **jede Pflanze genau an der Position aus `plan.yaml` gezeichnet** wird, zurückgerechnet aus der SVG-Geometrie, für alle Jahre und Flächen
- Norden oben und Westen links
- Zeitregler, Naturjahreszeit, Detailblatt, Tabs, Liste, Kalender und Prüfung (gleiche Meldungen wie das Script)
- Ist-Stand, Vorjahr, Jahres- und Flächenwahl, Direktlinks
- dass nichts über den Bildschirmrand ragt
- eine verständliche Meldung, wenn Daten fehlen

In CI laufen Prüfung und Tests bei jedem Push. **GitHub Pages veröffentlicht nur, wenn alle Tests grün sind.**

js-yaml liegt als `vendor/js-yaml.mjs` (MIT) im Repo, der Planer braucht also kein CDN.

## Lokal ansehen

Die Seite lädt YAML-Dateien und muss deshalb über einen Webserver laufen, nicht per Doppelklick:

```bash
python3 -m http.server 8000   # im Repo-Hauptordner, dann http://localhost:8000
```
