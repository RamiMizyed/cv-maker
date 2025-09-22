// components/cv-maker/editor/Editor.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import UserIcon from "@/icons/UserIcon";
import BriefcaseIcon from "@/icons/BriefCaseIcon";
import GraduationCapIcon from "@/icons/GradCapIcon";
import WrenchIcon from "@/icons/WrenchIcon";
import { FolderGit2Icon } from "lucide-react";
import PersonalInfoForm from "./PersonalInfoForm";
import ExperienceForm from "./ExperienceForm";
import EducationForm from "./EducationForm";
import ProjectsForm from "./ProjectsForm";
import SkillsForm from "./SkillsForm";
import { TabId } from "@/types/cv";
import { useLang } from "@/lib/lang";
import translations from "@/lib/translations";
import ExportDialog from "./ExportDialog";

const TABS: {
	id: TabId;
	labelKey: keyof (typeof translations)["en"];
	icon: React.ElementType;
}[] = [
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
				return null;
		}
	};

	return (
		<div className="col-span-1 h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 editor-scroll">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">CV Editor</h1>
				<ExportDialog />
			</div>
			<div className="flex space-x-2 border-b mb-6">
				{TABS.map((tab) => (
					<Button
						key={tab.id}
						variant={activeTab === tab.id ? "default" : "ghost"}
						onClick={() => setActiveTab(tab.id)}
						className="flex-1 justify-center">
						<tab.icon className="h-4 w-4 mr-2" />
						{t[tab.labelKey]}
					</Button>
				))}
			</div>
			<div className="space-y-6">{renderTabContent()}</div>
		</div>
	);
}
