"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MODULES, questionKey } from "@/lib/data";
import { PRACTICE_KEY, type Practice, type PracticeStatus } from "@/lib/practice";
import type { Attempt, Store } from "@/components/progress";
import type { Module } from "@/lib/types";

const LEVELS = [
  { id: "all", name: "All" },
  { id: "0", name: "Easy" },
  { id: "1", name: "Medium" },
  { id: "2", name: "Hard" },
] as const;

function tally(store: Store) {
  let total = 0;
  let correct = 0;
  let incorrect = 0;
  for (const mod of MODULES) {
    for (const item of mod.questions) {
      total += 1;
      const key = questionKey(mod.id, item.q);
      if (store.right[key]) correct += 1;
      else if (store.wrong[key]) incorrect += 1;
    }
  }
  const answered = correct + incorrect;
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const best = store.history.reduce((max, item) => {
    if (!item.total) return max;
    return Math.max(max, Math.round((item.score / item.total) * 100));
  }, 0);
  return {
    total,
    correct,
    incorrect,
    answered,
    remaining: total - answered,
    accuracy,
    quizzes: store.history.length,
    best,
  };
}

function moduleTally(mod: Module, store: Store) {
  let correct = 0;
  let incorrect = 0;
  for (const item of mod.questions) {
    const key = questionKey(mod.id, item.q);
    if (store.right[key]) correct += 1;
    else if (store.wrong[key]) incorrect += 1;
  }
  const answered = correct + incorrect;
  return {
    total: mod.questions.length,
    answered,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
  };
}

export function Dashboard({ store, ready }: { store: Store; ready: boolean }) {
  const router = useRouter();
  const stats = tally(ready ? store : { right: {}, wrong: {}, history: [] });
  const [moduleId, setModuleId] = useState("all");
  const [level, setLevel] = useState<Practice["level"]>("all");
  const [count, setCount] = useState("20");
  const [customCount, setCustomCount] = useState("15");
  const [timer, setTimer] = useState("none");
  const [customTimer, setCustomTimer] = useState("90");
  const [shuffleOn, setShuffleOn] = useState(true);

  function go(spec: Practice) {
    sessionStorage.setItem(PRACTICE_KEY, JSON.stringify(spec));
    router.push("/practice");
  }

  function customStart() {
    const n = count === "custom" ? Math.max(1, Number(customCount) || 10) : count === "all" ? "all" : Number(count);
    const seconds = timer === "custom" ? Math.max(10, Number(customTimer) || 60) : timer === "none" ? null : Number(timer);
    const mod = MODULES.find((item) => item.id === moduleId);
    go({
      title: mod ? mod.name : "Custom practice",
      moduleId,
      level,
      status: "all",
      count: n,
      shuffle: shuffleOn,
      timer: seconds,
    });
  }

  return (
    <>
      <h1>Ready for the shift?</h1>
      <p className="lead">
        {stats.total} practice questions across {MODULES.length} modules, from your manuals.
      </p>
      <div className="stats">
        <article className="stat">
          <b className="frac"><span>{stats.answered}</span><span className="sub">/ {stats.total}</span></b>
          <span>Answered</span>
        </article>
        <article className="stat"><b>{stats.remaining}</b><span>Remaining</span></article>
        <article className="stat"><b>{stats.correct}</b><span>Correct</span></article>
        <article className="stat"><b>{stats.incorrect}</b><span>Incorrect</span></article>
        <article className="stat"><b>{stats.accuracy}%</b><span>Accuracy</span></article>
        <article className="stat"><b>{stats.quizzes}</b><span>Completed quizzes</span></article>
        <article className="stat"><b>{stats.best}%</b><span>Best score</span></article>
      </div>

      <h2>Quick practice</h2>
      <div className="chips">
        <button className="chip on" type="button" onClick={() => go({ title: "All questions", moduleId: "all", level: "all", status: "all", count: "all", shuffle: true, timer: null })}>All questions</button>
        <button className="chip" type="button" onClick={() => go({ title: "Random 20", moduleId: "all", level: "all", status: "all", count: 20, shuffle: true, timer: null })}>Random 20</button>
        <button className="chip" type="button" onClick={() => go({ title: "Easy", moduleId: "all", level: "0", status: "all", count: "all", shuffle: true, timer: null })}>Easy</button>
        <button className="chip" type="button" onClick={() => go({ title: "Medium", moduleId: "all", level: "1", status: "all", count: "all", shuffle: true, timer: null })}>Medium</button>
        <button className="chip" type="button" onClick={() => go({ title: "Hard", moduleId: "all", level: "2", status: "all", count: "all", shuffle: true, timer: null })}>Hard</button>
        <button className="chip" type="button" disabled={!stats.incorrect} onClick={() => go({ title: "Incorrect", moduleId: "all", level: "all", status: "incorrect", count: "all", shuffle: true, timer: null })}>Incorrect ({stats.incorrect})</button>
        <button className="chip" type="button" disabled={!stats.remaining} onClick={() => go({ title: "Unanswered", moduleId: "all", level: "all", status: "unanswered", count: "all", shuffle: true, timer: null })}>Unanswered ({stats.remaining})</button>
      </div>

      <h2>Custom practice</h2>
      <form className="custom" onSubmit={(event) => { event.preventDefault(); customStart(); }}>
        <label className="field">Section
          <select value={moduleId} onChange={(event) => setModuleId(event.target.value)}>
            <option value="all">All</option>
            {MODULES.map((mod) => <option key={mod.id} value={mod.id}>{mod.name}</option>)}
          </select>
        </label>
        <label className="field">Difficulty
          <select value={level} onChange={(event) => setLevel(event.target.value as Practice["level"])}>
            {LEVELS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="field">Questions
          <select value={count} onChange={(event) => setCount(event.target.value)}>
            {["10", "20", "30", "50", "100", "all", "custom"].map((item) => (
              <option key={item} value={item}>{item === "all" ? "All" : item === "custom" ? "Custom…" : item}</option>
            ))}
          </select>
        </label>
        <label className="field">Timer
          <select value={timer} onChange={(event) => setTimer(event.target.value)}>
            <option value="none">None</option>
            <option value="30">30</option>
            <option value="45">45</option>
            <option value="60">60</option>
            <option value="custom">Custom…</option>
          </select>
        </label>
        <label className="shuffle"><input type="checkbox" checked={shuffleOn} onChange={(event) => setShuffleOn(event.target.checked)} /> Shuffle</label>
        <button className="start" type="submit">Start</button>
        {count === "custom" ? (
          <label className="field span">How many
            <input inputMode="numeric" value={customCount} onChange={(event) => setCustomCount(event.target.value)} />
          </label>
        ) : null}
        {timer === "custom" ? (
          <label className="field span">Seconds
            <input inputMode="numeric" value={customTimer} onChange={(event) => setCustomTimer(event.target.value)} />
          </label>
        ) : null}
      </form>

      <h2>Sections</h2>
      <div className="sections">
        {MODULES.map((mod) => {
          const row = moduleTally(mod, ready ? store : { right: {}, wrong: {}, history: [] });
          return (
            <article className="section" key={mod.id}>
              <h3><Link href={`/m/${mod.id}`}>{mod.name}</Link></h3>
              <p className="meta">{row.total} questions · {row.answered} answered · {row.accuracy}% accuracy</p>
              <span className="track" aria-hidden><i style={{ width: `${row.accuracy}%` }} /></span>
              <div className="row">
                <button className="chip" type="button" onClick={() => go({ title: mod.name, moduleId: mod.id, level: "all", status: "all", count: "all", shuffle: false, timer: null })}>Start</button>
                <button className="chip" type="button" onClick={() => go({ title: `${mod.name} · shuffled`, moduleId: mod.id, level: "all", status: "all", count: "all", shuffle: true, timer: null })}>Shuffle</button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export function HistoryView({ history }: { history: Attempt[] }) {
  return (
    <>
      <h1>Quiz history</h1>
      {history.length === 0 ? <p className="lead">No completed quizzes yet.</p> : (
        <div className="history">
          {history.map((item) => {
            const pct = item.total ? Math.round((item.score / item.total) * 100) : 0;
            const when = new Date(item.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
            return (
              <article className="hist" key={item.id}>
                <div>
                  <b>{item.title}</b>
                  <small>{when}</small>
                </div>
                <strong>{pct}%</strong>
                <span className="meta">{item.score}/{item.total}</span>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

const STATUS: { id: PracticeStatus | "review"; name: string }[] = [
  { id: "all", name: "All status" },
  { id: "answered", name: "Answered" },
  { id: "unanswered", name: "Unanswered" },
  { id: "correct", name: "Correct" },
  { id: "incorrect", name: "Incorrect" },
  { id: "review", name: "Needs review" },
];

export function BankView({ store }: { store: Store }) {
  const [moduleId, setModuleId] = useState("all");
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState<(typeof STATUS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const total = MODULES.reduce((n, mod) => n + mod.questions.length, 0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: { key: string; mod: string; prompt: string; answer: string; explain: string; level: string }[] = [];
    for (const mod of MODULES) {
      if (moduleId !== "all" && mod.id !== moduleId) continue;
      for (const item of mod.questions) {
        if (level !== "all" && item.lv !== Number(level)) continue;
        const key = questionKey(mod.id, item.q);
        const right = Boolean(store.right[key]);
        const wrong = Boolean(store.wrong[key]);
        const mode = status === "review" ? "incorrect" : status;
        if (mode === "answered" && !right && !wrong) continue;
        if (mode === "unanswered" && (right || wrong)) continue;
        if (mode === "correct" && !right) continue;
        if (mode === "incorrect" && !wrong) continue;
        if (q && !`${item.q} ${item.a} ${item.e}`.toLowerCase().includes(q)) continue;
        list.push({
          key,
          mod: mod.name,
          prompt: item.q,
          answer: item.a,
          explain: item.e,
          level: item.lv === 0 ? "easy" : item.lv === 1 ? "medium" : "hard",
        });
      }
    }
    return list;
  }, [moduleId, level, status, query, store]);

  return (
    <>
      <h1>Question bank</h1>
      <p className="lead">{total} questions</p>
      <div className="filters">
        <label className="field">Section
          <select value={moduleId} onChange={(event) => setModuleId(event.target.value)}>
            <option value="all">All sections</option>
            {MODULES.map((mod) => <option key={mod.id} value={mod.id}>{mod.name}</option>)}
          </select>
        </label>
        <label className="field">Difficulty
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="all">All difficulties</option>
            <option value="0">easy</option>
            <option value="1">medium</option>
            <option value="2">hard</option>
          </select>
        </label>
        <label className="field">Status
          <select value={status} onChange={(event) => setStatus(event.target.value as (typeof STATUS)[number]["id"])}>
            {STATUS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="field growfield">Find
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the bank" />
        </label>
      </div>
      <p className="meta">{rows.length} matching questions</p>
      <div className="bank">
        {rows.map((row) => (
          <details className="qrow" key={row.key}>
            <summary>
              <span className="dot" aria-hidden />
              <span>{row.prompt}</span>
              <small>{row.mod} · {row.level}</small>
            </summary>
            <p><b>{row.answer}</b></p>
            <p className="meta">{row.explain}</p>
          </details>
        ))}
      </div>
    </>
  );
}
