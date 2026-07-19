import { ImageResponse } from "next/og";

export const alt =
  "nmemo · Ranked context from every source — one call, no glue.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card, logo mark + wordmark + tagline. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 90% 110%, rgba(249,115,22,0.22) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 0% 0%, rgba(255,237,213,0.9) 0%, transparent 50%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#000000",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                background: "#FFFFFF",
                borderRadius: 14,
                paddingBottom: 12,
              }}
            >
              <div
                style={{
                  width: 29,
                  height: 6,
                  background: "#000000",
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "#000000",
            }}
          >
            nmemo
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              color: "#0a0a0a",
              maxWidth: 900,
            }}
          >
            Context your agents
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              color: "#a3a3a3",
              maxWidth: 900,
            }}
          >
            actually need.
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 26,
              fontWeight: 500,
              color: "#737373",
              maxWidth: 720,
              lineHeight: 1.35,
            }}
          >
            Ranked context from every source — one call, no glue.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
