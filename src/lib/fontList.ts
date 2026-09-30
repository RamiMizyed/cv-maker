// Fonts bundled in /public/fonts and declared with @font-face in globals.css.

export type FontOption = { label: string; value: string; arabic?: boolean };

export const FONTS: { latin: FontOption[]; arabic: FontOption[] } = {
	latin: [
		{ label: "Roboto", value: "Roboto" },
		{ label: "Open Sans", value: "Open Sans" },
		{ label: "Lato", value: "Lato" },
		{ label: "Montserrat", value: "Montserrat" },
		{ label: "Source Sans 3", value: "Source Sans 3" },
		{ label: "PT Sans", value: "PT Sans" },
		{ label: "Ubuntu", value: "Ubuntu" },
		{ label: "Merriweather", value: "Merriweather" },
		{ label: "Oswald", value: "Oswald" },
	],
	arabic: [
		{ label: "Cairo", value: "Cairo", arabic: true },
		{ label: "Tajawal", value: "Tajawal", arabic: true },
		{ label: "Almarai", value: "Almarai", arabic: true },
		{ label: "Amiri", value: "Amiri", arabic: true },
		{ label: "Scheherazade New", value: "Scheherazade New", arabic: true },
		{ label: "Lalezar", value: "Lalezar", arabic: true },
	],
};

export const isArabicFont = (font: string) => FONTS.arabic.some((f) => f.value === font);
