// src/router/index.js
import routes from './routes.js';
import { render } from './render.js';

function parseHash(){
  const raw = location.hash.slice(1) || '/';
  const [path, q] = raw.split('?');
  return { path: path.startsWith('/') ? path : `/${path}`, query: new URLSearchParams(q||'') };
}
export function navigate(to){ location.hash = to.startsWith('#') ? to : `#${to.replace(/^#/, '')}`; }

async function handle(){
  try {
    const { path, query } = parseHash();
    const route = routes.find(r => r.path === path) || routes.find(r => r.path === '/404');

    const prevHash = location.hash;
    if (route?.guard) await route.guard();
    if (location.hash !== prevHash) return;

    const mod = await route.component();
    const view = mod?.default;
    if (typeof view !== 'function') throw new Error(`La vista "${path}" no exporta default`);
    const html = await view({ query });
    render(html);
    if (typeof mod.onMount === 'function') mod.onMount({ query });
  } catch (err) {
    render(`<pre style="padding:16px;background:#111;color:#eee;white-space:pre-wrap">
🚨 Router error:
${String(err?.stack || err)}
</pre>`);
    console.error('Router error:', err);
  }
}

export function startRouter(){
  window.addEventListener('hashchange', handle);
  // ✅ Ejecutar inmediatamente, sin esperar al evento 'load'
  if (!location.hash) navigate('/');  // asegura ruta por defecto
  handle();                            // render inmediato
}
