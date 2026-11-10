# PAC Naturgarten Eberndorf

Dauerhafte Planung und Dokumentation unseres Naturgartens in Eberndorf (Südkärnten), gestaltet nach den Ansätzen der PAC Natur&Garten – Gemeinschaft der lebendigen Erde.

Der Schwerpunkt dieses Repos ist der **Gemüsegarten**: Jedes Jahr wird hier das aktive Heubeet geplant, nach der Saison ausgewertet und daraus das Folgejahr abgeleitet.

## Aufbau

```text
Gemüsegarten/
├── README.md              Übersicht und Jahresliste
├── Grundlagen/            Jahresübergreifendes Wissen (zuerst lesen!)
│   ├── Standort-und-Beete.md
│   ├── Planungszyklus.md
│   ├── Kulturwissen.md
│   ├── Erfahrungen.md
│   ├── Merkliste.md
│   ├── Naturgarten-bio.md  Was von naturgarten.bio in die Planung einfließt
│   ├── standort.yaml       Koordinaten und Höhe für die Naturjahreszeiten
│   ├── kulturen.yaml       Datenquelle aller Gemüsearten inkl. Erfahrungen und Sorten
│   ├── familien.yaml       Pflanzenfamilien und Anbaupausen
│   └── flaechen.yaml       Beete und Tomatenhaus (Maße, Boden, Aufbau, Rhythmus)
├── jahre.yaml             Verzeichnis der Jahrespläne
├── Vorlagen/              Kopiervorlagen für jedes neue Jahr
│   ├── Rueckmeldung.md
│   ├── Planungsauftrag.md
│   ├── Wetter.md
│   ├── plan.yaml
│   └── Jahres-README.md
└── <Jahr>/                Ein Ordner pro Gartenjahr (z. B. 2026), mit plan.yaml
beetplaner/                Webansicht (GitHub Pages) und Prüf-Script
index.html                 Startseite des Beetplaners
tests/                     Unit- und Browser-Tests (npm test, npm run test:e2e)
CLAUDE.md                  Arbeitsweise für Claude Code
.claude/                   Skills, Regeln und Hooks für Claude Code
```

## Beetplaner

Die Beetpläne lassen sich am Handy und am PC ansehen: **https://apachler.github.io/pac-naturgarten-eberndorf/**
Der Beetplaner bietet Draufsicht mit Zeitregler, Kalender, Stückzahlen, Ist-Stand und eine automatische Prüfung. Details stehen in [beetplaner/README.md](beetplaner/README.md).

## Mit Claude Code weiterarbeiten

Einfach eine Session in diesem Repo starten – die Regeln stehen in [CLAUDE.md](CLAUDE.md), beim Start werden die
Git-Identität gesetzt und die Abhängigkeiten installiert. Für die wiederkehrenden Abläufe gibt es Befehle:

| Befehl | Wann |
|---|---|
| `/rueckmeldung` | Herbst/Winter: wie war das Gartenjahr? (inkl. Wetterrückblick) |
| `/jahresplanung` | Winter: das nächste Jahr planen |
| `/saison-notiz` | zwischendurch: „heute Kohlrabi geerntet“, „Raupen am Kohl“ |
| `/kultur-neu` | eine neue Gemüseart oder Sorte aufnehmen |

Nach jeder Datenänderung prüft ein Hook automatisch den Plan und erzeugt das Kulturwissen neu.

## Der Jahreszyklus in Kürze

1. **Winter – Rückmeldung:** Das vergangene Jahr wird in `<Jahr>/Rueckmeldung.md` ausgewertet (Ernte, Krankheiten, Platzprobleme, Wetter …).
2. **Winter – Planung:** Aus Vorjahresplan, Rückmeldung, Grundlagen und neuen Wünschen entsteht der Plan für das neue Jahr im Ordner `<Jahr+1>/`.
3. **Lernen:** Was sich jahresübergreifend bestätigt, wandert in `Gemüsegarten/Grundlagen/`.
4. **Saison:** Umsetzung, Beobachtungen laufend notieren.

Details: [Gemüsegarten/Grundlagen/Planungszyklus.md](Gemüsegarten/Grundlagen/Planungszyklus.md)

## Konventionen

- Sprache: Deutsch, österreichische Gemüsenamen (Rote Rüben, Kohlsprossen, Vogerlsalat, Pfefferoni …)
- Dokumente in **Markdown**, keine Office-Formate
- Maße in cm, Positionen als X/Y mit Ursprung in der Südwest-Ecke des Beetes
- Zeitangaben relativ und jahresunabhängig („Mitte März“, „nach den Eisheiligen“)
