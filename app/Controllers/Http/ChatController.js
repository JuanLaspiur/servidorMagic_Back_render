'use strict'
const Chats = use("App/Models/Chat")
const Messages = use("App/Models/Message")
const User = use("App/Models/User")
const Quedada = use("App/Models/Quedada")
const Notification = use("App/Models/Notification")
const Notifications = use('App/Functions/Notifications/Notification')
const moment = require('moment')
const {v4: UUID} = require('uuid')
const fs = require("fs");
const path = require("path");
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with chats
 */
class ChatController {
  /**
   * Show a list of all chats.
   * GET chats
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, auth }) {
    try {
      const user = (await auth.getUser()).toJSON()
      let allChats = (await Chats.query()
      .where({activo: true})
      .where('user_id', user._id)
      .with('quedadaInfo').fetch()).toJSON()
      let filtrados = []
      for (let i = 0; i < allChats.length; i++) {
        if (allChats[i].user_id  === user._id || allChats[i].otro_id  === user._id || (!allChats[i].privado && allChats[i].quedadaInfo?.asistentes?.find(v => v.user_id === user._id && v.asistencia))) {
          if (allChats[i].privado) {
            if (allChats[i].user_id  === user._id) {
              let otro = (await User.find(allChats[i].otro_id))
              allChats[i].full_name = otro.name + ' ' + (otro.last_name ? otro.last_name : '')
              allChats[i].user_principal = allChats[i].otro_id
            } else {
              let otro = (await User.find(allChats[i].user_id))
              allChats[i].full_name = otro.name + ' ' + (otro.last_name ? otro.last_name : '')
              allChats[i].user_principal = allChats[i].user_id
            }
          } else {
            allChats[i].full_name = allChats[i].quedadaInfo.name
          }
          let messages = (await Messages.query().where({ chat_id: allChats[i]._id}).fetch()).toJSON()
          if (messages.length) {
            messages.sort((a, b) => new Date(a.created_at).getTime() > new Date(b.created_at).getTime())
            messages.reverse()
            allChats[i].last_message = messages[0].text
            allChats[i].date = moment(messages[0].created_at).lang('es').calendar()
          } else {
            allChats[i].last_message = 'No hay mensajes'
            allChats[i].date = moment(allChats[i].created_at).lang('es').calendar()
          }
          filtrados.push(allChats[i])
        }
      }
      filtrados = filtrados.filter(chat=> chat.quedadaInfo === null || chat.quedadaInfo.status !== 3)
      response.send(filtrados)
    } catch (error) {
      console.error('index Chat: ' + error.name + ': ' + error.message);
    }
  }

  async chatById ({ params, request, response, auth }) {
    try {
      const user = (await auth.getUser()).toJSON()
      let data = (await Chats.find(params.id))
      if (!data.privado) {
        data.eventoInfo = (await Quedada.find(data.evento_id)).toJSON()
      } else {
        if (data.user_id  === user._id) {
          data.user_principal = data.otro_id
          let otro = (await User.find(data.otro_id))
          data.full_name = otro.name + ' ' + (otro.last_name ? otro.last_name : '')
        } else {
          data.user_principal = data.user_id
          let otro = (await User.find(data.user_id))
          data.full_name = otro.name + ' ' + (otro.last_name ? otro.last_name : '')
        }
      }
      let messages = (await Messages.query().where({ chat_id: params.id}).with('userInfo').fetch()).toJSON()
      data.messages = messages.map(v => {
        return {
          ...v,
          send: v.user_id === user._id ? true : false,
          stamp: moment(v.created_at).lang('es').calendar(),
          full_name: v.userInfo.name + ' ' + (v.userInfo.last_name ? v.userInfo.last_name : '')
        }
      })
      response.send(data)
    } catch (error) {
      console.error('Chat by id: ' + error.name + ': ' + error.message);
    }
  }

  /**
   * Render a form to be used for creating a new chat.
   * GET chats/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, auth, params }) {
    try {
      const user = (await auth.getUser()).toJSON();
      await Chats.query().where('_id', params.id).update({ activo: true });
  
      let data = request.all();
      let image = request.file("file");
      const fileName = `${UUID()}.${image?.clientName.split(".").pop().toLowerCase()}`;
      let message = {
        text: data.message,
        user_id: user._id,
        chat_id: params.id,
        textAnswer: data.messageForAnswer
      };
  
      if (image) {
        message.image = fileName;
        const storagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "storage",
          "chat_images"
        );
  
        if (!fs.existsSync(storagePath)) {
          fs.mkdirSync(storagePath, { recursive: true });
        }
  
        await image.move("./storage/chat_images", {
          name: fileName,
          overwrite: true,
        });
      }
  
      const newMessage = await Messages.create(message);
  
      // Asociar una encuesta de administrador al chat si es necesario
      const encuestaId = data.encuestaId; // Obtener el ID de la encuesta de alguna manera
      if (encuestaId) {
        const chat = await Chats.find(params.id);
        await chat.encuestaAdmin().associate(encuestaId);
      }
  
      // Resto de la lógica para enviar notificaciones y responder al cliente
    } catch (error) {
      console.error('Error al crear el chat:', error);
      return response.status(500).send({ message: 'Se produjo un error al intentar crear el chat.' });
    }
  }

  /**
   * Create/save a new chat.
   * POST chats
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ params, response, auth }) {
    const user = (await auth.getUser()).toJSON()
    let chatsPriv = (await Chats.query().where({privado: true}).fetch()).toJSON()
    const chatInfo = chatsPriv.find(v => (v.user_id === user._id && v.otro_id === params.user_id) || (v.user_id === params.user_id && v.otro_id === user._id))
    if (chatInfo) {
      response.send(chatInfo)
    } else {
      let chat = {
        otro_id: params.user_id,
        user_id: user._id,
        privado: true,
        locked: false,
        user_locked: '',
        activo: false
      }
      const newChat = await Chats.create(chat)
      response.send(newChat)
    }
  }

  /**
   * Display a single chat.
   * GET chats/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing chat.
   * GET chats/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update chat details.
   * PUT or PATCH chats/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    var dat = request.all()
    let modificar = await Chats.query().where('_id', params.id).update(dat)
    response.send(modificar)
  }

  /**
   * Delete a chat with id.
   * DELETE chats/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = ChatController
