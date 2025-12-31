import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verbex AI - Next.js Example",
  description: "Voice AI integration with Next.js App Router and React hooks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
