// Answer Document Schema
var mongoose = require('mongoose');
const Comment = require('./comments');

const answersSchema = new mongoose.Schema({
    text: { type: String, required: true },
    ans_by: { type: String, required: true },
    ans_date_time: { type: Date, default: Date.now },
    votes: {type: Number, default: 0},
    comments: { type: [Comment.schema]}
  });

  answersSchema.virtual('url').get(function() {
    return '/posts/answer/' + this._id;
  });
  module.exports = mongoose.model('Answer', answersSchema);