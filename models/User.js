const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const userSchema = new Schema({
  email: String,
  password: String,
  username: String,
  description: String,
  picture: String,
  topics: [{type: Schema.Types.ObjectId, ref: 'Topic'}],
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
  favorites: [{type: Schema.Types.ObjectId, ref: 'Topic'}]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;