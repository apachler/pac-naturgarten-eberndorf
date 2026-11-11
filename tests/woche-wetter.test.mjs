// Unit-Tests: Wetterwarnungen, „Diese Woche im Garten“, Folgesaat, Merkliste.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { wocheImGarten, folgesaatFaellig, merklisteFaellig, imBeetAm, validiereKulturen, datum } from '../beetplaner/modell.js';
import { wetterHinweise, tageAusOpenMeteo, vorhersageUrl, tagKurz } from '../beetplaner/wetter.js';
import { NATURJAHRESZEITEN } from '../beetplaner/naturjahr.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'Gemüsegarten');
const lade = (p) => yaml.load(readFileSync(join(root, p), 'utf8'));
const kulturen = lade('Grundlagen/kulturen.yaml');
const familien = lade('Grundlagen/familien.yaml');
const plan2026 = lade('2026/plan.yaml');
const merkliste = readFileSync(join(root, 'Grundlagen', 'Merkliste.md'), 'utf8');
const mo = (s) => new Date(`${s}T00:00:00Z`);

// Tage ab 7 Tage vor `heute` bis 6 Tage danach; einzelne Tage überschreiben
function tage(heute, anders = {}) {
  const t = [];
  for (let i = -7; i < 7; i++) {
    const d = new Date(mo(heute).getTime() + i * 86400000).toISOString().slice(0, 10);
    t.push({ datum: d, tn: 8, tx: 20, rr: 2, ...(anders[d] || {}) });
  }
  return t;
}

test('Wetter: Vorhersage-URL und Tageswerte von Open-Meteo', () => {
  const url = vorhersageUrl({ lat: 46.58, lon: 14.64 });
  assert.match(url, /latitude=46\.58&longitude=14\.64/);
  assert.match(url, /past_days=7&forecast_days=7/);
  const json = { daily: { time: ['2026-05-13'], temperature_2m_min: [-1.2], temperature_2m_max: [14], precipitation_sum: [0.4] } };
  assert.deepEqual(tageAusOpenMeteo(json), [{ datum: '2026-05-13', tn: -1.2, tx: 14, rr: 0.4 }]);
  assert.equal(tagKurz('2026-05-13'), 'Mi 13.5.');
});

test('Wetter: Frost nennt, was abzudecken ist und welche Pflanzung warten soll', () => {
  const tomate = { name: 'Tomate', frost: true, wasser: 'hoch' };
  const kohl = { name: 'Kohlsprossen', frost: false, wasser: 'mittel' };
  const fisole = { name: 'Feuerbohne', frost: true, wasser: 'mittel' };
  const h = wetterHinweise({ tage: tage('2026-05-11', { '2026-05-13': { tn: -1.2 } }), heute: '2026-05-11', imBeet: [fisole, kohl], bald: [tomate] });
  assert.equal(h[0].art, 'frost');
  assert.equal(h[0].titel, 'Frost erwartet');
  assert.match(h[0].text, /−1,2 °C \(Mi 13\.5\.\)/);
  assert.match(h[0].text, /Abdecken \(Vlies\): Feuerbohne\./);
  assert.match(h[0].text, /verschieben: Tomate\./);
  assert.doesNotMatch(h[0].text, /Kohlsprossen/);
});

test('Wetter: Bodenfrost, Frost ohne Empfindliches, Hitze, Trockenphase, Starkregen', () => {
  const tomate = { name: 'Tomate', frost: true, wasser: 'hoch' };
  const kohl = { name: 'Kohlsprossen', frost: false, wasser: 'mittel', neu: true };
  assert.equal(wetterHinweise({ tage: tage('2026-05-11', { '2026-05-12': { tn: 2.5 } }), heute: '2026-05-11', imBeet: [tomate] })[0].titel, 'Bodenfrost möglich');
  assert.equal(wetterHinweise({ tage: tage('2026-11-11', { '2026-11-12': { tn: -4 } }), heute: '2026-11-11', imBeet: [kohl] })[0].art, 'info');
  const hitze = wetterHinweise({ tage: tage('2026-08-03', { '2026-08-04': { tx: 36.8 } }), heute: '2026-08-03', imBeet: [tomate, kohl] });
  assert.equal(hitze[0].art, 'hitze');
  assert.match(hitze[0].text, /Bis 37 °C .*Besonders durstig: Tomate\./);
  const trocken = wetterHinweise({ tage: tage('2026-07-20').map((t) => ({ ...t, rr: 0 })), heute: '2026-07-20', imBeet: [tomate, kohl] });
  assert.equal(trocken[0].art, 'trocken');
  assert.match(trocken[0].text, /frisch gesetzten: Kohlsprossen/);
  assert.equal(wetterHinweise({ tage: tage('2026-07-20').map((t) => ({ ...t, rr: 0 })), heute: '2026-07-20', imBeet: [] })[0].art, 'ok');
  const regen = wetterHinweise({ tage: tage('2026-09-07', { '2026-09-10': { rr: 51 } }), heute: '2026-09-07' });
  assert.equal(regen[0].art, 'regen');
  assert.equal(wetterHinweise({ tage: tage('2026-06-01'), heute: '2026-06-01', imBeet: [tomate] })[0].art, 'ok');
});

test('Woche: Säen, Pflanzen und Ernte-Ende aus dem Plan 2026', () => {
  const w = wocheImGarten(plan2026, kulturen, mo('2026-05-11'));
  assert.deepEqual(w.saen.map((e) => e.kultur).sort(), ['bohnenkraut', 'feuerbohne', 'petersilie']);
  assert.ok(w.pflanzen.some((e) => e.kultur === 'tomate' && e.flaeche === 'tomatenhaus'));
  assert.ok(w.pflanzen.some((e) => e.kultur === 'paprika'));
  const leer = wocheImGarten(plan2026, kulturen, mo('2026-05-04'));
  assert.deepEqual(Object.values(leer).flat(), []);
});

test('Folgesaat: alle n Wochen in den erlaubten Monaten, solange die Pflanzung läuft', () => {
  const f = validiereKulturen({ ...kulturen, radieschen: { ...kulturen.radieschen, folgesaat: { alle: 0, monate: [13] } } }, familien, NATURJAHRESZEITEN.map((s) => s.id));
  assert.deepEqual(f, ['radieschen: folgesaat.alle muss eine ganze Zahl (Wochen) sein', 'radieschen: folgesaat.monate muss eine Liste von Monaten 1–12 sein']);
  const name = (d) => folgesaatFaellig(plan2026, kulturen, mo(d)).map((f) => `${f.kultur}:${f.wochen}`);
  assert.deepEqual(name('2026-03-16'), ['radieschen:3']);
  assert.deepEqual(name('2026-03-23'), []);
  assert.deepEqual(name('2026-04-06'), ['radieschen:6']);
  assert.deepEqual(name('2026-05-11'), ['dill:4']);
  assert.deepEqual(name('2026-05-25'), []);   // Radieschen bis 31.5. – kein neuer Satz mehr sinnvoll
});

test('Merkliste: Punkte mit Zeitraum erscheinen in der passenden Woche', () => {
  const md = '- [ ] **Gründüngung (Juli 2027):** nach der Ernte **säen**\n- [ ] **Kohlsprossen (Dezember 2026–März 2027):** beobachten\n- [x] **Erledigt (Juli 2027):** x\n- [ ] **Ohne Zeit:** y\n- [ ] **Paprika (Juli–September 2027):** Fotos';
  assert.deepEqual(merklisteFaellig(md, mo('2027-07-05')), [{ titel: 'Gründüngung', text: 'nach der Ernte säen' }, { titel: 'Paprika', text: 'Fotos' }]);
  assert.deepEqual(merklisteFaellig(md, mo('2027-01-04')).map((m) => m.titel), ['Kohlsprossen']);
  assert.deepEqual(merklisteFaellig(md, mo('2026-11-30')).map((m) => m.titel), ['Kohlsprossen']);   // Woche reicht in den Dezember
  assert.deepEqual(merklisteFaellig(md, mo('2027-05-03')), []);
  assert.ok(merklisteFaellig(merkliste, mo('2027-07-05')).some((m) => m.titel.startsWith('Gründüngung')));
});

test('Im Beet: tatsächliche Termine, „steht im Beet“ bleibt', () => {
  const ids = imBeetAm(plan2026, datum('2026-11-11')).map((p) => p.id);
  assert.ok(ids.includes('kohlsprossen'));
  assert.ok(!ids.includes('paprika'));
  assert.ok(imBeetAm(plan2026, datum('2026-06-15')).some((p) => p.id === 'paprika'));
});

test('Notiz vom Handy: vorausgefülltes GitHub-Issue mit Datum, Fläche und Kultur', async () => {
  const { notizIssueUrl, NOTIZ_ARTEN } = await import('../beetplaner/modell.js');
  const u = new URL(notizIssueUrl({
    datum: '2027-05-12', art: 'Ernte', flaeche: { id: 'ost', name: 'Beet Ost' }, kultur: { id: 'kohlrabi', name: 'Kohlrabi' },
    pflanzung: 'kohlrabi_frueh', ernte: '+', text: '  3 Stück geerntet  ',
  }));
  assert.equal(u.origin + u.pathname, 'https://github.com/apachler/pac-naturgarten-eberndorf/issues/new');
  assert.equal(u.searchParams.get('title'), 'Saisonnotiz 12.5.2027: Ernte Kohlrabi (Beet Ost)');
  const body = u.searchParams.get('body');
  assert.match(body, /^<!-- saisonnotiz -->/);
  assert.match(body, /- \*\*Kultur:\*\* Kohlrabi \(`kohlrabi`, Pflanzung `kohlrabi_frueh`\)/);
  assert.match(body, /- \*\*Ernte:\*\* \+\n\n3 Stück geerntet\n/);
  const ohne = new URL(notizIssueUrl({ datum: '2027-07-01', art: 'Wetter', text: 'Hagel' }));
  assert.equal(ohne.searchParams.get('title'), 'Saisonnotiz 1.7.2027: Wetter');
  assert.doesNotMatch(ohne.searchParams.get('body'), /Fläche|Kultur|Ernte:/);
  assert.ok(NOTIZ_ARTEN.includes('Schädling oder Krankheit'));
});
