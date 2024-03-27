// Archivo: EncuestaAdmin.js en app/Models

'use strict'

const Model = use('Model')

class EncuestaAdmin extends Model {
  opciones() {
    return this.hasMany('App/Models/OpcionEncuestaAdmin')
  }
}

module.exports = EncuestaAdmin
