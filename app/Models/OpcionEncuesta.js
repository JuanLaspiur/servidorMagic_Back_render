const Model = use('Model')

class OpcionEncuesta extends Model {
  encuesta() {
    return this.belongsTo('App/Models/Encuesta')
  }

  usuarios() {
    return this.belongsToMany('App/Models/User')
      .pivotTable('opcion_usuario') 
  }

  // Atributo para almacenar los IDs de usuarios como strings
  getUsuariosIds() {
    return this.usuario_ids ? this.usuario_ids.split(',') : [];
  }

  setUsuariosIds(ids) {
    this.usuario_ids = ids.join(',');
  }
}

module.exports = OpcionEncuesta;
