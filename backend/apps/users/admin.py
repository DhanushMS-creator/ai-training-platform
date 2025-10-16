from django.contrib import admin
from .models import Trainee, TrainingSession

class TraineeAdmin(admin.ModelAdmin):
    list_display = ('name', 'job_title', 'industry', 'company', 'created_at')
    search_fields = ('name', 'job_title', 'industry', 'company')
    list_filter = ('industry', 'created_at')

class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = ('trainee', 'status', 'mcq_score', 'mcq_total', 'video_completed', 'started_at')
    list_filter = ('status', 'video_completed', 'started_at')
    search_fields = ('trainee__name', 'trainee__email')

admin.site.register(Trainee, TraineeAdmin)
admin.site.register(TrainingSession, TrainingSessionAdmin)