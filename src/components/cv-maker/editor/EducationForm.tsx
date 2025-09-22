// components/cv-maker/editor/EducationForm.tsx
"use client";

import React from "react";
import { useCV } from "../CVContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PlusIcon from "@/icons/PlusIcon";
import Trash2Icon from "@/icons/Trash2Icon";
import { Education } from "@/types/cv";

export default function EducationForm() {
	const { state, dispatch } = useCV();
	const { education } = state;

	const handleChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
		dispatch({
			type: "UPDATE_EDUCATION",
			payload: {
				id,
				field: e.target.name as keyof Education,
				value: e.target.value,
			},
		});
	};

	return (
		<div className="space-y-6">
			{education.map((edu, index) => (
				<Card key={edu.id}>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-base">Education #{index + 1}</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								dispatch({ type: "REMOVE_EDUCATION", payload: { id: edu.id } })
							}
							disabled={education.length <= 1}>
							<Trash2Icon className="h-4 w-4" />
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor={`institution-${edu.id}`}>Institution</Label>
								<Input
									id={`institution-${edu.id}`}
									name="institution"
									value={edu.institution}
									onChange={(e) => handleChange(edu.id, e)}
								/>
							</div>
							<div>
								<Label htmlFor={`degree-${edu.id}`}>Degree</Label>
								<Input
									id={`degree-${edu.id}`}
									name="degree"
									value={edu.degree}
									onChange={(e) => handleChange(edu.id, e)}
								/>
							</div>
							<div>
								<Label htmlFor={`startDate-${edu.id}`}>Start Date</Label>
								<Input
									id={`startDate-${edu.id}`}
									name="startDate"
									value={edu.startDate}
									onChange={(e) => handleChange(edu.id, e)}
								/>
							</div>
							<div>
								<Label htmlFor={`endDate-${edu.id}`}>End Date</Label>
								<Input
									id={`endDate-${edu.id}`}
									name="endDate"
									value={edu.endDate}
									onChange={(e) => handleChange(edu.id, e)}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
			<Button
				variant="outline"
				onClick={() => dispatch({ type: "ADD_EDUCATION" })}
				className="w-full">
				<PlusIcon className="h-4 w-4 mr-2" /> Add Education
			</Button>
		</div>
	);
}
