// Gemeinsame Logik für den Beetplaner (Browser) und das Prüf-Script (Node).
// Keine Abhängigkeiten, kein DOM – arbeitet mit bereits geparsten YAML-Daten.

export const TYPEN = {
  V: 'Vorkultur',
  H: 'Hauptkultur',
  N: 'Nachkultur',
  B: 'Beikraut',
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
    if (k.rollen && (!Array.isArray(k.rollen) || k.rollen.some((r) => !['V', 'H', 'N', 'B'].includes(r)))) f.push(`${id}: rollen nur V, H, N, B`);
    if (naturjahreszeitIds.length && k.naturjahreszeit && !naturjahreszeitIds.includes(k.naturjahreszeit)) f.push(`${id}: naturjahreszeit „${k.naturjahreszeit}“ unbekannt`);
    if (!(Number(k.abstand) > 0)) f.push(`${id}: abstand muss eine Zahl > 0 sein`);
    for (const feld of ['gut', 'schlecht']) for (const n of k[feld] || []) if (!kulturen[n]) f.push(`${id}: ${feld}-Nachbar „${n}“ gibt es nicht`);
    for (const n of k.gut || []) if ((k.schlecht || []).includes(n)) f.push(`${id}: „${n}“ ist zugleich guter und schlechter Nachbar`);
    for (const e of k.erfahrungen || []) {
      if (!Number.isInteger(e.jahr) || !e.text) f.push(`${id}: Erfahrung braucht jahr und text`);
      if (e.sicherheit && !ERLAUBT.sicherheit.includes(e.sicherheit)) f.push(`${id}: sicherheit „${e.sicherheit}“ ungültig`);
    }
    for (const s of k.sorten || []) if (!s.name || !Number.isInteger(s.jahr)) f.push(`${id}: Sorte braucht name und jahr`);
  }
  return f;
}

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
 * Prüft einen Jahresplan.
 * @returns Liste von { stufe: 'fehler'|'warnung'|'hinweis', thema, text, ids: [pflanzungs-ids] }
 */
export function pruefen({ plan, kulturen, flaechen, familien = null, vorjahre = [] }) {
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

  // 2. Stückzahlen
  for (const p of gueltig) {
    if (p.wunsch == null || p.bereich) continue;
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

  // 3b. Tatsächliche Lage gegen die tatsächliche Einteilung (nur Hinweise – das Jahr ist vorbei)
  for (const p of gueltig.filter(hatIstLage)) {
    const f = flaechen[p.flaeche];
    const { wege } = einteilung(plan.flaechen?.[p.flaeche], true);
    const istPos = positionen(ort(p, true));
    if (istPos.some((q) => q.x < 0 || q.x > f.breite || q.y < 0 || q.y > f.laenge)) melde('warnung', 'Grenzen', `${name(p)}: tatsächliche Lage liegt teilweise außerhalb von ${f.name}.`, [p.id]);
    for (const w of wege) {
      const n = istPos.filter((q) => q.y > w.y && q.y < w.y + w.t).length;
      if (n) melde('hinweis', 'Wege', `${name(p)}: ${n} Pflanze(n) standen tatsächlich auf dem ${w.name}.`, [p.id]);
    }
    const soll = kulturen[p.kultur].abstand || 0;
    let eng = Infinity;
    for (let i = 0; i < istPos.length; i++) for (let j = i + 1; j < istPos.length; j++) eng = Math.min(eng, Math.hypot(istPos[i].x - istPos[j].x, istPos[i].y - istPos[j].y));
    if (soll && eng < soll * 0.9) melde('hinweis', 'Abstand', `${name(p)}: standen tatsächlich enger als empfohlen (ca. ${Math.round(eng)} statt ${soll} cm).`, [p.id]);
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
