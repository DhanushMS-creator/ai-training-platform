/** @format */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, updateSessionStatus } from "../../services/api";
import api from "../../services/api";
import "./AvatarGreeting.css";

const AvatarGreeting: React.FC = () => {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [trainee, setTrainee] = useState<any>(null);
	const [videoUrl, setVideoUrl] = useState("");
	const [generatingVideo, setGeneratingVideo] = useState(true);
	const [error, setError] = useState("");

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

			// Generate avatar greeting video
			await generateAvatarVideo();

			setLoading(false);
		} catch (error) {
			console.error("Error loading session:", error);
			setError("Failed to load session");
			setLoading(false);
		}
	};

	const generateAvatarVideo = async () => {
		try {
			setGeneratingVideo(true);

			const response = await api.post(
				`/api/users/sessions/${sessionId}/avatar-greeting/`
			);

			const data = response.data;

			if (data.video_url) {
				// Video is ready immediately
				setVideoUrl(data.video_url);
				setGeneratingVideo(false);
			} else if (data.job_id) {
				// Poll for video completion
				await pollForVideo(data.job_id);
			} else {
				// For demo purposes, use a placeholder or skip video generation
				console.log("No video URL or job ID returned");
				setGeneratingVideo(false);
			}
		} catch (error) {
			console.error("Error generating avatar video:", error);
			setError("Failed to generate avatar video");
			setGeneratingVideo(false);
		}
	};

	const pollForVideo = async (jobId: string) => {
		const maxAttempts = 30;
		let attempts = 0;

		const poll = async () => {
			try {
				const response = await api.get(`/api/users/avatar-status/${jobId}/`);
				const data = response.data;

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

	if (error) {
		return (
			<div className='greeting-container'>
				<div className='error-message'>
					<p>{error}</p>
					<button onClick={handleContinue} className='continue-button'>
						Skip to Training Video →
					</button>
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
							<p className='small-text'>This may take 20-30 seconds</p>
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
								<p>AI Avatar greeting will appear here</p>
								<button onClick={handleContinue} className='skip-button'>
									Skip to Training Video
								</button>
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
							The AI avatar welcomes you and explains the training process
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AvatarGreeting;
