import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import "../globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export default function AdminLayout({ children }: { children: React.ReactNode }) {
return (
    <html lang="en" className={inter.variable} data-theme="dark">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
