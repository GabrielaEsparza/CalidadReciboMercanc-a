 import api from './apiConfig';


/**
 * Autentica un usuario en el sistema
 * @param {string} username - usuario a autenticar
 * @param {string} password - contraseña a verificar
 */
export const autenticar = async (username, password) => {
  try {
    const respuesta = await api.post('/authentication', { username, password });
    return respuesta.data;
  } catch (error) {
    console.error("Error en la autenticación:", error);
    throw error;
  }
};
