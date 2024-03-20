'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return {
    greeting: 'Hello world in JSON'
  }
})

const addPrefixToGroup = group => {
  // Grupo para rutas con prefijo /api/
  group.prefix("api");
  return group;
};


addPrefixToGroup(
  Route.group(() => {
    // Insertar rutas sin protección de autenticación aquí
    Route.post("loginByGoogle", "UserController.loginByGoogle");
    Route.post("login", "UserController.login");
    Route.get("testeando_telde", ()=>{
      return {
        success: true
      }
    });
    Route.post("verificar_user", "UserController.verifyUser");
    Route.post("register", "UserController.register")
    Route.get("animales", "UserController.animales")
    Route.get("calificacion/:id", "RatingController.calificacion")

    Route.get("communities", "CommunityController.index")
    Route.get("cities", "CityController.index")
    Route.get('perfil_img/:file', 'UploadController.getFileByDirectoryPerfil')
    Route.get('mediacion_img/:file', 'UploadController.getFileByDirectoryMediacion')
    Route.get('quedada_img/:file', 'UploadController.getFileByDirectoryQuedada')
    Route.get('chat_img/:file', 'UploadController.getFileByChat')
    Route.get('tabloide_img/:file', 'UploadController.getFileByDirectoryTabloide')
    Route.get("email_send_app/:email", "UserController.recuperacionapp")
    Route.get("exportar-a-excel", "UserController.export")
    Route.put("actualizar_pass/:code", "UserController.actualizarPass")
    Route.put("actualizarPassword", "UserController.actualizarPassword")
    Route.put("tiempoUserWeb", "UserController.tiempoUsuario")
    Route.put("acceso_actualizar_pass/:code", "UserController.accesoActualizarPass")
    Route.put("offline_user", "UserController.offlineUser")
    Route.put('update_user_info_new_user/:id', 'UserController.updateUserInfoNewUser')
  })
);

addPrefixToGroup(
  Route.group(() => {
    // Insertar rutas con protección de autenticación aquí
    Route.get("user_info", "UserController.userInfo")
    Route.get("user_info2", "UserController.userInfo2")
    Route.get("user_by_id/:id", "UserController.userById")
    Route.get("user_edit/:id", "UserController.userEdit")
    Route.get("all_user", "UserController.index")
    Route.get("all_user_admin", "UserController.all_user_admin")

    Route.get("users_bloq", "UserController.usersBloq")
    Route.get("follow_verificator/:id", "UserController.followVerificator")
    Route.put('update_user_info/:id', 'UserController.updateUserInfo')
    Route.put('update_perfilImg', 'UserController.updatePerfilImg')

    Route.post("register_moderador", "UserController.registerModerador")
    Route.get("moderadores", "UserController.moderadores")
    Route.delete("eliminar_moderador/:id", "UserController.destroy")

    Route.get("seguidores_seguidos/:type/:id", "UserController.seguidores_seguidos")
    Route.post("seguir_user", "UserController.seguirUser")
    Route.get("no_seguidos", "UserController.noSeguidos")

    Route.get("categories", "CategoryController.index")

    Route.post("register_quedada", "QuedadaController.store")
    Route.post("invitar/:id", "QuedadaController.invitarUser")
    Route.post("asistir/:id", "QuedadaController.asistir")
    Route.patch("reportar/:id", "QuedadaController.reportar")
    Route.put("edit_quedada/:id", "QuedadaController.edit")
    Route.get("all_quedadas", "QuedadaController.allQuedadas")
    Route.get("all_quedadas_premium", "QuedadaController.allQuedadasPremium")
    Route.get("all_quedadas_admin", "QuedadaController.allQuedadasAdmin") //all quedadas admin
    Route.get("quedada_by_id/:id", "QuedadaController.quedadaById")
    Route.get("quedada_info/:id", "QuedadaController.quedadaInfo")
    Route.get("quedadas_user/:id", "QuedadaController.index")
    Route.get("solicitudes", "QuedadaController.solicitudes")
    Route.get("evetos_all_asistidos/:id", "QuedadaController.allAsistidos")
    Route.get("evetos_asistidos/:id", "QuedadaController.eventosAsistidos")
    Route.get("evetos_activos/:id", "QuedadaController.eventosActivos")
    Route.put('update_quedadaImg/:id', 'QuedadaController.updateImg')
    Route.put('add_quedadaImg/:id', 'QuedadaController.addImg')
    Route.put('restart_quedada/:id', 'QuedadaController.restartQuedada')
    Route.post("filtrar", "QuedadaController.filtrarQuedadas")

    Route.get("all_chats", "ChatController.index")
    Route.get("chat_by_id/:id", "ChatController.chatById")
    Route.post("chat_privado/:user_id", "ChatController.store")
    Route.post("send_message/:id", "ChatController.create")
    Route.put("chat/:id", "ChatController.update")

    Route.post("register_rating", "RatingController.store")

    Route.get("publications_user/:id", "PublicationController.show")
    Route.post("register_publication", "PublicationController.store")
    Route.post("reaccionar/:id", "PublicationController.reaccionar")

    /* Mediacion */
    Route.get("mediacion", "MediacionController.index")
    Route.get("mediacion_by_user_id", "MediacionController.mediacionByUser")
    Route.get("mediacion_by_id/:id", "MediacionController.mediacionById")
    Route.post("mediacion", "MediacionController.store")
    Route.put('mediacion/:id', 'MediacionController.update')
    Route.post("send_message_mediacion/:id", "MediacionController.message")

    /* Notificaciones */
    Route.get("new_notifications", "NotificationController.newNotifications")
    Route.get("notifications", "NotificationController.allNotifications")
    Route.put("see_notif/:id", "NotificationController.edit")

    /* Tabloide */
    Route.post("create_tabloide", "TabloideController.store")
    Route.get("tabloide", "TabloideController.tabloideAll")
    Route.get("tabloide/:id", "TabloideController.tabloideById")
    Route.delete("delete_tabloide/:id", "TabloideController.destroy")
    Route.put("update_tabloide/:id","TabloideController.update")
    Route.put('update_tabloideImg/:id', 'TabloideController.updateImg')
    Route.put('view_tabloide/:id', 'TabloideController.clickOnTabloide')
    Route.put('up_tabloide/:id', 'TabloideController.upTabloide')
    Route.post('add_tabloideImg/:id', 'TabloideController.addImg')

  }).middleware("auth")
);
