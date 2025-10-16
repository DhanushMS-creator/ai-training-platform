from django.db import models
from apps.users.models import TrainingSession


class MCQQuestion(models.Model):
    """Model for storing MCQ questions"""
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
    """Model to store trainee answers"""
    question = models.ForeignKey(MCQQuestion, on_delete=models.CASCADE, related_name='answers')
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='answers')
    selected_answer = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['question', 'session']
        ordering = ['answered_at']
    
    def __str__(self):
        return f"Answer for Q{self.question.id} - {'Correct' if self.is_correct else 'Incorrect'}"