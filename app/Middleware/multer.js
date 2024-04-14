// Importar Multer
const multer = require('multer');

// Configurar Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Especificar el directorio de destino para los archivos subidos
    cb(null, 'uploads/insignas');
  },
  filename: function (req, file, cb) {
    // Generar un nombre de archivo único
    let codeFile = randomize("Aa0", 30);
    cb(null, codeFile);
  }
});

// Crear instancia de Multer
const upload = multer({ storage: storage });
module.exports = { upload };