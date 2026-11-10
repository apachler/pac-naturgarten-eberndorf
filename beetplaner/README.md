# Beetplaner

Webansicht der Beetpläne für Handy und PC, veröffentlicht über GitHub Pages:
**https://apachler.github.io/pac-naturgarten-eberndorf/**

Direkt auf ein Jahr und eine Fläche springen: `…/#2026/west`, `…/#2027/ost`, `…/#2026/tomatenhaus`

Am Handy über „Zum Home-Bildschirm hinzufügen“ wie eine App nutzen.

## Funktionen

- **Plan:** Draufsicht mit Norden oben, Raster alle 50 cm. Mit dem **Zeitregler** siehst du, was an einem Tag im Beet steht. Pflanze antippen zeigt Details, Ist-Stand, Prüfmeldungen und Kulturwissen.
  - *Ist-Stand:* färbt nach dem tatsächlichen Status, nicht gepflanzte Kulturen erscheinen als ✕
  - *Alle Kulturen:* zeigt auch Kulturen, die zum gewählten Datum nicht im Beet stehen (blass)
  - *Vorjahr:* blendet ein, was beim letzten Anbau auf dieser Fläche stand (Fruchtfolge)
- **Kalender:** Gantt-Ansicht aller Kulturen über das Jahr bis März des Folgejahres
- **Liste:** Stückzahlen Plan, Wunsch und Ist sowie die Ernte
- **Prüfung:** automatische Kontrolle des Plans. Antippen springt zu den betroffenen Pflanzen.

## Daten

Alle Daten liegen als YAML unter `Gemüsegarten/`. Der Beetplaner zeigt sie nur an.

| Datei | Inhalt |
|-------|--------|
| `Gemüsegarten/jahre.yaml` | Verzeichnis der Jahrespläne |
| `Gemüsegarten/<Jahr>/plan.yaml` | Plan eines Jahres: Flächen, Zonen, Wege, Pflanzungen, Ist-Stand |
| `Gemüsegarten/Grundlagen/kulturen.yaml` | Kulturdatenbank: Familie, Abstand, Höhe, Nachbarn, Frost … |
| `Gemüsegarten/Grundlagen/flaechen.yaml` | Dauerhafte Maße der Flächen (Beet West, Beet Ost, Tomatenhaus) |
| `Gemüsegarten/Vorlagen/plan.yaml` | Vorlage für ein neues Jahr |

Koordinaten in cm, Ursprung = Südwest-Ecke, x nach Osten, y nach Norden. Das Format ist am Anfang von `2026/plan.yaml` beschrieben.

## Prüfung

```bash
npm install
npm run pruefen          # alle Jahre
node beetplaner/pruefen.mjs 2027
```

Geprüft werden Stückzahlen gegen den Wunsch, Lage außerhalb des Beetes oder auf Wegen, Mindestabstände, schlechte Nachbarn, Platz für Vor- und Nachkulturen, frostempfindliche Kulturen vor den Eisheiligen und die Fruchtfolge (gleiche Pflanzenfamilie an derselben Stelle wie beim letzten Anbau). Die Prüfung läuft bei jedem Push als GitHub Action. Nur **Fehler** lassen sie scheitern, Warnungen und Hinweise nicht.

Die Prüflogik steckt in `modell.js` und wird vom Browser und vom Script gemeinsam genutzt.

## Lokal ansehen

Die Seite lädt YAML-Dateien und muss deshalb über einen Webserver laufen, nicht per Doppelklick:

```bash
python3 -m http.server 8000   # im Repo-Hauptordner, dann http://localhost:8000
```
