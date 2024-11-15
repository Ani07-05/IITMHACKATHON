from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import re

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST", "OPTIONS"]}})

# Configure Gemini API
genai.configure(api_key="AIzaSyCP0FQqIDaUGGKeNYiK2sDuGeRKg_Zx1GI")
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    data = request.json
    topic = data.get("topic")

    if not topic:
        return jsonify({"error": "No topic provided"}), 400

    try:
        prompt = f"""
        Generate 10 quiz questions about {topic}. 
        Each question should have a correct answer. 
        Format the response as a JSON array of objects, each with 'question' and 'correct_answer' keys.
        """
        
        response = model.generate_content(prompt)
        print("API Response:", response.text)  # Log the response for debugging

        # Remove backticks and language label (like ```json) using regex
        clean_response_text = re.sub(r"^```[a-zA-Z]*\n|\n```$", "", response.text.strip(), flags=re.MULTILINE)

        # Try to parse the response as JSON
        questions_and_answers = json.loads(clean_response_text)
        
        return jsonify({"questions_and_answers": questions_and_answers})
    except json.JSONDecodeError as jde:
        print(f"JSON decode error: {jde}")
        return jsonify({"error": "The response from the AI was not in JSON format"}), 500
    except Exception as e:
        print(f"Error generating questions: {e}")
        return jsonify({"error": "Failed to generate questions"}), 500

@app.route('/generate_feedback', methods=['POST'])
def generate_feedback():
    data = request.json
    quiz_content = data.get("quiz_content")

    if not quiz_content:
        return jsonify({"error": "No quiz content provided"}), 400

    try:
        # Parse the quiz_content string into a Python dictionary
        quiz_data = json.loads(quiz_content)
        
        # Create a formatted string for the AI prompt
        formatted_quiz = f"""
        Topic: {quiz_data['topic']}
        Questions and Answers:
        """
        for q, ua, ca in zip(quiz_data['questions'], quiz_data['user_answers'], quiz_data['correct_answers']):
            formatted_quiz += f"\nQ: {q}\nUser's Answer: {ua}\nCorrect Answer: {ca}\n"

        prompt = f"""
        Based on the following quiz results, provide feedback:
        {formatted_quiz}
        
        Format the response as a JSON object with the following structure:
        {{
            "strengths": ["strength1", "strength2", ...],
            "weaknesses": ["weakness1", "weakness2", ...],
            "recommendations": ["recommendation1", "recommendation2", ...],
            "performanceByTopic": [
                {{"subtopic": "subtopic1", "score": score1}},
                {{"subtopic": "subtopic2", "score": score2}},
                ...
            ],
            "overallScore": overall_score
        }}
        Ensure all scores are between 0 and 100.
        """
        
        response = model.generate_content(prompt)
        print("API Response (Feedback):", response.text)  # Log the response for debugging

        # Clean the response text
        clean_response_text = re.sub(r"^```[a-zA-Z]*\n|\n```$", "", response.text.strip(), flags=re.MULTILINE)
        
        feedback = json.loads(clean_response_text)  # Attempt to parse as JSON
        return jsonify({"feedback": feedback})
    except json.JSONDecodeError as jde:
        print("JSON decode error in feedback response:", jde)
        return jsonify({"error": "The response from the AI was not in valid JSON format"}), 500
    except Exception as e:
        print(f"Error generating feedback: {e}")
        return jsonify({"error": f"Failed to generate feedback: {str(e)}"}), 500

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    quiz_content = data.get("quiz_content")

    if not quiz_content:
        return jsonify({"error": "No quiz content provided"}), 400

    try:
        quiz_data = json.loads(quiz_content)
        
        formatted_quiz = f"""
        Topic: {quiz_data['topic']}
        Questions and Answers:
        """
        for q, ua, ca in zip(quiz_data['questions'], quiz_data['userAnswers'], quiz_data['correctAnswers']):
            formatted_quiz += f"\nQ: {q}\nUser's Answer: {ua}\nCorrect Answer: {ca}\n"

        prompt = f"""
        Based on the following quiz performance, predict the user's future performance:
        {formatted_quiz}
        
        Provide a prediction as a percentage (0-100) of how well the user is likely to perform in future quizzes on this topic.
        Return only the numeric value.
        """
        
        response = model.generate_content(prompt)
        print("API Response (Prediction):", response.text)  # Log the response for debugging

        # Extract the numeric prediction from the response
        prediction_match = re.search(r'\d+(\.\d+)?', response.text)
        if prediction_match:
            prediction = float(prediction_match.group())
            return jsonify({"prediction": prediction})
        else:
            return jsonify({"error": "Failed to generate a numeric prediction"}), 500
    except Exception as e:
        print(f"Error generating prediction: {e}")
        return jsonify({"error": f"Failed to generate prediction: {str(e)}"}), 500

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.json
    message = data.get("message")

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        response = model.generate_content(message)
        print("API Response (Chat):", response.text)  # Log the response for debugging

        return jsonify({"response": response.text})
    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({"error": f"Failed to generate response: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)