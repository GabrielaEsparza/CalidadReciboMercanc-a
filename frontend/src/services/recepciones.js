import api from './apiConfig';
import { useEffect, useState } from 'react';

/**
 * Obtiene las recepciones del sistema, permitiendo filtrar por estatus, fecha de inicio y fecha fin.
 * @param {Object} filtros - Objeto opcional con los criterios de búsqueda
 * @param {string} filtros.estatus - El estado a filtrar (ej: "En Curso", "Terminado")
 * @param {string} filtros.fechaInicio - Fecha inicial en formato YYYY-MM-DD
 * @param {string} filtros.fechaFin - Fecha final en formato YYYY-MM-DD
 */
export const getRecepciones = async (filtros = {}) => {
  try {
    // Usamos 'params' para que Axios pegue los filtros automáticamente a la URL
    // Ejemplo final: /recepciones?estado=En+Curso&fechaInicio=2026-06-01
    const respuesta = await api.get('/recepciones', { 
      params: {
        estado: filtros.estatus,
        fecha_inicio: filtros.fechaInicio,
        fecha_fin: filtros.fechaFin
      }
    }); 
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener recepciones con filtros:", error);
    throw error;
  }
};

/**
 * Crea un nuevo reg de recepción en el sistema
 * @param {Object} datosRecepcion - Objeto con OC, Proveedor, Contenedor, etc.
 */
export const crearRecepcion = async (datosRecepcion) => {
  try {
    const respuesta = await api.post('/recepciones', datosRecepcion);
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear la recepción:", error);
    throw error;
  }
};

/**
 * Actualiza el estado de una recepción
 * @param {string} id - Id único de la recepción
 * @param {Object} camposActualizados - Campos que van a cambiar
 */
export const actualizarRecepcion = async (id, camposActualizados) => {
  try {
    const respuesta = await api.put(`/recepciones/${id}`, camposActualizados);
    return respuesta.data;
  } catch (error) {
    console.error(`Error al actualizar la recepción ${id}:`, error);
    throw error;
  }
};
