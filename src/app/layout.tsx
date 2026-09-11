import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/src/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "CloudOps AI",
  description: "AI-powered DevOps operations assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}