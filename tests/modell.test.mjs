// Unit-Tests für die Planlogik (node:test). Aufruf: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { validiereKulturen, schlechteNachbarnVon, positionen, anzahlGeplant, aktivAm, aktivInWoche, montagVon, kalenderwoche, ort, hatIstLage, einteilung, datum, pruefen, huelle } from '../beetplaner/modell.js';
import { naturjahr, saisonAm, hopkins, GARTENJAHR, NATURJAHRESZEITEN } from '../beetplaner/naturjahr.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'Gemüsegarten');
const lade = (p) => yaml.load(readFileSync(join(root, p), 'utf8'));
const kulturen = lade('Grundlagen/kulturen.yaml');
const flaechen = lade('Grundlagen/flaechen.yaml');
const standort = lade('Grundlagen/standort.yaml');
const familien = lade('Grundlagen/familien.yaml');
const { jahre } = lade('jahre.yaml');
const plaene = jahre.map((j) => lade(j.plan));
const plan2026 = plaene.find((p) => p.jahr === 2026);
const finde = (id) => plan2026.pflanzungen.find((p) => p.id === id);

test('Positionen: Punkte mit je, Reihen gleichmäßig, Bereiche ohne Punkte', () => {
  assert.deepEqual(positionen({ punkte: [[30, 450]], je: 4 }), [{ x: 30, y: 450, n: 4 }]);
  const r = positionen({ reihen: [{ y: 70, x1: 20, x2: 140, anzahl: 5 }] });
  assert.deepEqual(r.map((q) => q.x), [20, 50, 80, 110, 140]);
  assert.ok(r.every((q) => q.y === 70));
  const ns = positionen({ reihen: [{ x: 10, y1: 0, y2: 100, anzahl: 3 }] });
  assert.deepEqual(ns.map((q) => [q.x, q.y]), [[10, 0], [10, 50], [10, 100]]);
  assert.deepEqual(positionen({ reihen: [{ y: 5, x1: 0, x2: 100, anzahl: 1 }] }).map((q) => q.x), [50]);
  assert.deepEqual(positionen({ bereich: { x: 0, y: 0, b: 10, t: 10 } }), []);
});

test('Stückzahlen: Punkte × je, Reihen, Bereiche nach Wunsch', () => {
  assert.equal(anzahlGeplant(finde('feuerbohne')), 20);
  assert.equal(anzahlGeplant(finde('karotte')), 30);
  assert.equal(anzahlGeplant(finde('sommerlauch')), 14);
  assert.equal(anzahlGeplant(finde('vogerlsalat')), 50);
});

test('Datum und Aktivität', () => {
  const p = { von: '2026-05-15', bis: '2026-10-31' };
  assert.equal(aktivAm(p, datum('2026-05-15')), true);
  assert.equal(aktivAm(p, datum('2026-10-31')), true);
  assert.equal(aktivAm(p, datum('2026-05-14')), false);
  assert.equal(aktivAm(p, datum('2026-11-01')), false);
  // YAML liefert Date-Objekte, beides muss gleich behandelt werden
  assert.equal(datum(new Date('2026-05-15T00:00:00Z')).getTime(), datum('2026-05-15').getTime());
});

test('Positionen 2026 entsprechen dem Positionsplan der Planung 2026', () => {
  // Stichproben aus Mischkultur-Beetplanung.md, Kapitel 6 (Ursprung Südwest-Ecke)
  const erwartet = {
    feuerbohne: [[30, 450], [90, 450], [150, 450], [210, 450], [270, 450]],
    bohnenkraut: [[60, 420], [120, 420], [180, 420], [240, 420]],
    kohlsprossen: [[30, 330], [30, 290], [90, 330], [90, 290]],
    gurke: [[150, 350], [150, 320], [150, 290]],
    paprika: [[30, 240], [30, 190], [80, 215]],
    pfefferoni: [[80, 250], [80, 180], [30, 165]],
    mangold: [[150, 240], [150, 200], [150, 160]],
    stangensellerie: [[220, 240], [260, 240], [220, 190], [260, 190]],
  };
  for (const [id, punkte] of Object.entries(erwartet)) {
    assert.deepEqual(positionen(finde(id)).map((q) => [q.x, q.y]), punkte, id);
  }
  const karotte = positionen(finde('karotte'));
  assert.deepEqual([...new Set(karotte.map((q) => q.y))], [155, 115, 85]);
  assert.equal(Math.min(...karotte.map((q) => q.x)), 15);
  assert.equal(Math.max(...karotte.map((q) => q.x)), 285);
  const ringel = positionen(finde('ringelblume')).map((q) => [q.x, q.y]);
  assert.deepEqual(ringel.slice(0, 2), [[80, 20], [220, 20]]);
});

test('Alle Pläne: gültige Daten, keine Fehler in der Prüfung', () => {
  for (const plan of plaene) {
    const m = pruefen({ plan, kulturen, flaechen, vorjahre: plaene });
    const fehler = m.filter((x) => x.stufe === 'fehler');
    assert.deepEqual(fehler, [], `${plan.jahr}: ${fehler.map((f) => f.text).join(' | ')}`);
    for (const p of plan.pflanzungen) {
      assert.ok(kulturen[p.kultur], `${plan.jahr}/${p.id}: Kultur ${p.kultur} fehlt`);
      assert.ok(flaechen[p.flaeche], `${plan.jahr}/${p.id}: Fläche ${p.flaeche} fehlt`);
      assert.ok(datum(p.von) <= datum(p.bis), `${plan.jahr}/${p.id}: von nach bis`);
    }
  }
});

test('Prüfung findet die bekannten Planungsfehler 2026', () => {
  const m = pruefen({ plan: plan2026, kulturen, flaechen, vorjahre: plaene });
  const hat = (thema, teil) => m.some((x) => x.thema === thema && x.text.includes(teil));
  assert.ok(hat('Stückzahl', 'Sommerlauch: 14 Pflanzen positioniert, gewünscht sind 20'));
  assert.ok(hat('Stückzahl', 'Knollensellerie: 9 Pflanzen positioniert, gewünscht sind 10'));
  assert.ok(hat('Nachbarn', 'Feuerbohne und Winterlauch'));
  assert.ok(hat('Abstand', 'Kohlsprossen untereinander'));
  assert.ok(hat('Platz', 'Wirsing soll ab'));
  assert.ok(m.some((x) => x.thema === 'Stückzahl' && x.stufe === 'hinweis' && x.text.startsWith('Kohlsprossen')), 'Kohlsprossen begründet → nur Hinweis');
});

test('Prüfung: Grenzen, Wege, Frost, Fruchtfolge, Datenfehler', () => {
  const basis = { jahr: 2027, flaechen: { ost: { rolle: 'aktiv', wege: [{ name: 'Pfad', y: 200, t: 30 }] } } };
  const plan = {
    ...basis,
    pflanzungen: [
      { id: 'a', kultur: 'paprika', flaeche: 'ost', typ: 'H', von: '2027-05-01', bis: '2027-10-01', punkte: [[400, 10]] },
      { id: 'b', kultur: 'mangold', flaeche: 'ost', typ: 'H', von: '2027-05-20', bis: '2027-10-01', punkte: [[100, 215]] },
      { id: 'c', kultur: 'kohlrabi', flaeche: 'ost', typ: 'H', von: '2027-05-20', bis: '2027-08-01', punkte: [[50, 50]] },
      { id: 'd', kultur: 'gibtsnicht', flaeche: 'ost', typ: 'H', von: '2027-05-20', bis: '2027-08-01', punkte: [[50, 50]] },
    ],
  };
  const vorjahr = { jahr: 2025, pflanzungen: [{ id: 'fs', kultur: 'flower_sprouts', flaeche: 'ost', von: '2025-07-15', bis: '2025-12-31', bereich: { x: 0, y: 0, b: 300, t: 125 } }] };
  const m = pruefen({ plan, kulturen, flaechen, vorjahre: [vorjahr] });
  const themen = (id) => m.filter((x) => x.ids.includes(id)).map((x) => x.thema);
  assert.ok(themen('a').includes('Grenzen'));
  assert.ok(themen('a').includes('Frost'));
  assert.ok(themen('b').includes('Wege'));
  assert.ok(themen('c').includes('Fruchtfolge'));
  assert.ok(m.some((x) => x.stufe === 'fehler' && x.ids.includes('d')));
});

test('Hülle eines Bereichs und einer Punktgruppe', () => {
  assert.deepEqual(huelle({ bereich: { x: 1, y: 2, b: 3, t: 4 } }), { x: 1, y: 2, b: 3, t: 4 });
  const h = huelle({ punkte: [[100, 100], [200, 100]] }, { abstand: 40 });
  assert.deepEqual(h, { x: 80, y: 80, b: 140, t: 40 });
});

test('Naturjahreszeiten Eberndorf (Hopkins-Regel wie naturgarten.bio)', () => {
  assert.equal(hopkins('fullSpring', standort.lat, standort.hoehe), -11); // 4·(46,58−51) + 3,3·(465−250)/100 = −10,6
  assert.equal(hopkins('winter', standort.lat, standort.hoehe), 11);
  const nj = naturjahr(2027, standort);
  assert.equal(nj.length, 10);
  for (let i = 1; i < nj.length; i++) assert.ok(nj[i].beginn > nj[i - 1].beginn, 'Reihenfolge');
  assert.equal(nj.find((s) => s.id === 'fullSpring').beginn.toISOString().slice(0, 10), '2027-04-15');
  assert.equal(saisonAm(datum('2027-01-10'), standort).id, 'winter');
  assert.equal(saisonAm(datum('2027-06-15'), standort).id, 'highSummer');
  for (const s of NATURJAHRESZEITEN) assert.ok(GARTENJAHR[s.id]?.length, `Gartenjahr ${s.id}`);
});

test('Wochen: Montag, Kalenderwoche und Aktivität in der Woche', () => {
  assert.equal(montagVon(datum('2026-06-17')).toISOString().slice(0, 10), '2026-06-15');
  assert.equal(montagVon(datum('2026-01-01')).toISOString().slice(0, 10), '2025-12-29');
  assert.equal(kalenderwoche(datum('2026-06-15')), 25);
  assert.equal(kalenderwoche(datum('2025-12-29')), 1);
  assert.equal(kalenderwoche(datum('2027-01-01')), 53);
  const p = { von: '2026-05-15', bis: '2026-10-31' };
  assert.equal(aktivInWoche(p, datum('2026-05-11')), true, 'Pflanzung am Freitag der Woche');
  assert.equal(aktivInWoche(p, datum('2026-05-04')), false);
  assert.equal(aktivInWoche(p, datum('2026-10-26')), true);
  assert.equal(aktivInWoche(p, datum('2026-11-02')), false);
});

test('Ist-Lage: tatsächliche Positionen 2026 und Fruchtfolge danach', () => {
  const bohne = finde('feuerbohne');
  assert.ok(hatIstLage(bohne));
  assert.deepEqual(positionen(ort(bohne, true)).map((q) => q.y), [490, 490, 490, 490, 490]);
  assert.equal(positionen(ort(bohne, true))[0].n, 5, 'je aus dem Ist-Stand');
  assert.deepEqual(positionen(ort(bohne, false)).map((q) => q.y), [450, 450, 450, 450, 450], 'Plan bleibt');
  assert.deepEqual(ort(finde('winterlauch'), true).bereich, { x: 0, y: 0, b: 150, t: 80 });
  assert.deepEqual(ort(finde('kohlrabi_frueh'), true).bereich, { x: 200, y: 0, b: 100, t: 80 });
  assert.equal(ort(finde('karotte'), true), finde('karotte'), 'ohne Ist-Lage gilt der Plan');
  // Ein Plan 2028 auf Beet West: Lauch dort, wo 2026 tatsächlich Winterlauch stand → Fruchtfolge-Warnung
  const p2028 = { jahr: 2028, flaechen: { west: { rolle: 'aktiv' } }, pflanzungen: [
    { id: 'l', kultur: 'sommerlauch', flaeche: 'west', typ: 'H', von: '2028-05-20', bis: '2028-09-01', punkte: [[60, 40]] },
    { id: 'k', kultur: 'karotte', flaeche: 'west', typ: 'H', von: '2028-04-01', bis: '2028-09-01', punkte: [[60, 470]] },
  ] };
  const m = pruefen({ plan: p2028, kulturen, flaechen, vorjahre: plaene });
  assert.ok(m.some((x) => x.thema === 'Fruchtfolge' && x.ids.includes('l')), 'Lauch auf Winterlauch-Fläche');
  assert.ok(!m.some((x) => x.thema === 'Fruchtfolge' && x.ids.includes('k')), 'Karotte am Nordrand ok');
});

test('Kultur-Datenquelle: vollständig und gültig', () => {
  const ids = NATURJAHRESZEITEN.map((s) => s.id);
  assert.deepEqual(validiereKulturen(kulturen, familien, ids), []);
  // Jede in einem Plan verwendete Kultur ist erfasst, jede Familie hat eine Anbaupause
  for (const plan of plaene) for (const p of plan.pflanzungen) assert.ok(kulturen[p.kultur], p.kultur);
  for (const [name, f] of Object.entries(familien)) assert.ok(Number.isInteger(f.anbaupause), name);
  // Die Validierung findet Fehler
  const kaputt = { x: { name: 'X', familie: 'Gibtsnicht', abstand: 0, wurzel: 'sehr tief', gut: ['nix'], schlecht: [], rollen: ['Z'], erfahrungen: [{ text: 'ohne Jahr' }] } };
  const f = validiereKulturen(kaputt, familien, ids).join(' | ');
  for (const teil of ['Pflichtfeld „botanisch“', 'Familie „Gibtsnicht“', 'wurzel „sehr tief“', 'gut-Nachbar „nix“', 'rollen nur', 'abstand muss', 'Erfahrung braucht']) assert.ok(f.includes(teil), teil);
});

test('Schlechte Nachbarn gelten in beide Richtungen', () => {
  const s = schlechteNachbarnVon('knoblauch', kulturen);
  assert.ok(s.includes('feuerbohne'));
  assert.ok(schlechteNachbarnVon('feuerbohne', kulturen).includes('knoblauch'));
});

test('Fruchtfolge mit Anbaupause je Familie und tatsächlicher Lage', () => {
  // Karotten (Doldenblütler, Pause 4) 2028 dort, wo 2026 Karotten standen → Warnung mit Anbaupause
  const plan = (jahr) => ({ jahr, flaechen: { west: { rolle: 'aktiv' } }, pflanzungen: [
    { id: 'k', kultur: 'karotte', flaeche: 'west', typ: 'H', von: `${jahr}-04-01`, bis: `${jahr}-09-01`, reihen: [{ y: 115, x1: 15, x2: 285, anzahl: 10 }] },
    { id: 'b', kultur: 'feuerbohne', flaeche: 'west', typ: 'H', von: `${jahr}-05-20`, bis: `${jahr}-10-01`, punkte: [[150, 300]] },
  ] });
  const m28 = pruefen({ plan: plan(2028), kulturen, flaechen, familien, vorjahre: plaene });
  assert.ok(m28.some((x) => x.thema === 'Fruchtfolge' && x.ids.includes('k') && x.text.includes('Anbaupause Doldenblütler: 4 Jahre')));
  // Bohnen 2028 bei Y 300: 2026 standen die Bohnen tatsächlich am Nordrand (Ist-Lage) → keine Warnung
  assert.ok(!m28.some((x) => x.thema === 'Fruchtfolge' && x.ids.includes('b')));
  // 2030: 4 Jahre nach 2026 – Anbaupause eingehalten
  const m30 = pruefen({ plan: plan(2030), kulturen, flaechen, familien, vorjahre: plaene });
  assert.ok(!m30.some((x) => x.thema === 'Fruchtfolge' && x.ids.includes('k')));
});

test('Kulturwissen.md ist aus den YAML-Daten erzeugt und aktuell', async () => {
  const { execFileSync } = await import('node:child_process');
  const aus = execFileSync(process.execPath, [join(root, '..', 'beetplaner', 'kulturwissen.mjs'), '--check'], { encoding: 'utf8' });
  assert.match(aus, /aktuell/);
  const md = readFileSync(join(root, 'Grundlagen', 'Kulturwissen.md'), 'utf8');
  for (const k of Object.values(kulturen)) assert.ok(md.includes(`#### ${k.name}`), k.name);
});

test('Tatsächliche Einteilung 2026: Zone A schmaler, B und C breiter, Ist-Lage passt hinein', () => {
  const fp = plan2026.flaechen.west;
  const zone = (ist, id) => einteilung(fp, ist).zonen.find((z) => z.id === id);
  const inZone = (z, q) => [...z].some((id) => { const { y, t } = zone(true, id); return q.y >= y && q.y <= y + t; });
  assert.equal(einteilung(fp, false).zonen, fp.zonen, 'Plan bleibt');
  assert.equal(zone(true, 'A').t, 50);
  assert.deepEqual(einteilung(fp, true).wege.map((w) => w.name), ['Pflegepfad B/C', 'Pfad C/D (schmal)'], 'Pfade zwischen B/C und C/D, keiner zwischen A und B');
  // Kohlsprossen in zwei Nord–Süd-Reihen durch B und C, Mangold in C ab X 75, Bohnenkraut zwischen den Bohnenstangen
  const ks = positionen(ort(finde('kohlsprossen'), true));
  assert.equal(new Set(ks.map((q) => q.x)).size, 2);
  assert.ok(ks.some((q) => inZone('B', q)) && ks.some((q) => inZone('C', q)));
  assert.ok(positionen(ort(finde('mangold'), true)).every((q) => q.x >= 75 && inZone('C', q)));
  const stangen = positionen(ort(finde('feuerbohne'), true)).map((q) => q.x);
  for (const q of positionen(ort(finde('bohnenkraut'), true))) {
    assert.ok(inZone('A', q) && q.y < 490 && stangen.some((x) => x < q.x) && stangen.some((x) => x > q.x), `Bohnenkraut (${q.x}|${q.y}) zwischen den Stangen`);
  }
  assert.ok(zone(true, 'B').t > zone(false, 'B').t && zone(true, 'C').t > zone(false, 'C').t, 'B und C gewinnen');
  // Zonen und Wege füllen das Beet lückenlos (0–500 cm)
  const { zonen, wege } = einteilung(fp, true);
  const teile = [...zonen, ...wege].sort((a, b) => a.y - b.y);
  teile.forEach((t, i) => assert.equal(t.y, i ? teile[i - 1].y + teile[i - 1].t : 0, `Lücke vor ${t.name || t.id}`));
  assert.equal(teile.at(-1).y + teile.at(-1).t, flaechen.west.laenge);
  // Jede Pflanze aus B und C steht in ihrer Zone, nicht auf einem Weg, mit genug Abstand zu den anderen Kulturen
  // (innerhalb einer Kultur darf es so eng sein, wie es tatsächlich war – das meldet die Prüfung als Hinweis)
  const ids = { B: ['gurke', 'knollensellerie', 'stangensellerie'], C: ['paprika', 'pfefferoni', 'mangold'], BC: ['kohlsprossen'] };
  const alle = [];
  for (const [z, liste] of Object.entries(ids)) {
    for (const id of liste) {
      for (const q of positionen(ort(finde(id), true))) {
        assert.ok(inZone(z, q), `${id} (${q.x}|${q.y}) liegt in Zone ${z}`);
        alle.push({ ...q, id, a: kulturen[finde(id).kultur].abstand });
      }
    }
  }
  for (let i = 0; i < alle.length; i++) for (let j = i + 1; j < alle.length; j++) {
    const a = alle[i], b = alle[j];
    if (a.id === b.id) continue;
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    assert.ok(d >= (a.a + b.a) / 2 - 0.5, `${a.id} (${a.x}|${a.y}) – ${b.id} (${b.x}|${b.y}): ${d.toFixed(0)} cm`);
  }
  const m = pruefen({ plan: plan2026, kulturen, flaechen, familien, vorjahre: plaene });
  assert.ok(!m.some((x) => /tatsächlich auf dem/.test(x.text)), 'keine Ist-Pflanze auf einem Weg');
  assert.ok(m.some((x) => x.thema === 'Abstand' && x.ids.includes('kohlsprossen') && /tatsächlich enger/.test(x.text)), '8 Kohlsprossen standen zu eng');
  // Anzahlen aus der Rückmeldung
  const anzahl = Object.fromEntries(plan2026.pflanzungen.map((p) => [p.id, p.ist?.anzahl]));
  assert.equal(anzahl.feuerbohne, 25);
  assert.equal(positionen(ort(finde('feuerbohne'), true)).reduce((s, q) => s + q.n, 0), 25, '5 Stangen à 5');
  for (const id of ['kohlsprossen', 'gurke', 'knollensellerie', 'paprika', 'pfefferoni', 'mangold', 'stangensellerie']) {
    assert.equal(positionen(ort(finde(id), true)).length, anzahl[id], `${id}: Ist-Positionen = Anzahl`);
  }
});
