import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { NavigationProgress } from "@/components/navigation-progress";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.FRONTEND_URL ||
  "https://nmemo.cloud"
).replace(/\/$/, "");

const title = "nmemo · Context Decision Layer";
const description =
  "The context decision layer for AI agents. Route, rank, and budget what the model sees — from every source, in one call. Works with AI SDK, LangChain, or plain messages.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · nmemo",
  },
  description,
  applicationName: "nmemo",
  keywords: [
    "context decision layer",
    "context engine",
    "context orchestration",
    "AI agents",
    "multi-source context",
    "voice agents",
    "real-time AI",
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
    <html
      lang="en"
      className={`${poppins.variable} ${poppins.className} h-full antialiased bg-background text-foreground`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NavigationProgress />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
