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
        opcion.encuesta_id = encuesta._id // Asignar el ID de la encuesta a la opción
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

  // Otras funciones del controlador...

  /**
   * Agrega un usuario a una opción específica de la encuesta.
   * POST /encuestas/:encuestaId/opciones/:opcionId/usuarios/:userId
   */
  async addUserToOption({ params, response }) {
    try {
      const opcion = await OpcionEncuestaAdmin.find(params.opcionId)
      if (!opcion) {
        return response.status(404).json({ error: 'Opción not found' })
      }
  
      const user = await User.find(params.userId)
      if (!user) {
        return response.status(404).json({ error: 'User not found' })
      }
  
      // Verifica si el usuario ya está asociado a la opción
      const existingUser = await opcion.usuarios().where('user_id', user.id).first()
      if (existingUser) {
        return response.status(400).json({ error: 'User already associated with this option' })
      }
  
      // Asigna el usuario a la opción
      await opcion.usuarios().attach([user.id])
  
      return response.status(200).json({ message: 'Usuario agregado a la opción exitosamente' })
    } catch (error) {
      console.error('Error al agregar usuario a la opción:', error.message)
      return response.status(500).json({ error: 'Internal Server Error' })
    }
  }
}  


module.exports = EncuestaAdminController
