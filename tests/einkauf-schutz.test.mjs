// Unit-Tests: Gründüngung (Rolle G), Pflanzenschutz-Steckbriefe, Einkaufsliste, Überschrift-Anker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { validiereKulturen, validiereSchaedlinge, schaedlingeVon, bezugVon, einkaufsliste, saatmengeFuer, ueberschriftAnker, TYPEN } from '../beetplaner/modell.js';
import { NATURJAHRESZEITEN } from '../beetplaner/naturjahr.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'Gemüsegarten');
const lade = (p) => yaml.load(readFileSync(join(root, p), 'utf8'));
const kulturen = lade('Grundlagen/kulturen.yaml');
const familien = lade('Grundlagen/familien.yaml');
const schaedlinge = lade('Grundlagen/schaedlinge.yaml');
const plan2026 = lade('2026/plan.yaml');
const nj = NATURJAHRESZEITEN.map((s) => s.id);

test('Gründüngung: Rolle G braucht winter, saatmenge und ende', () => {
  assert.equal(TYPEN.G, 'Gründüngung');
  const basis = { ...kulturen.phacelia };
  assert.deepEqual(validiereKulturen({ phacelia: basis }, familien, nj), []);
  const ohne = { ...basis, gruenduengung: undefined };
  assert.match(validiereKulturen({ phacelia: ohne }, familien, nj).join(), /braucht das Feld „gruenduengung“/);
  const falsch = { ...basis, gruenduengung: { ...basis.gruenduengung, winter: 'halb' } };
  assert.match(validiereKulturen({ phacelia: falsch }, familien, nj).join(), /winter „halb“ ungültig/);
  assert.match(validiereKulturen({ x: { ...basis, rollen: ['Z'] } }, familien, nj).join(), /rollen nur V, H, N, B, G/);
});

test('Gründüngung: angelegte Arten sind gültig, keine Kreuzblütler', () => {
  const gd = Object.entries(kulturen).filter(([, k]) => k.rollen.includes('G'));
  assert.deepEqual(gd.map(([id]) => id).sort(), ['buchweizen', 'inkarnatklee', 'phacelia', 'zottelwicke']);
  for (const [id, k] of gd) {
    assert.ok(['abfrierend', 'winterhart'].includes(k.gruenduengung.winter), id);
    assert.notEqual(k.familie, 'Kreuzblütler', `${id}: Kreuzblütler-Gründüngung passt nicht zur Kohl-Fruchtfolge`);
  }
});

test('Pflanzenschutz: schaedlinge.yaml ist gültig und mit den Kulturen verknüpft', () => {
  assert.deepEqual(validiereSchaedlinge(schaedlinge, kulturen), []);
  assert.deepEqual(schaedlingeVon('knollensellerie', schaedlinge).map(([id]) => id), ['wuehlmaus']);
  assert.deepEqual(schaedlingeVon('paprika', schaedlinge).map(([id]) => id), ['raupen_paprika']);
  assert.equal(schaedlinge.raupen_paprika.bestimmt, false);
  const kaputt = { x: { name: 'X', art: 'Pilz', betrifft: ['gibtsnicht'], erkennen: 'e', vorbeugen: 'kein array', handeln: [], quellen: [{ titel: 't', url: 'http://unsicher' }] } };
  const f = validiereSchaedlinge(kaputt, kulturen).join('\n');
  assert.match(f, /art „Pilz“ ungültig/);
  assert.match(f, /„gibtsnicht“ gibt es nicht/);
  assert.match(f, /vorbeugen muss eine Liste sein/);
  assert.match(f, /https-url/);
});

test('Einkauf: Bezug aus dem Plan oder aus dem Anbau der Kultur', () => {
  assert.deepEqual(bezugVon({}, { anbau: 'Jungpflanze, vertikal am Gitter' }), { bezug: 'jungpflanze', sicher: true });
  assert.deepEqual(bezugVon({}, { anbau: 'Direktsaat, 4 Bohnen je Stange' }), { bezug: 'saatgut', sicher: true });
  assert.deepEqual(bezugVon({}, { anbau: 'Steckzwiebeln' }), { bezug: 'steckgut', sicher: true });
  assert.deepEqual(bezugVon({}, { anbau: 'Zehen stecken (Hardneck-Sorten)' }), { bezug: 'steckgut', sicher: true });
  assert.deepEqual(bezugVon({}, { anbau: 'Jungpflanze oder Direktsaat' }), { bezug: 'jungpflanze', sicher: false });
  assert.deepEqual(bezugVon({ bezug: 'saatgut' }, { anbau: 'Jungpflanze oder Direktsaat' }), { bezug: 'saatgut', sicher: true });
});

test('Einkauf: Liste 2026 nach Bezug, Stückzahlen und frühestem Termin', () => {
  const e = einkaufsliste(plan2026, kulturen);
  const finde = (b, k) => e[b].find((x) => x.kultur === k);
  assert.equal(finde('saatgut', 'feuerbohne').anzahl, 20);
  assert.equal(finde('jungpflanze', 'tomate').anzahl, 8);
  assert.deepEqual(finde('jungpflanze', 'tomate').flaechen, ['tomatenhaus']);
  assert.ok(finde('steckgut', 'zwiebel'));
  assert.equal(finde('jungpflanze', 'kohlrabi').unsicher, true);
  const sommerlauch = finde('jungpflanze', 'sommerlauch');
  assert.equal(sommerlauch.ab.toISOString().slice(0, 10), '2026-04-15');
  const ab = e.jungpflanze.map((x) => x.ab.getTime());
  assert.deepEqual(ab, [...ab].sort((a, b) => a - b));
  const vorhanden = einkaufsliste({ pflanzungen: [{ id: 'a', kultur: 'tomate', flaeche: 'tomatenhaus', bezug: 'vorhanden', von: '2027-05-15', punkte: [[10, 10]] }] }, kulturen);
  assert.equal(vorhanden.jungpflanze.length, 0);
});

test('Einkauf: Saatmenge für eine Fläche', () => {
  assert.equal(saatmengeFuer('ca. 1–2 g/m² (Faustwert)', 4.5), '4,5–9 g');
  assert.equal(saatmengeFuer('5 g/m²', 2), '10 g');
  assert.equal(saatmengeFuer('nach Packung', 2), null);
});

test('Überschrift-Anker wie auf GitHub', () => {
  assert.equal(ueberschriftAnker('Wühlmaus (Schermaus)'), 'wühlmaus-schermaus');
  assert.equal(ueberschriftAnker('Phacelia (Bienenfreund)'), 'phacelia-bienenfreund');
  assert.equal(ueberschriftAnker('Flower Sprouts'), 'flower-sprouts');
});
