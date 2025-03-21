import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Snippet Manager",
  description: "Save and manage text snippets from the web",
  icons: {
    icon: [
      { url: './file.svg', type: 'image/svg+xml' },
      { url: './favicon.ico', sizes: 'any' }
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
