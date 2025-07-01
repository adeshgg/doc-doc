import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { TRPCReactProvider } from "@/trpc/react"
import { Toaster } from "sonner"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",

  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <Providers>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  )
}
