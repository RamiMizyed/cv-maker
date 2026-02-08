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
const getInitialState = (lang: string): CVData => ({
	personalInfo: {
		name: "Rami Mizyed",
		title: "Full-stack developer | Content Creator & Client Success Manager",
		email: "me@ramimizyed.dev",
		phone: "+90 (553) 841-8269",
		website: "ramimizyed.dev",
		github: "github.com/ramimizyed",
		summary:
			"Full-stack developer (React/Next.js/Node) with 5 years building and scaling production web apps end-to-end (UI, APIs, DB, cloud). Led teams, rebuilt legacy systems, and automated workflows with Python + Zapier/n8n. Strong in design, performance, accessibility (WCAG), and shipping products that reduce ops work and improve UX. Trilingual: EN/AR/TR.",
		portrait: "/assets/Cat_01.png",
	},
	experience: [
		{
			id: 1,
			company: "Global Campus of Human Rights",
			companyUrl: "https://globalcampusalumni.org/",
			position: "Lead Web Developer",
			startDate: "2024",
			endDate: "Present",
			description:
				"Built Alumni Portal from 01 using Next.js/React + Node + (DB), shipping core features (auth, profiles, search, admin tools).\n" +
				"Optimized the platform for SEO to increase organic reach while maintaining rigorous security protocols and database integrity for sensitive alumni data.\n" +
				"Implemented mobile-first responsive design and adhered to WCAG accessibility standards, ensuring the platform is inclusive and performant across all devices.",
		},
		{
			id: 2,
			company: "Cascade Clarity AI",
			companyUrl: "https://cascadeclarity.ai/",
			position: "AI Automation Engineer",
			startDate: "2023",
			endDate: "2024",
			description:
				"Designed enterprise-grade automation architectures using n8n and Zapier, integrating disparate business tools to remove data silos.\n" +
				"Developed custom Python scripts to connect LLMs with client databases, automating complex text analysis and reporting tasks.\n" +
				"Delivered solutions that reduced client administrative workload by automating manual data entry and lead qualification processes.",
		},
		{
			id: 3,
			company: "Salesmrkt",
			companyUrl: "https://salesmrkt.com/",
			position: "Technical Lead & Client Success Manager",
			startDate: "2021",
			endDate: "2023",
			description:
				"Spearheaded the complete re-engineering of the legacy platform using React.js and Node.js. Migrated database infrastructure to MongoDB, significantly improving query speeds and platform responsiveness.\n" +
				"Served as the primary technical liaison for investors and key accounts, translating technical roadmaps into business value and securing stakeholder buy-in.\n" +
				"Worked directly in Figma with design teams to ensure technical feasibility of high-fidelity prototypes before implementation.",
		},
		{
			id: 4,
			company: "BlueClip (Partnered with JellySmack)",
			companyUrl: "https://jellysmack.com/",
			position: "Multimedia Content Specialist",
			startDate: "2018",
			endDate: "2020",
			description:
				"Produced and edited high-performing content for Fashion and Wellness verticals using Adobe Creative Suite (Premiere, After Effects).\n" +
				"Leveraged technical understanding of algorithms to optimize content for social platforms, driving consistent engagement growth.",
		},
	],
	projects: [
		{
			id: 1,
			name: "Green Awareness - Carbon Output",
			link: "https://greenawareness.org/",
			technologies: "React, Next.js, D3.js, TailwindCSS",
			description:
				"Developed an interactive dashboard visualizing environmental data with charts and 3D models.\n" +
				"Integrated APIs for live CO₂ tracking and renewable energy stats.",
		},
		{
			id: 2,
			name: "CV Maker",
			link: "https://cvmaker.ramimizyed.dev/",
			technologies: "TailwindCSS, NodeJS, NextJS",
			description: "Made this CV with this lol — AI Powered CV maker.",
		},
		{
			id: 3,
			name: "EZ Survey Pro",
			link: "https://ezsurveypro.com/",
			technologies: "NodeJS, Next.js, TailwindCSS",
			description:
				"Survey platform with clean UX for fast, frictionless responses.",
		},
		{
			id: 4,
			name: "BTS Studios",
			link: "https://btsstudios.com/",
			technologies: "GSAP + Framer Motion, TailwindCSS",
			description:
				"Agency website rebuilt with performance and elegance in mind.",
		},
		{
			id: 5,
			name: "Democracy-101",
			link: "https://www.democracy-101.org/",
			technologies: "Full Stack",
			description: "Democracy 101 feed-native civic education",
		},
	],
	education: [
		{
			id: 1,
			institution: "Ankara University",
			degree: "Bachelor of Science in Computer Science (Graduated with Honors)",
			startDate: "Aug 2017",
			endDate: "May 2021",
		},
		{
			id: 2,
			institution: "U.S. Department of State",
			degree: "Kennedy-Lugar Youth Exchange & Study (YES) Scholarship",
			startDate: "2013",
			endDate: "2015",
		},
	],
	skills:
		"React.js, Next.js, TypeScript, JavaScript (ES6+), TailwindCSS, GSAP, Framer Motion, Redux, Zustand, Three.js, Node.js, Express.js, PostgreSQL, Prisma, Python, .NET, REST APIs, GraphQL, Docker, AWS, EC2, S3, Lambda, GitHub Actions, CI/CD, Nginx, UI/UX Design, Design Systems, Figma, WCAG Accessibility, Responsive Design, Agile, Scrum, SEO Optimization, Performance Tuning, AI, API Integration, OpenAI, LangChain",
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
	| { type: "SET_FONT"; payload: string }
	| { type: "SET_ALL"; payload: CVData };

// Reducer Function
const cvReducer = (state: CVData, action: Action): CVData => {
	switch (action.type) {
		case "UPDATE_PERSONAL_INFO": {
			return {
				...state,
				personalInfo: {
					...state.personalInfo,
					[action.payload.field]: action.payload.value,
				},
			};
		}

		case "UPDATE_EXPERIENCE": {
			return {
				...state,
				experience: state.experience.map((exp) =>
					exp.id === action.payload.id
						? { ...exp, [action.payload.field]: action.payload.value }
						: exp,
				),
			};
		}

		case "ADD_EXPERIENCE": {
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
						companyUrl: "",
						position: "",
						startDate: "",
						endDate: "",
						description: "",
					} as Experience,
				],
			};
		}

		case "REMOVE_EXPERIENCE": {
			if (state.experience.length <= 1) return state;
			return {
				...state,
				experience: state.experience.filter(
					(exp) => exp.id !== action.payload.id,
				),
			};
		}

		case "UPDATE_EDUCATION": {
			return {
				...state,
				education: state.education.map((edu) =>
					edu.id === action.payload.id
						? { ...edu, [action.payload.field]: action.payload.value }
						: edu,
				),
			};
		}

		case "ADD_EDUCATION": {
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
		}

		case "REMOVE_EDUCATION": {
			if (state.education.length <= 1) return state;
			return {
				...state,
				education: state.education.filter(
					(edu) => edu.id !== action.payload.id,
				),
			};
		}

		case "UPDATE_PROJECT": {
			return {
				...state,
				projects: state.projects.map((proj) =>
					proj.id === action.payload.id
						? { ...proj, [action.payload.field]: action.payload.value }
						: proj,
				),
			};
		}

		case "ADD_PROJECT": {
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
		}

		case "REMOVE_PROJECT": {
			if (state.projects.length <= 1) return state;
			return {
				...state,
				projects: state.projects.filter(
					(proj) => proj.id !== action.payload.id,
				),
			};
		}

		case "UPDATE_SKILLS": {
			return { ...state, skills: action.payload };
		}

		case "SET_FONT": {
			return { ...state, selectedFont: action.payload };
		}

		case "SET_ALL": {
			return action.payload;
		}

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
