"use strict";

const OpcionEncuesta = use("./../../Models/OpcionEncuesta.js");
const User = use("./../../Models/User.js");
const { ObjectId } = require("mongodb");

class OpcionController {
  /**
   * Muestra todas las opciones de una encuesta por su ID.
   * GET /opciones/:encuestaId
   */
  async index({ params, response }) {
    try {
      const idEncuesta = params.encuestaId; // Suponiendo que el parámetro se llama 'encuestaId'
      // Convertir idEncuesta a ObjectId
      const objectIdEncuestaId = new ObjectId(idEncuesta);

      // Buscar todas las opciones asociadas a la encuesta por su ID
      const opciones = await OpcionEncuesta.query()
        .where("encuesta_id", objectIdEncuestaId)
        .fetch();

      // Retornar las opciones de la encuesta
      return response.status(200).json(opciones);
    } catch (error) {
      console.error(
        "Error al obtener las opciones de la encuesta:",
        error.message
      );
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Muestra una opción por su ID.
   * GET /opciones/:id
   */
  async show({ params, response }) {
    try {
      const opcionId = params.id; // Obtener el ID de la opción de la URL

      // Verificar si la opción existe
      const opcion = await OpcionEncuesta.find(opcionId);

      if (!opcion) {
        return response.status(404).json({ error: "Opción no encontrada" });
      }

      // Retornar la opción encontrada
      return response.status(200).json(opcion);
    } catch (error) {
      console.error("Error al obtener la opción de encuesta:", error.message);
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Obtiene todas las opciones.
   * GET /opciones
   */
  async getAllOptions({ response }) {
    try {
      // Buscar todas las opciones de encuesta
      const opciones = await OpcionEncuesta.all();

      // Retornar las opciones de encuesta
      return response.status(200).json(opciones);
    } catch (error) {
      console.error(
        "Error al obtener las opciones de encuesta:",
        error.message
      );
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Vota por una opción específica en una encuesta.
   * POST /opciones/votar
   */
  async votar({ request, response }) {
    try {
      const { opcionId, usuarioId } = request.only(["opcionId", "usuarioId"]);

      // Verificar si la opción existe
      const opcion = await OpcionEncuesta.find(opcionId);
      if (!opcion) {
        return response.status(404).json({ error: "Opción no encontrada" });
      }
      // Verificar si el usuario existe
      const usuario = await User.find(usuarioId);
      if (!usuario) {
        return response.status(404).json({ error: "Usuario no encontrado" });
      }

      // Agregar el ID del usuario a la lista de usuarios que han votado por esta opción
      let usuariosIds = opcion.getUsuariosIds();

      usuariosIds.push(usuarioId); // Agregar el nuevo usuarioId
      opcion.setUsuariosIds(usuariosIds); // Actualizar la lista de IDs de usuarios
      await opcion.save(); // Guardar la opción actualizada

      return response
        .status(200)
        .json({ message: "Voto registrado correctamente " });
    } catch (error) {
      console.error("Error al votar por la opción:", error.message);
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

module.exports = OpcionController;
