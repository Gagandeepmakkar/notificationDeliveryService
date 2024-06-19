const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: String, ref: 'User' }],
  saves: [{ type: String, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
