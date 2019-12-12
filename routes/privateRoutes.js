const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
// const createError = require('http-errors');
const Topic = require('../models/topic')
const Comment = require('../models/comment')
const User = require('../models/user')


const {
    isLoggedIn,
    isNotLoggedIn,
    validationLoggin,
  } = require('../helpers/middlewares');



// GET '/home'		 => to get all the topics in home
router.get('/home', isLoggedIn, (req, res, next) => {
    Topic.find().populate('User')
      .then(allTheTopics => {
          console.log('home worksssssssss');
          
        res.json(allTheTopics);
      })
      .catch(err => {
        res.json(err);
      })
  });


  // POST '/addtopic'    => to post a new topic
  router.post('/addtopic', isLoggedIn, (req, res, next) => {
    
    const user = req.session.currentUser
    const { title, message, category } = req.body;


    Topic.create({ title, message, creator: user, category, upVote: 0, downVote: 0 })
        .then((newTopic)=> {
            console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡ add topic ¡¡¡¡¡¡¡¡¡¡¡¡', newTopic);
            res
                .status(201)
                .json(newTopic);

                User.findByIdAndUpdate( user, { $push: { topics: newTopic }}, {new: true}) 
                    .then( (response) => {
                        console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡', response)

                    })
                    .catch( (err) => console.log(err));
        })
        .catch((err)=> {
        res
            .status(500)  // Internal Server Error
            .json(err)
        })
  });

  // GET 'myTopics'    => to get all the topics related to the authenticated user
router.get('/mytopics', isLoggedIn,  (req, res, next) => {
    // { "._id" : {$in: userTopic}  }
    
    const { _id } = req.session.currentUser
    // console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡', req.session.currentUser);
    
    
    User.findById( {_id}  )
        .populate('Topic')
        .then( (user) => {
            console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡', user.topics);

            Topic.findById(user.topics[0])
            .then( (topic) => {
                console.log(topic);
                
            })
            .catch( (err) => console.log(err));




            res
            .status(200)
            .json(user.topics)
        })
        .catch((err)=> {
            res
            .status(500)  // Internal Server Error
            .json(err)
        });
    
    // const user = foundUser
    // // console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡', User);

    // user.find({ "._id" : {$in: userTopic} })
    //     .then( (topicArr) => {
    //         res
    //             .status(200)
    //             .json(topicArr)
    //     })
    //     .catch( (err) => console.log(err));

});

  // GET 'mytopics/:id'    => to get all the topics related to the authenticated user
router.get('/mytopics/:id', isLoggedIn,  (req, res) => {

    const { id } = req.params;
      
    if ( !mongoose.Types.ObjectId.isValid(id)) {
        res
            .status(400)  //  Bad Request
            .json({ message: 'Specified id is not valid'})

            return;
    }
    
    Topic.findById( id ).populate('User', 'Comment')
        .then( (foundTopic) => {
            res.status(200)
            .json(foundTopic);
            })
        .catch((err) => {
            res.res.status(500).json(err);
        })
});


  // GET 'mycomments'    => to get all the comments related to the authenticated user
router.get('/mycomments', isLoggedIn,  (req, res, next) => {



    Comment.find().populate('user', 'topic')
        .then( (allMyComments) => {
            res
                .status(200)
                .json(allMyComments)
            })
        .catch((err)=> {
            res
                .status(500)  // Internal Server Error
                .json(err)
            });

});



  // POST '/topic/:id/comment    => to post a new topic
router.post('/topic/:id/comment', isLoggedIn, (req, res, next) => {

    const user = req.session.currentUser 
    const { id } = req.params
    const { message } = req.body;
    
    // const arr = id.comments.push(newComment)

    Comment.create({ message, user, topic: id, upVote: 0, downVote: 0 })
        .then((newComment)=> {
            console.log('add comment works');
            console.log(newComment);
                res
                .status(201)
                .json(newComment);

                Topic.findByIdAndUpdate( id, { $push: { comments: newComment }}, {new: true}) 
                    .then( (response) => {
                        console.log('¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡', response)

                    })
                    .catch( (err) => console.log(err));
            })
        .catch((err)=> {
        res
            .status(500)  // Internal Server Error
            .json(err)
        })
  });

module.exports = router