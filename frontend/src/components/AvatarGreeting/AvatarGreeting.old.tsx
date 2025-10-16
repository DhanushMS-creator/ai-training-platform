/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSession, updateSessionStatus } from "../../services/api";
import "./AvatarGreeting.css";

interface AvatarGreetingProps {}

const AvatarGreeting: React.FC<AvatarGreetingProps> = () => {
	const navigate = useNavigate();
	const { sessionId } = useParams<{ sessionId: string }>();
	const [loading, setLoading] = useState(true);
	const [trainee, setTrainee] = useState<any>(null);
	const [greeting, setGreeting] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		loadSessionData();
	}, [sessionId]);

	const loadSessionData = async () => {
		try {
			if (!sessionId) return;

			const sessionData = await getSession(parseInt(sessionId));
			setTrainee(sessionData);

			// Update session status to greeting
			await updateSessionStatus(parseInt(sessionId), "greeting");

			// Generate personalized greeting
			const greetingText = generateGreeting(sessionData);
			setGreeting(greetingText);

			setLoading(false);

			// Auto-navigate to video after 8 seconds
			setTimeout(() => {
				handleContinue();
			}, 8000);
		} catch (err: any) {
			console.error("Error loading session:", err);
			setError("Failed to load session data");
			setLoading(false);
		}
	};

	const generateGreeting = (sessionData: any) => {
		const name = sessionData.trainee_name || "there";
		const jobTitle = localStorage.getItem("job_title") || "professional";
		const industry = localStorage.getItem("industry") || "your field";

		return `Hello ${name}! Welcome to your personalized training session. As a ${jobTitle} in the ${industry} industry, this training has been specifically designed to enhance your skills and knowledge. Let's begin your learning journey together!`;
	};

	const handleContinue = async () => {
		try {
			if (sessionId) {
				await updateSessionStatus(parseInt(sessionId), "video");
				navigate(`/video/${sessionId}`);
			}
		} catch (err) {
			console.error("Error updating status:", err);
		}
	};

	if (loading) {
		return (
			<div className='greeting-container'>
				<div className='greeting-loader'>
					<div className='spinner'></div>
					<p>Preparing your personalized training...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='greeting-container'>
				<div className='greeting-error'>
					<h2>⚠️ Error</h2>
					<p>{error}</p>
					<button onClick={() => navigate("/")}>Return Home</button>
				</div>
			</div>
		);
	}

	return (
		<div className='greeting-container'>
			<div className='greeting-card'>
				{/* Avatar Display Area */}
				<div className='avatar-display'>
					<div className='avatar-placeholder'>
						<div className='avatar-icon'>👤</div>
						<div className='avatar-wave'>
							<span className='wave-emoji'>👋</span>
						</div>
					</div>
				</div>

				{/* Greeting Message */}
				<div className='greeting-content'>
					<h1 className='greeting-title'>Welcome, {trainee?.trainee_name}!</h1>

					<div className='greeting-message'>
						<p>{greeting}</p>
					</div>

					<div className='greeting-info'>
						<div className='info-badge'>
							<span className='badge-icon'>💼</span>
							<span>{localStorage.getItem("job_title")}</span>
						</div>
						<div className='info-badge'>
							<span className='badge-icon'>🏢</span>
							<span>{localStorage.getItem("industry")}</span>
						</div>
					</div>

					{/* Progress Indicator */}
					<div className='training-steps'>
						<div className='step completed'>
							<div className='step-circle'>✓</div>
							<span>Registration</span>
						</div>
						<div className='step active'>
							<div className='step-circle'>2</div>
							<span>Introduction</span>
						</div>
						<div className='step'>
							<div className='step-circle'>3</div>
							<span>Training Video</span>
						</div>
						<div className='step'>
							<div className='step-circle'>4</div>
							<span>Assessment</span>
						</div>
						<div className='step'>
							<div className='step-circle'>5</div>
							<span>Results</span>
						</div>
					</div>

					{/* Action Button */}
					<button className='continue-button' onClick={handleContinue}>
						Continue to Training Video →
					</button>

					<p className='auto-continue-text'>
						You'll be automatically redirected in a few seconds...
					</p>
				</div>
			</div>
		</div>
	);
};

export default AvatarGreeting;
