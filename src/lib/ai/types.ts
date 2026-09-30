// Response shapes shared by the AI routes and the client.

export type TailorResult = {
	summary: string;
	skillsToAdd: string[];
	experience: { id: string; bullets: string[] }[];
};
