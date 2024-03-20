'use strict'
const Notification = use("App/Models/Notification")
const moment = require('moment')
moment.locale('es')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with notifications
 */
class NotificationController {
  /**
   * Show a list of all notifications.
   * GET notifications
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async newNotifications ({ request, response, auth }) {
    try {
      const user = (await auth.getUser()).toJSON()
      let data = (await Notification.query().where({ visto: false, user_id: user._id }).fetch()).toJSON()
      response.send(data.length)
    } catch (error) {
      console.error('newNotifications: ' + error.name + ': ' + error.message);
    }
  }

  async allNotifications ({ request, response, auth }) {
    try {
      const user = (await auth.getUser()).toJSON()
      let data = (await Notification.query().where({ user_id: user._id }).fetch()).toJSON()
      data = data.map(v => {
        return {
          ...v,
          date: moment(v.updated_at).format('DD/MM/YYYY')
        }
      })
      data = data.sort((a, b) => {
        if (a.updated_at > b.updated_at) {
          return -1
        } else if (a.updated_at < b.updated_at) {
          return 1
        }
        return 0
      })
      response.send(data)
    } catch (error) {
      console.error('allNotifications: ' + error.name + ': ' + error.message);
    }
  }

  /**
   * Render a form to be used for creating a new notification.
   * GET notifications/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  /**
   * Create/save a new notification.
   * POST notifications
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single notification.
   * GET notifications/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing notification.
   * GET notifications/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
    await Notification.query().where({_id: params.id}).update({visto: true})
    response.send(true)
  }

  /**
   * Update notification details.
   * PUT or PATCH notifications/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a notification with id.
   * DELETE notifications/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = NotificationController
