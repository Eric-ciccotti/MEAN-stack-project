const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path")

const postsRoutes = require("./routes/posts");

const app = express();

mongoose
  .connect(
    "mongodb+srv://mimpaye:UAfOlJxSMDmNA54n@cluster0.thyg4.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to database :)");
  })
  .catch((e) => {
    console.log("Connection failed :(");
    console.log(e);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//autorisation d'accès au repertoire static
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);

module.exports = app;
