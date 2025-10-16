from django.urls import path
from . import views

urlpatterns = [
    path('sessions/<int:session_id>/generate/', views.generate_questions, name='generate-questions'),
    path('sessions/<int:session_id>/auto-generate/', views.auto_generate_questions, name='auto-generate-questions'),
    path('sessions/<int:session_id>/questions/', views.get_questions, name='get-questions'),
    path('sessions/<int:session_id>/answer/', views.submit_answer, name='submit-answer'),
    path('sessions/<int:session_id>/submit/', views.submit_exam, name='submit-exam'),
]