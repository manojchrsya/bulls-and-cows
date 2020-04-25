const multer = require('multer');

class Uploads {
  constructor() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'assets/uploads');
      },
      filename: (req, file, cb) => {
        cb(null, `${file.fieldname} - ${Date.now()}`);
      },
    });
    this.upload = multer({ storage, fileFilter: this.fileFilter });
  }

  // eslint-disable-next-line class-methods-use-this
  fileFilter(req, file, callback) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  }
}

module.exports = Uploads;
