# Gemüsegarten 2026 – Mischkultur-Beetplanung

**Aktives Beet:** West · **Ruhebeet:** Ost

Standort, Boden und Fruchtfolge: siehe [Grundlagen](../Grundlagen/Standort-und-Beete.md).

**Status:** Hauptkulturen abgeerntet, Wintergemüse steht noch. Die [Rückmeldung](Rueckmeldung.md) ist begonnen (Zwischenstand 10.11.) und ist die Grundlage für die Planung 2027.

## Dateien in diesem Ordner

| Datei | Inhalt |
|-------|--------|
| [plan.yaml](plan.yaml) | Plan 2026 mit Ist-Stand als Daten – ansehen im [Beetplaner](https://apachler.github.io/pac-naturgarten-eberndorf/#2026/west) |
| [Rueckmeldung.md](Rueckmeldung.md) | Auswertung der Saison 2026 |
| [Wetter.md](Wetter.md) | Wetterrückblick 2026 für Eberndorf und Kärnten (recherchiert) |
| [Planungsauftrag.md](Planungsauftrag.md) | Ausgangs-Prompt mit Standort, Beet-Rahmenbedingungen, Pflichtaufgaben und der vollständigen Pflanzenliste |
| [Mischkultur-Beetplanung.md](Mischkultur-Beetplanung.md) | Das Planungsdokument als Markdown (aus der Word-Datei konvertiert) |
| [Mischkultur-Beetplanung.docx](Mischkultur-Beetplanung.docx) | Originales Planungsdokument (Word, ca. 12 Seiten) |
| [Beetplan-Visualisierung.html](Beetplan-Visualisierung.html) | Interaktiver Beetplan – per Doppelklick im Browser öffnen (lädt React, Babel und Tailwind über CDN, beim ersten Öffnen ist Internet nötig) |
| [Beetplan-Interaktiv.jsx](Beetplan-Interaktiv.jsx) | React-Quellcode des interaktiven Beetplans (Version, die als Artifact angezeigt wurde) |
| [Beetplan-Visualisierung.jsx](Beetplan-Visualisierung.jsx) | Erste React-Version des Beetplans |

## Zusammenfassung der Planungssession

### Ausgangslage

- **Wunschliste:** 12 Hauptkulturen, 11 Vor-/Nachkulturen, 4 Beikräuter (Details im Planungsauftrag)
- Rahmenbedingungen siehe [Grundlagen](../Grundlagen/Standort-und-Beete.md)

### Ergebnis der Platzanalyse

Von 15 m² bleiben nach zwei 30-cm-Pflegepfaden rund **12 m² Pflanzfläche**. Die Hauptkulturen allein brauchen etwa **13,3 m²** – die Liste ist also um ca. 1,3 m² zu groß.

### Entscheidungen zur Optimierung

- **Kohlsprossen:** von 6 auf 4 reduziert (Platz und geringerer Schädlingsdruck durch viele Kohlgewächse)
- **Gurken:** vertikal an Schnüren gezogen, spart ca. 1 m²
- **Knollensellerie:** enger gesetzt (35 statt 40 cm)
- **Beinwell:** an den äußeren Nordrand außerhalb der Pflanzfläche, als Mulch- und Jauchelieferant
- **Karotten + Sommerlauch** als Mischkultur in Wechselreihen (gegenseitiger Schutz vor Möhrenfliege und Lauchmotte)
- Vor- und Nachkulturen teilen sich die Fläche zeitlich versetzt mit den Hauptkulturen

### Beetaufteilung (Nord → Süd)

| Zone | Tiefe | Kulturen |
|------|-------|----------|
| A | 100 cm | Feuerbohnen (5 Stangen) + Bohnenkraut |
| Weg 1 | 30 cm | Pflegepfad |
| B | 80 cm | Kohlsprossen, Gurken (vertikal), Knollensellerie |
| Weg 2 | 30 cm | Pflegepfad |
| C | 100 cm | Paprika, Pfefferoni, Mangold, Stangensellerie |
| D | 80 cm | Karotten + Sommerlauch + Dill |
| E | 80 cm | Rote Rüben, Kohlrabi, Ringelblumen |

Exakte Pflanzpositionen (X/Y in cm, Ursprung Südwest-Ecke) und der vollständige Pflanzkalender stehen im [Planungsdokument](Mischkultur-Beetplanung.md).

### Verlauf der Session

1. Planungsauftrag und Pflanzenliste übergeben
2. Planungsdokument (Word) und interaktiver Beetplan (React/JSX) erstellt
3. Beetplan als interaktives Artifact angezeigt
4. JSX in eine eigenständige HTML-Datei konvertiert, die lokal im Browser läuft

### Offene Punkte zum Nachprüfen

Beim Ablegen fiel auf, dass einige Anforderungen aus dem Planungsauftrag noch nicht vollständig erfüllt sind:

- **Pflegetipps:** Das Dokument enthält ausführliche Tipps nur für die Beikräuter, nicht für jede Gemüsekultur.
- **Sommerlauch:** Im Positionsplan Zone D sind 2 × 7 = 14 Lauchpflanzen eingetragen, gewünscht waren 20.
- **Knollensellerie:** Im Positionsplan Zone B sind nur 9 der 10 Positionen angegeben.
- **Permakulturelle Symbol-Skizze** (Punkt 7 des Auftrags) wurde nicht erstellt.
- **Vor-/Nachkulturen** sind Zonen zugeordnet, haben aber noch keine exakten Einzelpositionen.

## Sessions

- 2026-11-10: Planungsunterlagen ins Repo übernommen. Allgemeine Informationen nach `Grundlagen/` verschoben, Vorlagen für die Folgejahre angelegt, Rückmeldung 2026 vorbereitet.
- 2026-11-10: Beete benannt (West = Anbau 2026, Ost = Ruhe 2026). Knoblauch und Zwiebeln Ende Oktober im Beet West gesteckt. Erfahrung mit den Flower Sprouts 2025 im Beet Ost festgehalten.
- 2026-11-10: Rückmeldung zu Karotten, Beikräutern und Sorten (Knoblauch 'Therador', Wintersteckzwiebel 'Shakespeare') ergänzt. Wetterrückblick 2026 recherchiert. Regel eingeführt: Zu jeder Rückmeldung gehört ein `Wetter.md`.
- 2026-11-10: Gesamteindruck 2026 eingetragen: zu früh gepflanzt, Mengen bei Sellerie, Mangold, Paprika, Pfefferoni und Kohlsprossen zu groß, Erfahrungen zu Gurken, Lauch, Roten Rüben und Feuerbohnen. Erkenntnisse in die Grundlagen übernommen.
- 2026-11-10: Tomatenhaus und Wasserverbrauch (ca. 3000 L) erfasst. Merkliste für 2027 angelegt (u. a. Fotos von den Paprika-Fraßschäden, Wühlmausschutz).
- 2026-11-10: Beetplaner gebaut (GitHub Pages) und Plan 2026 als `plan.yaml` erfasst. Die Prüfung deckt die Planungsfehler 2026 auf: Vor- und Nachkulturen hatten zeitlich keinen Platz, außerdem fehlten Pflanzen und Abstände waren zu klein.
- 2026-11-10: naturgarten.bio eingebunden: Naturjahreszeiten für Eberndorf, Gartenjahr, Mondgarten, Jahreskreis als Takt des Planungszyklus. Der Beetplaner zeigt die Naturjahreszeit und die Aufgaben dazu.
- 2026-11-10: Beetplaner im Design von naturgarten.bio. Positionen mit dem Positionsplan 2026 abgeglichen (Ringelblumen auf Y 20 korrigiert). Unit- und Browser-Tests eingerichtet, Pages veröffentlicht nur bei grünen Tests.
- 2026-11-10: Zeitregler in Wochenschritten. Tatsächliche Lage 2026 (Feuerbohnen, Kohlrabi, Winterlauch, Endivie, Chinakohl, Zwiebeln, Knoblauch) als Ist-Positionen erfasst. Idee für 2027: 4 Bohnenstangen.
- 2026-11-10: Datenquelle für alle Gemüsearten (`kulturen.yaml` mit Erfahrungen und Sorten, `familien.yaml` mit Anbaupausen); `Kulturwissen.md` wird daraus erzeugt. Flächen als Datenquelle, der Beetplaner zeigt „Über das Beet“.
- 2026-11-10: Tomatenhaus genau beschrieben (Bauweise, Boden, 2 Reihen à 4 Paradeiser, Basilikum, Petersilie; Ollas für 2027 in der Merkliste).
- 2026-11-10: Arbeitsweise für Claude Code nach dem Vorbild von violetveinsmp: Skills `/rueckmeldung`, `/jahresplanung`, `/saison-notiz`, `/kultur-neu`, Bereichsregeln, Hook für Kulturwissen und Prüfung, keine Assistenten-Attribution in Commits.
- 2026-11-10: Tatsächliche Einteilung von Beet West erfasst: Zone A (Feuerbohnen am Nordrand) nur ca. 50 cm tief, die gewonnenen 50 cm gingen an Zone B (+30) und C (+20); Positionen dort als Annahme neu verteilt. Der Beetplaner zeigt im Ist-Stand die tatsächlichen Zonen und Wege. Nur noch Claude Code als Assistent (`AGENTS.md` in `CLAUDE.md` aufgegangen).
- 2026-11-10: Tatsächliche Pflanzenanzahlen eingetragen (`ist.anzahl` und Tabelle in der Rückmeldung). Feuerbohnen 5 Stangen à 5; in Zone B und C die Ist-Positionen an die Anzahlen angepasst (weiterhin Annahme). Die Prüfung meldet jetzt, wenn Pflanzen tatsächlich enger standen als empfohlen (Kohlsprossen).
