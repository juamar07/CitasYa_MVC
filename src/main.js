// src/main.js (diagnóstico)
import { supabase } from './config/supabaseClient.js';

const app = document.getElementById('app');
const log = (m) => console.log('[BOOT]', m);
const show = (html) => app && (app.innerHTML = html);

// Captura errores globales para que NO quede la página en blanco
window.addEventListener('error', (e) => {
  show(`<pre style="padding:16px;background:#111;color:#eee;white-space:pre-wrap">
🚨 JS error:
${e?.error?.stack || e?.message}
</pre>`);
});
window.addEventListener('unhandledrejection', (e) => {
  show(`<pre style="padding:16px;background:#111;color:#eee;white-space:pre-wrap">
🚨 Promise rejection:
${e?.reason?.stack || e?.reason}
</pre>`);
});

show('<p style="padding:16px">Boot paso 1: main.js cargado ✅</p>');
log('main.js ok');

try {
  const ping = await supabase.rpc('get_public_negocios');
  console.log('RPC get_public_negocios =>', ping);
} catch (e) {
  console.warn('RPC ping falló:', e);
}

// Importa el router *con manejo de errores visible*
try {
  const { startRouter } = await import('./router/index.js');
  show('<p style="padding:16px">Boot paso 2: router importado ✅</p>');
  startRouter();
} catch (e) {
  show(`<pre style="padding:16px;background:#111;color:#eee;white-space:pre-wrap">
🚨 Error importando router/index.js
${e.stack || e}
</pre>`);
}
