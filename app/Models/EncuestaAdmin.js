// Archivo: EncuestaAdmin.js en app/Models

'use strict'

const Model = use('Model')

class EncuestaAdmin extends Model {
  // Relación de uno a muchos: una encuesta de administrador tiene muchas opciones
  opciones() {
    return this.hasMany('App/Models/OpcionEncuestaAdmin')
  }
}

module.exports = EncuestaAdmin
