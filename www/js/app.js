(() => {
'use strict';
/* ========== utilidades ========== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { toast('Almacenamiento lleno: usa imágenes más pequeñas'); return false; } }
};
const pad = n => String(n).padStart(2, '0');
const dstr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => dstr(new Date());
const hm = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const fdate = s => cap(parseD(s).toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
const sdate = s => parseD(s).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);

const IC = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  chart: '<path d="M5 20V11M12 20V4M19 20v-6M3 20h18"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14.3c2.3.7 3.5 2.8 3.5 5.7"/>',
  sliders: '<path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  login: '<path d="M14 4h5a1 1 0 011 1v14a1 1 0 01-1 1h-5"/><path d="M4 12h11M11 8l4 4-4 4"/>',
  logout: '<path d="M10 4H5a1 1 0 00-1 1v14a1 1 0 001 1h5"/><path d="M9 12h11M16 8l4 4-4 4"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  printer: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 001.3 2h12.4a1.5 1.5 0 001.3-2L14 9V3"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon: '<path d="M20 14A8 8 0 019.5 4 8 8 0 1020 14z"/>',
  auto: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>'
};
const ic = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const ROLES = { gerente: 'Gerente', cajero: 'Cajero', asistente: 'Asistente' };

async function hash(s) {
  try {
    if (window.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('asistenciapro::' + s));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
    }
  } catch { /* contexto no seguro */ }
  return 'b64:' + btoa(unescape(encodeURIComponent(s)));
}

function avatar(u) {
  if (u && u.foto) return u.foto;
  const n = u ? u.nombre : '?';
  const ini = n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const hue = [...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='hsl(${hue} 55% 42%)'/><text x='32' y='42' font-size='26' font-family='Arial' font-weight='700' fill='white' text-anchor='middle'>${ini}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const resizeImage = (file, max = 240, q = .7) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', q));
    };
    img.onerror = rej; img.src = fr.result;
  };
  fr.onerror = rej; fr.readAsDataURL(file);
});

let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2800);
}
function openModal(html) { $('#sheet').innerHTML = html; $('#modal').hidden = false; }
function closeModal() { $('#modal').hidden = true; $('#sheet').innerHTML = ''; }

/* ========== estado ========== */
let users = store.get('users', null);
let records = store.get('records', []);
let settings = store.get('settings', null);
let session = store.get('session', null);
let view = 'home';
let clockT = null;
let deferredInstall = null;

const saveUsers = () => store.set('users', users);
const saveRecs = () => store.set('records', records);
const saveSet = () => store.set('settings', settings);
const me = () => users.find(u => u.id === session);

/* ========== lógica de negocio ========== */
// Llegada tardía: si entrada > horario + tolerancia -> "tarde" y se cuentan
// los minutos desde la hora oficial de entrada del rol.
function mk(u, fecha, entradaMin, salidaMin, selfie = null, geo = null) {
  const sched = toMin(settings.horario[u.rol]);
  const late = entradaMin > sched + Number(settings.tolerancia);
  return {
    id: uid(), userId: u.id, rol: u.rol, fecha,
    entrada: hm(entradaMin), salida: salidaMin == null ? null : hm(salidaMin),
    estado: late ? 'tarde' : 'puntual', minTarde: late ? entradaMin - sched : 0, selfie, geo
  };
}

function genDemo() {
  const t = new Date();
  records = records.filter(r => r.fecha >= today());
  for (let i = 1; i <= 14; i++) {
    const d = new Date(t); d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    users.filter(u => u.activo).forEach(u => {
      if (Math.random() < .08) return; // ausente
      const sched = toMin(settings.horario[u.rol]);
      const delta = Math.random() < .7 ? -Math.floor(Math.random() * 15) : Math.floor(Math.random() * 40) + 1;
      records.push(mk(u, dstr(d), sched + delta, sched + 9 * 60 + Math.floor(Math.random() * 45)));
    });
  }
  saveRecs();
}

function getGeo() {
  return new Promise(res => {
    if (!navigator.geolocation) return res(null);
    const to = setTimeout(() => res(null), 7000);
    navigator.geolocation.getCurrentPosition(
      p => { clearTimeout(to); res({ lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) }); },
      () => { clearTimeout(to); res(null); }, { enableHighAccuracy: true, timeout: 6000 });
  });
}

/* ========== apariencia ========== */
function applyAppearance() {
  const dark = settings.tema === 'dark' || (settings.tema === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.body.className = 'wp-' + settings.fondo;
  document.body.style.backgroundImage = '';
  if (settings.fondo === 'img' && settings.fondoImg) {
    document.body.className = 'wp-img';
    document.body.style.backgroundImage = `url(${settings.fondoImg})`;
  }
}

/* ========== login / sesión ========== */
$('#chips').innerHTML = [['gerente', 'shield'], ['cajero', 'wallet'], ['asistente', 'clipboard']].map(([r, i]) => `<button type="button" class="chip" data-demo="${r}">${ic(i, 16)} ${r}</button>`).join('');
$$('[data-demo]').forEach(b => b.onclick = () => { $('#lUser').value = b.dataset.demo; $('#lPass').value = '1234'; });
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('#lUser').value.trim().toLowerCase();
  const h = await hash($('#lPass').value);
  const u = users.find(x => x.usuario === name && x.pass === h);
  const err = $('#lErr');
  if (!u) { err.textContent = 'Usuario o contraseña incorrectos'; err.hidden = false; return; }
  if (!u.activo) { err.textContent = 'Usuario desactivado. Consulta al gerente.'; err.hidden = false; return; }
  err.hidden = true; session = u.id; store.set('session', session);
  $('#lPass').value = ''; view = 'home'; enter();
});

function logout() { session = null; store.set('session', null); $('#app').hidden = true; $('#login').hidden = false; clearInterval(clockT); }

function enter() {
  $('#login').hidden = true; $('#app').hidden = false;
  const u = me();
  $('#whoName').textContent = u.nombre.split(' ')[0];
  $('#whoImg').src = avatar(u);
  go(view);
}

/* ========== navegación ========== */
function navItems() {
  const r = me().rol;
  const n = [['home', 'home', 'Inicio'], ['hist', 'calendar', 'Historial']];
  if (r !== 'cajero') n.push(['rep', 'chart', 'Informes']);
  if (r === 'gerente') n.push(['team', 'users', 'Equipo']);
  n.push(['set', 'sliders', 'Ajustes']);
  return n;
}
const VIEWS = { home: [vHome, aHome], hist: [vHist], rep: [vRep, aRep], team: [vTeam], set: [vSet] };

function go(v) {
  if (!navItems().some(n => n[0] === v)) v = 'home';
  view = v; clearInterval(clockT);
  $('#nav').innerHTML = navItems().map(([k, icn, lb]) => `<button data-go="${k}" class="${k === v ? 'on' : ''}">${ic(icn, 22)}<em>${lb}</em></button>`).join('');
  $('#content').innerHTML = VIEWS[v][0]();
  if (VIEWS[v][1]) VIEWS[v][1]();
  window.scrollTo(0, 0);
}

/* ========== vista: INICIO ========== */
function vHome() {
  const u = me(), rec = records.find(r => r.userId === u.id && r.fecha === today());
  return `
  <section class="card hero">
    <img class="avatar lg" src="${avatar(u)}" alt="Foto de ${esc(u.nombre)}">
    <div><h2>Hola, ${esc(u.nombre.split(' ')[0])}</h2><span class="badge rol-${u.rol}">${ROLES[u.rol]}</span></div>
  </section>
  <section class="card center">
    <div class="clock" id="clock">--:--:--</div>
    <div class="muted" id="cdate"></div>
    <p class="muted small">Tu hora de entrada: <b>${settings.horario[u.rol]}</b> · tolerancia ${settings.tolerancia} min</p>
    ${statusBlock(rec)}
    <div class="btnrow">
      <button class="btn primary big" data-act="in" ${rec ? 'disabled' : ''}>${ic('login')} Marcar entrada</button>
      <button class="btn big" data-act="out" ${(!rec || rec.salida) ? 'disabled' : ''}>${ic('logout')} Marcar salida</button>
    </div>
  </section>
  ${statsCard(u.id)}`;
}
function aHome() {
  const tick = () => {
    const d = new Date();
    const c = $('#clock'); if (!c) return;
    c.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    $('#cdate').textContent = cap(d.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' }));
  };
  tick(); clockT = setInterval(tick, 1000);
}
function statusBlock(rec) {
  if (!rec) return `<div class="state">Aún no marcaste tu entrada hoy.</div>`;
  return `<div class="state">
    <span class="tag ${rec.estado}">${rec.estado === 'tarde' ? `Llegada tardía · ${rec.minTarde} min` : 'Puntual'}</span>
    <p style="margin:8px 0 0">Entrada: <b>${rec.entrada}</b> · Salida: <b>${rec.salida || '—'}</b>
    ${rec.geo ? ' · ' + ic('pin', 14) : ''}${rec.selfie ? ' · ' + ic('camera', 14) : ''}</p></div>`;
}
function statsCard(userId) {
  const mine = records.filter(r => r.userId === userId).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const last = mine.slice(-14);
  if (!last.length) return `<section class="card"><h3>Mi puntualidad</h3><p class="muted">Todavía no hay registros.</p></section>`;
  const pun = last.filter(r => r.estado === 'puntual').length;
  const lastBars = mine.slice(-7);
  const max = Math.max(20, ...lastBars.map(r => r.minTarde));
  return `<section class="card"><h3>Mi puntualidad</h3>
    <div class="grid">
      <div class="stat ok"><b>${Math.round(pun / last.length * 100)}%</b>Puntual</div>
      <div class="stat bad"><b>${last.length - pun}</b>Tardanzas</div>
      <div class="stat"><b>${last.reduce((a, r) => a + r.minTarde, 0)}</b>Min. tarde</div>
    </div>
    <p class="muted small" style="margin:10px 0 0">Últimos 7 registros (alto = minutos de retraso)</p>
    <div class="bars">${lastBars.map(r => `<div class="bar" title="${r.minTarde} min"><i class="${r.estado}" style="height:${r.minTarde ? 15 + r.minTarde / max * 75 : 8}%"></i>${sdate(r.fecha)}</div>`).join('')}</div>
  </section>`;
}

function modalIn() {
  openModal(`<h3>Confirmar entrada</h3>
    <p class="muted">Hora actual: <b>${hm(nowMin())}</b></p>
    <label class="lbl">Selfie de verificación (opcional)</label>
    <div class="selfie"><img id="selfiePrev" class="avatar xl" src="${avatar(me())}" alt="">
      <label class="btn">${ic('camera')} Tomar foto<input type="file" accept="image/*" capture="user" id="selfieIn" hidden></label></div>
    <label class="check"><input type="checkbox" id="geoChk" checked> ${ic('pin')} Registrar mi ubicación</label>
    <div class="btnrow"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="okIn">Confirmar</button></div>`);
  let selfie = null;
  $('#selfieIn').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { selfie = await resizeImage(f, 320, .6); $('#selfiePrev').src = selfie; } catch { toast('No se pudo leer la imagen'); }
  };
  $('#okIn').onclick = async function () {
    this.disabled = true; this.textContent = 'Guardando…';
    const geo = $('#geoChk').checked ? await getGeo() : null;
    records.push(mk(me(), today(), nowMin(), null, selfie, geo));
    saveRecs(); closeModal();
    toast(records[records.length - 1].estado === 'tarde' ? 'Entrada registrada: llegada tardía' : 'Entrada registrada');
    go('home');
  };
}
function markOut() {
  const r = records.find(x => x.userId === session && x.fecha === today());
  if (!r || r.salida) return;
  r.salida = hm(nowMin()); saveRecs(); toast('Salida registrada'); go('home');
}

/* ========== vista: HISTORIAL ========== */
function vHist() {
  const mine = records.filter(r => r.userId === session).sort((a, b) => b.fecha.localeCompare(a.fecha));
  return `<section class="card"><h3>Mi historial</h3>${mine.length ? mine.map(r => `
    <div class="row" data-rid="${r.id}">
      <div class="grow"><b>${fdate(r.fecha)}</b><small class="muted">Entrada ${r.entrada} · Salida ${r.salida || '—'}${r.geo ? ' · ' + ic('pin', 13) : ''}${r.selfie ? ' · ' + ic('camera', 13) : ''}</small></div>
      ${tag(r)}</div>`).join('') : '<p class="muted">Sin registros todavía.</p>'}</section>`;
}
const tag = r => r.estado === 'ausente' ? '<span class="tag ausente">Ausente</span>'
  : `<span class="tag ${r.estado}">${r.estado === 'tarde' ? `Tarde +${r.minTarde}m` : 'Puntual'}</span>`;

/* ========== vista: INFORMES ========== */
let flt = null;
function resetFlt() {
  const a = new Date(); a.setDate(a.getDate() - 6);
  flt = { from: dstr(a), to: today(), user: 'all', estado: 'all' };
}
function vRep() {
  if (!flt) resetFlt();
  const u = me(), onlyToday = u.rol === 'asistente';
  return `<div class="print-head"><img src="img/itabo.png" alt="Itabo"><div><b>Agropecuaria Itabo</b><br>Informe de asistencia</div></div>
  <section class="card"><h3>Informe de asistencia</h3>
    ${onlyToday ? '<p class="muted small">Como asistente puedes ver el informe del día de hoy.</p>' : ''}
    <div class="filters">
      <div><label class="lbl">Desde</label><input type="date" id="fFrom" value="${onlyToday ? today() : flt.from}" ${onlyToday ? 'disabled' : ''}></div>
      <div><label class="lbl">Hasta</label><input type="date" id="fTo" value="${onlyToday ? today() : flt.to}" ${onlyToday ? 'disabled' : ''}></div>
      <div><label class="lbl">Empleado</label><select id="fUser"><option value="all">Todos</option>${users.map(x => `<option value="${x.id}" ${flt.user === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select></div>
      <div><label class="lbl">Estado</label><select id="fEst">${[['all', 'Todos'], ['puntual', 'Puntual'], ['tarde', 'Tarde'], ['ausente', 'Ausente']].map(([v, l]) => `<option value="${v}" ${flt.estado === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    </div>
    ${u.rol === 'gerente' ? `<div class="btnrow noprint" style="margin-top:12px"><button class="btn" data-act="csv">${ic('download')} Exportar CSV</button><button class="btn" data-act="print">${ic('printer')} Imprimir / PDF</button></div>` : ''}
  </section><div id="repOut"></div>`;
}
function aRep() {
  const read = () => {
    if (me().rol !== 'asistente') { flt.from = $('#fFrom').value; flt.to = $('#fTo').value; }
    flt.user = $('#fUser').value; flt.estado = $('#fEst').value; draw();
  };
  ['fFrom', 'fTo', 'fUser', 'fEst'].forEach(i => $('#' + i).onchange = read);
  draw();
}
// Devuelve [{fecha, rows:[{user, rec, estado}]}] ordenado por fecha desc.
function buildReport() {
  const onlyToday = me().rol === 'asistente';
  const from = onlyToday ? today() : flt.from, to = onlyToday ? today() : flt.to;
  const out = [];
  if (!from || !to || from > to) return out;
  const t = today();
  for (let d = parseD(to); dstr(d) >= from; d.setDate(d.getDate() - 1)) {
    const f = dstr(d), wk = d.getDay() !== 0 && d.getDay() !== 6;
    let rows = [];
    users.forEach(u => {
      const rec = records.find(r => r.userId === u.id && r.fecha === f);
      if (rec) rows.push({ user: u, rec, estado: rec.estado });
      else if (u.activo && wk && f < t) rows.push({ user: u, rec: null, estado: 'ausente' });
    });
    rows = rows.filter(r => (flt.user === 'all' || r.user.id === flt.user) && (flt.estado === 'all' || r.estado === flt.estado));
    rows.sort((a, b) => (a.rec ? a.rec.entrada : '99') .localeCompare(b.rec ? b.rec.entrada : '99'));
    if (rows.length) out.push({ fecha: f, rows });
  }
  return out;
}
function draw() {
  const data = buildReport(), all = data.flatMap(d => d.rows);
  const c = s => all.filter(r => r.estado === s).length;
  const mins = all.reduce((a, r) => a + (r.rec ? r.rec.minTarde : 0), 0);
  $('#repOut').innerHTML = `
  <section class="card"><div class="grid">
    <div class="stat"><b>${all.length}</b>Registros</div>
    <div class="stat ok"><b>${c('puntual')}</b>Puntuales</div>
    <div class="stat bad"><b>${c('tarde')}</b>Tardanzas</div>
    <div class="stat"><b>${c('ausente')}</b>Ausentes</div>
    <div class="stat"><b>${mins}</b>Min. tarde</div></div></section>
  ${data.length ? data.map(d => `<section class="card daygroup">
    <h3>${fdate(d.fecha)}<small>${d.rows.length} reg.</small></h3>
    ${d.rows.map(r => `<div class="row" ${r.rec ? `data-rid="${r.rec.id}"` : ''}>
      <img class="avatar md" src="${avatar(r.user)}" alt="">
      <div class="grow"><b>${esc(r.user.nombre)}</b><small class="muted">${ROLES[r.rec ? r.rec.rol : r.user.rol]}${r.rec && r.rec.geo ? ' · ' + ic('pin', 13) : ''}${r.rec && r.rec.selfie ? ' · ' + ic('camera', 13) : ''}</small></div>
      <div class="times">${r.rec ? `${r.rec.entrada}<br>${r.rec.salida || '—'}` : ''}</div>
      ${r.rec ? tag(r.rec) : tag({ estado: 'ausente' })}</div>`).join('')}
  </section>`).join('') : '<section class="card"><p class="muted">No hay registros para estos filtros.</p></section>'}`;
}
async function exportCSV() {
  const rows = [['Fecha', 'Empleado', 'Rol', 'Entrada', 'Salida', 'Estado', 'Minutos tarde', 'Latitud', 'Longitud']];
  buildReport().forEach(d => d.rows.forEach(r => rows.push([d.fecha, r.user.nombre, ROLES[r.rec ? r.rec.rol : r.user.rol],
    r.rec ? r.rec.entrada : '', r.rec ? (r.rec.salida || '') : '', r.estado, r.rec ? r.rec.minTarde : '',
    r.rec && r.rec.geo ? r.rec.geo.lat : '', r.rec && r.rec.geo ? r.rec.geo.lng : ''])));
  const csv = '﻿' + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const file = new File([blob], `asistencia_${flt.from}_${flt.to}.csv`, { type: 'text/csv' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Informe de asistencia' }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove(); toast('CSV generado');
}
function recDetail(id) {
  const r = records.find(x => x.id === id); if (!r) return;
  const u = users.find(x => x.id === r.userId);
  openModal(`<h3>${esc(u ? u.nombre : 'Empleado eliminado')}</h3>
    <p class="muted">${fdate(r.fecha)}</p>
    <p>${tag(r)} &nbsp; Entrada <b>${r.entrada}</b> · Salida <b>${r.salida || '—'}</b></p>
    ${r.selfie ? `<img class="photo" src="${r.selfie}" alt="Selfie de entrada">` : '<p class="muted">Sin selfie.</p>'}
    ${r.geo ? `<p>${ic('pin')} <a target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${r.geo.lat}&mlon=${r.geo.lng}#map=17/${r.geo.lat}/${r.geo.lng}">Ver ubicación en el mapa</a> <span class="muted small">(${r.geo.lat}, ${r.geo.lng})</span></p>` : '<p class="muted">Sin ubicación.</p>'}
    <button class="btn big" data-act="close">Cerrar</button>`);
}

/* ========== vista: EQUIPO (gerente) ========== */
function vTeam() {
  return `<section class="card"><h3>Equipo</h3>
    <button class="btn primary big" data-act="newUser" style="margin:0 0 8px">${ic('plus')} Nuevo empleado</button>
    ${users.map(u => `<div class="row">
      <img class="avatar md" src="${avatar(u)}" alt="">
      <div class="grow"><b>${esc(u.nombre)}</b><small class="muted">@${esc(u.usuario)} · ${ROLES[u.rol]}${u.activo ? '' : ' · desactivado'}</small></div>
      <button class="btn" data-edit="${u.id}" aria-label="Editar">${ic('edit')}</button></div>`).join('')}</section>`;
}
function userForm(id) {
  const u = id ? users.find(x => x.id === id) : { nombre: '', usuario: '', rol: 'cajero', activo: true, foto: null };
  let foto = u.foto;
  openModal(`<h3>${id ? 'Editar' : 'Nuevo'} empleado</h3>
    <div class="selfie"><img id="uImg" class="avatar xl" src="${avatar(u)}" alt="">
      <label class="btn">${ic('image')} Foto<input type="file" accept="image/*" id="uFoto" hidden></label></div>
    <label class="lbl">Nombre completo</label><input id="uNom" value="${esc(u.nombre)}">
    <label class="lbl">Usuario</label><input id="uUsr" value="${esc(u.usuario)}" autocapitalize="none">
    <label class="lbl">Contraseña ${id ? '(vacío = no cambiar)' : ''}</label><input id="uPas" type="password">
    <label class="lbl">Rol</label><select id="uRol">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${u.rol === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <label class="check"><input type="checkbox" id="uAct" ${u.activo ? 'checked' : ''} ${id === session ? 'disabled' : ''}> Activo</label>
    <p id="uErr" class="err" hidden></p>
    <div class="btnrow"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="uSave">Guardar</button></div>`);
  $('#uFoto').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { foto = await resizeImage(f, 200, .7); $('#uImg').src = foto; } catch { toast('Imagen no válida'); } };
  $('#uSave').onclick = async () => {
    const nombre = $('#uNom').value.trim(), usuario = $('#uUsr').value.trim().toLowerCase(), pas = $('#uPas').value;
    const err = m => { const e = $('#uErr'); e.textContent = m; e.hidden = false; };
    if (!nombre || !usuario) return err('Nombre y usuario son obligatorios');
    if (!id && !pas) return err('La contraseña es obligatoria');
    if (users.some(x => x.usuario === usuario && x.id !== id)) return err('Ese usuario ya existe');
    const data = { nombre, usuario, rol: $('#uRol').value, activo: $('#uAct').checked || id === session, foto };
    if (id) { Object.assign(users.find(x => x.id === id), data); if (pas) users.find(x => x.id === id).pass = await hash(pas); }
    else users.push({ id: uid(), pass: await hash(pas), ...data });
    saveUsers(); closeModal(); toast('Empleado guardado');
    if (id === session) { $('#whoName').textContent = me().nombre.split(' ')[0]; $('#whoImg').src = avatar(me()); }
    go('team');
  };
}

/* ========== vista: AJUSTES ========== */
function vSet() {
  const g = me().rol === 'gerente';
  return `
  <section class="card"><h3>Apariencia</h3>
    <label class="lbl">Tema</label>
    <div class="btnrow">${[['auto', ic('auto') + ' Auto'], ['light', ic('sun') + ' Claro'], ['dark', ic('moon') + ' Oscuro']].map(([k, l]) => `<button class="btn ${settings.tema === k ? 'primary' : ''}" data-tema="${k}">${l}</button>`).join('')}</div>
    <label class="lbl">Fondo de pantalla</label>
    <div class="swatches">${['0', '1', '2'].map(k => `<div class="sw s${k} ${settings.fondo === k ? 'on' : ''}" data-fondo="${k}" role="button" aria-label="Fondo ${+k + 1}"></div>`).join('')}
      <label class="btn">${ic('image')} Mi imagen<input type="file" accept="image/*" id="wpFile" hidden></label></div>
  </section>
  ${g ? `<section class="card"><h3>Horarios de entrada</h3>
    <div class="two"><div><label class="lbl">Gerente</label><input type="time" id="hG" value="${settings.horario.gerente}"></div>
    <div><label class="lbl">Cajero</label><input type="time" id="hC" value="${settings.horario.cajero}"></div>
    <div><label class="lbl">Asistente</label><input type="time" id="hA" value="${settings.horario.asistente}"></div>
    <div><label class="lbl">Tolerancia (min)</label><input type="number" id="hT" min="0" max="60" value="${settings.tolerancia}"></div></div>
    <p class="muted small">Se marca “tarde” si la entrada supera hora + tolerancia; los minutos se cuentan desde la hora oficial.</p>
    <button class="btn primary big" data-act="saveHor">Guardar horarios</button></section>
  <section class="card"><h3>Datos</h3><div class="btnrow">
    <button class="btn" data-act="demo">${ic('flask')} Cargar datos de ejemplo</button>
    <button class="btn danger" data-act="wipe">${ic('trash')} Borrar registros</button></div></section>` : ''}
  <section class="card">
    ${deferredInstall ? `<button class="btn big" data-act="install" style="margin-top:0">${ic('phone')} Instalar app en este dispositivo</button>` : ''}
    <button class="btn danger big" data-act="logout" style="${deferredInstall ? '' : 'margin-top:0'}">Cerrar sesión</button>
    <p class="muted small center">AsistenciasItabo v1.0 · Agropecuaria Itabo · datos guardados en este dispositivo</p></section>`;
}

/* ========== eventos globales ========== */
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-go],[data-act],[data-edit],[data-tema],[data-fondo],[data-rid],#modal');
  if (!t) return;
  if (t.id === 'modal') { if (e.target === t) closeModal(); return; }
  if (t.dataset.go) return go(t.dataset.go);
  if (t.dataset.edit) return userForm(t.dataset.edit);
  if (t.dataset.tema) { settings.tema = t.dataset.tema; saveSet(); applyAppearance(); return go('set'); }
  if (t.dataset.fondo) { settings.fondo = t.dataset.fondo; saveSet(); applyAppearance(); return go('set'); }
  if (t.dataset.rid) return recDetail(t.dataset.rid);
  switch (t.dataset.act) {
    case 'in': return modalIn();
    case 'out': return markOut();
    case 'close': return closeModal();
    case 'csv': return exportCSV();
    case 'print': return window.print();
    case 'newUser': return userForm(null);
    case 'logout': return logout();
    case 'install': if (deferredInstall) { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; go('set'); } return;
    case 'saveHor':
      settings.horario = { gerente: $('#hG').value || '08:00', cajero: $('#hC').value || '08:00', asistente: $('#hA').value || '09:00' };
      settings.tolerancia = Math.max(0, Math.min(60, +$('#hT').value || 0)); saveSet(); return toast('Horarios guardados');
    case 'demo': genDemo(); return toast('Datos de ejemplo cargados (últimos 14 días)');
    case 'wipe': if (confirm('¿Borrar TODOS los registros de asistencia?')) { records = []; saveRecs(); toast('Registros borrados'); } return;
  }
});
document.addEventListener('change', async e => {
  if (e.target.id === 'wpFile') {
    const f = e.target.files[0]; if (!f) return;
    try { settings.fondoImg = await resizeImage(f, 900, .6); settings.fondo = 'img'; saveSet(); applyAppearance(); toast('Fondo actualizado'); } catch { toast('Imagen no válida'); }
  }
});
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyAppearance);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ========== arranque ========== */
(async function init() {
  if (!settings) {
    settings = { horario: { gerente: '08:00', cajero: '08:00', asistente: '09:00' }, tolerancia: 5, fondo: '0', tema: 'light', fondoImg: null };
    saveSet();
  }
  if (!users) {
    const h = await hash('1234');
    const mkU = (nombre, usuario, rol) => ({ id: uid(), nombre, usuario, rol, pass: h, activo: true, foto: null });
    users = [mkU('Carlos Gómez', 'gerente', 'gerente'), mkU('Lucía Benítez', 'cajero', 'cajero'), mkU('Marcos Ortiz', 'asistente', 'asistente'),
             mkU('Sofía Rojas', 'sofia', 'cajero'), mkU('Diego Vera', 'diego', 'asistente')];
    saveUsers(); records = []; genDemo();
  }
  applyAppearance();
  if (session && me() && me().activo) enter(); else { session = null; $('#login').hidden = false; }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
})();
