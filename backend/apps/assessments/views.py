from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
from .models import MCQQuestion, MCQAnswer, GlobalMCQQuestion, SessionQuestion
from .serializers import (
    MCQQuestionSerializer, 
    MCQQuestionDetailSerializer,
    MCQAnswerSerializer,
    MCQSubmissionSerializer
)
from .utils import extract_text_from_pdf, generate_mcq_questions, generate_personalized_feedback
from apps.users.models import TrainingSession
import os
import random


def initialize_global_question_pool():
    """
    Initialize the global question pool with 20 questions from PDF.
    This should be called once when the system is set up.
    Returns True if questions were generated, False if they already exist.
    """
    # Check if global questions already exist
    existing_count = GlobalMCQQuestion.objects.filter(is_active=True).count()
    
    if existing_count >= 20:
        print(f"Global question pool already has {existing_count} questions. Skipping generation.")
        return False
    
    # Path to training PDF
    pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'training_material.pdf')
    
    if not os.path.exists(pdf_path):
        raise Exception('Training material PDF not found')
    
    # Extract text from PDF
    pdf_content = extract_text_from_pdf(pdf_path)
    
    # Generate 20 questions using Gemini (generic, not personalized)
    questions = generate_mcq_questions(
        job_title="General",  # Generic questions for all users
        industry="Business",
        pdf_content=pdf_content,
        num_questions=20
    )
    
    # Save to GlobalMCQQuestion table
    for q_data in questions:
        GlobalMCQQuestion.objects.create(
            question_text=q_data['question_text'],
            option_a=q_data['option_a'],
            option_b=q_data['option_b'],
            option_c=q_data['option_c'],
            option_d=q_data['option_d'],
            correct_answer=q_data['correct_answer'],
            explanation=q_data.get('explanation', ''),
            is_active=True
        )
    
    print(f"Successfully generated {len(questions)} global questions!")
    return True


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
        num_questions = int(request.data.get('num_questions', 5))  # Default to 5 questions
        
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
    Assign 5 random questions from global pool to this session.
    If global pool doesn't exist, initialize it first.
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        
        # Check if this session already has assigned questions
        existing_assignments = SessionQuestion.objects.filter(session=session).count()
        if existing_assignments > 0:
            # Return existing questions
            assigned_questions = SessionQuestion.objects.filter(session=session).select_related('question')
            questions_data = []
            for sq in assigned_questions:
                q = sq.question
                questions_data.append({
                    'id': q.id,
                    'question_text': q.question_text,
                    'option_a': q.option_a,
                    'option_b': q.option_b,
                    'option_c': q.option_c,
                    'option_d': q.option_d,
                })
            
            return Response({
                'session_id': session_id,
                'questions': questions_data,
                'total_questions': len(questions_data)
            }, status=status.HTTP_200_OK)
        
        # Initialize global question pool if it doesn't exist
        global_question_count = GlobalMCQQuestion.objects.filter(is_active=True).count()
        if global_question_count < 20:
            print("Initializing global question pool...")
            initialize_global_question_pool()
        
        # Get all active global questions
        all_questions = list(GlobalMCQQuestion.objects.filter(is_active=True))
        
        if len(all_questions) < 5:
            return Response({
                'error': 'Not enough questions in global pool'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Randomly select 5 questions
        selected_questions = random.sample(all_questions, 5)
        
        # Assign questions to this session
        questions_data = []
        for order, question in enumerate(selected_questions, start=1):
            # Create session-question link
            SessionQuestion.objects.create(
                session=session,
                question=question,
                order=order
            )
            
            # Prepare response data (without correct answer)
            questions_data.append({
                'id': question.id,
                'question_text': question.question_text,
                'option_a': question.option_a,
                'option_b': question.option_b,
                'option_c': question.option_c,
                'option_d': question.option_d,
            })
        
        # Update session status
        session.status = 'mcq'
        session.mcq_total = 5
        session.save()
        
        return Response({
            'session_id': session_id,
            'questions': questions_data,
            'total_questions': 5
        }, status=status.HTTP_201_CREATED)
    
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_questions(request, session_id):
    """
    Get all questions for a session (without correct answers during exam)
    Uses new SessionQuestion model to fetch from global pool
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        
        # Get questions assigned to this session
        assigned_questions = SessionQuestion.objects.filter(session=session).select_related('question')
        
        questions_data = []
        for sq in assigned_questions:
            q = sq.question
            questions_data.append({
                'id': q.id,
                'question_text': q.question_text,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
            })
        
        return Response({
            'session_id': session_id,
            'questions': questions_data,
            'total_questions': len(questions_data)
        })
    
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def submit_answer(request, session_id):
    """
    Submit a single answer - now uses GlobalMCQQuestion
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        question_id = request.data.get('question_id')
        selected_answer = request.data.get('selected_answer')
        
        # Get the global question
        question = GlobalMCQQuestion.objects.get(id=question_id)
        
        # Create or update answer
        answer, created = MCQAnswer.objects.update_or_create(
            question=question,
            session=session,
            defaults={
                'selected_answer': selected_answer,
                'is_correct': (selected_answer == question.correct_answer)
            }
        )
        
        # Include correct answer in response for real-time feedback
        response_data = {
            'id': answer.id,
            'question': answer.question.id,
            'selected_answer': answer.selected_answer,
            'is_correct': answer.is_correct,
            'correct_answer': question.correct_answer,  # Include correct answer
            'answered_at': answer.answered_at
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    except (TrainingSession.DoesNotExist, GlobalMCQQuestion.DoesNotExist) as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def submit_exam(request, session_id):
    """
    Submit entire exam and get results with feedback - uses GlobalMCQQuestion
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        trainee = session.trainee
        
        # Get all answers for this session
        answers = MCQAnswer.objects.filter(session=session)
        correct_count = answers.filter(is_correct=True).count()
        
        # Get total questions for this session
        total_count = SessionQuestion.objects.filter(session=session).count()
        
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
        assigned_questions = SessionQuestion.objects.filter(session=session).select_related('question')
        questions_review = []
        for sq in assigned_questions:
            q = sq.question
            questions_review.append({
                'id': q.id,
                'question_text': q.question_text,
                'option_a': q.option_a,
                'option_b': q.option_b,
                'option_c': q.option_c,
                'option_d': q.option_d,
                'correct_answer': q.correct_answer,
                'explanation': q.explanation
            })
        
        return Response({
            'score': correct_count,
            'total': total_count,
            'percentage': (correct_count / total_count * 100) if total_count > 0 else 0,
            'feedback': feedback,
            'questions_review': questions_review
        })
    
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)