

function generateDiscountProblem() {
  const price = Math.floor(Math.random() * 91) + 10; // 10-100
  const discountPercent = (Math.floor(Math.random() * 6) + 1) * 5; // 5%-30%
  const discountAmount = price * (discountPercent / 100);
  const finalPrice = price - discountAmount;

  const options = [
    finalPrice.toFixed(2),
    (price + discountAmount).toFixed(2),
    (price * 0.8).toFixed(2), // Generic 20% discount
  ];
  // Ensure we have 4 unique options
  while (options.length < 4) {
    options.push((finalPrice * (Math.random() * 0.5 + 0.75)).toFixed(2));
  }

  const shuffledOptions = [...new Set(options)].sort(() => Math.random() - 0.5);
  const correctAnswerIndex = shuffledOptions.indexOf(finalPrice.toFixed(2));

  return {
    question: `An item costs $${price}. With a ${discountPercent}% discount, what is the final price?`,
    options: shuffledOptions,
    answer: correctAnswerIndex,
  };
}

function generatePercentageOfNumberProblem() {
  const percentage = (Math.floor(Math.random() * 18) + 1) * 5; // 5%-90%
  const number = (Math.floor(Math.random() * 20) + 1) * 10; // 10-200
  const correctAnswer = (percentage / 100) * number;

  const options = [
    correctAnswer.toFixed(2),
    (correctAnswer * 1.2).toFixed(2), // 20% higher
    (correctAnswer * 0.8).toFixed(2), // 20% lower
    (percentage / 100) * (number * 1.1).toFixed(2) // Error in base number
  ];
  
  const shuffledOptions = [...new Set(options)].sort(() => Math.random() - 0.5);
  const correctAnswerIndex = shuffledOptions.indexOf(correctAnswer.toFixed(2));

  return {
    question: `What is ${percentage}% of ${number}?`,
    options: shuffledOptions,
    answer: correctAnswerIndex,
  };
}

// Created an array of template functions
const questionTemplates = [
  generateDiscountProblem,
  generatePercentageOfNumberProblem,
];

module.exports = { questionTemplates };