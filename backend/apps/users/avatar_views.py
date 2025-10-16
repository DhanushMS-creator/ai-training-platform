from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
import os
from .models import TrainingSession


@api_view(['POST'])
def generate_avatar_greeting(request, session_id):
    """
    Generate LiveKit credentials for avatar greeting session.
    The avatar agent (running separately) will join the room automatically.
    """
    try:
        session = TrainingSession.objects.get(id=session_id)
        trainee = session.trainee
        
        # Get LiveKit credentials
        LIVEKIT_URL = os.getenv('LIVEKIT_URL', 'wss://ai-examiner-m7jzbdy9.livekit.cloud')
        
        # Generate LiveKit token for this session
        from .livekit_utils import generate_livekit_token
        room_name = f"training-session-{session_id}"
        participant_name = trainee.name
        
        print(f"Generating LiveKit credentials...")
        print(f"Room: {room_name}, Participant: {participant_name}")
        
        livekit_token = generate_livekit_token(room_name, participant_name)
        
        print(f"Token generated successfully for room: {room_name}")
        
        return Response({
            'success': True,
            'room_name': room_name,
            'livekit_url': LIVEKIT_URL,
            'livekit_token': livekit_token,
            'participant_name': participant_name,
            'message': 'LiveKit credentials generated. Avatar agent will join automatically if running.'
        })
    
    except TrainingSession.DoesNotExist:
        print(f"Session {session_id} not found")
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error generating avatar greeting: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def check_avatar_status(request, job_id):
    """
    Check the status of an avatar video generation job
    """
    try:
        BEYOND_PRESENCE_API_KEY = os.getenv('BEYOND_PRESENCE_API_KEY', 'sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w')
        
        response = requests.get(
            f'https://api.beyondpresence.ai/v1/avatars/status/{job_id}',
            headers={
                'Authorization': f'Bearer {BEYOND_PRESENCE_API_KEY}'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return Response(response.json())
        else:
            return Response({
                'error': 'Failed to check status'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
