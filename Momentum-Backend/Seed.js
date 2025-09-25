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
  subject: String
})

const Question = mongoose.model('Question', questionSchema)

function letterToIndex(letter) {
  const map = { a: 0, b: 1, c: 2, d: 3 }
  return map[letter.toLowerCase()] ?? -1
}

async function seed() {
  const questions = []

  fs.createReadStream('Percentages.csv')
    .pipe(csv())
    .on('data', (row) => {
      const q = {
        question: row.question_text,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        answer: letterToIndex(row.answer),
        category: row.difficulty,
        chapter: row.tags,
        subject: "Quantitative Aptitude"
      }
      questions.push(q)
    })
    .on('end', async () => {
      try {
        await Question.insertMany(questions)
        console.log("✅ Inserted", questions.length, "questions successfully")
      } catch (err) {
        console.error("❌ Error inserting:", err)
      } finally {
        mongoose.connection.close()
      }
    })
}

seed()
