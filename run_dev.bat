@echo off
echo ========================================================
echo   Starting TASKWEAVER (Backend + Frontend)
echo ========================================================

echo [1/2] Starting Backend API on http://localhost:8000...
start "TASKWEAVER Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting Frontend Vite on http://localhost:3000...
start "TASKWEAVER Frontend" cmd /k "cd frontend && npm run dev"

echo ========================================================
echo   Both services started!
echo   Web App:  http://localhost:3000
echo   API Docs: http://localhost:8000/api/docs
echo   Demo:     demo@taskweaver.app / password123
echo ========================================================
pause

