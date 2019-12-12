const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
// const createError = require('http-errors');
const Topic = require('../models/topic')
const Comment = require('../models/comment')


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

    const { title, message, category, comments, upVote, downVote } = req.body;


    Topic.create({ title, message, user, category, comments, upVote, downVote })
        .then((newTopic)=> {
            console.log('add works');
            console.log(newTopic);
            
        res
            .status(201)
            .json(newTopic);
        })
        .catch((err)=> {
        res
            .status(500)  // Internal Server Error
            .json(err)
        })
  });

  // GET 'myTopics'    => to get all the topics related to the authenticated user
router.get('/mytopics', isLoggedIn,  (req, res, next) => {

    const user = req.session.currentUser

    Topic.findById(user.topics).populate('User', 'comment')
        .then( (allMyTopics) => {
        res
            .status(200)
            .json(allMyTopics)
        })
        .catch((err)=> {
        res
            .status(500)  // Internal Server Error
            .json(err)
        });
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
    
    Topic.findById( id ).populate('user', 'comment')
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

    const { topicID } = req.params

    // Topic.find()
    //     .then( (topic) => {
    //         res
    //             .status(200)
    //             .json(topic)
    //     })
    //     .catch( (err) => {
    //         res
    //             .status(500)
    //             .json(err)
    //     });

    const { message, user, topic, upVote, downVote } = req.body;

    Comment.create({ message, user, topic: topicID, upVote: 0, downVote: 0 })
        .then((newComment)=> {
            console.log('add comment works');
            console.log(newComment);
            
            res
                .status(201)
                .json(newComment);
        })
        .catch((err)=> {
        res
            .status(500)  // Internal Server Error
            .json(err)
        })
  });

module.exports = router