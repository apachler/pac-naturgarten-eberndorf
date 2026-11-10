# Verbindung zu naturgarten.bio

Unser Garten folgt dem Vorbild der **PAC Natur&Garten – Gemeinschaft der lebendigen Erde** ([naturgarten.bio](https://naturgarten.bio)). Dieses Dokument hält fest, welche Inhalte der Seite in die Gemüsegarten-Planung einfließen und wo sie im Repo wirken.

Quelle der Inhalte ist das Repo `apachler/pacnaturgarten`, vor allem `src/lib/phenology.js`, `src/lib/garden-year.js`, `src/lib/moon-garden.js`, `src/data/natural-gardening-principles.json` und `src/data/healing-plants.json`. Die Inhalte stehen unter CC BY-SA 4.0. Ändert sich dort etwas, ziehen wir `beetplaner/naturjahr.js` und dieses Dokument nach.

## 1. Naturjahreszeiten statt Kalenderdaten

naturgarten.bio richtet das Gartenjahr nach den **zehn phänologischen Jahreszeiten** aus. Ihr Beginn wird nicht am Datum festgemacht, sondern an **Zeigerpflanzen**. Grundlage sind die DWD-Mittel 1991–2020, verschoben mit der **Hopkins-Regel** auf den Standort: 4 Tage je Breitengrad, 3,3 Tage je 100 m Höhe.

Für **Eberndorf (46,58° N, ca. 465 m)** ergibt das: Blüte und Reife kommen etwa **10 Tage früher** als im deutschen Mittel, Laubfärbung und Laubfall etwa **10 Tage später**. Die Standortdaten stehen in `standort.yaml`.

| Naturjahreszeit | Zeigerpflanze | Mittlerer Beginn in Eberndorf | Was im Gemüsebeet ansteht |
|-----------------|---------------|-------------------------------|---------------------------|
| Vorfrühling | Hasel blüht | Anfang Februar | Plan fertig, Saatgut bestellen |
| Erstfrühling | Forsythie blüht | Mitte März | Radieschen, Karotten (Saatband) säen; Boden lockern statt umgraben |
| Vollfrühling | Apfel blüht | Mitte April | Robuste Arten pflanzen, Mischkulturen anlegen; Empfindliches noch im Heizraum |
| Frühsommer | Holunder blüht | Mitte Mai | Nach den Eisheiligen: Paprika, Pfefferoni, Gurken, Sellerie, Bohnen; mulchen |
| Hochsommer | Sommer-Linde blüht | Anfang Juni | Morgens durchdringend gießen; Kräuter ernten; Paprika kontrollieren |
| Spätsommer | Frühäpfel reif | Ende Juli | Erste Früchte ernten, Kompost umsetzen |
| Frühherbst | Holunderbeeren reif | Mitte August | Haupternte, Saatgut sammeln, Vogerlsalat säen |
| Vollherbst | Eicheln reif | Anfang September | Mulchschicht erneuern; Knoblauch und Wintersteckzwiebeln vorbereiten |
| Spätherbst | Stiel-Eiche färbt sich | Ende Oktober | Mulchen statt umgraben, Laub liegen lassen; Rote Rüben ernten; **Rückmeldung** |
| Winter | Stiel-Eiche wirft das Laub | Mitte November | Werkzeug, Saatgut sortieren, **neues Gartenjahr planen** |

Das sind Mittelwerte mit einer Unsicherheit von etwa ±2–3 Wochen. Wann es tatsächlich so weit ist, zeigt die Zeigerpflanze. Auf naturgarten.bio fließt im Frühjahr auch die **Temperatursumme des laufenden Jahres** ein (Jahresrad bzw. „Gärtnern im Jahreskreis“ mit Ort Eberndorf).

**Im Repo:** Der Beetplaner zeigt zu jedem Datum die Naturjahreszeit samt Zeiger und die Aufgaben dazu. Im Kalender gibt es ein Band mit den Naturjahreszeiten. Neue Pläne geben Pflanztermine zusätzlich in Naturjahreszeiten an, etwa „Vollfrühling (Apfelblüte)“ statt nur „Mitte April“.

## 2. Das Gartenjahr

naturgarten.bio führt für jede Naturjahreszeit eine Aufgabenliste (`garden-year.js`), etwa „Kompost ausbringen, Boden nur lockern statt umgraben“ im Erstfrühling oder „Beete für den Winter vorbereiten: mulchen statt umgraben“ im Spätherbst. Der Beetplaner zeigt diese Liste unter „Gartenjahr jetzt“. Darüber stehen unsere **eigenen Punkte aus den Erfahrungen** (mit „Unser Beet“ markiert, gepflegt in `beetplaner/naturjahr.js` → `GEMUESE_JE_SAISON`).

## 3. Gärtnern mit dem Mond

naturgarten.bio bietet Mondgarten-Tipps nach zwei Rhythmen an: zu- oder abnehmend sowie auf- oder absteigend. Die Seite selbst nennt das **„Alte Gartenweisheit, keine Wissenschaft: Boden und Wetter gehen vor.“** Für den Gemüsegarten relevant sind:

| Mond | Tipp |
|------|------|
| zunehmend, aufsteigend | Säen, was über der Erde wächst (Salat, Kräuter, Bohnen); Kräuter und Blattgemüse ernten |
| zunehmend, absteigend | Jungpflanzen von Blatt- und Fruchtgemüse auspflanzen |
| abnehmend, aufsteigend | Fruchtgemüse für den Vorrat ernten |
| abnehmend, absteigend | Wurzelgemüse säen und stecken (Karotten, Rote Rüben, Zwiebeln, Knoblauch); Wurzelgemüse ernten; jäten |

Wir nutzen das als **optionale Feinabstimmung** innerhalb der passenden Naturjahreszeit, nie gegen Frost, Boden oder Wetter. Am einfachsten als Kalender-Abo: `webcal://naturgarten.bio/kalender/mondgarten.ics`.

## 4. Jahreskreis als Rhythmus für Rückmeldung und Planung

Die acht Jahreskreisfeste geben dem Planungszyklus seinen Takt. Die genauen Daten berechnet naturgarten.bio aus Sonnen- und Mondregeln (Jahreskreis bzw. `jahreskreis.ics`).

| Fest (ungefähr) | Impuls der Seite | Schritt im Gemüsegarten |
|-----------------|------------------|-------------------------|
| Mabon (Herbst-Tagundnachtgleiche) | „Was ist meine Frucht und Ernte dieses Jahr?“ | Haupternte, erste Notizen für die Rückmeldung |
| Samhain (Anfang November) | „Was brauche ich nicht mehr und kann es jetzt loslassen?“ | **Rückmeldung** schreiben: was weglassen, was reduzieren; Wetterrückblick |
| Yule (Wintersonnwende) | „Was will von mir geboren werden?“ | Wünsche und **Planungsauftrag** fürs neue Jahr |
| Imbolc (Anfang Februar) | „Was will gereinigt werden? Wie kann ich es stärken?“ | **Plan fertig**, Prüfung ohne Warnungen, Saatgut bestellen |
| Ostara (Frühlings-Tagundnachtgleiche) | „Welche Nahrung, Pflege und Raum braucht es?“ | Erste Aussaaten, Beet vorbereiten |
| Beltane (Anfang Mai) | – | Jungpflanzen besorgen und bis nach den Eisheiligen zwischenlagern |
| Litha (Sommersonnwende) | „Was ist in mir erblüht?“ | Zwischenstand im Ist-Stand festhalten |
| Lughnasadh (Anfang August) | „Muss ich meine Frucht schützen?“ | Erste große Ernte; Nachkulturen setzen |

## 5. Naturgarten-Prinzipien und was sie für unser Beet heißen

Aus den Grundsätzen der Seite (`natural-gardening-principles.json`):

- **Bodenleben fördern:** mulchen, kompostieren, nicht tief umgraben (No-Dig), Gründüngung. Das passt zu unserem Heubeet mit Terra Preta, EM und Schafwolle.
- **Mischkultur:** zum Beispiel Ringelblumen neben Tomaten, Bohnen als Stickstofflieferanten für Starkzehrer, unterschiedliche Wuchshöhen, „wechsle die Standorte jährlich“. Das prüft der Beetplaner (Nachbarn, Fruchtfolge).
- **Regenwasser nutzen:** Regentonnen an den Fallrohren, mulchen, morgens oder abends gießen, Tropfbewässerung. Für uns besonders wichtig: 2026 lag das Grundwasser an der Messstelle Eberndorf deutlich unter dem Mittel, und wir haben etwa 3000 L Brunnenwasser verbraucht. Eine Regenwassersammlung als zweite Quelle ist für 2027 zu prüfen.
- **Kreislauf:** Saatgut selbst gewinnen, Ernte- und Schnittreste kompostieren, Totholz nutzen.
- **Biodiversität:** heimische Blühpflanzen, Nützlingsunterkünfte, keine chemischen Pflanzenschutzmittel.

## 6. Heil- und Begleitpflanzen

Aus der Pflanzendatenbank der Seite (`healing-plants.json`), soweit sie den Gemüsegarten betrifft:

- **Ringelblume** (*Calendula officinalis*): wird im Frühjahr direkt gesät und **sät sich reichlich selbst aus**, was wir 2026 bestätigt haben. Für Insekten **ungefüllte Sorten** wählen, gefüllte Blüten bieten ihnen kaum etwas.
- **Brennnessel** (*Urtica dioica*): Jauche aus den Blättern als Dünger. Eine ungestörte Brennnesselecke am Gartenrand dient als Raupenfutter für Tagpfauenauge und Kleinen Fuchs.
- **Schafgarbe** (*Achillea millefolium*): Nektarquelle für Schwebfliegen. Deren Larven fressen Blattläuse.

## Kalender-Abos

| Kalender | Adresse |
|----------|---------|
| Gartenjahr | `webcal://naturgarten.bio/kalender/gartenjahr.ics` |
| Gärtnern mit dem Mond | `webcal://naturgarten.bio/kalender/mondgarten.ics` |
| Naturjahreszeiten | `webcal://naturgarten.bio/kalender/naturjahreszeiten.ics` |
| Jahreskreis | `webcal://naturgarten.bio/kalender/jahreskreis.ics` |

Die Links sind auch im Beetplaner unter „Gartenjahr jetzt“ zu finden.
