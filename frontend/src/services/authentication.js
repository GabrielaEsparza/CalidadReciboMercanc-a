 import api from './apiConfig';


/**
 * Autentica un usuario en el sistema
 * @param {string} username - usuario a autenticar
 * @param {string} password - contraseña a verificar
 */
export const autenticar = async (username, password) => {
  try {
    // Cambiamos { username, password } por las llaves exactas del backend { Name, Password }
    const respuesta = await api.post('/auth/login', { 
      Name: username, 
      Password: password 
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error en la autenticación:", error);
    throw error;
  }
};
