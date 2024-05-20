// Question Document Schema
const mongoose = require('mongoose');
const Answer = require('./answers');
const Tag = require('./tags');
const Comment = require('./comments');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, maxLength: 50},
  summary: {type: String, required: true, maxLenght: 140},
  text: { type: String, required: true },
  tags: { type: [Tag.schema], required: true },
  answers: { type: [Answer.schema]},
  asked_by: {type: String, default: "Anonymous"},
  ask_date_time: { type: Date, default: Date.now },
  views: { type: Number, default: 0},
  votes: { type: Number, default: 0},
  comments: { type: [Comment.schema]}
});

questionSchema.virtual('url').get(function() {
  return '/posts/question/' + this._id;
});

module.exports = mongoose.model('Question', questionSchema);
