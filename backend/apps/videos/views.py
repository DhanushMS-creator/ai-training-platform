from django.shortcuts import render
from rest_framework import viewsets
from .models import Video
from .serializers import VideoSerializer

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        # Add any custom filtering logic here if needed
        return queryset

    def perform_create(self, serializer):
        serializer.save()  # You can add custom logic before saving if needed

    def perform_update(self, serializer):
        serializer.save()  # You can add custom logic before updating if needed

    def perform_destroy(self, instance):
        instance.delete()  # You can add custom logic before deleting if needed