import api from './apiConfig';

export const getOperadores = async () => {
  const resp = await api.get('/operadores');
  return resp.data;
};
