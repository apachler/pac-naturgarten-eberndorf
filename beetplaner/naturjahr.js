// Naturjahreszeiten und Gartenjahr – übernommen von naturgarten.bio (PAC Natur&Garten,
// Repo apachler/pacnaturgarten: src/lib/phenology.js, src/lib/garden-year.js, src/lib/moon-garden.js).
// Inhalte: CC BY-SA 4.0, PAC Natur&Garten. Phänologische Mittelwerte: Deutscher Wetterdienst,
// Phänologische Uhr, Mittel 1991–2020, verschoben mit der Hopkins-Regel auf den Standort.
// Bei Änderungen auf naturgarten.bio hier nachziehen.

export const QUELLE = 'naturgarten.bio – Naturjahreszeiten (DWD-Mittel 1991–2020, Hopkins-Regel) und Gartenjahr';

export const NATURJAHRESZEITEN = [
  { id: 'preSpring', name: 'Vorfrühling', month: 2, day: 14, zeiger: 'Hasel blüht', auch: 'Schneeglöckchen blüht', farbe: '#d9e7c9' },
  { id: 'earlySpring', name: 'Erstfrühling', month: 3, day: 27, zeiger: 'Forsythie blüht', auch: 'Stachelbeere treibt Blätter', farbe: '#f3e27a' },
  { id: 'fullSpring', name: 'Vollfrühling', month: 4, day: 26, zeiger: 'Apfel blüht', auch: 'Stiel-Eiche treibt Blätter', farbe: '#f4c6cf' },
  { id: 'earlySummer', name: 'Frühsommer', month: 5, day: 27, zeiger: 'Schwarzer Holunder blüht', auch: 'Robinie blüht', farbe: '#e9efe0' },
  { id: 'highSummer', name: 'Hochsommer', month: 6, day: 18, zeiger: 'Sommer-Linde blüht', auch: 'Johannisbeeren reif', farbe: '#c8df9e' },
  { id: 'lateSummer', name: 'Spätsommer', month: 8, day: 2, zeiger: 'Frühäpfel reif', auch: 'Vogelbeeren reif', farbe: '#f0b45a' },
  { id: 'earlyAutumn', name: 'Frühherbst', month: 8, day: 24, zeiger: 'Holunderbeeren reif', auch: 'Kornelkirschen reif', farbe: '#b88bb0' },
  { id: 'fullAutumn', name: 'Vollherbst', month: 9, day: 19, zeiger: 'Eicheln reif', auch: 'Rosskastanien reif', farbe: '#c98a4b' },
  { id: 'lateAutumn', name: 'Spätherbst', month: 10, day: 17, zeiger: 'Stiel-Eiche färbt sich', auch: 'Eberesche wirft das Laub', farbe: '#a7743f' },
  { id: 'winter', name: 'Winter', month: 11, day: 5, zeiger: 'Stiel-Eiche wirft das Laub', auch: 'Lärche wirft die Nadeln', farbe: '#c9d3dc' },
];

const LAUB = new Set(['lateAutumn', 'winter']);

/** Verschiebung gegenüber dem DWD-Mittel (Bezug 51° N, 250 m) in Tagen, wie auf naturgarten.bio. */
export function hopkins(id, lat, hoehe) {
  const roh = 4 * (lat - 51) + (hoehe == null ? 0 : (3.3 * (hoehe - 250)) / 100);
  const v = Math.max(-30, Math.min(30, roh));
  return Math.round(LAUB.has(id) ? -v : v);
}

/** Beginn der zehn Naturjahreszeiten eines Jahres am Standort: [{...saison, beginn: Date}] */
export function naturjahr(jahr, standort) {
  return NATURJAHRESZEITEN.map((s) => {
    const d = new Date(Date.UTC(jahr, s.month - 1, s.day));
    d.setUTCDate(d.getUTCDate() + (standort ? hopkins(s.id, standort.lat, standort.hoehe) : 0));
    return { ...s, beginn: d };
  });
}

/** Naturjahreszeit an einem Datum (berücksichtigt den Winter des Vorjahres). */
export function saisonAm(datum, standort) {
  const j = datum.getUTCFullYear();
  const alle = [...naturjahr(j - 1, standort), ...naturjahr(j, standort)];
  let aktuell = alle[0];
  for (const s of alle) if (s.beginn <= datum) aktuell = s;
  return aktuell;
}

/** Gartenjahr: Aufgaben je Naturjahreszeit (naturgarten.bio, garden-year.js). */
export const GARTENJAHR = {
  preSpring: ['Obstgehölze auslichten, solange sie noch ruhen', 'Nistkästen reinigen und aufhängen', 'Saatgut sichten, erste Aussaat auf der Fensterbank'],
  earlySpring: ['Vorjahresstauden zurückschneiden, Stängel als Nisthilfe liegen lassen', 'Kompost ausbringen, Boden nur lockern statt umgraben', 'Boden aktivieren: Gründüngung einarbeiten, Bodenleben füttern', 'Neuen Kompost anlegen'],
  fullSpring: ['Robuste Arten pflanzen und säen', 'Mischkulturen anlegen', 'Bestäuber fördern: blühende Wildstauden pflanzen und stehen lassen', 'Nach den Eisheiligen empfindliche Pflanzen ins Freie'],
  earlySummer: ['Mulchen, damit der Boden feucht und belebt bleibt', 'Wildblumen blühen lassen, Wiese nur abschnittsweise mähen', 'Nützlinge beobachten, Schädlinge meist gewähren lassen'],
  highSummer: ['Nur gießen, wo nötig: morgens und durchdringend', 'Wasserstellen für Vögel und Insekten auffüllen', 'Kräuter zur Blüte ernten und trocknen', 'Genießen nicht vergessen'],
  lateSummer: ['Erste Früchte ernten', 'Saatgut der Frühjahrsblüher sammeln', 'Kompost umsetzen'],
  earlyAutumn: ['Haupternte, einen Teil für die Vögel am Strauch lassen', 'Saatgut sammeln, trocknen, beschriften', 'Stauden teilen und umpflanzen', 'Kompost pflegen: Ernte- und Schnittreste aufschichten'],
  fullAutumn: ['Gehölze und Stauden pflanzen, der Boden ist noch warm', 'Zwiebeln der Frühblüher setzen', 'Mulchschicht erneuern'],
  lateAutumn: ['Laub unter Hecken und auf Beeten liegen lassen', 'Reisig- und Totholzhaufen als Winterquartier anlegen', 'Samenstände stehen lassen, als Futter und Nisthilfe', 'Beete für den Winter vorbereiten: mulchen statt umgraben'],
  winter: ['Winterschutz kontrollieren', 'Werkzeug pflegen', 'Saatgut prüfen und für den Tausch sortieren', 'Vögel füttern', 'Rückzug und Regeneration – auch für die Gärtnerin, den Gärtner', 'Das kommende Gartenjahr planen', 'Rituale zur Einstimmung auf das neue Gartenjahr'],
};

/** Gemüsegarten-spezifische Ergänzungen aus unseren eigenen Erfahrungen (Grundlagen/Erfahrungen.md). */
export const GEMUESE_JE_SAISON = {
  preSpring: ['Rückmeldung und Plan fürs Jahr abschließen, Saatgut bestellen'],
  earlySpring: ['Radieschen und Karotten (Saatband) säen'],
  fullSpring: ['Frostempfindliche Jungpflanzen bis nach den Eisheiligen im ehemaligen Heizraum zwischenlagern'],
  earlySummer: ['Gurken ans Gitter leiten, Mulch nachlegen'],
  highSummer: ['Hitze: Feuerbohnen setzen kaum an, Dill schießt – gleichmäßig gießen und mulchen', 'Paprika auf Fraßlöcher prüfen – Fotos machen (Merkliste)'],
  fullAutumn: ['Knoblauch und Wintersteckzwiebeln stecken'],
  lateAutumn: ['Rote Rüben vor stärkerem Frost ernten', 'Rückmeldung zum Gartenjahr schreiben, Wetterrückblick recherchieren'],
};

/** Abo-Kalender von naturgarten.bio. */
export const KALENDER_ABOS = [
  { name: 'Gartenjahr', url: 'https://naturgarten.bio/kalender/gartenjahr.ics' },
  { name: 'Gärtnern mit dem Mond', url: 'https://naturgarten.bio/kalender/mondgarten.ics' },
  { name: 'Naturjahreszeiten', url: 'https://naturgarten.bio/kalender/naturjahreszeiten.ics' },
  { name: 'Jahreskreis', url: 'https://naturgarten.bio/kalender/jahreskreis.ics' },
];
