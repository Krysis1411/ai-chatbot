import os
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Use the gemini-1.5-pro model as it's the standard for general tasks
model = genai.GenerativeModel('gemini-1.5-pro')

# Dictionary to store chat sessions in memory for simplicity
# In a real app, use a database or session storage
chat_sessions = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    session_id = data.get('session_id', 'default_session')
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
        
    try:
        # Get or create the chat session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = model.start_chat(history=[])
            
        chat_session = chat_sessions[session_id]
        
        # Send the message
        response = chat_session.send_message(message)
        
        return jsonify({
            'response': response.text
        })
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
