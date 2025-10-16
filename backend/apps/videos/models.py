from django.db import models

class Video(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class VideoPlayback(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    user = models.ForeignKey('users.Trainee', on_delete=models.CASCADE)
    playback_position = models.DurationField(default=0)
    last_played = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.video.title} at {self.playback_position}"