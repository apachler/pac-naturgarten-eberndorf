---
name: jahresplanung
description: Neues Gartenjahr anlegen und den Mischkultur-Beetplan erstellen – Vorlagen kopieren, Pflanzwünsche und Küchenbedarf klären, Fruchtfolge und Beetwechsel West/Ost beachten, jede Pflanze mit Position in plan.yaml, Prüfung grün, Naturjahreszeiten. Verwenden, wenn Andreas das nächste Gartenjahr planen oder einen Plan überarbeiten will.
---

# Jahresplanung

1. **Lesen:** die ganze Leseliste aus `CLAUDE.md`, besonders Vorjahr (`plan.yaml`, `Rueckmeldung.md`, `Wetter.md`), die
   `Merkliste.md` (Punkte für dieses Jahr ansprechen) und `flaechen.yaml` (welches Beet ist dran, welches ruht).
2. **Jahr anlegen** (falls neu): `Gemüsegarten/<Jahr>/` aus `Gemüsegarten/Vorlagen/` (`Jahres-README.md` → `README.md`,
   `Planungsauftrag.md`, `plan.yaml`); in `Gemüsegarten/jahre.yaml` und in die Tabelle von `Gemüsegarten/README.md` eintragen.
3. **Auftrag klären** und in `Planungsauftrag.md` festhalten: Kulturen, gewünschte Stückzahlen (`wunsch:`), Küchenbedarf
   (`bedarf` in `kulturen.yaml`), was weggelassen oder reduziert wird (Erfahrungen der Vorjahre!), Sorten, Anzucht im Heizraum.
   Fehlende Arten zuerst mit `/kultur-neu` anlegen.
4. **Fruchtfolge:** welches Beet trug im Vorjahr was (inkl. `ist:`-Lage)? Familien mit Anbaupause aus `familien.yaml` meiden;
   Starkzehrer dorthin, wo vorher Gründüngung/Ruhe war.
5. **Plan erstellen** in `<Jahr>/plan.yaml`: Haupt-, Vor- und Nachkulturen mit Zeitraum (`von`/`bis`), Position als
   `punkte`/`reihen` (cm, Ursprung SW), `je` bei Horsten, Wege freihalten. Gute Nachbarn nebeneinander, schlechte trennen,
   Hohes nach Norden, Beikräuter/Blühpflanzen für Nützlinge. Termine auch als Naturjahreszeit mit Zeigerpflanze
   (Eberndorf ≈ 10 Tage früher als DWD-Mittel; `beetplaner/naturjahr.js`).
6. **Prüfen:** `npm run pruefen` – jeden Fehler beheben; jede Warnung beheben oder mit `begruendung:` erklären. Konflikte
   Andreas begründet zur Entscheidung vorlegen, nichts still weglassen.
7. **Ansehen:** `npm start` → http://localhost:4173 (Plan, Kalender, Wochenregler, Prüfung) – oder nach dem Push auf Pages.
8. **Abschluss:** `npm test`, Zusammenfassung in `<Jahr>/README.md`, Commit „Planung <Jahr>: …“ ohne Attribution.
