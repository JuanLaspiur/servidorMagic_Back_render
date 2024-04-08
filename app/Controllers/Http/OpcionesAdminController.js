'use strict';

const OpcionEncuestaAdmin = use("./../../Models/OpcionEncuestaAdmin.js");
const { ObjectId } = require('mongodb');

class OpcionesAdminController {
  /**
   * Muestra todas las opciones de una encuesta por su ID.
   * GET /encuestas/:idEncuesta/opciones
   */
  async  index({ params, response }) {
    try {
      const idEncuesta = params.encuestaId; // Suponiendo que el parámetro se llama 'encuestaId'
      console.log('Encuesta ID:', idEncuesta);
  
      // Convertir idEncuesta a ObjectId
      const objectIdEncuestaId = new ObjectId(idEncuesta);
  
      // Buscar todas las opciones asociadas a la encuesta por su ID
      const opciones = await OpcionEncuestaAdmin.query().where('encuesta_id', objectIdEncuestaId).fetch();
  
      // Retornar las opciones de la encuesta
      return response.status(200).json(opciones);
    } catch (error) {
      console.error('Error al obtener las opciones de la encuesta:', error.message);
      return response.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getAllOptions({ response }) {
    try {
      // Buscar todas las opciones de encuesta
      const opciones = await OpcionEncuestaAdmin.all();

      // Retornar las opciones de encuesta
      return response.status(200).json(opciones);
    } catch (error) {
      console.error('Error al obtener las opciones de encuesta:', error.message);
      return response.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = OpcionesAdminController;

