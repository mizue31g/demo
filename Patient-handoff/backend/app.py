import os
import requests
import json # Added import for json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True) # Initialize CORS to allow all origins for API routes

from google import genai
from google.genai import types

# Initialize genai client for Vertex AI with global location
_client = genai.Client(
    vertexai=True,
    project=os.getenv("GCP_PROJECT_ID"),
    location='global'
)



# --- Vertex AI Gemini Text Generation ---
def gemini_get_text_response(
    prompt_text: str,
            model_name: str = "gemini-3-flash-preview",    temperature: float = 0.4,
    max_output_tokens: int = 8192,
    top_p: float = 1.0,
    top_k: int = 32
):
    try:
        response = _client.models.generate_content(
            model=model_name,
            contents=types.Part.from_text(text=prompt_text),
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
                top_p=top_p,
                top_k=top_k,
                safety_settings=[
                    types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="OFF"
                    )
                ],
            ),
        )
        # Assuming the response object has a 'text' attribute for the generated content
        return response.candidates[0].content.parts[0].text
    except Exception as e:
        logger.error(f"Error in gemini_get_text_response: {e}")
        return None

@app.route('/api/generate_text', methods=['POST'])
def generate_text():
    data = request.json
    prompt = data.get('prompt')
    model_name = data.get('model_name', "gemini-3-flash-preview")
    temperature = data.get('temperature', 0.4)
    max_output_tokens = data.get('max_output_tokens', 8192)
    top_p = data.get('top_p', 1.0)
    top_k = data.get('top_k', 32)

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    # 日本語での応答を促す指示を追加
    prompt_with_lang_instruction = prompt + "\n\nすべての応答は日本語で行ってください。"

    response_text = gemini_get_text_response(
        prompt_text=prompt_with_lang_instruction,
        model_name=model_name,
        temperature=temperature,
        max_output_tokens=max_output_tokens,
        top_p=top_p,
        top_k=top_k
    )

    if response_text:
        return jsonify({"generated_text": response_text})
    else:
        return jsonify({"error": "Failed to generate text"}), 500

@app.route('/api/chat_with_document', methods=['POST'])
def chat_with_document():
    data = request.json
    document_content = data.get('documentContent')
    user_prompt = data.get('userPrompt')
    records = data.get('records', [])

    if not document_content or not user_prompt:
        return jsonify({"error": "documentContent and userPrompt are required"}), 400

    # The schema for the model's response
    response_schema = {
        "type": "object",
        "properties": {
            "chatResponse": {
                "type": "string",
                "description": "The conversational response to the user's prompt."
            },
            "updatedDocument": {
                "type": "string",
                "description": "If the user requested a change, this field contains the FULL, updated document text. If the user is only asking a question, this field should not be present in the response.",
            }
        },
        "required": ['chatResponse']
    }

    full_prompt = f"""
        CONTEXT:
        Here is the current medical handoff document:
        ---
        {document_content}
        ---

        USER'S REQUEST:
        "{user_prompt}"

        INSTRUCTIONS:
        1. Analyze the user's request.
        2. If the user is asking a question, answer it based *only* on the document context provided. Your answer should be in the 'chatResponse' field. Do not include the 'updatedDocument' field in your JSON response.
        3. If the user is asking to modify, edit, change, or rewrite the document, perform the change and return the ENTIRE, new version of the document in the 'updatedDocument' field. Your 'chatResponse' should be a brief confirmation, like "Done, I've updated the document."
        4. YOU MUST RESPOND IN THE PROVIDED JSON FORMAT.
        5. 全ての応答は日本語で行ってください。
    """
    try:
        response = _client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=types.Part.from_text(text=full_prompt),
            config=types.GenerateContentConfig(
                temperature=0.4,
                max_output_tokens=8192,
                top_p=1.0,
                top_k=32,
                response_mime_type="application/json", # Specify JSON response
                response_schema=response_schema,
                safety_settings=[
                    types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="OFF"
                    )
                ],                
            ),
        )
        # The response.text will contain the JSON string
        parsed_response = json.loads(response.candidates[0].content.parts[0].text)
        return jsonify(parsed_response)

    except Exception as e:
        logger.error(f"Error in chat_with_document: {e}")
        return jsonify({"error": f"Failed to chat with document: {e}"}), 500

@app.route('/api/modify_text', methods=['POST'])
def modify_text():
    data = request.json
    selected_markdown = data.get('selectedMarkdown')
    instruction = data.get('instruction')

    if not selected_markdown or not instruction:
        return jsonify({"error": "selectedMarkdown and instruction are required"}), 400

    prompt = f"""
        You are an AI text editor. A user has selected a piece of text from a medical document and provided an instruction. The text is in Markdown format.
        
        Selected Markdown Text:
        ---
        {selected_markdown}
        ---
        
        Instruction: "{instruction}"
        
        Your task is to rewrite the selected text based on the instruction, preserving the Markdown formatting (like **bold**, *italics*, and citations like [1], [2], etc.).
        IMPORTANT: 全ての応答は日本語で行ってください。Return ONLY the rewritten Markdown text, with no additional commentary or explanations.
    """

    try:
        response = _client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=types.Part.from_text(text=prompt),
            config=types.GenerateContentConfig(
                temperature=0.4,
                max_output_tokens=8192,
                top_p=1.0,
                top_k=32,
                safety_settings=[
                    types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="OFF"
                    )
                ],
            ),
        )
        return jsonify({"modified_text": response.candidates[0].content.parts[0].text})

    except Exception as e:
        logger.error(f"Error in modify_text: {e}")
        return jsonify({"error": f"Failed to modify text: {e}"}), 500

@app.route('/api/generate_audio', methods=['POST'])
def generate_audio():
    data = request.json
    text_content = data.get('text')

    if not text_content:
        return jsonify({"error": "Text content is required"}), 400

    try:
        response = _client.models.generate_content(
            model="gemini-1.5-flash-preview-0514-tts", # Using a TTS-specific model
            contents=[types.Part.from_text(text=text_content)],
            config=types.GenerateContentConfig(
                response_mime_type="audio/mpeg", # Requesting audio directly
                safety_settings=[
                    types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="OFF"
                    )
                ],
            ),
        )

        # The response.content will be bytes of the audio
        audio_bytes = response.content
        import base64
        base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
        return jsonify({"audio_content": base64_audio})

    except Exception as e:
        logger.error(f"Error in generate_audio: {e}")
        return jsonify({"error": f"Failed to generate audio: {e}"}), 500

@app.route('/api/generate_slides', methods=['POST'])
def generate_slides():
    data = request.json
    document_content = data.get('documentContent')

    if not document_content:
        return jsonify({"error": "Document content is required"}), 400

    response_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "points": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": ["title", "points"],
        },
    }

    prompt = f"""
        You are a helpful AI assistant for medical professionals.
        Your task is to analyze the provided medical handoff document and structure its key information into a presentation slide deck format.
        
        DOCUMENT CONTENT:
        ---
        {document_content}
        ---
        
        INSTRUCTIONS:
        1. Read through the entire document to understand the patient's case.
        2. Create a series of slides, where each slide has a clear, concise "title" and a list of "points" (bullet points).
        3. The points should be brief and summarize the most critical information for a verbal handoff.
        4. Create logical slides for topics like "Patient Overview", "Hospital Course", "Key Events", "Diagnoses & Plan", "Discharge Plan", etc.
        5. The final output must be a JSON array of slide objects, matching the provided schema. Do not include any other text or explanations.
        6. 全ての応答は日本語で行ってください。
    """

    try:
        response = _client.models.generate_content(
            model='gemini-3-pro-preview', # Using a more powerful model for better structuring
            contents=types.Part.from_text(text=prompt),
            config=types.GenerateContentConfig(
                temperature=0.4,
                max_output_tokens=8192,
                top_p=1.0,
                top_k=32,
                response_mime_type="application/json",
                response_schema=response_schema,
                safety_settings=[
                    types.SafetySetting(
                        category="HARM_CATEGORY_HATE_SPEECH",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold="OFF"
                    ),types.SafetySetting(
                        category="HARM_CATEGORY_HARASSMENT",
                        threshold="OFF"
                    )
                ],
            ),
        )
        parsed_response = json.loads(response.candidates[0].content.parts[0].text)
        return jsonify(parsed_response)

    except Exception as e:
        logger.error(f"Error in generate_slides: {e}")
        return jsonify({"error": f"Failed to generate slides: {e}"}), 500

# --- Health Check Endpoint ---
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

@app.errorhandler(Exception)
def handle_exception(e):
    # Log the error first
    logger.exception("An unhandled exception occurred:")
    # Return JSON instead of HTML for Flask errors
    response = jsonify({"error": "An internal server error occurred", "message": str(e)})
    response.status_code = 500
    return response

if __name__ == '__main__':
    # Use Gunicorn in production, Flask's development server for local testing
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))