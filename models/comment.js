const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema ({
    message: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    topic: {type: Schema.Types.ObjectId, ref: 'Topic'},
    vote: Number
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;