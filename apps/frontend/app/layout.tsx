import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { NavigationProgress } from "@/components/navigation-progress";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

/** The one face — headings, body, UI chrome. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Not a second voice — only literals wear it: repo paths, CLI flags, tool
 * calls, scores. Everything that reads as language stays Inter.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.FRONTEND_URL ||
  "https://nmemo.cloud"
).replace(/\/$/, "");

const title = "nmemo · Project Continuity Layer for AI Coding";
const description =
  "nmemo remembers the context around your codebase — decisions, failed attempts, unfinished tasks, conventions — and hands any coding agent a verified resume packet with receipts.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · nmemo",
  },
  description,
  applicationName: "nmemo",
  keywords: [
    "project continuity layer",
    "agent memory",
    "coding agent",
    "memory with receipts",
    "resume packet",
    "context engine",
    "AI agents",
  ],
  authors: [{ name: "Nikhil Rajpurohit", url: "https://nikhilwho.in" }],
  creator: "Nikhil Rajpurohit",
  publisher: "nmemo",
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "nmemo",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@nikhilwho",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "nmemo",
  applicationCategory: "DeveloperApplication",
  description,
  url: siteUrl,
  logo: `${siteUrl}/icon`,
  image: `${siteUrl}/opengraph-image`,
  author: {
    "@type": "Person",
    name: "Nikhil Rajpurohit",
    url: "https://nikhilwho.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // One theme, dark — no pre-paint theme script, nothing to flash.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased bg-background text-foreground`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <SmoothScroll>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <NavigationProgress />
          <SiteHeader />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
