import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — same mark as components/logo.tsx */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "#FFFFFF",
            borderRadius: 36,
            paddingBottom: 32,
          }}
        >
          <div
            style={{
              width: 72,
              height: 16,
              background: "#000000",
              borderRadius: 8,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
