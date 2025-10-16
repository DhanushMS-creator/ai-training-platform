@echo off
echo ====================================
echo AI Training Platform - Quick Setup
echo ====================================
echo.

echo [1/5] Setting up Backend...
cd backend

echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo [2/5] Setting up Database...
echo Creating migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo [3/5] Creating Django superuser...
echo Please create an admin account:
python manage.py createsuperuser

echo.
echo [4/5] Setting up Frontend...
cd ..\frontend

echo Installing Node dependencies...
call npm install

echo.
echo [5/5] Creating environment files...
cd ..

echo Creating backend .env file...
(
echo # AI API Keys
echo GOOGLE_API_KEY=AIzaSyAK7rRmCgSBS566bdHpuKkMT4MHbXLdvvo
echo BEY_API_KEY=sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w
echo BEY_AVATAR_ID=7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3
echo DEEPGRAM_API_KEY=8019ee1d1f98ef407fa5e87f32c61bc42a53376f
echo.
echo # LiveKit Configuration
echo LIVEKIT_URL=wss://ai-examiner-m7jzbdy9.livekit.cloud
echo LIVEKIT_API_KEY=APIikPxGbCUWKwf
echo LIVEKIT_API_SECRET=H7zTbkq4zLgSZDIxYMUnyzch0tmze6wAGxremXVg5wfB
) > backend\.env

echo Creating frontend .env file...
(
echo REACT_APP_API_URL=http://localhost:8000/api
) > frontend\.env

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo To start the application:
echo.
echo 1. Backend (in terminal 1):
echo    cd backend
echo    venv\Scripts\activate
echo    python manage.py runserver
echo.
echo 2. Frontend (in terminal 2):
echo    cd frontend
echo    npm start
echo.
echo 3. Access application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000/api
echo    Django Admin: http://localhost:8000/admin
echo.
echo ====================================
pause
