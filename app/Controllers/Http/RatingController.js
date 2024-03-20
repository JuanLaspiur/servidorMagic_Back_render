'use strict'

const Rating = use("App/Models/Rating")
const Quedada = use("App/Models/Quedada")

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

  async calificacion({
    params,
    response,
    view
  }) {
    let calificaciones = (await Rating.query().where({amphitryon_id: params.id}).fetch()).toJSON()
    let total = 0
    for (let i = 0; i < calificaciones.length; i++) {
      total = total + calificaciones[i].rating
    }
    let promedio = 0
    if (calificaciones.length) {
      promedio = total / calificaciones.length
    }
    response.send(promedio)
  }

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
    const nuevo = await Rating.create(body)
    let quedada = await Quedada.find(nuevo.quedada_id)
    for (let i of quedada.asistentes) {
      if (i.user_id === nuevo.user_id) { i.rating_id = nuevo._id }
    }
    quedada.save()
    response.send(nuevo)
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
  async show({
    params,
    request,
    response,
    view
  }) {}

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
