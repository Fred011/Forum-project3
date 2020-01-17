const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
// const createError = require('http-errors');
const Topic = require("../models/Topic");
const Comment = require("../models/Comment");
const User = require("../models/User");

const { isLoggedIn } = require("../helpers/middlewares");

// POST '/addtopic'    => to post a new topic
router.post("/addtopic", isLoggedIn, (req, res, next) => {
  const user = req.session.currentUser;
  const { title, message, category } = req.body;

  Topic.create({ title, message, creator: user, category, vote: 0 })
    .then(newTopic => {
      res.status(201).json(newTopic);
      User.findByIdAndUpdate(
        user,
        { $push: { topics: newTopic } },
        { new: true }
      )
        .then(response => {
          console.log("response");
        })
        .catch(err => console.log("error timeeeee", err));
    })
    .catch(err => {
      res
        .status(500) // Internal Server Error
        .json(err);
    });
});

// GET 'myTopics'    => to get all the topics related to the authenticated user
router.get("/mytopics", isLoggedIn, (req, res, next) => {
  const user = req.session.currentUser._id;

  if (!mongoose.Types.ObjectId.isValid(user)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  User.findById(user)

    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      res
        .status(500) // Internal Server Error
        .json(err);
    });
});

// GET 'mytopics/:id'    => to get all the topics related to the authenticated user
router.get("/mytopics/:id", isLoggedIn, (req, res, next) => {
  const { userID } = req.session.currentUser._id;
  const { id } = req.params;

  Topic.findById(id)
    .populate("comments creator favorites")
    .then(topic => {
      res.status(200).json(topic);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// GET 'mycomments'    => to get all the comments related to the authenticated user
router.get("/mycomments", isLoggedIn, async (req, res, next) => {
  const user = req.session.currentUser;

  try {
    const userObj = await User.findById(user).populate("comments");

    res.status(200).json(userObj.comments);
  } catch (err) {
    res
      .status(500) // Internal Server Error
      .json(err);
  }
});

// PUT '/mycomments/:id/edit'   => to update one topic
router.delete("/mycomments/:id/delete", isLoggedIn, async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  try {
    const removedComment = await Comment.findByIdAndRemove(id);
    await Topic.findByIdAndUpdate(
      removedComment.topic,
      { $pull: { comments: id } },
      { new: true }
    ).populate("comments");
    await User.findByIdAndUpdate(
      userId,
      { $pull: { comments: id } },
      { new: true }
    ).populate("comments");

    res
      .status(202)
      .json({ message: `Comment with ${id} removed successfully.` });
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST '/topic/:id/comment    => to post a new comment on specific topic
router.post("/topic/:id/comment", isLoggedIn, (req, res, next) => {
  const user = req.session.currentUser._id;
  const { id } = req.params;
  const { message } = req.body;

  // const arr = id.comments.push(newComment)

  Comment.create({ message, user, topic: id, vote: 0 })
    .then(newComment => {
      console.log("add comment works");
      console.log(newComment);
      res.status(201).json(newComment);

      Topic.findByIdAndUpdate(
        id,
        { $push: { comments: newComment } },
        { new: true }
      )
        .then(response => {
          console.log("response");
        })
        .catch(err => {
          res.status(500).json(err);
        });

      User.findByIdAndUpdate(
        user,
        { $push: { comments: newComment } },
        { new: true }
      )
        .then(data => console.log(data))
        .catch(err => res.status(500).json(err));
    })
    .catch(err => {
      res
        .status(500) // Internal Server Error
        .json(err);
    });
});

// PUT '/mytopics/:id/edit'   => to update one topic
router.put("/mytopics/:id/edit", isLoggedIn, (req, res) => {
  const { _id } = req.session.currentUser;

  User.findById({ _id })
    .populate("topic")
    .then(user => {
      // console.log('USER.TOPIC', user.topics);

      const { id } = req.params;

      Topic.findByIdAndUpdate(id, req.body)
        .then(topic => {
          res.status(201).json(topic);
        })
        .catch(err => console.log(err));
    })
    .catch(err => {
      res
        .status(500) // Internal Server Error
        .json(err);
    });
});

// GET '/profile/:id'    => Display profile page
router.get("/profile", isLoggedIn, (req, res, next) => {
  const id = req.session.currentUser._id;

  User.findById(id)
    .populate("comments topics")
    .then(user => {
      console.log("USERRRRRR", user);
      res.status(200).json(user);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// PUT '/profile/:id/edit'     => edit user profile
router.put("/profile/edit", isLoggedIn, (req, res, next) => {
  const id = req.session.currentUser._id;
  const { username, description } = req.body;

  User.findByIdAndUpdate(id, { username, description }, { new: true })
    .then(user => {
      console.log('USER', user);
      res.status(201).json(user);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// PUT '/topic/:id/vote         => upvote topic
router.put("/topic/:id/vote", isLoggedIn, async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  try {
    await Topic.findByIdAndUpdate(
      id,
      { $inc: { vote: +1 } }, 
      { new: true }
    )
    await User.findByIdAndUpdate(userId, { $push: {upVotes: id}}, {new: true})
    await User.findByIdAndUpdate(userId, { $pull: {downVotes: id}}, {new: true})
    res.status(202).json({ message: `Topic with ${id} upVoted.` });
  } catch (error) {
    res.status(500).json(err);
  }
});

// Cancel user upvote
router.put("/topic/:id/cancelupvote", isLoggedIn, async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  try {
    await Topic.findByIdAndUpdate(
      id,
      { $inc: { vote: -1 } },
      { new: true }
    )

    await User.findByIdAndUpdate(userId, { $pull: {upVotes: id}}, {new: true})
    res.status(202).json({ message: `Topic with ${id} downVoted.` });
  } catch (error) {
    res.status(500).json(err);
  }
});

// PUT '/topic/:id/downvote         => downVote topic
router.put("/topic/:id/downvote", isLoggedIn, async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  try {
    await Topic.findByIdAndUpdate(
      id,
      { $inc: { vote: -1 } },
      { new: true }
    )

    await User.findByIdAndUpdate(userId, { $push: {downVotes: id}}, {new: true})
    await User.findByIdAndUpdate(userId, { $pull: {upVotes: id}}, {new: true})
    res.status(202).json({ message: `Topic with ${id} downVoted.` });
  } catch (error) {
    res.status(500).json(err);
  }
});

// Cancel user downVote
router.put("/topic/:id/canceldownvote", isLoggedIn, async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  try {
    await Topic.findByIdAndUpdate(
      id,
      { $inc: { vote: +1 } },
      { new: true }
    )

    await User.findByIdAndUpdate(userId, { $pull: {downVotes: id}}, {new: true})
    res.status(202).json({ message: `Topic with ${id} downVoted.` });
  } catch (error) {
    res.status(500).json(err);
  }
});

// DELETE => to delete your topic
router.delete("/mytopics/:id/delete", isLoggedIn, async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  try {
    const removedTopic = await Topic.findByIdAndRemove(id);
    User.findByIdAndUpdate(userId, { $pull: { topics: id } }, { new: true })
      .populate("topics")
      .then(user => console.log("user", user));
    res.status(202).json({ message: `Topic with ${id} removed successfully.` });
  } catch (err) {
    res.status(500).json(err);
  }
});

// // DELETE => to delete your favorited topic
router.patch("/topics/:id/remove", isLoggedIn, async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  try {
    User.findByIdAndUpdate(userId, { $pull: { favorites: id } }, { new: true })
      .populate("topics")
      .then(user => console.log("user", user));
    res.status(202).json({ message: `Topic with ${id} removed successfully.` });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE => to delete your profile
router.delete("/profile", isLoggedIn, async (req, res, next) => {
  const user = req.session.currentUser._id;

  try {
    User.findByIdAndRemove(user);
    res
      .status(205)
      .json({ message: `Profile with ${user} removed successfully.` });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get => to get a specific topic
router.get("/topics/:id", isLoggedIn, (req, res, next) => {
  const { id } = req.params;

  Topic.findById(id)
    .populate("creator comments")
    .then(topic => {
      res.status(200).json(topic);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// PUT '/favorites  add topics to your favorites
router.patch("/favorites/add/:id", isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  const userID = req.session.currentUser;

  try {
    await User.findByIdAndUpdate(
      userID,
      { $push: { favorites: id } },
      { new: true }
    );

    res
      .status(202)
      .json({ message: `Topic with ${id} added to favorites successfully.` });
  } catch (error) {
    res.status(500).json(err);
  }
});

router.get("/favorites", isLoggedIn, async (req, res, next) => {
  const userID = req.session.currentUser;

  try {
    const user = await User.findById(userID).populate("favorites");
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json(err);
  }
});

// GET '/home'		 => to get all the topics in home
router.get("/home", isLoggedIn, (req, res, next) => {
  Topic.find()
    .populate("comments creator")
    .then(allTheTopics => {
      res.status(200).json(allTheTopics);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

module.exports = router;
