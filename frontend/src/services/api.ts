/** @format */

import axios from "axios";

const API_BASE_URL =
	process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		"ngrok-skip-browser-warning": "true", // Skip ngrok browser warning for free tier
	},
});

// Types
export interface TraineeRegistration {
	name: string;
	job_title: string;
	industry: string;
	company?: string;
}

export interface TrainingSession {
	id: number;
	trainee: number;
	trainee_name: string;
	status: string;
	video_url?: string;
	video_completed: boolean;
	mcq_score?: number;
	mcq_total?: number;
	started_at: string;
	completed_at?: string;
}

export interface MCQQuestion {
	id: number;
	question_text: string;
	option_a: string;
	option_b: string;
	option_c: string;
	option_d: string;
	explanation?: string;
}

export interface ExamResults {
	score: number;
	total: number;
	percentage: number;
	feedback: string;
	questions_review: any[];
}

// User/Trainee APIs
export const registerTrainee = async (data: TraineeRegistration) => {
	const response = await api.post("/users/register/", data);
	return response.data;
};

export const getSession = async (
	sessionId: number
): Promise<TrainingSession> => {
	const response = await api.get(`/users/sessions/${sessionId}/`);
	return response.data;
};

export const updateSessionStatus = async (
	sessionId: number,
	status: string
) => {
	const response = await api.post(`/users/sessions/${sessionId}/status/`, {
		status,
	});
	return response.data;
};

export const updateSession = async (
	sessionId: number,
	data: Partial<TrainingSession>
) => {
	const response = await api.patch(`/users/sessions/${sessionId}/`, data);
	return response.data;
};

export const getLiveKitToken = async (sessionId: number) => {
	const response = await api.post(
		`/users/sessions/${sessionId}/livekit-token/`
	);
	return response.data;
};

// Assessment APIs
export const generateQuestions = async (
	sessionId: number,
	pdfFile: File,
	numQuestions: number = 10
) => {
	const formData = new FormData();
	formData.append("pdf_file", pdfFile);
	formData.append("num_questions", numQuestions.toString());

	const response = await api.post(
		`/assessments/sessions/${sessionId}/generate/`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);
	return response.data;
};

export const autoGenerateQuestions = async (
	sessionId: number,
	numQuestions: number = 10
) => {
	const response = await api.post(
		`/assessments/sessions/${sessionId}/auto-generate/`,
		{ num_questions: numQuestions }
	);
	return response.data;
};

export const getQuestions = async (
	sessionId: number
): Promise<{ questions: MCQQuestion[] }> => {
	const response = await api.get(
		`/assessments/sessions/${sessionId}/questions/`
	);
	return response.data;
};

export const submitAnswer = async (
	sessionId: number,
	questionId: number,
	selectedAnswer: string
) => {
	const response = await api.post(
		`/assessments/sessions/${sessionId}/answer/`,
		{
			question_id: questionId,
			selected_answer: selectedAnswer,
		}
	);
	return response.data;
};

export const submitExam = async (sessionId: number): Promise<ExamResults> => {
	const response = await api.post(`/assessments/sessions/${sessionId}/submit/`);
	return response.data;
};

export default api;
