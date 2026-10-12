import { ImageResponse } from "next/og";
import { SITE } from "@/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LINES = [92, 86, 95, 60, 88, 94, 72];

/** Bricolage Grotesque Bold for the headline; falls back to the default font if it can't be fetched. */
async function loadDisplayFont() {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700&display=swap")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const { paper, aubergine, lime, lilac } = SITE.colors;
  const display = await loadDisplayFont();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: paper, color: aubergine, padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 2, textTransform: "uppercase" }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: lime, border: `3px solid ${aubergine}` }} />
            {SITE.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 100, fontWeight: 700, lineHeight: 0.98, letterSpacing: -4, fontFamily: display ? "Bricolage" : "sans-serif" }}>
            <span>Ask your</span>
            <span>documents</span>
            <span style={{ display: "flex" }}>
              <span style={{ background: lime, padding: "0 14px", borderRadius: 12 }}>anything.</span>
            </span>
          </div>
          <div style={{ fontSize: 24, color: "#4A3F50" }}>Answers with receipts · built from scratch · no vector DB</div>
        </div>
        <div style={{ display: "flex", position: "relative", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 300, height: 400, background: "#FFFFFF", border: "2px solid #DDD6CC", borderRadius: 18, padding: 30, transform: "rotate(3deg)" }}>
            <div style={{ width: "50%", height: 14, borderRadius: 7, background: aubergine }} />
            {LINES.map((w, i) => (
              <div key={i} style={{ width: `${w}%`, height: 12, borderRadius: 6, background: i === 4 ? lime : "#E6E0D6" }} />
            ))}
          </div>
          <div style={{ display: "flex", position: "absolute", left: -10, top: 70, background: aubergine, color: paper, fontSize: 22, padding: "14px 20px", borderRadius: "20px 20px 20px 4px" }}>
            How many vacation days?
          </div>
          <div style={{ display: "flex", position: "absolute", right: 0, bottom: 70, background: lilac, fontSize: 22, padding: "14px 20px", borderRadius: "20px 20px 4px 20px" }}>
            15 days · page 12
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: display ? [{ name: "Bricolage", data: display, weight: 700, style: "normal" }] : undefined },
  );
}
