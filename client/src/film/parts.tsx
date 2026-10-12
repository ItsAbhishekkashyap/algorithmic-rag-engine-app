"use client";

import { createContext, useContext, type CSSProperties, type MouseEvent, type ReactNode } from "react";

type FilmNav = {
  goTo: (chapter: number) => void;
  openStudio: (e: MouseEvent<HTMLElement>) => void;
};

export const FilmNavContext = createContext<FilmNav>({
  goTo: () => {},
  openStudio: () => {},
});

export const useFilmNav = () => useContext(FilmNavContext);

export type ChapterProps = { p: number };

export function Eyebrow({ children, dark = false, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <span className={`mono flex items-center gap-2 ${dark ? "text-mist" : ""} ${className}`}>
      <span className={`block h-2 w-2 rounded-full bg-lime ${dark ? "" : "border-[1.5px] border-aub"}`} />
      {children}
    </span>
  );
}

export function UnderHood({ children, style, className = "", small = false }: { children: ReactNode; style?: CSSProperties; className?: string; small?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-[14px] border-[1.5px] border-dashed border-lilac ${small ? "px-3 py-2.5" : "px-4 py-3"} ${className}`}
      style={style}
    >
      <span className="mono text-[10px] text-muted">Under the hood</span>
      <span className={`font-mono leading-normal text-body ${small ? "text-[11px]" : "text-xs"}`}>{children}</span>
    </div>
  );
}

/** In-film link to another chapter (smooth-scrolls the film instead of jumping). */
export function ChapterLink({ to, children, className, style }: { to: number; children: ReactNode; className?: string; style?: CSSProperties }) {
  const { goTo } = useFilmNav();
  return (
    <a
      href={`#ch0${to}`}
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        goTo(to);
      }}
    >
      {children}
    </a>
  );
}

/** Link into the Studio with the expanding-disc page transition. */
export function StudioLink({ children, className, style, label }: { children: ReactNode; className?: string; style?: CSSProperties; label?: string }) {
  const { openStudio } = useFilmNav();
  return (
    <a href="/studio" aria-label={label} className={className} style={style} onClick={openStudio}>
      {children}
    </a>
  );
}
