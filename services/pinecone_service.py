import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from services.embed_service import get_embed_function

load_dotenv()

def get_pinecone_store():
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME", "enterprise-rag")
    if not api_key:
        raise RuntimeError("PINECONE_API_KEY is missing. Add it to your .env file.")
    client = Pinecone(api_key=api_key)
    index = client.Index(index_name)
    return PineconeVectorStore(index=index, embedding=get_embed_function())
