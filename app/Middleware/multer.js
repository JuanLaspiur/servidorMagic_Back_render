const { dirname, join } = require('path');
const multer = require('multer');

const CURRENT_DIR = dirname(__filename);

const upload = multer({ 
    dest: join(CURRENT_DIR, '../../storage/uploads/insignas') 
});

module.exports = { upload };
