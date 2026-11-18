from fastapi import APIRouter
from models.file_response import FileResponse
from fastapi import UploadFile,File
from services.file_service import FileService


file_router=APIRouter(prefix="/files")
file_service=FileService()

@file_router.post("/upload")
async def upload_file(file:UploadFile=File(...)):
    print(file)
    #documents=await file_service.upload_file(file)  # output :('Bhargav Service Desk Analyst (1)', '.pdf') this to to upload files in local db

    await file_service.upload_file(file)
    return FileResponse(filename=file.filename, message="file uploaded successfully")








