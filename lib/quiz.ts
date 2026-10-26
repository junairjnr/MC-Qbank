import type { Lv, Module, Q } from "./types";
import { questionKey } from "./data";

export type Card = {
  key: string;
  moduleId: string;
  moduleName: string;
  prompt: string;
  answer: string;
  options: string[];
  explain: string;
  level: Lv;
};

export function shuffle<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function toCard(moduleId: string, moduleName: string, item: Q): Card {
  return {
    key: questionKey(moduleId, item.q),
    moduleId,
    moduleName,
    prompt: item.q,
    answer: item.a,
    options: shuffle([item.a, ...item.w]),
    explain: item.e,
    level: item.lv,
  };
}

export function moduleCards(mod: Module, level?: Lv) {
  const items = level == null ? mod.questions : mod.questions.filter((item) => item.lv === level);
  return shuffle(items.map((item) => toCard(mod.id, mod.name, item)));
}

export function mixedCards(modules: Module[], perModule = 10) {
  return shuffle(
    modules.flatMap((mod) =>
      shuffle(mod.questions)
        .slice(0, perModule)
        .map((item) => toCard(mod.id, mod.name, item)),
    ),
  );
}

export function cardsByKeys(modules: Module[], keys: string[]) {
  const want = new Set(keys);
  const found: Card[] = [];
  for (const mod of modules) {
    for (const item of mod.questions) {
      const key = questionKey(mod.id, item.q);
      if (want.has(key)) found.push(toCard(mod.id, mod.name, item));
    }
  }
  return shuffle(found);
}

export const LEVELS: { id: Lv; name: string }[] = [
  { id: 0, name: "Easy" },
  { id: 1, name: "Medium" },
  { id: 2, name: "Hard" },
];
