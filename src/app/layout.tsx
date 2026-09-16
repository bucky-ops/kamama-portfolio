import type { Metadata } from "next";
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

export const metadata: Metadata = {
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
  openGraph: {
    title: "Collins Kamama — Production-Grade Systems",
    description:
      "I build production-grade systems that operate, not just demo. Blockchain, AI/RAG and data platforms for UN, NGO, government and enterprise.",
    siteName: "Kamama Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collins Kamama — Production-Grade Systems",
    description:
      "Solution Architect · Full Stack Developer · Data Scientist — Nairobi (UTC+3), remote ICA contracts globally.",
  },
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
