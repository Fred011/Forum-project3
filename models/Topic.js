const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicSchema = new Schema ({
    title: {type: String, required: true},
    message: {type: String, required: true},
    category: {type: String, enum: ['Lifestyle', 'Gaming', 'Sport', 'Food', 'Random', 'Fun', 'Dev', 'UX-UI']},
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    upVote: Number,
    downVote: Number
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;