import api from './apiConfig';

export const autenticar = async (username, password) => {
  try {
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

export const actualizarPerfil = async ({ passwordActual, nuevoNombre, nuevaPassword }) => {
  try {
    const respuesta = await api.put('/auth/perfil', {
      PasswordActual: passwordActual,
      NuevoNombre: nuevoNombre || null,
      NuevaPassword: nuevaPassword || null,
    });
    return respuesta.data;
  } catch (error) {
    const mensaje = error.response?.data?.mensaje || "Error al actualizar perfil.";
    throw new Error(mensaje);
  }
};
