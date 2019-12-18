const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
// const createError = require('http-errors');
const Topic = require('../models/Topic')
const Comment = require('../models/Comment')
const User = require('../models/User')


const { isLoggedIn } = require('../helpers/middlewares');





// POST '/addtopic'    => to post a new topic
router.post('/addtopic', isLoggedIn, (req, res, next) => {
    
    console.log('hello from the backend',req.body);
    const user = req.session.currentUser
    const { title, message, category } = req.body;
    
    Topic.create({ title, message, creator: user, category })
    .then((newTopic)=> {
        console.log('TOPIC', newTopic);
        res
        .status(201)
        .json(newTopic);
        User.findByIdAndUpdate( user, { $push: { topics: newTopic }}, {new: true}) 
        .then( (response) => {
            console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡', response)
            
        })
        .catch( (err) => console.log('error timeeeee',err));
    })
    .catch((err)=> {
        res
        .status(500)  // Internal Server Error
        .json(err)
    })
});


// GET 'myTopics'    => to get all the topics related to the authenticated user
router.get('/mytopics', isLoggedIn,  (req, res, next) => {
    
    const user = req.session.currentUser._id
    console.log('req.session.currentUSer', user);
    
    if ( !mongoose.Types.ObjectId.isValid(user) ) {
        res
        .status(400)
        .json({ message: 'Specified id is not valid'});
        return;
    }
    
    User.findById( user )
    .populate('topics')
    .then( (user) => {
        console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡', user.topics)
        const userTopics = user.topics
        res
        .status(200)
        .json(userTopics);
        
    })
    .catch((err)=> {
        res
        .status(500)  // Internal Server Error
        .json(err)
    });
    
});


// GET 'mytopics/:id'    => to get all the topics related to the authenticated user
router.get('/mytopics/:id', isLoggedIn, async (req, res, next) => {
    
    const { userID } = req.session.currentUser._id
    // console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡', req.session.currentUser);
    const { id } = req.params
    
    console.log('TOPIC ID', id);
    
    try {
        const topic = await Topic.findById(id) 
        res
        .status(200)
        .json(topic)
    } catch (err) {
        res
        .status(500)
        .json(err)
    }
});


// GET 'mycomments'    => to get all the comments related to the authenticated user
router.get('/mycomments', isLoggedIn, async  (req, res, next) => {
    
    const user = req.session.currentUser
    
    try {
        const userComments = await User.findById( user ).populate('comments')
        // const allMyComments = await User.find({user}).populate('comments')
        
        res
        .status(200)
        .json(userComments.comments)
        console.log('user commentssssss', userComments.comments);
    } catch (err) {
        res
        .status(500)  // Internal Server Error
        .json(err)
    }
});


// PUT '/mycomments/:id/edit'   => to update one topic 
router.delete('/mycomments/:id/delete', isLoggedIn, async (req, res, next) => {
    
    const userId = req.session.currentUser._id
    const { id } = req.params
    
    console.log('UPDATED USERRRRR', req.session.currentUser);
    
    if ( !mongoose.Types.ObjectId.isValid(id) ) {
        res
        .status(400)
        .json({ message: 'Specified id is not valid'});
        return;
    }
    
    try {
        const removedComment = await Comment.findByIdAndRemove(id);
        await Topic.findByIdAndUpdate( removedComment.topic, { $pull: { comments: id }}, {new: true}).populate('comments');
        await User.findByIdAndUpdate( userId, { $pull: { comments: id }}, {new: true}).populate('comments');
        
        res
        .status(202)
        .json({ message: `Comment with ${id} removed successfully.` })
    }
    catch (err) {
        console.log('ERROOOOOOOOORR', err);
        
        res
        .status(500)
        .json(err)
        
    }
});


// POST '/topic/:id/comment    => to post a new comment on specific topic
router.post('/topic/:id/addcomment', isLoggedIn, (req, res, next) => {
    
    const user = req.session.currentUser._id
    const { id } = req.params
    const { message } = req.body;
    console.log('paramssssss', req.params.id);
    
    
    // const arr = id.comments.push(newComment)
    
    Comment.create({ message: message, user, topic: id, upVote: 0, downVote: 0 })
    // .populate('topic')
    .then((newComment)=> {
        console.log('add comment works');
        console.log('NEW COMMENT', newComment);

        
       const firstPromise = Topic.findByIdAndUpdate( id, { $push: { comments: newComment }}, {new: true}) 
        .then( (response) => {
            console.log('TOPIIIIIIIIC', response)
        })
        
        .catch( (err) => {
            res
            .status(500)
            .json(err)
        });
        
     const secondPromise = User.findByIdAndUpdate(user, { $push: { comments: newComment }}, {new: true})
        .then( (data) => {
            console.log('data', data);
        })
        .catch( (err) => 
        res
        .status(500)
        .json(err));

    Promise.all([firstPromise, secondPromise])
    .then( () => {
        console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡',newComment);
        res
        .status(201)
        .json(newComment);  
    })
    .catch( (err) => console.log(err));

    })
    .catch((err)=> {
        res
        .status(500)  // Internal Server Error
        .json(err)
    })
});


// PUT '/mytopics/:id/edit'   => to update one topic 
router.put('/mytopics/:id/edit', isLoggedIn,  (req, res) => {
    
    const { _id } = req.session.currentUser
    
    console.log('TOPIC ID', req.params.id);
    
    User.findById( {_id}  )
    .populate('topics')
    .then( (user) => {
        // console.log('USER.TOPIC', user.topics);
        
        const { id } = req.params
        console.log('PARAMSSSSSSS', req.params);
        Topic.findByIdAndUpdate(id, req.body)
        .then( (topic) => {
            console.log('???????????????', topic);
            res
            .status(201)
            .json(topic)
        })
        .catch( (err) => console.log(err));
    })
    .catch((err)=> {
        res
        .status(500)  // Internal Server Error
        .json(err)
    });
});


// GET '/profile/:id'    => Display profile page
router.get('/profile', isLoggedIn, (req, res, next) => {
    
    const id = req.session.currentUser._id
    console.log('USER IDDDDDD', id);
    
    User.findById( id )
    .populate('comments')
    .populate('topics')
    .then( (user) => {
        res 
        .status(200)
        .json(user)
    })
    .catch( (err) => {
        res
        .status(500)
        .json(err)
    });
    
});


// PUT '/profile/:id/edit'     => edit user profile
router.put('/profile/edit', isLoggedIn, (req, res, next) => {
    
    const id = req.session.currentUser._id 
    
    User.findByIdAndUpdate( id, req.body)
        .then( (user) => {
            // console.log('USER', user);
            res
            .status(201)
            .json(user)
        })
        .catch( (err) => {
            res
            .status(500)
            .json(err)
        });
})


// DELETE => to delete your topic
router.delete('/mytopics/:id/delete', isLoggedIn, async (req, res, next) => {
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    const userId = req.session.currentUser._id
    const { id } = req.params
    
    console.log('UPDATED USERRRRR', userId  );
    
    if ( !mongoose.Types.ObjectId.isValid(id) ) {
        res
        .status(400)
        .json({ message: 'Specified id is not valid'});
        return;
    }
    
    try {
        const removedTopic = await Topic.findByIdAndRemove(id);
        User.findByIdAndUpdate( userId, { $pull: { topics: id }}, {new: true}).populate('topics')
        .then((user)=> console.log('user', user)
        )
        console.log('removedTopic._id', removedTopic);
        
        res
        .status(202)
        .json({ message: `Topic with ${id} removed successfully.` })
    }
    catch (err) {
        res
        .status(500)
        .json(err)  
    }
});


// DELETE => to delete your profile
router.delete('/profile/:id/delete', isLoggedIn, async (req, res, next) => {
    
    const user = req.session.currentUser._id
    
    try {
        User.findByIdAndRemove( user )
        res
        .status(204)
        .json({ message: `Profile with ${user} removed successfully.` })
    } catch (err) {
        res
        .status(500)
        .json(err)
    }
})


// Get => to get a specific topic
router.get('/topics/:id', isLoggedIn, (req, res, next) => {

    const { id } = req.params

    Topic.findById ( id )
    .populate('creator')
    .populate('comments')
        .then( (topic) => {
            res 
                .status(200)
                .json(topic)
        })
        .catch( (err) => {
            res
                .status(500)
                .json(err)
        });
    
})



// GET '/home'		 => to get all the topics in home
router.get('/home', isLoggedIn, (req, res, next) => {

    console.log('USERRRRR', req.session.currentUser);
    
    Topic.find()
    .populate('creator')
    .populate('comments')
      .then(allTheTopics => {
          console.log('home worksssssssss');
          
        res
            .status(200)
            .json(allTheTopics);
      })
      .catch(err => {
        res
            .status(500)
            .json(err);
      })
  });
  
module.exports = router