from flask import Flask, request, jsonify
import joblib

# Load your trained model
try:
    model = joblib.load('skill_classifier.joblib')
    print("✅ Model loaded successfully.")
except FileNotFoundError:
    print("❌ Error: 'skill_classifier.joblib' not found. Make sure the file is in the same directory.")
    exit()

# Create the Flask app
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        question_text = data.get('question')
        
        if not question_text:
            return jsonify({"error": "Question text is required"}), 400

        # The model expects a list of strings
        prediction = model.predict([question_text])
        
        # Return the prediction as JSON
        return jsonify({"skill_tested": prediction[0]})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(port=5000)