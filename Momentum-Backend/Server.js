const express = require('express')
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcryptjs = require('bcryptjs')
require('dotenv').config()
const cors = require('cors')

const { questionTemplates } = require('./QuestionGenerator.js');
const port = process.env.PORT
const URL = process.env.MONGOURL
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
  origin: 'https://momentum-lime.vercel.app',
  credentials: true,
}));

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
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
})

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: Number,
  category: { type: String, enum: ["Very easy", "Easy", "Moderate", "Difficult"] },
  chapter: String,
  type: String,
  subject: String
})

const testSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  testdate: { type: Date, default: Date.now },
  score: Number,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  answers: [{
    answer: Number,
    timeTaken: Number,
    globalTime: Number,
    _id: false // Prevents Mongoose from adding a sub-document _id
  }]
});

const practiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  questionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
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

function verifyTokenFromHeaderOrQuery(req, res, next) {
  let token;
  const authHeader = req.headers['authorization'];

  // 1. Check for token in the Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  // 2. If not in header, check for it in the URL query parameter
  else if (req.query.token) {
    token = req.query.token;
  }

  // If no token is found in either place, deny access
  if (!token) {
    return res.status(403).json({ error: 'Token required' });
  }

  // Verify the token
  jwt.verify(token, process.env.KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

// ====== Auth Routes ======
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'All fields are required' })
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
    res.json({ message: "Success", token, username: user.username })
  } catch (err) {
    res.status(400).json({ error: 'Bad request' })
  }
})

// ====== Stats ======
app.get('/stats', verifyToken, async (req, res) => {
  try {
    const tests = await Test.find({ user: req.user.id });

    // 1. Fetch practices and populate the question's type field
    const practices = await Practice.find({ user: req.user.id })
      .populate({
        path: 'questionID',
        select: 'type'
      });

    // --- Basic Stats ---
    const totalQ = practices.length;
    const correct = practices.filter(p => p.correct).length;
    const incorrect = totalQ - correct;

    // --- Skill Calculation ---
    const skillCounts = {
      learning: { total: 0, correct: 0 },
      grasping: { total: 0, correct: 0 },
      application: { total: 0, correct: 0 }
    };

    // 2. Tally correct/total attempts for each skill
    practices.forEach(p => {
      // Use optional chaining in case a question was deleted
      const skill = p.questionID?.type;
      if (skill && skillCounts[skill]) {
        skillCounts[skill].total++;
        if (p.correct) {
          skillCounts[skill].correct++;
        }
      }
    });

    // 3. Calculate accuracy for each skill (0 to 1)
    const learningAcc = skillCounts.learning.total > 0 ? (skillCounts.learning.correct / skillCounts.learning.total) : 0;
    const graspingAcc = skillCounts.grasping.total > 0 ? (skillCounts.grasping.correct / skillCounts.grasping.total) : 0;
    const applicationAcc = skillCounts.application.total > 0 ? (skillCounts.application.correct / skillCounts.application.total) : 0;

    // 4. Normalize these accuracies to sum to 80 for the pie chart
    const totalAccuracySum = learningAcc + graspingAcc + applicationAcc;
    let learningScore = 0, graspingScore = 0, applicationScore = 0;

    if (totalAccuracySum > 0) {
      learningScore = (learningAcc / totalAccuracySum) * 80;
      graspingScore = (graspingAcc / totalAccuracySum) * 80;
      applicationScore = (applicationAcc / totalAccuracySum) * 80;
    }
    // --- Retention Calculation ---
    const practicesByQuestion = {};
    practices.forEach(p => {
      const qId = p.questionID?._id.toString();
      if (qId) {
        if (!practicesByQuestion[qId]) practicesByQuestion[qId] = [];
        practicesByQuestion[qId].push(p.correct);
      }
    });

    let totalRepeatedAttempts = 0;
    let correctRepeatedAttempts = 0;

    for (const qId in practicesByQuestion) {
      const attempts = practicesByQuestion[qId];
      // Only consider questions that were actually repeated
      if (attempts.length > 1) {
        totalRepeatedAttempts += attempts.length;

        // Count how many of those attempts were correct
        const correctCount = attempts.filter(isCorrect => isCorrect === true).length;
        correctRepeatedAttempts += correctCount;
      }
    }

    const retentionScore = totalRepeatedAttempts > 0
      ? (correctRepeatedAttempts / totalRepeatedAttempts) * 20
      : 0;
    res.json({
      message: "success",
      questions: { total: totalQ, correct, incorrect },
      teststaken: tests.length,
      skills: {
        learning: Math.round(learningScore),
        grasping: Math.round(graspingScore),
        application: Math.round(applicationScore),
        retention: Math.round(retentionScore)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Bad request' });
  }
});


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
    const { testID, answers } = req.body;

    // 1. Fetch the test data with questions populated.
    const test = await Test.findById(testID).populate('questions');
    if (!test) {
      return res.status(400).json({ error: 'Invalid testID' });
    }

    let score = 0;
    const practiceDocsToCreate = [];

    // 2. Loop through the populated questions to calculate score and prepare practice docs.
    test.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isAnswered = userAnswer && userAnswer.answer !== null;

      // Calculate score
      const isCorrect = isAnswered && userAnswer.answer === question.answer;
      if (isCorrect) {
        score++;
      }

      // If the question was answered, prepare a new practice document for it.
      if (isAnswered) {
        practiceDocsToCreate.push({
          user: req.user.id,
          questionID: question._id,
          correct: isCorrect,
          timeTaken: userAnswer.timeTaken
        });
      }
    });

    // 3. Save all new practice documents to the database with ONE command.
    if (practiceDocsToCreate.length > 0) {
      await Practice.insertMany(practiceDocsToCreate);
    }

    // 4. Update the test document with the score and answers.
    await Test.updateOne(
      { _id: testID },
      { $set: { answers: answers, score: score } }
    );

    res.json({ message: "success", score });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Bad request' });
  }
});

// ====== Get Filter Options ======
app.get('/practiceselect', async (req, res) => {
  try {
    // Create promises for each distinct query
    const subjectsPromise = Question.distinct('subject');
    const chaptersPromise = Question.distinct('chapter');
    const difficultiesPromise = Question.distinct('category');

    // Run all promises in parallel for better performance
    const [subjects, chapters, difficulties] = await Promise.all([
      subjectsPromise,
      chaptersPromise,
      difficultiesPromise
    ]);

    // Send the results back in a structured object
    res.json({
      subjects,
      chapters,
      difficulties
    });

  } catch (err) {
    console.error("Error fetching filters:", err);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

// ====== Practice Question ======
app.post('/practicequestion', verifyToken, async (req, res) => {
  try {
    // 1. Destructure the new 'difficulty' field from the body
    const { subject, chapters, difficulty } = req.body;

    // Get the current user's solved question IDs
    const user = await User.findById(req.user.id).select('solvedQuestions');
    const solvedIds = user ? user.solvedQuestions : [];

    // 2.The base query object
    const query = {
      subject,
      chapter: { $in: chapters },
      //_id: { nin: solvedIds }  right now, not excluding solved questions
    };

    // 3. If a difficulty is provided, add it to the query
    if (difficulty) {
      query.category = difficulty; // The schema field for difficulty is 'category'
    }

    // 4. Execute the query
    const qArr = await Question.aggregate([
      { $match: query },  // filter by subject, chapters, difficulty, unsolved
      { $sample: { size: 1 } }  // pick 1 random document
    ]);

    if (qArr.length === 0) {
      return res.json({ message: "No matching questions found!" });
    }

    const q = qArr[0];
    res.json({
      questionID: q._id,
      question: q.question,
      options: q.options
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Bad request' });
  }
});

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

// ====== Generate a New Question ======
app.post('/generatequestion', verifyToken, (req, res) => {
  try {
    // 2. Pick a random template function from the array
    const randomIndex = Math.floor(Math.random() * questionTemplates.length);
    const selectedTemplate = questionTemplates[randomIndex];

    // 3. Execute the selected function to generate the question
    const newQuestion = selectedTemplate();

    res.json(newQuestion);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate question.' });
  }
});

// ====== Leaderboard Route ======
app.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const leaderboardData = await Practice.aggregate([
      // 1. Filter for only correct answers
      { $match: { correct: true } },
      
      // 2. Group by user and count the number of correct answers
      { $group: {
          _id: '$user', // Group by the 'user' field
          correctAnswers: { $sum: 1 } // Count documents in each group
      }},
      
      // 3. Sort by the count in descending order
      { $sort: { correctAnswers: -1 } },
      
      // 4. Limit to the top 10 users
      { $limit: 10 },
      
      // 5. Look up the username from the 'users' collection
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData'
      }},
      
      // 6. Reshape the output to be cleaner
      { $project: {
          _id: 0, // Exclude the original _id
          username: { $arrayElemAt: ['$userData.username', 0] },
          score: '$correctAnswers'
      }}
    ]);

    res.json(leaderboardData);

  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
  }
});

async function getImageBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  // Convert the response to an ArrayBuffer, then to a Node.js Buffer
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ====== Generate Test Report PDF ======
app.get('/testreport/:testId', verifyTokenFromHeaderOrQuery, async (req, res) => {
  try {
    const { testId } = req.params;
    const username = req.user.username;

    // This part now uses the new fetch-based helper function
    const backgroundBuffer = await getImageBuffer('https://res.cloudinary.com/dvbzgoz9m/image/upload/v1759135128/background_ftyalo.jpg');
    const logoBuffer = await getImageBuffer('https://res.cloudinary.com/dvbzgoz9m/image/upload/v1759135127/logo_ybv5ad.png');

    // 1. Fetch the test data and populate the questions
    const test = await Test.findById(testId).populate('questions');
    if (!test || test.user.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Test not found or access denied.' });
    }
    //--- Calculate Time Analysis ---
    let timeCorrect = 0;
    let timeIncorrect = 0;
    let timeWasted = 0;

    test.questions.forEach((q, index) => {
      const userAnswerObj = test.answers[index];

      if (userAnswerObj && userAnswerObj.answer !== null) {
        if (userAnswerObj.answer === q.answer) {
          timeCorrect += userAnswerObj.timeTaken || 0;
        } else {
          timeIncorrect += userAnswerObj.timeTaken || 0;
        }
      } else {
        // Assumes time is tracked even for skipped questions, otherwise needs frontend change
        timeWasted += userAnswerObj?.timeTaken || 0;
      }
    });

    const totalTimeSpent = timeCorrect + timeIncorrect + timeWasted;

    const formatToMins = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins} min ${secs} sec`;
    };

    // 3. Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    /*doc.image(backgroundBuffer, 0, 0, {
      width: doc.page.width,
      height: doc.page.height
    });

    doc.image(logoBuffer, -50, -50, { width: 100 });*/

    // 4. Set headers to stream the PDF to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="test-report-${testId}.pdf"`);
    doc.pipe(res); //pip the pdf output directly to response

    const x = doc.page.width - 296 / 3 - 30;  // 20px margin from right
    const y = doc.page.height - 37 / 3 - 30; // 20px margin from bottom

    // 5. Define the function to add a background
    const addBackground = () => {
      doc.image(backgroundBuffer, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
        align: 'center',
        valign: 'center'
      });
      doc.roundedRect(20, 20, doc.page.width - 40, doc.page.height - 40, 10).fillColor('#E6E6FA').fill();
      doc.image(logoBuffer, x, y, { width: 296 / 3, height: 37 / 3 });
      // Set a default text color for the new page
      doc.fillColor('black');
    };

    // 6. Listen for the 'pageAdded' event
    doc.on('pageAdded', addBackground);

    // 7. Manually add the background to the FIRST page
    addBackground();
    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Test Report', { align: 'center' });
    doc.moveDown();

    // Test Details
    doc.fontSize(12);

    // For Test ID
    doc.font('Helvetica-Bold').text('Test ID: ', { continued: true });
    doc.font('Helvetica').text(test._id);

    // For Candidate Name
    doc.font('Helvetica-Bold').text('Candidate name: ', { continued: true });
    doc.font('Helvetica').text(username);

    // For Date
    doc.font('Helvetica-Bold').text('Date: ', { continued: true });
    doc.font('Helvetica').text(new Date(test.testdate).toLocaleDateString());

    // For Score
    const scoreColor = test.score / test.questions.length >= 0.6 ? 'green' : 'red';
    doc.font('Helvetica-Bold').text('Score: ', { continued: true });
    doc.font('Helvetica').fillColor(scoreColor).text(`${test.score} / ${test.questions.length}`);

    // Reset text color and move down
    doc.fillColor('black');
    doc.moveDown(2);

    // Question by Question Analysis
    doc.fontSize(16).font('Helvetica-Bold').text('Question Analysis');
    doc.moveDown();

    test.questions.forEach((q, index) => {
      const userAnswerObj = test.answers[index];
      const isCorrect = userAnswerObj?.answer === q.answer;
      doc.fillColor('black');
      doc.fontSize(12).font('Helvetica-Bold').text(`Question ${index + 1}: ${q.question}`);
      doc.font('Helvetica');

      q.options.forEach((option, i) => {
        let label = `${i + 1}. ${option}`;
        let color = 'black';

        if (i === userAnswerObj?.answer && isCorrect) {
          label += ' (Your Answer)';
          color = 'green';
        }
        else if (i === q.answer) {
          label += ' (Correct Answer)';
          color = '#c0b236';
        } else if (i === userAnswerObj?.answer && !isCorrect) {
          label += ' (Your Answer)';
          color = 'red';
        }

        doc.fillColor(color).text(label, { indent: 20 });
      });

      doc.moveDown();
      doc.fillColor('#751386').text(`Time Taken: ${userAnswerObj?.timeTaken || 0} seconds`);
      doc.fillColor('#751386').text(`Score: ${isCorrect ? 1 : 0}`);
      doc.moveDown();

    });

    doc.moveDown(2);
    doc.fontSize(16).font('Helvetica-Bold').text('Time Analysis');
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica');
    doc.text(`Total Allotted Time: 20 min 0 sec`);
    doc.font('Helvetica-Bold').text('Total Time Spent: ', { continued: true });
    doc.font('Helvetica').text(formatToMins(totalTimeSpent));

    doc.moveDown(1);

    // Detailed breakdown
    doc.fillColor('green').text(`Correctly Answered: ${formatToMins(timeCorrect)}`);
    doc.fillColor('red').text(`Incorrectly Answered: ${formatToMins(timeIncorrect)}`);
    doc.fillColor('gray').text(`Wasted: ${formatToMins(timeWasted)}`);

    doc.fillColor('black'); // Reset color
    doc.moveDown(2);
    // 8. Finalize the PDF
    doc.end();

  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: 'Failed to generate PDF report.' });
  }
});


app.listen(port, () => {
  console.log(`server started, listening to port ${port}`)
})
