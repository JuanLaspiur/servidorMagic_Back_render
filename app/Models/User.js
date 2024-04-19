const Hash = use('Hash')
const Model = use('Model')

class User extends Model {
  static get fillable() {
    return ['email', 'password', 'deleted', 'dateDeleted', 'tutorial']
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

    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })

    // Inicializar el atributo 'tutorial' en 'false' al crear un nuevo usuario
    this.addHook('beforeCreate', async (userInstance) => {
      userInstance.tutorial = false;
    })
  }

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


