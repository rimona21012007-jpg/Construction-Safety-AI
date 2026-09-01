# CONSTRUCT-SAFE AI

## Project Overview
CONSTRUCT-SAFE AI is an AI-assisted construction-site visual inspection system that uses computer vision to detect workers, PPE, and equipment from site images. A configurable safety-rule engine analyzes the detections to identify potential PPE violations and selected visual hazards, then generates an interpretable inspection summary.

## Limitations
This is a prototype implementation (Phase 1). It uses a pre-trained YOLO model that detects general objects. Construction-specific PPE analysis requires a custom-trained model.

## Folder Structure
- `frontend/` - React Vite application
- `backend/` - FastAPI backend application

## Running the Application

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `.\venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
