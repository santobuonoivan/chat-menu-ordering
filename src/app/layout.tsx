import "./globals.css";
import type { Metadata } from "next";
import { Inter, Comfortaa } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
});

export const metadata: Metadata = {
  title: "Chat con Asistente Appio",
  description: "Asistente digital de Appio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${comfortaa.variable} font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
