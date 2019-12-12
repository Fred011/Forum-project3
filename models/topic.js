const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicSchema = new Schema ({
    title: {String, required: true},
    message: {String, required: true},
    category: {String, enum: ['lifestyle', 'gaming', 'sport', 'food', 'random', 'fun', 'dev', 'UX-UI']},
    user: {type: [Schema.Types.ObjectId], ref: 'User'},
    comments: {type: [Schema.Types.ObjectId], ref: 'Comments'},
    upVote: 0,
    downVote: 0
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;