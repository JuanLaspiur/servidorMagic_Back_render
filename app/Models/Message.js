'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Message extends Model {
  userInfo () {
    return this.hasOne('App/Models/User', 'user_id', '_id')
  }
}

module.exports = Message
