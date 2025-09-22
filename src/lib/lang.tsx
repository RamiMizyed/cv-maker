"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "tr" | "ar";

interface LangContextValue {
	lang: Lang;
	setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
	const [lang, setLang] = useState<Lang>("en");

	return (
		<LangContext.Provider value={{ lang, setLang }}>
			{children}
		</LangContext.Provider>
	);
}

export const useLang = () => {
	const context = useContext(LangContext);
	if (!context) throw new Error("useLang must be used within LangProvider");
	return context;
};
