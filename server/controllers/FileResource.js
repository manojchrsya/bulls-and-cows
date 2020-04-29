const FileResource = require('../models/FileResources');
const Upload = require('../lib/uploads');

class FileResourceController extends Upload {
  // eslint-disable-next-line class-methods-use-this
  async saveFileDetails(options = {}) {
    // remove all document related to same ownerId
    if (options.ownerId && options.ownerType) {
      await FileResource.deleteMany({ ownerId: options.ownerId, ownerType: options.ownerType });
    }
    return new FileResource(options).save();
  }
}
module.exports = FileResourceController;
