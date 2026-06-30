const BASE = 'http://localhost:5000';

export const buscarContenedor = async (numeroContenedor) => {
  const res = await fetch(`${BASE}/api/arribos/contenedor/${encodeURIComponent(numeroContenedor)}`);
  if (!res.ok) throw new Error('Contenedor no encontrado');
  return res.json();
};
