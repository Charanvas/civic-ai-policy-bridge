import google.generativeai as genai
import json
import time
from config import Config

# Configure Gemini
genai.configure(api_key=Config.GEMINI_API_KEY)

class GeminiClient:
    def __init__(self):
        # Use the latest stable Gemini models
        # Option 1: Fastest (Recommended for hackathons)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Option 2: Most capable (if you need better quality)
        # self.model = genai.GenerativeModel('gemini-2.5-pro')
        
        # Option 3: Latest aliases (always uses newest)
        # self.model = genai.GenerativeModel('gemini-flash-latest')
        
        # Updated embedding model
        self.embedding_model = 'models/text-embedding-004'
        
        print(f"✅ Initialized Gemini client with model: gemini-2.5-flash")
    
    def simplify_policy(self, text, reading_level='high_school'):
        """Simplify policy text to specified reading level"""
        level_prompts = {
            'elementary': 'elementary school (5th grade)',
            'middle_school': 'middle school (8th grade)',
            'high_school': 'high school (10th grade)',
            'college': 'college',
            'expert': 'expert/professional'
        }
        
        prompt = f"""You are an expert at making government policies accessible to citizens.

Please rewrite this policy document to be understandable at a {level_prompts.get(reading_level, 'high school')} reading level.

Requirements:
- Keep all important information and key points
- Use simple, clear language
- Explain technical terms in plain English
- Structure with clear headings and bullet points
- Make it engaging and easy to follow
- Maintain the original meaning and intent

Policy text:
{text}

Please provide the simplified version:"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Error simplifying policy: {str(e)}")
    
    def analyze_demographic_impacts(self, text):
        """Analyze policy impacts on different demographic groups"""
        prompt = f"""Analyze this policy document and identify how it impacts different demographic groups.

For each relevant demographic group, provide:
- Specific impact (positive, negative, or neutral)
- Key concerns they might have
- Potential benefits for them

Focus on these demographics: Students, Farmers, Business Owners, Senior Citizens, Parents, Women, Low-income families, Urban residents, Rural residents.

Policy text:
{text}

Please respond in JSON format like this:
{{
  "students": {{
    "impact": "positive/negative/neutral",
    "concerns": "specific concerns",
    "benefits": "specific benefits"
  }},
  "farmers": {{
    "impact": "positive/negative/neutral",
    "concerns": "specific concerns",
    "benefits": "specific benefits"
  }}
}}

Only include demographics that are actually affected by this policy. Provide a complete JSON response:"""
        
        try:
            response = self.model.generate_content(prompt)
            # Extract JSON from response
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return a structured error
            print(f"JSON Decode Error: {str(e)}")
            print(f"Response text: {response.text}")
            return {
                "general_public": {
                    "impact": "unclear",
                    "concerns": "Unable to parse demographic analysis",
                    "benefits": "Please review the policy manually"
                }
            }
        except Exception as e:
            raise Exception(f"Error analyzing demographic impacts: {str(e)}")
    
    def analyze_feedback(self, feedback_text, feedback_type):
        """Analyze individual citizen feedback"""
        prompt = f"""Analyze this citizen feedback about a policy:

Feedback Type: {feedback_type}
Feedback Text: "{feedback_text}"

Please analyze and return:
1. Sentiment: positive, negative, or neutral
2. Key points raised (maximum 3 points)
3. Category: economic, social, environmental, legal, implementation, or general

Respond in JSON format:
{{
  "sentiment": "positive/negative/neutral",
  "key_points": ["point 1", "point 2", "point 3"],
  "category": "category_name"
}}"""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean markdown
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            return json.loads(response_text)
        except Exception as e:
            # Fallback response
            print(f"Error analyzing feedback: {str(e)}")
            return {
                "sentiment": "neutral",
                "key_points": [feedback_text[:100]],
                "category": "general"
            }
    
    def generate_insights(self, feedbacks):
        """Generate insights from all feedback"""
        # Prepare feedback summary
        feedback_summary = ""
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        
        for fb in feedbacks:
            sentiment_counts[fb.get('sentiment', 'neutral')] += 1
            feedback_summary += f"- [{fb.get('sentiment')}] {fb.get('feedback_text')}\n"
        
        # Limit feedback summary to avoid token limits
        if len(feedback_summary) > 5000:
            feedback_summary = feedback_summary[:5000] + "\n... (truncated)"
        
        prompt = f"""Based on this citizen feedback data about a policy, provide key insights:

Total Feedback: {len(feedbacks)}
Positive: {sentiment_counts['positive']}
Negative: {sentiment_counts['negative']}
Neutral: {sentiment_counts['neutral']}

Feedback Summary:
{feedback_summary}

Please analyze and provide:
1. Overall public sentiment trend
2. Top 3 concerns raised by citizens
3. Top 3 benefits citizens see
4. Recommendations for policymakers
5. Demographic groups most affected

Respond in JSON format:
{{
  "overall_sentiment": "description",
  "top_concerns": ["concern 1", "concern 2", "concern 3"],
  "top_benefits": ["benefit 1", "benefit 2", "benefit 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "most_affected_groups": ["group 1", "group 2"]
}}"""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean markdown
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            insights = json.loads(response_text)
            insights['sentiment_distribution'] = sentiment_counts
            return insights
        except Exception as e:
            print(f"Error generating insights: {str(e)}")
            return {
                "overall_sentiment": "Mixed feedback received",
                "top_concerns": ["Analysis in progress"],
                "top_benefits": ["Analysis in progress"],
                "recommendations": ["Collect more feedback for detailed analysis"],
                "most_affected_groups": ["General public"],
                "sentiment_distribution": sentiment_counts
            }
    
    def get_embeddings(self, text):
        """Get embeddings for text clustering"""
        try:
            result = genai.embed_content(
                model=self.embedding_model,
                content=text,
                task_type="clustering"
            )
            return result['embedding']
        except Exception as e:
            raise Exception(f"Error getting embeddings: {str(e)}")
    
    def list_available_models(self):
        """List all available Gemini models (for debugging)"""
        try:
            models = genai.list_models()
            available_models = []
            for model in models:
                if 'generateContent' in model.supported_generation_methods:
                    available_models.append(model.name)
            return available_models
        except Exception as e:
            return [f"Error listing models: {str(e)}"]
    
    # Add this method to the GeminiClient class

    def answer_policy_question(self, original_text, simplified_text, question):
        """Answer questions about a policy document"""
        
        try:
            # Use simplified text if available and shorter, otherwise use original
            if simplified_text and len(simplified_text) < len(original_text):
                policy_context = simplified_text
            else:
                policy_context = original_text
            
            # Limit context length to avoid token limits (Gemini 2.5 Flash has 1M token limit, but be conservative)
            max_context_length = 15000  # About 3750 words
            if len(policy_context) > max_context_length:
                # Take first part and last part to maintain context
                first_half = policy_context[:max_context_length//2]
                second_half = policy_context[-max_context_length//2:]
                policy_context = f"{first_half}\n\n...[Middle section omitted for brevity]...\n\n{second_half}"
            
            prompt = f"""You are a helpful AI assistant specializing in government policy analysis and explanation. 
    A citizen has a question about the following policy document.

    Policy Document:
    \"\"\"
    {policy_context}
    \"\"\"

    Citizen's Question: {question}

    Instructions:
    - Provide a clear, accurate, and helpful answer
    - Use simple, conversational language
    - Be concise but thorough (2-4 paragraphs maximum)
    - Cite specific parts of the policy when relevant
    - If the question cannot be answered from the policy text, say so clearly
    - Be friendly and encouraging
    - Use bullet points for lists when appropriate

    Answer:"""
            
            print("Sending request to Gemini...")
            
            # Generate response with safety settings
            response = self.model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.95,
                    'top_k': 40,
                    'max_output_tokens': 1024,
                }
            )
            
            print("Received response from Gemini")
            
            # Check if response has text
            if not response.text:
                return "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?"
            
            return response.text.strip()
            
        except Exception as e:
            print(f"Error in answer_policy_question: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Return a user-friendly error message
            return f"I apologize, but I encountered a technical issue: {str(e)}. Please try asking your question in a different way, or contact support if the problem persists."

    def extract_policy_title(self, text):
        """Extract a concise title from policy document"""
        
        # Use first 2000 characters for title extraction
        text_snippet = text[:2000] if len(text) > 2000 else text
        
        prompt = f"""Analyze this policy document and extract a clear, concise title (maximum 10 words).

    Policy Document (excerpt):
    {text_snippet}

    Requirements:
    - Maximum 10 words
    - Be specific and descriptive
    - Use official policy naming conventions
    - Do not include dates unless critical
    - Return ONLY the title, nothing else

    Title:"""
        
        try:
            response = self.model.generate_content(prompt)
            title = response.text.strip()
            
            # Clean up the title
            title = title.replace('"', '').replace("'", "").strip()
            
            # Limit to 100 characters
            if len(title) > 100:
                title = title[:97] + "..."
            
            return title
        except Exception as e:
            # Fallback: use first line or first 100 characters
            first_line = text.split('\n')[0].strip()
            if first_line and len(first_line) < 100:
                return first_line
            return text[:100].strip() + "..."