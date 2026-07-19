import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Favicon — same mark as components/logo.tsx */
export default function Icon() {
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
          borderRadius: 112,
        }}
      >
        <div
          style={{
            width: 400,
            height: 400,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "#FFFFFF",
            borderRadius: 102,
            paddingBottom: 92,
          }}
        >
          <div
            style={{
              width: 204,
              height: 46,
              background: "#000000",
              borderRadius: 23,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
