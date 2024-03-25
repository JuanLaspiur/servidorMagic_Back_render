'use strict'

const EncuestaAdmin = use("App/Models/EncuestaAdmin")
const OpcionEncuestaAdmin = use("App/Models/OpcionEncuestaAdmin")
const User = use("App/Models/User")

class EncuestaAdminController {
  /**
   * Muestra todas las encuestas de administrador.
   * GET /encuestas-admin
   */
  async index ({ request, response }) {
    try {
      const encuestas = await EncuestaAdmin.all()
      response.status(200).json(encuestas)
    } catch (error) {
      console.error('Error al obtener las encuestas de administrador:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Muestra una encuesta de administrador por su ID.
   * GET /encuestas-admin/:id
   */
  async show ({ params, response }) {
    try {
      const encuesta = await EncuestaAdmin.find(params.id)
      if (!encuesta) {
        response.status(404).json({ error: 'Encuesta de administrador not found' })
        return
      }
      await encuesta.load('opciones')
      response.status(200).json(encuesta)
    } catch (error) {
      console.error('Error al obtener la encuesta de administrador:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Crea una nueva encuesta de administrador.
   * POST /encuestas-admin
   */
  async store ({ request, response }) {
    const { pregunta, opciones } = request.only(['pregunta', 'opciones'])
    try {
      const encuesta = new EncuestaAdmin()
      encuesta.pregunta = pregunta
      await encuesta.save()

      for (const opcionText of opciones) {
        const opcion = new OpcionEncuestaAdmin()
        opcion.texto = opcionText
        opcion.encuesta_id = encuesta.id
        await opcion.save()
      }

      response.status(201).json({ message: 'Encuesta de administrador creada exitosamente', encuesta })
    } catch (error) {
      console.error('Error al crear la encuesta de administrador:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Actualiza una encuesta de administrador existente por su ID.
   * PUT /encuestas-admin/:id
   */
  async update ({ params, request, response }) {
    const { pregunta, opciones } = request.only(['pregunta', 'opciones'])
    try {
      const encuesta = await EncuestaAdmin.find(params.id)
      if (!encuesta) {
        response.status(404).json({ error: 'Encuesta de administrador not found' })
        return
      }

      encuesta.pregunta = pregunta
      await encuesta.save()

      // Eliminar las opciones existentes
      await encuesta.opciones().delete()

      // Crear las nuevas opciones
      for (const opcionText of opciones) {
        const opcion = new OpcionEncuestaAdmin()
        opcion.texto = opcionText
        opcion.encuesta_id = encuesta.id
        await opcion.save()
      }

      response.status(200).json({ message: 'Encuesta de administrador actualizada exitosamente', encuesta })
    } catch (error) {
      console.error('Error al actualizar la encuesta de administrador:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Elimina una encuesta de administrador existente por su ID.
   * DELETE /encuestas-admin/:id
   */
  async destroy ({ params, response }) {
    try {
      const encuesta = await EncuestaAdmin.find(params.id)
      if (!encuesta) {
        response.status(404).json({ error: 'Encuesta de administrador not found' })
        return
      }

      await encuesta.delete()

      response.status(200).json({ message: 'Encuesta de administrador eliminada exitosamente' })
    } catch (error) {
      console.error('Error al eliminar la encuesta de administrador:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }
}

module.exports = EncuestaAdminController
