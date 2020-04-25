const mongoose = require('mongoose');

const { Schema } = mongoose;

const FileResourceSchema = new Schema({
  name: { type: String },
  title: { type: String },
  url: { type: String },
  path: { type: String },
  originalName: { type: String },
  mime: { type: String },
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });


module.exports = mongoose.model('FileResource', FileResourceSchema);
