var mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
    text: { type: String, required: true },
    sub_by: { type: String, required: true },
    votes: {type: Number, default: 0}
  });

  commentsSchema.virtual('url').get(function() {
    return '/posts/comment/' + this._id;
  });
  module.exports = mongoose.model('Comment', commentsSchema);