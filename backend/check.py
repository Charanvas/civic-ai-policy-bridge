"""
Script to check available Gemini models
"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

print("🔍 Checking available Gemini models...\n")
print("="*60)

try:
    models = genai.list_models()
    
    print("\n✅ Available models that support generateContent:\n")
    
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            print(f"📝 Model: {model.name}")
            print(f"   Display Name: {model.display_name}")
            print(f"   Description: {model.description}")
            print(f"   Supported methods: {model.supported_generation_methods}")
            print("-"*60)
    
    print("\n💡 Recommended models:")
    print("   - gemini-1.5-flash (Fast, efficient)")
    print("   - gemini-1.5-pro (Most capable)")
    print("   - gemini-pro (Legacy, may be deprecated)")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\n💡 Troubleshooting:")
    print("   1. Check your API key in .env file")
    print("   2. Ensure you have google-generativeai installed")
    print("   3. Visit: https://ai.google.dev/gemini-api/docs/models")