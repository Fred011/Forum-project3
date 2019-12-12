const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema ({
    message: {String, required: true},
    user: {type: [Schema.Types.ObjectId], ref: 'User'},
    topic: {type: [Schema.Types.ObjectId], ref: 'Topic'},
    upVote: 0,
    downVote: 0
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;