import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vietnamese Stock Market Analyzer",
  description: "Analyze Vietnamese stocks with technical indicators and patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
