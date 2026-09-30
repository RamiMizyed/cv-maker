// components/cv-maker/editor/PersonalForm.tsx
"use client";

import React, { useRef, useState } from "react";
import { ImagePlus, Trash2, UserRound } from "lucide-react";
import { useCV } from "../CVContext";
import { PersonalInfo } from "@/types/cv";
import { Button } from "@/components/ui/button";
import { TextField, useT } from "./fields";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const PHOTO_PX = 480;

/** Crops to a centred square and downsizes, so the photo fits comfortably in localStorage. */
async function toSquareJpeg(file: File): Promise<string> {
	const url = URL.createObjectURL(file);
	try {
		const img = await new Promise<HTMLImageElement>((resolve, reject) => {
			const i = new Image();
			i.onload = () => resolve(i);
			i.onerror = reject;
			i.src = url;
		});
		const side = Math.min(img.naturalWidth, img.naturalHeight);
		const size = Math.min(PHOTO_PX, side);
		const canvas = document.createElement("canvas");
		canvas.width = canvas.height = size;
		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(
			img,
			(img.naturalWidth - side) / 2,
			(img.naturalHeight - side) / 2,
			side,
			side,
			0,
			0,
			size,
			size,
		);
		return canvas.toDataURL("image/jpeg", 0.86);
	} finally {
		URL.revokeObjectURL(url);
	}
}

const FIELDS: { key: keyof PersonalInfo; type?: string; ltr?: boolean }[] = [
	{ key: "name" },
	{ key: "title" },
	{ key: "email", type: "email", ltr: true },
	{ key: "phone", type: "tel", ltr: true },
	{ key: "location" },
	{ key: "website", type: "url", ltr: true },
	{ key: "linkedin", type: "url", ltr: true },
	{ key: "github", type: "url", ltr: true },
];

export default function PersonalForm() {
	const { state, dispatch } = useCV();
	const t = useT();
	const fileRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);
	const p = state.personalInfo;

	const labels: Partial<Record<keyof PersonalInfo, string>> = {
		name: t.fullName,
		title: t.jobTitle,
		email: t.email,
		phone: t.phone,
		location: t.location,
		website: t.website,
		linkedin: t.linkedin,
		github: t.github,
	};

	const set = (field: keyof PersonalInfo, value: string) =>
		dispatch({ type: "SET_PERSONAL", field, value });

	const onFile = async (file?: File) => {
		setError(null);
		if (!file) return;
		if (!file.type.startsWith("image/") || file.size > MAX_UPLOAD_BYTES) {
			setError(t.photoTooLarge);
			return;
		}
		try {
			set("portrait", await toSquareJpeg(file));
		} catch {
			setError(t.photoTooLarge);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
					{p.portrait ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={p.portrait} alt="" className="size-full object-cover" />
					) : (
						<UserRound className="size-7 text-muted-foreground" />
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => fileRef.current?.click()}>
						<ImagePlus /> {t.portrait}
					</Button>
					{p.portrait && (
						<Button type="button" variant="ghost" size="sm" onClick={() => set("portrait", "")}>
							<Trash2 /> {t.removePhoto}
						</Button>
					)}
				</div>
				<input
					ref={fileRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => {
						onFile(e.target.files?.[0]);
						e.target.value = "";
					}}
				/>
			</div>
			{error && <p className="text-xs text-destructive">{error}</p>}

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{FIELDS.map((f) => (
					<TextField
						key={f.key}
						label={labels[f.key]!}
						type={f.type}
						dir={f.ltr ? "ltr" : "auto"}
						value={p[f.key]}
						onChange={(v) => set(f.key, v)}
					/>
				))}
			</div>
		</div>
	);
}
