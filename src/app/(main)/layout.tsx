import { ReactNode } from 'react'

import Navbar from '@/components/navbar/Navbar'

import Sidebar from '@/components/navbar/Sidebar'

export default function MainLayout({
    children
}: Readonly<{
    children: ReactNode
}>){
    return (
        <section className="min-h-full flex flex-col" suppressHydrationWarning>
            {/* <Sidebar /> */}
            <Navbar />
            {children}
        </section>
    )
}