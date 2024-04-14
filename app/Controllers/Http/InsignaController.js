"use strict";

const Insigna = use("App/Models/Insignas");
var randomize = require("randomatic");
const { upload } = require('../../Middleware/multer');
const multer = require('multer');
class InsignaController {

  /**
   * Muestra todas las insignias.
   * GET /insignas
   */
  async index({ response }) {
    try {
      const insignas = await Insigna.all();
      return response.status(200).json(insignas);
    } catch (error) {
      console.error("Error al obtener las insignias:", error.message);
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }
  async agregarUsuarioAInsigna({ params, response }) {
    try {
      const { insignaId, userId } = params;

      // Encuentra la insignia por su ID
      const insigna = await Insigna.find(insignaId);
      if (!insigna) {
        return response.status(404).json({ error: "Insignia no encontrada" });
      }

      // Obtiene la lista actual de IDs de usuarios y agrega el nuevo ID de usuario
      let usuariosIds = insigna.getUsuariosIds();
      usuariosIds.push(userId);

      // Establece la nueva lista de IDs de usuarios en la insignia y guarda los cambios
      insigna.setUsuariosIds(usuariosIds);
      await insigna.save();

      return response
        .status(200)
        .json({ message: "Usuario agregado a la insignia exitosamente" });
    } catch (error) {
      console.error(
        "Error al agregar el usuario a la insignia:",
        error.message
      );
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Muestra una insignia por su ID.
   * GET /insignas/:id
   */
  async show({ params, response }) {
    try {
      const insignaId = params.id;
      const insigna = await Insigna.find(insignaId);

      if (!insigna) {
        return response.status(404).json({ error: "Insignia no encontrada" });
      }

      return response.status(200).json(insigna);
    } catch (error) {
      console.error("Error al obtener la insignia:", error.message);
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Crea una nueva insignia.
   * POST /insignas
   */
  async store({ request, response }) {
    try {
      const { name, description, image } = request.only([
        "name",
        "description",
        "image",
      ]);
      const insigna = await Insigna.create({ name, description, image });
      return response.status(201).json(insigna);
    } catch (error) {
      console.error("Error al crear la insignia:", error.message);
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Actualiza una insignia existente por su ID.
   * PUT /insignas/:id
   */
  async update({ params, request, response }) {
    try {
      const insignaId = params.id;
      const insigna = await Insigna.find(insignaId);

      if (!insigna) {
        return response.status(404).json({ error: "Insignia no encontrada" });
      }

      const { name, description, image, usuario_ids } = request.only([
        "name",
        "description",
        "image",
        "usuario_ids",
      ]);

      // Fusionar los datos de la insignia con los nuevos valores
      insigna.merge({ name, description, image, usuario_ids });
      await insigna.save();

      return response.status(200).json(insigna);
    } catch (error) {
      console.error("Error al actualizar la insignia:", error.message);
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Elimina una insignia por su ID.
   * DELETE /insignas/:id
   */
  async destroy({ params, response }) {
    try {
      const insignaId = params.id;
      const insigna = await Insigna.find(insignaId);

      if (!insigna) {
        return response.status(404).json({ error: "Insignia no encontrada" });
      }

      await insigna.delete();

      return response
        .status(204)
        .json({ message: "Insignia eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar la insignia:", error.message);
      return response.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async addImg({ request, response }) {
    try {
      // Llamar al middleware de Multer para manejar la carga de archivos
      upload.single('file')(request, response, async function (err) {
        if (err instanceof multer.MulterError) {
          // Si hay un error de Multer, manejarlo aquí
          console.log('Error de Multer:', err);
          response.status(500).send('Error de Multer');
        } else if (err) {
          // Si hay otro tipo de error, manejarlo aquí
          console.log('Otro error:', err);
          response.status(500).send('Error al procesar la solicitud');
        } else {
          // Si la carga de archivos se completó correctamente, obtener el archivo subido
          let profilePic = request.file;
          console.log('Imagen de la solicitud:', profilePic);
          
          // Aquí puedes realizar cualquier procesamiento adicional con el archivo subido
          
          response.status(200).send('Archivo subido correctamente');
        }
      });
    } catch (error) {
      // Manejar errores generales aquí
      console.log('Error:', error);
      response.status(500).send('Error interno del servidor');
    }
  }
  
}

module.exports = InsignaController;
