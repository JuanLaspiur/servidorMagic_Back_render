"use strict";

const Helpers = use("Helpers");
const mkdirp = use("mkdirp");
const moment = use("moment");
const User = use("App/Models/User");
const Animales = use("App/Models/Animale");
const Seguidores = use("App/Models/Seguidore");
const Role = use("App/Models/Role");
const City = use("App/Models/City");
const Community = use("App/Models/Community");
const Email = use("App/Functions/Email");
const Quedada = use("App/Models/Quedada");
const Notification = use("App/Models/Notification");
const Notifications = use("App/Functions/Notifications/Notification");
var randomize = require("randomatic");
const ExcelJS = require("exceljs");
const MongoClient = require("mongodb").MongoClient;
const jwtDecode = require("jwt-decode");
const uri = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// const { validate } = use("Validator")

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const generateLoginData = async (auth, email, password) => {
  let token = await auth.attempt(email, password);
  const user = (await User.findBy("email", email)).toJSON();
  let isUser = false;
  token.roles = user.roles.map((roleMap) => {
    if (roleMap === 2) {
      isUser = true;
    }
    return roleMap;
  });
  let userRoles = await Role.whereIn("id", token.roles).fetch();
  let permissions = userRoles.toJSON();
  token.permissions = [];
  permissions.forEach((element) => {
    element.permissions.forEach((element2) => {
      token.permissions.push(element2);
    });
  });

  token.email = user.email;
  token.estatus = user.estatus;
  token.full_name = user.full_name ? user.full_name : null;
  token.last_name = user.last_name;
  token._id = user._id;
  let data = {};
  data.SESSION_INFO = token;
  if (!user.online) {
    User.where("email", email).update({ online: true });
  }
  if (user.quedadasPriv === undefined) {
    User.where("email", email).update({ quedadasPriv: false });
  }
  if (user.premium === undefined) {
    User.where("email", email).update({ premium: false });
  }
  return data;
};

const descargarImagen = async (url, carpetaDestino, nombreArchivo) => {
  try {
    const respuesta = await axios.get(url, {
      responseType: "stream",
    });

    const rutaArchivo = path.join(carpetaDestino, nombreArchivo);

    const escrituraStream = fs.createWriteStream(rutaArchivo);
    respuesta.data.pipe(escrituraStream);

    return new Promise((resolve, reject) => {
      escrituraStream.on("finish", resolve);
      escrituraStream.on("error", reject);
    });
  } catch (error) {
    throw new Error(`Error al descargar la imagen: ${error}`);
  }
};
class UserController {
  async export({ response }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    const client = await MongoClient.connect(uri, { useNewUrlParser: true });
    const db = client.db(process.env.DB_DATABASE);

    const data = await db
      .collection("users")
      .find({ roles: [2] })
      .toArray();

    worksheet.columns = [
      { header: "ID", key: "_id", width: 30 },
      { header: "Correo electrónico", key: "email", width: 30 },
      { header: "Nombre", key: "name", width: 30 },
      { header: "Apellido", key: "last_name", width: 30 },
      { header: "Genero", key: "gender", width: 30 },
      { header: "Fecha de nacimiento", key: "birthdate", width: 30 },
      { header: "Pais", key: "bornCountry", width: 30 },
      { header: "Celular", key: "phone", width: 30 },
      { header: "Cargo", key: "cargo", width: 30 },
      { header: "Descripcion", key: "description", width: 30 },
    ];

    // Agregar los datos a la hoja
    worksheet.addRows(data);

    // Configurar el encabezado de la respuesta
    response.type(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    response.header("Content-Disposition", 'attachment; filename="users.xlsx"');

    // Escribir el archivo en un buffer
    const buffer = await workbook.xlsx.writeBuffer();
    // Devolver el buffer como respuesta
    return buffer;

    // Cerrar la conexión con la base de datos
    client.close();
  }

  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, auth }) {
    const { order, creados, asistidos } = request.all();
    const user = (await auth.getUser()).toJSON();
    if (!order) {
      let users = (
        await User.query()
          .where({ roles: [2] })
          .with("animalInfo")
          .with("ciudad")
          .with("comunidad")
          .fetch()
      ).toJSON();
      response.send(users);
    } else {
      let usersByTime = (
        await User.query()
          .where({ roles: [2] })
          .with("animalInfo")
          .with("ciudad")
          .with("comunidad")
          .orderBy("tiempoWeb", "desc")
          .fetch()
      ).toJSON();
      let quedadas = (await Quedada.query().fetch()).toJSON();
      for (let i = 0; i < usersByTime.length; i++) {
        usersByTime[i].eventosCreados = (
          await Quedada.query().where({ user_id: usersByTime[i]._id }).fetch()
        ).toJSON();
        usersByTime[i].eventosAsistidos = [];
        for (let j = 0; j < quedadas.length; j++) {
          if (
            moment(quedadas[j].date) < moment() &&
            quedadas[j].status < 2 &&
            quedadas[j].status !== 3
          ) {
            quedadas[j].status = 2;
            await Quedada.query()
              .where("_id", quedadas[j]._id)
              .update({ status: 2 });
          }
          if (
            quedadas[j].status === 2 &&
            quedadas[j].asistentes?.find(
              (v) => v?.user_id === usersByTime[i]?._id && v.asistencia
            )
          ) {
            usersByTime[i].eventosAsistidos.push(quedadas[j]);
          }
        }
      }
      let usersByCreate = [...usersByTime].sort(
        (a, b) => b.eventosCreados.length - a.eventosCreados.length
      );
      let usersByAsist = [...usersByTime].sort(
        (a, b) => b.eventosAsistidos.length - a.eventosAsistidos.length
      );
      response.send({ usersByTime, usersByCreate, usersByAsist });
    }
  }

  async all_user_admin({ request, response, auth }) {
    const user = (await auth.getUser()).toJSON();
    let users = (
      await User.query()
        .where("newUser", "<>", true)
        .where({ roles: [2] })
        .with("animalInfo")
        .with("ciudad")
        .with("comunidad")
        .fetch()
    ).toJSON();

    let quedadas = (await Quedada.query().fetch()).toJSON();
    for (let i = 0; i < users.length; i++) {
      users[i].realizados = (
        await Quedada.query().where({ user_id: users[i]._id }).fetch()
      ).toJSON().length;
      users[i].participados = [];
      for (let j = 0; j < quedadas.length; j++) {
        if (
          moment(quedadas[j].date) < moment() &&
          quedadas[j].status < 2 &&
          quedadas[j].status !== 3
        ) {
          quedadas[j].status = 2;
          await Quedada.query()
            .where("_id", quedadas[j]._id)
            .update({ status: 2 });
        }
        if (
          quedadas[j].status === 2 &&
          quedadas[j].asistentes?.find(
            (v) => v?.user_id === users[i]?._id && v.asistencia
          )
        ) {
          users[i].participados.push(quedadas[j]);
        }
      }
      users[i].participados = users[i].participados.length;
    }
    response.send({
      success: true,
      data: users,
    });
  }

  async moderadores({ request, response, auth }) {
    const user = (await auth.getUser()).toJSON();
    let moderadores = (
      await User.query()
        .where({ roles: [3] })
        .with("ciudad")
        .with("comunidad")
        .fetch()
    ).toJSON();
    response.send(moderadores);
  }

  async userEdit({ params, response, auth }) {
    let user = (await User.find(params.id)).toJSON();
    response.send(user);
  }

  async userById({ params, response, auth }) {
    const logueado = (await auth.getUser()).toJSON();
    let user = (await User.find(params.id)).toJSON();
    user.age = moment().diff(moment(user.birthdate), "years");
    user.animal_img = (await Animales.find(user.animal)).img;
    user.ciudad = (
      await City.query().where({ _id: user.city }).fetch()
    ).toJSON()[0].name;
    if (user.comunidad) {
      user.comunidad = (
        await Community.query().where({ _id: user.community }).fetch()
      ).toJSON()[0].name;
    }
    let seguido = await Seguidores.query()
      .where({ seguidor: logueado._id, seguido: user._id })
      .first();
    if (seguido) {
      user.seguido = true;
    } else {
      user.seguido = false;
    }
    response.send(user);
  }

  async userInfo({ request, response, auth }) {
    const user = (await auth.getUser()).toJSON();
    if (user.roles[0] === 2) {
      user.age = moment().diff(moment(user.birthdate), "years");
      user.animal_img = (await Animales.find(user.animal)).img;
      user.ciudad = (
        await City.query().where({ _id: user.city }).fetch()
      ).toJSON()[0].name;
      if (user.comunidad) {
        user.comunidad = (
          await Community.query().where({ _id: user.community }).fetch()
        ).toJSON()[0].name;
      }
      const { participo, creados } = user;

      if (participo && creados) {
        //   if ( (creados < 10 && participo < 5) || (creados >= 10 && participo < 5) || ( participo >= 5 && creados < 10 ) ) {
        //     const exist = (await Notification.query().where({user_id: user._id, moneda: 0}).first())
        //     if (!exist) {
        //       const notificacion = {
        //         visto: false,
        //         user_id: user._id,
        //         title: '¡Desbloqueaste una nueva medalla!',
        //         message: 'La medalla de cobre te pertenece 😎, revisa tu muro.',
        //         moneda: 0,
        //         ruta: `/muro_usuario/${user._id}`
        //       }
        //       await Notification.create(notificacion)
        //       Notifications.sendSystemNotification({userId: user._id, title: '¡Desbloqueaste una nueva medalla', message: 'Tu medalla te espera 😎'})
        //     }
        //   }
        if (
          (creados >= 10 && creados < 25 && participo >= 1 && participo < 10) ||
          (creados >= 25 && participo < 10) ||
          (participo >= 10 && creados < 25)
        ) {
          const exist = await Notification.query()
            .where({ user_id: user._id, moneda: 1 })
            .first();
          if (!exist) {
            const notificacion = {
              visto: false,
              user_id: user._id,
              title: "¡Desbloqueaste una nueva medalla!",
              message: "La medalla de bronce te pertenece 😎, revisa tu muro.",
              moneda: 1,
              ruta: `/muro_usuario/${user._id}`,
            };
            await Notification.create(notificacion);
            Notifications.sendSystemNotification({
              userId: user._id,
              title: "¡Desbloqueaste una nueva medalla",
              message: "Tu medalla te espera 😎",
            });
          }
        }
        if (
          (creados >= 25 &&
            creados < 50 &&
            participo >= 10 &&
            participo < 20) ||
          (creados >= 50 && participo < 20) ||
          (participo >= 20 && creados < 50)
        ) {
          const exist = await Notification.query()
            .where({ user_id: user._id, moneda: 2 })
            .first();
          if (!exist) {
            const notificacion = {
              visto: false,
              user_id: user._id,
              title: "¡Desbloqueaste una nueva medalla!",
              message: "La medalla de plata te pertenece 😎, revisa tu muro.",
              moneda: 2,
              ruta: `/muro_usuario/${user._id}`,
            };
            await Notification.create(notificacion);
            Notifications.sendSystemNotification({
              userId: user._id,
              title: "¡Desbloqueaste una nueva medalla",
              message: "Tu medalla te espera 😎",
            });
          }
        }
        if (
          (creados >= 50 &&
            creados < 100 &&
            participo >= 20 &&
            participo < 50) ||
          (creados >= 100 && participo < 50) ||
          (participo >= 50 && creados < 100)
        ) {
          const exist = await Notification.query()
            .where({ user_id: user._id, moneda: 3 })
            .first();
          if (!exist) {
            const notificacion = {
              visto: false,
              user_id: user._id,
              title: "¡Desbloqueaste una nueva medalla!",
              message: "La medalla de oro te pertenece 😎, revisa tu muro.",
              moneda: 3,
              ruta: `/muro_usuario/${user._id}`,
            };
            await Notification.create(notificacion);
            Notifications.sendSystemNotification({
              userId: user._id,
              title: "¡Desbloqueaste una nueva medalla",
              message: "Tu medalla te espera 😎",
            });
          }
        }
        if (creados >= 100 && participo >= 50) {
          const exist = await Notification.query()
            .where({ user_id: user._id, moneda: 4 })
            .first();
          if (!exist) {
            const notificacion = {
              visto: false,
              user_id: user._id,
              title: "¡Desbloqueaste una nueva medalla!",
              message: "La medalla de platino te pertenece 😎, revisa tu muro.",
              moneda: 4,
              ruta: `/muro_usuario/${user._id}`,
            };
            await Notification.create(notificacion);
            Notifications.sendSystemNotification({
              userId: user._id,
              title: "¡Desbloqueaste una nueva medalla",
              message: "Tu medalla te espera 😎",
            });
          }
        }
      }
    }
    response.send(user);
  }
  async userInfo2({ request, response, auth }) {
    const user = (await auth.getUser()).toJSON();
    Notifications.sendSystemNotification({
      userId: user._id,
      title: "Nueva tienda registrada! 😎",
      message: "Una nueva tienda se ha registrado. Espera por tu aprobación",
    });
    if (user.roles[0] === 2) {
      user.age = moment().diff(moment(user.birthdate), "years");
      user.animal_img = (await Animales.find(user.animal)).img;
      user.ciudad = (
        await City.query().where({ _id: user.city }).fetch()
      ).toJSON()[0].name;
      user.comunidad = (
        await Community.query().where({ _id: user.community }).fetch()
      ).toJSON()[0].name;
    }
    response.send(user);
  }

  async animales({ request, response, auth }) {
    let animales = (await Animales.query().where({}).fetch()).toJSON();
    response.send(animales);
  }

  async verifyUser({ auth, request }) {
    const { email, password } = request.all();
    let token = await auth.attempt(email, password);
    const user = (await User.findBy("email", email)).toJSON();
    let isEnable = "no";
    if (token) {
      if (user.roles && (user.roles[0] === 1 || user.roles[0] === 3)) {
        isEnable = "si";
      }
      if (user.enable) {
        isEnable = "si";
      }
      if (user.deleted) {
        // Verifica si el usuario tiene el atributo 'delete' y su valor es true
        isEnable = "no";
      }
    }
    return isEnable;
  }

  async login({ auth, request }) {
    const { email, password, deviceToken } = request.all();
    let token = await auth.attempt(email, password);
    const user = (await User.findBy("email", email)).toJSON();
    if (user.deviceTokens) {
      user.deviceTokens.push(deviceToken);
    } else {
      user.deviceTokens = [deviceToken];
    }
    user.deviceTokens = [...new Set(user.deviceTokens)]; // Eliminar tokens repetidos
    await User.where("email", email).update({
      deviceTokens: user.deviceTokens,
    });
    let isUser = false;
    token.roles = user.roles.map((roleMap) => {
      if (roleMap === 2) {
        isUser = true;
      }
      return roleMap;
    });
    let userRoles = await Role.whereIn("id", token.roles).fetch();
    let permissions = userRoles.toJSON();
    token.permissions = [];
    permissions.forEach((element) => {
      element.permissions.forEach((element2) => {
        token.permissions.push(element2);
      });
    });

    token.email = user.email;
    token.estatus = user.estatus;
    token.full_name = user.full_name ? user.full_name : null;
    token.last_name = user.last_name;
    token._id = user._id;
    let data = {};
    data.SESSION_INFO = token;
    if (!user.online) {
      await User.where("email", email).update({ online: true });
    }
    if (user.quedadasPriv === undefined) {
      await User.where("email", email).update({ quedadasPriv: false });
    }
    if (user.premium === undefined) {
      await User.where("email", email).update({ premium: false });
    }
    return data;
  }

  async recuperacionapp({ request, response, params }) {
    if ((await User.where({ email: params.email }).fetch()).toJSON().length) {
      let codigo = randomize("0", 4);
      await User.query()
        .where({ email: params.email })
        .update({ codigoRecuperacion: codigo });
      let mail = await Email.sendMail(
        params.email,
        "Recuperación de Correo",
        `
          <center>
            <img src="https://app.magicday.eiche.cl/logoMagic.png" alt="logo" />
          </center>
          <h2 style="text-align:center">
            Recuperacion de correo
          </h2>
          <div style="text-align:center">
            Hola este es tu código de recuperación <b>${codigo}</b>.
          </div>
          `
      );
      response.send(mail);
    } else {
      response.unprocessableEntity([
        {
          message: "Correo no registrado en el sistema!",
          error: true,
        },
      ]);
    }
  }
  async accesoActualizarPass({ request, response, params }) {
    let user = await User.findBy("codigoRecuperacion", params.code);
    let email = request.only(["email"]).email;
    if (email === user.email) {
      response.send(true);
    } else {
      response.send(false);
    }
  }
  async actualizarPass({ request, response, params }) {
    let user = await User.findBy("codigoRecuperacion", params.code);
    let data = request.only(["password"]);
    user.password = data.password;
    user.codigoRecuperacion = null;
    await user.save();
    response.send(user);
  }

  async tiempoUsuario({ request, response }) {
    const { id, tiempo } = request.all();
    let user = await User.findBy("_id", id);
    if (user.tiempoWeb) {
      let tiempoo = user.tiempoWeb;
      user.tiempoWeb = tiempoo + tiempo;
    } else {
      user.tiempoWeb = tiempo;
    }
    await user.save();
    response.send(user);
  }

  async actualizarPassword(req, res) {
    try {
      const { id, password } = req.response.adonisRequest._body;
      let user = await User.findBy("_id", id);
      user.password = password;
      await user.save();
      res.send(user);
    } catch (error) {
      console.log(error);
    }
  }

  async register({ request, response }) {
    let dat = request.only(["dat"]);
    dat = JSON.parse(dat.dat);

    /*const validation = await validate(dat, User.fieldValidationRules())
    if (validation.fails()) {
      response.unprocessableEntity(validation.messages())
    } else */
    if ((await User.where({ email: dat.email }).fetch()).toJSON().length) {
      response.unprocessableEntity([
        {
          message: "Correo ya registrado en el sistema!",
        },
      ]);
    } else {
      let body = dat;
      body.roles = [2];
      body.first = true;
      body.quedadas = true;
      body.online = false;
      body.quedadasPriv = false;
      body.premium = false;
      const user = await User.create(body);
      const profilePic = request.file("perfil", {
        types: ["image"],
      });
      if (profilePic) {
        if (Helpers.appRoot("storage/uploads/perfil")) {
          await profilePic.move(Helpers.appRoot("storage/uploads/perfil"), {
            name: user._id.toString(),
            overwrite: true,
          });
        } else {
          mkdirp.sync(`${__dirname}/storage/Excel`);
        }
      }

      let mail = await Email.sendMail(
        "notification.magicday@gmail.com",
        "Nuevo usuario registrado",
        `
          <center>
            <img src="https://app.magicday.eiche.cl/logoMagic.png" alt="logo" />
          </center>
          <h2 style="text-align:center">
            ${user.name} ${
          user.last_name ? user.last_name : ""
        } se ha registrado en la aplicación
          </h2>
          `
      );

      response.send(user);
    }
  }
  /*
  async loginByGoogle({ auth, request, response }) {
    const { googleToken } = request.body;

    const decoded = jwtDecode(googleToken);
    const userFinded = (
      await User.where({ email: decoded.email }).fetch()
    ).toJSON();

    if (userFinded.length && !userFinded[0].googleAccount) {
      // verifica si este email ya esta registrado y si es cuenta de google
      response.unprocessableEntity([
        {
          message: "Correo ya registrado en el sistema!",
        },
      ]);
    } else if (
      userFinded.length &&
      userFinded[0].googleAccount &&
      userFinded[0].newUser
    ) {
      // verifica si este email ya esta registrado con una cuenta de google y es nuevo usuario
      // retorna los datos para completar el registro

      // const data = await generateLoginData(auth, decoded.email, decoded.sub)

      response.send({
        success: true,
        newUser: true,
        message: "Usuario debe completar registro",
        userData: userFinded[0],
      });
    } else if (userFinded.length && userFinded[0].googleAccount) {
      const data = await generateLoginData(auth, decoded.email, decoded.sub);

      response.send({
        success: true,
        login: true,
        message: "Usuario logeado con google",
        data,
      });
    } else {
      // si no esta registrado crea un usuario
      const userData = {
        googleAccount: true,
        email: decoded.email,
        password: decoded.sub,
        name: decoded.given_name,
        last_name: decoded.family_name,
        roles: [2],
        first: true,
        quedadas: true,
        online: false,
        quedadasPriv: false,
        premium: false,
        newUser: true, // propiedad para redirecionar para completar perfil
      };
      const user = await User.create(userData);

      descargarImagen(
        decoded.picture,
        "storage/uploads/perfil",
        user._id.toString()
      );

      let mail = Email.sendMail(
        "notification.magicday@gmail.com",
        "Nuevo usuario registrado",
        `
          <center>
            <img src="https://app.magicday.eiche.cl/logoMagic.png" alt="logo" />
          </center>
          <h2 style="text-align:center">
            ${user.name} ${
          user.last_name ? user.last_name : ""
        } se ha registrado en la aplicación
          </h2>
        `
      ).then((res) => console.log(res));
      // const loginData = await generateLoginData(auth, decoded.email, decoded.sub)
      response.send({
        success: true,
        newUser: true,
        message: "Usuario registrado con Google",
        userData: user,
      });
    }
  } */

  /******************************************** */
  async traerUsuarioPorToken(token) {
    const userInfoUrl =
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json";
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const userInfoResponse = await axios.get(userInfoUrl, config);
    return userInfoResponse.data;
  }

  /******************************************** */

  async loginByGoogle2({ auth, request, response }) {
   // console.log("Entre al backend de loginByGoogle2");
    const { googleToken } = request.body; // se trae el token

    try {
      var userInfoData = await this.traerUsuarioPorToken(googleToken);
    } catch {
      response
        .status(500)
        .send("Error al pedir informacion del usuario a Google");
      return;
    }

    try {
      // Verificar si el usuario ya está registrado
      const userFinded = (
        await User.where({ email: userInfoData.email }).fetch()
      ).toJSON();

      if (userFinded.length > 0) {
        // El usuario ya está registrado

        if (!userFinded[0].googleAccount) {
          // verifica si este email ya esta registrado y si es cuenta de google
          response.unprocessableEntity([
            {
              message: "Correo ya registrado en el sistema!",
            },
          ]);
        } else if (userFinded[0].newUser) {
  /*        console.log(
            " // El correo está registrado como cuenta de Google y es un nuevo usuario"
          ); */
          return response.send({
            success: true,
            newUser: true,
            message: "Usuario debe completar registro",
            userData: userFinded[0],
          });
        } else {
  /*        console.log(
            "// El usuario está registrado y ha iniciado sesión con Google"
          ); */
          const data = await generateLoginData(
            auth,
            userInfoData.email,
            userInfoData.id
          );
          return response.send({
            success: true,
            login: true,
            message: "Usuario logeado con google",
            data,
          });
        }
      } else {
        // El usuario no está registrado, se crea una nueva cuenta

        const userData = {
          googleAccount: true,
          email: userInfoData.email,
          password: userInfoData.id,
          name: userInfoData.given_name,
          last_name: userInfoData.family_name,
          roles: [2],
          first: true,
          quedadas: true,
          online: false,
          quedadasPriv: false,
          premium: false,
          newUser: true, // propiedad para redireccionar para completar perfil
        };
        const user = await User.create(userData);
        descargarImagen(
          userInfoData.picture,
          "storage/uploads/perfil",
          user._id.toString()
        );

        let mail = Email.sendMail(
          "notification.magicday@gmail.com",
          "Nuevo usuario registrado",
          `
                <center>
                    <img src="https://app.magicday.eiche.cl/logoMagic.png" alt="logo" />
                </center>
                <h2 style="text-align:center">
                    ${user.name} ${
            user.last_name ? user.last_name : ""
          } se ha registrado en la aplicación
                </h2>
                `
        ).then((res) => console.log(res));

        return response.send({
          success: true,
          newUser: true,
          message: "Usuario registrado con Google",
          userData: user,
        });
      }
    } catch (error) {
      console.error("Error al obtener información del usuario:", error);
      return response
        .status(500)
        .send("Error al obtener información del usuario");
    }
  }

  async registerModerador({ request, response }) {
    let dat = request.all();

    if ((await User.where({ email: dat.email }).fetch()).toJSON().length) {
      response.unprocessableEntity([
        {
          message: "Correo ya registrado en el sistema!",
        },
      ]);
    } else {
      let body = dat;
      body.roles = [3];

      const user = await User.create(body);
      response.send(user);
    }
  }
  async updateUserInfoNewUser({ params, request, response }) {
    const dat = request.all();
    const user = await User.find(dat._id);
    if (user && user.newUser) {
      let modificar = await User.query().where("_id", params.id).update(dat);
      response.send({
        success: true,
        data: modificar,
      });
    }
  }
  async updateUserInfo({ params, request, response }) {
    var dat = request.all();
    let modificar = await User.query().where("_id", params.id).update(dat);
    response.send(modificar);
  }

  async updatePerfilImg({ request, response, auth }) {
    let user = (await auth.getUser()).toJSON();
    var profilePic = request.file("files", {
      types: ["image"],
      size: "25mb",
    });
    if (profilePic) {
      if (Helpers.appRoot("storage/uploads/perfil")) {
        await profilePic.move(Helpers.appRoot("storage/uploads/perfil"), {
          name: user._id.toString(),
          overwrite: true,
        });
      } else {
        mkdirp.sync(`${__dirname}/storage/Excel`);
      }

      if (!profilePic.moved()) {
        return profilePic.error();
      } else {
        response.send(user);
      }
    }
  }

  async noSeguidos({ request, response, auth }) {
    const user = (await auth.getUser()).toJSON();
    let seguidos = (
      await Seguidores.query().where({ seguidor: user._id }).fetch()
    ).toJSON();
    let users = (
      await User.query()
        .where({ roles: [2], enable: true, city: user.city })
        .with("animalInfo")
        .fetch()
    ).toJSON();
    users = users.filter((v) => v._id !== user._id);
    users = users.map((v) => {
      return {
        ...v,
        age: moment().diff(moment(v.birthdate), "years"),
        seguidoBool: seguidos.find((x) => x.seguido === v._id) ? true : false,
      };
    });
    for (let i = 0; i < users.length; i++) {
      users[i].city_name = (await City.findBy(users[i].city)).name;
    }
    response.send(users);
  }

  async seguidores_seguidos({ params, response, auth }) {
    const user = (await User.find(params.id)).toJSON();
    const logueado = (await auth.getUser()).toJSON();
    let data = [];
    if (params.type === "1") {
      data = (
        await Seguidores.query().where({ seguido: user._id }).fetch()
      ).toJSON();
      for (let i = 0; i < data.length; i++) {
        data[i].seguidorInfo = (await User.find(data[i].seguidor)).toJSON();
        data[i].seguidorInfo.age = moment().diff(
          moment(data[i].seguidorInfo.birthdate),
          "years"
        );
        data[i].seguidorInfo.city_name = (
          await City.findBy(data[i].seguidorInfo.city)
        ).name;
        let seguido = await Seguidores.query()
          .where({ seguidor: logueado._id, seguido: data[i].seguidor })
          .first();
        if (seguido) {
          data[i].seguidoBool = true;
        } else {
          data[i].seguidoBool = false;
        }
      }
    } else {
      data = (
        await Seguidores.query().where({ seguidor: user._id }).fetch()
      ).toJSON();
      for (let i = 0; i < data.length; i++) {
        data[i].seguidoInfo = (await User.find(data[i].seguido)).toJSON();
        data[i].seguidoInfo.age = moment().diff(
          moment(data[i].seguidoInfo.birthdate),
          "years"
        );
        data[i].seguidoInfo.city_name = (
          await City.findBy(data[i].seguidoInfo.city)
        ).name;
      }
    }
    response.send(data);
  }

  async seguirUser({ request, response, auth }) {
    const user = (await auth.getUser()).toJSON();
    let data = request.all();
    let seguidos = (
      await Seguidores.query().where({ seguidor: user._id }).fetch()
    ).toJSON();
    if (!seguidos.find((v) => v.seguido === data.seguido)) {
      data.seguidor = user._id;
      const nuevo = await Seguidores.create(data);

      // Crear notificacion
      const notif = {
        visto: false,
        user_id: data.seguido,
        perfil: user._id,
        title: "Nuevo seguidor",
        message: `${user.name} ${
          user.last_name ? user.last_name : ""
        } ha comenzado a seguirte`,
        ruta: `/muro_usuario/${user._id}`,
      };
      await Notification.create(notif);
      Notifications.sendSystemNotification({
        userId: data.seguido,
        title: "Nuevo seguidor! 😎",
        message: `${user.name} ${
          user.last_name ? user.last_name : ""
        } ha comenzado a seguirte`,
      });
    } else {
      let eliminar = await Seguidores.query()
        .where({ seguido: data.seguido, seguidor: user._id })
        .delete();
    }
    response.send(data);
  }

  async destroy({ params, request, response }) {
    let eliminar = await User.query().where("_id", params.id).delete();
    response.send(true);
  }

  async offlineUser({ request, response }) {
    const { email } = request.all();
    await User.where("email", email).update({ online: false });
  }

  async followVerificator({ params, request, response, auth }) {
    const { id } = params;
    const user = (await auth.getUser()).toJSON();
    const allSeguidos = (await Seguidores.query().fetch()).toJSON();
    let iFollowHim = false;
    let heFollowMe = false;
    for (let i = 0; i < allSeguidos.length; i++) {
      const objeto = allSeguidos[i];
      if (objeto.seguido === id && objeto.seguidor === user._id) {
        iFollowHim = true;
      }
      if (objeto.seguido === user._id && objeto.seguidor === id) {
        heFollowMe = true;
      }
      if (iFollowHim && heFollowMe) {
        return response
          .status(200)
          .send({ status: 200, message: "Users follows each other" });
      }
    }
  }

  async usersBloq({ params, request, response, auth }) {
    let usersBloqued = (
      await User.query()
        .where({ roles: [2], enable: false })
        .with("animalInfo")
        .with("ciudad")
        .with("comunidad")
        .orderBy("tiempoWeb", "desc")
        .fetch()
    ).toJSON();
    if (usersBloqued) {
      return response
        .status(200)
        .send({ status: 200, message: "Users Bloqued", users: usersBloqued });
    } else {
      return response
        .status(400)
        .send({ status: 400, message: "Not Users Bloqued" });
    }
  }
  // eliminar simbolica
  async updateUserDeletedStatus({ params, response }) {
    try {
      const user = await User.find(params.id);

      if (!user) {
        return response.notFound({ error: "User not found" });
      }
      user.deleted = true;
      user.dateDeleted = new Date(); // Asigna la fecha actual

      await user.save();

      return response.send({
        message: "User deleted status updated successfully",
      });
    } catch (error) {
      return response.status(500).send({ error: "Internal server error" });
    }
  }
  // eliminar real
  async realEliminarUsuarioPorId({ params, response }) {
    try {
      const userId = params.id;
      const user = await User.find(userId);
      if (!user) {
        return response.status(404).send({ message: "El usuario no existe" });
      }

      // Eliminar el usuario
      await User.query().where("_id", userId).delete();

      return response
        .status(200)
        .send({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return response
        .status(500)
        .send({ message: "Se produjo un error al eliminar el usuario" });
    }
  }
  async modificarTutorial({ request, response }) {
    try {
      const userId = request.params.userId;   
  
      const usuario = await User.find(userId);
      
      if (!usuario) {
        return response.status(404).send({ error: "Usuario no encontrado" });
      }
  
      const { tutorialState } = request.only(["tutorialState"]);
  
      // Actualizar el estado del tutorial
      usuario.tutorial = tutorialState;
      await usuario.save();
  
      return response.status(200).send({ success: true, message: "Estado del tutorial actualizado exitosamente" });
    } catch (error) {
      return response.status(500).send({ error: "Error al modificar el estado del tutorial" });
    }
  }
  
  
  
  
}

module.exports = UserController;
