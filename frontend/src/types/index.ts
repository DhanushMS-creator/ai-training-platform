export type Trainee = {
    id: number;
    name: string;
    jobTitle: string;
    industry: string;
};

export type Course = {
    id: number;
    title: string;
    description: string;
    videoUrl: string;
};

export type Video = {
    id: number;
    title: string;
    url: string;
};

export type Question = {
    id: number;
    text: string;
    options: string[];
    correctAnswer: string;
};

export type Assessment = {
    id: number;
    title: string;
    questions: Question[];
};