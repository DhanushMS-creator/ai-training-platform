from rest_framework import serializers
from .models import MCQQuestion, MCQAnswer


class MCQQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQQuestion
        fields = [
            'id', 'question_text', 'option_a', 'option_b', 
            'option_c', 'option_d', 'explanation'
        ]
        # Don't expose correct_answer to frontend during exam


class MCQQuestionDetailSerializer(serializers.ModelSerializer):
    """Includes correct answer - only use for grading/feedback"""
    class Meta:
        model = MCQQuestion
        fields = [
            'id', 'question_text', 'option_a', 'option_b', 
            'option_c', 'option_d', 'correct_answer', 'explanation'
        ]


class MCQAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = MCQAnswer
        fields = ['id', 'question', 'question_text', 'selected_answer', 'is_correct', 'answered_at']
        read_only_fields = ['id', 'is_correct', 'answered_at']
    
    def create(self, validated_data):
        question = validated_data['question']
        selected_answer = validated_data['selected_answer']
        is_correct = (selected_answer == question.correct_answer)
        
        validated_data['is_correct'] = is_correct
        return super().create(validated_data)


class MCQSubmissionSerializer(serializers.Serializer):
    """Serializer for submitting multiple answers at once"""
    answers = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )