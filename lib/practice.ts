import { MODULES, questionKey } from "./data";
import { shuffle, toCard, type Card } from "./quiz";

type Marks = { right: Record<string, 1>; wrong: Record<string, 1> };

export type PracticeStatus = "all" | "answered" | "unanswered" | "correct" | "incorrect";

export type Practice = {
  title: string;
  moduleId: string;
  level: "all" | "0" | "1" | "2";
  status: PracticeStatus;
  count: number | "all";
  shuffle: boolean;
  timer: number | null;
};

export const PRACTICE_KEY = "mcbank-practice";

export function practiceCards(spec: Practice, store: Marks): Card[] {
  const mods = spec.moduleId === "all" ? MODULES : MODULES.filter((mod) => mod.id === spec.moduleId);
  let cards: Card[] = [];
  for (const mod of mods) {
    for (const item of mod.questions) {
      if (spec.level !== "all" && item.lv !== Number(spec.level)) continue;
      const key = questionKey(mod.id, item.q);
      const right = Boolean(store.right[key]);
      const wrong = Boolean(store.wrong[key]);
      if (spec.status === "answered" && !right && !wrong) continue;
      if (spec.status === "unanswered" && (right || wrong)) continue;
      if (spec.status === "correct" && !right) continue;
      if (spec.status === "incorrect" && !wrong) continue;
      cards.push(toCard(mod.id, mod.name, item));
    }
  }
  if (spec.shuffle) cards = shuffle(cards);
  if (spec.count !== "all") cards = cards.slice(0, spec.count);
  return cards;
}
