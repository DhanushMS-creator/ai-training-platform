/** @format */

import React from "react";
import { MCQQuestion } from "../../services/api";

interface QuestionProps {
	question: MCQQuestion;
	selectedAnswer?: string;
	onAnswerSelect: (answer: string) => void;
	showFeedback?: boolean;
	isCorrect?: boolean;
	correctAnswer?: string;
}

const Question: React.FC<QuestionProps> = ({
	question,
	selectedAnswer,
	onAnswerSelect,
	showFeedback = false,
	isCorrect = false,
	correctAnswer = "",
}) => {
	const options = [
		{ label: "A", text: question.option_a },
		{ label: "B", text: question.option_b },
		{ label: "C", text: question.option_c },
		{ label: "D", text: question.option_d },
	];

	return (
		<div className='question-container'>
			<h2 className='question-text'>{question.question_text}</h2>

			<div className='options-container'>
				{options.map((option) => {
					const isSelected = selectedAnswer === option.label;
					const isCorrectOption =
						showFeedback && correctAnswer === option.label;
					const showCorrect = showFeedback && isCorrect && isSelected;
					const showIncorrect = showFeedback && !isCorrect && isSelected;

					return (
						<div
							key={option.label}
							className={`option-card ${isSelected ? "selected" : ""} ${
								showCorrect ? "correct-feedback" : ""
							} ${showIncorrect ? "incorrect-feedback" : ""} ${
								isCorrectOption && !isCorrect ? "correct-answer-highlight" : ""
							}`}
							onClick={() => !showFeedback && onAnswerSelect(option.label)}>
							<div className='option-label'>{option.label}</div>
							<div className='option-text'>{option.text}</div>
							<div className='option-radio'>
								{isSelected && <div className='radio-selected'></div>}
							</div>
							{showCorrect && <div className='feedback-icon'>✓</div>}
							{showIncorrect && <div className='feedback-icon'>✗</div>}
							{isCorrectOption && !isCorrect && (
								<div className='correct-badge'>Correct Answer</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Question;
