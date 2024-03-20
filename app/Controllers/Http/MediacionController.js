'use strict'
const Mediacion = use("App/Models/Mediacion")
const User = use("App/Models/User")
const Messages = use("App/Models/Message")
const Notification = use("App/Models/Notification")
const Notifications = use('App/Functions/Notifications/Notification')
const Email = use("App/Functions/Email")
var randomize = require('randomatic');
const mkdirp = use('mkdirp')
const Helpers = use('Helpers')
const moment = require('moment')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with mediacions
 */
class MediacionController {
  /**
   * Show a list of all mediacions.
   * GET mediacions
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
    let mediaciones = (await Mediacion.query().where({}).with('userInfo').fetch()).toJSON()
    mediaciones = mediaciones.map(v => {
      return {
        ...v,
        date: moment(v.created_at).format('DD/MM/YYYY')
      }
    })
    response.send(mediaciones);
  }

  async mediacionByUser ({ params, response, auth }) {
    const user = (await auth.getUser()).toJSON()
    let mediaciones = (await Mediacion.query().where({$or: [{user1: user._id}, {user2: user._id}]}).with('userInfo').fetch()).toJSON()
    for (let i = 0; i < mediaciones.length; i++) {
      mediaciones[i].otherInfo = mediaciones[i].user_id === mediaciones[i].user1 ? (await User.find(mediaciones[i].user2)).toJSON() : (await User.find(mediaciones[i].user1)).toJSON(),
      mediaciones[i].date = moment(mediaciones[i].created_at).format('DD/MM/YYYY')
    }
    response.send(mediaciones);
  }

  async mediacionById ({ params, response, auth }) {
    const user = (await auth.getUser()).toJSON()
    let mediacion = (await Mediacion.query().where({_id: params.id}).with('userInfo').first()).toJSON()
    mediacion.otherInfo = mediacion.user_id === mediacion.user1 ? (await User.find(mediacion.user2)).toJSON() : (await User.find(mediacion.user1)).toJSON()
    mediacion.date = moment(mediacion.created_at).format('DD/MM/YYYY')
    let messages = (await Messages.query().where({ chat_id: mediacion._id}).with('userInfo').fetch()).toJSON()
    mediacion.messages = messages.map(v => {
        return {
          ...v,
          send: v.user_id === user._id ? true : false,
          stamp: moment(v.created_at).lang('es').calendar(),
          full_name: v.userInfo.roles[0] === 1 ? v.userInfo.full_name : v.userInfo.name + ' ' + (v.userInfo.last_name ? v.userInfo.last_name : '')
        }
      })
    response.send(mediacion);
  }

  /**
   * Render a form to be used for creating a new mediacion.
   * GET mediacions/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
  }

  async message ({ request, response, auth, params }) {
    const user = (await auth.getUser()).toJSON()
    let data = request.all()
    let message = {
      text: data.message,
      user_id: user._id,
      chat_id: params.id
    }
    const newMessage = await Messages.create(message)
    response.send(message)
  }

  /**
   * Create/save a new mediacion.
   * POST mediacions
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth }) {
    const user = (await auth.getUser()).toJSON()
    let dat = request.only(['dat'])
    dat = JSON.parse(dat.dat)
    let images = []
    if (dat.cantidadFiles > 0) {
      for (let i = 0; i < dat.cantidadFiles; i++) {
        let codeFile = randomize('Aa0', 30)
        const profilePic1 = request.file('files' + i, {
          types: ['image']
        })
        if (Helpers.appRoot('storage/uploads/mediacion')) {
          await profilePic1.move(Helpers.appRoot('storage/uploads/mediacion'), {
            name: codeFile,
            overwrite: true
          })
        } else {
          mkdirp.sync(`${__dirname}/storage/Excel`)
        }
        if (!profilePic1.moved()) {
          return profilePic1.error()
        } else {
          images.push(codeFile)
        }
      }
    }
    delete dat.cantidadFiles
    dat.images = images
    dat.user_id = user._id
    const mediacion = await Mediacion.create(dat)

    let mail = await Email.sendMail('moderador.magicday@gmail.com', 'Han solicitado mediación', `
          <center>
            <img src="https://app.magicday.eiche.cl/logoMagic.png" alt="logo" />
          </center>
          <h2 style="text-align:center">
            ${user.name} ${user.last_name} se ha solicitado una mediación
          </h2>
          `)
    response.send(mediacion)
  }

  /**
   * Display a single mediacion.
   * GET mediacions/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing mediacion.
   * GET mediacions/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update mediacion details.
   * PUT or PATCH mediacions/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    var dat = request.all()
    let modificar = await Mediacion.query().where('_id', params.id).update(dat)
    let mediacion = (await Mediacion.query().where('_id', params.id).with('user1Info').with('user2Info').first()).toJSON()
    // Crear notificacion
    if (dat.status === 2) {
      const notif1 = {
        visto: false,
        user_id: mediacion.user1,
        perfil: mediacion.user2,
        title: 'Inició la mediación',
        message: `La mediación con ${mediacion.user2Info.name} ${mediacion.user2Info.last_name} ha iniciado`,
        ruta: `/chat_mediacion/${mediacion._id}`
      }
      await Notification.create(notif1)
      const notif2 = {
        visto: false,
        user_id: mediacion.user2,
        perfil: mediacion.user1,
        title: 'Inició la mediación',
        message: `La mediación con ${mediacion.user1Info.name} ${mediacion.user1Info.last_name} ha iniciado`,
        ruta: `/chat_mediacion/${mediacion._id}`
      }
      await Notification.create(notif2)

      Notifications.sendSystemNotification({userId: mediacion.user1, title: 'Inició la mediación! 😎', message: `La mediación con ${mediacion.user2Info.name} ${mediacion.user2Info.last_name} ha iniciado` })
      Notifications.sendSystemNotification({userId: mediacion.user2, title: 'Inició la mediación! 😎', message: `La mediación con ${mediacion.user1Info.name} ${mediacion.user1Info.last_name} ha iniciado` })
    } else if (dat.status === 3) {
      const notif1 = {
        visto: false,
        user_id: mediacion.user1,
        perfil: mediacion.user2,
        title: 'Finalizó la mediación',
        message: `La mediación con ${mediacion.user2Info.name} ${mediacion.user2Info.last_name} ha finalizado`,
        ruta: `/chat_mediacion/${mediacion._id}`
      }
      await Notification.create(notif1)
      const notif2 = {
        visto: false,
        user_id: mediacion.user2,
        perfil: mediacion.user1,
        title: 'Finalizó la mediación',
        message: `La mediación con ${mediacion.user1Info.name} ${mediacion.user1Info.last_name} ha finalizado`,
        ruta: `/chat_mediacion/${mediacion._id}`
      }
      await Notification.create(notif2)

      Notifications.sendSystemNotification({userId: mediacion.user1, title: 'Finalizó la mediación! 😎', message: `La mediación con ${mediacion.user2Info.name} ${mediacion.user2Info.last_name} ha finalizado` })
      Notifications.sendSystemNotification({userId: mediacion.user2, title: 'Finalizó la mediación! 😎', message: `La mediación con ${mediacion.user1Info.name} ${mediacion.user1Info.last_name} ha finalizado` })
    }
    response.send(modificar)
  }

  /**
   * Delete a mediacion with id.
   * DELETE mediacions/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = MediacionController
