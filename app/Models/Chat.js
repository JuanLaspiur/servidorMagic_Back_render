'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Chat extends Model {
  quedadaInfo () {
    return this.hasOne('App/Models/Quedada', 'evento_id', '_id')
  }
  encuestaAdmin() {
    return this.hasOne('App/Models/EncuestaAdmin')
  }
}

module.exports = Chat
