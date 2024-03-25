/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Encuesta extends Model {
  // Relación de uno a muchos: una encuesta pertenece a un usuario
  usuario() {
    return this.belongsTo('App/Models/User')
  }

  // Relación de uno a muchos: una encuesta tiene muchas opciones
  opciones() {
    return this.hasMany('App/Models/OpcionEncuesta')
  }
}

module.exports = Encuesta
