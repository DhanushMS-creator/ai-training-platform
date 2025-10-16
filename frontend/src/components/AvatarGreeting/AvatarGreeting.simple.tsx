/** @format */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, updateSessionStatus } from "../../services/api";
import "./AvatarGreeting.css";

const AvatarGreeting: React.FC = () => {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [trainee, setTrainee] = useState<any>(null);
	const [videoUrl, setVideoUrl] = useState("");
	const [generatingVideo, setGeneratingVideo] = useState(true);

	useEffect(() => {
		loadSessionAndGenerateGreeting();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	const loadSessionAndGenerateGreeting = async () => {
		try {
			if (!sessionId) return;

			// Get session data
			const session = await getSession(parseInt(sessionId));
			setTrainee(session);

			// Update session status to greeting
			await updateSessionStatus(parseInt(sessionId), "greeting");

			// Generate personalized greeting message
			const greetingMessage = `Hello ${session.trainee_name}! Welcome to your Business Case Development training. This training has been personalized for you. Let's get started with your learning journey!`;

			// Call Beyond Presence API to generate avatar video
			await generateAvatarVideo(greetingMessage);
			setLoading(false);
		} catch (error) {
			console.error("Error loading session:", error);
			setLoading(false);
		}
	};

	const generateAvatarVideo = async (message: string) => {
		try {
			setGeneratingVideo(true);

			const response = await fetch(
				"https://api.beyondpresence.ai/v1/avatars/generate",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization:
							"Bearer sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w",
					},
					body: JSON.stringify({
						avatar_id: "7c9ca52f-d4f7-46e1-a4b8-0c8655857cc3",
						text: message,
						voice: "professional",
					}),
				}
			);

			const data = await response.json();

			if (data.video_url) {
				setVideoUrl(data.video_url);
			} else if (data.job_id) {
				// Poll for video completion
				await pollForVideo(data.job_id);
			}

			setGeneratingVideo(false);
		} catch (error) {
			console.error("Error generating avatar video:", error);
			setGeneratingVideo(false);
		}
	};

	const pollForVideo = async (jobId: string) => {
		const maxAttempts = 30;
		let attempts = 0;

		const poll = async () => {
			try {
				const response = await fetch(
					`https://api.beyondpresence.ai/v1/avatars/status/${jobId}`,
					{
						headers: {
							Authorization:
								"Bearer sk-PvPh48kdhOmSptufLxBgzil89GhXub2K4KI_rmLhP0w",
						},
					}
				);

				const data = await response.json();

				if (data.status === "completed" && data.video_url) {
					setVideoUrl(data.video_url);
					setGeneratingVideo(false);
					return;
				}

				if (data.status === "failed") {
					console.error("Video generation failed");
					setGeneratingVideo(false);
					return;
				}

				attempts++;
				if (attempts < maxAttempts) {
					setTimeout(poll, 2000); // Poll every 2 seconds
				} else {
					setGeneratingVideo(false);
				}
			} catch (error) {
				console.error("Error polling for video:", error);
				setGeneratingVideo(false);
			}
		};

		poll();
	};

	const handleContinue = () => {
		navigate(`/video/${sessionId}`);
	};

	if (loading) {
		return (
			<div className='greeting-container'>
				<div className='loading-spinner'>
					<div className='spinner'></div>
					<p>Preparing your AI greeting...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='greeting-container'>
			<div className='greeting-content'>
				<div className='avatar-header'>
					<h1>Welcome, {trainee?.trainee_name}!</h1>
					<p className='subtitle'>
						Your AI training assistant is ready to greet you
					</p>
				</div>

				<div className='avatar-video-section'>
					{generatingVideo ? (
						<div className='video-generating'>
							<div className='spinner'></div>
							<p>Generating your personalized AI greeting...</p>
						</div>
					) : videoUrl ? (
						<div className='avatar-video-container'>
							<video src={videoUrl} controls autoPlay className='avatar-video'>
								Your browser does not support the video tag.
							</video>
						</div>
					) : (
						<div className='avatar-video-container'>
							<div className='video-placeholder'>
								<div className='ai-avatar-icon'>🤖</div>
								<p>AI Avatar is preparing your greeting...</p>
							</div>
						</div>
					)}
				</div>

				<div className='greeting-message'>
					<div className='training-info'>
						<h3>What's Next?</h3>
						<div className='training-steps'>
							<div className='step active'>
								<span className='step-number'>1</span>
								<span className='step-text'>AI Greeting</span>
							</div>
							<div className='step'>
								<span className='step-number'>2</span>
								<span className='step-text'>Training Video</span>
							</div>
							<div className='step'>
								<span className='step-number'>3</span>
								<span className='step-text'>Assessment</span>
							</div>
							<div className='step'>
								<span className='step-number'>4</span>
								<span className='step-text'>Results</span>
							</div>
						</div>
					</div>

					<div className='action-buttons'>
						<button onClick={handleContinue} className='continue-button'>
							Continue to Training Video →
						</button>
						<p className='help-text'>
							The AI avatar will welcome you and explain the training process
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AvatarGreeting;
