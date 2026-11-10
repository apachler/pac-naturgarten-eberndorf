# Naturgarten Eberndorf – Claude Code

@AGENTS.md

## Speziell für Claude Code

Skills für die wiederkehrenden Abläufe (`.claude/skills/`):

| Skill | Wofür |
|---|---|
| `/rueckmeldung` | Rückmeldung zu einem Gartenjahr: Ist-Stand in `plan.yaml`, Erfahrungen je Art, Wetter recherchieren, Merkliste |
| `/jahresplanung` | neues Jahr aus den Vorlagen anlegen und den Beetplan mit Positionen erstellen und prüfen |
| `/saison-notiz` | kurze Beobachtung während der Saison festhalten (Aussaat, Ernte, Schädling, Wetter) |
| `/kultur-neu` | neue Gemüseart oder Sorte in `kulturen.yaml` anlegen |

Regeln je Bereich (`.claude/rules/`, werden beim Arbeiten an passenden Dateien geladen):
`gemuesegarten-daten.md` (alles unter `Gemüsegarten/`) und `beetplaner.md` (Viewer, Tests, Design).

Hooks (`.claude/settings.json`):
- **SessionStart** (`tools/session-start.sh`) setzt die Git-Identität und führt `npm ci` aus, falls `node_modules` fehlt.
- **PostToolUse** nach jeder Änderung an einer YAML-Datei unter `Gemüsegarten/`: erzeugt `Kulturwissen.md` neu (bei
  `kulturen`/`familien`/`standort.yaml`) und führt die Prüfung aus; Fehler kommen sofort zurück
  (`.claude/hooks/nach-datenaenderung.mjs`). Voraussetzung: `npm ci` wurde einmal ausgeführt.

`git push` fragt vorher nach; Force-Push und Löschen von Branches sind gesperrt.
