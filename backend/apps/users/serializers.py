from rest_framework import serializers
from .models import Trainee, TrainingSession


class TraineeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainee
        fields = ['id', 'name', 'email', 'job_title', 'industry', 'company', 'created_at']
        read_only_fields = ['id', 'created_at']


class TraineeRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainee
        fields = ['name', 'job_title', 'industry', 'company']
    
    def create(self, validated_data):
        trainee = Trainee.objects.create(**validated_data)
        # Create initial training session
        TrainingSession.objects.create(
            trainee=trainee,
            status='registration'
        )
        return trainee


class TrainingSessionSerializer(serializers.ModelSerializer):
    trainee_name = serializers.CharField(source='trainee.name', read_only=True)
    
    class Meta:
        model = TrainingSession
        fields = [
            'id', 'trainee', 'trainee_name', 'status', 'video_url', 
            'video_completed', 'mcq_score', 'mcq_total', 'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'started_at']