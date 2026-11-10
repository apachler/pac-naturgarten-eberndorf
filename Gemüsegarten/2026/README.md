# Gemüsegarten 2026 – Mischkultur-Beetplanung

**Aktives Beet:** Beet 1 · **Ruhebeet:** Beet 2

Standort, Boden und Fruchtfolge: siehe [Grundlagen](../Grundlagen/Standort-und-Beete.md).

**Status:** Saison abgeschlossen. Als Nächstes [Rueckmeldung.md](Rueckmeldung.md) ausfüllen, als Grundlage für die Planung 2027.

## Dateien in diesem Ordner

| Datei | Inhalt |
|-------|--------|
| [Rueckmeldung.md](Rueckmeldung.md) | Auswertung der Saison 2026, geplante Mengen sind schon eingetragen |
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
