"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MODULES, getModule, questionKey } from "@/lib/data";
import { LEVELS, cardsByKeys, mixedCards, moduleCards, type Card } from "@/lib/quiz";
import { PRACTICE_KEY, practiceCards, type Practice } from "@/lib/practice";
import { BankView, Dashboard, HistoryView } from "@/components/dashboard";
import { Library, Reader, sourceLinks } from "@/components/library";
import { useProgress } from "@/components/progress";
import type { Lv, Module } from "@/lib/types";

const LEVEL_WORD = ["Easy", "Medium", "Hard"] as const;

export function StudyApp({ slug }: { slug: string[] }) {
  const progress = useProgress();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("mcbank-theme", next);
    setTheme(next);
  }

  const [head, id, mode, level] = slug;
  let body: ReactNode = <Dashboard store={progress.store} ready={progress.ready} />;
  if (head === "history") {
    body = <HistoryView history={progress.store.history} />;
  } else if (head === "bank") {
    body = <BankView store={progress.store} />;
  } else if (head === "practice") {
    body = <PracticeQuiz progress={progress} />;
  } else if (head === "m" && id) {
    const mod = getModule(id);
    if (!mod) body = <Missing />;
    else if (mode === "study") body = <Study mod={mod} />;
    else if (mode === "quiz") body = <QuizScreen key={`${mod.id}:${level ?? "all"}`} title={level ? `${mod.name} · ${level}` : mod.name} source={`${mod.id}:${level ?? "all"}`} build={() => moduleCards(mod, levelName(level))} back={`/m/${mod.id}`} progress={progress} />;
    else body = <ModuleHome mod={mod} store={progress.store} />;
  } else if (head === "mixed") {
    body = <QuizScreen key="mixed" title="Mixed set" source="mixed" build={() => mixedCards(MODULES, 8)} back="/" progress={progress} />;
  } else if (head === "review") {
    const keys = Object.keys(progress.store.wrong);
    body = (
      <QuizScreen
        key="review"
        title="Missed questions"
        source="review"
        build={() => cardsByKeys(MODULES, keys)}
        back="/"
        progress={progress}
      />
    );
  } else if (head === "search") {
    body = <Search />;
  } else if (head === "read" && id) {
    body = <Reader id={id} />;
  } else if (head === "read") {
    body = <Library />;
  } else if (head) {
    body = <Missing />;
  }

  const parent = parentPath(slug);
  const nav = !head ? "dash" : head === "history" ? "history" : head === "bank" ? "bank" : head === "read" ? "read" : "";

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="wrap">
        <header className={parent ? "top has-back" : "top"}>
          {parent ? <Link className="iconbtn backbtn" href={parent}>Back</Link> : null}
          <Link className="brand" href="/">
            <span className="mark" aria-hidden><span /></span>
            <span className="brand-name">MCD · Study Q-Bank</span>
          </Link>
          <div className="navcluster">
            <nav className="nav" aria-label="Main">
              <Link href="/" aria-current={nav === "dash" ? "page" : undefined}>Dashboard</Link>
              <Link href="/history" aria-current={nav === "history" ? "page" : undefined}>History</Link>
              <Link href="/bank" aria-current={nav === "bank" ? "page" : undefined}>Question Bank</Link>
              <Link href="/read" aria-current={nav === "read" ? "page" : undefined}>Read</Link>
            </nav>
            <button className="themebtn" type="button" onClick={toggleTheme} aria-label="Toggle dark/light theme">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                {theme === "dark"
                  ? <path fill="currentColor" d="M8 1.2a6.8 6.8 0 1 0 6.6 8.4A5.4 5.4 0 0 1 8 1.2z" />
                  : <path fill="currentColor" d="M8 2.2a.7.7 0 0 1 .7.7V4a.7.7 0 1 1-1.4 0V2.9A.7.7 0 0 1 8 2.2zm0 8.2A2.4 2.4 0 1 0 8 6a2.4 2.4 0 0 0 0 4.4zM2.9 7.3A.7.7 0 0 1 3.6 8a.7.7 0 0 1-.7.7H1.8a.7.7 0 0 1 0-1.4H2.9zm11.3 0a.7.7 0 0 1 0 1.4H13a.7.7 0 1 1 0-1.4h1.2zM4.1 3.4a.7.7 0 0 1 1 0l.8.8a.7.7 0 1 1-1 1l-.8-.8a.7.7 0 0 1 0-1zm6.9 6.9a.7.7 0 0 1 1 0l.8.8a.7.7 0 1 1-1 1l-.8-.8a.7.7 0 0 1 0-1zM11 3.4a.7.7 0 0 1 0 1l-.8.8a.7.7 0 1 1-1-1l.8-.8a.7.7 0 0 1 1 0zM5.9 10.3a.7.7 0 0 1 0 1l-.8.8a.7.7 0 1 1-1-1l.8-.8a.7.7 0 0 1 1 0z" />}
              </svg>
            </button>
          </div>
        </header>
        <main id="main">{body}</main>
        <p className="foot">
          Personal study set from the March 2024 McCafé SOP, the 2019 SOC, the SIO coaching guide, the nine system maps, the UAE values framework, the 2026 strategy sheet, and the manager and knowledge notes. Where those documents disagree, the question names the source. Follow the copy posted in your restaurant. Equipment menu codes are not included.
        </p>
      </div>
    </>
  );
}

function parentPath(slug: string[]) {
  const [head, id, mode] = slug;
  if (!head || head === "history" || head === "bank") return null;
  if (head === "read" && !id) return null;
  if (head === "m" && id && (mode === "study" || mode === "quiz")) return `/m/${id}`;
  if (head === "read" && id) return "/read";
  return "/";
}

function levelName(value?: string): Lv | undefined {
  if (value === "easy") return 0;
  if (value === "medium") return 1;
  if (value === "hard") return 2;
  return undefined;
}

function PracticeQuiz({ progress }: { progress: ReturnType<typeof useProgress> }) {
  const [spec, setSpec] = useState<Practice | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PRACTICE_KEY);
      setSpec(raw ? (JSON.parse(raw) as Practice) : null);
    } catch {
      setSpec(null);
    }
  }, []);

  if (spec === undefined || !progress.ready) return <p className="lead">Preparing the set.</p>;
  if (!spec) {
    return (
      <>
        <h1>Practice</h1>
        <p className="lead">Choose a set from the dashboard.</p>
        <Link className="btn" href="/">Dashboard</Link>
      </>
    );
  }
  return (
    <QuizScreen
      key={`${spec.title}:${spec.moduleId}:${spec.level}:${spec.status}:${spec.count}:${spec.timer ?? "none"}`}
      title={spec.title}
      source="practice"
      timerSec={spec.timer}
      build={() => practiceCards(spec, progress.store)}
      back="/"
      progress={progress}
    />
  );
}

function ModuleHome({ mod, store }: { mod: Module; store: { right: Record<string, 1> } }) {
  return (
    <>
      <p className="meta"><Link href="/">All modules</Link></p>
      <h1>{mod.name}</h1>
      <p className="lead">{mod.summary}</p>
      <div className="mods">
        <Link className="mod" href={`/m/${mod.id}/study`}>
          <span className="idx">Read</span>
          <span><b>Reference</b><small>Steps, tables, and the notes behind the questions</small></span>
          <span />
        </Link>
        {LEVELS.map((level) => {
          const count = mod.questions.filter((item) => item.lv === level.id).length;
          const slug = level.name.toLowerCase();
          return (
            <Link className="mod" href={`/m/${mod.id}/quiz/${slug}`} key={level.id}>
              <span className="idx">{level.name.slice(0, 1)}</span>
              <span><b>{level.name}</b><small>{count} questions</small></span>
              <span className="count meta">{count}</span>
            </Link>
          );
        })}
        <Link className="mod" href={`/m/${mod.id}/quiz`}>
          <span className="idx">All</span>
          <span>
            <b>Every question</b>
            <small>{mod.questions.filter((item) => store.right[questionKey(mod.id, item.q)]).length} already correct on this device</small>
          </span>
          <span className="count meta">{mod.questions.length}</span>
        </Link>
      </div>
    </>
  );
}

function Study({ mod }: { mod: Module }) {
  const manuals = sourceLinks(mod.id);
  return (
    <>
      <p className="meta"><Link href={`/m/${mod.id}`}>Back to {mod.name}</Link></p>
      <h1>{mod.name}</h1>
      <p className="lead">{mod.summary}</p>
      {manuals.length > 0 ? (
        <div className="mods" style={{ marginBottom: 8 }}>
          {manuals.map((doc) => (
            <Link className="mod" href={`/read/${doc.id}`} key={doc.id}>
              <span className="idx">{doc.kind === "PDF" ? "PDF" : "Doc"}</span>
              <span><b>{doc.title}</b><small>Full text from the uploaded file</small></span>
              <span className="count meta">Read</span>
            </Link>
          ))}
        </div>
      ) : null}
      <div className="flows">
        {mod.flows.map((flow) => (
          <section className="flow" key={flow.title}>
            <h2>{flow.title}</h2>
            <ol>
              {flow.steps.map((step) => (
                <li key={step.t}><strong>{step.t}</strong><span>{step.d}</span></li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      {mod.specs?.map((spec) => (
        <section key={spec.title}>
          <h2>{spec.title}</h2>
          <div className="sheet tablewrap">
            <table>
              <thead>
                <tr>{spec.columns.map((col) => <th key={col}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {spec.rows.map((row) => (
                  <tr key={row.join("|")}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <h2>Notes</h2>
      <div className="sheet">
        <ul className="notes">
          {mod.notes.map((note) => (
            <li key={note.text}>
              <span className={`tag lv${note.lv}`}>{LEVEL_WORD[note.lv]}</span>
              {note.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="row">
        <Link className="btn" href={`/m/${mod.id}/quiz`}>Start the quiz</Link>
      </div>
    </>
  );
}

function QuizScreen({
  title,
  source,
  build,
  back,
  progress,
  timerSec = null,
}: {
  title: string;
  source: string;
  build: () => Card[];
  back: string;
  progress: ReturnType<typeof useProgress>;
  timerSec?: number | null;
}) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<Card[]>([]);
  const [left, setLeft] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const saved = useRef(false);

  useEffect(() => {
    if (!progress.ready) return;
    setCards(build());
    setIndex(0);
    setPicked(null);
    setScore(0);
    setMissed([]);
    setTimedOut(false);
    setLeft(timerSec && timerSec > 0 ? timerSec : null);
    saved.current = false;
  }, [source, progress.ready]);

  const card = cards?.[index];
  const done = cards != null && index >= cards.length;

  useEffect(() => {
    if (!done || !cards?.length || saved.current) return;
    saved.current = true;
    progress.saveAttempt({ title, score, total: cards.length });
  }, [done, cards, score, title, progress]);

  useEffect(() => {
    if (left == null || done) return;
    const id = window.setTimeout(() => {
      setLeft((n) => {
        if (n == null) return n;
        if (n <= 1) {
          setTimedOut(true);
          setIndex(cards?.length ?? 0);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearTimeout(id);
  }, [left, done, cards]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (!card || done) return;
      if (picked == null && ["1", "2", "3", "4"].includes(event.key)) {
        const n = Number(event.key) - 1;
        if (card.options[n]) choose(n);
      }
      if (picked != null && event.key === "Enter") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function choose(n: number) {
    if (!card || picked != null) return;
    const correct = card.options[n] === card.answer;
    setPicked(n);
    progress.record(card.key, correct);
    if (correct) setScore((s) => s + 1);
    else setMissed((list) => [...list, card]);
  }

  function next() {
    setIndex((n) => n + 1);
    setPicked(null);
  }

  function retryMissed() {
    const again = missed.map((item) => ({ ...item, options: shuffleOptions(item) }));
    saved.current = false;
    setTimedOut(false);
    setCards(again);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setMissed([]);
  }

  if (!cards) return <p className="lead">Preparing the set.</p>;
  if (cards.length === 0) {
    return (
      <>
        <h1>{title}</h1>
        <p className="lead">Nothing is waiting in this set.</p>
        <Link className="btn" href={back}>Back</Link>
      </>
    );
  }
  if (index >= cards.length) {
    const pct = Math.round((score / cards.length) * 100);
    const word = timedOut
      ? "Time is up."
      : pct >= 80 ? "That set is solid." : pct >= 60 ? "Close. The misses are worth another pass." : "Read the reference, then run the misses again.";
    return (
      <div className="sheet">
        <p className="score">{pct}%</p>
        <p>{score} of {cards.length} correct. {word}</p>
        <div className="row">
          {missed.length > 0 ? <button className="btn" type="button" onClick={retryMissed}>Retry {missed.length} missed</button> : null}
          <button className="btn ghost" type="button" onClick={() => { saved.current = false; setTimedOut(false); setCards(build()); setIndex(0); setScore(0); setMissed([]); setPicked(null); setLeft(timerSec && timerSec > 0 ? timerSec : null); }}>Shuffle again</button>
          <Link className="btn ghost" href={back}>Back</Link>
        </div>
      </div>
    );
  }

  const current = cards[index];
  const correct = picked != null && current.options[picked] === current.answer;
  return (
    <>
      <div className="barline">
        <span>{current.moduleName}</span>
        <span>{index + 1} / {cards.length}{left != null ? ` · ${clock(left)}` : ""}</span>
      </div>
      <div className="bar" role="progressbar" aria-valuenow={index} aria-valuemin={0} aria-valuemax={cards.length} aria-label="Questions completed">
        <i style={{ width: `${(index / cards.length) * 100}%` }} />
      </div>
      <h1 className="q">{current.prompt}</h1>
      <div role="group" aria-label="Answers">
        {current.options.map((option, n) => {
          const isAnswer = option === current.answer;
          const cls = picked == null ? "opt" : isAnswer ? "opt ok" : n === picked ? "opt no" : "opt";
          return (
            <button key={option} className={cls} type="button" disabled={picked != null} onClick={() => choose(n)}>
              <span className="k">{n + 1}</span>
              <span>{option}{picked != null && isAnswer ? " · correct" : ""}{picked === n && !isAnswer ? " · your choice" : ""}</span>
            </button>
          );
        })}
      </div>
      {picked != null ? (
        <div className="explain">
          <b>{correct ? "Correct" : `Answer: ${current.answer}`}</b>
          {current.explain}
          <div className="row">
            <button className="btn" type="button" onClick={next}>{index + 1 < cards.length ? "Next" : "See result"}</button>
          </div>
        </div>
      ) : null}
      <p className="meta">Keys 1 to 4 answer. Enter moves on.</p>
    </>
  );
}

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function shuffleOptions(card: Card): string[] {
  const options = card.options.slice();
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

function Search() {
  const [query, setQuery] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
  }, []);
  const hits = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    const rows: { mod: Module; prompt: string; answer: string; explain: string }[] = [];
    for (const mod of MODULES) {
      for (const item of mod.questions) {
        const hay = `${item.q} ${item.a} ${item.e}`.toLowerCase();
        if (hay.includes(needle)) rows.push({ mod, prompt: item.q, answer: item.a, explain: item.e });
      }
    }
    return rows.slice(0, 40);
  }, [query]);

  return (
    <>
      <h1>Search</h1>
      <form className="searchbox" action="/search" role="search" style={{ maxWidth: "none", marginBottom: 12 }}>
        <input name="q" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search questions" placeholder="Try crema, 74, or OEPE" />
      </form>
      {query.trim().length < 2 ? <p className="lead">Type at least two letters.</p> : null}
      {query.trim().length >= 2 && hits.length === 0 ? <p className="lead">No question uses those words.</p> : null}
      {hits.map((hit) => (
        <details className="hit" key={hit.mod.id + hit.prompt}>
          <summary><small>{hit.mod.name}</small><br />{hit.prompt}</summary>
          <p><b>{hit.answer}</b><br />{hit.explain}</p>
          <Link href={`/m/${hit.mod.id}/quiz`}>Quiz this module</Link>
        </details>
      ))}
    </>
  );
}

function Missing() {
  return (
    <>
      <h1>That page is not in the bank.</h1>
      <Link className="btn" href="/">Back to modules</Link>
    </>
  );
}
