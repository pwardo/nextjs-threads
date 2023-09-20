import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import '../globals.css';

export const metadata = {
  title: 'NextJS Threads',
  description: 'Threads App built with NextJS 13.4, Tailwind CSS and MongoDB',
};

const inter = Inter({ subsets: ['latin']});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
};