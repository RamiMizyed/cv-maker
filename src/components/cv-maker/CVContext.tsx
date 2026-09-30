// components/cv-maker/CVContext.tsx
"use client";

import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import {
	CVData,
	CVSettings,
	ListItem,
	ListSectionKey,
	PersonalInfo,
	SectionConfig,
	SectionId,
} from "@/types/cv";
import { emptyItem, sampleCV } from "@/lib/cv/defaults";
import { normalizeCV } from "@/lib/cv/migrate";

const STORAGE_KEY = "cvmaker:v2";
const HISTORY_LIMIT = 100;
/** Edits to the same field within this window collapse into one undo step. */
const COALESCE_MS = 800;

export type Action =
	| { type: "SET_PERSONAL"; field: keyof PersonalInfo; value: string }
	| {
			type: "UPDATE_ITEM";
			section: ListSectionKey;
			id: string;
			patch: Record<string, string>;
	  }
	| { type: "ADD_ITEM"; section: ListSectionKey }
	| { type: "REMOVE_ITEM"; section: ListSectionKey; id: string }
	| { type: "MOVE_ITEM"; section: ListSectionKey; from: number; to: number }
	| { type: "SET_SKILLS"; skills: string[] }
	| { type: "UPDATE_SETTINGS"; patch: Partial<CVSettings> }
	| { type: "UPDATE_SECTION"; id: SectionId; patch: Partial<SectionConfig> }
	| { type: "MOVE_SECTION"; from: number; to: number }
	| { type: "REPLACE"; cv: CVData };

const move = <T,>(list: T[], from: number, to: number): T[] => {
	if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length)
		return list;
	const next = list.slice();
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
};

type AnyItem = ListItem<ListSectionKey>;

function cvReducer(state: CVData, action: Action): CVData {
	switch (action.type) {
		case "SET_PERSONAL":
			return {
				...state,
				personalInfo: { ...state.personalInfo, [action.field]: action.value },
			};
		case "UPDATE_ITEM":
			return {
				...state,
				[action.section]: (state[action.section] as AnyItem[]).map((item) =>
					item.id === action.id ? { ...item, ...action.patch } : item,
				),
			};
		case "ADD_ITEM":
			return {
				...state,
				[action.section]: [...state[action.section], emptyItem(action.section)],
			};
		case "REMOVE_ITEM":
			return {
				...state,
				[action.section]: (state[action.section] as AnyItem[]).filter(
					(item) => item.id !== action.id,
				),
			};
		case "MOVE_ITEM":
			return {
				...state,
				[action.section]: move(
					state[action.section] as AnyItem[],
					action.from,
					action.to,
				),
			};
		case "SET_SKILLS":
			return { ...state, skills: action.skills };
		case "UPDATE_SETTINGS":
			return { ...state, settings: { ...state.settings, ...action.patch } };
		case "UPDATE_SECTION":
			return {
				...state,
				settings: {
					...state.settings,
					sections: state.settings.sections.map((s) =>
						s.id === action.id ? { ...s, ...action.patch } : s,
					),
				},
			};
		case "MOVE_SECTION":
			return {
				...state,
				settings: {
					...state.settings,
					sections: move(state.settings.sections, action.from, action.to),
				},
			};
		case "REPLACE":
			return action.cv;
		default:
			return state;
	}
}

// ---------------- History ----------------

interface History {
	past: CVData[];
	present: CVData;
	future: CVData[];
	lastKey: string | null;
	lastTime: number;
}

type HistoryAction =
	| { type: "DO"; action: Action; time: number }
	| { type: "UNDO" }
	| { type: "REDO" }
	/** Load without creating an undo step (initial hydration). */
	| { type: "HYDRATE"; cv: CVData };

/** Typing into one field produces one key, so a burst of keystrokes undoes as one step. */
const coalesceKey = (a: Action): string | null => {
	switch (a.type) {
		case "SET_PERSONAL":
			return `p:${a.field}`;
		case "UPDATE_ITEM":
			return `i:${a.section}:${a.id}:${Object.keys(a.patch).join(",")}`;
		case "SET_SKILLS":
			return "skills";
		case "UPDATE_SETTINGS":
			return `s:${Object.keys(a.patch).join(",")}`;
		case "UPDATE_SECTION":
			return `sec:${a.id}:${Object.keys(a.patch).join(",")}`;
		default:
			return null;
	}
};

function historyReducer(h: History, a: HistoryAction): History {
	switch (a.type) {
		case "HYDRATE":
			return { past: [], present: a.cv, future: [], lastKey: null, lastTime: 0 };
		case "UNDO": {
			if (!h.past.length) return h;
			return {
				past: h.past.slice(0, -1),
				present: h.past[h.past.length - 1],
				future: [h.present, ...h.future],
				lastKey: null,
				lastTime: 0,
			};
		}
		case "REDO": {
			if (!h.future.length) return h;
			const [next, ...rest] = h.future;
			return {
				past: [...h.past, h.present],
				present: next,
				future: rest,
				lastKey: null,
				lastTime: 0,
			};
		}
		case "DO": {
			const next = cvReducer(h.present, a.action);
			if (next === h.present) return h;
			const key = coalesceKey(a.action);
			const merge =
				key !== null && key === h.lastKey && a.time - h.lastTime < COALESCE_MS;
			return {
				past: merge ? h.past : [...h.past, h.present].slice(-HISTORY_LIMIT),
				present: next,
				future: [],
				lastKey: key,
				lastTime: a.time,
			};
		}
	}
}

// ---------------- Context ----------------

interface CVContextValue {
	state: CVData;
	dispatch: (action: Action) => void;
	undo: () => void;
	redo: () => void;
	canUndo: boolean;
	canRedo: boolean;
	/** False until the saved CV (if any) has been read from localStorage. */
	hydrated: boolean;
	saveStatus: "idle" | "saving" | "saved" | "error";
}

const CVContext = createContext<CVContextValue | undefined>(undefined);

export const CVProvider = ({ children }: { children: ReactNode }) => {
	const [history, send] = useReducer(historyReducer, undefined, () => ({
		past: [],
		present: sampleCV(),
		future: [],
		lastKey: null,
		lastTime: 0,
	}));
	const [hydrated, setHydrated] = useState(false);
	const [saveStatus, setSaveStatus] =
		useState<CVContextValue["saveStatus"]>("idle");
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Restore the last session.
	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const saved = raw ? normalizeCV(JSON.parse(raw)) : null;
			if (saved) send({ type: "HYDRATE", cv: saved });
		} catch {
			// Corrupt or blocked storage: keep the sample CV.
		}
		setHydrated(true);
	}, []);

	// Autosave, debounced. A pending save is flushed if the tab is closed or hidden.
	useEffect(() => {
		if (!hydrated) return;
		const save = () => {
			if (saveTimer.current) clearTimeout(saveTimer.current);
			saveTimer.current = null;
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(history.present));
				setSaveStatus("saved");
			} catch {
				// Usually the storage quota, from a large portrait image.
				setSaveStatus("error");
			}
		};
		setSaveStatus("saving");
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(save, 500);
		const flush = () => saveTimer.current && save();
		window.addEventListener("pagehide", flush);
		return () => {
			window.removeEventListener("pagehide", flush);
			if (saveTimer.current) clearTimeout(saveTimer.current);
		};
	}, [history.present, hydrated]);

	const dispatch = useCallback(
		(action: Action) => send({ type: "DO", action, time: Date.now() }),
		[],
	);
	const undo = useCallback(() => send({ type: "UNDO" }), []);
	const redo = useCallback(() => send({ type: "REDO" }), []);

	// Ctrl/Cmd+Z, Ctrl+Y and Ctrl/Cmd+Shift+Z drive the CV history everywhere,
	// including inside text fields, so undo behaves the same wherever focus is.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
			const k = e.key.toLowerCase();
			if (k === "z" && !e.shiftKey) {
				e.preventDefault();
				undo();
			} else if (k === "y" || (k === "z" && e.shiftKey)) {
				e.preventDefault();
				redo();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [undo, redo]);

	const value = useMemo<CVContextValue>(
		() => ({
			state: history.present,
			dispatch,
			undo,
			redo,
			canUndo: history.past.length > 0,
			canRedo: history.future.length > 0,
			hydrated,
			saveStatus,
		}),
		[history, dispatch, undo, redo, hydrated, saveStatus],
	);

	return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
};

export const useCV = () => {
	const context = useContext(CVContext);
	if (!context) throw new Error("useCV must be used within a CVProvider");
	return context;
};
