"use client";
import React, { useState, useRef, useEffect, forwardRef } from "react";

import jsPDF from "jspdf";
import { FolderGit2Icon, GithubIcon, XIcon } from "lucide-react";
import UserIcon from "../icons/UserIcon";
import Trash2Icon from "../icons/Trash2Icon";
import PlusIcon from "../icons/PlusIcon";
import PrinterIcon from "../icons/PrinterIcon";
import MailIcon from "../icons/MailIcon";
import PhoneIcon from "../icons/PhoneIcon";
import GlobeIcon from "../icons/GlobeIcon";
import BriefcaseIcon from "../icons/BriefCaseIcon";
import GraduationCapIcon from "../icons/GradCapIcon";
import WrenchIcon from "../icons/WrenchIcon";
import translations from "../lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { useLang } from "@/lib/lang";

// Main CV Maker Component
// --- I18N Dictionary ---

export default function CVMaker() {
	// Add this near the top of your component
	const GOOGLE_FONTS = [
		{
			label: "Roboto",
			value: "Roboto",
			url: "https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap",
		},
		{
			label: "Open Sans",
			value: "Open Sans",
			url: "https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap",
		},
		{
			label: "Lato",
			value: "Lato",
			url: "https://fonts.googleapis.com/css?family=Lato:400,700&display=swap",
		},
		{
			label: "Montserrat",
			value: "Montserrat",
			url: "https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap",
		},
		{
			label: "Nunito",
			value: "Nunito",
			url: "https://fonts.googleapis.com/css?family=Nunito:400,700&display=swap",
		},
	];
	const [selectedFont, setSelectedFont] = useState(GOOGLE_FONTS[0].value);
	const { lang } = useLang();
	const t = translations[lang];
	const isRtl = lang === "ar";

	type TabId = "personal" | "experience" | "education" | "skills" | "projects";
	const [activeTab, setActiveTab] = useState<TabId>("personal");
	const cvPreviewRef = useRef<HTMLElement>(null);
	const [isExportOpen, setIsExportOpen] = useState(false);
	const previewContainerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);

	const [filename, setFilename] = useState("");
	const [pageFormat, setPageFormat] = useState<"a4" | "letter">("a4");
	const [orientation, setOrientation] = useState<"portrait" | "landscape">(
		"portrait"
	);

	// --- State Definitions ---
	interface PersonalInfo {
		name: string;
		title: string;
		email: string;
		phone: string;
		github?: string;
		website: string;
		summary: string;
		portrait: string;
	}

	const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
		name: "Your name",
		title: "your title",
		email: "youremail@email.com",
		phone: "+1 (555) 123-4567",
		website: "yourname.dev",
		github: "github.com/yourgithub",
		summary:
			"Innovative and detail-oriented Frontend Developer with over 8 years of experience building and maintaining responsive and user-friendly web applications. Proficient in React, Next.js, and modern JavaScript frameworks. Passionate about creating seamless user experiences and writing clean, efficient code.",
		portrait: "assets/Cat_01.png",
	});
	interface Project {
		id: number;
		name: string;
		description: string;
		link: string;
		technologies: string;
	}

	interface Experience {
		id: number;
		company: string;
		position: string;
		startDate: string;
		endDate: string;
		description: string;
	}
	const [projects, setProjects] = useState<Project[]>([
		{
			id: 1,
			name: "E-commerce Platform",
			description:
				"• Developed a full-stack e-commerce site with features like product search, shopping cart, and Stripe payment integration.\n• Implemented a custom CMS for managing products and orders.",
			link: "github.com/yourusername/ecommerce",
			technologies: "Next.js, TypeScript, PostgreSQL, Prisma, Stripe",
		},
	]);
	const [experience, setExperience] = useState<Experience[]>([
		{
			id: 1,
			company: "Innovatech Solutions",
			position: "Senior Frontend Developer",
			startDate: "Jan 2020",
			endDate: "Present",
			description:
				"• Led the development of a new client-facing dashboard using Next.js, resulting in a 30% increase in user engagement.\n• Mentored junior developers and conducted code reviews to ensure code quality and consistency.\n• Collaborated with UI/UX designers to translate wireframes into high-quality, reusable components.",
		},
		{
			id: 2,
			company: "Creative Minds Agency",
			position: "Frontend Developer",
			startDate: "Jun 2017",
			endDate: "Dec 2019",
			description:
				"• Developed and maintained multiple marketing websites for high-profile clients using React and Redux.\n• Improved website performance by 25% by optimizing assets and implementing code-splitting.\n• Worked closely with the backend team to integrate RESTful APIs.",
		},
	]);

	interface Education {
		id: number;
		institution: string;
		degree: string;
		startDate: string;
		endDate: string;
	}
	const [education, setEducation] = useState<Education[]>([
		{
			id: 1,
			institution: "State University",
			degree: "B.S. in Computer Science",
			startDate: "Aug 2013",
			endDate: "May 2017",
		},
	]);
	const [skills, setSkills] = useState(
		"React, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, GraphQL, Node.js, Git"
	);

	// --- State Handlers ---
	const handlePersonalInfoChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setPersonalInfo((prev) => ({ ...prev, [name]: value }));
	};

	const handlePortraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result;
				if (typeof result === "string") {
					setPersonalInfo((prev) => ({ ...prev, portrait: result }));
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const handleExperienceChange = (
		id: number,
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setExperience((prev) =>
			prev.map((exp) => (exp.id === id ? { ...exp, [name]: value } : exp))
		);
	};
	const addExperience = () => {
		const newId =
			experience.length > 0 ? Math.max(...experience.map((e) => e.id)) + 1 : 1;
		setExperience([
			...experience,
			{
				id: newId,
				company: "",
				position: "",
				startDate: "",
				endDate: "",
				description: "",
			},
		]);
	};
	const removeExperience = (id: number) => {
		if (experience.length <= 1) return;
		setExperience(experience.filter((exp) => exp.id !== id));
	};

	const handleEducationChange = (
		id: number,
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setEducation((prev) =>
			prev.map((edu) => (edu.id === id ? { ...edu, [name]: value } : edu))
		);
	};
	const addEducation = () => {
		const newId =
			education.length > 0 ? Math.max(...education.map((e) => e.id)) + 1 : 1;
		setEducation([
			...education,
			{ id: newId, institution: "", degree: "", startDate: "", endDate: "" },
		]);
	};
	const removeEducation = (id: number) => {
		if (education.length <= 1) return;
		setEducation(education.filter((edu) => edu.id !== id));
	};
	const handleProjectChange = (
		id: number,
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setProjects((prev) =>
			prev.map((proj) => (proj.id === id ? { ...proj, [name]: value } : proj))
		);
	};
	const addProject = () => {
		const newId =
			projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
		setProjects([
			...projects,
			{
				id: newId,
				name: "",
				description: "",
				link: "",
				technologies: "",
			},
		]);
	};
	const removeProject = (id: number) => {
		if (projects.length <= 1) return;
		setProjects(projects.filter((proj) => proj.id !== id));
	};
	const handlePreviewScroll = (e: React.WheelEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		const { deltaY } = e;
		const { scrollTop, scrollHeight, clientHeight } = element;
		if (deltaY > 0 && scrollTop + clientHeight >= scrollHeight - 1) {
			return;
		}
		if (deltaY < 0 && scrollTop === 0) {
			return;
		}
		e.stopPropagation();
	};
	useEffect(() => {
		const fontObj = GOOGLE_FONTS.find((f) => f.value === selectedFont);
		if (fontObj) {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = fontObj.url;
			link.id = "cv-google-font";
			document.head.appendChild(link);

			return () => {
				const oldLink = document.getElementById("cv-google-font");
				if (oldLink) oldLink.remove();
			};
		}
	}, [selectedFont]);
	useEffect(() => {
		const updateScale = () => {
			if (previewContainerRef.current) {
				const A4_WIDTH_PX = 794;
				const containerWidth = previewContainerRef.current.offsetWidth;

				if (containerWidth < A4_WIDTH_PX) {
					setScale((containerWidth - 32) / A4_WIDTH_PX);
				} else {
					setScale(1);
				}
			}
		};

		updateScale();
		window.addEventListener("resize", updateScale);
		return () => window.removeEventListener("resize", updateScale);
	}, []);
	const handleExport = async () => {
		const fontName = selectedFont;
		const isRtl = lang === "ar";
		const t = translations[lang];
		const doc = new jsPDF({ orientation, unit: "pt", format: pageFormat });

		// --- Font loading for RTL languages (unchanged) ---
		if (isRtl) {
			try {
				const fontResponse = await fetch("/font/Amiri-Regular.ttf");
				const fontBuffer = await fontResponse.arrayBuffer();
				const base64Font = btoa(
					new Uint8Array(fontBuffer).reduce(
						(data, byte) => data + String.fromCharCode(byte),
						""
					)
				);
				doc.addFileToVFS("Amiri-Regular.ttf", base64Font);
				doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
				doc.setFont("Amiri");
			} catch (error) {
				console.error("Failed to load Arabic font:", error);
				alert("Could not load the Arabic font. PDF may not render correctly.");
			}
		}

		const pageHeight = doc.internal.pageSize.getHeight();
		const pageWidth = doc.internal.pageSize.getWidth();
		const margin = 50;
		const contentWidth = pageWidth - margin * 2;
		let cursorY = margin;
		let jsPdfFont = "helvetica";
		if (fontName === "Times New Roman" || fontName === "Times")
			jsPdfFont = "times";
		if (fontName === "Courier") jsPdfFont = "courier";

		const checkPageBreak = (spaceNeeded: number) => {
			if (cursorY + spaceNeeded > pageHeight - margin) {
				doc.addPage();
				cursorY = margin;
			}
		};

		const addSectionTitle = (title: string) => {
			checkPageBreak(40);
			doc.setFont("helvetica", "bold");
			if (isRtl) doc.setFont("Amiri", "normal");
			doc.setFontSize(12);
			doc.text(title, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as any);
			doc.setDrawColor(200);
			doc.line(margin, cursorY + 4, contentWidth + margin, cursorY + 4);
			cursorY += 25;
		};

		// --- ADDED LOGIC START for Portrait Image ---
		if (personalInfo.portrait) {
			try {
				// makeRoundedImage is assumed to be a function that might process the image
				// but for jsPDF, we just need the base64 string.
				const imgData = personalInfo.portrait;
				const imgProps = doc.getImageProperties(imgData);
				const imgWidth = 80;
				const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
				const imgX = (pageWidth - imgWidth) / 2;

				checkPageBreak(imgHeight + 20);
				doc.addImage(imgData, "PNG", imgX, cursorY, imgWidth, imgHeight);
				cursorY += imgHeight + 20;
			} catch (error) {
				console.error("Failed to add portrait image to PDF:", error);
			}
		}
		// --- ADDED LOGIC END ---

		doc.setFont("helvetica", "bold");
		if (isRtl) doc.setFont("Amiri", "normal");
		doc.setFontSize(22);
		doc.text(personalInfo.name, pageWidth / 2, cursorY, {
			align: "center",
			lang: isRtl ? "ar" : undefined,
		} as any);
		cursorY += doc.getTextDimensions(personalInfo.name).h + 6;

		doc.setFont("helvetica", "normal");
		if (isRtl) doc.setFont("Amiri", "normal");
		doc.setFontSize(13);
		doc.text(personalInfo.title, pageWidth / 2, cursorY, {
			align: "center",
			lang: isRtl ? "ar" : undefined,
		} as any);
		cursorY += doc.getTextDimensions(personalInfo.title).h + 6;

		doc.setFontSize(10);
		const contactInfo = [
			personalInfo.email,
			personalInfo.phone,
			personalInfo.website,
			personalInfo.github,
		]
			.filter(Boolean)
			.join("   •   ");

		doc.text(contactInfo, pageWidth / 2, cursorY, {
			align: "center",
			lang: isRtl ? "ar" : undefined,
		} as any);
		cursorY += doc.getTextDimensions(contactInfo).h + 20;

		if (personalInfo.summary) {
			addSectionTitle(t.summary);
			// --- ADDED LOGIC START for Summary ---
			doc.setFont("helvetica", "normal");
			if (isRtl) doc.setFont("Amiri", "normal");
			doc.setFontSize(10);
			const summaryLines = doc.splitTextToSize(
				personalInfo.summary,
				contentWidth
			);
			checkPageBreak(summaryLines.length * 12);
			doc.text(summaryLines, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as any);
			cursorY += summaryLines.length * 12 + 10;
			// --- ADDED LOGIC END ---
		}

		if (experience.length > 0 && experience[0].company) {
			addSectionTitle(t.experience);
			// --- ADDED LOGIC START for Experience ---
			experience.forEach((exp) => {
				checkPageBreak(50); // Estimate space for one entry
				doc.setFont("helvetica", "bold");
				if (isRtl) doc.setFont("Amiri", "normal");
				doc.setFontSize(11);
				doc.text(exp.position, margin, cursorY, {
					lang: isRtl ? "ar" : undefined,
				} as any);

				doc.setFont("helvetica", "normal");
				if (isRtl) doc.setFont("Amiri", "normal");
				doc.setFontSize(10);
				const dateText = `${exp.startDate} - ${exp.endDate}`;
				doc.text(dateText, pageWidth - margin, cursorY, {
					align: "right",
					lang: isRtl ? "ar" : undefined,
				} as any);
				cursorY += 14;

				doc.setFont("helvetica", "italic");
				if (isRtl) doc.setFont("Amiri", "normal");
				doc.setFontSize(10);
				doc.text(exp.company, margin, cursorY, {
					lang: isRtl ? "ar" : undefined,
				} as any);
				cursorY += 18;

				doc.setFont("helvetica", "normal");
				if (isRtl) doc.setFont("Amiri", "normal");
				const descriptionPoints = exp.description
					.split("\n")
					.filter((line) => line.trim() !== "");
				descriptionPoints.forEach((point) => {
					const cleanedPoint = "• " + point.replace(/^•\s*/, "").trim();
					const pointLines = doc.splitTextToSize(
						cleanedPoint,
						contentWidth - 15
					);
					checkPageBreak(pointLines.length * 12);
					doc.text(pointLines, margin + 15, cursorY, {
						lang: isRtl ? "ar" : undefined,
					} as any);
					cursorY += pointLines.length * 12 + 4;
				});
				cursorY += 18;
			});
			// --- ADDED LOGIC END ---
		}

		if (education.length > 0 && education[0].institution) {
			addSectionTitle(t.education);
			// --- ADDED LOGIC START for Education ---
			education.forEach((edu) => {
				checkPageBreak(40);
				doc.setFont("helvetica", "bold");
				if (isRtl) doc.setFont("Amiri", "normal");
				doc.setFontSize(11);
				doc.text(edu.institution, margin, cursorY, {
					lang: isRtl ? "ar" : undefined,
				} as any);

				doc.setFont("helvetica", "normal");
				if (isRtl) doc.setFont("Amiri", "normal");
				doc.setFontSize(10);
				const dateText = `${edu.startDate} - ${edu.endDate}`;
				doc.text(dateText, pageWidth - margin, cursorY, {
					align: "right",
					lang: isRtl ? "ar" : undefined,
				} as any);
				cursorY += 14;

				doc.setFont("helvetica", "italic");
				if (isRtl) doc.setFont("Amiri", "normal");
				doc.setFontSize(10);
				doc.text(edu.degree, margin, cursorY, {
					lang: isRtl ? "ar" : undefined,
				} as any);
				cursorY += 25;
			});
			// --- ADDED LOGIC END ---
		}

		if (projects.length > 0 && projects[0].name) {
			addSectionTitle("Projects");
			projects.forEach((proj) => {
				checkPageBreak(50);
				doc.setFont("helvetica", "bold");
				if (isRtl) doc.setFont("Amiri", "normal");
				doc.setFontSize(11);
				doc.text(proj.name, margin, cursorY, {
					lang: isRtl ? "ar" : undefined,
				} as any);

				if (proj.link) {
					doc.setFont("helvetica", "normal");
					if (isRtl) doc.setFont("Amiri", "normal");
					doc.setFontSize(10);
					doc.text(proj.link, pageWidth - margin, cursorY, {
						align: "right",
						lang: isRtl ? "ar" : undefined,
					} as any);
				}
				cursorY += 14;

				if (proj.technologies) {
					doc.setFont("helvetica", "italic");
					if (isRtl) doc.setFont("Amiri", "normal");
					doc.setFontSize(9);
					doc.text(`Technologies: ${proj.technologies}`, margin, cursorY, {
						lang: isRtl ? "ar" : undefined,
					} as any);
					cursorY += 18;
				}

				doc.setFont("helvetica", "normal");
				if (isRtl) doc.setFont("Amiri", "normal");
				const descriptionPoints = proj.description
					.split("\n")
					.filter((line) => line.trim() !== "");

				descriptionPoints.forEach((point) => {
					const cleanedPoint = "• " + point.replace(/^•\s*/, "").trim();
					const pointLines = doc.splitTextToSize(
						cleanedPoint,
						contentWidth - 15
					);
					checkPageBreak(pointLines.length * 12);
					doc.text(pointLines, margin + 15, cursorY, {
						lang: isRtl ? "ar" : undefined,
					} as any);
					cursorY += pointLines.length * 12 + 4;
				});
				cursorY += 18;
			});
		}

		if (skills) {
			addSectionTitle(t.skills);
			doc.setFont("helvetica", "normal");
			if (isRtl) doc.setFont("Amiri", "normal");
			doc.setFontSize(10);
			const skillsLines = doc.splitTextToSize(skills, contentWidth);
			checkPageBreak(skillsLines.length * 12);
			doc.text(skillsLines, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as any);
		}

		const defaultFilename = `${
			personalInfo.name.replace(/\s+/g, "_") || "CV"
		}.pdf`;
		const selectedFilename = filename || defaultFilename;
		doc.save(selectedFilename);

		setIsExportOpen(false);
	};
	// --- UI Rendering ---
	const renderTabContent = () => {
		switch (activeTab) {
			case "projects":
				return (
					<div className="space-y-6">
						{projects.map((proj, index) => (
							<Card key={proj.id} className="">
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle className="text-base">
										Project #{index + 1}
									</CardTitle>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => removeProject(proj.id)}
										disabled={projects.length <= 1}>
										<Trash2Icon className="h-4 w-4" />
									</Button>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label className="mb-2" htmlFor={`name-${proj.id}`}>
												Project Name
											</Label>
											<Input
												id={`name-${proj.id}`}
												name="name"
												value={proj.name}
												onChange={(e) => handleProjectChange(proj.id, e)}
											/>
										</div>
										<div>
											<Label className="mb-2" htmlFor={`link-${proj.id}`}>
												Link (e.g., GitHub)
											</Label>
											<Input
												id={`link-${proj.id}`}
												name="link"
												value={proj.link}
												onChange={(e) => handleProjectChange(proj.id, e)}
											/>
										</div>
									</div>
									<div>
										<Label className="mb-2" htmlFor={`technologies-${proj.id}`}>
											Technologies Used
										</Label>
										<Input
											id={`technologies-${proj.id}`}
											name="technologies"
											value={proj.technologies}
											onChange={(e) => handleProjectChange(proj.id, e)}
											placeholder="React, Node.js, ..."
										/>
									</div>
									<div>
										<Label
											className="mb-2"
											htmlFor={`description-proj-${proj.id}`}>
											Description
										</Label>
										<Textarea
											id={`description-proj-${proj.id}`}
											name="description"
											rows={4}
											value={proj.description}
											onChange={(e) => handleProjectChange(proj.id, e)}
											placeholder="• Developed feature X..."
										/>
									</div>
								</CardContent>
							</Card>
						))}
						<Button variant="outline" onClick={addProject} className="w-full">
							<PlusIcon className="h-4 w-4" /> Add Project
						</Button>
					</div>
				);
			case "personal":
				return (
					<Card>
						<div className="space-y-6 px-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label className="mb-2" htmlFor="name">
										{t.fullName}
									</Label>
									<Input
										id="name"
										name="name"
										value={personalInfo.name}
										onChange={handlePersonalInfoChange}
									/>
								</div>
								<div>
									<Label className="mb-2" htmlFor="title">
										{t.jobTitle}
									</Label>
									<Input
										id="title"
										name="title"
										value={personalInfo.title}
										onChange={handlePersonalInfoChange}
									/>
								</div>
								<div>
									<Label className="mb-2" htmlFor="email">
										{t.email}
									</Label>
									<Input
										id="email"
										name="email"
										type="email"
										value={personalInfo.email}
										onChange={handlePersonalInfoChange}
									/>
								</div>
								<div>
									<Label className="mb-2" htmlFor="phone">
										{t.phone}
									</Label>
									<Input
										id="phone"
										name="phone"
										value={personalInfo.phone}
										onChange={handlePersonalInfoChange}
									/>
								</div>
							</div>
							<div>
								<Label className="mb-2" htmlFor="website">
									{t.website}
								</Label>
								<Input
									id="website"
									name="website"
									value={personalInfo.website}
									onChange={handlePersonalInfoChange}
								/>
							</div>
							<div>
								<Label className="mb-2" htmlFor="github">
									{t.github}
								</Label>
								<Input
									id="github"
									name="github"
									value={personalInfo.github}
									onChange={handlePersonalInfoChange}
								/>
							</div>
							<div>
								<Label className="mb-2" htmlFor="portrait">
									{t.portrait}
								</Label>
								<div className="flex items-center gap-4 mt-2">
									{personalInfo.portrait ? (
										<img
											src={personalInfo.portrait}
											alt="Portrait"
											className="w-16 h-16 rounded-full object-cover"
										/>
									) : (
										<div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
											<UserIcon className="w-8 h-8 text-slate-400" />
										</div>
									)}
									<Input
										id="portrait"
										name="portrait"
										type="file"
										accept="image/jpeg,image/png"
										onChange={handlePortraitChange}
										className="max-w-xs cursor-pointer file:cursor-pointer  text-sm file:mr-4   file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:opacity-85 hover:file:bg-slate-200 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600"
									/>
								</div>
							</div>
							<div>
								<Label className="mb-2" htmlFor="summary">
									{t.summary}
								</Label>
								<Textarea
									id="summary"
									name="summary"
									rows={5}
									value={personalInfo.summary}
									onChange={handlePersonalInfoChange}
								/>
							</div>
						</div>
					</Card>
				);
			case "experience":
				return (
					<div className="space-y-6">
						{experience.map((exp, index) => (
							<Card key={exp.id} className="">
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle className="text-base">
										{t.experience} #{index + 1}
									</CardTitle>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => removeExperience(exp.id)}
										disabled={experience.length <= 1}>
										<Trash2Icon className="h-4 w-4" />
									</Button>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label className="mb-2" htmlFor={`position-${exp.id}`}>
												{t.position}
											</Label>
											<Input
												id={`position-${exp.id}`}
												name="position"
												value={exp.position}
												onChange={(e) => handleExperienceChange(exp.id, e)}
											/>
										</div>
										<div>
											<Label className="mb-2" htmlFor={`company-${exp.id}`}>
												{t.company}
											</Label>
											<Input
												id={`company-${exp.id}`}
												name="company"
												value={exp.company}
												onChange={(e) => handleExperienceChange(exp.id, e)}
											/>
										</div>
										<div>
											<Label className="mb-2" htmlFor={`startDate-${exp.id}`}>
												{t.startDate}
											</Label>
											<Input
												id={`startDate-${exp.id}`}
												name="startDate"
												value={exp.startDate}
												onChange={(e) => handleExperienceChange(exp.id, e)}
											/>
										</div>
										<div>
											<Label className="mb-2" htmlFor={`endDate-${exp.id}`}>
												{t.endDate}
											</Label>
											<Input
												id={`endDate-${exp.id}`}
												name="endDate"
												value={exp.endDate}
												onChange={(e) => handleExperienceChange(exp.id, e)}
											/>
										</div>
									</div>
									<div>
										<Label className="mb-2" htmlFor={`description-${exp.id}`}>
											{t.description}
										</Label>
										<Textarea
											id={`description-${exp.id}`}
											name="description"
											rows={4}
											value={exp.description}
											onChange={(e) => handleExperienceChange(exp.id, e)}
											placeholder="• Led development of..."
										/>
									</div>
								</CardContent>
							</Card>
						))}
						<Button
							variant="outline"
							onClick={addExperience}
							className="w-full">
							<PlusIcon className="h-4 w-4" /> {t.addExperience}
						</Button>
					</div>
				);
			case "education":
				return (
					<div className="space-y-6">
						{education.map((edu, index) => (
							<Card key={edu.id} className="">
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle className="text-base">
										{t.education} #{index + 1}
									</CardTitle>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => removeEducation(edu.id)}
										disabled={education.length <= 1}>
										<Trash2Icon className="h-4 w-4" />
									</Button>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label className="mb-2" htmlFor={`institution-${edu.id}`}>
												{t.institution}
											</Label>
											<Input
												id={`institution-${edu.id}`}
												name="institution"
												value={edu.institution}
												onChange={(e) => handleEducationChange(edu.id, e)}
											/>
										</div>
										<div>
											<Label className="mb-2" htmlFor={`degree-${edu.id}`}>
												{t.degree}
											</Label>
											<Input
												id={`degree-${edu.id}`}
												name="degree"
												value={edu.degree}
												onChange={(e) => handleEducationChange(edu.id, e)}
											/>
										</div>
										<div>
											<Label
												className="mb-2"
												htmlFor={`startDate-edu-${edu.id}`}>
												{t.startDate}
											</Label>
											<Input
												id={`startDate-edu-${edu.id}`}
												name="startDate"
												value={edu.startDate}
												onChange={(e) => handleEducationChange(edu.id, e)}
											/>
										</div>
										<div>
											<Label className="mb-2" htmlFor={`endDate-edu-${edu.id}`}>
												{t.endDate}
											</Label>
											<Input
												id={`endDate-edu-${edu.id}`}
												name="endDate"
												value={edu.endDate}
												onChange={(e) => handleEducationChange(edu.id, e)}
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
						<Button variant="outline" onClick={addEducation} className="w-full">
							<PlusIcon className="h-4 w-4" /> {t.addEducation}
						</Button>
					</div>
				);
			case "skills":
				return (
					<div>
						<Label className="mb-2" htmlFor="skills">
							{t.skills}
						</Label>
						<Textarea
							id="skills"
							name="skills"
							rows={6}
							value={skills}
							onChange={(e) => setSkills(e.target.value)}
							placeholder={t.skillsPlaceholder}
						/>
						<p className="text-xs dark:text-slate-400 mt-2">{t.skillsHint}</p>
					</div>
				);
			default:
				return null;
		}
	};
	interface TabButtonProps {
		id: TabId;
		label: string;
		icon: React.ReactNode;
	}
	const TabButton = ({ id, label, icon }: TabButtonProps) => (
		<button
			onClick={() => setActiveTab(id)}
			className={`flex-1 cursor-pointer p-3 text-sm font-medium flex items-center justify-center gap-2 rounded-t-lg transition-colors ${
				activeTab === id
					? "bg-white dark:bg-sky-700 border-b-2 border-slate-900 dark:border-slate-300"
					: "bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-sky-700/90 "
			}`}>
			{icon}
			<span className="hidden sm:inline">{label}</span>
		</button>
	);

	return (
		<div
			id="cvMaker"
			dir={isRtl ? "rtl" : "ltr"}
			className="  min-h-screen py-10 font-sans">
			<div className="container mx-auto px-6 py-12 lg:px-8 lg:py-16">
				<div className="mb-20 w-full h-full p-6 ">
					<Select value={selectedFont} onValueChange={setSelectedFont}>
						<SelectContent>
							{GOOGLE_FONTS.map((font) => (
								<SelectItem
									className="text-white"
									key={font.value}
									value={font.value}>
									{font.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<main className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
					<Card className="lg:col-span-2    ">
						<div className="w-full h-full sticky top-0">
							<div className="flex  flex-wrap gap-3 p-3 border-b border-b-slate-200 dark:border-b-slate-800">
								<TabButton
									id="personal"
									label={t.personal}
									icon={<UserIcon className="h-5 w-5" />}
								/>
								<TabButton
									id="experience"
									label={t.experience}
									icon={<BriefcaseIcon className="h-5 w-5" />}
								/>
								<TabButton
									id="education"
									label={t.education}
									icon={<GraduationCapIcon className="h-5 w-5" />}
								/>
								<TabButton
									id="projects"
									label={"Projects"}
									icon={<FolderGit2Icon className="h-5 w-5" />}
								/>
								<TabButton
									id="skills"
									label={t.skills}
									icon={<WrenchIcon className="h-5 w-5" />}
								/>
							</div>
							<div className="p-6">{renderTabContent()}</div>
						</div>
					</Card>
					<div className="relative lg:col-span-3 w-full ">
						<Card
							onWheel={handlePreviewScroll}
							ref={previewContainerRef}
							className="shadow-lg overflow-scroll min-h-[99vh]  flex justify-center px-2 lg:px-6">
							<article
								ref={cvPreviewRef}
								style={{ fontFamily: selectedFont }}
								className=" w-full rounded-md
max-w-full
h-full
min-h-[297mm]
bg-white
text-black
p-4
sm:p-8
lg:w-[210mm]
lg:p-[20mm]
text-sm
transition-transform
duration-300">
								<header className="text-center mb-8 border-b border-slate-200 pb-6 flex flex-col items-center">
									{personalInfo.portrait && (
										<img
											src={personalInfo.portrait}
											alt="Portrait"
											className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-rose-400"
										/>
									)}
									<h1 className="text-4xl font-bold tracking-tight uppercase">
										{personalInfo.name || "Your Name"}
									</h1>
									<h2 className="text-xl font-medium opacity-85 mt-1">
										{personalInfo.title || "Your Title"}
									</h2>

									{/* --- MODIFIED BLOCK --- */}
									<div className="flex justify-center items-center gap-x-6 gap-y-2 flex-wrap mt-4 text-xs">
										{personalInfo.email && (
											<span className="flex items-center gap-1.5">
												<MailIcon className="h-3 w-3" />
												{personalInfo.email}
											</span>
										)}
										{personalInfo.phone && (
											<span className="flex items-center gap-1.5">
												<PhoneIcon className="h-3 w-3" />
												{personalInfo.phone}
											</span>
										)}
										{personalInfo.website && (
											<span className="flex items-center gap-1.5">
												<GlobeIcon className="h-3 w-3" />
												{personalInfo.website}
											</span>
										)}
										{/* This new span displays the GitHub link */}
										{personalInfo.github && (
											<span className="flex items-center gap-1.5">
												<GithubIcon className="h-3 w-3" />
												{personalInfo.github}
											</span>
										)}
									</div>
									{/* --- END MODIFIED BLOCK --- */}
								</header>
								<main>
									<section>
										<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">
											{t.summary}
										</h3>
										<p className="leading-relaxed break-words ">
											{personalInfo.summary ||
												"A brief summary about yourself."}
										</p>
									</section>
									<section className="mt-8">
										<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-4">
											{t.experience}
										</h3>
										<div className="space-y-6">
											{experience.map((exp) => (
												<div key={exp.id}>
													<div className="flex justify-between items-baseline">
														<h4 className="font-semibold">
															{exp.position || "Position"}
														</h4>
														<p className="text-xs font-medium">
															{exp.startDate || "Start"} -{" "}
															{exp.endDate || "End"}
														</p>
													</div>
													<p className="opacity-85 italic text-sm">
														{exp.company || "Company Name"}
													</p>
													<ul className="mt-2 leading-relaxed list-disc list-inside space-y-1">
														{exp.description.split("\n").map(
															(item, i) =>
																item.trim().replace("•", "").length > 0 && (
																	<li key={i} className="pl-2">
																		{item.replace("•", "").trim()}
																	</li>
																)
														)}
													</ul>
												</div>
											))}
										</div>
									</section>

									{/* --- NEW SECTION --- */}
									<section className="mt-8">
										<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-4">
											{t.projects}
										</h3>
										<div className="space-y-6">
											{projects.map((proj) => (
												<div key={proj.id}>
													<div className="flex justify-between items-baseline">
														<h4 className="font-semibold">
															{proj.name || "Project Name"}
														</h4>
														<a
															href={
																proj.link.startsWith("http")
																	? proj.link
																	: `https://${proj.link}`
															}
															target="_blank"
															rel="noopener noreferrer"
															className="text-xs font-medium text-blue-600 hover:underline">
															{proj.link || "Link"}
														</a>
													</div>
													<p className="opacity-85 italic text-sm text-gray-600 mb-1">
														{proj.technologies || "Technologies Used"}
													</p>
													<ul className="mt-2 leading-relaxed list-disc list-inside space-y-1">
														{proj.description.split("\n").map(
															(item, i) =>
																item.trim().replace("•", "").length > 0 && (
																	<li key={i} className="pl-2">
																		{item.replace("•", "").trim()}
																	</li>
																)
														)}
													</ul>
												</div>
											))}
										</div>
									</section>
									{/* --- END NEW SECTION --- */}
									<section className="mt-8">
										<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-4">
											{t.education}
										</h3>
										<div className="space-y-4">
											{education.map((edu) => (
												<div key={edu.id}>
													<div className="flex justify-between items-baseline">
														<h4 className="font-semibold">
															{edu.institution || "Institution Name"}
														</h4>
														<p className="text-xs font-medium">
															{edu.startDate || "Start"} -{" "}
															{edu.endDate || "End"}
														</p>
													</div>
													<p className="opacity-85 italic text-sm">
														{edu.degree || "Degree / Field of Study"}
													</p>
												</div>
											))}
										</div>
									</section>
									<section className="mt-8">
										<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">
											{t.skills}
										</h3>
										<div className="flex flex-wrap gap-2">
											{skills.split(",").map(
												(skill, i) =>
													skill.trim() && (
														<span
															key={i}
															className="bg-sky-200 opacity-85 text-xs font-medium px-2.5 py-1 rounded-full">
															{skill.trim()}
														</span>
													)
											)}
										</div>
									</section>
								</main>
							</article>
						</Card>
					</div>
				</main>
				<div className="flex items-center gap-4 mt-6 w-full justify-center ">
					<Button variant="default" onClick={() => setIsExportOpen(true)}>
						<PrinterIcon className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />{" "}
						{t.export}
					</Button>
				</div>
			</div>

			<Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t.exportOptions}</DialogTitle>
						<Button onClick={() => setIsExportOpen(false)} variant="default">
							<XIcon />
						</Button>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label className="mb-2" htmlFor="filename">
								{t.fileName}
							</Label>
							<Input
								id="filename"
								value={filename}
								onChange={(e) => setFilename(e.target.value)}
								placeholder={`${
									personalInfo.name.replace(/\s+/g, "_") || "CV"
								}.pdf`}
							/>
						</div>
						<div>
							<Label>{t.pageFormat}</Label>
							<Select
								value={pageFormat}
								onValueChange={(v) => setPageFormat(v as "a4" | "letter")}>
								<SelectItem value="a4">A4 (standard)</SelectItem>
								<SelectItem value="letter">Letter (US)</SelectItem>
							</Select>
						</div>
						<div>
							<Label>{t.orientation}</Label>
							<Select
								value={orientation}
								onValueChange={(v) =>
									setOrientation(v as "portrait" | "landscape")
								}>
								<SelectItem value="portrait">Portrait</SelectItem>
								<SelectItem value="landscape">Landscape</SelectItem>
							</Select>
						</div>
						<Button onClick={handleExport} className="w-full mt-4">
							{t.export}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
