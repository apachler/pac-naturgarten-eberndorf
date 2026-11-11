# Naturgarten Eberndorf – Hinweise für Claude Code

Dieses Repo ist das Langzeitgedächtnis für die Gemüsegarten-Planung von Andreas (Naturgarten Eberndorf,
Kärnten). Jede neue Session beginnt ohne Vorwissen – alles Wichtige steht hier im Repo.

## Jahreszyklus

Winter: Rückmeldung zum Vorjahr (mit Wetter) → Planung des neuen Jahres (Beete West/Ost wechseln sich
zwischen Anbau und Ruhe ab) → Saison mit Notizen → wieder Rückmeldung. Details: `Gemüsegarten/Grundlagen/Planungszyklus.md`.

## Zu Beginn jeder Gemüsegarten-Session lesen

1. `Gemüsegarten/Grundlagen/Standort-und-Beete.md` – Standort, Boden, Beete, Fruchtfolge, Ressourcen
2. `Gemüsegarten/Grundlagen/Planungszyklus.md` – wie geplant und ausgewertet wird
3. `Gemüsegarten/Grundlagen/Erfahrungen.md` – artübergreifende Erkenntnisse aus früheren Jahren
4. `Gemüsegarten/Grundlagen/Kulturwissen.md` – Steckbriefe aller Gemüsearten mit unseren Erfahrungen (erzeugt)
5. `Gemüsegarten/Grundlagen/Merkliste.md` – Erinnerungen; passende Punkte von sich aus ansprechen
6. `Gemüsegarten/Grundlagen/Naturgarten-bio.md` – Naturjahreszeiten, Gartenjahr, Mondgarten, Prinzipien von naturgarten.bio
7. Den Ordner des **Vorjahres** (`plan.yaml`, `Rueckmeldung.md`, `Wetter.md`) und ggf. den des aktuellen Jahres

## Sprache und Form

- Auf Deutsch antworten (Du-Form), österreichische Gemüsenamen (Paradeiser, Karfiol, Fisolen, Kohlsprossen, Vogerlsalat …).
- Alle Dokumente als Markdown, keine Office-Formate.

## Eine Datenquelle je Thema (SSOT)

| Was | Wo |
|---|---|
| alles zu einer Gemüseart (Platz, Licht, Boden, Wasser, Frost, Termine, Nachbarn, Schädlinge, Sorten, **Erfahrungen nach Jahr**) | `Gemüsegarten/Grundlagen/kulturen.yaml` |
| Pflanzenfamilien mit Anbaupause | `Gemüsegarten/Grundlagen/familien.yaml` |
| Schädlinge und Krankheiten mit Steckbrief (erkennen, vorbeugen, handeln, Erfahrungen) | `Gemüsegarten/Grundlagen/schaedlinge.yaml` |
| Beete West/Ost und Tomatenhaus | `Gemüsegarten/Grundlagen/flaechen.yaml` |
| Garten (Ort, Klima, Wasser, Anzucht) | `Gemüsegarten/Grundlagen/standort.yaml` |
| Klimamittel 1991–2020 für Eberndorf (erzeugt mit `npm run wetter -- --klimamittel`) | `Gemüsegarten/Grundlagen/klima.yaml` |
| Messwerte eines Jahres (erzeugt mit `npm run wetter -- <Jahr>`) | Abschnitt in `Gemüsegarten/<Jahr>/Wetter.md` |
| beschlossene Ausbau-Ideen für Beetplaner und Werkzeuge | `Ausbauplan.md` |
| was in einem Jahr wo geplant war und tatsächlich stand | `Gemüsegarten/<Jahr>/plan.yaml` |
| Liste der Jahre | `Gemüsegarten/jahre.yaml` (+ Tabelle in `Gemüsegarten/README.md`) |
| artübergreifende Erkenntnisse | `Gemüsegarten/Grundlagen/Erfahrungen.md` |
| Erinnerungen für später | `Gemüsegarten/Grundlagen/Merkliste.md` |

- `Kulturwissen.md` wird mit `npm run kulturwissen` erzeugt – **nie von Hand bearbeiten**; CI scheitert, wenn sie nicht aktuell ist.
- Nichts doppelt pflegen. Neue Kulturen zuerst in `kulturen.yaml` anlegen, dann im Plan verwenden.
- **Beetpläne sind Daten:** angezeigt vom Beetplaner (`index.html` + `beetplaner/`, https://apachler.github.io/pac-naturgarten-eberndorf/).
  Keine eigenen HTML-/JSX-Beetpläne pro Jahr bauen. Format: `beetplaner/README.md`.
- Jahresordner sind Archiv: nur für Korrekturen ändern. Was über ein Jahr hinaus gilt, wandert nach `kulturen.yaml` bzw. `Erfahrungen.md` (mit Jahr als Quelle).

## Im Sinne von naturgarten.bio planen

Termine zusätzlich als Naturjahreszeit mit Zeigerpflanze (Eberndorf ca. 10 Tage vor dem DWD-Mittel), Bodenleben/No-Dig,
Mischkultur, Regenwasser, Kreislauf und Biodiversität; Mondgarten nur als optionale Feinabstimmung.
Quelle ist `apachler/pacnaturgarten` – **nur lesen**, dort gelten eigene Regeln (nie pushen). Ändert sich dort etwas,
`beetplaner/naturjahr.js` und `Grundlagen/Naturgarten-bio.md` nachziehen.

## Planen

- Aktiv auf Probleme hinweisen (Platz, Nachbarschaften, Fruchtfolge) und bei Konflikten begründet priorisieren, statt still wegzulassen.
- Pläne müssen 1:1 umsetzbar sein: jede Pflanze mit Position (X/Y in cm, Ursprung Südwest-Ecke, x nach Osten, y nach Norden),
  alle Stückzahlen vollständig, auch Vor- und Nachkulturen möglichst als Punkte oder Reihen.
- Annahmen (z. B. geschätzte Abstände) offen in `notiz:` oder `begruendung:` festhalten, nie als Tatsache.

## Prüfen

| Bereich | Befehl |
|---|---|
| Plan- und Kulturdaten | `npm ci && npm run pruefen && npm test` – Fehler beheben, Warnungen beheben oder mit `begruendung:` erklären |
| Beetplaner (`index.html`, `beetplaner/`) | zusätzlich `npm run test:e2e` (Playwright, Chrome; Handy 390/360 px und Desktop) |

GitHub Actions prüft jeden Push (`beetplan-pruefen`); Pages veröffentlicht `main` nur bei grünen Tests.

## Git

- Commits kurz und aussagekräftig auf Deutsch, z. B. „Rückmeldung 2026: Wetter ergänzt“.
- **Keine Attribution von Claude** in Commits oder PR-Beschreibungen: keine
  `Co-Authored-By`-Trailer, keine „Generated with …“-Fußzeilen, keine Session-Links, kein Assistent als
  Autor. Sie sind in `.claude/settings.json` abgeschaltet; der Workflow `attribution` lehnt sie zusätzlich ab.
- Git-Identität ist die des Menschen, der arbeitet; ohne Identität setzt `tools/set-git-identity.sh` (SessionStart-Hook) die des Repo-Owners.
- **Nie** `git push --force`, `git push --delete` oder Historie auf `main` umschreiben, außer Andreas sagt es ausdrücklich.
- Nie Zugangsdaten, Schlüssel oder private Daten committen (das Repo ist öffentlich).

## Am Ende einer Session

Kurze Zusammenfassung in die `README.md` des betroffenen Jahres schreiben; neue Erinnerungen in die Merkliste.

## Skills, Regeln und Hooks

Skills für die wiederkehrenden Abläufe (`.claude/skills/`):

| Skill | Wofür |
|---|---|
| `/rueckmeldung` | Rückmeldung zu einem Gartenjahr: Ist-Stand in `plan.yaml`, Erfahrungen je Art, Wetter recherchieren, Merkliste |
| `/jahresplanung` | neues Jahr aus den Vorlagen anlegen und den Beetplan mit Positionen erstellen und prüfen |
| `/saison-notiz` | kurze Beobachtung während der Saison festhalten (Aussaat, Ernte, Schädling, Wetter); holt auch die Notizen vom Handy (GitHub-Issues „Saisonnotiz …“ aus dem Beetplaner) |
| `/kultur-neu` | neue Gemüseart oder Sorte in `kulturen.yaml` anlegen |

Regeln je Bereich (`.claude/rules/`, werden beim Arbeiten an passenden Dateien geladen):
`gemuesegarten-daten.md` (alles unter `Gemüsegarten/`) und `beetplaner.md` (Viewer, Tests, Design).

Hooks (`.claude/settings.json`):
- **SessionStart** (`tools/session-start.sh`) setzt die Git-Identität und führt `npm ci` aus, falls `node_modules` fehlt.
- **PostToolUse** nach jeder Änderung an einer YAML-Datei unter `Gemüsegarten/`: erzeugt `Kulturwissen.md` neu (bei
  `kulturen`/`familien`/`standort.yaml`) und führt die Prüfung aus; Fehler kommen sofort zurück
  (`.claude/hooks/nach-datenaenderung.mjs`). Voraussetzung: `npm ci` wurde einmal ausgeführt.

`git push` fragt vorher nach; Force-Push und Löschen von Branches sind gesperrt.
