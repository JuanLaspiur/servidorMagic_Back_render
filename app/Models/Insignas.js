'use strict'

const Model = use('Model')

class Insigna extends Model {
  static get fillable() {
    return ['name', 'description', 'image'] // Agregar los campos necesarios
  }

  static fieldValidationRules() {
    const rulesInsigna = {
      name: 'required|string|max:255',
      description: 'string|max:512',
      image: 'required|string' // Puedes ajustar la validación de la imagen según tus necesidades
    }
    return rulesInsigna
  }

  // Relación con la lista de usuarios que poseen esta insignia
  users() {
    return this.belongsToMany('App/Models/User').pivotTable('user_insigna')
  }
}

module.exports = Insigna
