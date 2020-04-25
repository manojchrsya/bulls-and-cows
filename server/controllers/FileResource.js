const FileResource = require('../models/FileResources');
const Upload = require('../lib/uploads');

class FileResourceController extends Upload {
  // eslint-disable-next-line class-methods-use-this
  async create(options = {}) {
    const data = {
      name: options.name,
      originalName: options.originalName,
      mime: options.mime,
      path: options.path,
      url: options.url,
    };
    return new FileResource(data).save();
  }
}
module.exports = FileResourceController;
