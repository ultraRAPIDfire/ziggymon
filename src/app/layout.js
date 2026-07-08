"use client";
import { SessionProvider } from "next-auth/react";
// Force inject your local design system matrix directly into the Next.js compilation engine
import "./global.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}