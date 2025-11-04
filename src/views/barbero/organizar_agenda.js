export default async function BarberoOrganizarAgendaView(){
  return `
  <style>
    body{ font-family:'Open Sans',sans-serif; background:#f3f4f9; margin:0; padding:20px; }
    .container{ max-width:960px; margin:0 auto; background:#fff; padding:24px; border-radius:12px; box-shadow:0 10px 30px rgba(15,23,42,.08); border-left:4px solid #5c6bc0; }
    h1{ margin-top:0; }
    .grid{ display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); }
    fieldset{ border:1px solid #d7dbe3; border-radius:10px; padding:16px; }
    legend{ font-weight:700; color:#233247; padding:0 8px; }
    label{ display:block; margin:12px 0 6px; color:#003366; }
    input, select{ width:100%; padding:10px; border:2px solid #d7dbe3; border-radius:8px; font-size:15px; box-sizing:border-box; }
    button{ margin-top:16px; padding:12px 18px; border-radius:8px; border:none; background:#5c6bc0; color:#fff; font-weight:700; cursor:pointer; }
  </style>
  <div class="container">
    <h1>Organizar agenda del barbero</h1>
    <div class="grid">
      <fieldset>
        <legend>Disponibilidad semanal</legend>
        <label for="agenda_dia">Día de la semana</label>
        <select id="agenda_dia">
          <option value="">Selecciona un día</option>
          <option value="1">Lunes</option>
          <option value="2">Martes</option>
          <option value="3">Miércoles</option>
          <option value="4">Jueves</option>
          <option value="5">Viernes</option>
          <option value="6">Sábado</option>
          <option value="0">Domingo</option>
        </select>
        <label for="agenda_inicio">Desde</label>
        <input type="time" id="agenda_inicio" />
        <label for="agenda_fin">Hasta</label>
        <input type="time" id="agenda_fin" />
        <button id="agenda_guardar">Guardar disponibilidad</button>
      </fieldset>
      <fieldset>
        <legend>Servicios ofrecidos</legend>
        <label for="servicio_nombre">Servicio</label>
        <input id="servicio_nombre" placeholder="Ej: Corte clásico" />
        <label for="servicio_duracion">Duración (minutos)</label>
        <input type="number" id="servicio_duracion" min="10" step="5" />
        <label for="servicio_precio">Precio</label>
        <input type="number" id="servicio_precio" step="1000" />
        <button id="servicio_agregar">Agregar servicio</button>
      </fieldset>
    </div>
  </div>`;
}
