// MulterConfig.js
const multer = require('multer');
const { dirname, join } = require('path');

const CURRENT_DIR = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(CURRENT_DIR, '../../storage/uploads/insignas'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Puedes cambiar esto según cómo quieras nombrar los archivos
  }
});

const upload = multer({ storage: storage });


module.exports = upload;
