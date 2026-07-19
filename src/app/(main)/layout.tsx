import { ReactNode, Suspense } from 'react'

import Navbar from '@/components/navbar/Navbar'
import Sidebar from '@/components/navbar/Sidebar'

export default function MainLayout({children}: Readonly<{children: ReactNode}>){

    return (
        <section className="min-h-full flex flex-col" suppressHydrationWarning>
            <Suspense fallback={null}>
                <Sidebar />
                {/* <Navbar /> */}
            </Suspense>
            {children}

        </section>
    )
}