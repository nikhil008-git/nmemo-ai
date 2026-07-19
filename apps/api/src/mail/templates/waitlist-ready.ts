export type WaitlistEmailVars = {
  name?: string;
  appUrl: string;
  signUpUrl: string;
  docsUrl: string;
  creatorName?: string;
  creatorUrl?: string;
};

/** Same mark as apps/frontend/components/logo.tsx, black tile, white squircle, capsule bar. */
function nmemoLogoMark(size = 26): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="nmemo" style="display:block;width:${size}px;height:${size}px;">
  <rect width="100" height="100" rx="22" fill="#000000"/>
  <rect x="11" y="11" width="78" height="78" rx="20" fill="#FFFFFF"/>
  <rect x="30" y="64" width="40" height="9" rx="4.5" fill="#000000"/>
</svg>`;
}

/** Minimal HTML email, orange mesh stage from landing CTA. */
export function waitlistReadyHtml(vars: WaitlistEmailVars): string {
  const greeting = vars.name?.trim()
    ? `Hey ${escapeHtml(vars.name.trim())},`
    : "Hey,";
  const signUpUrl = escapeHtml(vars.signUpUrl);
  const siteLabel = escapeHtml(
    vars.signUpUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  );
  const creatorName = escapeHtml(vars.creatorName || "Nikhil Rajpurohit");
  const creatorUrl = escapeHtml(vars.creatorUrl || "https://nikhilwho.in");
  const font =
    "ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

  // Dot mesh as repeating background (email-safe approx of landing grain)
  const meshBg = `
    background-color:#ea580c;
    background-image:
      radial-gradient(ellipse 90% 70% at 12% 20%, rgba(255,190,120,0.95) 0%, transparent 55%),
      radial-gradient(ellipse 70% 55% at 88% 18%, rgba(255,150,80,0.85) 0%, transparent 50%),
      radial-gradient(ellipse 85% 55% at 45% 100%, rgba(249,115,22,0.7) 0%, transparent 55%),
      radial-gradient(circle, rgba(0,0,0,0.22) 0.6px, transparent 0.7px),
      linear-gradient(165deg, #fff7ed 0%, #ffedd5 35%, #fb923c 72%, #ea580c 100%);
    background-size: auto, auto, auto, 6px 6px, auto;
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>nmemo is ready</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;color:#000000;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    You're in nmemo is open.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">

          <tr>
            <td style="padding:0 0 20px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding:0 8px 0 0;line-height:0;">
                    ${nmemoLogoMark(26)}
                  </td>
                  <td style="vertical-align:middle;font-family:${font};font-size:15px;font-weight:600;letter-spacing:-0.02em;color:#000000;">
                    nmemo
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 8px 0;font-family:${font};font-size:26px;font-weight:600;letter-spacing:-0.03em;line-height:1.15;color:#000000;">
              Context your agents
              <br />
              <span style="color:#a3a3a3;">actually need.</span>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 28px 0;font-family:${font};font-size:14px;font-weight:600;line-height:1.5;color:#737373;">
              ${greeting} You're off the waitlist & nmemo is finally open 🥳.
            </td>
          </tr>

          <!-- Mesh stage -->
          <tr>
            <td style="padding:0 0 28px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:4px;overflow:hidden;">
                <tr>
                  <td align="center" style="padding:48px 24px;${meshBg}">
                    <p style="margin:0 0 10px 0;font-family:${font};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#0a0a0a;">
                      / You're in
                    </p>
                    <p style="margin:0 0 22px 0;font-family:${font};font-size:22px;font-weight:600;letter-spacing:-0.03em;line-height:1.2;color:#0a0a0a;">
                      Give every agent<br />the context it needs
                    </p>
                    <a href="${signUpUrl}" style="display:inline-block;background:#ffffff;color:#171717;text-decoration:none;font-family:${font};font-size:14px;font-weight:600;padding:11px 16px;border-radius:4px;box-shadow:0 8px 24px rgba(0,0,0,0.12);">
                      Get started →
                    </a>
                    <p style="margin:14px 0 0 0;font-family:${font};font-size:12px;font-weight:600;color:#0a0a0a;">
                      <a href="${signUpUrl}" style="color:#0a0a0a;text-decoration:underline;">${siteLabel}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0;font-family:${font};font-size:12px;font-weight:600;line-height:1.5;color:#a3a3a3;">
              Creator
              <a href="${creatorUrl}" style="color:#000000;text-decoration:none;">${creatorName}</a>
              ·
              <a href="${creatorUrl}" style="color:#000000;text-decoration:none;">nikhilwho.in</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function waitlistReadyText(vars: WaitlistEmailVars): string {
  const greeting = vars.name?.trim() ? `Hey ${vars.name.trim()},` : "Hey,";
  return `${greeting}

You're off the waitlist, nmemo is open.

Context your agents actually need.

Get started: ${vars.signUpUrl}

Creator ${vars.creatorName || "Nikhil Rajpurohit"} · ${vars.creatorUrl || "https://nikhilwho.in"}
`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
