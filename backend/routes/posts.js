//séparation des routes dans un autre fichier pour plus de clareté
// avec le express.Router() constructeur

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
      //c'est la réponse qu'on récupère dans le front après la création de l'objet
      //on oublie pas que dans le front c'est id et pas _id
      //le toObject() c'est pour convertir notre moogoose object, car le spread operator
      //ne fait pas la conversion et donne une copie de l'objet avec des propriétés qui ne nous servent à rien
      post: {
        ...createdPost.toObject(),
        id: createdPost._id
      }
    });

  });
});

router.put(
  "/:id",
  multer({storage: storage}).single("image"),
 (req, res, next) => {
   let imagePath = req.body.imagePath;
  // si quand on met a jour il y a une image, un nouveau "file"
  // sinon c'est egale au "body" qu'on récupère du front (imagePath: image) qui est une string
  if (req.file) {
    //on créer l'url
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  };
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  console.log(post);
  Post.updateOne({ _id: req.params.id }, post).then(result => {
    res.status(200).json({ message: "Update successful!" });
  });
});

router.get("", (req, res, next) => {
  //on oublie pas de convertir les string en number avec le +
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;

  //si il y a un deux ces deux paramètres alors on récupère uniquement ce dont on a besoin
  if(pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  //va me retourner le nombre de posts
  postQuery.then(documents => {
    fetchedPosts = documents;
    return Post.count();
  })
  .then(count => {
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: fetchedPosts,
      maxPosts: count
    });
  })
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
