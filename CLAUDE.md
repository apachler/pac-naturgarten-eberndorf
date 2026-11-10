# Hinweise für Claude

Dieses Repo ist das Langzeitgedächtnis für die Gemüsegarten-Planung von Andreas (Naturgarten Eberndorf, Kärnten). Jede neue Session beginnt ohne Vorwissen – alles Wichtige steht hier im Repo.

## Zu Beginn jeder Gemüsegarten-Session lesen

1. `Gemüsegarten/Grundlagen/Standort-und-Beete.md` – Standort, Boden, Beete, Fruchtfolge, Ressourcen
2. `Gemüsegarten/Grundlagen/Planungszyklus.md` – wie geplant und ausgewertet wird
3. `Gemüsegarten/Grundlagen/Erfahrungen.md` – bestätigte Erkenntnisse aus früheren Jahren
4. `Gemüsegarten/Grundlagen/Kulturwissen.md` – Abstände, Termine, Nachbarschaften
5. Den Ordner des **Vorjahres** (Plan + `Rueckmeldung.md`) und ggf. den des aktuellen Jahres

## Arbeitsweise

- Auf Deutsch antworten (Du-Form), österreichische Gemüsenamen verwenden.
- Alle Dokumente als Markdown anlegen, keine Office-Formate. Interaktive Beetpläne als eigenständige HTML-Datei (React + Babel + Tailwind über CDN), die per Doppelklick im Browser läuft.
- Beim Planen aktiv auf Probleme hinweisen (Platz, Nachbarschaften, Fruchtfolge) und bei Konflikten begründet priorisieren, statt still wegzulassen.
- Pflanzpläne müssen 1:1 umsetzbar sein: jede Pflanze mit Position (X/Y in cm, Ursprung Südwest-Ecke) und alle gewünschten Stückzahlen vollständig – vor dem Abschluss nachzählen.
- Neue Jahre aus `Gemüsegarten/Vorlagen/` anlegen.
- **Regel für Rückmeldungen:** Zu jeder Jahres-Rückmeldung das Wetter des Jahres für Eberndorf/Kärnten recherchieren (GeoSphere Austria, BMLUK-Monatsberichte „Wasserhaushalt Österreich“ mit Grundwasser-Messstelle Eberndorf, Klimarückblick Kärnten) und als `<Jahr>/Wetter.md` nach `Vorlagen/Wetter.md` ablegen, mit Quellen.
- Erkenntnisse, die über ein Jahr hinaus gelten, nach `Grundlagen/Erfahrungen.md` bzw. `Kulturwissen.md` übernehmen und das Jahr als Quelle angeben. Jahresordner bleiben als Archiv unverändert, außer für Korrekturen.
- Die Jahresliste in `Gemüsegarten/README.md` aktuell halten.
- Am Ende einer Session eine kurze Zusammenfassung in die `README.md` des betroffenen Jahres schreiben.
