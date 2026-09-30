// components/cv-maker/editor/fields.tsx
"use client";

import React, { useId, useLayoutEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/lib/lang";
import translations from "@/lib/translations";
import { cn } from "@/lib/utils";

export const useT = () => translations[useLang().lang];

type BaseProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	hint?: string;
	placeholder?: string;
	className?: string;
	dir?: "ltr" | "rtl" | "auto";
};

export function TextField({
	label,
	value,
	onChange,
	hint,
	placeholder,
	className,
	type = "text",
	dir = "auto",
}: BaseProps & { type?: string }) {
	const id = useId();
	return (
		<div className={cn("space-y-1.5", className)}>
			<Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
				{label}
			</Label>
			<Input
				id={id}
				type={type}
				dir={dir}
				value={value}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
			/>
			{hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
		</div>
	);
}

/** Textarea that grows with its content, so long bullet lists need no inner scroll. */
export function TextAreaField({
	label,
	value,
	onChange,
	hint,
	placeholder,
	className,
	minRows = 3,
	dir = "auto",
}: BaseProps & { minRows?: number }) {
	const id = useId();
	const ref = useRef<HTMLTextAreaElement>(null);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight + 2}px`;
	}, [value]);

	return (
		<div className={cn("space-y-1.5", className)}>
			<Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
				{label}
			</Label>
			<Textarea
				ref={ref}
				id={id}
				dir={dir}
				rows={minRows}
				value={value}
				placeholder={placeholder}
				className="resize-none overflow-hidden leading-relaxed"
				onChange={(e) => onChange(e.target.value)}
			/>
			{hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
		</div>
	);
}

export function Segmented<T extends string>({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (v: T) => void;
}) {
	return (
		<div className="space-y-1.5">
			<p className="text-xs font-medium text-muted-foreground">{label}</p>
			<div role="radiogroup" aria-label={label} className="flex rounded-lg bg-muted p-1">
				{options.map((o) => (
					<button
						key={o.value}
						type="button"
						role="radio"
						aria-checked={value === o.value}
						onClick={() => onChange(o.value)}
						className={cn(
							"flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
							value === o.value
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}>
						{o.label}
					</button>
				))}
			</div>
		</div>
	);
}

export function Switch({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
			<span>{label}</span>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={cn(
					"relative h-5 w-9 shrink-0 rounded-full transition-colors",
					checked ? "bg-primary" : "bg-input",
				)}>
				<span
					className={cn(
						"absolute top-0.5 size-4 rounded-full bg-white shadow transition-all",
						checked ? "start-[18px]" : "start-0.5",
					)}
				/>
			</button>
		</label>
	);
}

export function IconButton({
	label,
	onClick,
	disabled,
	children,
	className,
}: {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<button
			type="button"
			title={label}
			aria-label={label}
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4",
				className,
			)}>
			{children}
		</button>
	);
}
