"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "mcbank-progress-v1";

export type Attempt = {
  id: string;
  at: number;
  title: string;
  score: number;
  total: number;
};

export type Store = {
  right: Record<string, 1>;
  wrong: Record<string, 1>;
  history: Attempt[];
};

const empty: Store = { right: {}, wrong: {}, history: [] };

export function useProgress() {
  const [store, setStore] = useState<Store>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Store>;
        setStore({
          right: parsed.right ?? {},
          wrong: parsed.wrong ?? {},
          history: Array.isArray(parsed.history) ? parsed.history : [],
        });
      }
    } catch {
      /* keep the empty store */
    }
    setReady(true);
  }, []);

  const record = useCallback((id: string, correct: boolean) => {
    setStore((current) => {
      const right = { ...current.right };
      const wrong = { ...current.wrong };
      if (correct) {
        right[id] = 1;
        delete wrong[id];
      } else {
        delete right[id];
        wrong[id] = 1;
      }
      const next = { right, wrong, history: current.history };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveAttempt = useCallback((attempt: { title: string; score: number; total: number }) => {
    setStore((current) => {
      const at = Date.now();
      const last = current.history[0];
      if (
        last &&
        last.title === attempt.title &&
        last.score === attempt.score &&
        last.total === attempt.total &&
        at - last.at < 2500
      ) {
        return current;
      }
      const history = [{ id: `${at}`, at, ...attempt }, ...current.history].slice(0, 80);
      const next = { ...current, history };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setStore(empty);
  }, []);

  return { store, ready, record, saveAttempt, clear };
}
