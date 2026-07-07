"use client";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Force inject Tailwind over CDN to bypass the local bundler resolution bug entirely */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-zinc-950 text-zinc-100">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}