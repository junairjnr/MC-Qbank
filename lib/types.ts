export type Lv = 0 | 1 | 2;

export type Q = {
  q: string;
  a: string;
  w: [string, string, string];
  e: string;
  lv: Lv;
};

export type Step = { t: string; d: string };

export type Flow = { title: string; steps: Step[] };

export type Note = { lv: Lv; text: string };

export type Spec = { title: string; columns: string[]; rows: string[][] };

export type Module = {
  id: string;
  name: string;
  summary: string;
  flows: Flow[];
  notes: Note[];
  specs?: Spec[];
  questions: Q[];
};

export const LV_NAME = ["Easy", "Medium", "Hard"] as const;

export function qq(
  q: string,
  a: string,
  w1: string,
  w2: string,
  w3: string,
  e: string,
  lv: Lv,
): Q {
  return { q, a, w: [w1, w2, w3], e, lv };
}
