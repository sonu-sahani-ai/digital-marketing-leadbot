import type { Metadata } from 'next'

import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({

  subsets: ['latin'],

  display: 'swap'

})

export const metadata: Metadata = {

  title: 'ApexPro Digital Marketing',

  description: 'AI Lead Generation Chatbot & CRM Dashboard'

}

export default function RootLayout({

  children,

}: Readonly<{
  children: React.ReactNode
}>) {

  return (

    <html
      lang='en'
      className='h-full'
    >

      <body
        className={`${inter.className} min-h-full bg-black text-white antialiased`}
      >

        {children}

      </body>

    </html>

  )

}