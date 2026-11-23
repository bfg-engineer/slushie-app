import type { Metadata, Viewport } from "next";
import { Bungee, Fredoka } from "next/font/google";
import "./globals.css";

const display = Bungee({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Fredoka({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Slush Club",
  description: "Our slushie recipe book. Snap a photo, get the recipe, share it with friends.",
};

export const viewport: Viewport = { themeColor: "#ff3b6b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
