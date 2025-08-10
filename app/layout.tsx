// app/layout.tsx

import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Vivo Portal",
  icons: {
    // the 'icon' entry becomes your favicon
    icon: [
      { url: "/images/vivo.jpg", type: "image/jpeg", sizes: "any" },
      // fallback if you still have a favicon.ico
      { url: "/favicon.ico" },
    ],
    // you can also specify apple touch icon etc here:
    // apple: "/images/vivo-apple-touch.png"
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}