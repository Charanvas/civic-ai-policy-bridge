def __init__(self):
    # Use the most efficient model
    self.model = genai.GenerativeModel('gemini-2.5-flash')
    self.embedding_model = 'models/text-embedding-004'
    
    # Configure for lower memory usage
    self.generation_config = {
        'temperature': 0.3,
        'top_p': 0.95,
        'top_k': 40,
        'max_output_tokens': 2048,  # Reduced from unlimited
    }
    
    print(f"✅ Initialized Gemini client with model: gemini-2.5-flash")

def extract_policy_title(self, text):
    """Extract a concise title from policy document"""
    
    # Use only first 1000 characters for title extraction
    text_snippet = text[:1000] if len(text) > 1000 else text
    
    prompt = f"""Extract a clear, concise title (maximum 10 words) from this policy document.
Return ONLY the title, nothing else.

Policy excerpt:
{text_snippet}

Title:"""
    
    try:
        response = self.model.generate_content(
            prompt,
            generation_config=self.generation_config
        )
        title = response.text.strip()
        title = title.replace('"', '').replace("'", "").strip()
        
        if len(title) > 100:
            title = title[:97] + "..."
        
        return title
    except Exception as e:
        print(f"Error extracting title: {str(e)}")
        # Fallback: use first line or first 100 characters
        first_line = text.split('\n')[0].strip()
        if first_line and len(first_line) < 100:
            return first_line
        return text[:100].strip() + "..."

def simplify_policy(self, text, reading_level='high_school'):
    """Simplify policy text to specified reading level"""
    level_prompts = {
        'elementary': 'elementary school (5th grade)',
        'middle_school': 'middle school (8th grade)',
        'high_school': 'high school (10th grade)',
        'college': 'college',
        'expert': 'expert/professional'
    }
    
    # Limit text length to avoid memory issues
    max_length = 8000  # About 2000 words
    if len(text) > max_length:
        # Take important parts: beginning and end
        text = text[:max_length//2] + "\n\n[...content abbreviated...]\n\n" + text[-max_length//2:]
    
    prompt = f"""You are an expert at making government policies accessible to citizens.

Please rewrite this policy document to be understandable at a {level_prompts.get(reading_level, 'high school')} reading level.

Requirements:
- Keep all important information
- Use simple, clear language
- Explain technical terms
- Structure with clear headings and bullet points

Policy text:
{text}

Simplified version:"""
    
    try:
        response = self.model.generate_content(
            prompt,
            generation_config=self.generation_config
        )
        return response.text
    except Exception as e:
        print(f"Error simplifying policy: {str(e)}")
        raise Exception(f"Error simplifying policy: {str(e)}")

def analyze_demographic_impacts(self, text):
    """Analyze policy impacts on different demographic groups"""
    
    # Limit text length
    max_length = 6000
    if len(text) > max_length:
        text = text[:max_length] + "\n\n[...content abbreviated...]"
    
    prompt = f"""Analyze this policy and identify how it impacts different demographic groups.

For each relevant group, provide:
- Impact (positive/negative/neutral)
- Key concerns
- Potential benefits

Focus on: Students, Farmers, Business Owners, Senior Citizens, Parents, Women, Low-income families, Urban residents, Rural residents.

Policy text:
{text}

Respond in JSON format:
{{
  "students": {{
    "impact": "positive/negative/neutral",
    "concerns": "specific concerns",
    "benefits": "specific benefits"
  }}
}}

Only include demographics actually affected. Provide complete JSON:"""
    
    try:
        response = self.model.generate_content(
            prompt,
            generation_config=self.generation_config
        )
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
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {str(e)}")
        return {
            "general_public": {
                "impact": "unclear",
                "concerns": "Unable to parse analysis",
                "benefits": "Please review manually"
            }
        }
    except Exception as e:
        print(f"Error analyzing demographics: {str(e)}")
        return {}

def answer_policy_question(self, original_text, simplified_text, question):
    """Answer questions about a policy document"""
    
    try:
        # Use simplified text if available
        if simplified_text and len(simplified_text) < len(original_text):
            policy_context = simplified_text
        else:
            policy_context = original_text
        
        # Limit context length
        max_context_length = 10000
        if len(policy_context) > max_context_length:
            first_half = policy_context[:max_context_length//2]
            second_half = policy_context[-max_context_length//2:]
            policy_context = f"{first_half}\n\n...[Middle section omitted]...\n\n{second_half}"
        
        prompt = f"""You are a helpful AI assistant specializing in government policy analysis.

Policy Document:
{policy_context}

Citizen's Question: {question}

Instructions:
- Provide a clear, accurate answer
- Use simple language
- Be concise (2-3 paragraphs maximum)
- Cite specific parts when relevant
- If the question cannot be answered from the policy, say so clearly

Answer:"""
        
        response = self.model.generate_content(
            prompt,
            generation_config=self.generation_config
        )
        
        if not response or not response.text:
            return "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?"
        
        return response.text.strip()
        
    except Exception as e:
        print(f"Error answering question: {str(e)}")
        return f"I apologize, but I encountered a technical issue. Please try rephrasing your question or try again later."
