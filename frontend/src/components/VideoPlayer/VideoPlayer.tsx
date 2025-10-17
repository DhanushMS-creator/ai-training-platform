/** @format */

import React, { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateSession, updateSessionStatus } from "../../services/api";
import "./VideoPlayer.css";

const VideoPlayer: React.FC = () => {
	const navigate = useNavigate();
	const { sessionId } = useParams<{ sessionId: string }>();
	const videoRef = useRef<HTMLVideoElement>(null);

	// Local video file
	const videoSrc = "/training-video.mp4";
	const videoTitle = "Business Case Development Training Video";

	useEffect(() => {
		// Update session status to video
		if (sessionId) {
			updateSessionStatus(parseInt(sessionId), "video");
		}

		// Auto-play video when page loads
		if (videoRef.current) {
			videoRef.current.play().catch((error) => {
				console.error("Error auto-playing video:", error);
			});
		}
	}, [sessionId]);

	const handleVideoEnd = async () => {
		// Update backend that video is completed
		if (sessionId) {
			try {
				await updateSession(parseInt(sessionId), { video_completed: true });
			} catch (error) {
				console.error("Error updating video completion:", error);
			}
		}

		// Navigate to post-video greeting (Laura introduction to MCQ)
		navigate(`/post-video/${sessionId}`);
	};

	return (
		<div className='video-container'>
			<div className='video-wrapper'>
				<div className='video-header'>
					<h1>{videoTitle}</h1>
				</div>

				<div className='video-player-card'>
					{/* HTML5 Video Player */}
					<div className='video-embed'>
						<video
							ref={videoRef}
							src={videoSrc}
							controls
							controlsList='nodownload'
							onEnded={handleVideoEnd}
							style={{ width: "100%", height: "auto" }}>
							Your browser does not support the video tag.
						</video>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VideoPlayer;
