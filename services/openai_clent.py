import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

def ask_openai(prompt):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is missing. Add it to your .env file.")
    llm_client = ChatOpenAI(model=os.getenv("OPENAI_MODEL", "gpt-5.5"), api_key=api_key)
    return llm_client.invoke(prompt)
