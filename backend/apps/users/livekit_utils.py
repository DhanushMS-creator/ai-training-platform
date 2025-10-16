"""
LiveKit Token Generation Utility
Generates access tokens for LiveKit rooms
"""
import os
import time
import jwt

def generate_livekit_token(room_name: str, participant_name: str) -> str:
    """
    Generate a LiveKit access token for a participant to join a room
    
    Args:
        room_name: Name of the LiveKit room
        participant_name: Name of the participant
    
    Returns:
        Access token string
    """
    # Get LiveKit credentials from environment/settings
    api_key = os.getenv('LIVEKIT_API_KEY', 'APIikPxGbCUWKwf')
    api_secret = os.getenv('LIVEKIT_API_SECRET', 'H7zTbkq4zLgSZDIxYMUnyzch0tmze6wAGxremXVg5wfB')
    
    # Create JWT payload
    now = int(time.time())
    payload = {
        "exp": now + 3600,  # Token expires in 1 hour
        "iss": api_key,
        "nbf": now - 60,  # Not before (60 seconds ago to account for clock skew)
        "sub": participant_name,
        "name": participant_name,
        "video": {
            "roomJoin": True,
            "room": room_name,
            "canPublish": True,
            "canSubscribe": True,
        }
    }
    
    # Generate JWT token
    token = jwt.encode(payload, api_secret, algorithm="HS256")
    
    return token
