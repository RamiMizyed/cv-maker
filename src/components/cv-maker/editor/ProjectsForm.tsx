// components/cv-maker/editor/ProjectsForm.tsx
"use client";

import React from "react";
import { useCV } from "../CVContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PlusIcon from "@/icons/PlusIcon";
import Trash2Icon from "@/icons/Trash2Icon";
import { Project } from "@/types/cv";

export default function ProjectsForm() {
	const { state, dispatch } = useCV();
	const { projects } = state;

	const handleChange = (
		id: number,
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		dispatch({
			type: "UPDATE_PROJECT",
			payload: {
				id,
				field: e.target.name as keyof Project,
				value: e.target.value,
			},
		});
	};

	return (
		<div className="space-y-6">
			{projects.map((proj, index) => (
				<Card key={proj.id}>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-base">Project #{index + 1}</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								dispatch({ type: "REMOVE_PROJECT", payload: { id: proj.id } })
							}
							disabled={projects.length <= 1}>
							<Trash2Icon className="h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor={`name-${proj.id}`}>Project Name</Label>
								<Input
									id={`name-${proj.id}`}
									name="name"
									value={proj.name}
									onChange={(e) => handleChange(proj.id, e)}
								/>
							</div>
							<div>
								<Label htmlFor={`technologies-${proj.id}`}>Technologies</Label>
								<Input
									id={`technologies-${proj.id}`}
									name="technologies"
									value={proj.technologies}
									onChange={(e) => handleChange(proj.id, e)}
								/>
							</div>
							<div>
								<Label htmlFor={`link-${proj.id}`}>Link</Label>
								<Input
									id={`link-${proj.id}`}
									name="link"
									value={proj.link}
									onChange={(e) => handleChange(proj.id, e)}
								/>
							</div>
						</div>
						<div>
							<Label htmlFor={`description-${proj.id}`}>Description</Label>
							<Textarea
								id={`description-${proj.id}`}
								name="description"
								rows={3}
								value={proj.description}
								onChange={(e) => handleChange(proj.id, e)}
							/>
						</div>
					</CardContent>
				</Card>
			))}
			<Button
				variant="outline"
				onClick={() => dispatch({ type: "ADD_PROJECT" })}
				className="w-full">
				<PlusIcon className="h-4 w-4 mr-2" /> Add Project
			</Button>
		</div>
	);
}
