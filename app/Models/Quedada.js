'use strict'

const Model = use('Model')

class Quedada extends Model {
  static get schema () {
    return {
      comentarios_quedada_terminada: {
        type: Array,
        required: false,
        itemType: 'object',
        schema: {
          user_id: { type: 'string' },
          comentario: { type: 'string' }
        }
      },
      imagenes_quedada_terminada: { type: String, required: false }
    }
  }
}

module.exports = Quedada
