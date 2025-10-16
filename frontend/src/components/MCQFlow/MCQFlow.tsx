/** @format */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	getQuestions,
	autoGenerateQuestions,
	submitAnswer,
	submitExam,
	MCQQuestion,
	ExamResults,
} from "../../services/api";
import Question from "./Question";
import "./MCQFlow.css";

// Avatar image - local image
const AVATAR_IMAGE_URL = "/avatar.jpg";

const MCQFlow: React.FC = () => {
	const navigate = useNavigate();
	const { sessionId } = useParams<{ sessionId: string }>();

	const [questions, setQuestions] = useState<MCQQuestion[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<{
		[key: number]: string;
	}>({});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [results, setResults] = useState<ExamResults | null>(null);

	// New states for real-time feedback
	const [showFeedback, setShowFeedback] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [correctAnswer, setCorrectAnswer] = useState("");
	const [autoAdvancing, setAutoAdvancing] = useState(false);

	// States for Laura feedback
	const [showLauraFeedback, setShowLauraFeedback] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [voicesLoaded, setVoicesLoaded] = useState(false);

	// Flag to prevent duplicate question generation
	const [questionsLoaded, setQuestionsLoaded] = useState(false);

	// Load voices
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
		if (!questionsLoaded) {
			loadQuestions();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	const loadQuestions = async () => {
		try {
			if (!sessionId) return;

			const data = await getQuestions(parseInt(sessionId));

			if (!data.questions || data.questions.length === 0) {
				// No questions exist, try to auto-generate them
				console.log("No questions found. Attempting to auto-generate...");
				try {
					const generateData = await autoGenerateQuestions(
						parseInt(sessionId),
						5 // Generate only 5 questions
					);
					setQuestions(generateData.questions);
					setQuestionsLoaded(true); // Mark as loaded
					setLoading(false);
					return;
				} catch (genErr: any) {
					console.error("Error auto-generating questions:", genErr);
					setError(
						"Failed to generate questions. Please try again or contact support."
					);
					setLoading(false);
					return;
				}
			}

			setQuestions(data.questions);
			setQuestionsLoaded(true); // Mark as loaded
			setLoading(false);
		} catch (err: any) {
			console.error("Error loading questions:", err);
			setError("Failed to load questions. Please try again.");
			setLoading(false);
		}
	};

	const handleAnswerSelect = (questionId: number, answer: string) => {
		setSelectedAnswers({
			...selectedAnswers,
			[questionId]: answer,
		});
	};

	const handleNext = async () => {
		const currentQuestion = questions[currentQuestionIndex];
		const selectedAnswer = selectedAnswers[currentQuestion.id];

		if (!selectedAnswer) {
			alert("Please select an answer before proceeding.");
			return;
		}

		// Submit answer to backend and get correctness
		try {
			if (sessionId) {
				const response = await submitAnswer(
					parseInt(sessionId),
					currentQuestion.id,
					selectedAnswer
				);

				// Show feedback with correct answer
				setIsCorrect(response.is_correct);
				setCorrectAnswer(response.correct_answer || "");
				setShowFeedback(true);
				setAutoAdvancing(true);

				// Auto-advance after 5 seconds
				setTimeout(() => {
					setShowFeedback(false);
					setAutoAdvancing(false);
					setCorrectAnswer("");

					// Move to next question or finish
					if (currentQuestionIndex < questions.length - 1) {
						setCurrentQuestionIndex(currentQuestionIndex + 1);
					} else {
						// Last question - submit exam
						handleSubmitExam();
					}
				}, 5000);
			}
		} catch (err) {
			console.error("Error submitting answer:", err);
			// Continue anyway
			if (currentQuestionIndex < questions.length - 1) {
				setCurrentQuestionIndex(currentQuestionIndex + 1);
			}
		}
	};

	const handleSubmitExam = async () => {
		setSubmitting(true);
		try {
			if (sessionId) {
				const examResults = await submitExam(parseInt(sessionId));
				setResults(examResults);
				// Show Laura feedback instead of results page
				setShowLauraFeedback(true);
				speakFeedback(examResults.feedback);
			}
		} catch (err: any) {
			console.error("Error submitting exam:", err);
			setError("Failed to submit exam. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const speakFeedback = (feedbackText: string) => {
		if (!("speechSynthesis" in window)) {
			console.error("Speech synthesis not supported");
			setTimeout(() => {
				navigate("/");
			}, 3000);
			return;
		}

		// Wait for voices if not loaded yet
		if (!voicesLoaded) {
			setTimeout(() => speakFeedback(feedbackText), 100);
			return;
		}

		window.speechSynthesis.cancel();
		setSpeaking(true);

		const utterance = new SpeechSynthesisUtterance(feedbackText);
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
			// Auto-navigate to home after feedback
			setTimeout(() => {
				navigate("/");
			}, 2000);
		};

		utterance.onerror = () => {
			setSpeaking(false);
			setTimeout(() => {
				navigate("/");
			}, 2000);
		};

		window.speechSynthesis.speak(utterance);
	};

	if (loading) {
		return (
			<div className='mcq-container'>
				{/* Small Laura Avatar - Top Middle */}
				<div className='small-avatar-container'>
					<img src={AVATAR_IMAGE_URL} alt='Laura' className='small-avatar' />
				</div>
				<div className='mcq-loader'>
					<div className='spinner'></div>
					<p>Loading your assessment...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='mcq-container'>
				<div className='mcq-error'>
					<h2>⚠️ Error</h2>
					<p>{error}</p>
					<button onClick={() => navigate(`/video/${sessionId}`)}>
						Return to Video
					</button>
				</div>
			</div>
		);
	}

	// Show Laura's Feedback (replaces old results page)
	if (showLauraFeedback && results) {
		return (
			<div className='mcq-container laura-feedback-container'>
				<div className='laura-feedback-wrapper'>
					<div className='laura-avatar-large'>
						<img
							src={AVATAR_IMAGE_URL}
							alt='Laura'
							className={speaking ? "speaking" : ""}
						/>
					</div>
					{speaking && (
						<div className='speaking-indicator-large'>
							<div className='pulse'></div>
							<span>Laura is providing feedback...</span>
						</div>
					)}
					{!speaking && (
						<div className='feedback-complete'>
							<p>✓ Feedback complete</p>
							<p className='redirect-message'>Redirecting to home...</p>
						</div>
					)}
					<div className='score-summary'>
						<div className='score-circle-small'>
							<span className='score'>{results.score}/5</span>
						</div>
						<p className='percentage'>
							{Math.round((results.score / 5) * 100)}% Correct
						</p>
					</div>
				</div>
			</div>
		);
	}

	const currentQuestion = questions[currentQuestionIndex];
	const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

	return (
		<div className='mcq-container'>
			{/* Small Laura Avatar - Top Middle */}
			<div className='small-avatar-container'>
				<img src={AVATAR_IMAGE_URL} alt='Laura' className='small-avatar' />
				<span className='avatar-label'>Laura</span>
			</div>

			<div className='mcq-wrapper'>
				<div className='mcq-header'>
					<h1>Assessment</h1>
					<div className='progress-bar'>
						<div
							className='progress-fill'
							style={{ width: `${progress}%` }}></div>
					</div>
					<p className='question-counter'>
						Question {currentQuestionIndex + 1} of {questions.length}
					</p>
				</div>

				<div className='mcq-card'>
					<Question
						question={currentQuestion}
						selectedAnswer={selectedAnswers[currentQuestion.id]}
						onAnswerSelect={(answer) =>
							handleAnswerSelect(currentQuestion.id, answer)
						}
						showFeedback={showFeedback}
						isCorrect={isCorrect}
						correctAnswer={correctAnswer}
					/>

					{/* Real-time Feedback Display */}
					{showFeedback && (
						<div
							className={`feedback-banner ${
								isCorrect ? "correct" : "incorrect"
							}`}>
							<div className='feedback-icon'>{isCorrect ? "✓" : "✗"}</div>
							<div className='feedback-text'>
								<strong>{isCorrect ? "Correct!" : "Incorrect"}</strong>
								<p>
									{isCorrect ? "Well done!" : "Better luck with the next one"}
								</p>
							</div>
							{autoAdvancing && (
								<div className='auto-advance-timer'>
									<span>Next question in 5s...</span>
								</div>
							)}
						</div>
					)}

					<div className='navigation-buttons'>
						<button
							className='nav-button next'
							onClick={handleNext}
							disabled={
								!selectedAnswers[currentQuestion.id] ||
								showFeedback ||
								submitting
							}>
							{submitting
								? "Submitting..."
								: currentQuestionIndex < questions.length - 1
								? "Next →"
								: "Finish"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MCQFlow;
