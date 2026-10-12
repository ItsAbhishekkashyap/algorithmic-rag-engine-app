import { ImageResponse } from "next/og";
import { SITE } from "@/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const { aubergine, lime } = SITE.colors;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: aubergine }}>
        <div style={{ width: 96, height: 96, borderRadius: 24, background: lime, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 60, height: 18, borderRadius: 9, background: aubergine }} />
        </div>
      </div>
    ),
    size,
  );
}
