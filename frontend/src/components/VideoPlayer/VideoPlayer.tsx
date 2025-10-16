/** @format */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateSession, updateSessionStatus } from "../../services/api";
import "./VideoPlayer.css";

// Avatar image - local image
const AVATAR_IMAGE_URL = "/avatar.jpg";

const VideoPlayer: React.FC = () => {
	const navigate = useNavigate();
	const { sessionId } = useParams<{ sessionId: string }>();
	const [videoCompleted, setVideoCompleted] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [voicesLoaded, setVoicesLoaded] = useState(false);
	const [preVideoSpeechDone, setPreVideoSpeechDone] = useState(false);

	// Local video file
	const videoSrc = "/training-video.mp4";
	const videoTitle = "Business Case Development Training Video";

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

		return () => {
			// Cleanup speech synthesis
			window.speechSynthesis.cancel();
		};
	}, [sessionId]);

	// Speak pre-video message when voices are loaded
	useEffect(() => {
		if (voicesLoaded && !preVideoSpeechDone) {
			speakPreVideoMessage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [voicesLoaded, preVideoSpeechDone]);

	const speakPreVideoMessage = () => {
		if (!("speechSynthesis" in window)) {
			setPreVideoSpeechDone(true);
			startVideo();
			return;
		}

		window.speechSynthesis.cancel();
		setSpeaking(true);

		const messageText =
			"So we are going through the training video, enjoy it. After the video we will be heading to MCQ.";

		const utterance = new SpeechSynthesisUtterance(messageText);
		utterance.rate = 0.9;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		const voices = window.speechSynthesis.getVoices();
		const preferredVoice = voices.find(
			(voice) =>
				(voice.lang === "en-US" && voice.name.includes("Female")) ||
				voice.name.includes("Samantha") ||
				voice.name.includes("Zira") ||
				voice.name.includes("Google US English Female") ||
				(voice.lang === "en-US" && voice.name.toLowerCase().includes("female"))
		);
		if (preferredVoice) {
			utterance.voice = preferredVoice;
		}

		utterance.onend = () => {
			setSpeaking(false);
			setPreVideoSpeechDone(true);
			// Start video after speech ends
			startVideo();
		};

		utterance.onerror = () => {
			setSpeaking(false);
			setPreVideoSpeechDone(true);
			startVideo();
		};

		window.speechSynthesis.speak(utterance);
	};

	const startVideo = () => {
		// Start playing the video
		if (videoRef.current) {
			videoRef.current.play().catch((error) => {
				console.error("Error playing video:", error);
			});
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
		"Now that you're done watching the video, you will be taken for MCQ.";

	const utterance = new SpeechSynthesisUtterance(messageText);		// Configure voice settings
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
			{/* Small Laura Avatar - Top Middle */}
			<div className='small-avatar-container'>
				<img
					src={AVATAR_IMAGE_URL}
					alt='Laura'
					className={`small-avatar ${speaking ? "speaking" : ""}`}
				/>
				{speaking && (
					<div className='speaking-indicator-small'>
						<div className='pulse'></div>
						<span>Laura is speaking...</span>
					</div>
				)}
			</div>

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

					{/* Instructions */}
					{!videoCompleted && !preVideoSpeechDone && (
						<div className='video-instructions'>
							<div className='instruction-box'>
								<span className='icon'>🎙️</span>
								<p>Laura is introducing the training video...</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default VideoPlayer;
