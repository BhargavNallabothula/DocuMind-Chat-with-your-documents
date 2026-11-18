import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings

load_dotenv()

def get_embed_function():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is missing. Add it to your .env file.")
    return OpenAIEmbeddings(api_key=api_key)
