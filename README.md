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
│   └── Erfahrungen.md
├── Vorlagen/              Kopiervorlagen für jedes neue Jahr
│   ├── Rueckmeldung.md
│   ├── Planungsauftrag.md
│   └── Jahres-README.md
└── <Jahr>/                Ein Ordner pro Gartenjahr (z. B. 2026)
```

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
