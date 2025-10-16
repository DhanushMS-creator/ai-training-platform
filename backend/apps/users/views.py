from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Trainee, TrainingSession
from .serializers import TraineeSerializer, TraineeRegistrationSerializer, TrainingSessionSerializer
from .livekit_utils import generate_livekit_token


class TraineeListCreateView(generics.ListCreateAPIView):
    queryset = Trainee.objects.all()
    serializer_class = TraineeSerializer


class TraineeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trainee.objects.all()
    serializer_class = TraineeSerializer


@api_view(['POST'])
def register_trainee(request):
    """
    Register a new trainee and create initial training session
    """
    serializer = TraineeRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        trainee = serializer.save()
        session = TrainingSession.objects.get(trainee=trainee)
        
        return Response({
            'trainee_id': trainee.id,
            'session_id': session.id,
            'name': trainee.name,
            'job_title': trainee.job_title,
            'industry': trainee.industry,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
def session_detail(request, session_id):
    """
    Get or update training session details
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TrainingSessionSerializer(session)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = TrainingSessionSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def update_session_status(request, session_id):
    """
    Update the status of a training session
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    
    new_status = request.data.get('status')
    if new_status not in dict(TrainingSession.STATUS_CHOICES):
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    session.status = new_status
    session.save()
    
    return Response({
        'session_id': session.id,
        'status': session.status,
        'message': f'Status updated to {new_status}'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def get_livekit_token(request, session_id):
    """
    Generate a LiveKit token for the avatar greeting session
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
    except TrainingSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Generate room name based on session
    room_name = f"greeting-{session_id}"
    participant_name = session.trainee.name
    
    try:
        token = generate_livekit_token(room_name, participant_name)
        
        return Response({
            'token': token,
            'room_name': room_name,
            'livekit_url': 'wss://ai-examiner-m7jzbdy9.livekit.cloud',
            'trainee_name': participant_name
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': f'Failed to generate token: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)