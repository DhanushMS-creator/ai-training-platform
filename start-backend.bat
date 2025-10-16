@echo off
title AI Training Platform - Backend Server

cd backend
call venv\Scripts\activate

echo ====================================
echo Starting Django Backend Server
echo ====================================
echo API available at: http://localhost:8000/api
echo Admin panel at: http://localhost:8000/admin
echo ====================================
echo.

python manage.py runserver
