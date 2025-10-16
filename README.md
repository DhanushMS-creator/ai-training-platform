# AI Training Platform

## Overview
The AI Training Platform is a web application designed to facilitate online training through a combination of video content, assessments, and user interaction. The platform consists of a Django backend and a React frontend, providing a robust and scalable solution for managing training courses and user registrations.

## Project Structure
The project is organized into two main directories: `backend` and `frontend`.

### Backend
The backend is built using Django and includes the following components:
- **manage.py**: Command-line utility for managing the Django project.
- **config/**: Contains configuration files for the Django project.
  - **settings.py**: Project settings and configurations.
  - **urls.py**: URL routing for the application.
  - **wsgi.py**: Entry point for WSGI-compatible web servers.
  - **asgi.py**: Entry point for ASGI-compatible web servers.
- **apps/**: Contains the main application logic, divided into several modules:
  - **users/**: Manages user registration and profiles.
  - **courses/**: Handles course-related data and views.
  - **videos/**: Manages video content and playback.
  - **assessments/**: Handles multiple-choice questions and assessments.

### Frontend
The frontend is built using React and includes the following components:
- **public/index.html**: Main HTML file for the React application.
- **src/**: Contains the source code for the React application.
  - **components/**: Reusable components for the application.
    - **RegistrationForm/**: Component for user registration.
    - **AvatarGreeting/**: Component for displaying a greeting from an AI avatar.
    - **VideoPlayer/**: Component for video playback.
    - **MCQFlow/**: Component for displaying multiple-choice questions.
  - **pages/**: Contains different pages of the application.
    - **Home.tsx**: Home page component.
    - **Dashboard.tsx**: Dashboard page component.
    - **Training.tsx**: Training page component.
  - **services/**: Contains API service functions for backend communication.
  - **types/**: TypeScript types used throughout the application.

## Getting Started
To get started with the AI Training Platform, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd ai-training-platform
   ```

2. **Set up the backend**:
   - Navigate to the `backend` directory.
   - Install the required dependencies:
     ```
     pip install -r requirements.txt
     ```
   - Run the Django server:
     ```
     python manage.py runserver
     ```

3. **Set up the frontend**:
   - Navigate to the `frontend` directory.
   - Install the required dependencies:
     ```
     npm install
     ```
   - Start the React application:
     ```
     npm start
     ```

## Features
- User registration and profile management.
- Course management with video playback.
- Interactive assessments with multiple-choice questions.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.