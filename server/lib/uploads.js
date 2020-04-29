const multer = require('multer');
const fs = require('fs-extra');

class Uploads {
  constructor() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const path = `assets/uploads/${file.fieldname}`;
        fs.mkdirsSync(path);
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const extension = file.originalname.split('.').pop();
        // eslint-disable-next-line no-underscore-dangle
        cb(null, `${req.user._id}.${extension}`);
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
