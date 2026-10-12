import { Fragment, type ReactNode } from "react";

const STOP = new Set("the a an and or but of to in on for with is are was were be been it its this that these those as at by from into about your you i we they he she them our their what which who how when where why do does did can could will would should may might there here than then so if not no yes any all".split(" "));

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, " ")
    .replace(/\.(?!\d)/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

/**
 * Picks the sentence in a source passage that best supports the answer/question,
 * so the UI can mark it with the lime highlighter.
 */
export function supportingSentence(passage: string, reference: string) {
  const ref = new Set(words(reference));
  // Split after . ! ? only when followed by whitespace, so "1.25" stays one token.
  const sentences = passage.split(/(?<=[.!?]["”’)]*\s)/).filter(Boolean);
  if (sentences.length === 0) sentences.push(passage);
  let best = 0;
  let bestScore = -1;
  sentences.forEach((s, i) => {
    const score = words(s).filter((w) => ref.has(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  const pre = sentences.slice(0, best).join("");
  const hit = sentences[best] ?? "";
  const post = sentences.slice(best + 1).join("");
  return { pre, hit, post, matched: bestScore > 0 };
}

export const clipStart = (s: string, n: number) => (s.length > n ? "…" + s.slice(s.length - n).replace(/^\S*\s/, "") : s);
export const clipEnd = (s: string, n: number) => (s.length > n ? s.slice(0, n).replace(/\s\S*$/, "") + "…" : s);

/** Inline markdown: **bold**, `code`, and [n] citations rendered as chips. */
function inline(text: string, onCite?: (n: number) => void): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[(\d{1,2})\])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={k++} className="font-mono text-[0.9em] text-body">{tok.slice(1, -1)}</code>);
    else {
      const n = Number(m[2]);
      out.push(
        <button key={k++} type="button" className="cite cursor-pointer border-0" aria-label={`Show source ${n}`} onClick={() => onCite?.(n)}>
          {n}
        </button>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Minimal markdown renderer for Gemini's answers (paragraphs, bullet and numbered lists). */
export function RichAnswer({ text, onCite }: { text: string; onCite?: (n: number) => void }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (isList) {
          const ordered = /^\s*\d/.test(lines[0]);
          const Tag = ordered ? "ol" : "ul";
          return (
            <Tag key={bi} className={`my-2 flex flex-col gap-1.5 pl-6 ${ordered ? "list-decimal" : "list-disc"}`}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""), onCite)}</li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={bi} className="m-0 mb-3 last:mb-0">
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, onCite)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
