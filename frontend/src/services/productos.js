const BASE = 'http://localhost:5000';

export const buscarProductoPorSku = async (sku) => {
  const res = await fetch(`${BASE}/api/productos/${encodeURIComponent(sku)}`);
  if (!res.ok) throw new Error('SKU no encontrado en catálogo');
  return res.json();
};
