'use strict';

const Model = use('Model');

class Insigna extends Model {
  static get fillable() {
    return ['name', 'description', 'image']; // Agregar los campos necesarios
  }

  static fieldValidationRules() {
    const rulesInsigna = {
      name: 'required|string|max:255',
      description: 'string|max:512',
      image: 'required|string' // Puedes ajustar la validación de la imagen según tus necesidades
    };
    return rulesInsigna;
  }

  // Relación con la lista de usuarios que poseen esta insignia
  usuarios() {
    return this.belongsToMany('App/Models/User').pivotTable('user_insigna');
  }

  // Método para obtener los IDs de usuarios asociados a esta insignia
  getUsuariosIds() {
    return this.usuario_ids ? this.usuario_ids.split(',') : [];
  }

  // Método para establecer los IDs de usuarios asociados a esta insignia
  setUsuariosIds(ids) {
    this.usuario_ids = ids.join(',');
  }
}

module.exports = Insigna;

