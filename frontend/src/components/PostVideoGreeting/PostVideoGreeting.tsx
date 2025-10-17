/** @format */

// ============================================================================
// POST-VIDEO GREETING COMPONENT - Introduction to MCQ Assessment
// ============================================================================
// Shows Laura after video completion with MCQ introduction message
// ============================================================================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, updateSessionStatus } from "../../services/api";
import "./PostVideoGreeting.css";

// Avatar image - local image
const AVATAR_IMAGE_URL = "/avatar.jpg";

const PostVideoGreeting: React.FC = () => {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [trainee, setTrainee] = useState<any>(null);
	const [speaking, setSpeaking] = useState(false);
	const [error, setError] = useState("");
	const [voicesLoaded, setVoicesLoaded] = useState(false);
	const [isIOS, setIsIOS] = useState(false);
	const [showIOSPrompt, setShowIOSPrompt] = useState(false);

	// Detect iOS
	useEffect(() => {
		const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
		setIsIOS(ios);
	}, []);

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
		if (voicesLoaded) {
			loadSessionAndGreet();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId, voicesLoaded]);

	const loadSessionAndGreet = async () => {
		try {
			if (!sessionId) return;

			// Get session data
			const session = await getSession(parseInt(sessionId));
			setTrainee(session);

			setLoading(false);

			// For iOS, show tap prompt instead of auto-playing
			if (isIOS) {
				setShowIOSPrompt(true);
			} else {
				// Auto-play for desktop/Android
				setTimeout(() => {
					speakGreeting(session.trainee_name);
				}, 500);
			}
		} catch (error) {
			console.error("Error loading session:", error);
			setError("Failed to load session");
			setLoading(false);
		}
	};

	const speakGreeting = (name: string) => {
		// Hide iOS prompt if shown
		setShowIOSPrompt(false);

		// Check if browser supports speech synthesis
		if (!("speechSynthesis" in window)) {
			console.error("Speech synthesis not supported");
			navigateToMCQ();
			return;
		}

		// Cancel any ongoing speech
		window.speechSynthesis.cancel();

		setSpeaking(true);

		const greetingText = `I hope you have understood the video. Now we will be navigating to MCQ questions to test your understanding based on it. At the end we will provide feedback. All the best!`;

		const utterance = new SpeechSynthesisUtterance(greetingText);
		utterance.rate = 0.9;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		// Consistent voice selection across all platforms
		// Priority: Google voices (most consistent) > Native female voices
		const voices = window.speechSynthesis.getVoices();

		// Try Google voices first (available on Chrome/Android/Desktop)
		let selectedVoice = voices.find(
			(voice) =>
				voice.name === "Google US English" ||
				(voice.name.includes("Google") && voice.lang === "en-US")
		);

		// Fallback to platform-specific female voices
		if (!selectedVoice) {
			selectedVoice = voices.find(
				(voice) =>
					voice.name.includes("Samantha") || // macOS/iOS
					voice.name.includes("Zira") || // Windows
					(voice.lang === "en-US" &&
						voice.name.toLowerCase().includes("female"))
			);
		}

		// Final fallback: any en-US voice
		if (!selectedVoice) {
			selectedVoice = voices.find((voice) => voice.lang === "en-US");
		}

		if (selectedVoice) {
			utterance.voice = selectedVoice;
			console.log(
				"✅ Using voice:",
				selectedVoice.name,
				"| Platform:",
				navigator.platform
			);
		} else {
			console.log("⚠️ Using default voice | Platform:", navigator.platform);
		}

		// When speech ends, navigate to MCQ
		utterance.onend = () => {
			setSpeaking(false);
			console.log("Post-video greeting completed, navigating to MCQ...");
			setTimeout(() => {
				navigateToMCQ();
			}, 1000);
		};

		// On error, navigate after brief delay
		utterance.onerror = (event) => {
			console.error("Speech synthesis error:", event);
			setSpeaking(false);
			const delay = isIOS ? 15000 : 2000;
			setTimeout(() => {
				navigateToMCQ();
			}, delay);
		};

		// Speak the greeting
		window.speechSynthesis.speak(utterance);
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

	const handleScreenTap = () => {
		if (isIOS && showIOSPrompt && trainee) {
			speakGreeting(trainee.trainee_name);
		}
	};

	if (loading) {
		return (
			<div className='post-video-greeting-container'>
				<div className='loading-spinner'>
					<div className='spinner'></div>
					<p>Preparing assessment introduction...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='post-video-greeting-container'>
				<div className='error-message'>
					<p>{error}</p>
					<button onClick={navigateToMCQ} className='continue-button'>
						Continue to Assessment →
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='post-video-greeting-container' onClick={handleScreenTap}>
			<div className='greeting-content'>
				{/* Avatar Section */}
				<div className='avatar-section'>
					<div className='avatar-image-container'>
						<img
							src={AVATAR_IMAGE_URL}
							alt='Laura - Training Expert'
							className={`avatar-image ${speaking ? "speaking" : ""}`}
						/>
						{speaking && (
							<div className='speaking-indicator'>
								<div className='wave'></div>
								<div className='wave'></div>
								<div className='wave'></div>
							</div>
						)}
					</div>

					{showIOSPrompt && (
						<div className='ios-tap-prompt'>
							<div className='tap-icon'>👆</div>
							<p className='tap-text'>Tap anywhere to start</p>
						</div>
					)}

					{!showIOSPrompt && (
						<div className='trainee-info'>
							<h1 className='trainee-name'>
								Great job, {trainee?.trainee_name}!
							</h1>
							<p className='greeting-subtitle'>Assessment Introduction</p>
						</div>
					)}
				</div>

				{/* Message Section - Only show on iOS when waiting for tap */}
				{showIOSPrompt && (
					<div className='message-section'>
						<p className='message-text'>
							I hope you have understood the video. Now we will be navigating to
							MCQ questions to test your understanding based on it. At the end
							we will provide feedback. All the best!
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default PostVideoGreeting;
