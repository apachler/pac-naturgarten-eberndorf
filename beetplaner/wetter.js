// Wetter-Auswertung für Eberndorf: Monatswerte, wichtige Tage und Klimamittel aus Tageswerten.
// Reine Funktionen ohne Netz und Dateizugriff – genutzt von tools/wetter.mjs (Wetterrückblick) und den Tests.
//
// Ein Tag: { datum: 'JJJJ-MM-TT', tn, tx, rr, sonne }  (°C, °C, mm, Stunden; fehlende Werte = null)

export const MONATE = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

// Schwellen (Klimatologie-Kenntage; „kühle Nacht“ ist ein Faustwert für Bodenfrostgefahr)
export const GRENZEN = { frost: 0, kuehl: 4, sommer: 25, hitze: 30, regen: 1, starkregen: 20, hitzewelle: 3 };

const tageImMonat = (j, m) => new Date(Date.UTC(j, m, 0)).getUTCDate();
const monatVon = (d) => +d.slice(5, 7);
const mittel = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const summe = (a) => a.reduce((s, x) => s + x, 0);
const da = (x) => x != null && !Number.isNaN(x);

// Tageswerte aus der GeoJSON-Antwort der GeoSphere-API (SPARTACUS: TN, TX, RR, SA in Sekunden)
export function tageAusGeosphere(json) {
  const p = json.features[0].properties.parameters;
  return json.timestamps.map((t, i) => ({
    datum: t.slice(0, 10),
    tn: p.TN?.data[i] ?? null,
    tx: p.TX?.data[i] ?? null,
    rr: p.RR?.data[i] ?? null,
    sonne: da(p.SA?.data[i]) ? p.SA.data[i] / 3600 : null,
  }));
}

// Kennwerte für eine Menge von Tagen (ein Monat oder ein Zeitraum)
function kennwerte(tage) {
  const tn = tage.map((t) => t.tn).filter(da), tx = tage.map((t) => t.tx).filter(da);
  const tm = tage.filter((t) => da(t.tn) && da(t.tx)).map((t) => (t.tn + t.tx) / 2);
  const rr = tage.map((t) => t.rr).filter(da), so = tage.map((t) => t.sonne).filter(da);
  return {
    tage: tage.length,
    tm: mittel(tm), tn: mittel(tn), tx: mittel(tx),
    rr: rr.length ? summe(rr) : null,
    sonne: so.length ? summe(so) : null,
    frosttage: tn.filter((v) => v < GRENZEN.frost).length,
    eistage: tx.filter((v) => v < GRENZEN.frost).length,
    sommertage: tx.filter((v) => v >= GRENZEN.sommer).length,
    hitzetage: tx.filter((v) => v >= GRENZEN.hitze).length,
    regentage: rr.filter((v) => v >= GRENZEN.regen).length,
    starkregentage: rr.filter((v) => v >= GRENZEN.starkregen).length,
  };
}

// Monatswerte eines Jahres: [{ monat, vollstaendig, bis, ...kennwerte }] nur für Monate mit Daten
export function monatswerte(tage, jahr) {
  const erg = [];
  for (let m = 1; m <= 12; m++) {
    const t = tage.filter((x) => x.datum.startsWith(`${jahr}-`) && monatVon(x.datum) === m);
    if (!t.length) continue;
    erg.push({ monat: m, vollstaendig: t.length === tageImMonat(jahr, m), bis: t.at(-1).datum, ...kennwerte(t) });
  }
  return erg;
}

// Klimamittel je Monat über die Jahre von–bis (Mittel der Monatswerte), dazu Frosttermine
export function klimamittel(tage, von, bis) {
  const jahre = [];
  for (let j = von; j <= bis; j++) jahre.push(j);
  const proJahr = jahre.map((j) => monatswerte(tage, j));
  const monate = [];
  for (let m = 1; m <= 12; m++) {
    const werte = proJahr.map((mw) => mw.find((x) => x.monat === m)).filter((x) => x && x.vollstaendig);
    const feld = (k) => runde(mittel(werte.map((x) => x[k]).filter(da)), 1);
    monate.push({
      monat: m, tm: feld('tm'), tn: feld('tn'), tx: feld('tx'), rr: feld('rr'), sonne: feld('sonne'),
      frosttage: feld('frosttage'), eistage: feld('eistage'), sommertage: feld('sommertage'), hitzetage: feld('hitzetage'),
      regentage: feld('regentage'), starkregentage: feld('starkregentage'),
    });
  }
  const termine = (fn) => {
    const tg = jahre.map((j) => fn(tage.filter((t) => t.datum.startsWith(`${j}-`)))).filter(Boolean).map(tagImJahr);
    if (!tg.length) return null;
    return { mittel: ausTagImJahr(Math.round(mittel(tg))), fruehestens: ausTagImJahr(Math.min(...tg)), spaetestens: ausTagImJahr(Math.max(...tg)), jahre: tg.length };
  };
  return {
    zeitraum: `${von}–${bis}`,
    monate,
    letzter_frost: termine(letzterFrost),
    letzte_kuehle_nacht: termine(letzteKuehleNacht),
    erster_frost: termine(ersterFrost),
  };
}

// Tag im Jahr über ein Bezugsjahr ohne Schalttag ('MM-TT' oder 'JJJJ-MM-TT')
export function tagImJahr(d) {
  const [m, t] = d.slice(-5).split('-').map(Number);
  return Math.round((Date.UTC(2001, m - 1, t) - Date.UTC(2001, 0, 1)) / 864e5) + 1;
}
export function ausTagImJahr(n) {
  const d = new Date(Date.UTC(2001, 0, n));
  return `${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

// Frühjahr = Jänner–Juni, Herbst = Juli–Dezember
const fruehjahr = (tage) => tage.filter((t) => monatVon(t.datum) <= 6);
const herbst = (tage) => tage.filter((t) => monatVon(t.datum) >= 7);
export const letzterFrost = (tage) => fruehjahr(tage).filter((t) => da(t.tn) && t.tn < GRENZEN.frost).at(-1)?.datum ?? null;
export const letzteKuehleNacht = (tage) => fruehjahr(tage).filter((t) => da(t.tn) && t.tn < GRENZEN.kuehl).at(-1)?.datum ?? null;
export const ersterFrost = (tage) => herbst(tage).find((t) => da(t.tn) && t.tn < GRENZEN.frost)?.datum ?? null;

// Zusammenhängende Abschnitte, in denen bed(t) gilt (Lücken im Datum beenden einen Abschnitt)
export function abschnitte(tage, bed, mindestens = 1) {
  const erg = [];
  let akt = [];
  const ende = () => { if (akt.length >= mindestens) erg.push(akt); akt = []; };
  tage.forEach((t, i) => {
    const folgt = i > 0 && tagImJahrAbs(t.datum) - tagImJahrAbs(tage[i - 1].datum) === 1;
    if (!folgt) ende();
    if (bed(t)) akt.push(t); else ende();
  });
  ende();
  return erg.map((a) => ({ von: a[0].datum, bis: a.at(-1).datum, tage: a.length, liste: a }));
}
const tagImJahrAbs = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5;

// Wichtige Tage eines Jahres für den Garten
export function wichtigeTage(tage, jahr) {
  const j = tage.filter((t) => t.datum.startsWith(`${jahr}-`));
  const mitTx = j.filter((t) => da(t.tx)), mitTn = j.filter((t) => da(t.tn));
  const heiss = mitTx.length ? mitTx.reduce((a, b) => (b.tx > a.tx ? b : a)) : null;
  const kalt = mitTn.length ? mitTn.reduce((a, b) => (b.tn < a.tn ? b : a)) : null;
  const hitzewellen = abschnitte(j, (t) => da(t.tx) && t.tx >= GRENZEN.hitze, GRENZEN.hitzewelle)
    .map((a) => ({ von: a.von, bis: a.bis, tage: a.tage, max: Math.max(...a.liste.map((t) => t.tx)) }));
  const saison = j.filter((t) => monatVon(t.datum) >= 3 && monatVon(t.datum) <= 10);
  const trocken = abschnitte(saison, (t) => da(t.rr) && t.rr < GRENZEN.regen)
    .sort((a, b) => b.tage - a.tage || a.von.localeCompare(b.von)).slice(0, 3)
    .map((a) => ({ von: a.von, bis: a.bis, tage: a.tage }));
  const starkregen = j.filter((t) => da(t.rr) && t.rr >= GRENZEN.starkregen).map((t) => ({ datum: t.datum, rr: t.rr }));
  const frostNachEisheiligen = j.filter((t) => t.datum.slice(5) > '05-15' && monatVon(t.datum) <= 6 && da(t.tn) && t.tn < GRENZEN.frost).map((t) => t.datum);
  return {
    bis: j.at(-1)?.datum ?? null,
    letzter_frost: letzterFrost(j),
    letzte_kuehle_nacht: letzteKuehleNacht(j),
    erster_frost: ersterFrost(j),
    frost_nach_eisheiligen: frostNachEisheiligen,
    heissester_tag: heiss && { datum: heiss.datum, tx: heiss.tx },
    kaeltester_tag: kalt && { datum: kalt.datum, tn: kalt.tn },
    hitzewellen,
    trockenphasen: trocken,
    starkregen,
  };
}

// ---------- Zahlen und Text (österreichisches Format) ----------

export const runde = (v, stellen = 1) => (v == null ? null : Math.round(v * 10 ** stellen) / 10 ** stellen);
export function zahl(v, stellen = 1) {
  if (v == null) return '–';
  return runde(v, stellen).toFixed(stellen).replace('.', ',').replace('-', '−');
}
export function abw(v, stellen = 1) {
  if (v == null) return '–';
  const r = runde(v, stellen);
  return (r > 0 ? '+' : r < 0 ? '−' : '±') + Math.abs(r).toFixed(stellen).replace('.', ',');
}
export function datumText(d, mitJahr = false) {
  const [j, m, t] = d.split('-').map(Number);
  return `${t}. ${MONATE[m - 1]}${mitJahr ? ` ${j}` : ''}`;
}
const kurz = (d) => `${+d.slice(8, 10)}.${+d.slice(5, 7)}.`;
const prozent = (ist, soll) => (ist == null || !soll ? '–' : `${Math.round((ist / soll) * 100)} %`);

// Kennwerte eines Zeitraums aus Monaten zusammenfassen (Temperaturen nach Tagen gewichtet)
function zusammen(monate) {
  const tage = summe(monate.map((m) => m.tage));
  const gew = (k) => summe(monate.map((m) => (m[k] ?? 0) * m.tage)) / tage;
  const s = (k) => (monate.every((m) => m[k] != null) ? summe(monate.map((m) => m[k])) : null);
  return { tage, tm: gew('tm'), tn: gew('tn'), tx: gew('tx'), rr: s('rr'), sonne: s('sonne'), frosttage: s('frosttage'), hitzetage: s('hitzetage') };
}
function klimaZusammen(klima, nummern, jahr) {
  const monate = klima.monate.filter((m) => nummern.includes(m.monat)).map((m) => ({ ...m, tage: tageImMonat(jahr, m.monat) }));
  return zusammen(monate);
}

// Markdown-Abschnitt „Messwerte Eberndorf“ für <Jahr>/Wetter.md
export function wetterMarkdown({ jahr, tage, klima, ort }) {
  const monate = monatswerte(tage, jahr);
  const wt = wichtigeTage(tage, jahr);
  const km = (m) => klima.monate.find((x) => x.monat === m);
  const z = [];
  z.push(`## Messwerte Eberndorf`);
  z.push('');
  z.push(`Tageswerte für den Rasterpunkt ${String(ort.ort).replace(/\s*\(.*\)/, '')} (${zahl(ort.lat, 2)}° N, ${zahl(ort.lon, 2)}° O) aus dem 1-km-Raster SPARTACUS von GeoSphere Austria, ` +
    `Daten bis ${datumText(wt.bis, true)}. Verglichen mit dem Klimamittel ${klima.zeitraum} desselben Rasterpunkts (\`Grundlagen/klima.yaml\`). ` +
    `Rasterwerte sind aus Messstationen der Umgebung interpoliert, nicht in unserem Garten gemessen.`);
  z.push('');
  z.push('### Wichtige Tage');
  z.push('');
  const termin = (d, k, leer) => {
    const mtl = klima[k];
    const ref = mtl ? ` (Mittel ${datumText(`2001-${mtl.mittel}`)}, frühestens ${datumText(`2001-${mtl.fruehestens}`)}, spätestens ${datumText(`2001-${mtl.spaetestens}`)})` : '';
    return (d ? datumText(d) : leer) + ref;
  };
  z.push(`- **Letzter Frost im Frühjahr** (Minimum unter 0 °C): ${termin(wt.letzter_frost, 'letzter_frost', 'keiner')}`);
  z.push(`- **Letzte kühle Nacht unter 4 °C** (Bodenfrost möglich): ${termin(wt.letzte_kuehle_nacht, 'letzte_kuehle_nacht', 'keine')}`);
  if (wt.frost_nach_eisheiligen.length) z.push(`- **Frost nach den Eisheiligen:** ${wt.frost_nach_eisheiligen.map(kurz).join(', ')}`);
  z.push(`- **Erster Frost im Herbst:** ${termin(wt.erster_frost, 'erster_frost', `bis ${datumText(wt.bis)} noch keiner`)}`);
  if (wt.heissester_tag) z.push(`- **Heißester Tag:** ${datumText(wt.heissester_tag.datum)} mit ${zahl(wt.heissester_tag.tx)} °C`);
  if (wt.kaeltester_tag) z.push(`- **Kältester Tag:** ${datumText(wt.kaeltester_tag.datum)} mit ${zahl(wt.kaeltester_tag.tn)} °C`);
  z.push(`- **Hitzewellen** (mindestens ${GRENZEN.hitzewelle} Tage ab ${GRENZEN.hitze} °C): ` +
    (wt.hitzewellen.length ? wt.hitzewellen.map((h) => `${kurz(h.von)}–${kurz(h.bis)} (${h.tage} Tage, bis ${zahl(h.max)} °C)`).join('; ') : 'keine'));
  z.push(`- **Längste Trockenphasen März–Oktober** (Tage unter ${GRENZEN.regen} mm): ` +
    (wt.trockenphasen.length ? wt.trockenphasen.map((t) => `${kurz(t.von)}–${kurz(t.bis)} (${t.tage} Tage)`).join('; ') : 'keine'));
  z.push(`- **Starkregen** (ab ${GRENZEN.starkregen} mm am Tag): ` +
    (wt.starkregen.length ? wt.starkregen.map((s) => `${kurz(s.datum)} ${zahl(s.rr, 0)} mm`).join(', ') : 'keiner'));
  z.push('');
  z.push('### Monate');
  z.push('');
  z.push('| Monat | Temperatur Ø | Abweichung | Tmin / Tmax Ø | Niederschlag | vom Mittel | Sonne | vom Mittel | Frosttage | Hitzetage |');
  z.push('|---|---|---|---|---|---|---|---|---|---|');
  const zeile = (name, w, k, voll) => {
    const vg = (v, ref, fmt) => (voll && ref != null ? fmt(v, ref) : '–');
    return `| ${name} | ${zahl(w.tm)} °C | ${vg(w.tm, k?.tm, (a, b) => abw(a - b))} | ${zahl(w.tn)} / ${zahl(w.tx)} °C | ` +
      `${zahl(w.rr, 0)} mm | ${vg(w.rr, k?.rr, prozent)} | ${zahl(w.sonne, 0)} h | ${vg(w.sonne, k?.sonne, prozent)} | ` +
      `${w.frosttage}${voll && k ? ` (Ø ${zahl(k.frosttage, 0)})` : ''} | ${w.hitzetage}${voll && k ? ` (Ø ${zahl(k.hitzetage, 0)})` : ''} |`;
  };
  for (const m of monate) z.push(zeile(m.vollstaendig ? MONATE[m.monat - 1] : `${MONATE[m.monat - 1]} (bis ${kurz(m.bis)})`, m, km(m.monat), m.vollstaendig));
  const voll = monate.filter((m) => m.vollstaendig);
  const bereich = (von, bisM, name) => {
    const nr = []; for (let m = von; m <= bisM; m++) nr.push(m);
    const ms = voll.filter((m) => nr.includes(m.monat));
    if (ms.length !== nr.length) return;
    z.push(zeile(`**${name}**`, zusammen(ms), klimaZusammen(klima, nr, jahr), true));
  };
  bereich(4, 10, 'April–Oktober');
  if (voll.length && voll[0].monat === 1) {
    const letzter = Math.max(...voll.filter((m, i) => m.monat === i + 1).map((m) => m.monat));
    bereich(1, letzter, letzter === 12 ? 'Jahr' : `Jänner–${MONATE[letzter - 1]}`);
  }
  z.push('');
  z.push(`Temperatur Ø = Mittel aus Tagesminimum und Tagesmaximum. Niederschlag je Tag von 7 bis 7 Uhr. ` +
    `Frosttage: Minimum unter 0 °C, Hitzetage: Maximum ab 30 °C; in Klammern das Mittel ${klima.zeitraum}. ` +
    `Unvollständige Monate werden nicht verglichen.`);
  return z.join('\n');
}

export const MARKE_START = '<!-- wetter:start – erzeugt mit `npm run wetter -- <Jahr>`, nicht von Hand ändern -->';
export const MARKE_ENDE = '<!-- wetter:ende -->';
export const QUELLE_ZEILE = '- [GeoSphere Austria Data Hub: SPARTACUS v2, Tageswerte im 1-km-Raster](https://data.hub.geosphere.at/dataset/spartacus-v2-1d-1km) (CC BY 4.0) – Messwerte Eberndorf, abgerufen mit `npm run wetter`';

// Den erzeugten Abschnitt in eine Wetter.md einsetzen oder ersetzen; recherchierte Teile bleiben unberührt
export function einsetzen(text, abschnitt) {
  const block = `${MARKE_START.replace('<Jahr>', abschnitt.jahr)}\n${abschnitt.markdown}\n${MARKE_ENDE}`;
  const re = /<!-- wetter:start[^\n]*-->[\s\S]*?<!-- wetter:ende -->/;
  let neu;
  if (re.test(text)) neu = text.replace(re, () => block);
  else {
    const zeilen = text.split('\n');
    let i = zeilen.findIndex((l) => /^## Monatsübersicht/.test(l));
    if (i < 0) i = zeilen.findIndex((l) => /^## Quellen/.test(l));
    if (i < 0) neu = `${text.replace(/\n*$/, '')}\n\n${block}\n`;
    else neu = [...zeilen.slice(0, i), block, '', ...zeilen.slice(i)].join('\n');
  }
  if (!neu.includes(QUELLE_ZEILE) && /^## Quellen/m.test(neu)) {
    neu = neu.replace(/^## Quellen\n+/m, (m) => `${m}${QUELLE_ZEILE}\n`);
  }
  return neu;
}
