import type { Module } from "../types";
import { coffee } from "./coffee";
import { drinks } from "./drinks";
import { equipment, pastry } from "./pastry-equip";
import { safety, shift } from "./shift-safety";
import { leadership, uae } from "./uae-lead";
import { kitchen, pace, production } from "./kitchen-pace";

export const MODULES: Module[] = [
  coffee,
  drinks,
  pastry,
  equipment,
  shift,
  safety,
  uae,
  leadership,
  kitchen,
  pace,
  production,
];

export function getModule(id: string) {
  return MODULES.find((m) => m.id === id);
}

export function questionKey(moduleId: string, prompt: string) {
  let h = 5381;
  const s = `${moduleId}\0${prompt}`;
  for (let i = 0; i < s.length; i++) h = Math.imul(h, 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}
