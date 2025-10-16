/** @format */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateSession, updateSessionStatus } from "../../services/api";
import "./VideoPlayer.css";

// Avatar image - local image
const AVATAR_IMAGE_URL = "/avatar.jpg";

// YouTube IFrame API types
declare global {
	interface Window {
		YT: any;
		onYouTubeIframeAPIReady: () => void;
	}
}

const VideoPlayer: React.FC = () => {
	const navigate = useNavigate();
	const { sessionId } = useParams<{ sessionId: string }>();
	const [videoCompleted, setVideoCompleted] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [player, setPlayer] = useState<any>(null);
	const [voicesLoaded, setVoicesLoaded] = useState(false);

	// YouTube video ID extracted from: https://www.youtube.com/watch?v=ZK-rNEhJIDs
	const videoId = "ZK-rNEhJIDs";
	const videoTitle = "Business Case Development Training";

	// Load voices once
	useEffect(() => {
		const loadVoices = () => {
			const voices = window.speechSynthesis.getVoices();
			if (voices.length > 0) {
				setVoicesLoaded(true);
			}
		};

		loadVoices();
		if (window.speechSynthesis.onvoiceschanged !== undefined) {
			window.speechSynthesis.onvoiceschanged = loadVoices;
		}
	}, []);

	useEffect(() => {
		// Update session status to video
		if (sessionId) {
			updateSessionStatus(parseInt(sessionId), "video");
		}

		// Load YouTube IFrame API
		const tag = document.createElement("script");
		tag.src = "https://www.youtube.com/iframe_api";
		const firstScriptTag = document.getElementsByTagName("script")[0];
		firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

		// Create player when API is ready
		window.onYouTubeIframeAPIReady = () => {
			const ytPlayer = new window.YT.Player("youtube-player", {
				videoId: videoId,
				playerVars: {
					autoplay: 1, // Autoplay the video
					rel: 0,
					modestbranding: 1,
				},
				events: {
					onStateChange: onPlayerStateChange,
				},
			});
			setPlayer(ytPlayer);
		};

		return () => {
			// Cleanup
			if (player) {
				player.destroy();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	const onPlayerStateChange = (event: any) => {
		// YT.PlayerState.ENDED = 0
		if (event.data === 0) {
			handleVideoEnd();
		}
	};

	const handleVideoEnd = async () => {
		setVideoCompleted(true);

		// Update backend that video is completed
		if (sessionId) {
			try {
				await updateSession(parseInt(sessionId), { video_completed: true });
			} catch (error) {
				console.error("Error updating video completion:", error);
			}
		}

		// Start post-video speech after a short delay
		setTimeout(() => {
			speakPostVideoMessage();
		}, 1000);
	};

	const speakPostVideoMessage = () => {
		// Check if browser supports speech synthesis
		if (!("speechSynthesis" in window)) {
			console.error("Speech synthesis not supported");
			// Auto-navigate after 3 seconds if speech not supported
			setTimeout(() => {
				navigateToMCQ();
			}, 3000);
			return;
		}

		// Cancel any ongoing speech
		window.speechSynthesis.cancel();

		setSpeaking(true);

		const messageText =
			"I hope you understood the video. Now we are gonna take a mock MCQ on it. All the best!";

		const utterance = new SpeechSynthesisUtterance(messageText);

		// Configure voice settings
		utterance.rate = 0.9;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		// Wait for voices to load if needed
		const speakWhenReady = () => {
			// Try to use a female American accent voice
			const voices = window.speechSynthesis.getVoices();
			const preferredVoice = voices.find(
				(voice) =>
					// Prefer female American English voices
					(voice.lang === "en-US" && voice.name.includes("Female")) ||
					voice.name.includes("Samantha") || // macOS
					voice.name.includes("Zira") || // Windows
					voice.name.includes("Google US English Female") ||
					(voice.lang === "en-US" &&
						voice.name.toLowerCase().includes("female"))
			);
			if (preferredVoice) {
				utterance.voice = preferredVoice;
				console.log("Using voice:", preferredVoice.name);
			}

			// When speech ends, auto-navigate to MCQ
			utterance.onend = () => {
				setSpeaking(false);
				console.log("Post-video message completed, navigating to MCQ...");
				setTimeout(() => {
					navigateToMCQ();
				}, 1000);
			};

			utterance.onerror = (event) => {
				console.error("Speech synthesis error:", event);
				setSpeaking(false);
				// Navigate anyway if speech fails
				setTimeout(() => {
					navigateToMCQ();
				}, 2000);
			};

			// Speak the message
			window.speechSynthesis.speak(utterance);
		};

		if (voicesLoaded) {
			speakWhenReady();
		} else {
			// Wait a bit for voices to load
			setTimeout(speakWhenReady, 100);
		}
	};

	const navigateToMCQ = async () => {
		if (sessionId) {
			try {
				await updateSessionStatus(parseInt(sessionId), "mcq");
				navigate(`/mcq/${sessionId}`);
			} catch (error) {
				console.error("Error navigating to MCQ:", error);
				navigate(`/mcq/${sessionId}`);
			}
		}
	};

	return (
		<div className='video-container'>
			<div className='video-wrapper'>
				<div className='video-header'>
					<h1>{videoTitle}</h1>
					<div className='progress-indicator'>
						<div className='step completed'>✓ Registration</div>
						<div className='step completed'>✓ Greeting</div>
						<div className='step active'>▶ Training Video</div>
						<div className='step'>Assessment</div>
						<div className='step'>Results</div>
					</div>
				</div>

				<div className='video-player-card'>
					{/* YouTube Player using IFrame API */}
					<div className='video-embed'>
						<div id='youtube-player'></div>
					</div>

					{/* Instructions */}
					{!videoCompleted && (
						<div className='video-instructions'>
							<div className='instruction-box'>
								<span className='icon'>📺</span>
								<p>
									Please watch the training video. The assessment will begin
									automatically after completion.
								</p>
							</div>
						</div>
					)}

					{/* Post-Video Message */}
					{videoCompleted && (
						<div className='post-video-message'>
							<div className='avatar-message-box'>
								<div className='avatar-icon-small'>
									<img
										src={AVATAR_IMAGE_URL}
										alt='Avatar'
										className={speaking ? "speaking" : ""}
									/>
								</div>
								<div className='message-content'>
									{speaking && (
										<div className='speaking-indicator-inline'>
											<span>🎤 Speaking...</span>
										</div>
									)}
								</div>
							</div>

							{speaking && (
								<div className='auto-navigate-info'>
									<p>📝 Preparing your assessment...</p>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Manual Skip Button (for testing/backup) */}
				{!videoCompleted && (
					<div className='manual-continue'>
						<button className='skip-button' onClick={navigateToMCQ}>
							Skip to Assessment
						</button>
						<p className='skip-note'>
							Already watched the video? Click above to proceed directly.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default VideoPlayer;
