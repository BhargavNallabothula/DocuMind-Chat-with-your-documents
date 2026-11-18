# DocuMind — React UI served by FastAPI

The React frontend is built into static files and served by the same FastAPI application. After the one-time frontend build, you only need to start FastAPI.

## 1. Backend setup

From the `Genai_Project2` folder, create and activate a virtual environment, then install Python dependencies:

```bash
python -m venv venv
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Windows CMD:
# venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` in the project root using `.env.example` as a guide, then add a valid OpenAI API key. Do not commit `.env` or share it. If a key was exposed in an earlier archive, revoke it and create a new one.

## 2. Build the frontend (one-time, and again after frontend changes)

Install Node.js if it is not already installed. Then run:

```bash
cd frontend
npm install
npm run build
cd ..
```

This creates `frontend/dist`. FastAPI serves this folder automatically. You do not need to run `npm run dev` for normal use.

## 3. Start the whole application

From the project root (`Genai_Project2`):

```bash
uvicorn app:app --reload
```

Open **http://localhost:8000**. The API documentation remains available at **http://localhost:8000/docs**.

From now on, for normal use, only start the FastAPI server. Re-run `npm run build` inside `frontend` whenever you change the React UI.

## 4. Optional frontend development mode

If you are actively editing React components and want Vite hot reload, use two terminals:

Terminal 1 (project root):
```bash
uvicorn app:app --reload
```

Terminal 2 (`frontend` folder):
```bash
npm run dev
```

Open the Vite URL, normally http://localhost:5173.

## API endpoints

- `POST /files/upload` — multipart form field `file`
- `POST /chat` — JSON body `{ "user_message": "..." }`
- `GET /health` — basic application health check
