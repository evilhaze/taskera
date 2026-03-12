import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Tasken — Управление задачами и проектами",
  description: "Современная SaaS-платформа для управления задачами, проектами и командами. Kanban, аналитика, AI-помощник."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
