/** @format */

import React from "react";
import { MCQQuestion } from "../../services/api";

interface QuestionProps {
	question: MCQQuestion;
	selectedAnswer?: string;
	onAnswerSelect: (answer: string) => void;
}

const Question: React.FC<QuestionProps> = ({
	question,
	selectedAnswer,
	onAnswerSelect,
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
				{options.map((option) => (
					<div
						key={option.label}
						className={`option-card ${
							selectedAnswer === option.label ? "selected" : ""
						}`}
						onClick={() => onAnswerSelect(option.label)}>
						<div className='option-label'>{option.label}</div>
						<div className='option-text'>{option.text}</div>
						<div className='option-radio'>
							{selectedAnswer === option.label && (
								<div className='radio-selected'></div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Question;
