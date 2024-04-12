const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/insignas/'); // Carpeta donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Nombre original del archivo
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
