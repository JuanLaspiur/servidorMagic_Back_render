const Mail = use('Mail')
const Config = use('Config')

exports.sendMail = async (to, subject, message, attach, cc, bcc) => {
  try {
    // Obtén la configuración de correo electrónico específica
    const emailConfig = Config.get('mail.smtp') // O la conexión que deseas utilizar

    await Mail.connection(emailConfig).raw(message, (msg) => {
      msg.from('info@magicday.app', 'MagicDay')
      msg.to(to)
      msg.subject(subject)
      if(bcc){
        msg.bcc(bcc)
      }
      if (attach) {
        msg.attach(attach)
      }
    })
    return 'Message sent';
  } catch (error) {
    console.log(error, 'Error al Enviar Correo')
    return error
  }
};
