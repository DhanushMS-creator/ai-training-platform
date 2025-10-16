from django.db import models

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Video(models.Model):
    course = models.ForeignKey(Course, related_name='videos', on_delete=models.CASCADE)
    video_url = models.URLField()
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

class MCQ(models.Model):
    course = models.ForeignKey(Course, related_name='mcqs', on_delete=models.CASCADE)
    question = models.TextField()
    options = models.JSONField()  # Store options as a JSON array
    correct_answer = models.CharField(max_length=255)

    def __str__(self):
        return self.question