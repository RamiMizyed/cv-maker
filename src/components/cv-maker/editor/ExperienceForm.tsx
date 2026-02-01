// components/cv-maker/editor/ExperienceForm.tsx
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
import { Experience } from "@/types/cv";

export default function ExperienceForm() {
	const { state, dispatch } = useCV();
	const { experience } = state;

	const handleChange = (
		id: number,
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		dispatch({
			type: "UPDATE_EXPERIENCE",
			payload: {
				id,
				field: e.target.name as keyof Experience,
				value: e.target.value,
			},
		});
	};

	return (
		<div className="space-y-6">
			{experience.map((exp, index) => (
				<Card key={exp.id}>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-base">Experience #{index + 1}</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								dispatch({ type: "REMOVE_EXPERIENCE", payload: { id: exp.id } })
							}
							disabled={experience.length <= 1}>
							<Trash2Icon className="h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor={`position-${exp.id}`}>Position</Label>
								<Input
									id={`position-${exp.id}`}
									name="position"
									value={exp.position}
									onChange={(e) => handleChange(exp.id, e)}
								/>
							</div>
							<div>
								<Label htmlFor={`company-${exp.id}`}>Company</Label>
								<Input
									id={`company-${exp.id}`}
									name="company"
									value={exp.company}
									onChange={(e) => handleChange(exp.id, e)}
								/>
							</div>
							<div>
								<Label htmlFor={`companyUrl-${exp.id}`}>Company Website</Label>
								<Input
									id={`companyUrl-${exp.id}`}
									name="companyUrl"
									placeholder="https://company.com"
									value={(exp as any).companyUrl || ""}
									onChange={(e) => handleChange(exp.id, e)}
								/>
							</div>
							<div>
								<Label htmlFor={`startDate-${exp.id}`}>Start Date</Label>
								<Input
									id={`startDate-${exp.id}`}
									name="startDate"
									value={exp.startDate}
									onChange={(e) => handleChange(exp.id, e)}
								/>
							</div>
							<div>
								<Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
								<Input
									id={`endDate-${exp.id}`}
									name="endDate"
									value={exp.endDate}
									onChange={(e) => handleChange(exp.id, e)}
								/>
							</div>
						</div>
						<div>
							<Label htmlFor={`description-${exp.id}`}>Description</Label>
							<Textarea
								id={`description-${exp.id}`}
								name="description"
								rows={4}
								value={exp.description}
								onChange={(e) => handleChange(exp.id, e)}
							/>
						</div>
					</CardContent>
				</Card>
			))}
			<Button
				variant="outline"
				onClick={() => dispatch({ type: "ADD_EXPERIENCE" })}
				className="w-full">
				<PlusIcon className="h-4 w-4 mr-2" /> Add Experience
			</Button>
		</div>
	);
}
