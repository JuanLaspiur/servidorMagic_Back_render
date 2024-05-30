"use strict";
const Helpers = use("Helpers");
const mkdirp = use("mkdirp");
const Quedada = use("App/Models/Quedada");
const User = use("App/Models/User");
const City = use("App/Models/City");
const Community = use("App/Models/Community");
const Chats = use("App/Models/Chat");
const Rating = use("App/Models/Rating");
const Animales = use("App/Models/Animale");
const Notification = use("App/Models/Notification");
const Notifications = use("App/Functions/Notifications/Notification");
const moment = require("moment");
moment.locale("es");
var randomize = require("randomatic");

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with Quedada
 */
class QuedadaController {
  /**
   * Show a list of all Quedada.
   * GET Quedada
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ params, request, response, view }) {
    try {
      let quedadas = (
        await Quedada.query().where({ user_id: params.id }).fetch()
      ).toJSON();
      for (let i of quedadas) {
        if (moment(i.date) < moment() && i.status < 2 && i.status !== 3) {
          i.status = 2;
          await Quedada.query().where("_id", i._id).update({ status: 2 });
          // Crear notificacion
          let exist = await Notification.query()
            .where({
              quedada: i._id.toString(),
              user_id: i.user_id,
              title: "Finalizó tu quedada",
            })
            .first();
          if (!exist) {
            const notif = {
              visto: false,
              user_id: i.user_id,
              quedada: i._id.toString(),
              title: "Finalizó tu quedada",
              message: `${i.name} ha finalizado`,
              ruta: `/muro_usuario`,
            };
            await Notification.create(notif);
            Notifications.sendSystemNotification({
              userId: i.user_id,
              title: "Finalizó tu quedada!",
              message: `${i.name} ha finalizado`,
            });
          }
        }
        i.userInfo = (await User.find(i.user_id)).toJSON();
        i.animal_img = (await Animales.find(i.userInfo.animal)).img;
      }
      quedadas = quedadas.sort((a, b) => {
        return moment(a.date) > moment(b.date);
      });
      quedadas = quedadas.filter((quedada) => quedada.status !== 3);
      response.send(quedadas);
    } catch (error) {
      console.error("index Quedada: " + error.name + ": " + error.message);
    }
  }

  async quedadaById({ params, request, response, view }) {
    try {
      let data = await Quedada.find(params.id);
      response.send(data);
    } catch (error) {
      console.error("Quedada by id: " + error.name + ": " + error.message);
    }
  }
  //obtener informacion de la quedada.
  async quedadaInfo({ params, request, response, view }) {
    try {
      let data = await Quedada.find(params.id);
      data.userInfo = (await User.find(data.user_id)).toJSON();
      data.userInfo.city_name = (await City.findBy(data.userInfo.city)).name;
      if (data.userInfo.community_name) {
        data.userInfo.community_name = (
          await Community.findBy(data.userInfo.community)
        ).name;
      }
      data.chat_id = (await Chats.findBy("evento_id", data._id))._id;
      for (let i = 0; i < data.asistentes.length; i++) {
        data.asistentes[i].userInfo = (
          await User.find(data.asistentes[i].user_id)
        ).toJSON();
        data.asistentes[i].userInfo.age = moment().diff(
          moment(data.asistentes[i].userInfo.birthdate),
          "years"
        );
        if (data.asistentes[i].rating_id !== null) {
          data.asistentes[i].ratingInfo = (
            await Rating.find(data.asistentes[i].rating_id)
          ).toJSON();
        }
      }
      response.send(data);
    } catch (error) {
      console.error("Quedada by id: " + error.name + ": " + error.message);
    }
  }

  async allQuedadas({ auth, request, response, view }) {
    try {
      const user = (await auth.getUser()).toJSON();
      let quedadas = (await Quedada.query().fetch()).toJSON();
      let filtradas = [];

      for (let i = 0; i < quedadas.length; i++) {
        let propio = await User.find(quedadas[i].user_id);

        // Verificar si el usuario propietario de la quedada existe
        if (!propio) {
          // El usuario propietario no existe, pasar a la siguiente quedada
          continue;
        }

        propio = propio.toJSON();

        // Actualizar el estado de las quedadas que ya han pasado y cuyo estado es menor que 2
        if (moment(quedadas[i].date) < moment() && quedadas[i].status < 2) {
          quedadas[i].status = 2;
          await Quedada.query()
            .where("_id", quedadas[i]._id)
            .update({ status: 2 });

          // Crear una notificación si aún no existe
          let exist = await Notification.query()
            .where({
              quedada: quedadas[i]._id.toString(),
              user_id: quedadas[i].user_id,
              title: "Finalizó tu quedada",
            })
            .first();

          if (!exist) {
            const notif = {
              visto: false,
              user_id: quedadas[i].user_id,
              quedada: quedadas[i]._id.toString(),
              title: "Finalizó tu quedada",
              message: `${quedadas[i].name} ha finalizado`,
              ruta: `/muro_usuario`,
            };
            await Notification.create(notif);
            Notifications.sendSystemNotification({
              userId: quedadas[i].user_id,
              title: "Finalizó tu quedada!",
              message: `${quedadas[i].name} ha finalizado`,
            });
          }
        }

        // Filtrar quedadas según la ciudad del usuario y otros criterios
        if (
          propio.city === user.city &&
          quedadas[i].asistentes.length < quedadas[i].limit &&
          quedadas[i].status < 2
        ) {
          quedadas[i].userInfo = propio;
          quedadas[i].animal_img = (
            await Animales.find(quedadas[i].userInfo.animal)
          ).img;
          quedadas[i].userInfo.city_name = (
            await City.findBy(propio.city)
          ).name;
          filtradas.push(quedadas[i]);
        }
      }

      // Ordenar quedadas filtradas por fecha
      filtradas = filtradas.sort((a, b) => {
        return moment(a.date, "YYYY/MM/DD HH:mm").isAfter(
          moment(b.date, "YYYY/MM/DD HH:mm")
        )
          ? 1
          : -1;
      });

      // Filtrar quedadas públicas o pertenecientes al usuario autenticado
      const allQuedadasForUser = filtradas.filter(
        (el) =>
          el.privacy === "Público" ||
          el.user_id === user._id ||
          el.asistentes.find((el) => el.user_id === user._id)
      );

      // Enviar las quedadas filtradas como respuesta
      response.send(allQuedadasForUser);
    } catch (error) {
      // Manejar errores
      console.error("index Quedada: " + error.name + ": " + error.message);
      response
        .status(500)
        .send({ error: "Ha ocurrido un error al obtener las quedadas." });
    }
  }

  async allQuedadasPremium({ auth, request, response, view }) {
    console.log('entre ')
    try {
      const user = (await auth.getUser()).toJSON();
      console.log("depure user:", JSON.stringify(user));

      let quedadas = (
        await Quedada.query().where({ privacy: "Premium" }).fetch()
      ).toJSON();

      let filtradas = [];

      for (let i = 0; i < quedadas.length; i++) {
        let propio = await User.find(quedadas[i].user_id);
        if (!propio) {
          continue;
        }
        propio = propio.toJSON();

        if (
          moment(quedadas[i].date, "YYYY-MM-DD").isBefore(moment()) &&
          quedadas[i].status < 2
        ) {
          quedadas[i].status = 2;
          await Quedada.query()
            .where("_id", quedadas[i]._id)
            .update({ status: 2 });

          let exist = await Notification.query()
            .where({
              quedada: quedadas[i]._id.toString(),
              user_id: quedadas[i].user_id,
              title: "Finalizó tu quedada",
            })
            .first();

          if (!exist) {
            const notif = {
              visto: false,
              user_id: quedadas[i].user_id,
              quedada: quedadas[i]._id.toString(),
              title: "Finalizó tu quedada",
              message: `${quedadas[i].name} ha finalizado`,
              ruta: `/muro_usuario`,
            };
            await Notification.create(notif);
            Notifications.sendSystemNotification({
              userId: quedadas[i].user_id,
              title: "Finalizó tu quedada!",
              message: `${quedadas[i].name} ha finalizado`,
            });
          }
        }

        if (
          propio.city === user.city &&
          quedadas[i].asistentes.length < quedadas[i].limit &&
          quedadas[i].status < 2
        ) {
          quedadas[i].userInfo = propio;
          quedadas[i].animal_img = (
            await Animales.find(quedadas[i].userInfo.animal)
          ).img;
          quedadas[i].userInfo.city_name = (
            await City.findBy(propio.city)
          ).name;
          filtradas.push(quedadas[i]);
        }
      }

      filtradas = filtradas.sort((a, b) => {
        return moment(a.date, "YYYY-MM-DD HH:mm").isAfter(
          moment(b.date, "YYYY-MM-DD HH:mm")
        )
          ? 1
          : -1;
      });

      response.send(filtradas);
    } catch (error) {
      // Manejar errores
      console.error("index Quedada: " + error.name + ": " + error.message);
      response
        .status(500)
        .send({ error: "Ha ocurrido un error al obtener las quedadas." });
    }
  }
  async solicitarPremium({ auth, params, response}) {
    console.log('Entre al metodo ')
    try {
      const user = await auth.getUser();
      const quedada = await Quedada.find(params.id);
      let send;
      if (!quedada) {
        send = { send: 3 }; // Enviar un objeto con el campo send
        console.log('depure_: Enviando No hay queda {send:3}')
        return response.send(send);
      }
  
      if (!quedada.solicitudesDeParticipacion) {
        quedada.solicitudesDeParticipacion = [];
      }
      const userIdString = user._id.toString();
      // Verificar si el usuario ya ha enviado una solicitud
      for (let i = 0; i < quedada.solicitudesDeParticipacion.length; i++) {
        const solicitud = quedada.solicitudesDeParticipacion[i];
        if (solicitud === userIdString) {
          console.log('depure_: Enviando ya ha enviado la solicitud {send:2}')
          send = { send: 2 }; // Enviar un objeto con el campo send
          return response.send(send);
        }
      }
      quedada.solicitudesDeParticipacion.push(userIdString);
      await quedada.save();
      send = { send: 1 }; // Enviar un objeto con el campo send
      console.log('depure_: Enviando la solicitud {send:1}')
      response.send(send);
    } catch (error) {

      console.error("solicitarPremium: " + error.name + ": " + error.message);
      const send = { send: 0 }; // Enviar un objeto con el campo send
      response.send(send);
    }
  }
  
  

  async getSolicitudesParticipacion({ params, response }) {
    try {
      // Obtener la quedada específica por su ID
      const quedada = await Quedada.find(params.id);
      // Verificar si la quedada existe
      if (!quedada) {
        return response.status(404).send({ message: "Quedada not found" });
      }
      // Verificar si hay solicitudes de participación para esta quedada
      if (
        !quedada.solicitudesDeParticipacion ||
        quedada.solicitudesDeParticipacion.length === 0
      ) {
        return response.send({
          message: "No hay solicitudes de participación para esta quedada.",
        });
      }
      // Obtener la información completa de los usuarios que han enviado las solicitudes
      const usuarios = await User.query()
        .whereIn("_id", quedada.solicitudesDeParticipacion)
        .fetch();
      response.send({ usuarios: usuarios.toJSON() });
    } catch (error) {
      console.error("Error al obtener solicitudes de participación:", error);
      response.status(500).send({
        error:
          "Ha ocurrido un error al obtener las solicitudes de participación.",
      });
    }
  }

  async gestionarSolicitudParticipacion({ request, params, response }) {
    try {
      const { status, user_id } = request.body;
      const userId = user_id;
  
      // Obtener la quedada específica por su ID
      const quedada = await Quedada.find(params.id);
  
      // Verificar si la quedada existe
      if (!quedada) {
        return response.status(404).send({ message: "Quedada not found" });
      }
  
      // Verificar si el usuario ha enviado una solicitud de participación
      if (!quedada.solicitudesDeParticipacion.includes(userId)) {
        return response.status(400).send({ message: "No hay solicitud de participación para este usuario en esta quedada" });
      }
  
      // Si se aprueba la solicitud
      if (status === true) {
        quedada.asistentes.push({
          user_id: userId,
          asistencia: false,
          rating_id: null
        });
      }
  
      // Eliminar el ID del usuario de la lista de solicitudes de participación
      quedada.solicitudesDeParticipacion = quedada.solicitudesDeParticipacion.filter(id => id !== userId);
  
      await quedada.save();
  
      response.send({ message: "Solicitud de participación gestionada exitosamente" });
    } catch (error) {
      console.error('Error al gestionar solicitud de participación:', error);
      response.status(500).send({ error: 'Ha ocurrido un error al gestionar la solicitud de participación.' });
    }
  }
  

  async allQuedadasAdmin({ auth, request, response, view }) {
    try {
      const user = (await auth.getUser()).toJSON();
      if (user.roles[0] === 1 || user.roles[0] === 3) {
        let quedadas = (
          await Quedada.query().where({ privacy: "Público" }).fetch()
        ).toJSON();
        response.send(quedadas);
      } else {
        response.send({ success: false, message: "no auth" });
      }
    } catch (error) {
      console.error("index Quedada: " + error.name + ": " + error.message);
    }
  }
  async filtrarQuedadas({ auth, request, response, view }) {
    try {
      const user = (await auth.getUser()).toJSON();
      let data = request.all();
      let quedadas = (
        await Quedada.query().where({ privacy: "Público" }).fetch()
      ).toJSON();
      let filtradas = [];
      for (let i = 0; i < quedadas.length; i++) {
        let propio = (await User.find(quedadas[i].user_id)).toJSON();
        if (
          propio.city === user.city &&
          quedadas[i].asistentes.length < quedadas[i].limit &&
          quedadas[i].status < 2
        ) {
          quedadas[i].userInfo = propio;
          quedadas[i].animal_img = (
            await Animales.find(quedadas[i].userInfo.animal)
          ).img;
          quedadas[i].userInfo.city_name = (
            await City.findBy(propio.city)
          ).name;
          for (let j = 0; j < quedadas[i].asistentes.length; j++) {
            quedadas[i].asistentes[j].userInfo = (
              await User.find(quedadas[i].asistentes[j].user_id)
            ).toJSON();
            quedadas[i].asistentes[j].userInfo.age = moment().diff(
              moment(quedadas[i].asistentes[j].userInfo.birthdate),
              "years"
            );
          }
          filtradas.push(quedadas[i]);
        }
      }
      if (data.zone || data.maximo || data.minimo || data.categorias.length) {
        filtradas = filtradas.filter((v) => {
          let zone = data.zone ? (v.zone === data.zone ? true : false) : true;
          let maximo = data.maximo
            ? v.asistentes.find(
                (x) => Number(x.userInfo.age) <= Number(data.maximo)
              )
              ? true
              : false
            : true;
          let minimo = data.minimo
            ? v.asistentes.find(
                (x) => Number(x.userInfo.age) >= Number(data.minimo)
              )
              ? true
              : false
            : true;
          let categorias = data.categorias.length
            ? data.categorias.find((x) => x._id === v.category)
              ? true
              : false
            : true;
          if (zone && maximo && minimo && categorias) {
            return v;
          } else {
            return false;
          }
        });
      }
      filtradas = filtradas.sort((a, b) => {
        return moment(a.date) > moment(b.date);
      });
      response.send(filtradas);
    } catch (error) {
      console.error("index Quedada: " + error.name + ": " + error.message);
    }
  }

  async solicitudes({ auth, request, response, view }) {
    try {
      const user = (await auth.getUser()).toJSON();
      let quedadas = (
        await Quedada.query().where({ privacy: "Privado" }).fetch()
      ).toJSON();
      let filtradas = [];
      for (let i = 0; i < quedadas.length; i++) {
        if (moment(quedadas[i].date) < moment() && quedadas[i].status < 2) {
          quedadas[i].status = 2;
          await Quedada.query()
            .where("_id", quedadas[i]._id)
            .update({ status: 2 });
          // Crear notificacion
          let exist = await Notification.query()
            .where({
              quedada: quedadas[i]._id.toString(),
              user_id: quedadas[i].user_id,
              title: "Finalizó tu quedada",
            })
            .first();
          if (!exist) {
            const notif = {
              visto: false,
              user_id: quedadas[i].user_id,
              quedada: quedadas[i]._id.toString(),
              title: "Finalizó tu quedada",
              message: `${quedadas[i].name} ha finalizado`,
              ruta: `/muro_usuario`,
            };
            await Notification.create(notif);
            Notifications.sendSystemNotification({
              userId: quedadas[i].user_id,
              title: "Finalizó tu quedada!",
              message: `${quedadas[i].name} ha finalizado`,
            });
          }
        }
        if (
          quedadas[i].asistentes.find(
            (v) => v.user_id === user._id && !v.asistencia
          ) &&
          quedadas[i].status < 2
        ) {
          quedadas[i].userInfo = (
            await User.find(quedadas[i].user_id)
          ).toJSON();
          quedadas[i].animal_img = (
            await Animales.find(quedadas[i].userInfo.animal)
          ).img;
          filtradas.push(quedadas[i]);
        }
      }
      filtradas = filtradas.sort((a, b) => {
        return moment(a.date) > moment(b.date);
      });
      response.send(filtradas);
    } catch (error) {
      console.error("index Quedada: " + error.name + ": " + error.message);
    }
  }

  async allAsistidos({ params, request, response, view }) {
    try {
      const user = params.id;
      let quedadas = (await Quedada.query().where({}).fetch()).toJSON();
      let filtradas = [];
      for (let i = 0; i < quedadas.length; i++) {
        if (moment(quedadas[i].date) < moment() && quedadas[i].status < 2) {
          quedadas[i].status = 2;
          await Quedada.query()
            .where("_id", quedadas[i]._id)
            .update({ status: 2 });
          // Crear notificacion
          let exist = await Notification.query()
            .where({
              quedada: quedadas[i]._id.toString(),
              user_id: quedadas[i].user_id,
              title: "Finalizó tu quedada",
            })
            .first();
          if (!exist) {
            const notif = {
              visto: false,
              user_id: quedadas[i].user_id,
              quedada: quedadas[i]._id.toString(),
              title: "Finalizó tu quedada",
              message: `${quedadas[i].name} ha finalizado`,
              ruta: `/muro_usuario`,
            };
            await Notification.create(notif);
            Notifications.sendSystemNotification({
              userId: quedadas[i].user_id,
              title: "Finalizó tu quedada!",
              message: `${quedadas[i].name} ha finalizado`,
            });
          }
        }
        if (
          quedadas[i].asistentes.find((v) => v.user_id === user && v.asistencia)
        ) {
          quedadas[i].userInfo = (
            await User.find(quedadas[i].user_id)
          ).toJSON();
          quedadas[i].animal_img = (
            await Animales.find(quedadas[i].userInfo.animal)
          ).img;
          filtradas.push(quedadas[i]);
        }
      }
      filtradas = filtradas.sort((a, b) => {
        return moment(a.date) > moment(b.date);
      });
      response.send(filtradas);
    } catch (error) {
      console.error(
        "console error quedadas premium : " + error.name + ": " + error.message
      );
    }
  }

  async eventosAsistidos({ params, request, response, view }) {
    try {
      const user = params.id;
      let quedadas = (await Quedada.query().where({}).fetch()).toJSON();
      let filtradas = [];
      for (let i = 0; i < quedadas.length; i++) {
        if (
          moment(quedadas[i].date) < moment() &&
          quedadas[i].status < 2 &&
          quedadas[i].status !== 3
        ) {
          quedadas[i].status = 2;
          await Quedada.query()
            .where("_id", quedadas[i]._id)
            .update({ status: 2 });
          // Crear notificacion
          let exist = await Notification.query()
            .where({
              quedada: quedadas[i]._id.toString(),
              user_id: quedadas[i].user_id,
              title: "Finalizó tu quedada",
            })
            .first();
          if (!exist) {
            const notif = {
              visto: false,
              user_id: quedadas[i].user_id,
              quedada: quedadas[i]._id.toString(),
              title: "Finalizó tu quedada",
              message: `${quedadas[i].name} ha finalizado`,
              ruta: `/muro_usuario`,
            };
            await Notification.create(notif);
            Notifications.sendSystemNotification({
              userId: quedadas[i].user_id,
              title: "Finalizó tu quedada!",
              message: `${quedadas[i].name} ha finalizado`,
            });
          }
        }
        if (
          quedadas[i].status === 2 &&
          quedadas[i].asistentes.find((v) => v.user_id === user && v.asistencia)
        ) {
          quedadas[i].userInfo = (
            await User.find(quedadas[i].user_id)
          ).toJSON();
          quedadas[i].animal_img = (
            await Animales.find(quedadas[i].userInfo.animal)
          ).img;
          filtradas.push(quedadas[i]);
        }
      }
      filtradas = filtradas.sort((a, b) => {
        return moment(a.date) > moment(b.date);
      });

      const participoUser = await User.query()
        .where({ _id: user })
        .update({ participo: filtradas.length });

      response.send(filtradas);
    } catch (error) {
      console.error("eventros asistidos: " + error.name + ": " + error.message);
    }
  }

  async eventosActivos({ params, request, response, view }) {
    try {
      const user = params.id;
      let quedadas = (await Quedada.query().where({}).fetch()).toJSON();
      let filtradas = [];
      for (let i = 0; i < quedadas.length; i++) {
        if (moment(quedadas[i].date) < moment() && quedadas[i].status < 2) {
          quedadas[i].status = 2;
          await Quedada.query()
            .where("_id", quedadas[i]._id)
            .update({ status: 2 });
          // Crear notificacion
          let exist = await Notification.query()
            .where({
              quedada: quedadas[i]._id.toString(),
              user_id: quedadas[i].user_id,
              title: "Finalizó tu quedada",
            })
            .first();
          if (!exist) {
            const notif = {
              visto: false,
              user_id: quedadas[i].user_id,
              quedada: quedadas[i]._id.toString(),
              title: "Finalizó tu quedada",
              message: `${quedadas[i].name} ha finalizado`,
              ruta: `/muro_usuario`,
            };
            await Notification.create(notif);
            Notifications.sendSystemNotification({
              userId: quedadas[i].user_id,
              title: "Finalizó tu quedada!",
              message: `${quedadas[i].name} ha finalizado`,
            });
          }
        }
        if (
          quedadas[i].status < 2 &&
          (quedadas[i].user_id === user ||
            quedadas[i].asistentes.find(
              (v) => v.user_id === user && v.asistencia
            ))
        ) {
          quedadas[i].userInfo = (
            await User.find(quedadas[i].user_id)
          ).toJSON();
          quedadas[i].animal_img = (
            await Animales.find(quedadas[i].userInfo.animal)
          ).img;
          filtradas.push(quedadas[i]);
        }
      }
      filtradas = filtradas.sort((a, b) => {
        return moment(a.date) > moment(b.date);
      });
      response.send(filtradas);
    } catch (error) {
      console.error("eventros activos: " + error.name + ": " + error.message);
    }
  }

  /**
   * Render a form to be used for creating a new Quedada.
   * GET Quedada/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {}

  /**
   * Create/save a new Quedada.
   * POST Quedada
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, auth }) {
    let dat = request.only(["dat"]);
    dat = JSON.parse(dat.dat);
    if (moment().isAfter(dat.dateTime)) {
      response.unprocessableEntity([
        {
          message:
            "Fecha invalida (debe ingresar una fecha posterior a la actual)",
        },
      ]);
    } else {
      let body = dat;
      body.status = 0;
      const quedada = await Quedada.create(body);
      const userCreador = await User.query()
        .where({ _id: body.user_id })
        .first();
      const { creados } = userCreador;

      if (creados) {
        const { participo } = userCreador;
        const userCambiado = await User.query()
          .where({ _id: body.user_id })
          .update({ creados: creados + 1 });
      } else {
        const userCambiado = await User.query()
          .where({ _id: body.user_id })
          .update({ creados: 1 });
      }

      let chat = {
        evento_id: quedada._id,
        user_id: quedada.user_id,
        privado: false,
        activo: true,
      };
      const newChat = await Chats.create(chat);

      // Crear notificacion
      if (quedada.privacy === "Público") {
        const user = (await auth.getUser()).toJSON();
        let users = (
          await User.query()
            .where({ community: user.community, zone: quedada.zone })
            .fetch()
        ).toJSON();
        users = users.filter((v) => v._id !== user._id);
        for (let i = 0; i < users.length; i++) {
          const notif = {
            visto: false,
            user_id: users[i]._id,
            quedada: quedada._id.toString(),
            title: "Nueva quedada en tu zona",
            message: `Hay una nueva quedada en tu zona de residencia`,
            ruta: `/muro_usuario/${user._id}`,
          };
          await Notification.create(notif);
          Notifications.sendSystemNotification({
            userId: users[i]._id,
            title: "Nueva quedada en tu zona! 😎",
            message: `Hay una nueva quedada en tu zona de residencia`,
          });
        }
      }

      const profilePic = request.file("file", {
        types: ["image"],
      });
      if (Helpers.appRoot("storage/uploads/quedada")) {
        await profilePic.move(Helpers.appRoot("storage/uploads/quedada"), {
          name: quedada._id.toString(),
          overwrite: true,
        });
      } else {
        mkdirp.sync(`${__dirname}/storage/Excel`);
      }
      response.send(quedada);
    }
  }

  async invitarUser({ params, request, response }) {
    let data = request.all();
    let quedada = await Quedada.find(params.id);
    let user = await User.findBy("_id", quedada.user_id);
    if (data.invitar) {
      quedada.asistentes.push(data.invitado);
    } else {
      var index = quedada.asistentes.indexOf(data.invitado);
      quedada.asistentes.splice(index, 1);
    }
    quedada.save();
    const notif = {
      visto: false,
      user_id: data.invitado.user_id,
      quedada: quedada._id.toString(),
      title: "Te han invitado a una quedada",
      message: `Haz sido invitado a la quedada de ${user.name} ${user.last_name}`,
      ruta: `/solicitudes`,
    };
    await Notification.create(notif);
    Notifications.sendSystemNotification({
      userId: data.invitado.user_id,
      title: "Te han invitado a una quedada! 😎",
      message: `Haz sido invitado a la quedada de ${user.name} ${user.last_name}`,
    });
    response.send(quedada.asistentes);
  }

  /**
   * Display a single Quedada.
   * GET Quedada/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Render a form to update an existing Quedada.
   * GET Quedada/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, auth }) {
    var dat = request.all();
    let modificar = await Quedada.query().where("_id", params.id).update(dat);
    let privado = await Quedada.query().where("_id", params.id).first();
    if (dat.status === 3) {
      const userCreador = await User.query()
        .where({ _id: privado.user_id })
        .first();
      const { creados } = userCreador;

      if (creados) {
        const userCambiado = await User.query()
          .where({ _id: privado.user_id })
          .update({ creados: creados - 1 });
      }

      for (let i = 0; i < privado.asistentes.length; i++) {
        const userAsistente = await User.query()
          .where({ _id: privado.asistentes[i].user_id })
          .first();
      }
    }
    if (privado.privacy === "Privado") {
      const user = (await auth.getUser()).toJSON();
      // Crear notificacion
      for (let i = 0; i < privado.asistentes.length; i++) {
        const element = privado.asistentes[i];
        let exist = await Notification.query()
          .where({
            quedada: privado._id.toString(),
            user_id: element.user_id,
            title: "Te han invitado a una quedada",
          })
          .first();
        if (!exist) {
          const notif = {
            visto: false,
            user_id: element.user_id,
            quedada: privado._id.toString(),
            title: "Te han invitado a una quedada",
            message: `Haz sido invitado a la quedada de ${user.name} ${user.last_name}`,
            ruta: `/muro_usuario/${user._id}`,
          };
          await Notification.create(notif);
          Notifications.sendSystemNotification({
            userId: element.user_id,
            title: "Te han invitado a una quedada! 😎",
            message: `Haz sido invitado a la quedada de ${user.name} ${user.last_name}`,
          });
        }
      }
    }
    response.send(modificar);
  }

  async asistir({ params, request, response, auth }) {
    const user = (await auth.getUser()).toJSON();
    let data = request.all();
    let quedada = await Quedada.find(params.id);
    // let userCreatorOfQuedada = await User.findBy('_id', quedada.user_id)
    if (quedada.asistentes.find((v) => v.user_id === user._id)) {
      for (let i = 0; i < quedada.asistentes.length; i++) {
        if (quedada.asistentes[i].user_id === user._id) {
          if (quedada.privacy === "Público") {
            quedada.asistentes = quedada.asistentes.filter(
              (v) => v.user_id !== user._id
            );
          } else {
            quedada.asistentes[i].asistencia = data.asistencia;
          }
        }
      }
    } else {
      quedada.asistentes.push({
        user_id: user._id,
        asistencia: data.asistencia,
        rating_id: null,
      });
      const userCreador = await User.query().where({ _id: user._id }).first();
      const { participo } = userCreador;

      if (participo) {
        const { creados } = userCreador;
        if (creados === 10 && participo + 1 === 5) {
          const notificacion = {
            visto: false,
            user_id: userCreador._id,
            title: "¡Desbloqueaste una nueva medalla!",
            message: "La medalla de bronce te pertenece 😎, revisa tu muro.",
            ruta: `/muro_usuario/${userCreador._id}`,
          };
          await Notification.create(notificacion);
          Notifications.sendSystemNotification({
            userId: userCreador._id,
            title: "¡Desbloqueaste una nueva medalla",
            message: "Tu medalla te espera 😎",
          });
        }
      }
    }
    if (quedada.asistentes.filter((v) => v.asistencia).length) {
      quedada.status = 1;
    } else {
      quedada.status = 0;
    }
    quedada.save();
    // const notificacion = {
    //   visto: false,
    //   user_id: userCreatorOfQuedada._id,
    //   title: `¡${user.name} ${user.last_name} asistirá a tu quedada! 😎 `,
    //   message: '',
    //   ruta: `/muro_usuario/${userCreatorOfQuedada._id}`
    // }
    // await Notification.create(notificacion)
    // Notifications.sendSystemNotification({userId: userCreatorOfQuedada._id, title: '¡Desbloqueaste una nueva medalla', message: 'Tu medalla te espera 😎'})
    response.send(quedada.asistentes);
  }

  async reportar({ params, request, response, auth }) {
    let body = request.body;
    let quedada = await Quedada.find(params.id);
    if (quedada.reportes) {
      quedada.reportes.push(body);
    } else {
      quedada.reportes = [];
      quedada.reportes.push(body);
    }
    quedada.save();
    response.send(quedada.asistentes);
  }

  /**
   * Update Quedada details.
   * PUT or PATCH Quedada/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  async updateImg({ request, response, params }) {
    var profilePic = request.file("files", {
      types: ["image"],
      size: "25mb",
    });
    if (profilePic) {
      if (Helpers.appRoot("storage/uploads/quedada")) {
        await profilePic.move(Helpers.appRoot("storage/uploads/quedada"), {
          name: params.id.toString(),
          overwrite: true,
        });
      } else {
        mkdirp.sync(`${__dirname}/storage/Excel`);
      }

      if (!profilePic.moved()) {
        return profilePic.error();
      } else {
        response.send(true);
      }
    }
  }

  async addImg({ request, response, params }) {
    let data = await Quedada.find(params.id);
    let codeFile = randomize("Aa0", 30);
    var profilePic = request.file("files", {
      types: ["image"],
      size: "25mb",
    });
    if (profilePic) {
      if (Helpers.appRoot("storage/uploads/quedada")) {
        await profilePic.move(Helpers.appRoot("storage/uploads/quedada"), {
          name: codeFile,
          overwrite: true,
        });
      } else {
        mkdirp.sync(`${__dirname}/storage/Excel`);
      }

      if (!profilePic.moved()) {
        return profilePic.error();
      } else {
        if (data.images) {
          data.images.push(codeFile);
        } else {
          data.images = [codeFile];
        }
        data.save();
        response.send(true);
      }
    }
  }

  /**
   * Restart a Quedada with id.
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */

  async restartQuedada({ params, request, response }) {
    const { id } = params;
    try {
      let quedada = await Quedada.query().where("_id", id).fetch();
      quedada = quedada.first();
      if (!quedada) {
        return response
          .status(404)
          .send({ status: 404, message: "Quedada not Found in Database" });
      }
      if (moment(quedada.date) > moment() && quedada.status === 3) {
        await Quedada.query().where("_id", id).update({ status: 1 });
        return response.status(200).send({ status: 200, message: "Success" });
      }
      return response
        .status(400)
        .send({ status: 400, message: "Cannot Reset Quedada" });
    } catch (error) {
      console.log(error);
      return response
        .status(500)
        .send({ status: 500, message: "Server Error in Quedada" });
    }
  }

  /**
   * Delete a Quedada with id.
   * DELETE Quedada/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = QuedadaController;
