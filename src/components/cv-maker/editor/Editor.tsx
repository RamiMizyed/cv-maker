"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import UserIcon from "@/icons/UserIcon";
import BriefcaseIcon from "@/icons/BriefCaseIcon";
import GraduationCapIcon from "@/icons/GradCapIcon";
import WrenchIcon from "@/icons/WrenchIcon";
import { FolderGit2Icon, SparklesIcon } from "lucide-react"; // 👈 NEW
import PersonalInfoForm from "./PersonalInfoForm";
import ExperienceForm from "./ExperienceForm";
import EducationForm from "./EducationForm";
import ProjectsForm from "./ProjectsForm";
import SkillsForm from "./SkillsForm";
import JobAssistant from "./JobAssistant"; // 👈 NEW
import { TabId } from "@/types/cv";
import { useLang } from "@/lib/lang";
import translations from "@/lib/translations";
import ExportDialog from "./ExportDialog";
import { Card } from "@/components/ui/card";
import FontSelector from "./FontSelector";
import JsonIO from "./JsonIO";

const TABS: {
	id: TabId;
	labelKey: keyof (typeof translations)["en"];
	icon: React.ElementType;
}[] = [
	{ id: "fonts", labelKey: "fonts", icon: UserIcon },
	{ id: "personal", labelKey: "personal", icon: UserIcon },
	{ id: "experience", labelKey: "experience", icon: BriefcaseIcon },
	{ id: "education", labelKey: "education", icon: GraduationCapIcon },
	{ id: "projects", labelKey: "projects", icon: FolderGit2Icon },
	{ id: "skills", labelKey: "skills", icon: WrenchIcon },
];

export default function Editor() {
	const [activeTab, setActiveTab] = useState<TabId>("personal");
	const { lang } = useLang();
	const t = translations[lang];

	const renderTabContent = () => {
		switch (activeTab) {
			case "fonts":
				return <FontSelector />;
			case "personal":
				return <PersonalInfoForm />;
			case "experience":
				return <ExperienceForm />;
			case "education":
				return <EducationForm />;
			case "projects":
				return <ProjectsForm />;
			case "skills":
				return <SkillsForm />;

			default:
				return <PersonalInfoForm />;
		}
	};

	return (
		<Card className="col-span-1 lg:col-span-2 h-full">
			<div className="flex flex-col justify-between items-center">
				<h1 className="text-2xl font-bold">Editor</h1>
			</div>

			<div className="sticky top-[6rem]">
				<div className="flex flex-wrap gap-2 space-x-2 border-b mb-6">
					{TABS.map((tab) => (
						<Button
							key={tab.id}
							variant={activeTab === tab.id ? "default" : "outline"}
							onClick={() => setActiveTab(tab.id)}
							className="flex-1 justify-center">
							<tab.icon className="h-4 w-4 mr-2" />
							{t[tab.labelKey]}
						</Button>
					))}
				</div>
				<div className="space-y-6 mb-3 overflow-y-scroll max-h-[100svh]">
					{renderTabContent()}
				</div>
				<JobAssistant />
				<JsonIO />
				<ExportDialog />
			</div>
		</Card>
	);
}
