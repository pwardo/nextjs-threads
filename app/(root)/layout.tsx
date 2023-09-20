import '../globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

import Topbar from '@/components/shared/Topbar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import RightSidebar from '@/components/shared/RightSidebar';
import Bottombar from '@/components/shared/Bottombar';

export const metadata = {
  title: 'NextJS Threads',
  description: 'Threads App built with NextJS 13.4, Tailwind CSS and MongoDB',
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Topbar />
            <main className='flex flex-row'>
              <LeftSidebar />
                <section className='main-container'>
                  <div className='w-full max-w-4xl'>
                    {children}                  
                  </div>
                </section>
              <RightSidebar />
            </main>
          <Bottombar />
        </body>
      </html>
    </ClerkProvider>
  )
}
