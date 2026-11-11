// Gemeinsame Logik für den Beetplaner (Browser) und das Prüf-Script (Node).
// Keine Abhängigkeiten, kein DOM – arbeitet mit bereits geparsten YAML-Daten.

export const TYPEN = {
  V: 'Vorkultur',
  H: 'Hauptkultur',
  N: 'Nachkultur',
  B: 'Beikraut',
  G: 'Gründüngung',
};

export const STATUS = {
  geplant: 'geplant',
  gepflanzt: 'gepflanzt',
  im_beet: 'steht im Beet',
  geerntet: 'abgeerntet',
  nicht_gepflanzt: 'nicht gepflanzt',
  unbekannt: 'unbekannt',
};

export const PFLICHTFELDER = ['name', 'botanisch', 'familie', 'symbol', 'farbe', 'rollen', 'abstand', 'hoehe', 'licht', 'boden', 'wurzel', 'zehrer', 'wasser', 'anbau', 'ernte', 'naturjahreszeit'];
const ERLAUBT = {
  wurzel: ['flach', 'mittel', 'tief'],
  zehrer: ['stark', 'mittel', 'schwach'],
  wasser: ['hoch', 'mittel', 'niedrig'],
  sicherheit: ['beobachtet', 'bestaetigt', 'hypothese'],
  winter: ['abfrierend', 'winterhart'],
};

/**
 * Prüft die Kultur-Datenquelle auf Vollständigkeit und gültige Verweise.
 * @returns {string[]} Fehlermeldungen
 */
export function validiereKulturen(kulturen, familien, naturjahreszeitIds = []) {
  const f = [];
  for (const [id, k] of Object.entries(kulturen)) {
    for (const feld of PFLICHTFELDER) if (k[feld] == null || k[feld] === '') f.push(`${id}: Pflichtfeld „${feld}“ fehlt`);
    if (k.familie && familien && !familien[k.familie]) f.push(`${id}: Familie „${k.familie}“ fehlt in familien.yaml`);
    for (const feld of ['wurzel', 'zehrer', 'wasser']) if (k[feld] && !ERLAUBT[feld].includes(k[feld])) f.push(`${id}: ${feld} „${k[feld]}“ ungültig (${ERLAUBT[feld].join(' | ')})`);
    if (k.rollen && (!Array.isArray(k.rollen) || k.rollen.some((r) => !TYPEN[r]))) f.push(`${id}: rollen nur ${Object.keys(TYPEN).join(', ')}`);
    if (k.rollen?.includes('G')) {
      const g = k.gruenduengung;
      if (!g) f.push(`${id}: Gründüngung braucht das Feld „gruenduengung“ (winter, saatmenge, ende)`);
      else {
        if (!ERLAUBT.winter.includes(g.winter)) f.push(`${id}: gruenduengung.winter „${g.winter}“ ungültig (${ERLAUBT.winter.join(' | ')})`);
        for (const feld of ['saatmenge', 'ende']) if (!g[feld]) f.push(`${id}: gruenduengung.${feld} fehlt`);
      }
    }
    if (naturjahreszeitIds.length && k.naturjahreszeit && !naturjahreszeitIds.includes(k.naturjahreszeit)) f.push(`${id}: naturjahreszeit „${k.naturjahreszeit}“ unbekannt`);
    if (!(Number(k.abstand) > 0)) f.push(`${id}: abstand muss eine Zahl > 0 sein`);
    for (const feld of ['gut', 'schlecht']) for (const n of k[feld] || []) if (!kulturen[n]) f.push(`${id}: ${feld}-Nachbar „${n}“ gibt es nicht`);
    for (const n of k.gut || []) if ((k.schlecht || []).includes(n)) f.push(`${id}: „${n}“ ist zugleich guter und schlechter Nachbar`);
    for (const e of k.erfahrungen || []) {
      if (!Number.isInteger(e.jahr) || !e.text) f.push(`${id}: Erfahrung braucht jahr und text`);
      if (e.sicherheit && !ERLAUBT.sicherheit.includes(e.sicherheit)) f.push(`${id}: sicherheit „${e.sicherheit}“ ungültig`);
    }
    for (const s of k.sorten || []) if (!s.name || !Number.isInteger(s.jahr)) f.push(`${id}: Sorte braucht name und jahr`);
    if (k.folgesaat) {
      const fs = k.folgesaat;
      if (!(Number.isInteger(fs.alle) && fs.alle > 0)) f.push(`${id}: folgesaat.alle muss eine ganze Zahl (Wochen) sein`);
      if (!Array.isArray(fs.monate) || !fs.monate.length || fs.monate.some((m) => !(Number.isInteger(m) && m >= 1 && m <= 12))) f.push(`${id}: folgesaat.monate muss eine Liste von Monaten 1–12 sein`);
    }
  }
  return f;
}

/**
 * Prüft die Pflanzenschutz-Steckbriefe (schaedlinge.yaml).
 * @returns {string[]} Fehlermeldungen
 */
export function validiereSchaedlinge(schaedlinge, kulturen) {
  const f = [];
  for (const [id, s] of Object.entries(schaedlinge || {})) {
    for (const feld of ['name', 'art', 'betrifft', 'erkennen', 'vorbeugen', 'handeln']) if (s[feld] == null || s[feld] === '') f.push(`Pflanzenschutz ${id}: Pflichtfeld „${feld}“ fehlt`);
    if (s.art && !['Tier', 'Insekt', 'Krankheit'].includes(s.art)) f.push(`Pflanzenschutz ${id}: art „${s.art}“ ungültig (Tier | Insekt | Krankheit)`);
    for (const k of s.betrifft || []) if (!kulturen[k]) f.push(`Pflanzenschutz ${id}: betroffene Kultur „${k}“ gibt es nicht`);
    for (const feld of ['vorbeugen', 'handeln']) if (s[feld] != null && !Array.isArray(s[feld])) f.push(`Pflanzenschutz ${id}: ${feld} muss eine Liste sein`);
    for (const e of s.erfahrungen || []) {
      if (!Number.isInteger(e.jahr) || !e.text) f.push(`Pflanzenschutz ${id}: Erfahrung braucht jahr und text`);
      if (e.sicherheit && !ERLAUBT.sicherheit.includes(e.sicherheit)) f.push(`Pflanzenschutz ${id}: sicherheit „${e.sicherheit}“ ungültig`);
    }
    for (const q of s.quellen || []) if (!q.titel || !/^https:\/\//.test(q.url || '')) f.push(`Pflanzenschutz ${id}: Quelle braucht titel und https-url`);
  }
  return f;
}

/** Pflanzenschutz-Steckbriefe, die eine Kultur betreffen: [[id, steckbrief]] */
export const schaedlingeVon = (kulturId, schaedlinge) => Object.entries(schaedlinge || {}).filter(([, s]) => (s.betrifft || []).includes(kulturId));

/** Anker einer Markdown-Überschrift wie auf GitHub: klein, Satzzeichen weg, Leerzeichen → „-“. */
export const ueberschriftAnker = (text) => String(text).toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');

/** Schlechte Nachbarn in beide Richtungen. */
export function schlechteNachbarnVon(id, kulturen) {
  const s = new Set(kulturen[id]?.schlecht || []);
  for (const [anderer, k] of Object.entries(kulturen)) if ((k.schlecht || []).includes(id)) s.add(anderer);
  return [...s];
}

/** Datum aus YAML (Date-Objekt oder 'YYYY-MM-DD') als UTC-Date. */
export function datum(v) {
  if (v instanceof Date) return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate()));
  if (typeof v === 'string') {
    const [y, m, d] = v.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  return null;
}

export function formatDatum(d) {
  if (!d) return '–';
  const monate = ['Jän', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'];
  return `${d.getUTCDate()}. ${monate[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Lage einer Pflanzung. Mit `ist = true` gilt die tatsächliche Lage aus `ist:` (punkte, reihen
 * oder bereich), sofern erfasst – sonst die geplante.
 */
export function ort(p, ist = false) {
  const i = p.ist;
  if (ist && i && (i.punkte || i.reihen || i.bereich)) {
    return { ...p, punkte: i.punkte, reihen: i.reihen, bereich: i.bereich, je: i.je ?? (i.punkte ? p.je : undefined), istLage: true };
  }
  return p;
}

/** Einteilung einer Fläche (Zonen, Wege) – geplant oder, falls erfasst, die tatsächliche. */
export function einteilung(fp, ist = false) {
  const i = ist && fp?.ist;
  return { zonen: (i && i.zonen) || fp?.zonen || [], wege: (i && i.wege) || fp?.wege || [], istLage: Boolean(i && (i.zonen || i.wege)) };
}

/** Ist-Lage erfasst und verschieden von der Planung? */
export const hatIstLage = (p) => Boolean(p.ist && (p.ist.punkte || p.ist.reihen || p.ist.bereich));

/** Pflanzung in der Woche ab `montag` (7 Tage) im Beet? */
export function aktivInWoche(p, montag) {
  const { von, bis } = zeitraum(p);
  const sonntag = new Date(montag.getTime() + 6 * 86400000);
  return (!von || von <= sonntag) && (!bis || bis >= montag);
}

/** Montag der Woche, in der `d` liegt (UTC). */
export function montagVon(d) {
  const m = new Date(d.getTime());
  m.setUTCDate(m.getUTCDate() - ((m.getUTCDay() + 6) % 7));
  return m;
}

/** ISO-Kalenderwoche. */
export function kalenderwoche(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + 3 - ((t.getUTCDay() + 6) % 7));
  const w1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((t - w1) / 86400000 - 3 + ((w1.getUTCDay() + 6) % 7)) / 7);
}

/** Alle Einzelpositionen einer Pflanzung: [{x, y, n}] (n = Pflanzen pro Punkt). Bereiche liefern []. */
export function positionen(p) {
  const out = [];
  if (Array.isArray(p.punkte)) {
    const je = p.je || 1;
    for (const [x, y] of p.punkte) out.push({ x, y, n: je });
  }
  if (Array.isArray(p.reihen)) {
    for (const r of p.reihen) {
      const n = r.anzahl || 1;
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1);
        if (r.x1 !== undefined) out.push({ x: r.x1 + t * (r.x2 - r.x1), y: r.y, n: 1 });
        else out.push({ x: r.x, y: r.y1 + t * (r.y2 - r.y1), n: 1 });
      }
    }
  }
  return out;
}

/** Geplante Stückzahl (Bereiche: anzahl oder wunsch). */
export function anzahlGeplant(p) {
  if (p.punkte || p.reihen) return positionen(p).reduce((s, q) => s + q.n, 0);
  return p.anzahl ?? p.wunsch ?? null;
}

// ---------------------------------------------------------------- Einkaufsliste

export const BEZUG = { jungpflanze: 'Jungpflanzen', saatgut: 'Saatgut', steckgut: 'Steckzwiebeln, Zehen, Knollen', vorhanden: 'vorhanden' };

/**
 * Wie eine Pflanzung bezogen wird: `bezug:` in der Pflanzung, sonst aus `anbau` der Kultur
 * (erster Teil vor „oder“). sicher = false, wenn die Kultur mehrere Wege kennt und der Plan nichts festlegt.
 */
export function bezugVon(p, k) {
  if (p.bezug) return { bezug: p.bezug, sicher: true };
  const anbau = String(k?.anbau || '').toLowerCase();
  const erster = anbau.split(' oder ')[0];
  const bezug = /jungpflanze/.test(erster) ? 'jungpflanze'
    : /steckzwiebel|zehe|knolle|wurzelstück/.test(erster) ? 'steckgut'
      : 'saatgut';
  return { bezug, sicher: !anbau.includes(' oder ') };
}

/**
 * Was für ein Jahr gekauft werden muss, aus dem Plan: je Bezug (jungpflanze, saatgut, steckgut) eine Liste
 * { bezug, kultur, name, sorte, anzahl, ohneZahl, m2, ab, flaechen, ids, unsicher }, sortiert nach dem ersten Termin.
 * Pflanzungen mit bezug: vorhanden fehlen.
 */
export function einkaufsliste(plan, kulturen) {
  const gruppen = new Map();
  for (const p of plan.pflanzungen || []) {
    const k = kulturen[p.kultur];
    if (!k) continue;
    const { bezug, sicher } = bezugVon(p, k);
    if (bezug === 'vorhanden') continue;
    const sorte = p.sorte || '';
    const key = `${bezug}|${p.kultur}|${sorte}`;
    const g = gruppen.get(key) || { bezug, kultur: p.kultur, name: k.name, sorte, anzahl: 0, ohneZahl: false, m2: 0, ab: null, flaechen: [], ids: [], unsicher: false };
    const n = p.bereich ? (p.anzahl ?? p.wunsch ?? null) : anzahlGeplant(p);
    if (n == null) g.ohneZahl = true; else g.anzahl += n;
    if (p.bereich) g.m2 += (p.bereich.b * p.bereich.t) / 10000;
    const von = datum(p.von);
    if (von && (!g.ab || von < g.ab)) g.ab = von;
    if (!g.flaechen.includes(p.flaeche)) g.flaechen.push(p.flaeche);
    g.ids.push(p.id);
    if (!sicher) g.unsicher = true;
    gruppen.set(key, g);
  }
  const liste = [...gruppen.values()].sort((a, b) => (a.ab ?? 0) - (b.ab ?? 0) || a.name.localeCompare(b.name, 'de'));
  return Object.fromEntries(['jungpflanze', 'saatgut', 'steckgut'].map((b) => [b, liste.filter((x) => x.bezug === b)]));
}

/** Saatmenge für eine Fläche aus einer Angabe wie „ca. 1–2 g/m²“: „2–4 g“ (null, wenn nicht lesbar). */
export function saatmengeFuer(angabe, m2) {
  const m = String(angabe || '').match(/(\d+(?:,\d+)?)\s*(?:–|-|bis)\s*(\d+(?:,\d+)?)\s*g\/m²/) || String(angabe || '').match(/(\d+(?:,\d+)?)()\s*g\/m²/);
  if (!m || !(m2 > 0)) return null;
  const z = (s) => Number(s.replace(',', '.'));
  const f = (v) => String(Math.round(v * m2 * 10) / 10).replace('.', ',');
  return m[2] ? `${f(z(m[1]))}–${f(z(m[2]))} g` : `${f(z(m[1]))} g`;
}

// ---------------------------------------------------------------- Diese Woche im Garten

const TAG_MS = 86400000;
const gilt = (p) => p.ist?.status !== 'nicht_gepflanzt';

/**
 * Was in der Woche ab `montag` laut Plan ansteht (über alle Flächen, tatsächliche Termine wo erfasst):
 * { saen, pflanzen, stecken, ende } – je [{ p, kultur, name, flaeche, datum }].
 */
export function wocheImGarten(plan, kulturen, montag) {
  const sonntag = new Date(montag.getTime() + 6 * TAG_MS);
  const erg = { saen: [], pflanzen: [], stecken: [], ende: [] };
  const art = { saatgut: 'saen', jungpflanze: 'pflanzen', steckgut: 'stecken' };
  for (const p0 of (plan.pflanzungen || []).filter(gilt)) {
    const k = kulturen[p0.kultur];
    if (!k) continue;
    const p = mitIstTermin(p0);
    const { von, bis } = zeitraum(p);
    const eintrag = (d) => ({ p: p0, kultur: p0.kultur, name: k.name, flaeche: p0.flaeche, datum: d });
    if (von && von >= montag && von <= sonntag) {
      const { bezug } = bezugVon(p0, k);
      if (art[bezug]) erg[art[bezug]].push(eintrag(von));
    }
    if (bis && bis >= montag && bis <= sonntag && p.typ !== 'B') erg.ende.push(eintrag(bis));
  }
  for (const l of Object.values(erg)) l.sort((a, b) => a.datum - b.datum || a.name.localeCompare(b.name, 'de'));
  return erg;
}

/**
 * Folgesaat: Kulturen mit `folgesaat: { alle, monate }`, deren Pflanzung in dieser Woche läuft und seit der ersten Saat
 * genau ein Vielfaches von `alle` Wochen zurückliegt – solange danach noch Zeit bis zum Ende bleibt.
 * @returns [{ kultur, name, wochen, flaeche }]
 */
export function folgesaatFaellig(plan, kulturen, montag) {
  const sonntag = new Date(montag.getTime() + 6 * TAG_MS);
  const monat = montag.getUTCMonth() + 1;
  const erg = new Map();
  for (const p0 of (plan.pflanzungen || []).filter(gilt)) {
    const k = kulturen[p0.kultur];
    const fs = k?.folgesaat;
    if (!fs || !fs.monate.includes(monat)) continue;
    const { von, bis } = zeitraum(mitIstTermin(p0));
    if (!von || !bis || von > sonntag) continue;
    const wochen = Math.floor((montag - montagVon(von)) / (7 * TAG_MS));
    if (wochen < fs.alle || wochen % fs.alle !== 0) continue;
    if (montag.getTime() + fs.alle * 7 * TAG_MS > bis.getTime()) continue;
    if (!erg.has(p0.kultur)) erg.set(p0.kultur, { kultur: p0.kultur, name: k.name, wochen, flaeche: p0.flaeche });
  }
  return [...erg.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

const MONATSNAMEN = ['jänner', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
const MONAT_RE = `(${MONATSNAMEN.join('|')})`;

/**
 * Offene Merklisten-Punkte („- [ ] **Titel (Juli 2027):** Text“), deren Zeitraum die Woche ab `montag` berührt.
 * Zeitraum im Titel: „(Monat Jahr)“, „(Monat–Monat Jahr)“ oder „(Monat Jahr–Monat Jahr)“.
 * @returns [{ titel, text }]
 */
export function merklisteFaellig(markdown, montag) {
  const sonntag = new Date(montag.getTime() + 6 * TAG_MS);
  const re = new RegExp(`\\(${MONAT_RE}(?:\\s+(\\d{4}))?(?:\\s*[–-]\\s*${MONAT_RE})?\\s+(\\d{4})\\)`, 'i');
  const erg = [];
  for (const zeile of String(markdown || '').split('\n')) {
    const z = zeile.match(/^\s*-\s*\[ \]\s*(.*)$/);
    if (!z) continue;
    const m = z[1].match(re);
    if (!m) continue;
    const [, m1, j1, m2, j2] = m;
    const bisJahr = Number(j2), vonJahr = Number(j1 || (m2 && MONATSNAMEN.indexOf(m1.toLowerCase()) > MONATSNAMEN.indexOf(m2.toLowerCase()) ? bisJahr - 1 : bisJahr));
    const beginn = new Date(Date.UTC(vonJahr, MONATSNAMEN.indexOf(m1.toLowerCase()), 1));
    const endeM = MONATSNAMEN.indexOf((m2 || m1).toLowerCase());
    const ende = new Date(Date.UTC(bisJahr, endeM + 1, 0));
    if (beginn > sonntag || ende < montag) continue;
    const fett = z[1].match(/^\*\*(.+?)\*\*\s*(.*)$/);
    const titel = (fett ? fett[1] : z[1]).replace(m[0], '').replace(/[:.\s]+$/, '').trim();
    const text = (fett ? fett[2] : '').replace(/\*\*|`/g, '').trim();
    erg.push({ titel, text });
  }
  return erg;
}

/** Kulturen, die am Tag `d` im Beet stehen (tatsächliche Termine; „steht im Beet“ bleibt bis heute). */
export function imBeetAm(plan, d) {
  return (plan.pflanzungen || []).filter(gilt).filter((p0) => {
    const p = mitIstTermin(p0);
    const { von, bis } = zeitraum(p);
    if (!von || von > d) return false;
    return bis >= d || p0.ist?.status === 'im_beet';
  });
}

export function zeitraum(p) {
  return { von: datum(p.von), bis: datum(p.bis) };
}

export function aktivAm(p, d) {
  const { von, bis } = zeitraum(p);
  return (!von || von <= d) && (!bis || d <= bis);
}

function zeitUeberlappt(a, b, minTage = 0) {
  const za = zeitraum(a), zb = zeitraum(b);
  const tage = (Math.min(za.bis, zb.bis) - Math.max(za.von, zb.von)) / 86400000;
  return tage >= minTage;
}

/** Rechteck, das eine Pflanzung räumlich einnimmt (für Überlappungen). */
export function huelle(p, kultur) {
  if (p.bereich) return { ...p.bereich };
  const pos = positionen(p);
  if (!pos.length) return null;
  const r = (kultur?.abstand || 20) / 2;
  const xs = pos.map((q) => q.x), ys = pos.map((q) => q.y);
  return { x: Math.min(...xs) - r, y: Math.min(...ys) - r, b: Math.max(...xs) - Math.min(...xs) + 2 * r, t: Math.max(...ys) - Math.min(...ys) + 2 * r };
}

function rechteckeUeberlappen(a, b) {
  return a.x < b.x + b.b && b.x < a.x + a.b && a.y < b.y + b.t && b.y < a.y + a.t;
}

function punktImRechteck(q, r) {
  return q.x > r.x && q.x < r.x + r.b && q.y > r.y && q.y < r.y + r.t;
}

function schlechteNachbarn(ka, kb, idA, idB) {
  return (ka?.schlecht || []).includes(idB) || (kb?.schlecht || []).includes(idA);
}

/**
 * Der tatsächliche Stand eines Jahres als Plan: Ist-Lage und Ist-Einteilung statt der Planung,
 * nicht Gepflanztes fällt weg. Zeiträume: ist.von/ist.bis, sonst die geplanten.
 */
export function istPlan(plan) {
  const flaechen = Object.fromEntries(Object.entries(plan.flaechen || {}).map(([id, fp]) => {
    const { zonen, wege } = einteilung(fp, true);
    return [id, { ...fp, zonen, wege }];
  }));
  const pflanzungen = (plan.pflanzungen || [])
    .filter((p) => p.ist?.status !== 'nicht_gepflanzt')
    .map((p) => ({ ...mitIstTermin(ort(p, true)), wunsch: p.ist?.anzahl ?? p.wunsch }));
  return { ...plan, flaechen, pflanzungen };
}

/** Pflanzung mit den tatsächlichen Terminen (ist.von/ist.bis), wo erfasst. */
export const mitIstTermin = (p) => (p.ist?.von || p.ist?.bis ? { ...p, von: p.ist.von ?? p.von, bis: p.ist.bis ?? p.bis } : p);

/** Hat ein Jahr einen erfassten Ist-Stand? */
export const hatIstStand = (plan) => (plan.pflanzungen || []).some((p) => p.ist);

/**
 * Prüft einen Jahresplan – oder mit ist: true den tatsächlichen Stand.
 * @returns Liste von { stufe: 'fehler'|'warnung'|'hinweis', thema, text, ids: [pflanzungs-ids] }
 */
export function pruefen({ plan, kulturen, flaechen, familien = null, vorjahre = [], ist = false }) {
  if (ist) plan = istPlan(plan);
  const meldungen = [];
  const melde = (stufe, thema, text, ids = []) => meldungen.push({ stufe, thema, text, ids });
  const pfl = plan.pflanzungen || [];
  const name = (p) => `${kulturen[p.kultur]?.name || p.kultur}${p.id !== p.kultur ? ` (${p.id})` : ''}`;

  // 1. Grunddaten
  const ids = new Set();
  for (const p of pfl) {
    if (ids.has(p.id)) melde('fehler', 'Daten', `Pflanzungs-ID „${p.id}“ ist doppelt vergeben.`, [p.id]);
    ids.add(p.id);
    if (!kulturen[p.kultur]) melde('fehler', 'Daten', `Kultur „${p.kultur}“ fehlt in kulturen.yaml.`, [p.id]);
    if (!flaechen[p.flaeche]) melde('fehler', 'Daten', `Fläche „${p.flaeche}“ fehlt in flaechen.yaml.`, [p.id]);
    if (!p.von || !p.bis) melde('fehler', 'Daten', `${name(p)}: Zeitraum (von/bis) fehlt.`, [p.id]);
    if (!p.punkte && !p.reihen && !p.bereich) melde('fehler', 'Daten', `${name(p)}: keine Position (punkte, reihen oder bereich).`, [p.id]);
  }
  const gueltig = pfl.filter((p) => kulturen[p.kultur] && flaechen[p.flaeche] && p.von && p.bis);

  // 2. Stückzahlen (nur im Plan – im Ist-Stand gilt die gezählte Anzahl)
  for (const p of gueltig) {
    if (ist || p.wunsch == null || p.bereich) continue;
    const g = anzahlGeplant(p);
    if (g !== p.wunsch) {
      if (p.begruendung) melde('hinweis', 'Stückzahl', `${name(p)}: ${g} statt ${p.wunsch} gewünscht – ${p.begruendung}`, [p.id]);
      else melde('warnung', 'Stückzahl', `${name(p)}: ${g} Pflanzen positioniert, gewünscht sind ${p.wunsch}.`, [p.id]);
    }
  }

  // 3. Grenzen und Wege
  for (const p of gueltig) {
    const f = flaechen[p.flaeche];
    const wege = plan.flaechen?.[p.flaeche]?.wege || [];
    const r = (kulturen[p.kultur].abstand || 0) / 2;
    const aufWeg = new Map(), inWeg = new Map();
    for (const q of positionen(p)) {
      if (!p.ausserhalb && (q.x < 0 || q.x > f.breite || q.y < 0 || q.y > f.laenge)) {
        melde('warnung', 'Grenzen', `${name(p)}: Position (${q.x}|${q.y}) liegt außerhalb von ${f.name}.`, [p.id]);
      }
      for (const w of wege) {
        if (q.y > w.y && q.y < w.y + w.t) aufWeg.set(w.name, (aufWeg.get(w.name) || 0) + 1);
        else if (q.y + r > w.y && q.y - r < w.y + w.t) inWeg.set(w.name, (inWeg.get(w.name) || 0) + 1);
      }
    }
    for (const [w, n] of aufWeg) melde('warnung', 'Wege', `${name(p)}: ${n} Pflanze(n) stehen auf dem ${w}.`, [p.id]);
    for (const [w, n] of inWeg) melde('hinweis', 'Wege', `${name(p)}: ${n} Pflanze(n) ragen in den ${w} (Pflanzabstand ${r * 2} cm).`, [p.id]);
    if (p.bereich && !p.ausserhalb) {
      const b = p.bereich;
      if (b.x < 0 || b.y < 0 || b.x + b.b > f.breite || b.y + b.t > f.laenge) melde('warnung', 'Grenzen', `${name(p)}: Bereich ragt über ${f.name} hinaus.`, [p.id]);
    }
  }

  // 4. Abstände und Nachbarn (Einzelpositionen, gleiche Fläche, Zeit überlappend)
  const paarGemeldet = new Map();
  for (let i = 0; i < gueltig.length; i++) {
    for (let j = i; j < gueltig.length; j++) {
      const a = gueltig[i], b = gueltig[j];
      if (a.flaeche !== b.flaeche || !zeitUeberlappt(a, b, 14)) continue;
      const ka = kulturen[a.kultur], kb = kulturen[b.kultur];
      const pa = positionen(a), pb = positionen(b);
      const noetig = ((ka.abstand || 0) + (kb.abstand || 0)) / 2;
      const schlecht = schlechteNachbarn(ka, kb, a.kultur, b.kultur);
      let minD = Infinity;
      for (let s = 0; s < pa.length; s++) {
        for (let t = i === j ? s + 1 : 0; t < pb.length; t++) {
          const d = Math.hypot(pa[s].x - pb[t].x, pa[s].y - pb[t].y);
          if (d < minD) minD = d;
        }
      }
      if (minD < noetig * 0.8) {
        const key = `${a.id}|${b.id}`;
        if (!paarGemeldet.has(key)) {
          paarGemeldet.set(key, true);
          const wer = i === j ? `${name(a)} untereinander` : `${name(a)} ↔ ${name(b)}`;
          melde('warnung', 'Abstand', `${wer}: nur ${Math.round(minD)} cm, empfohlen ca. ${Math.round(noetig)} cm.`, [a.id, b.id]);
        }
      }
      if (schlecht && i !== j) {
        let nah = minD < 50;
        // Bereich gegen Punkte / Bereich
        const ha = huelle(a, ka), hb = huelle(b, kb);
        if (!nah && (a.bereich || b.bereich) && ha && hb) {
          const grow = { x: ha.x - 30, y: ha.y - 30, b: ha.b + 60, t: ha.t + 60 };
          nah = rechteckeUeberlappen(grow, hb);
        }
        if (nah) melde('warnung', 'Nachbarn', `${name(a)} und ${name(b)} sind schlechte Nachbarn und stehen gleichzeitig nah beieinander.`, [a.id, b.id]);
      }
    }
  }

  // 5. Vor-/Nachkultur-Bereiche: Ist der Platz zur richtigen Zeit frei?
  for (const a of gueltig) {
    if (!a.bereich || a.mischsaat) continue;
    const f = flaechen[a.flaeche];
    if (a.bereich.b * a.bereich.t >= 0.9 * f.breite * f.laenge) continue; // „verteilt“ über das ganze Beet
    for (const b of gueltig) {
      if (b === a || b.flaeche !== a.flaeche || b.bereich) continue;
      if (!positionen(b).some((q) => punktImRechteck(q, a.bereich))) continue;
      const za = zeitraum(a), zb = zeitraum(b);
      if (!(za.von < zb.bis && zb.von < za.bis)) continue;
      const tage = Math.round((Math.min(za.bis, zb.bis) - Math.max(za.von, zb.von)) / 86400000);
      if (tage <= 14) continue;
      if (za.von <= zb.von) {
        melde('warnung', 'Platz', `${name(b)} soll am ${formatDatum(zb.von)} gesetzt werden, aber ${name(a)} steht dort bis ${formatDatum(za.bis)} (${tage} Tage Überschneidung).`, [a.id, b.id]);
      } else {
        melde('warnung', 'Platz', `${name(a)} soll ab ${formatDatum(za.von)} folgen, aber ${name(b)} steht dort bis ${formatDatum(zb.bis)} (${tage} Tage Überschneidung).`, [a.id, b.id]);
      }
    }
  }

  // 6. Frostempfindliche Kulturen vor den Eisheiligen
  const eis = new Date(Date.UTC(plan.jahr, 4, 15));
  for (const p of gueltig) {
    if (kulturen[p.kultur].frost && datum(p.von) < eis) melde('warnung', 'Frost', `${name(p)} ist frostempfindlich und soll am ${formatDatum(datum(p.von))} – vor den Eisheiligen – ins Beet.`, [p.id]);
  }

  // 7. Fruchtfolge: dieselbe Familie innerhalb ihrer Anbaupause an derselben Stelle.
  //    Ohne familien.yaml: nur der letzte Anbau auf der Fläche. Beim Vorjahr zählt die tatsächliche Lage.
  for (const fid of new Set(gueltig.map((p) => p.flaeche))) {
    const frueher = vorjahre
      .filter((v) => v.jahr < plan.jahr && (v.pflanzungen || []).some((q) => q.flaeche === fid))
      .sort((x, y) => y.jahr - x.jahr);
    if (!frueher.length) continue;
    for (const p of gueltig.filter((q) => q.flaeche === fid)) {
      const kp = kulturen[p.kultur];
      const pause = familien?.[kp.familie]?.anbaupause;
      const hp = huelle(p, kp);
      const kandidaten = pause == null ? frueher.slice(0, 1) : frueher.filter((v) => plan.jahr - v.jahr < pause);
      const gemeldet = new Set();
      for (const vorher of kandidaten) {
        for (const q of vorher.pflanzungen.filter((x) => x.flaeche === fid && x.ist?.status !== 'nicht_gepflanzt')) {
          const kq = kulturen[q.kultur];
          if (!kq || kq.familie !== kp.familie) continue;
          const hq = huelle(ort(q, true), kq);
          const key = `${vorher.jahr}|${kq.name}`;
          if (hp && hq && rechteckeUeberlappen(hp, hq) && !gemeldet.has(key)) {
            gemeldet.add(key);
            const regel = pause == null ? '' : ` – Anbaupause ${kp.familie}: ${pause} Jahre`;
            melde('warnung', 'Fruchtfolge', `${name(p)}: ${kp.familie} standen ${vorher.jahr} an derselben Stelle (${kq.name})${regel}.`, [p.id]);
          }
        }
      }
    }
  }

  const rang = { fehler: 0, warnung: 1, hinweis: 2 };
  return meldungen.sort((a, b) => rang[a.stufe] - rang[b.stufe]);
}
