export function formatCurrency(value, currency = 'COP'){
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(Number(value || 0));
}
