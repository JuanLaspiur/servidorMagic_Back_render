/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OpcionEncuesta extends Model {
  // Relación de muchos a uno: una opción pertenece a una encuesta
  encuesta() {
    return this.belongsTo('App/Models/Encuesta')
  }

  // Relación de muchos a muchos: una opción puede ser elegida por muchos usuarios
  usuarios() {
    return this.belongsToMany('App/Models/User')
      .pivotTable('opcion_usuario') // Tabla pivote que relaciona opciones y usuarios
  }
}

module.exports = OpcionEncuesta
