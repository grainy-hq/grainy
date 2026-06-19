import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";
const geistSans = Geist({
variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
title: "Grainy Life",
  description: "Meet new social media...",
}
export default function RootLayout({
  children,
}: Readonly<{
children: React.ReactNode
}>) {
return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#06060a" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
