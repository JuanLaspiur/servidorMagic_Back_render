'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {
  static get fillable() {
    return ['email', 'password', 'deleted', 'dateDeleted'] // Agregamos 'deleted_at' como no requerido
  }

  static fieldValidationRules() {
    const rulesUser = {
      email: 'required|email',
      password: 'required|string|max:256'
    }
    return rulesUser
  }

  static boot () {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  ciudad () {
    return this.hasOne("App/Models/City", "city", "_id")
  }

  comunidad () {
    return this.hasOne("App/Models/Community", "community", "_id")
  }

  animalInfo () {
    return this.hasOne("App/Models/Animale", "animal", "_id")
  }
}

module.exports = User

