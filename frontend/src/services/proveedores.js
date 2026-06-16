 import api from './apiConfig';

/**
 * Trae la lista completa de proveedores activos
 */
export const getProveedores = async () => {
  try {
    const respuesta = await api.get('/proveedores');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    throw error;
  }
};

/**
 * Busca proveedores específicos por nombre o código
 * @param {string} terminoBusqueda - Texto a buscar
 */
export const buscarProveedores = async (terminoBusqueda) => {
  try {
    const respuesta = await api.get(`/proveedores/buscar?q=${terminoBusqueda}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error en la búsqueda de proveedores:", error);
    throw error;
  }
};
