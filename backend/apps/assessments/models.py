from django.db import models
from apps.users.models import TrainingSession


class GlobalMCQQuestion(models.Model):
    """Global question pool - generated once from PDF, shared across all sessions"""
    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_answer = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    explanation = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)  # Can deactivate bad questions
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Global MCQ Question'
        verbose_name_plural = 'Global MCQ Questions'
    
    def __str__(self):
        return f"Global Q{self.id}: {self.question_text[:50]}..."


class SessionQuestion(models.Model):
    """Links sessions to their randomly assigned questions"""
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='assigned_questions')
    question = models.ForeignKey(GlobalMCQQuestion, on_delete=models.CASCADE, related_name='sessions')
    order = models.IntegerField(default=0)  # Display order for this session
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['session', 'question']
        ordering = ['order']
    
    def __str__(self):
        return f"Session {self.session.id} - Question {self.question.id}"


class MCQQuestion(models.Model):
    """DEPRECATED - Keeping for backward compatibility, will be removed"""
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_answer = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    explanation = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Q{self.id}: {self.question_text[:50]}..."


class MCQAnswer(models.Model):
    """Model to store trainee answers - now references GlobalMCQQuestion"""
    question = models.ForeignKey(GlobalMCQQuestion, on_delete=models.CASCADE, related_name='answers')
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='answers')
    selected_answer = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['question', 'session']
        ordering = ['answered_at']
    
    def __str__(self):
        return f"Answer for Q{self.question.id} - {'Correct' if self.is_correct else 'Incorrect'}"
