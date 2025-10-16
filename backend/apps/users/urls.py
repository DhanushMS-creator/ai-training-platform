from django.urls import path
from . import views
from . import avatar_views

urlpatterns = [
    path('register/', views.register_trainee, name='register-trainee'),
    path('trainees/', views.TraineeListCreateView.as_view(), name='trainee-list'),
    path('trainees/<int:pk>/', views.TraineeDetailView.as_view(), name='trainee-detail'),
    path('sessions/<int:session_id>/', views.session_detail, name='session-detail'),
    path('sessions/<int:session_id>/status/', views.update_session_status, name='update-session-status'),
    path('sessions/<int:session_id>/livekit-token/', views.get_livekit_token, name='get-livekit-token'),
    path('sessions/<int:session_id>/avatar-greeting/', avatar_views.generate_avatar_greeting, name='generate-avatar-greeting'),
    path('avatar-status/<str:job_id>/', avatar_views.check_avatar_status, name='check-avatar-status'),
]