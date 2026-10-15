// Content mirrors portoqiqi.vercel.app (source: RifqiFachruradzi/ProtofolioPribadi, src/data/profile.js).
// The values live in content.json, which the admin panel edits and commits back to the repository.
import content from "./content.json";

export type Quest = {
  id: string;
  status: "active" | "complete";
  title: string;
  company: string;
  period: string;
  project: string;
  points: string[];
  tags: string[];
};

export type Project = {
  title: string;
  kind: string;
  period: string;
  description: string;
  highlights: string[];
  tags: string[];
  demo?: string;
  repo?: string;
  repo2?: string;
};

export type SkillGroup = { title: string; items: string[] };
export type Contact = { label: string; value: string; href: string };

export type Content = {
  profile: {
    name: string;
    role: string;
    location: string;
    headline: string;
    summary: string;
    attributes: { key: string; value: string }[];
  };
  sections: { journeyLead: string; projectsLead: string; skillsLead: string; summonLead: string };
  education: { degree: string; school: string; period: string; note: string };
  quests: Quest[];
  projects: Project[];
  skills: SkillGroup[];
  contacts: Contact[];
};

export const defaultContent = content as Content;

/** Blank items the editor adds to each list. */
export const templates: Record<string, unknown> = {
  attributes: { key: "", value: "" },
  quests: { id: "", status: "active", title: "", company: "", period: "", project: "", points: [""], tags: [] },
  projects: { title: "", kind: "Web App", period: "", description: "", highlights: [], tags: [], demo: "", repo: "", repo2: "" },
  skills: { title: "", items: [""] },
  contacts: { label: "", value: "", href: "" },
};
