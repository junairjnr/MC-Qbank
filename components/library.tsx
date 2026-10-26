"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent, type RefObject } from "react";
import { MODULES } from "@/lib/data";
import { SOURCES, getSource, parseReading, type ReadingPage, type SourceDoc } from "@/lib/sources";

const SPINES = [
  { ink: "#6f4e37", tall: 248 },
  { ink: "#6f4e37", tall: 268 },
  { ink: "#6f4e37", tall: 236 },
  { ink: "#6f4e37", tall: 258 },
  { ink: "#6f4e37", tall: 244 },
  { ink: "#6f4e37", tall: 272 },
  { ink: "#6f4e37", tall: 230 },
  { ink: "#6f4e37", tall: 254 },
];

export function Library() {
  const [note, setNote] = useState("Open a manual. Diagrams stay in the original file.");
  return (
    <>
      <h1>Read the manuals</h1>
      <p className="lead">Eight files on the shelf. Open one and turn the page.</p>
      <div className="shelf" role="list">
        {SOURCES.map((doc, index) => {
          const spine = SPINES[index % SPINES.length];
          return (
            <Link
              role="listitem"
              className="spine"
              href={`/read/${doc.id}`}
              key={doc.id}
              style={{
                color: spine.ink,
                height: spine.tall,
              }}
              onMouseEnter={() => setNote(doc.blurb)}
              onFocus={() => setNote(doc.blurb)}
            >
              <span className="spine-title">{doc.title}</span>
              <span className="spine-kind">{doc.kind}</span>
            </Link>
          );
        })}
      </div>
      <p className="shelf-note">{note}</p>
    </>
  );
}

type Leaf = { source: string; text: string };

export function Reader({ id }: { id: string }) {
  const doc = getSource(id);
  const [pages, setPages] = useState<ReadingPage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!doc) return;
    let cancel = false;
    setPages(null);
    setFailed(false);
    fetch(`/reading/${doc.text}`)
      .then((res) => {
        if (!res.ok) throw new Error("missing");
        return res.text();
      })
      .then((raw) => {
        if (!cancel) setPages(parseReading(raw));
      })
      .catch(() => {
        if (!cancel) setFailed(true);
      });
    return () => {
      cancel = true;
    };
  }, [doc]);

  useEffect(() => {
    const node = bodyRef.current;
    if (!node) return;
    const measure = () => {
      const next = { w: node.clientWidth, h: node.clientHeight };
      setBox((prev) => (Math.abs(prev.w - next.w) < 8 && Math.abs(prev.h - next.h) < 8 ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [doc]);

  const [leaves, setLeaves] = useState<Leaf[] | null>(null);

  useEffect(() => {
    if (!pages || box.w < 40 || box.h < 40) {
      if (!pages) setLeaves(null);
      return;
    }
    let cancel = false;
    const build = () => {
      if (!cancel) setLeaves(paginate(pages, box));
    };
    build();
    document.fonts?.ready.then(build);
    return () => {
      cancel = true;
    };
  }, [pages, box]);

  if (!doc) {
    return (
      <>
        <h1>That manual is not in the project.</h1>
        <Link className="btn" href="/read">All manuals</Link>
      </>
    );
  }

  const related = MODULES.filter((mod) => doc.modules.includes(mod.id));
  const status = failed ? "The text copy did not load." : !pages ? "Opening the manual." : !leaves ? "Setting the pages." : "";

    return (
    <div className="reader">
      <h1>{doc.title}</h1>
      <p className="lead">{doc.blurb}</p>
      <p className="quiet-links">
        <a href={`/sources/${doc.file}`} target="_blank" rel="noreferrer">Original {doc.kind}</a>
        {related.map((mod) => (
          <Link href={`/m/${mod.id}/study`} key={mod.id}>{mod.name}</Link>
        ))}
      </p>
      <Book
        title={doc.title}
        leaves={leaves}
        status={status}
        failed={failed}
        original={`/sources/${doc.file}`}
        kind={doc.kind}
        query={query}
        onQuery={setQuery}
        bodyRef={bodyRef}
      />
    </div>
  );
}

function Book({
  title,
  leaves,
  status,
  failed,
  original,
  kind,
  query,
  onQuery,
  bodyRef,
}: {
  title: string;
  leaves: Leaf[] | null;
  status: string;
  failed: boolean;
  original: string;
  kind: string;
  query: string;
  onQuery: (value: string) => void;
  bodyRef: RefObject<HTMLDivElement | null>;
}) {
  const [index, setIndex] = useState(0);
  const [peek, setPeek] = useState<-1 | 0 | 1>(0);
  const topRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; dx: number; id: number } | null>(null);
  const busy = useRef(false);
  const anchor = useRef("");
  const queryMark = useRef("");

  const count = leaves?.length ?? 0;
  const safeIndex = count ? Math.min(index, count - 1) : 0;
  const needle = query.trim();
  const hits = useMemo(() => {
    if (!leaves || needle.length < 2) return [];
    const q = needle.toLowerCase();
    return leaves.reduce<number[]>((list, leaf, i) => {
      if (leaf.text.toLowerCase().includes(q)) list.push(i);
      return list;
    }, []);
  }, [leaves, needle]);

  useEffect(() => {
    if (!leaves?.length) return;
    const snippet = anchor.current;
    if (!snippet) return;
    const found = leaves.findIndex((leaf) => leaf.text.includes(snippet));
    if (found >= 0) setIndex(found);
  }, [leaves]);

  useEffect(() => {
    if (needle.length < 2 || needle === queryMark.current) return;
    queryMark.current = needle;
    if (hits.length) setIndex(hits[0]);
  }, [needle, hits]);

  useEffect(() => {
    anchor.current = "";
    queryMark.current = "";
    setIndex(0);
    setPeek(0);
    resetSheet();
  }, [title]);

  useEffect(() => {
    anchor.current = leaves?.[safeIndex]?.text.slice(0, 48) ?? "";
  }, [leaves, safeIndex]);

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function resetSheet() {
    const el = topRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = "rotateY(0deg) translateX(0)";
  }

  function jump(next: number) {
    if (!count) return;
    const clamped = Math.max(0, Math.min(count - 1, next));
    resetSheet();
    setPeek(0);
    setIndex(clamped);
  }

  function go(dir: -1 | 1) {
    if (!leaves || busy.current) return;
    const next = safeIndex + dir;
    if (next < 0 || next >= leaves.length) return;
    const el = topRef.current;
    if (!el || reduced()) {
      jump(next);
      return;
    }
    busy.current = true;
    setPeek(dir);
    const width = el.clientWidth || 320;
    const to = dir === 1
      ? `translateX(${-width * 0.92}px) rotateY(-46deg)`
      : `translateX(${width * 0.92}px) rotateY(28deg)`;
    el.style.transformOrigin = dir === 1 ? "left center" : "right center";
    el.style.transition = "transform 460ms cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = to;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      el.removeEventListener("transitionend", finish);
      setIndex(next);
      resetSheet();
      setPeek(0);
      busy.current = false;
    };
    el.addEventListener("transitionend", finish);
    window.setTimeout(finish, 520);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (busy.current) return;
    if ((event.target as HTMLElement).closest("a, button, input")) return;
    drag.current = { x: event.clientX, dx: 0, id: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    const el = topRef.current;
    if (!current || current.id !== event.pointerId || !el || busy.current) return;
    let dx = event.clientX - current.x;
    const dir: -1 | 1 = dx < 0 ? 1 : -1;
    const blocked = (dir === 1 && safeIndex >= count - 1) || (dir === -1 && safeIndex <= 0);
    if (blocked) dx *= 0.22;
    current.dx = dx;
    if (Math.abs(dx) < 8) return;
    if (!blocked && peek !== dir) setPeek(dir);
    const width = el.clientWidth || 1;
    el.style.transition = "none";
    el.style.transformOrigin = dx < 0 ? "left center" : "right center";
    el.style.transform = `translateX(${dx * 0.34}px) rotateY(${(dx / width) * 28}deg)`;
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    drag.current = null;
    if (!current || current.id !== event.pointerId) return;
    const dx = current.dx;
    const dir: -1 | 1 = dx < 0 ? 1 : -1;
    const next = safeIndex + dir;
    if (Math.abs(dx) > 72 && next >= 0 && next < count) go(dir);
    else {
      const el = topRef.current;
      if (el) {
        el.style.transition = "transform 280ms cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = "rotateY(0deg) translateX(0)";
      }
      setPeek(0);
    }
  }

  const leaf = leaves?.[safeIndex];
  const under = leaves?.[safeIndex + (peek === -1 ? -1 : 1)];
  const multi = leaves ? new Set(leaves.map((item) => item.source)).size > 1 : false;
  const hitAt = hits.indexOf(safeIndex);

  return (
    <div className="read-stage">
      <div className="bookbar">
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="find">
            <span>Find</span>
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              aria-label={`Find in ${title}`}
              placeholder="Words in this manual"
            />
          </label>
        </form>
        {needle.length >= 2 ? (
          <span className="hitcount">
            {hits.length ? `${hitAt >= 0 ? hitAt + 1 : 0} of ${hits.length}` : "No match"}
          </span>
        ) : null}
        {hits.length > 1 ? (
          <span className="hitnav">
            <button type="button" onClick={() => jump(hits[(hitAt - 1 + hits.length) % hits.length])}>Previous match</button>
            <button type="button" onClick={() => jump(hits[(hitAt + 1) % hits.length])}>Next match</button>
          </span>
        ) : null}
      </div>
      <div className="book-row">
        <button className="turn" type="button" onClick={() => go(-1)} disabled={!leaves || safeIndex <= 0} aria-label="Previous page">
          <Chevron dir="left" />
        </button>
        <div
          className="book-frame"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="leaf under" aria-hidden>
            {under ? <LeafText text={under.text} query={needle} /> : null}
          </div>
          <div className="leaf top" ref={topRef}>
            <div className="leaf-body" ref={bodyRef}>
              {leaf ? <LeafText text={leaf.text} query={needle} /> : (
                <p className="leaf-wait">
                  {status}
                  {failed ? <> <a href={original}>Open the original {kind}.</a></> : null}
                </p>
              )}
            </div>
            <footer className="leaf-foot">
              <span>{leaf && multi ? `File page ${leaf.source}` : title}</span>
              <span>{count ? safeIndex + 1 : "–"}</span>
            </footer>
          </div>
        </div>
        <button className="turn" type="button" onClick={() => go(1)} disabled={!leaves || safeIndex >= count - 1} aria-label="Next page">
          <Chevron dir="right" />
        </button>
      </div>
      {count > 1 ? (
        <label className="scrub">
          <span className="sr">Page</span>
          <input
            type="range"
            min={0}
            max={count - 1}
            value={safeIndex}
            onChange={(event) => jump(Number(event.target.value))}
            aria-valuetext={`Page ${safeIndex + 1} of ${count}`}
          />
          <span>{safeIndex + 1} / {count}</span>
        </label>
      ) : null}
      <p className="sr" aria-live="polite">{count ? `Page ${safeIndex + 1} of ${count}` : status}</p>
    </div>
  );
}

function LeafText({ text, query }: { text: string; query: string }) {
  if (query.length < 2) return <p className="leaf-copy">{text}</p>;
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  const bits = text.split(pattern);
  return (
    <p className="leaf-copy">
      {bits.map((bit, i) => (bit.toLowerCase() === query.toLowerCase() ? <mark key={i}>{bit}</mark> : <span key={i}>{bit}</span>))}
    </p>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d={dir === "left" ? "M11.5 3.5 6 9l5.5 5.5" : "M6.5 3.5 12 9l-5.5 5.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function paginate(pages: ReadingPage[], box: { w: number; h: number }): Leaf[] {
  const probe = document.createElement("div");
  probe.className = "leaf-copy leaf-measure";
  probe.style.width = `${box.w}px`;
  probe.style.height = `${box.h}px`;
  document.body.appendChild(probe);
  const leaves: Leaf[] = [];
  try {
    for (const page of pages) {
      for (const text of sliceToFit(probe, page.body)) leaves.push({ source: page.n, text });
    }
  } finally {
    probe.remove();
  }
  return leaves.length ? leaves : [{ source: pages[0]?.n ?? "1", text: "" }];
}

function sliceToFit(el: HTMLElement, raw: string): string[] {
  let rest = raw.replace(/\r/g, "").trim();
  const out: string[] = [];
  let guard = 0;
  while (rest && guard < 500) {
    guard += 1;
    el.textContent = rest;
    if (el.scrollHeight <= el.clientHeight + 1) {
      out.push(rest);
      break;
    }
    let lo = 1;
    let hi = rest.length;
    let best = 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      el.textContent = rest.slice(0, mid);
      if (el.scrollHeight <= el.clientHeight + 1) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    let cut = best;
    if (cut < rest.length) {
      const approx = Math.max(24, Math.floor(el.clientWidth / 7));
      const start = Math.max(0, cut - approx);
      const slice = rest.slice(start, cut);
      const rel = Math.max(slice.lastIndexOf("\n"), slice.lastIndexOf(" "));
      if (rel >= 0) cut = start + rel + 1;
    }
    if (cut <= 0) cut = Math.max(best, 1);
    const piece = rest.slice(0, cut).trimEnd();
    if (piece) out.push(piece);
    const next = rest.slice(cut).trimStart();
    if (next === rest) break;
    rest = next;
  }
  return out;
}

export function sourceLinks(moduleId: string): SourceDoc[] {
  return SOURCES.filter((doc) => doc.modules.includes(moduleId));
}
