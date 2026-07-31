  /**
   * Send branded “you're off the waitlist” emails.
   *
   * Usage:
   *   npm run waitlist:send -w api -- --dry-run
   *   npm run waitlist:send -w api -- --csv ./waitlist.csv
   *   npm run waitlist:send -w api -- --to you@example.com --name Nikhil
   *
   * CSV columns: email,name (name optional). Header row optional.
   */
  import { config as loadEnv } from "dotenv";
  import { readFileSync } from "fs";
  import { resolve } from "path";
  import nodemailer from "nodemailer";

  // Prefer monorepo root .env, then apps/api/.env
  loadEnv({ path: resolve(process.cwd(), "../../.env") });
  loadEnv({ path: resolve(process.cwd(), ".env") });

  import {
    NMEMO_LOGO_DATA_URI,
    waitlistReadyHtml,
    waitlistReadyText,
  } from "./templates/waitlist-ready.js";

  type Recipient = { email: string; name?: string };

  function arg(flag: string): string | undefined {
    const i = process.argv.indexOf(flag);
    if (i === -1) return undefined;
    return process.argv[i + 1];
  }

  function hasFlag(flag: string) {
    return process.argv.includes(flag);
  }

  function parseCsv(raw: string): Recipient[] {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    if (!lines.length) return [];

    const out: Recipient[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const [a, b] = cols;
      if (!a) continue;
      if (i === 0 && /email/i.test(a)) continue;
      if (!a.includes("@")) continue;
      const row: Recipient = { email: a.toLowerCase() };
      if (b) row.name = b;
      out.push(row);
    }
    return out;
  }

  function loadRecipients(): Recipient[] {
    const to = arg("--to");
    if (to) {
      const name = arg("--name");
      return name ? [{ email: to, name }] : [{ email: to }];
    }

    const csvPath = resolve(
      process.cwd(),
      arg("--csv") || process.env.WAITLIST_CSV || "waitlist.csv",
    );
    try {
      return parseCsv(readFileSync(csvPath, "utf8"));
    } catch {
      throw new Error(
        `No recipients. Pass --to email or --csv path (tried ${csvPath}).`,
      );
    }
  }

  function requireEnv(name: string) {
    const v = process.env[name]?.trim();
    if (!v) throw new Error(`Missing env ${name}`);
    return v;
  }

  /** Gmail app passwords are 16 chars; strip spaces/quotes from .env. */
  function smtpPass() {
    const raw = requireEnv("SMTP_PASS").replace(/^["']|["']$/g, "");
    return raw.replace(/\s+/g, "");
  }

  async function main() {
    const dryRun = hasFlag("--dry-run");
    const recipients = loadRecipients();
    if (!recipients.length) throw new Error("Waitlist is empty.");

    const appUrl = (
      process.env.FRONTEND_URL ||
      process.env.APP_URL ||
      "https://nmemo.cloud"
    ).replace(/\/$/, "");
    const signUpUrl =
      process.env.WAITLIST_CTA_URL || `${appUrl}/sign-in`;
    const docsUrl = `${appUrl}/docs/sdk`;
    const creatorName =
      process.env.CREATOR_NAME || "Nikhil Rajpurohit";
    const creatorUrl =
      process.env.CREATOR_URL || "https://nikhilwho.in";

    const from =
      process.env.MAIL_FROM ||
      process.env.SMTP_FROM ||
      `"nmemo" <${process.env.SMTP_USER || "hello@nmemo.app"}>`;

    const preview = hasFlag("--preview");
    const logoCid = "nmemo-logo@nmemo";

    console.log(`Recipients: ${recipients.length}`);
    console.log(`From: ${from}`);
    console.log(`App: ${appUrl}`);
    console.log(`Creator: ${creatorName} · ${creatorUrl}`);
    console.log(
      dryRun ? "Mode: dry-run (no send)" : preview ? "Mode: preview" : "Mode: send",
    );

    const transporter = dryRun || preview
      ? null
      : nodemailer.createTransport({
          host: requireEnv("SMTP_HOST"),
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: requireEnv("SMTP_USER"),
            pass: smtpPass(),
          },
        });

    if (transporter) {
      try {
        await transporter.verify();
        console.log("SMTP ok");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(
          `${msg}\n\nGmail tip: use an App Password (not your normal password).\n` +
            `1) Enable 2-Step Verification on rajpurohitnikhil008@gmail.com\n` +
            `2) https://myaccount.google.com/apppasswords → Mail → create\n` +
            `3) Put the 16-char code in .env as SMTP_PASS=xxxx xxxx xxxx xxxx`,
        );
      }
    }

    let sent = 0;
    for (const r of recipients) {
      const vars = {
        ...(r.name ? { name: r.name } : {}),
        appUrl,
        signUpUrl,
        docsUrl,
        creatorName,
        creatorUrl,
        ...(preview ? {} : { logoSrc: `cid:${logoCid}` }),
      };
      const subject = "You're in! nmemo is finally open";
      const html = waitlistReadyHtml(vars);
      const text = waitlistReadyText(vars);

      if (preview) {
        const out = resolve(process.cwd(), "src/mail/preview-waitlist.html");
        const { writeFileSync } = await import("fs");
        writeFileSync(out, html, "utf8");
        console.log(`preview → ${out}`);
        sent += 1;
        continue;
      }

      if (dryRun) {
        console.log(`[dry-run] ${r.email}${r.name ? ` (${r.name})` : ""}`);
        sent += 1;
        continue;
      }

      await transporter!.sendMail({
        from,
        to: r.email,
        replyTo:
          process.env.MAIL_REPLY_TO ||
          process.env.SMTP_USER ||
          "rajpurohitnikhil008@gmail.com",
        subject,
        html,
        text,
        attachments: [
          {
            filename: "nmemo-logo.png",
            content: NMEMO_LOGO_DATA_URI.replace("data:image/png;base64,", ""),
            encoding: "base64",
            cid: logoCid,
          },
        ],
      });
      sent += 1;
      console.log(`sent → ${r.email}`);
      // gentle pacing for shared SMTP
      await new Promise((res) => setTimeout(res, 200));
    }

    console.log(`Done. ${sent}/${recipients.length}`);
  }

  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
