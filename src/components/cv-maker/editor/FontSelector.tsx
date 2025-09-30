"use client";

import React from "react";
import { useCV } from "../CVContext";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import GOOGLE_FONTS from "@/lib/fontList";

export default function FontSelector() {
	const { state, dispatch } = useCV();
	const { selectedFont } = state;

	return (
		<Card>
			<CardContent className="space-y-2">
				<div>
					<Label className="mb-2" htmlFor="font-selector">
						Font
					</Label>
					<Select
						value={selectedFont}
						onValueChange={(value: string) =>
							dispatch({ type: "SET_FONT", payload: value })
						}>
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
			</CardContent>
		</Card>
	);
}
