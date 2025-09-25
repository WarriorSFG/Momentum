const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcryptjs = require('bcryptjs')
require('dotenv').config()
const cors = require('cors')

const port = process.env.PORT
const URL = process.env.MONGOURL
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
mongoose.connect(URL)
const db = mongoose.connection
db.once('open', () => {
  console.log("MongoDB connect successful")
})
db.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

// ====== Schemas ======
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
})

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: Number,
  category: { type: String, enum: ["Very easy", "Easy", "Moderate", "Difficult"] },
  chapter: String,
  subject: String
})

const testSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  testdate: { type: Date, default: Date.now },
  score: Number,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  answers: [Number]
});

const practiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  questionID: String,
  correct: Boolean,
  timeTaken: { type: Number, required: true }
});

const User = mongoose.model("User", userSchema)
const Question = mongoose.model("Question", questionSchema)
const Test = mongoose.model("Test", testSchema)
const Practice = mongoose.model("Practice", practiceSchema)

// ====== Middleware ======
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(403).json({ error: 'Token required' })

  const token = authHeader.split(' ')[1]
  if (!token) return res.status(403).json({ error: 'Token required' })

  jwt.verify(token, process.env.KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' })
    req.user = decoded
    next()
  })
}

// ====== Auth Routes ======
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body
    const existing = await User.findOne({ username })
    if (existing) return res.status(409).json({ error: 'username already used' })

    const hashed = await bcryptjs.hash(password, 10)
    await User.create({ username, password: hashed })
    res.status(201).json({ message: 'Account created' })
  } catch (err) {
    res.status(400).json({ error: 'Bad request' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) return res.status(401).json({ error: 'Incorrect credentials' })

    const match = await bcryptjs.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Incorrect credentials' })

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.KEY)
    res.json({ message: "Success", token })
  } catch (err) {
    res.status(400).json({ error: 'Bad request' })
  }
})

// ====== Stats ======
app.get('/stats', verifyToken, async (req, res) => {
  try {
    const tests = await Test.find({ user: req.user.id })
    const practices = await Practice.find({ user: req.user.id })

    // From tests
    const testTotal = tests.reduce((a, t) => a + t.questions.length, 0)
    const testCorrect = tests.reduce((a, t) => a + (t.score || 0), 0)
    const testIncorrect = testTotal - testCorrect

    // From practice
    const practiceTotal = practices.length
    const practiceCorrect = practices.filter(p => p.correct).length
    const practiceIncorrect = practiceTotal - practiceCorrect

    // Combined
    const totalQ = testTotal + practiceTotal
    const correct = testCorrect + practiceCorrect
    const incorrect = testIncorrect + practiceIncorrect

    res.json({
      message: "success",
      questions: { total: totalQ, correct, incorrect },
      teststaken: tests.length,
      skills: {
        listening: 25, grasping: 25, retention: 25, application: 25 // placeholder
      }
    })
  } catch {
    res.status(400).json({ error: 'Bad request' })
  }
})


// ====== Start Test ======
app.post('/teststart', verifyToken, async (req, res) => {
  try {
    const { subject, chapters } = req.body;
    const questions = await Question.find({ subject, chapter: { $in: chapters } }).limit(10);

    const test = await Test.create({
      user: req.user.id,
      questions: questions.map(q => q._id),
      score: 0,
      answers: []
    });
    res.json({ message: "success", testID: test._id, questions });
  } catch {
    res.status(400).json({ error: 'Bad request' });
  }
});

// ====== Submit Test ======
app.post('/testsubmit', verifyToken, async (req, res) => {
  try {
    const { testID, answers } = req.body
    const test = await Test.findById(testID)
    if (!test) return res.status(400).json({ error: 'Invalid testID' })

    let score = 0
    test.questions.forEach((q, i) => {
      if (answers[i] === q.answer) score++
    })

    test.answers = answers
    test.score = score
    await test.save()

    res.json({ message: "success" })
  } catch {
    res.status(400).json({ error: 'Bad request' })
  }
})

// ====== Practice Question ======
app.post('/practicequestion', verifyToken, async (req, res) => {
  try {
    const { subject, chapters } = req.body

    // 1. Get the current user's solved question IDs
    const user = await User.findById(req.user.id).select('solvedQuestions')
    const solvedIds = user ? user.solvedQuestions : []

    // 2. Find a question that is NOT IN the user's solved list
    const q = await Question.findOne({
      subject,
      chapter: { $in: chapters },
      _id: { $nin: solvedIds } // Exclude solved questions
    })

    // Handle case where all questions are solved
    if (!q) {
      return res.json({ message: "You've answered all available questions!" })
    }

    res.json({
      questionID: q._id,
      question: q.question,
      options: q.options
    })
  } catch (err) { //log the error
    console.error(err)
    res.status(400).json({ error: 'Bad request' })
  }
})

// ====== Practice Submit ======
app.post('/practicesubmit', verifyToken, async (req, res) => {
  try {
    // 1. Destructure timeTaken from the request body
    const { questionID, answer, timeTaken } = req.body;

    // Optional but recommended: check if timeTaken was provided
    if (timeTaken === undefined) {
      return res.status(400).json({ error: 'timeTaken is a required field.' });
    }

    const q = await Question.findById(questionID);
    if (!q) return res.status(400).json({ error: 'Invalid questionID' });

    const correct = (answer === q.answer);

    // 2. Include timeTaken when creating the practice record
    await Practice.create({
      user: req.user.id,
      questionID,
      correct,
      timeTaken // Save the time taken here
    });

    if (correct) {
      await User.updateOne(
        { _id: req.user.id },
        { $addToSet: { solvedQuestions: questionID } }
      );
    }

    res.json({
      correct,
      correctAnswer: q.answer
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Bad request' });
  }
});

// ====== Test History ======
app.get('/testhistory', verifyToken, async (req, res) => {
  try {
    const history = await Test.find({ user: req.user.id }).select("testdate score")
    res.json(history)
  } catch {
    res.status(400).json({ error: 'Bad request' })
  }
})

// ====== Test Review ======
app.get('/testreview/:testId', verifyToken, async (req, res) => {
  const test = await Test.findById(req.params.testId)
    .populate('questions'); // This swaps the IDs with the full question objects

  res.json(test);
});

app.listen(port, () => {
  console.log(`server started, listening to port ${port}`)
})
