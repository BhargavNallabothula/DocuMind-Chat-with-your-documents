from fastapi import UploadFile,HTTPException
import os
import uuid
from langchain_community.document_loaders import TextLoader,PyPDFLoader,Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from services.embed_service import get_embed_function
from services.pinecone_service import get_pinecone_store

UPLOAD_FOLDER="uploads"
ALLOWED_EXTENSIONS=[".pdf",".txt",".docx","doc"]

class FileService:
    async def upload_file(self,file_data:UploadFile):

        
        file_extension=os.path.splitext(file_data.filename)[1].lower()  

        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="only pdf,docx,doc and txt files are allowed")
        
        unique_file_name=f"{uuid.uuid4()}{file_extension}"
        os.makedirs(UPLOAD_FOLDER,exist_ok=True)
        file_final_path=os.path.join(UPLOAD_FOLDER,unique_file_name)
        with open(file_final_path,"wb") as f:
            f.write(await file_data.read())

        if file_extension==".pdf":
            loader=PyPDFLoader(file_final_path)
        elif file_extension==".docx":
            loader=Docx2txtLoader(file_final_path)
        else:
            loader=TextLoader(file_final_path)

        documents=loader.load()

        splitter=RecursiveCharacterTextSplitter(chunk_size=400,chunk_overlap=100)

        chunks=splitter.split_documents(documents)

        embeddings=get_embed_function()   
        chroma_db=Chroma(persist_directory="chromadb",collection_name="chat_with_files_db",embedding_function=embeddings)
        chroma_db.add_documents(chunks)

        return documents




    


    async def upload_file_with_pinecone(self,file_data:UploadFile):
        
            
            file_extension=os.path.splitext(file_data.filename)[1].lower()  
    
            if file_extension not in ALLOWED_EXTENSIONS:
                raise HTTPException(status_code=400, detail="only pdf,docx,doc and txt files are allowed")
            
            unique_file_name=f"{uuid.uuid4()}{file_extension}"
            os.makedirs(UPLOAD_FOLDER,exist_ok=True)
            file_final_path=os.path.join(UPLOAD_FOLDER,unique_file_name)
            with open(file_final_path,"wb") as f:
                f.write(await file_data.read())
    
            if file_extension==".pdf":
                loader=PyPDFLoader(file_final_path)
            elif file_extension==".docx":
                loader=Docx2txtLoader(file_final_path)
            else:
                loader=TextLoader(file_final_path)
    
            documents=loader.load()
    
            splitter=RecursiveCharacterTextSplitter(chunk_size=400,chunk_overlap=100)
    
            chunks=splitter.split_documents(documents)
    



            pinecone_db=get_pinecone_store()
            pinecone_db.add_documents(chunks)
    
            return documents




