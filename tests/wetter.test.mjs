// Unit-Tests für die Wetter-Auswertung (beetplaner/wetter.js) – ohne Netz, mit erfundenen Tageswerten.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import {
  tageAusGeosphere, monatswerte, klimamittel, wichtigeTage, abschnitte, tagImJahr, ausTagImJahr,
  zahl, abw, wetterMarkdown, einsetzen, QUELLE_ZEILE,
} from '../beetplaner/wetter.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'Gemüsegarten');

// Ein ganzes Jahr mit gleichmäßigem Wetter; einzelne Tage per Funktion überschreiben
function jahr(j, anders = () => ({})) {
  const tage = [];
  for (let d = new Date(Date.UTC(j, 0, 1)); d.getUTCFullYear() === j; d.setUTCDate(d.getUTCDate() + 1)) {
    const datum = d.toISOString().slice(0, 10);
    tage.push({ datum, tn: 5, tx: 15, rr: 2, sonne: 5, ...anders(datum) });
  }
  return tage;
}

test('Wetter: Tageswerte aus der GeoSphere-Antwort, Sonne in Stunden', () => {
  const json = {
    timestamps: ['2026-07-01T00:00+00:00', '2026-07-02T00:00+00:00'],
    features: [{ properties: { parameters: { TN: { data: [14.1, 16.3] }, TX: { data: [31.2, 27.8] }, RR: { data: [3.2, 0] }, SA: { data: [36000, null] } } } }],
  };
  assert.deepEqual(tageAusGeosphere(json), [
    { datum: '2026-07-01', tn: 14.1, tx: 31.2, rr: 3.2, sonne: 10 },
    { datum: '2026-07-02', tn: 16.3, tx: 27.8, rr: 0, sonne: null },
  ]);
});

test('Wetter: Monatswerte mit Kenntagen und unvollständigem Monat', () => {
  const t = jahr(2026, (d) => (d === '2026-01-05' ? { tn: -3, tx: -1 } : d === '2026-07-10' ? { tx: 31, rr: 25 } : {}))
    .filter((x) => x.datum <= '2026-11-09');
  const m = monatswerte(t, 2026);
  assert.equal(m.length, 11);
  const jan = m[0], jul = m[6], nov = m[10];
  assert.equal(jan.tage, 31);
  assert.equal(jan.frosttage, 1);
  assert.equal(jan.eistage, 1);
  assert.equal(jan.rr, 62);
  assert.equal(jan.sonne, 155);
  assert.equal(jul.hitzetage, 1);
  assert.equal(jul.sommertage, 1);
  assert.equal(jul.starkregentage, 1);
  assert.equal(jul.regentage, 31);
  assert.equal(nov.vollstaendig, false);
  assert.equal(nov.bis, '2026-11-09');
  assert.ok(m.slice(0, 10).every((x) => x.vollstaendig));
});

test('Wetter: Frosttermine, Hitzewellen, Trockenphasen, Starkregen', () => {
  const t = jahr(2026, (d) => {
    if (d === '2026-04-20' || d === '2026-05-13') return { tn: -1 };
    if (d === '2026-05-20') return { tn: 3 };
    if (d >= '2026-07-28' && d <= '2026-08-07') return { tx: d === '2026-08-04' ? 36.8 : 32 };
    if (d >= '2026-06-01' && d <= '2026-06-02') return { tx: 31 };   // nur 2 Tage: keine Hitzewelle
    if (d >= '2026-03-27' && d <= '2026-04-13') return { rr: 0.4 };
    if (d === '2026-09-10') return { rr: 51 };
    if (d === '2026-10-23') return { tn: -0.5 };
    return {};
  });
  const w = wichtigeTage(t, 2026);
  assert.equal(w.letzter_frost, '2026-05-13');
  assert.equal(w.letzte_kuehle_nacht, '2026-05-20');
  assert.equal(w.erster_frost, '2026-10-23');
  assert.deepEqual(w.frost_nach_eisheiligen, []);
  assert.deepEqual(w.heissester_tag, { datum: '2026-08-04', tx: 36.8 });
  assert.deepEqual(w.hitzewellen, [{ von: '2026-07-28', bis: '2026-08-07', tage: 11, max: 36.8 }]);
  assert.deepEqual(w.trockenphasen[0], { von: '2026-03-27', bis: '2026-04-13', tage: 18 });
  assert.deepEqual(w.starkregen, [{ datum: '2026-09-10', rr: 51 }]);
});

test('Wetter: Abschnitte enden an Datumslücken', () => {
  const t = [
    { datum: '2026-07-01', tx: 31 }, { datum: '2026-07-02', tx: 31 }, { datum: '2026-07-04', tx: 31 }, { datum: '2026-07-05', tx: 31 },
  ];
  assert.deepEqual(abschnitte(t, (x) => x.tx >= 30).map((a) => [a.von, a.bis, a.tage]), [['2026-07-01', '2026-07-02', 2], ['2026-07-04', '2026-07-05', 2]]);
});

test('Wetter: Klimamittel je Monat und Frosttermine über mehrere Jahre', () => {
  const t = [
    ...jahr(2001, (d) => (d === '2001-04-10' ? { tn: -2 } : d === '2001-10-20' ? { tn: -1 } : {})),
    ...jahr(2002, (d) => (d === '2002-04-20' ? { tn: -2 } : d === '2002-10-30' ? { tn: -1 } : { rr: 4 })),
  ];
  const k = klimamittel(t, 2001, 2002);
  assert.equal(k.zeitraum, '2001–2002');
  assert.equal(k.monate.length, 12);
  assert.equal(k.monate[0].tm, 10);
  assert.equal(k.monate[0].rr, 93);   // (62 + 124) / 2
  assert.equal(k.monate[3].frosttage, 1);
  assert.deepEqual(k.letzter_frost, { mittel: '04-15', fruehestens: '04-10', spaetestens: '04-20', jahre: 2 });
  assert.deepEqual(k.erster_frost, { mittel: '10-25', fruehestens: '10-20', spaetestens: '10-30', jahre: 2 });
});

test('Wetter: Tag im Jahr und Zahlen im österreichischen Format', () => {
  assert.equal(tagImJahr('2026-01-01'), 1);
  assert.equal(tagImJahr('04-15'), 105);
  assert.equal(ausTagImJahr(105), '04-15');
  assert.equal(zahl(-16.73), '−16,7');
  assert.equal(zahl(651.4, 0), '651');
  assert.equal(abw(1.66), '+1,7');
  assert.equal(abw(-0.04), '±0,0');
  assert.equal(zahl(null), '–');
});

test('Wetter: Markdown vergleicht nur vollständige Monate und fasst April–Oktober zusammen', () => {
  const klima = klimamittel([...jahr(2001), ...jahr(2002)], 2001, 2002);
  const t = jahr(2026, () => ({ tn: 6, tx: 16 })).filter((x) => x.datum <= '2026-11-09');
  const md = wetterMarkdown({ jahr: 2026, tage: t, klima, ort: { ort: 'Eberndorf (Jauntal, Kärnten)', lat: 46.58, lon: 14.64 } });
  assert.match(md, /Rasterpunkt Eberndorf \(46,58° N, 14,64° O\)/);
  assert.match(md, /\| Jänner \| 11,0 °C \| \+1,0 \|/);
  assert.match(md, /\| November \(bis 9\.11\.\) \| 11,0 °C \| – \|/);
  assert.match(md, /\| \*\*April–Oktober\*\* \| 11,0 °C \| \+1,0 \|/);
  assert.match(md, /\| \*\*Jänner–Oktober\*\* \|/);
  assert.match(md, /Erster Frost im Herbst:\*\* bis 9\. November noch keiner/);
});

test('Wetter: Abschnitt einsetzen ist wiederholbar und lässt Recherche stehen', () => {
  const vorlage = '# Wetter\n\n## Kurzfassung\n\n- recherchiert\n\n## Monatsübersicht Kärnten\n\n| x |\n\n## Quellen\n\n- [ORF](https://orf.at)\n';
  const eins = einsetzen(vorlage, { jahr: 2026, markdown: '## Messwerte Eberndorf\n\nalt' });
  assert.ok(eins.indexOf('## Messwerte Eberndorf') < eins.indexOf('## Monatsübersicht Kärnten'));
  assert.ok(eins.includes('- recherchiert'));
  assert.ok(eins.includes(QUELLE_ZEILE));
  const zwei = einsetzen(eins, { jahr: 2026, markdown: '## Messwerte Eberndorf\n\nneu' });
  assert.ok(zwei.includes('neu') && !zwei.includes('\nalt\n'));
  assert.equal(zwei.split('wetter:start').length, 2);
  assert.equal(zwei.split(QUELLE_ZEILE).length, 2);
  assert.equal(einsetzen(zwei, { jahr: 2026, markdown: '## Messwerte Eberndorf\n\nneu' }), zwei);
});

test('Wetter: klima.yaml ist vollständig (Klimamittel 1991–2020)', () => {
  const k = yaml.load(readFileSync(join(root, 'Grundlagen', 'klima.yaml'), 'utf8'));
  assert.equal(k.zeitraum, '1991–2020');
  assert.deepEqual(k.monate.map((m) => m.monat), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  for (const m of k.monate) for (const f of ['tm', 'tn', 'tx', 'rr', 'sonne', 'frosttage', 'hitzetage']) assert.equal(typeof m[f], 'number', `Monat ${m.monat}: ${f}`);
  for (const f of ['letzter_frost', 'letzte_kuehle_nacht', 'erster_frost']) assert.match(k[f].mittel, /^\d\d-\d\d$/);
});
