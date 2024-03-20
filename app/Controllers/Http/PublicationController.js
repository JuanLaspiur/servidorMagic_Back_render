'use strict'

const Publication = use("App/Models/Publication")
const Animales = use("App/Models/Animale")
const Reacciones = use("App/Models/Reaccion")
const moment = require('moment')

/* const mkdirp = use('mkdirp')
const Helpers = use('Helpers')
const { validate } = use("Validator")
const fs = require('fs')
var randomize = require('randomatic'); */


/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with Rating
 */
class RatingController {
  /**
   * Show a list of all Rating.
   * GET Rating
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({
    request,
    response,
    view
  }) {}

  /**
   * Render a form to be used for creating a new Rating.
   * GET Rating/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({
    request,
    response,
    view
  }) {}

  /**
   * Create/save a new Rating.
   * POST Rating
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({
    request,
    response
  }) {
    let body = request.all()
    moment.locale('es')
    body.date = moment().format('dddd DD MMM YYYY')
    const nuevo = await Publication.create(body)
    response.send(nuevo)
  }

  async reaccionar({ request, params, auth, response }) {
    const user = (await auth.getUser()).toJSON()
    let body = request.all()
    let listo = (await Reacciones.query().where({publicidad_id: params.id, user_id: user._id}).first())
    let newReaccion = {
      publicidad_id: params.id,
      reaccion_id: body._id,
      user_id: user._id
    }
    if (listo) {
      const modificar = await Reacciones.query().where('_id', listo._id).update({reaccion_id: body._id})
    } else {
      const nuevo = await Reacciones.create(newReaccion)
    }
    response.send(true)
  }

  /**
   * Display a single Rating.
   * GET Rating/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response }) {
    let animales = (await Animales.query().where({}).fetch()).toJSON()
    let publicaciones = (await Publication.query().where({user_id: params.id}).fetch()).toJSON()
    for (let i = 0; i < publicaciones.length; i++) {
      publicaciones[i].reacciones = []
      let reacciones = (await Reacciones.query().where({publicidad_id: publicaciones[i]._id}).fetch()).toJSON()
      for (let j = 0; j < animales.length; j++) {
        if (reacciones.find(v => v.reaccion_id === animales[j]._id) && !publicaciones[i].reacciones.find(v => v._id === animales[j]._id)) {
          var total = reacciones.filter(v => v.reaccion_id === animales[j]._id)
          var newAnimal = JSON.parse(JSON.stringify(animales[j]))
          newAnimal.total = total.length
          publicaciones[i].reacciones.push(newAnimal)
        }
      }
      publicaciones[i].totalReacciones = reacciones.length
    }
    response.send(publicaciones)
  }

  /**
   * Render a form to update an existing Rating.
   * GET Rating/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({
    params,
    request,
    response,
    view
  }) {}

  /**
   * Update Rating details.
   * PUT or PATCH Rating/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({
    params,
    request,
    response
  }) {}

  /**
   * Delete a Rating with id.
   * DELETE Rating/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({
    params,
    request,
    response
  }) {}
}

module.exports = RatingController
