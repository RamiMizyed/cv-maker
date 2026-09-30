// Small text helpers shared by the CV renderer and the analysis code.

export const absUrl = (url?: string) => {
	const u = (url || "").trim();
	if (!u) return "";
	if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
	return `https://${u}`;
};

export const displayUrl = (url?: string) =>
	(url || "")
		.trim()
		.replace(/^https?:\/\//i, "")
		.replace(/^www\./i, "")
		.replace(/\/+$/g, "");

export const toBullets = (text?: string) =>
	(text || "")
		.split("\n")
		.map((l) => l.replace(/^\s*[•\-*·▪–]\s*/, "").trim())
		.filter(Boolean);
