const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    reputation: {type: Number, default: 0},
    created_date: { type: Date, default: Date.now },
});

usersSchema.virtual('url').get(function() {
    return '/posts/users/' + this._id;
  });
module.exports = mongoose.model('User', usersSchema);