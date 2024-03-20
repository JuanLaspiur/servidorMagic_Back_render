'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Mediacion extends Model {
  userInfo () {
    return this.hasOne("App/Models/User", "user_id", "_id")
  }

  user1Info () {
    return this.hasOne("App/Models/User", "user1", "_id")
  }

  user2Info () {
    return this.hasOne("App/Models/User", "user2", "_id")
  }
}

module.exports = Mediacion
