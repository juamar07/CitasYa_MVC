import { guardAuth, guardRole } from '../store/auth.js';

export default [
  { path: '/', component: () => import('../views/cliente/agendar_publico.js') },

  { path: '/login', component: () => import('../views/auth/login.js') },
  { path: '/registro', component: () => import('../views/auth/register_cliente.js') },

  { path: '/cliente/agendar', guard: () => guardRole('usuario'), component: () => import('../views/cliente/agendar.js') },
  { path: '/cliente/agendar-publico', component: () => import('../views/cliente/agendar_publico.js') },
  { path: '/cliente/cancelar', guard: () => guardRole('usuario'), component: () => import('../views/cliente/cancelar.js') },

  { path: '/barbero/mi-agenda', guard: () => guardRole('barbero'), component: () => import('../views/barbero/mi_agenda.js') },
  { path: '/barbero/organizar-agenda', guard: () => guardRole('barbero'), component: () => import('../views/barbero/organizar_agenda.js') },
  { path: '/barbero/registrar-negocio', guard: () => guardRole('barbero'), component: () => import('../views/barbero/registrar_negocio.js') },

  { path: '/admin', guard: () => guardRole('administrador'), component: () => import('../views/admin/dashboard.js') },

  { path: '/comentarios', guard: () => guardAuth(), component: () => import('../views/comun/comentarios.js') },
  { path: '/pagos',       guard: () => guardAuth(), component: () => import('../views/comun/pagos.js') },

  { path: '/404', component: () => Promise.resolve({ default: () => '<h1>404</h1>' }) }
];
