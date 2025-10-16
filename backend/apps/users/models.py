from django.db import models
from django.utils import timezone


class Trainee(models.Model):
    """Model to store trainee information"""
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    job_title = models.CharField(max_length=200)
    industry = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.job_title}"


class TrainingSession(models.Model):
    """Model to track training sessions"""
    STATUS_CHOICES = [
        ('registration', 'Registration'),
        ('greeting', 'Avatar Greeting'),
        ('video', 'Video Playback'),
        ('mcq', 'MCQ Exam'),
        ('feedback', 'Feedback'),
        ('qa', 'Q&A Session'),
        ('completed', 'Completed'),
    ]
    
    trainee = models.ForeignKey(Trainee, on_delete=models.CASCADE, related_name='sessions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registration')
    video_url = models.URLField(blank=True, null=True)
    video_completed = models.BooleanField(default=False)
    mcq_score = models.IntegerField(null=True, blank=True)
    mcq_total = models.IntegerField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Session {self.id} - {self.trainee.name} - {self.status}"