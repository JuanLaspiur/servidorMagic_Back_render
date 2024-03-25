'use strict'

const Encuesta = use("App/Models/Encuesta")
const Opcion = use("App/Models/Opcion")
const User = use("App/Models/User")

class EncuestaController {
  /**
   * Muestra todas las encuestas.
   * GET /encuestas
   */
  async index ({ request, response }) {
    try {
      const encuestas = await Encuesta.all()
      response.status(200).json(encuestas)
    } catch (error) {
      console.error('Error al obtener las encuestas:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Muestra una encuesta por su ID.
   * GET /encuestas/:id
   */
  async show ({ params, response }) {
    try {
      const encuesta = await Encuesta.find(params.id)
      if (!encuesta) {
        response.status(404).json({ error: 'Encuesta not found' })
        return
      }
      await encuesta.load('opciones')
      response.status(200).json(encuesta)
    } catch (error) {
      console.error('Error al obtener la encuesta:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Crea una nueva encuesta.
   * POST /encuestas
   */
  async store ({ request, response }) {
    const { pregunta, opciones } = request.only(['pregunta', 'opciones'])
    try {
      const encuesta = new Encuesta()
      encuesta.pregunta = pregunta
      await encuesta.save()

      for (const opcionText of opciones) {
        const opcion = new Opcion()
        opcion.texto = opcionText
        opcion.encuesta_id = encuesta.id
        await opcion.save()
      }

      response.status(201).json({ message: 'Encuesta creada exitosamente', encuesta })
    } catch (error) {
      console.error('Error al crear la encuesta:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Actualiza una encuesta existente por su ID.
   * PUT /encuestas/:id
   */
  async update ({ params, request, response }) {
    const { pregunta, opciones } = request.only(['pregunta', 'opciones'])
    try {
      const encuesta = await Encuesta.find(params.id)
      if (!encuesta) {
        response.status(404).json({ error: 'Encuesta not found' })
        return
      }

      encuesta.pregunta = pregunta
      await encuesta.save()

      // Eliminar las opciones existentes
      await encuesta.opciones().delete()

      // Crear las nuevas opciones
      for (const opcionText of opciones) {
        const opcion = new Opcion()
        opcion.texto = opcionText
        opcion.encuesta_id = encuesta.id
        await opcion.save()
      }

      response.status(200).json({ message: 'Encuesta actualizada exitosamente', encuesta })
    } catch (error) {
      console.error('Error al actualizar la encuesta:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Elimina una encuesta existente por su ID.
   * DELETE /encuestas/:id
   */
  async destroy ({ params, response }) {
    try {
      const encuesta = await Encuesta.find(params.id)
      if (!encuesta) {
        response.status(404).json({ error: 'Encuesta not found' })
        return
      }

      await encuesta.delete()

      response.status(200).json({ message: 'Encuesta eliminada exitosamente' })
    } catch (error) {
      console.error('Error al eliminar la encuesta:', error.message)
      response.status(500).json({ error: 'Internal Server Error' })
    }
  }
}

module.exports = EncuestaController
