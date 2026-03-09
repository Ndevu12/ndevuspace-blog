import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ndevuspace Blog";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "#3b82f6",
                letterSpacing: "-0.02em",
              }}
            >
              ndevuspace
            </span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 400,
                color: "#9ca3af",
              }}
            >
              blog
            </span>
          </div>
          <p
            style={{
              fontSize: 28,
              color: "#9ca3af",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.4,
            }}
          >
            Software Engineering &bull; Web Development &bull; Technology
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
