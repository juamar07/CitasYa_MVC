export function formatDate(date){
  return new Date(date).toLocaleDateString('es-CO');
}

export function formatTime(date){
  return new Date(date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export function toISO(date){
  if (typeof date === 'string') return new Date(date).toISOString();
  return date.toISOString();
}

export function addMinutes(date, minutes){
  return new Date(date.getTime() + minutes * 60000);
}
