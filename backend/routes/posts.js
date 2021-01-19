//séparation des routes dans un autre fichier pour plus de clareté
// avec le express.Router() constructeur

const { FILE } = require("dns");
const express = require("express");
const multer = require("multer");
const router = express.Router();

const Post = require("../models/post");

const MIME_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg' : 'jpeg',
  'image/jpg' : 'jpg',
}

//multer : package qui nous permet de gérer les fichiers entrants dans les requêtes HTTP
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //validation si y a une erreur
    const  isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('_');
    const extension = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '_' + Date.now() + '.' + extension)
  },
});

router.post("", multer({storage: storage}).single("image"),(req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  console.log(url);
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: "Post added successfully",
      //on overide l'id
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  });
});

router.put("/:id", (req, res, next) => {
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content
  });
  Post.updateOne({ _id: req.params.id }, post).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });
});

router.get("", (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: documents
    });
  });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

router.delete("/:id", (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Post deleted!" });
  });
});

module.exports = router;
