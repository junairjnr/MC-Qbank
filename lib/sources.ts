export type SourceDoc = {
  id: string;
  title: string;
  file: string;
  text: string;
  kind: "PDF" | "Word";
  blurb: string;
  modules: string[];
};

export const SOURCES: SourceDoc[] = [
  {
    id: "sop-2024",
    title: "McCafé SOP, March 2024",
    file: "mccafe-sop-march-2024.pdf",
    text: "sop-2024.txt",
    kind: "PDF",
    blurb: "Drinks, cakes, pastries, and the March 2024 machine settings. 75 pages.",
    modules: ["coffee", "drinks", "pastry", "equipment", "pace"],
  },
  {
    id: "soc-2019",
    title: "McCafé SOC, 2019",
    file: "mccafe-soc-2019.pdf",
    text: "soc-2019.txt",
    kind: "PDF",
    blurb: "Barista station checklists, recipes, and presenting. 50 pages.",
    modules: ["coffee", "drinks", "pastry", "equipment"],
  },
  {
    id: "sio",
    title: "Shift Into Overdrive coaching day",
    file: "sio-coaching-day.pdf",
    text: "sio.txt",
    kind: "PDF",
    blurb: "The coaching-day activities, from pre-shift through post-shift.",
    modules: ["shift"],
  },
  {
    id: "strategy-2026",
    title: "2026 UAE strategic framework",
    file: "uae-strategic-framework-2026.pdf",
    text: "strategy-2026.txt",
    kind: "PDF",
    blurb: "Accelerating the Arches: pillars, targets, and the Ds.",
    modules: ["uae", "pace"],
  },
  {
    id: "values-2026",
    title: "UAE values framework 2026",
    file: "uae-values-framework-2026.pdf",
    text: "values-2026.txt",
    kind: "PDF",
    blurb: "What each value is, how people act, and the initiatives.",
    modules: ["uae"],
  },
  {
    id: "system-maps",
    title: "Nine restaurant system maps",
    file: "9-system-maps.pdf",
    text: "system-maps.txt",
    kind: "PDF",
    blurb: "Objectives, process, roles, and signals for all nine maps.",
    modules: ["shift", "safety", "pace"],
  },
  {
    id: "managers-notes",
    title: "Manager notes",
    file: "managers-notes.docx",
    text: "managers-notes.txt",
    kind: "Word",
    blurb: "Leadership, money words, grill settings, and McCafé machine notes.",
    modules: ["leadership", "equipment", "kitchen"],
  },
  {
    id: "knowledge-notes",
    title: "Knowledge notes",
    file: "knowledge-notes.docx",
    text: "knowledge-notes.txt",
    kind: "Word",
    blurb: "Hygiene, fries, grill, builds, service times, and station language.",
    modules: ["kitchen", "production", "safety"],
  },
];

export function getSource(id: string) {
  return SOURCES.find((doc) => doc.id === id);
}

export function sourcesFor(moduleId: string) {
  return SOURCES.filter((doc) => doc.modules.includes(moduleId));
}

export type ReadingPage = { n: string; body: string };

export function parseReading(raw: string): ReadingPage[] {
  const parts = raw.split(/\n*===== PAGE (\d+) =====\n*/);
  if (parts.length === 1) return [{ n: "1", body: raw.trim() }];
  const pages: ReadingPage[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    pages.push({ n: parts[i], body: (parts[i + 1] ?? "").trim() });
  }
  return pages.filter((page) => page.body.length > 0);
}
