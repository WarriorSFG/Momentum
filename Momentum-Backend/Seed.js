const mongoose = require('mongoose')
const fs = require('fs')
const csv = require('csv-parser')
require('dotenv').config()

mongoose.connect(process.env.MONGOURL, { useNewUrlParser: true, useUnifiedTopology: true })

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: Number, // 0,1,2,3
  category: { type: String, enum: ["Very easy", "Easy", "Moderate", "Difficult"] },
  chapter: String,
  type: String,
  subject: String
})

const Question = mongoose.model('Question', questionSchema)

function letterToIndex(letter) {
  const map = { a: 0, b: 1, c: 2, d: 3 }
  return map[letter.toLowerCase()] ?? -1
}

async function seed() {
  const stream = fs.createReadStream('Percentages.csv').pipe(csv());
  
  for await (const row of stream) {
    try {
      // Use native fetch to call the Python service
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: row.question_text })
      });

      // Fetch doesn't throw an error for 4xx/5xx responses, so you must check 'ok'
      if (!response.ok) {
        throw new Error(`Prediction service responded with status: ${response.status}`);
      }

      const predictionData = await response.json();
      const predictedSkill = predictionData.skill_tested;

      const q = {
        question: row.question_text,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        answer: letterToIndex(row.answer),
        category: row.difficulty,
        chapter: row.tags,
        subject: "Quantitative Aptitude",
        type: predictedSkill
      };
      
      await Question.updateOne(
        { question: q.question },
        { $set: q },
        { upsert: true }
      );

      console.log(`Processed: ${q.question.substring(0, 40)}... -> ${predictedSkill}`);

    } catch (err) {
      console.error(`❌ Error processing row: ${err.message}`);
    }
  }

  console.log("✅ Seeding process complete.");
  mongoose.connection.close();
}

seed();