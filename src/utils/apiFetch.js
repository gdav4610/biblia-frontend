// Helper para peticiones al backend
// No es posible establecer el header estándar `Origin` desde JavaScript en el navegador
// (es un encabezado controlado por el navegador). Si necesitas enviar la "origen" de la app
// al backend de forma explícita, este helper añade un header personalizado `X-Client-Origin`
// con window.location.origin para que el backend pueda confiar en ese valor.

export default function apiFetch(url, options = {}) {
  const opts = { ...(options || {}) };
  const existingHeaders = opts.headers || {};
  const originHeader = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : 'unknown';

  // No intentamos tocar el header 'Origin' (forbidden). Añadimos un header custom en su lugar.
  const headers = {
    ...existingHeaders,
    'X-Client-Origin': originHeader,
  };

  opts.headers = headers;

  return fetch(url, opts);
}

