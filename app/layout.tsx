import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Taskera — Управление задачами и проектами",
  description: "Современная SaaS-платформа для управления задачами, проектами и командами. Kanban, аналитика, AI-помощник."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=document.documentElement.getAttribute('data-theme');if(!t){var s=localStorage.getItem('taskera-theme');t=s==='light'||s==='dark'?s:'dark';document.documentElement.setAttribute('data-theme',t);}})();`
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
