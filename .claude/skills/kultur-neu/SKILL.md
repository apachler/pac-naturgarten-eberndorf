---
name: kultur-neu
description: Neue Gemüseart, Kräuter- oder Blühpflanze oder eine neue Sorte in Gemüsegarten/Grundlagen/kulturen.yaml anlegen – alle Pflichtfelder mit belegten Werten, Familie, Nachbarn, Naturjahreszeit – damit sie im Beetplan und im Kulturwissen verwendet werden kann. Verwenden, wenn eine Pflanze geplant werden soll, die es in kulturen.yaml noch nicht gibt, oder eine neue Sorte dazukommt.
---

# Neue Kultur oder Sorte

1. Prüfen, ob es die Art schon gibt (`grep` nach Name und botanischem Namen in `kulturen.yaml`). Gibt es sie, nur die
   **Sorte** unter `sorten:` ergänzen (`{ name, quelle, jahr, ergebnis }` – Ergebnis erst nach der Saison) und fertig.
2. **Schlüssel** wählen: klein, ohne Umlaute, mit `_` (z. B. `pak_choi`, `kohlrabi_frueh` für eigene Sätze).
3. Eine ähnliche Art als Muster nehmen und alle Felder ausfüllen (Pflichtfelder: `PFLICHTFELDER` in `beetplaner/modell.js`):
   Name (österreichisch), botanisch, familie (muss in `familien.yaml` stehen – sonst dort zuerst ergänzen), symbol, farbe,
   rollen, abstand/reihe/hoehe, licht, boden, wurzel, zehrer, wasser, frost, anbau, aussaat/pflanzung, naturjahreszeit,
   ernte, gut/schlecht (nur vorhandene Schlüssel), schaedlinge, krankheiten, bedarf, hinweis.
4. **Werte belegen:** Faustwerte aus seriösen Quellen (z. B. Bio Austria, Arche Noah, Reinsaat, LK Österreich); im `hinweis`
   kurz die Quelle. Termine für Eberndorf (≈ 10 Tage früher als DWD-Mittel) und als Naturjahreszeit. Nichts erfinden –
   Unsicheres als solches kennzeichnen.
5. Nachbarschaften beidseitig prüfen: steht die neue Art bei anderen unter `schlecht`, auch hier eintragen.
6. Der Hook erzeugt `Kulturwissen.md` und prüft; sonst `npm run kulturwissen && npm run pruefen && npm test`.
7. Commit „Kultur: <Name> angelegt“ ohne Attribution.
