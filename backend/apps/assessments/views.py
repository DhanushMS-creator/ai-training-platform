from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
from .models import MCQQuestion, MCQAnswer
from .serializers import (
    MCQQuestionSerializer, 
    MCQQuestionDetailSerializer,
    MCQAnswerSerializer,
    MCQSubmissionSerializer
)
from .utils import extract_text_from_pdf, generate_mcq_questions, generate_personalized_feedback
from apps.users.models import TrainingSession
import os


@api_view(['POST'])
def generate_questions(request, session_id):
    """
    Generate MCQ questions for a training session based on PDF and trainee context
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        trainee = session.trainee
        
        # Check if PDF file is provided
        if 'pdf_file' not in request.FILES:
            return Response(
                {'error': 'PDF file is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pdf_file = request.FILES['pdf_file']
        num_questions = int(request.data.get('num_questions', 10))
        
        # Save PDF temporarily
        file_path = default_storage.save(f'temp/{pdf_file.name}', pdf_file)
        full_path = os.path.join(default_storage.location, file_path)
        
        try:
            # Extract text from PDF
            pdf_content = extract_text_from_pdf(full_path)
            
            # Generate questions using Gemini
            questions = generate_mcq_questions(
                job_title=trainee.job_title,
                industry=trainee.industry,
                pdf_content=pdf_content,
                num_questions=num_questions
            )
            
            # Save questions to database
            created_questions = []
            for q_data in questions:
                question = MCQQuestion.objects.create(
                    session=session,
                    question_text=q_data['question_text'],
                    option_a=q_data['option_a'],
                    option_b=q_data['option_b'],
                    option_c=q_data['option_c'],
                    option_d=q_data['option_d'],
                    correct_answer=q_data['correct_answer'],
                    explanation=q_data.get('explanation', '')
                )
                created_questions.append(question)
            
            # Update session status
            session.status = 'mcq'
            session.mcq_total = len(created_questions)
            session.save()
            
            # Return questions without correct answers
            serializer = MCQQuestionSerializer(created_questions, many=True)
            return Response({
                'session_id': session_id,
                'questions': serializer.data,
                'total_questions': len(created_questions)
            }, status=status.HTTP_201_CREATED)
        
        finally:
            # Clean up temporary file
            if os.path.exists(full_path):
                os.remove(full_path)
    
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def auto_generate_questions(request, session_id):
    """
    Automatically generate MCQ questions using the stored training PDF
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        trainee = session.trainee
        
        # Check if questions already exist
        existing_questions = MCQQuestion.objects.filter(session=session).count()
        if existing_questions > 0:
            return Response({
                'message': 'Questions already exist for this session',
                'questions_count': existing_questions
            }, status=status.HTTP_200_OK)
        
        num_questions = int(request.data.get('num_questions', 10))
        
        # Use the stored PDF file
        pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'training_material.pdf')
        
        if not os.path.exists(pdf_path):
            return Response(
                {'error': 'Training material PDF not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # Extract text from PDF
            pdf_content = extract_text_from_pdf(pdf_path)
            
            # Generate questions using Gemini
            questions = generate_mcq_questions(
                job_title=trainee.job_title,
                industry=trainee.industry,
                pdf_content=pdf_content,
                num_questions=num_questions
            )
            
            # Save questions to database
            created_questions = []
            for q_data in questions:
                question = MCQQuestion.objects.create(
                    session=session,
                    question_text=q_data['question_text'],
                    option_a=q_data['option_a'],
                    option_b=q_data['option_b'],
                    option_c=q_data['option_c'],
                    option_d=q_data['option_d'],
                    correct_answer=q_data['correct_answer'],
                    explanation=q_data.get('explanation', '')
                )
                created_questions.append(question)
            
            # Update session status
            session.status = 'mcq'
            session.mcq_total = len(created_questions)
            session.save()
            
            # Return questions without correct answers
            serializer = MCQQuestionSerializer(created_questions, many=True)
            return Response({
                'session_id': session_id,
                'questions': serializer.data,
                'total_questions': len(created_questions)
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': f'Error generating questions: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_questions(request, session_id):
    """
    Get all questions for a session (without correct answers during exam)
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        questions = MCQQuestion.objects.filter(session=session)
        serializer = MCQQuestionSerializer(questions, many=True)
        
        return Response({
            'session_id': session_id,
            'questions': serializer.data,
            'total_questions': questions.count()
        })
    
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def submit_answer(request, session_id):
    """
    Submit a single answer
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        question_id = request.data.get('question_id')
        selected_answer = request.data.get('selected_answer')
        
        question = MCQQuestion.objects.get(id=question_id, session=session)
        
        # Create or update answer
        answer, created = MCQAnswer.objects.update_or_create(
            question=question,
            session=session,
            defaults={
                'selected_answer': selected_answer,
                'is_correct': (selected_answer == question.correct_answer)
            }
        )
        
        serializer = MCQAnswerSerializer(answer)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    except (TrainingSession.DoesNotExist, MCQQuestion.DoesNotExist) as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def submit_exam(request, session_id):
    """
    Submit entire exam and get results with feedback
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        trainee = session.trainee
        
        # Get all answers for this session
        answers = MCQAnswer.objects.filter(session=session)
        correct_count = answers.filter(is_correct=True).count()
        total_count = MCQQuestion.objects.filter(session=session).count()
        
        # Update session
        session.mcq_score = correct_count
        session.mcq_total = total_count
        session.status = 'feedback'
        session.save()
        
        # Get incorrect questions for feedback
        incorrect_answers = answers.filter(is_correct=False)
        incorrect_questions = []
        for ans in incorrect_answers:
            incorrect_questions.append({
                'question_text': ans.question.question_text,
                'correct_answer': ans.question.correct_answer,
                'selected_answer': ans.selected_answer
            })
        
        # Generate personalized feedback
        feedback = generate_personalized_feedback(
            trainee_name=trainee.name,
            job_title=trainee.job_title,
            industry=trainee.industry,
            score=correct_count,
            total=total_count,
            incorrect_questions=incorrect_questions
        )
        
        # Get detailed questions with correct answers for review
        questions = MCQQuestion.objects.filter(session=session)
        questions_serializer = MCQQuestionDetailSerializer(questions, many=True)
        
        return Response({
            'score': correct_count,
            'total': total_count,
            'percentage': (correct_count / total_count * 100) if total_count > 0 else 0,
            'feedback': feedback,
            'questions_review': questions_serializer.data
        })
    
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)