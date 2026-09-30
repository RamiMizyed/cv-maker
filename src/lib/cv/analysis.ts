// Client-side CV checks and job keyword matching. No network, no AI cost.
import { CVData } from "@/types/cv";
import { Translation } from "@/lib/translations";
import { toBullets } from "./format";

export type Check = { id: keyof Translation; pass: boolean };

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const WEAK_STARTS = new Set([
	"responsible",
	"worked",
	"helped",
	"assisted",
	"was",
	"were",
	"i",
	"my",
	"duties",
	"tasked",
	"involved",
	"participated",
	"handled",
	"did",
]);

export function runChecks(cv: CVData): { checks: Check[]; score: number } {
	const roles = cv.experience.filter((e) => e.position || e.company);
	const bullets = roles.flatMap((r) => toBullets(r.description));
	const english = cv.settings.language === "en";
	const summaryWords = words(cv.personalInfo.summary);

	const allText = [
		cv.personalInfo.summary,
		...cv.experience.map((e) => e.description),
		...cv.projects.map((p) => p.description),
		...cv.education.map((e) => e.details),
	].join(" ");

	const checks: (Check | null)[] = [
		{ id: "chkContact", pass: !!cv.personalInfo.email.trim() && !!cv.personalInfo.phone.trim() },
		{ id: "chkSummary", pass: summaryWords >= 30 && summaryWords <= 120 },
		{ id: "chkExperience", pass: roles.length > 0 },
		{ id: "chkDates", pass: roles.length > 0 && roles.every((r) => r.startDate.trim()) },
		{
			id: "chkBullets",
			pass:
				roles.length > 0 &&
				roles.every((r) => {
					const n = toBullets(r.description).length;
					return n >= 2 && n <= 6;
				}),
		},
		{
			id: "chkNumbers",
			pass: bullets.length > 0 && bullets.filter((b) => /\d/.test(b)).length / bullets.length >= 0.5,
		},
		// Verb and pronoun checks only make sense for English text.
		english
			? {
					id: "chkVerbs",
					pass:
						bullets.length > 0 &&
						bullets.filter(
							(b) => !WEAK_STARTS.has(b.split(/\s+/)[0]?.toLowerCase().replace(/\W/g, "")),
						).length /
							bullets.length >=
							0.8,
				}
			: null,
		english ? { id: "chkPronouns", pass: !/\b(I|my|me)\b/.test(bullets.join(" ")) } : null,
		{ id: "chkSkills", pass: cv.skills.length >= 5 && cv.skills.length <= 25 },
		// Roughly 450 words per page at the default size.
		{ id: "chkLength", pass: words(allText) <= 900 },
	];

	const applicable = checks.filter((c): c is Check => c !== null);
	const score = Math.round(
		(applicable.filter((c) => c.pass).length / applicable.length) * 100,
	);
	return { checks: applicable, score };
}

// ---------------- keyword matching ----------------

const STOP = new Set(
	(
		"a an and are as at be been being but by can could did do does for from had has have having he her his how i if in into is it its just may me might more most must my no not of on or our ours out over own same she should so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours " +
		"about above across after again against all also am any because before below between both during each few further here itself let like make many much nor off once only other ourselves per since therefore though themselves upon via whether within without yet " +
		// job-ad boilerplate
		"ability able apply applicant applicants candidate candidates company role roles position positions job jobs team teams work working works experience experienced years year strong excellent good great new including include includes etc well plus preferred required requirements requirement responsibilities responsibility skills skill knowledge understanding looking join us opportunity opportunities environment based across within day days time full part benefits salary offer offers ensure help support using use used following related relevant equivalent degree bonus nice highly minimum least successful ideal someone who what you'll we're you're it's " +
		// generic verbs and filler that say nothing about the skills wanted
		"hiring hire build building builds own owning collaborate collaborating collaboration partner partnering write writing improve improving similar seeking want wants need needs drive driving deliver delivering create creating develop developing make making manage managing lead leading provide providing maintain maintaining various multiple across etc. fast-paced passionate motivated self-starter excited love " +
		// Turkish
		"ve ile bir bu için da de olarak olan gibi en çok daha ama veya ya her biz siz iş deneyim deneyimi aranan tercih " +
		// Arabic
		"في من على إلى عن مع أو و ما هذا هذه التي الذي أن كان يكون لدى خبرة"
	).split(/\s+/),
);

const tokenize = (text: string) =>
	(text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}+#.\-/]*[\p{L}\p{N}+#]|[\p{L}]/gu) || [])
		.map((w) => w.replace(/[.\-/]+$/, ""))
		.filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w));

export type KeywordResult = { matched: string[]; missing: string[]; percent: number };

export function matchKeywords(cv: CVData, job: string): KeywordResult | null {
	if (job.trim().length < 40) return null;

	const tokens = tokenize(job);
	const freq = new Map<string, number>();
	const bump = (k: string, n = 1) => freq.set(k, (freq.get(k) || 0) + n);

	tokens.forEach((w, i) => {
		bump(w);
		// Two-word phrases ("project management") count extra when they repeat.
		if (i > 0) bump(`${tokens[i - 1]} ${w}`, 0.5);
	});

	// Words written with a capital or symbol mid-sentence are usually tools or brands (AWS, Figma, C#).
	for (const m of job.matchAll(/(?:(?<=[a-z,;:]\s)|(?<=[(/]))([A-Z][\w+#.]*[\w+#]|[A-Z]{2,})/g)) {
		const k = m[1].toLowerCase();
		if (!STOP.has(k)) bump(k, 1.5);
	}

	// Short ads mention most skills once, so single words count from one mention
	// (if long enough to be meaningful); phrases only count when they repeat.
	// Sort is stable, so ties keep the order they appear in the ad.
	const ranked = [...freq.entries()]
		.filter(([k, n]) => (k.includes(" ") ? n >= 1 : k.length >= 4 || n >= 1.5 || /[+#.]/.test(k)))
		.sort((a, b) => b[1] - a[1])
		.map(([k]) => k);

	// Drop single words already covered by a chosen phrase.
	const picked: string[] = [];
	for (const k of ranked) {
		if (picked.length >= 20) break;
		if (picked.some((p) => p.split(" ").includes(k) || k.split(" ").includes(p))) continue;
		picked.push(k);
	}
	if (!picked.length) return null;

	const haystack = [
		cv.personalInfo.title,
		cv.personalInfo.summary,
		cv.skills.join(" "),
		...cv.experience.flatMap((e) => [e.position, e.description]),
		...cv.projects.flatMap((p) => [p.name, p.technologies, p.description]),
		...cv.education.flatMap((e) => [e.degree, e.details]),
		...cv.certifications.map((c) => c.name),
	]
		.join(" ")
		.toLowerCase();

	// Light English stemming so "mentoring" matches "mentored" and "tests" matches "testing".
	const stem = (w: string) => {
		const s = w.replace(/(ations?|ings?|ed|es|s)$/, "");
		return s.length >= 4 ? s : w;
	};
	const has = (k: string) => {
		const needle = k.includes(" ") ? k : stem(k);
		return new RegExp(
			`(^|[^\\p{L}\\p{N}])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
			"u",
		).test(haystack);
	};

	const matched = picked.filter(has);
	const missing = picked.filter((k) => !has(k));
	return {
		matched,
		missing,
		percent: Math.round((matched.length / picked.length) * 100),
	};
}
