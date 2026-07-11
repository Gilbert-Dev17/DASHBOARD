import { ReactNode } from 'react'

import Navbar from '@/components/navbar/Navbar'

export default function MainLayout({
    children
}: Readonly<{
    children: ReactNode
}>){
    return (
        <section className="min-h-full flex flex-col" suppressHydrationWarning>
            <Navbar />
            {children}
        </section>
    )
}