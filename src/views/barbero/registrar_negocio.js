import { BarberoNegocioController } from '../../controllers/BarberoNegocioController.js';
import { supabase } from '../../config/supabaseClient.js';
import { UsuarioModel } from '../../models/UsuarioModel.js';

export default async function RegistrarNegocioView(){
  return `
    <style>
:root {
  --bg: #f4f6fb;
  --card: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --border: #e5e7eb;
  --primary: #5c6bc0;
  --primary-2: #4f46e5;
  --success: #22c55e;
  --danger: #ef4444;
  --warn: #f59e0b;
}

.mvc-registro-negocio {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.mvc-registro-negocio .container {
  max-width: 1080px;
  margin: 24px auto;
  padding: 0 16px;
}

.mvc-registro-negocio .card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 10px 25px rgba(17, 24, 39, 0.08);
  padding: 24px;
}

.mvc-registro-negocio h1 {
  font-size: 42px;
  margin: 0 0 6px;
  text-align: center;
}

.mvc-registro-negocio h2 {
  font-size: 26px;
  margin: 18px 0 10px;
  text-align: center;
}

.mvc-registro-negocio h3 {
  font-size: 20px;
  margin: 18px 0 8px;
}

.mvc-registro-negocio .sub {
  text-align: center;
  color: var(--muted);
  margin-bottom: 18px;
}

.mvc-registro-negocio .badge {
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  margin-left: 8px;
  vertical-align: middle;
}

.mvc-registro-negocio .badge-warn {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.35);
  color: #b45309;
}

.mvc-registro-negocio .badge-ok {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.35);
  color: #15803d;
}

.mvc-registro-negocio .grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 860px) {
  .mvc-registro-negocio .grid2 { grid-template-columns: 1fr; }
  .mvc-registro-negocio h1 { font-size: 34px; }
}

.mvc-registro-negocio label {
  display: block;
  color: #1f2937;
  font-weight: 600;
  margin: 10px 0 6px;
}

.mvc-registro-negocio .hint {
  color: var(--muted);
  font-size: 13px;
  margin-top: 4px;
}

.mvc-registro-negocio .inp {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 12px;
  outline: none;
  font-size: 15px;
  background: white;
}

.mvc-registro-negocio .inp:focus {
  border-color: rgba(92, 107, 192, 0.6);
  box-shadow: 0 0 0 4px rgba(92, 107, 192, 0.12);
}

.mvc-registro-negocio .error {
  color: var(--danger);
  font-size: 13px;
  margin-top: 6px;
  min-height: 16px;
}

.mvc-registro-negocio .btn {
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  font-weight: 700;
  cursor: pointer;
}

.mvc-registro-negocio .btn.primary {
  background: var(--primary);
  color: white;
}

.mvc-registro-negocio .btn.success {
  background: var(--success);
  color: white;
}

.mvc-registro-negocio .btn.full {
  width: 100%;
  margin-top: 14px;
}

.mvc-registro-negocio table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.mvc-registro-negocio thead th {
  background: #eef2ff;
  text-align: left;
  padding: 10px 12px;
  font-weight: 800;
  color: #1f2937;
}

.mvc-registro-negocio tbody td {
  padding: 10px 12px;
  border-top: 1px solid var(--border);
  vertical-align: middle;
}

.mvc-registro-negocio .muted { color: var(--muted); }

.mvc-registro-negocio .actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.mvc-registro-negocio .btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
  font-weight: 900;
}

.mvc-registro-negocio .btn-icon.del {
  border-color: rgba(239, 68, 68, 0.35);
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.06);
}

.mvc-registro-negocio .chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  padding: 6px 10px;
  border-radius: 999px;
  margin: 4px 6px 4px 0;
  background: #fff;
}

.mvc-registro-negocio pre {
  background: #0b1220;
  color: #c7d2fe;
  padding: 14px;
  border-radius: 12px;
  overflow: auto;
  border: 1px solid rgba(255,255,255,0.08);
}
    </style>

    <div class="mvc-registro-negocio">
      <div class="container">
        <div class="card">
          <h1>Registrar Negocio</h1>
          <div class="sub">Datos del negocio</div>

          <label>Nombre de la barbería/peluquería <span id="businessStatus" class="badge badge-warn">Negocio nuevo</span></label>
          <input id="shopName" class="inp" type="text" placeholder="Ej: Barbería Central" list="businessList" />
          <datalist id="businessList"></datalist>
          <div id="error-shopName" class="error"></div>

          <label>Dirección</label>
          <input id="shopAddress" class="inp" type="text" placeholder="Ej: Carrera 23 #60-36" />
          <div class="hint">Escribe la dirección. La búsqueda ignora mayúsculas/acentos.</div>
          <div id="error-shopAddress" class="error"></div>

          <h2>Datos del responsable</h2>

          <label>Nombre completo</label>
          <input id="ownerName" class="inp" type="text" />
          <div id="error-ownerName" class="error"></div>

          <label>Correo</label>
          <input id="ownerEmail" class="inp" type="email" />
          <div id="error-ownerEmail" class="error"></div>

          <label>Teléfono</label>
          <input id="ownerPhone" class="inp" type="text" placeholder="Ej: 3001234567" />
          <div id="error-ownerPhone" class="error"></div>

          <label>Contraseña <span class="muted">(mínimo 6 caracteres)</span></label>
          <input id="ownerPass" class="inp" type="password" />
          <div id="error-ownerPass" class="error"></div>

          <h2>Servicios del establecimiento</h2>

          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Duración (min)</th>
                <th>Precio (COP)</th>
                <th>Tokens</th>
                <th style="width:140px;">Acción</th>
              </tr>
            </thead>
            <tbody id="servicesBody"></tbody>
          </table>
          <div id="error-services" class="error"></div>

          <button id="addService" class="btn primary full" type="button">Agregar servicio (+)</button>

          <h2>Personal del establecimiento</h2>

          <table>
            <thead>
              <tr>
                <th style="width:240px;">Personal</th>
                <th>Servicios que ofrece</th>
                <th style="width:90px;">Acción</th>
              </tr>
            </thead>
            <tbody id="staffBody"></tbody>
          </table>
          <div id="error-staff" class="error"></div>

          <button id="addStaff" class="btn primary full" type="button">Agregar personal (+)</button>

          <button id="submitForm" class="btn success full" type="button">Guardar y continuar</button>

          <div id="datos-resumen" style="display:none; margin-top:16px;">
            <h3>Resumen</h3>
            <pre id="summaryText"></pre>
          </div>

          <div id="registro-final" style="display:none;">
            <button id="registerBusiness" class="btn success full" type="button">Registrar negocio</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function onMount(){
  const $ = (id) => document.getElementById(id);

  const shopName = $('shopName');
  const shopAddress = $('shopAddress');
  const businessList = $('businessList');
  const businessStatus = $('businessStatus');

  const ownerName = $('ownerName');
  const ownerEmail = $('ownerEmail');
  const ownerPhone = $('ownerPhone');
  const ownerPass = $('ownerPass');

  const servicesBody = $('servicesBody');
  const staffBody = $('staffBody');

  const addServiceBtn = $('addService');
  const addStaffBtn = $('addStaff');

  const submitFormBtn = $('submitForm');
  const resumenSec = $('datos-resumen');
  const summaryText = $('summaryText');
  const registroFinalSec = $('registro-final');
  const registerBusinessBtn = $('registerBusiness');

  const err = {
    shopName: $('error-shopName'),
    shopAddress: $('error-shopAddress'),
    ownerName: $('error-ownerName'),
    ownerEmail: $('error-ownerEmail'),
    ownerPhone: $('error-ownerPhone'),
    ownerPass: $('error-ownerPass'),
    services: $('error-services'),
    staff: $('error-staff')
  };

  const fmtCOP = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return '';
    return num.toLocaleString('es-CO');
  };
  const parseCOP = (str) => {
    const d = String(str ?? '').replace(/[^\d]/g,'');
    return d ? Number(d) : '';
  };
  const computeTokens = (mins) => Math.max(1, Math.ceil(Number(mins || 0)/30));

  let negociosIndex = new Map(); // nombre -> negocio
  let currentNegocioId = null;

  let services = []; // { name, durationMins, priceCOP }
  let staff = [];    // { name, services: Set<index> }

  // Autollenar responsable desde sesión (si existe)
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (auth?.user?.id) {
      const prof = await UsuarioModel.currentProfile(auth.user.id);
      const u = prof?.data;
      if (u) {
        if (ownerName && !ownerName.value) ownerName.value = [u.nombres, u.apellidos].filter(Boolean).join(' ').trim();
        if (ownerEmail && !ownerEmail.value) ownerEmail.value = u.correo ?? '';
        if (ownerPhone && !ownerPhone.value) ownerPhone.value = u.telefono ?? '';
        if (ownerPass) ownerPass.placeholder = '— (ya tienes sesión activa)';
      }
    }
  } catch (e) {
    console.warn('No se pudo cargar perfil:', e);
  }

  // Negocios para datalist
  try {
    const list = await BarberoNegocioController.misNegocios();
    (list || []).forEach(n => {
      if (!n?.nombre) return;
      negociosIndex.set(n.nombre, n);
    });
    if (businessList) {
      businessList.innerHTML = (list || [])
        .map(n => `<option value="${String(n.nombre).replace(/"/g,'&quot;')}">`)
        .join('');
    }
  } catch (e) {
    console.warn('No se pudieron cargar negocios:', e);
  }

  function setBusinessStatus(isNew) {
    if (!businessStatus) return;
    businessStatus.textContent = isNew ? 'Negocio nuevo' : 'Cargado';
    businessStatus.className = 'badge ' + (isNew ? 'badge-warn' : 'badge-ok');
  }

  function maybeLoadBusinessByName() {
    const chosen = negociosIndex.get(shopName?.value ?? '');
    if (!chosen) {
      currentNegocioId = null;
      setBusinessStatus(true);
      return;
    }
    currentNegocioId = chosen.id ?? null;
    if (shopAddress && chosen.direccion && !shopAddress.value) shopAddress.value = chosen.direccion;
    setBusinessStatus(false);
  }

  if (shopName) {
    shopName.addEventListener('change', maybeLoadBusinessByName);
    shopName.addEventListener('blur', maybeLoadBusinessByName);
  }

  // ===== Servicios =====
  function renderServices() {
    if (!servicesBody) return;

    servicesBody.innerHTML = services.map((s, i) => {
      const tokens = computeTokens(s.durationMins);
      const priceVal = s.priceCOP === '' ? '' : fmtCOP(s.priceCOP);
      return `
        <tr data-i="${i}">
          <td><input type="text" class="inp service-name" value="${(s.name ?? '').replace(/"/g,'&quot;')}" placeholder="Corte"></td>
          <td><input type="number" class="inp service-dur" min="5" step="5" value="${s.durationMins ?? 30}"></td>
          <td><input type="text" class="inp service-price" value="${priceVal}" placeholder="Ej: 18.000"></td>
          <td class="muted">≈ ${tokens} token${tokens>1?'s':''}</td>
          <td class="actions">
            <button type="button" class="btn-icon up" title="Subir">↑</button>
            <button type="button" class="btn-icon down" title="Bajar">↓</button>
            <button type="button" class="btn-icon del" title="Eliminar">✕</button>
          </td>
        </tr>
      `;
    }).join('');

    syncStaffServiceColumns();
  }

  function addServiceRow() {
    services.push({ name:'', durationMins:30, priceCOP:'' });
    renderServices();
  }

  function moveService(from, to) {
    if (to < 0 || to >= services.length) return;
    const [item] = services.splice(from, 1);
    services.splice(to, 0, item);

    // Ajustar indices en staff
    staff = staff.map(p => {
      const newSet = new Set();
      p.services.forEach(idx => {
        if (idx === from) newSet.add(to);
        else if (from < to && idx > from && idx <= to) newSet.add(idx - 1);
        else if (from > to && idx >= to && idx < from) newSet.add(idx + 1);
        else newSet.add(idx);
      });
      return { ...p, services: newSet };
    });

    renderServices();
    renderStaff();
  }

  function removeServiceRow(index) {
    services.splice(index, 1);
    staff = staff.map(p => {
      const newSet = new Set();
      p.services.forEach(idx => {
        if (idx === index) return;
        newSet.add(idx > index ? idx - 1 : idx);
      });
      return { ...p, services: newSet };
    });
    renderServices();
    renderStaff();
  }

  if (servicesBody) {
    servicesBody.addEventListener('input', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i)) return;

      if (ev.target.classList.contains('service-name')) services[i].name = ev.target.value;
      if (ev.target.classList.contains('service-dur')) services[i].durationMins = Number(ev.target.value || 0);
      if (ev.target.classList.contains('service-price')) services[i].priceCOP = parseCOP(ev.target.value);

      if (ev.target.classList.contains('service-dur') || ev.target.classList.contains('service-price')) {
        renderServices();
      }
    });

    servicesBody.addEventListener('click', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i)) return;

      if (ev.target.classList.contains('up')) moveService(i, i - 1);
      if (ev.target.classList.contains('down')) moveService(i, i + 1);
      if (ev.target.classList.contains('del')) removeServiceRow(i);
    });
  }

  // ===== Personal =====
  function syncStaffServiceColumns() {
    if (staff.length) renderStaff();
  }

  function renderStaff() {
    if (!staffBody) return;

    staffBody.innerHTML = staff.map((p, i) => {
      const checks = services.map((s, sIdx) => {
        const checked = p.services.has(sIdx) ? 'checked' : '';
        const label = (s.name || `Servicio ${sIdx+1}`).replace(/</g,'&lt;');
        return `
          <label class="chip">
            <input type="checkbox" class="staff-svc" data-s="${sIdx}" ${checked}>
            <span>${label}</span>
          </label>
        `;
      }).join('') || '<span class="muted">Agrega servicios primero.</span>';

      return `
        <tr data-i="${i}">
          <td><input type="text" class="inp staff-name" value="${(p.name ?? '').replace(/"/g,'&quot;')}" placeholder="Nombre público"></td>
          <td class="staff-services">${checks}</td>
          <td class="actions">
            <button type="button" class="btn-icon del staff-del" title="Eliminar">✕</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function addStaffRow() {
    staff.push({ name:'', services: new Set() });
    renderStaff();
  }

  function removeStaffRow(index) {
    staff.splice(index, 1);
    renderStaff();
  }

  if (staffBody) {
    staffBody.addEventListener('input', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i)) return;
      if (ev.target.classList.contains('staff-name')) staff[i].name = ev.target.value;
    });

    staffBody.addEventListener('change', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i)) return;

      if (ev.target.classList.contains('staff-svc')) {
        const sIdx = Number(ev.target.dataset.s);
        if (ev.target.checked) staff[i].services.add(sIdx);
        else staff[i].services.delete(sIdx);
      }
    });

    staffBody.addEventListener('click', (ev) => {
      const tr = ev.target.closest('tr');
      if (!tr) return;
      const i = Number(tr.dataset.i);
      if (!Number.isFinite(i)) return;
      if (ev.target.classList.contains('staff-del')) removeStaffRow(i);
    });
  }

  addServiceBtn?.addEventListener('click', addServiceRow);
  addStaffBtn?.addEventListener('click', addStaffRow);

  // Inicial (como MVP)
  if (!services.length) {
    services = [
      { name:'Corte', durationMins:30, priceCOP:'' },
      { name:'Barba', durationMins:20, priceCOP:'' },
      { name:'Corte y barba', durationMins:40, priceCOP:'' }
    ];
    renderServices();
  }

  // ===== Validación =====
  function clearErrors() {
    Object.values(err).forEach(el => { if (el) el.textContent = ''; });
  }

  function validate() {
    clearErrors();
    let ok = true;

    if (!shopName?.value?.trim()) { err.shopName && (err.shopName.textContent = 'Ingresa el nombre del negocio.'); ok = false; }
    if (!shopAddress?.value?.trim()) { err.shopAddress && (err.shopAddress.textContent = 'Ingresa la dirección.'); ok = false; }

    if (!ownerName?.value?.trim()) { err.ownerName && (err.ownerName.textContent = 'Ingresa tu nombre.'); ok = false; }
    if (!ownerEmail?.value?.trim()) { err.ownerEmail && (err.ownerEmail.textContent = 'Ingresa tu correo.'); ok = false; }
    if (!ownerPhone?.value?.trim()) { err.ownerPhone && (err.ownerPhone.textContent = 'Ingresa tu teléfono.'); ok = false; }

    const validServices = services.filter(s => (s.name||'').trim() && Number(s.durationMins) > 0);
    if (!validServices.length) { err.services && (err.services.textContent = 'Agrega al menos un servicio válido.'); ok = false; }

    const invalidStaff = staff.some(p => !String(p.name||'').trim());
    if (invalidStaff) { err.staff && (err.staff.textContent = 'Revisa el nombre del personal.'); ok = false; }

    return ok;
  }

  submitFormBtn?.addEventListener('click', () => {
    if (!validate()) return;

    const resumen = {
      negocio: { id: currentNegocioId, nombre: shopName.value.trim(), direccion: shopAddress.value.trim() },
      responsable: { nombre_completo: ownerName.value.trim(), correo: ownerEmail.value.trim(), telefono: ownerPhone.value.trim() },
      servicios: services.map(s => ({
        nombre: (s.name||'').trim(),
        duracion_min: Number(s.durationMins || 0),
        precio_cop: s.priceCOP === '' ? null : Number(s.priceCOP),
        tokens: computeTokens(s.durationMins)
      })),
      personal: staff.map(p => ({
        nombre_publico: (p.name||'').trim(),
        servicios: Array.from(p.services.values())
      }))
    };

    if (summaryText) summaryText.textContent = JSON.stringify(resumen, null, 2);
    if (resumenSec) resumenSec.style.display = 'block';
    if (registroFinalSec) registroFinalSec.style.display = 'block';
    resumenSec?.scrollIntoView?.({ behavior:'smooth', block:'start' });
  });

  registerBusinessBtn?.addEventListener('click', async () => {
    if (!validate()) return;

    const payload = {
      responsable: {
        nombre_completo: ownerName.value.trim(),
        correo: ownerEmail.value.trim(),
        telefono: ownerPhone.value.trim()
      },
      negocio: {
        id: currentNegocioId,
        nombre: shopName.value.trim(),
        direccion: shopAddress.value.trim(),
        activo: false
      },
      servicios: services.map(s => ({
        nombre: (s.name||'').trim(),
        duracion_min: Number(s.durationMins || 0),
        precio_cop: s.priceCOP === '' ? null : Number(s.priceCOP),
        tokens: computeTokens(s.durationMins)
      })),
      personal: staff.map(p => ({
        nombre_publico: (p.name||'').trim(),
        servicios: Array.from(p.services.values())
      }))
    };

    try {
      await BarberoNegocioController.registrarNegocioCompleto(payload);
      alert('Negocio registrado. Queda pendiente de aprobación.');
      window.location.hash = '#/barbero/organizar-agenda';
    } catch (e) {
      console.error(e);
      alert('No se pudo registrar el negocio. Revisa la consola.');
    }
  });
}
