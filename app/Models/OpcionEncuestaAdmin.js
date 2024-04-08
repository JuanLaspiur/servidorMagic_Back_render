'use strict';

const Model = use('Model');

class OpcionEncuestaAdmin extends Model {
  // Relación de muchos a uno: una opción pertenece a una encuesta de administrador
  encuesta() {
    return this.belongsTo('App/Models/EncuestaAdmin');
  }

  // Relación de muchos a muchos: una opción puede ser elegida por muchos usuarios
  usuarios() {
    return this.belongsToMany('App/Models/User')
      .pivotTable('opcion_usuario_admin'); // Tabla pivote que relaciona opciones y usuarios
  }

  // Atributo para almacenar los IDs de usuarios como strings
  getUsuariosIds() {
    return this.usuario_ids ? this.usuario_ids.split(',') : [];
  }

  setUsuariosIds(ids) {
    this.usuario_ids = ids.join(',');
  }
}

module.exports = OpcionEncuestaAdmin;

