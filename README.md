# DocuMind — Chat with Your Documents

DocuMind is a document-question-answering application built with **FastAPI**, **React**, **LangChain**, **OpenAI**, and **ChromaDB**.

Upload PDF, DOCX, or TXT documents through the web interface, then ask questions about their content. The backend extracts the document text, splits it into chunks, creates embeddings, stores those chunks in a local Chroma vector database, and retrieves relevant content when answering questions.

## Features

- Upload PDF, DOCX, and TXT files from the React interface.
- Extract text from uploaded documents.
- Split extracted text into overlapping chunks.
- Generate embeddings using OpenAI embeddings.
- Store document chunks in a persistent local ChromaDB collection.
- Retrieve the three most relevant chunks for a question.
- Generate answers with an OpenAI chat model using the retrieved context.
- Serve the production React build from the FastAPI application.
- Interactive API documentation through Swagger UI.

## Technology Stack

| Area | Technology |
|---|---|
| Backend API | FastAPI |
| ASGI server | Uvicorn |
| Frontend | React |
| Frontend build tool | Vite |
| LLM integration | LangChain OpenAI |
| Embeddings | OpenAI Embeddings |
| Vector database | ChromaDB |
| Document loading | PyPDF, Docx2txt, TextLoader |
| Text splitting | LangChain RecursiveCharacterTextSplitter |

## Project Structure

```text
Genai_Project2/
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
│
├── config/
│   ├── llm_settings.py
│   └── settings.py
│
├── controller/
│   ├── chat_controller.py
│   └── files_controller.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── .env.example
│
├── models/
│   ├── chat_request.py
│   ├── chat_response.py
│   └── file_response.py
│
├── services/
│   ├── chat_service.py
│   ├── embed_service.py
│   ├── file_service.py
│   ├── openai_clent.py
│   ├── pinecone_service.py
│   ├── prompt_service.py
│   └── rag_service.py
│
└── uploads/              # Created when files are uploaded
└── chromadb/             # Created when document chunks are stored
```

## Prerequisites

Install the following before setting up the project:

- Python
- Node.js and npm
- An OpenAI API key with access to the configured chat and embedding models

## Setup and Installation

Run the following commands from the `Genai_Project2` project root.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Genai_Project2
```

If you already have the project on your computer, open its root folder in the terminal instead.

### 2. Create and activate a Python virtual environment

```bash
python -m venv venv
```

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**

```cmd
venv\Scripts\activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

### 3. Install backend dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root by copying `.env.example`.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Windows Command Prompt:**

```cmd
copy .env.example .env
```

**macOS/Linux:**

```bash
cp .env.example .env
```

Add your OpenAI API key to `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5
```

The application currently defaults to `gpt-5.5` when `OPENAI_MODEL` is not set. Use a model name available to your OpenAI account.

**Important:** Never commit `.env` or publish your API key. The `.gitignore` file excludes `.env`.

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

### 6. Build the React frontend

```bash
npm run build
```

This generates the `frontend/dist` directory. The FastAPI application is configured to serve the built frontend from this directory.

Return to the project root:

```bash
cd ..
```

## Run the Application

Make sure your Python virtual environment is activated. From the `Genai_Project2` root, start the backend:

```bash
python -m uvicorn app:app --reload
```

Open the application in your browser:

- **DocuMind UI:** http://localhost:8000
- **FastAPI Swagger documentation:** http://localhost:8000/docs
- **Health check:** http://localhost:8000/health

The `python -m uvicorn` form runs Uvicorn using the Python interpreter from the active environment.

> If you edit the React frontend, run `npm run build` again inside the `frontend` directory so the updated files are served by FastAPI.

## Frontend Development Mode (Optional)

If you are actively developing the React interface and want Vite's development server and hot reload, run the backend and frontend separately.

**Terminal 1 — project root:**

```bash
python -m uvicorn app:app --reload
```

**Terminal 2 — frontend directory:**

```bash
cd frontend
npm run dev
```

Open the Vite development URL shown in the terminal, usually http://localhost:5173.

The frontend uses `http://localhost:8000` as its API base URL during Vite development. For a different backend URL, set `VITE_API_BASE_URL` in the frontend environment.

## API Endpoints

### `GET /health`

Checks that the API is running and reports whether the frontend build directory exists.

Example response:

```json
{
  "status": "ok",
  "frontend_built": true
}
```

### `POST /files/upload`

Uploads and processes a document. The request must use `multipart/form-data` with a field named `file`.

The React interface currently allows:

- `.pdf`
- `.docx`
- `.txt`

The backend file service also contains `.doc` in its allowed-extension list, although the current frontend file picker does not offer `.doc`.

Successful upload response:

```json
{
  "filename": "example.pdf",
  "message": "file uploaded successfully"
}
```

### `POST /chat`

Sends a question to the document assistant. The request body is JSON:

```json
{
  "user_message": "What is this document about?"
}
```

The endpoint returns the assistant's answer as a string.

## How the RAG Workflow Works

The project uses Retrieval-Augmented Generation (RAG) to answer questions using uploaded document content.

1. **Upload:** The frontend sends the selected file to `POST /files/upload`.
2. **Save:** The backend saves the uploaded file in the local `uploads/` directory with a generated unique filename.
3. **Load:** A document loader extracts text from the PDF, DOCX, or TXT file.
4. **Split:** `RecursiveCharacterTextSplitter` divides the extracted content into chunks using a chunk size of `400` and an overlap of `100`.
5. **Embed:** OpenAI Embeddings converts the chunks into vectors.
6. **Store:** The vectors and document chunks are added to the persistent ChromaDB collection named `chat_with_files_db` in the `chromadb/` directory.
7. **Question:** The frontend sends the user's question to `POST /chat`.
8. **Retrieve:** The backend searches ChromaDB for the three most relevant chunks (`k=3`).
9. **Prompt:** The retrieved text and question are passed to the prompt builder. The prompt instructs the model to use only the supplied context and say when the answer is not available.
10. **Generate:** The OpenAI chat model generates the response and returns it to the frontend.

### Main backend responsibilities

- `controller/files_controller.py` — exposes the document upload endpoint.
- `controller/chat_controller.py` — exposes the chat endpoint.
- `services/file_service.py` — saves, loads, splits, embeds, and stores uploaded documents.
- `services/embed_service.py` — creates the OpenAI embedding function.
- `services/rag_service.py` — connects to the local ChromaDB collection.
- `services/chat_service.py` — retrieves relevant chunks and coordinates answer generation.
- `services/prompt_service.py` — builds the prompt using retrieved document content and the user's question.
- `services/openai_clent.py` — invokes the configured OpenAI chat model.

## Data Storage

The application creates these local directories when needed:

- `uploads/` — original uploaded files.
- `chromadb/` — persistent vector database data.

Both directories are excluded from Git by the supplied `.gitignore`. This means uploaded documents and the local vector database are not included when you push the source code to GitHub.

The current implementation uses the same ChromaDB collection (`chat_with_files_db`) for uploaded documents. Previously uploaded chunks remain in the persistent collection unless the collection/database is cleared or managed separately.

## Notes and Current Implementation Limitations

- The document list in the React sidebar is maintained in frontend state. It is not loaded from a backend document-list endpoint, so it does not automatically represent all documents already stored in ChromaDB after a page refresh.
- Removing a document from the sidebar only removes it from the current screen. The frontend explicitly informs the user that this does not delete the document from the backend knowledge base.
- Starting a new conversation clears the messages displayed in the browser; it does not clear uploaded files or ChromaDB.
- The chat endpoint retrieves from the shared ChromaDB collection. It does not currently filter retrieved chunks by a particular uploaded filename or user session.
- If no relevant documents are retrieved, the chat service returns `no relevant data found in knowledge base`.
- The frontend build must exist at `frontend/dist` for the UI to be served at `/`. Without it, the root endpoint returns a message explaining how to build the frontend; the API routes and `/docs` remain available.
- The Pinecone service is present as an alternative service module, but the active upload and retrieval flow shown in this project uses local ChromaDB.

## Troubleshooting

### `ModuleNotFoundError` when starting FastAPI

Activate the virtual environment and install the requirements:

```bash
python -m pip install -r requirements.txt
```

### `uvicorn` is not recognized

Run Uvicorn through the active Python interpreter:

```bash
python -m uvicorn app:app --reload
```

If Uvicorn is not installed in that environment:

```bash
python -m pip install uvicorn
```

### OpenAI API key is missing

Check that `.env` exists in the project root and contains a valid `OPENAI_API_KEY`.

### Frontend build not found

Build the React app:

```bash
cd frontend
npm install
npm run build
```

Then return to the project root and restart FastAPI.

### Frontend cannot connect to the backend in development mode

Make sure FastAPI is running at `http://localhost:8000`. The backend CORS configuration permits the Vite development origins `http://localhost:5173` and `http://127.0.0.1:5173`.

## Security

- Keep API keys and other credentials in `.env`.
- Do not commit `.env`, uploaded documents, virtual environments, `node_modules`, or generated database files.
- If an API key is accidentally committed or shared, revoke it and create a replacement.
