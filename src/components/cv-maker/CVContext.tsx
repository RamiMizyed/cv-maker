// components/cv-maker/CVContext.tsx
"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
	CVData,
	PersonalInfo,
	Experience,
	Education,
	Project,
} from "@/types/cv";
import GOOGLE_FONTS from "@/lib/fontList";
import { useLang } from "@/lib/lang";

// Helper to get default font based on language
const getDefaultFont = (lang: string) => {
	switch (lang) {
		case "ar":
			return GOOGLE_FONTS.arabic[0].value;
		case "tr":
			return GOOGLE_FONTS.turkish[0].value;
		default:
			return GOOGLE_FONTS.english[0].value;
	}
};

// Initial State
// Initial State
const getInitialState = (lang: string): CVData => ({
	personalInfo: {
		name: "Philip J. Fry",
		title: "Senior Frontend Developer",
		email: "alex.johnson.dev@example.com",
		phone: "+1 (555) 987-6543",
		website: "ramimizyed.dev",
		github: "github.com/ramimizyed",
		summary:
			"Creative and detail-oriented Senior Frontend Developer with 7+ years of experience building scalable web applications. Passionate about crafting clean user experiences, leading engineering teams, and driving accessibility and performance improvements.",
		portrait: "/assets/Cat_01.png",
	},
	experience: [
		{
			id: 1,
			company: "TechWave Solutions",
			position: "Senior Frontend Developer",
			startDate: "Jan 2021",
			endDate: "Present",
			description:
				"Led a team of 5 engineers in developing a design system adopted across 3 company products.\n" +
				"Architected and migrated a legacy React codebase to Next.js with TypeScript, reducing load times by 35%.\n" +
				"Collaborated with designers and product managers to deliver accessible, responsive interfaces used by 1M+ users.",
		},
	],
	education: [
		{
			id: 1,
			institution: "State University",
			degree: "B.S. in Computer Science",
			startDate: "Aug 2011",
			endDate: "May 2015",
		},
	],
	projects: [
		{
			id: 1,
			name: "GreenTrack – Sustainability Dashboard",
			description:
				"Developed an interactive dashboard visualizing environmental data with charts and 3D models.\n" +
				"Integrated APIs for live CO₂ tracking and renewable energy stats.",
			link: "github.com/alexjohnson/greentrack",
			technologies: "React, Next.js, D3.js, TailwindCSS",
		},
	],
	skills:
		"JavaScript (ES6+), TypeScript, React, Next.js, HTML5, CSS3, TailwindCSS, Redux, GraphQL, Node.js, Express, PostgreSQL, Git, Docker, Jest, Cypress, Accessibility (WCAG), Agile/Scrum",
	selectedFont: getDefaultFont(lang),
});

// Reducer Actions
type Action =
	| {
			type: "UPDATE_PERSONAL_INFO";
			payload: { field: keyof PersonalInfo; value: string };
	  }
	| {
			type: "UPDATE_EXPERIENCE";
			payload: { id: number; field: keyof Experience; value: string };
	  }
	| { type: "ADD_EXPERIENCE" }
	| { type: "REMOVE_EXPERIENCE"; payload: { id: number } }
	| {
			type: "UPDATE_EDUCATION";
			payload: { id: number; field: keyof Education; value: string };
	  }
	| { type: "ADD_EDUCATION" }
	| { type: "REMOVE_EDUCATION"; payload: { id: number } }
	| {
			type: "UPDATE_PROJECT";
			payload: { id: number; field: keyof Project; value: string };
	  }
	| { type: "ADD_PROJECT" }
	| { type: "REMOVE_PROJECT"; payload: { id: number } }
	| { type: "UPDATE_SKILLS"; payload: string }
	| { type: "SET_FONT"; payload: string };

// Reducer Function
const cvReducer = (state: CVData, action: Action): CVData => {
	switch (action.type) {
		case "UPDATE_PERSONAL_INFO":
			return {
				...state,
				personalInfo: {
					...state.personalInfo,
					[action.payload.field]: action.payload.value,
				},
			};
		case "UPDATE_EXPERIENCE":
			return {
				...state,
				experience: state.experience.map((exp) =>
					exp.id === action.payload.id
						? { ...exp, [action.payload.field]: action.payload.value }
						: exp
				),
			};
		case "ADD_EXPERIENCE":
			const newExpId =
				state.experience.length > 0
					? Math.max(...state.experience.map((e) => e.id)) + 1
					: 1;
			return {
				...state,
				experience: [
					...state.experience,
					{
						id: newExpId,
						company: "",
						position: "",
						startDate: "",
						endDate: "",
						description: "",
					},
				],
			};
		case "REMOVE_EXPERIENCE":
			if (state.experience.length <= 1) return state;
			return {
				...state,
				experience: state.experience.filter(
					(exp) => exp.id !== action.payload.id
				),
			};
		case "UPDATE_EDUCATION":
			return {
				...state,
				education: state.education.map((edu) =>
					edu.id === action.payload.id
						? { ...edu, [action.payload.field]: action.payload.value }
						: edu
				),
			};
		case "ADD_EDUCATION":
			const newEduId =
				state.education.length > 0
					? Math.max(...state.education.map((e) => e.id)) + 1
					: 1;
			return {
				...state,
				education: [
					...state.education,
					{
						id: newEduId,
						institution: "",
						degree: "",
						startDate: "",
						endDate: "",
					},
				],
			};
		case "REMOVE_EDUCATION":
			if (state.education.length <= 1) return state;
			return {
				...state,
				education: state.education.filter(
					(edu) => edu.id !== action.payload.id
				),
			};
		case "UPDATE_PROJECT":
			return {
				...state,
				projects: state.projects.map((proj) =>
					proj.id === action.payload.id
						? { ...proj, [action.payload.field]: action.payload.value }
						: proj
				),
			};
		case "ADD_PROJECT":
			const newProjId =
				state.projects.length > 0
					? Math.max(...state.projects.map((p) => p.id)) + 1
					: 1;
			return {
				...state,
				projects: [
					...state.projects,
					{
						id: newProjId,
						name: "",
						description: "",
						link: "",
						technologies: "",
					},
				],
			};
		case "REMOVE_PROJECT":
			if (state.projects.length <= 1) return state;
			return {
				...state,
				projects: state.projects.filter(
					(proj) => proj.id !== action.payload.id
				),
			};
		case "UPDATE_SKILLS":
			return { ...state, skills: action.payload };
		case "SET_FONT":
			return { ...state, selectedFont: action.payload };
		default:
			return state;
	}
};

// Context
const CVContext = createContext<
	{ state: CVData; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

// Provider
export const CVProvider = ({ children }: { children: ReactNode }) => {
	const { lang } = useLang();
	const initialState = getInitialState(lang);
	const [state, dispatch] = useReducer(cvReducer, initialState);

	return (
		<CVContext.Provider value={{ state, dispatch }}>
			{children}
		</CVContext.Provider>
	);
};

// Custom Hook
export const useCV = () => {
	const context = useContext(CVContext);
	if (!context) {
		throw new Error("useCV must be used within a CVProvider");
	}
	return context;
};
