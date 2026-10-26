import { MODULES } from "../lib/data";

const problems: string[] = [];
let total = 0;
for (const mod of MODULES) {
  const seen = new Set<string>();
  if (!mod.questions.length) problems.push(`${mod.id} has no questions`);
  for (const item of mod.questions) {
    total++;
    if (seen.has(item.q)) problems.push(`${mod.id} duplicate: ${item.q}`);
    seen.add(item.q);
    if (item.w.includes(item.a)) problems.push(`${mod.id} answer also wrong: ${item.q}`);
    if (new Set(item.w).size !== 3) problems.push(`${mod.id} wrong answers not unique: ${item.q}`);
    if (!item.e.trim()) problems.push(`${mod.id} empty explain: ${item.q}`);
  }
  const levels = [0, 1, 2].map((lv) => mod.questions.filter((q) => q.lv === lv).length);
  console.log(`${mod.id}: ${mod.questions.length} [${levels.join("/")}]`);
}
console.log("total", total);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
