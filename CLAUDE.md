# Hinweise für Claude

Dieses Repo ist das Langzeitgedächtnis für die Gemüsegarten-Planung von Andreas (Naturgarten Eberndorf, Kärnten). Jede neue Session beginnt ohne Vorwissen – alles Wichtige steht hier im Repo.

## Zu Beginn jeder Gemüsegarten-Session lesen

1. `Gemüsegarten/Grundlagen/Standort-und-Beete.md` – Standort, Boden, Beete, Fruchtfolge, Ressourcen
2. `Gemüsegarten/Grundlagen/Planungszyklus.md` – wie geplant und ausgewertet wird
3. `Gemüsegarten/Grundlagen/Erfahrungen.md` – bestätigte Erkenntnisse aus früheren Jahren
4. `Gemüsegarten/Grundlagen/Kulturwissen.md` – Abstände, Termine, Nachbarschaften
5. `Gemüsegarten/Grundlagen/Merkliste.md` – Erinnerungen; passende Punkte von sich aus ansprechen
6. Den Ordner des **Vorjahres** (Plan + `Rueckmeldung.md`) und ggf. den des aktuellen Jahres

## Arbeitsweise

- Auf Deutsch antworten (Du-Form), österreichische Gemüsenamen verwenden.
- Alle Dokumente als Markdown anlegen, keine Office-Formate.
- **Beetpläne sind Daten:** Der Plan eines Jahres steht in `Gemüsegarten/<Jahr>/plan.yaml` (Positionen, Zeiträume, Ist-Stand). Kulturwerte stehen in `Grundlagen/kulturen.yaml`, Flächenmaße in `Grundlagen/flaechen.yaml`. Die Anzeige übernimmt der Beetplaner (`index.html` + `beetplaner/`, GitHub Pages: https://apachler.github.io/pac-naturgarten-eberndorf/). Keine eigenen HTML- oder JSX-Beetpläne pro Jahr mehr bauen. Format: `beetplaner/README.md`.
- Nach jeder Änderung an Plan- oder Kulturdaten `npm install && npm run pruefen` ausführen und Warnungen beheben oder begründen (`begruendung:` in der Pflanzung). Neue Kulturen zuerst in `kulturen.yaml` anlegen.
- Rückmeldungen auch in `plan.yaml` unter `ist:` nachtragen (Status, Anzahl, Ernte, Notiz).
- Beim Planen aktiv auf Probleme hinweisen (Platz, Nachbarschaften, Fruchtfolge) und bei Konflikten begründet priorisieren, statt still wegzulassen.
- Pflanzpläne müssen 1:1 umsetzbar sein: jede Pflanze mit Position (X/Y in cm, Ursprung Südwest-Ecke) und alle gewünschten Stückzahlen vollständig. Auch Vor- und Nachkulturen möglichst als Punkte oder Reihen statt als Bereich. Die Prüfung kontrolliert Stückzahl, Abstand, Nachbarn, Platz, Frost und Fruchtfolge.
- Neue Jahre aus `Gemüsegarten/Vorlagen/` anlegen (inkl. `plan.yaml`) und in `Gemüsegarten/jahre.yaml` eintragen.
- **Regel für Rückmeldungen:** Zu jeder Jahres-Rückmeldung das Wetter des Jahres für Eberndorf/Kärnten recherchieren (GeoSphere Austria, BMLUK-Monatsberichte „Wasserhaushalt Österreich“ mit Grundwasser-Messstelle Eberndorf, Klimarückblick Kärnten) und als `<Jahr>/Wetter.md` nach `Vorlagen/Wetter.md` ablegen, mit Quellen.
- Erkenntnisse, die über ein Jahr hinaus gelten, nach `Grundlagen/Erfahrungen.md` bzw. `Kulturwissen.md` übernehmen und das Jahr als Quelle angeben. Jahresordner bleiben als Archiv unverändert, außer für Korrekturen.
- Die Jahresliste in `Gemüsegarten/README.md` aktuell halten.
- Am Ende einer Session eine kurze Zusammenfassung in die `README.md` des betroffenen Jahres schreiben.
