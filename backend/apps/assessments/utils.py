"""
Utilities for AI-powered assessment generation
"""
import os
import json
import google.generativeai as genai
from PyPDF2 import PdfReader
from typing import List, Dict


# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', 'AIzaSyBmhEYXn1dqD_PiRlnVWtp5XOII50uLuYM')
genai.configure(api_key=GOOGLE_API_KEY)


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text content from a PDF file
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Extracted text as string
    """
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error extracting PDF text: {str(e)}")


def generate_mcq_questions(
    job_title: str,
    industry: str,
    pdf_content: str,
    num_questions: int = 10
) -> List[Dict]:
    """
    Generate MCQ questions using Google Gemini based on job context and PDF content
    
    Args:
        job_title: Trainee's job title
        industry: Trainee's industry
        pdf_content: Text extracted from training PDF
        num_questions: Number of questions to generate
        
    Returns:
        List of question dictionaries with structure:
        {
            'question_text': str,
            'option_a': str,
            'option_b': str,
            'option_c': str,
            'option_d': str,
            'correct_answer': str (A/B/C/D),
            'explanation': str
        }
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
You are an expert corporate training assessment designer. Generate {num_questions} multiple-choice questions (MCQs) for a training assessment.

**Trainee Context:**
- Job Title: {job_title}
- Industry: {industry}

**Training Material:**
{pdf_content[:8000]}  # Limit to avoid token limits

**Requirements:**
1. Generate exactly {num_questions} questions that are relevant to both the trainee's role and the training material
2. Questions should test practical knowledge applicable to their job
3. Each question must have 4 options (A, B, C, D)
4. Only ONE option should be correct
5. Include a brief explanation for the correct answer
6. Make questions progressively challenging (easy → medium → hard)

**Output Format (JSON):**
Return ONLY a valid JSON array with this exact structure:
[
  {{
    "question_text": "Question text here?",
    "option_a": "First option",
    "option_b": "Second option",
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "A",
    "explanation": "Brief explanation of why this is correct"
  }}
]

Generate the questions now:
"""
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        questions = json.loads(response_text)
        
        # Validate structure
        for q in questions:
            required_fields = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer']
            if not all(field in q for field in required_fields):
                raise ValueError("Generated questions missing required fields")
        
        return questions
    
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Gemini response as JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Error generating MCQ questions: {str(e)}")


def generate_personalized_feedback(
    trainee_name: str,
    job_title: str,
    industry: str,
    score: int,
    total: int,
    incorrect_questions: List[Dict]
) -> str:
    """
    Generate personalized feedback using Gemini
    
    Args:
        trainee_name: Trainee's name
        job_title: Trainee's job title
        industry: Trainee's industry
        score: Number of correct answers
        total: Total number of questions
        incorrect_questions: List of questions answered incorrectly
        
    Returns:
        Personalized feedback text
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        percentage = (score / total) * 100
        
        incorrect_summary = "\n".join([
            f"- {q['question_text'][:100]}... (Correct: {q['correct_answer']})"
            for q in incorrect_questions[:5]  # Limit to 5
        ])
        
        prompt = f"""
You are a supportive corporate training coach. Provide personalized feedback for a trainee.

**Trainee Profile:**
- Name: {trainee_name}
- Job Title: {job_title}
- Industry: {industry}

**Assessment Results:**
- Score: {score}/{total} ({percentage:.1f}%)
- Incorrect Questions:
{incorrect_summary}

**Task:**
Write encouraging, constructive feedback (200-300 words) that:
1. Congratulates them on their performance
2. Highlights areas of strength
3. Provides specific improvement recommendations relevant to their role
4. Encourages continued learning
5. Maintains a positive, professional tone

Generate the feedback now:
"""
        
        response = model.generate_content(prompt)
        return response.text.strip()
    
    except Exception as e:
        # Fallback feedback if Gemini fails
        percentage = (score / total) * 100
        return f"""
Dear {trainee_name},

Thank you for completing the training assessment. You scored {score} out of {total} ({percentage:.1f}%).

{"Excellent work! You demonstrated strong understanding of the material." if percentage >= 80 else "Good effort! There's room for improvement in some areas."}

As a {job_title} in the {industry} industry, it's important to continue developing your skills. 
We recommend reviewing the training material and focusing on the areas where you missed questions.

Keep up the great work!
"""
