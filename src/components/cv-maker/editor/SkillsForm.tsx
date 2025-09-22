// components/cv-maker/editor/SkillsForm.tsx
"use client";

import React from "react";
import { useCV } from "../CVContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SkillsForm() {
	const { state, dispatch } = useCV();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Skills</CardTitle>
			</CardHeader>
			<CardContent>
				<Label htmlFor="skills">Enter your skills, separated by commas.</Label>
				<Textarea
					id="skills"
					rows={6}
					value={state.skills}
					onChange={(e) =>
						dispatch({ type: "UPDATE_SKILLS", payload: e.target.value })
					}
					placeholder="React, TypeScript, Node.js..."
				/>
			</CardContent>
		</Card>
	);
}
