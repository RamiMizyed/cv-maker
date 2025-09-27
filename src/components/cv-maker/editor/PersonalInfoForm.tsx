// components/cv-maker/editor/PersonalInfoForm.tsx
"use client";

import React from "react";
import { useCV } from "../CVContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useLang } from "@/lib/lang";
import translations from "@/lib/translations";
import GOOGLE_FONTS from "@/lib/fontList";

export default function PersonalInfoForm() {
	const { state, dispatch } = useCV();
	const { personalInfo, selectedFont } = state;
	const { lang } = useLang();
	const t = translations[lang];

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		dispatch({
			type: "UPDATE_PERSONAL_INFO",
			payload: {
				field: e.target.name as keyof typeof personalInfo,
				value: e.target.value,
			},
		});
	};

	const handlePortraitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					dispatch({
						type: "UPDATE_PERSONAL_INFO",
						payload: { field: "portrait", value: reader.result },
					});
				}
			};
			reader.readAsDataURL(e.target.files[0]);
		}
	};

	return (
		<Card>
			<CardContent className=" space-y-4">
				<div>
					<Label className="mb-2" htmlFor="font-selector">
						Font
					</Label>
					<Select
						value={selectedFont}
						onValueChange={(value) => {
							dispatch({ type: "SET_FONT", payload: value });
							console.log("Font changed to:", value);
						}}>
						<SelectTrigger id="font-selector">
							<SelectValue placeholder="Select a font" />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(GOOGLE_FONTS).map(([langKey, fonts]) => (
								<SelectGroup key={langKey}>
									<SelectLabel className="border-b">
										{langKey.substring(0, 2).toUpperCase()}
									</SelectLabel>
									{fonts.map((font) => (
										<SelectItem key={font.value} value={font.value}>
											{font.label}
										</SelectItem>
									))}
								</SelectGroup>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="name">{t.fullName}</Label>
						<Input
							id="name"
							name="name"
							value={personalInfo.name}
							onChange={handleChange}
						/>
					</div>
					<div>
						<Label htmlFor="title">{t.jobTitle}</Label>
						<Input
							id="title"
							name="title"
							value={personalInfo.title}
							onChange={handleChange}
						/>
					</div>
				</div>

				{/* contact fields */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="email">{t.email}</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={personalInfo.email}
							onChange={handleChange}
						/>
					</div>
					<div>
						<Label htmlFor="phone">{t.phone}</Label>
						<Input
							id="phone"
							name="phone"
							type="tel"
							value={personalInfo.phone}
							onChange={handleChange}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="website">{t.website}</Label>
						<Input
							id="website"
							name="website"
							value={personalInfo.website}
							onChange={handleChange}
						/>
					</div>
					<div>
						<Label htmlFor="github">{t.github}</Label>
						<Input
							id="github"
							name="github"
							value={personalInfo.github}
							onChange={handleChange}
						/>
					</div>
				</div>

				<div>
					<Label htmlFor="summary">{t.summary}</Label>
					<Textarea
						id="summary"
						name="summary"
						rows={5}
						value={personalInfo.summary}
						onChange={handleChange}
					/>
				</div>
				<div>
					<Label htmlFor="portrait">{t.portrait}</Label>
					<Input
						id="portrait"
						type="file"
						accept="image/*"
						onChange={handlePortraitChange}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
