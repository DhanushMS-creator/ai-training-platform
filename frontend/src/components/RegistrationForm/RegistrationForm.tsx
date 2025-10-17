/** @format */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerTrainee, TraineeRegistration } from "../../services/api";
import "./RegistrationForm.css";

// Avatar image - same as video page
const AVATAR_IMAGE_URL = "/avatar.jpg";

interface RegistrationFormProps {
	onRegistrationComplete?: (sessionId: number) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
	onRegistrationComplete,
}) => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<TraineeRegistration>({
		name: "",
		job_title: "",
		industry: "",
		company: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await registerTrainee(formData);
			console.log("Registration successful:", response);

			// Store session info in localStorage
			localStorage.setItem("trainee_id", response.trainee_id);
			localStorage.setItem("session_id", response.session_id);
			localStorage.setItem("trainee_name", response.name);

			// Callback or navigate
			if (onRegistrationComplete) {
				onRegistrationComplete(response.session_id);
			} else {
				navigate(`/greeting/${response.session_id}`);
			}
		} catch (err: any) {
			console.error("Registration error:", err);
			setError(err.message || "Registration failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='registration-container'>
			{/* Small Laura Avatar - Top Middle */}
			<div className='small-avatar-container'>
				<img src={AVATAR_IMAGE_URL} alt='Laura' className='small-avatar' />
			</div>

			<div className='registration-card'>
				<p className='subtitle'>Enter your info to continue</p>
				{error && <div className='error-message'>{error}</div>}{" "}
				<form className='registration-form' onSubmit={handleSubmit}>
					<div className='form-group'>
						<label htmlFor='name'>Full Name *</label>
						<input
							type='text'
							id='name'
							name='name'
							value={formData.name}
							onChange={handleChange}
							placeholder='Enter your full name'
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='job_title'>Job Title *</label>
						<input
							type='text'
							id='job_title'
							name='job_title'
							value={formData.job_title}
							onChange={handleChange}
							placeholder='e.g., Software Engineer, Marketing Manager'
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='industry'>Industry *</label>
						<input
							type='text'
							id='industry'
							name='industry'
							value={formData.industry}
							onChange={handleChange}
							placeholder='e.g., Technology, Healthcare, Finance'
							required
						/>
					</div>

					<button type='submit' className='submit-button' disabled={loading}>
						{loading ? "Registering..." : "Begin Training"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default RegistrationForm;
