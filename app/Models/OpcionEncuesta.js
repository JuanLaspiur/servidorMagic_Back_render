/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OpcionEncuesta extends Model {
  encuesta() {
    return this.belongsTo('App/Models/Encuesta')
  }

  usuarios() {
    return this.belongsToMany('App/Models/User')
      .pivotTable('opcion_usuario') 
  }
}

module.exports = OpcionEncuesta
