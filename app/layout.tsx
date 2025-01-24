import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brick Breaker by Radoslav Popov",
  description: "A simple brick breaker game made with TypeScript and Canvas API.",
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
