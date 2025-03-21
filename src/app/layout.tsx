import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Get the correct base path for assets
const basePath = process.env.NODE_ENV === 'production' ? '/snippet-manager' : '';

export const metadata: Metadata = {
  title: "Snippet Manager",
  description: "Save and manage text snippets from the web",
  icons: {
    icon: [
      { url: `${basePath}/file.svg`, type: 'image/svg+xml' },
      { url: `${basePath}/favicon.ico`, sizes: 'any' }
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
