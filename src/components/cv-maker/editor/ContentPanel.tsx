// components/cv-maker/editor/ContentPanel.tsx
"use client";

import React, { useId, useState } from "react";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ArrowDown,
	ArrowUp,
	ChevronDown,
	Eye,
	EyeOff,
	GripVertical,
	Plus,
	Trash2,
	UserRound,
} from "lucide-react";
import { useCV } from "../CVContext";
import { ListSectionKey, SectionConfig, SectionId } from "@/types/cv";
import { Translation } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { IconButton, TextAreaField, TextField, useT } from "./fields";
import PersonalForm from "./PersonalForm";
import SkillsInput from "./SkillsInput";

// ---------------- field configuration per list section ----------------

type FieldDef = {
	key: string;
	label: keyof Translation;
	multiline?: boolean;
	wide?: boolean;
	hint?: keyof Translation;
	type?: string;
};

const FIELDS: Record<ListSectionKey, FieldDef[]> = {
	experience: [
		{ key: "position", label: "position" },
		{ key: "company", label: "company" },
		{ key: "startDate", label: "startDate" },
		{ key: "endDate", label: "endDate", hint: "endDateHint" },
		{ key: "location", label: "location" },
		{ key: "companyUrl", label: "companyUrl", type: "url" },
		{ key: "description", label: "description", multiline: true, wide: true, hint: "bulletsHint" },
	],
	education: [
		{ key: "degree", label: "degree", wide: true },
		{ key: "institution", label: "institution", wide: true },
		{ key: "startDate", label: "startDate" },
		{ key: "endDate", label: "endDate" },
		{ key: "details", label: "details", multiline: true, wide: true },
	],
	projects: [
		{ key: "name", label: "projectName" },
		{ key: "link", label: "projectLink", type: "url" },
		{ key: "technologies", label: "projectTech", wide: true },
		{ key: "description", label: "description", multiline: true, wide: true, hint: "bulletsHint" },
	],
	languages: [
		{ key: "name", label: "languageName" },
		{ key: "level", label: "languageLevel" },
	],
	certifications: [
		{ key: "name", label: "certName", wide: true },
		{ key: "issuer", label: "certIssuer" },
		{ key: "date", label: "certDate" },
		{ key: "link", label: "certLink", type: "url", wide: true },
	],
};

const itemTitle = (section: ListSectionKey, item: Record<string, string>) => {
	switch (section) {
		case "experience":
			return [item.position, item.company].filter(Boolean).join(" · ");
		case "education":
			return item.degree || item.institution;
		default:
			return item.name;
	}
};

// ---------------- list editor ----------------

function ListEditor({ section }: { section: ListSectionKey }) {
	const { state, dispatch } = useCV();
	const t = useT();
	const items = state[section] as unknown as (Record<string, string> & { id: string })[];
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

	return (
		<div className="space-y-3">
			{items.length === 0 && (
				<p className="text-sm text-muted-foreground">{t.emptySection}</p>
			)}
			{items.map((item, index) => {
				const isCollapsed = collapsed[item.id];
				return (
					<div key={item.id} className="rounded-lg border bg-background/60">
						<div className="flex items-center gap-1 py-1 pe-1 ps-3">
							<button
								type="button"
								className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-start text-sm font-medium"
								onClick={() =>
									setCollapsed((c) => ({ ...c, [item.id]: !c[item.id] }))
								}
								aria-expanded={!isCollapsed}>
								<ChevronDown
									className={cn(
										"size-4 shrink-0 text-muted-foreground transition-transform",
										isCollapsed && "-rotate-90 rtl:rotate-90",
									)}
								/>
								<span className="truncate">
									{itemTitle(section, item) || (
										<span className="text-muted-foreground">{t.untitled}</span>
									)}
								</span>
							</button>
							<IconButton
								label={t.moveUp}
								disabled={index === 0}
								onClick={() =>
									dispatch({ type: "MOVE_ITEM", section, from: index, to: index - 1 })
								}>
								<ArrowUp />
							</IconButton>
							<IconButton
								label={t.moveDown}
								disabled={index === items.length - 1}
								onClick={() =>
									dispatch({ type: "MOVE_ITEM", section, from: index, to: index + 1 })
								}>
								<ArrowDown />
							</IconButton>
							<IconButton
								label={t.remove}
								className="hover:text-destructive"
								onClick={() => dispatch({ type: "REMOVE_ITEM", section, id: item.id })}>
								<Trash2 />
							</IconButton>
						</div>
						{!isCollapsed && (
							<div className="grid grid-cols-1 gap-3 border-t p-3 sm:grid-cols-2">
								{FIELDS[section].map((f) => {
									const props = {
										label: t[f.label],
										value: item[f.key] ?? "",
										hint: f.hint ? t[f.hint] : undefined,
										className: f.wide || f.multiline ? "sm:col-span-2" : undefined,
										onChange: (value: string) =>
											dispatch({
												type: "UPDATE_ITEM",
												section,
												id: item.id,
												patch: { [f.key]: value },
											}),
									};
									return f.multiline ? (
										<TextAreaField key={f.key} {...props} minRows={3} />
									) : (
										<TextField
											key={f.key}
											{...props}
											type={f.type}
											dir={f.type === "url" ? "ltr" : "auto"}
										/>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
			<button
				type="button"
				onClick={() => dispatch({ type: "ADD_ITEM", section })}
				className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
				<Plus className="size-4" />
				{t.add}
			</button>
		</div>
	);
}

// ---------------- section panels ----------------

function SectionBody({ id }: { id: SectionId }) {
	const { state, dispatch } = useCV();
	const t = useT();
	if (id === "summary") {
		return (
			<TextAreaField
				label={t.summary}
				value={state.personalInfo.summary}
				minRows={4}
				onChange={(value) => dispatch({ type: "SET_PERSONAL", field: "summary", value })}
			/>
		);
	}
	if (id === "skills") return <SkillsInput />;
	return <ListEditor section={id} />;
}

function Panel({
	title,
	icon,
	open,
	onToggle,
	children,
	actions,
	muted,
	dragHandle,
}: {
	title: string;
	icon?: React.ReactNode;
	open: boolean;
	onToggle: () => void;
	children: React.ReactNode;
	actions?: React.ReactNode;
	muted?: boolean;
	dragHandle?: React.ReactNode;
}) {
	return (
		<div className="rounded-xl border bg-card shadow-xs">
			<div className="flex items-center gap-1 pe-2 ps-1">
				{dragHandle}
				<button
					type="button"
					onClick={onToggle}
					aria-expanded={open}
					className={cn(
						"flex min-w-0 flex-1 items-center gap-2 px-2 py-3 text-start font-semibold",
						muted && "text-muted-foreground line-through decoration-1",
					)}>
					{icon}
					<span className="truncate">{title}</span>
				</button>
				{actions}
				<IconButton label={title} onClick={onToggle}>
					<ChevronDown
						className={cn("transition-transform", !open && "-rotate-90 rtl:rotate-90")}
					/>
				</IconButton>
			</div>
			{open && <div className="space-y-3 border-t p-4">{children}</div>}
		</div>
	);
}

function SortableSection({
	section,
	open,
	onToggle,
}: {
	section: SectionConfig;
	open: boolean;
	onToggle: () => void;
}) {
	const { dispatch } = useCV();
	const t = useT();
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
		useSortable({ id: section.id });

	const title = section.title.trim() || t[section.id];

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={cn(isDragging && "relative z-10 opacity-90 shadow-lg")}>
			<Panel
				title={title}
				open={open}
				onToggle={onToggle}
				muted={!section.visible}
				dragHandle={
					<button
						type="button"
						ref={setActivatorNodeRef}
						{...attributes}
						{...listeners}
						aria-label={t.dragHandle}
						title={t.dragHandle}
						className="flex h-10 w-6 cursor-grab touch-none items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing">
						<GripVertical className="size-4" />
					</button>
				}
				actions={
					<IconButton
						label={section.visible ? t.hide : t.show}
						onClick={() =>
							dispatch({
								type: "UPDATE_SECTION",
								id: section.id,
								patch: { visible: !section.visible },
							})
						}>
						{section.visible ? <Eye /> : <EyeOff />}
					</IconButton>
				}>
				<TextField
					label={t.sectionTitle}
					value={section.title}
					placeholder={t[section.id]}
					onChange={(value) =>
						dispatch({ type: "UPDATE_SECTION", id: section.id, patch: { title: value } })
					}
				/>
				<SectionBody id={section.id} />
			</Panel>
		</div>
	);
}

export default function ContentPanel() {
	const { state, dispatch } = useCV();
	const t = useT();
	const dndId = useId();
	const [open, setOpen] = useState<Record<string, boolean>>({ personal: true });
	const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const sections = state.settings.sections;
	const onDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		dispatch({
			type: "MOVE_SECTION",
			from: sections.findIndex((s) => s.id === active.id),
			to: sections.findIndex((s) => s.id === over.id),
		});
	};

	return (
		<div className="space-y-3">
			<Panel
				title={t.personal}
				icon={<UserRound className="size-4 text-primary" />}
				open={!!open.personal}
				onToggle={() => toggle("personal")}>
				<PersonalForm />
			</Panel>

			<DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
				<SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
					<div className="space-y-3">
						{sections.map((s) => (
							<SortableSection
								key={s.id}
								section={s}
								open={!!open[s.id]}
								onToggle={() => toggle(s.id)}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
}
