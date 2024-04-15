'use strict'
const Helpers = use('Helpers')
const mkdirp = use('mkdirp')
var ObjectId = require('mongodb').ObjectId;
const fs = require('fs')
const imgDefault = Helpers.appRoot('public/noperfil.png')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with uploads
 */
class UploadController {
  /**
   * Show a list of all uploads.
   * GET uploads
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new upload.
   * GET uploads/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new upload.
   * POST uploads
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single upload.
   * GET uploads/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing upload.
   * GET uploads/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update upload details.
   * PUT or PATCH uploads/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a upload with id.
   * DELETE uploads/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }

  async getFileByDirectoryPerfil ({ params, response }) {
    const dir = params.file
    const path = Helpers.appRoot('storage/uploads/perfil') + `/${dir}`
    if(fs.existsSync(path)){
      response.download(path)
    } else {
      response.download(imgDefault)
    }
  }
  async getFileByDirectoryInsignas ({ params, response }) {
    const dir = params.file
    const path = Helpers.appRoot('storage/uploads/insignas') + `/${dir}`
    if(fs.existsSync(path)){
      response.download(path)
    } else {
      response.download(imgDefault)
    }
  }

  async getFileByDirectoryMediacion ({ params, response }) {
    const dir = params.file
    response.download(Helpers.appRoot('storage/uploads/mediacion') + `/${dir}`)
  }

  async getFileByDirectoryQuedada ({ params, response }) {
    const dir = params.file
    response.download(Helpers.appRoot('storage/uploads/quedada') + `/${dir}`)
  }
  async getFileByDirectoryTabloide ({ params, response }) {
    const dir = params.file
    response.download(Helpers.appRoot('storage/uploads/tabloide') + `/${dir}`)
  }

  async getFileByChat ({ params, response }) {
    const dir = params.file
    response.download(Helpers.appRoot('storage/chat_images') + `/${dir}`)
  }
}

module.exports = UploadController
