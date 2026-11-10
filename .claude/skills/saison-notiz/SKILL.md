---
name: saison-notiz
description: Eine kurze Beobachtung während der Gartensaison festhalten – Aussaat, Pflanzung, Ernte, Ausfall, Schädling, Wetterereignis oder Foto – im Ist-Stand der plan.yaml und im Saisontagebuch des Jahres. Verwenden, wenn Andreas zwischendurch etwas aus dem Garten erzählt („heute Kohlrabi geerntet“, „Raupen am Kohl“).
---

# Saison-Notiz

Kurz halten – Andreas schreibt oft vom Handy.

1. Aktuelles Jahr bestimmen (heutiges Datum) und `Gemüsegarten/<Jahr>/plan.yaml` lesen.
2. Passende Pflanzung finden (Kultur + Fläche). Unklar, welche gemeint ist? Einmal kurz nachfragen.
3. **Ist-Stand** unter `ist:` aktualisieren: `status` (gepflanzt | im_beet | geerntet | nicht_gepflanzt | unbekannt),
   `anzahl`, `ernte`, `notiz` mit Datum (TT.MM.), abweichende Lage als `punkte`/`reihen`/`bereich`.
4. **Saisontagebuch:** eine Zeile mit Datum in `Gemüsegarten/<Jahr>/README.md` unter „## Saison“ (Abschnitt anlegen, falls
   er fehlt). Wetterereignisse (Hagel, Spätfrost, Hitze, Starkregen) ebenfalls dort – sie fließen später in `Wetter.md`.
5. Passt es zu einem Merklisten-Punkt (z. B. „Fotos von den Raupen machen“)? Darauf hinweisen und den Punkt aktualisieren.
6. Neue Erkenntnis zu einer Art? Nur wenn eindeutig, als `beobachtet` in `kulturen.yaml` – sonst bis zur Rückmeldung warten.
7. Der Hook prüft automatisch; Commit „Saison <Jahr>: …“ ohne Attribution.
