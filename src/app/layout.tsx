import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://kamama-portfolio.vercel.app";
const OG_IMAGE = "/og-banner.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Collins Kamama — Production-Grade Systems | Kamama Portfolio",
  description:
    "Portfolio of Muchiri Collins Kamama — Solution Architect, Full Stack Developer & Data Scientist. Production-grade blockchain, AI and data platforms for the UN system, NGOs, government and enterprise across East Africa.",
  keywords: [
    "Collins Kamama",
    "Kamama Consulting Solutions",
    "Solution Architect",
    "Full Stack Developer",
    "Data Scientist",
    "Blockchain",
    "AI & Analytics",
    "Nairobi",
  ],
  authors: [{ name: "Muchiri Collins Kamama" }],
  alternates: {
    canonical: SITE_URL,
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  openGraph: {
    title: "Collins Kamama — Production-Grade Systems",
    description:
      "I build production-grade systems that operate, not just demo. Blockchain, AI/RAG and data platforms for UN, NGO, government and enterprise.",
    url: SITE_URL,
    siteName: "Kamama Portfolio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 1344,
        height: 768,
        alt: "KAMAMA — Production-grade systems portfolio banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collins Kamama — Production-Grade Systems",
    description:
      "Solution Architect · Full Stack Developer · Data Scientist — Nairobi (UTC+3), remote ICA contracts globally.",
    images: [OG_IMAGE],
    creator: "@blurred_cmk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0D1117",
};

/** Structured data — helps employers/search engines parse the profile correctly. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Muchiri Collins Kamama",
  alternateName: "Collins Kamama",
  jobTitle: "Solution Architect · Full Stack Developer · Data Scientist",
  email: "mailto:muchiri.collin@aol.com",
  telephone: "+254 700 845 084",
  url: SITE_URL,
  sameAs: [
    "https://github.com/bucky-ops",
    "https://www.linkedin.com/in/collins-kamama",
    "https://twitter.com/blurred_cmk",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  knowsAbout: [
    "Enterprise Blockchain",
    "AI & Analytics",
    "RAG / LangChain",
    "PostgreSQL HA",
    "Cloud & DevOps",
    "M&E Dashboards",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          // Static, developer-authored JSON — no user input is interpolated.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
