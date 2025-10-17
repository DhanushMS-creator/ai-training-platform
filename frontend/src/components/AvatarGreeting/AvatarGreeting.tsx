/** @format */

// ============================================================================
// AVATAR GREETING COMPONENT - FINAL WORKING VERSION
// ============================================================================
// ✅ DESKTOP/ANDROID: Perfect - Auto-plays speech, shows avatar + indicator
// ⚠️ iOS: Requires user tap due to browser security restrictions
// ============================================================================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, updateSessionStatus } from "../../services/api";
import "./AvatarGreeting.css";

// Avatar image - local image
const AVATAR_IMAGE_URL = "/avatar.jpg";

const AvatarGreeting: React.FC = () => {
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

			// Update session status to greeting
			await updateSessionStatus(parseInt(sessionId), "greeting");

			setLoading(false);

			// For iOS, show tap prompt instead of auto-playing
			if (isIOS) {
				setShowIOSPrompt(true);
			} else {
				// Auto-play for desktop/Android (ORIGINAL BEHAVIOR)
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
			setTimeout(() => {
				navigate(`/video/${sessionId}`);
			}, 3000);
			return;
		}

		// Cancel any ongoing speech
		window.speechSynthesis.cancel();

		setSpeaking(true);

		const greetingText = `Hello ${name}, welcome to the training! I'm Laura, your training expert. Today, you'll watch a comprehensive training video on Business Case Development, then complete a personalized assessment. Let's get started!`;

		const utterance = new SpeechSynthesisUtterance(greetingText);
		utterance.rate = 0.9;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		// Try to use a female American accent voice
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
			console.log("Using voice:", preferredVoice.name);
		}

		// When speech ends, auto-navigate to video (ORIGINAL BEHAVIOR)
		utterance.onend = () => {
			setSpeaking(false);
			console.log("Greeting completed, navigating to video...");
			setTimeout(() => {
				navigate(`/video/${sessionId}`);
			}, 1000);
		};

		// On error, navigate after brief delay (ORIGINAL BEHAVIOR)
		utterance.onerror = (event) => {
			console.error("Speech synthesis error:", event);
			setSpeaking(false);
			// For iOS errors, give 15 seconds to read, otherwise 2 seconds
			const delay = isIOS ? 15000 : 2000;
			setTimeout(() => {
				navigate(`/video/${sessionId}`);
			}, delay);
		};

		// Speak the greeting
		window.speechSynthesis.speak(utterance);
	};

	const handleScreenTap = () => {
		if (isIOS && showIOSPrompt && trainee) {
			speakGreeting(trainee.trainee_name);
		}
	};

	if (loading) {
		return (
			<div className='greeting-container'>
				<div className='loading-spinner'>
					<div className='spinner'></div>
					<p>Preparing your greeting...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='greeting-container'>
				<div className='error-message'>
					<p>{error}</p>
					<button
						onClick={() => navigate(`/video/${sessionId}`)}
						className='continue-button'>
						Continue to Training Video →
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='greeting-container' onClick={handleScreenTap}>
			<div className='greeting-content'>
				<div className='avatar-header'>
					<h1>Welcome, {trainee?.trainee_name}!</h1>
				</div>

				<div className='avatar-section'>
					<div className='avatar-image-container'>
						<img
							src={AVATAR_IMAGE_URL}
							alt='Training Assistant Avatar'
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
				</div>

				{/* Desktop/Android: Show speaking indicator (ORIGINAL) */}
				{speaking && !isIOS && (
					<div className='auto-navigate-info'>
						<p>🎤 Laura is speaking...</p>
					</div>
				)}
			</div>

			{/* iOS-only: Modern bottom popup for tap prompt */}
			{showIOSPrompt && (
				<div className='ios-bottom-popup'>
					<div className='popup-content'>
						<div className='tap-icon'>👆</div>
						<p>Tap anywhere to hear Laura</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default AvatarGreeting;
