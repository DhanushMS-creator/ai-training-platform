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
	const [showResults, setShowResults] = useState(false);

	useEffect(() => {
		loadQuestions();
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
						10
					);
					setQuestions(generateData.questions);
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

		// Submit answer to backend
		try {
			if (sessionId) {
				await submitAnswer(
					parseInt(sessionId),
					currentQuestion.id,
					selectedAnswer
				);
			}
		} catch (err) {
			console.error("Error submitting answer:", err);
		}

		// Move to next question
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		}
	};

	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const handleSubmitExam = async () => {
		// Check if all questions are answered
		const unansweredQuestions = questions.filter((q) => !selectedAnswers[q.id]);
		if (unansweredQuestions.length > 0) {
			const confirmSubmit = window.confirm(
				`You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit?`
			);
			if (!confirmSubmit) return;
		}

		setSubmitting(true);
		try {
			if (sessionId) {
				const examResults = await submitExam(parseInt(sessionId));
				setResults(examResults);
				setShowResults(true);
			}
		} catch (err: any) {
			console.error("Error submitting exam:", err);
			setError("Failed to submit exam. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className='mcq-container'>
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

	if (showResults && results) {
		return (
			<div className='mcq-container'>
				<div className='results-card'>
					<div className='results-header'>
						<div className='score-circle'>
							<div className='score-text'>
								<span className='score-number'>{results.score}</span>
								<span className='score-divider'>/</span>
								<span className='score-total'>{results.total}</span>
							</div>
							<div className='percentage'>{results.percentage.toFixed(0)}%</div>
						</div>
						<h2>Assessment Complete!</h2>
						<p className='score-message'>
							{results.percentage >= 80
								? "🎉 Excellent Work!"
								: results.percentage >= 60
								? "👍 Good Job!"
								: "💪 Keep Learning!"}
						</p>
					</div>

					<div className='feedback-section'>
						<h3>Personalized Feedback</h3>
						<div className='feedback-content'>
							<p>{results.feedback}</p>
						</div>
					</div>

					<div className='questions-review'>
						<h3>Questions Review</h3>
						{results.questions_review.map((question, index) => (
							<div key={question.id} className='review-question'>
								<div className='question-header'>
									<span className='question-number'>Question {index + 1}</span>
									<span
										className={`answer-badge ${
											selectedAnswers[question.id] === question.correct_answer
												? "correct"
												: "incorrect"
										}`}>
										{selectedAnswers[question.id] === question.correct_answer
											? "✓ Correct"
											: "✗ Incorrect"}
									</span>
								</div>
								<p className='question-text'>{question.question_text}</p>
								<div className='answer-options'>
									<div
										className={`option ${
											question.correct_answer === "A" ? "correct-answer" : ""
										} ${
											selectedAnswers[question.id] === "A" ? "selected" : ""
										}`}>
										A) {question.option_a}
									</div>
									<div
										className={`option ${
											question.correct_answer === "B" ? "correct-answer" : ""
										} ${
											selectedAnswers[question.id] === "B" ? "selected" : ""
										}`}>
										B) {question.option_b}
									</div>
									<div
										className={`option ${
											question.correct_answer === "C" ? "correct-answer" : ""
										} ${
											selectedAnswers[question.id] === "C" ? "selected" : ""
										}`}>
										C) {question.option_c}
									</div>
									<div
										className={`option ${
											question.correct_answer === "D" ? "correct-answer" : ""
										} ${
											selectedAnswers[question.id] === "D" ? "selected" : ""
										}`}>
										D) {question.option_d}
									</div>
								</div>
								{question.explanation && (
									<div className='explanation'>
										<strong>Explanation:</strong> {question.explanation}
									</div>
								)}
							</div>
						))}
					</div>

					<button className='finish-button' onClick={() => navigate("/")}>
						Return to Home
					</button>
				</div>
			</div>
		);
	}

	const currentQuestion = questions[currentQuestionIndex];
	const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

	return (
		<div className='mcq-container'>
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
					/>

					<div className='navigation-buttons'>
						<button
							className='nav-button prev'
							onClick={handlePrevious}
							disabled={currentQuestionIndex === 0}>
							← Previous
						</button>

						{currentQuestionIndex < questions.length - 1 ? (
							<button className='nav-button next' onClick={handleNext}>
								Next →
							</button>
						) : (
							<button
								className='nav-button submit'
								onClick={handleSubmitExam}
								disabled={submitting}>
								{submitting ? "Submitting..." : "Submit Exam"}
							</button>
						)}
					</div>

					{/* Question Navigator */}
					<div className='question-navigator'>
						<p>Jump to question:</p>
						<div className='question-dots'>
							{questions.map((q, index) => (
								<button
									key={q.id}
									className={`dot ${
										index === currentQuestionIndex ? "active" : ""
									} ${selectedAnswers[q.id] ? "answered" : ""}`}
									onClick={() => setCurrentQuestionIndex(index)}
									title={`Question ${index + 1}`}>
									{index + 1}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MCQFlow;
