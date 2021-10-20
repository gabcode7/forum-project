const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb://localhost:27017/foroDB");

//Creamos el esquema de las respuestas
const answersSchema = new mongoose.Schema({
  title: String,
});

//Creamos Schema de las preguntas
const questionSchema = new mongoose.Schema({
  title: String,
  tags: String,
  answers: [answersSchema],
});

//Creamos el modelo de las preguntas
const Question = mongoose.model("questions", questionSchema);

//Creamos el modelo de las respuestas
const Answer = mongoose.model("answers", answersSchema);

//Metodos Question-dasboard
app.get("/", function (req, res) {
  Question.find({}, function (err, foundQuestions) {
    if (err) {
      console.log(err);
    } else {
      res.render("question-dashboard.ejs", { questions: foundQuestions });
    }
  });
});

//Metodos New Questions
app.get("/questions/new", function (req, res) {
  res.render("new-question.ejs");
});

app.post("/new-question", function (req, res) {
  const question = req.body.question;
  const tags = req.body.tags;

  const newQuestion = new Question({
    title: question,
    tags: tags,
    answers: [],
  });

  newQuestion.save();

  res.redirect("/");
});

//Metodos Respuestas
app.get("/questions/:id", function (req, res) {
  const id = req.params.id;
  console.log(id);
  Question.findOne({ _id: id }, function (err, foundQuestion) {
    if (err) {
      console.log(err);
    } else {
      res.render("answers.ejs", {
        question: foundQuestion,
        answersAr: foundQuestion.answers,
      });
    }
  });
});

app.post("/new-answer", function (req, res) {
  const title = req.body.answer;
  const idPregunta = req.body.idPregunta;

  const answer = new Answer({
    title: title,
  });

  answer.save();

  Question.findOne({ _id: idPregunta }, function (err, foundQuestion) {
    if (err) {
      console.log(err);
    } else {
      foundQuestion.answers.push(answer);
      foundQuestion.save();
      res.redirect("/questions/" + idPregunta);
    }
  });
});

//Iniciamos el servidor
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
