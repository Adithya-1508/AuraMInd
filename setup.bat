@echo off
echo [SOCGuard] Initializing Environment Setup...

echo.
echo [1/3] Backend Setup...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo.
echo [2/3] Frontend Setup...
cd frontend
npm install
cd ..

echo.
echo [3/3] Ollama Check...
echo Ensure Ollama is running and Llama3 is pulled:
echo 'ollama pull llama3'

echo.
echo Setup Complete!
echo To run backend: cd backend ^&^& uvicorn main:app --reload
echo To run frontend: cd frontend ^&^& npm run dev
pause
