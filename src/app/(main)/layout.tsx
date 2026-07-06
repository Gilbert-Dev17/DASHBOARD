import { ReactNode } from 'react'

import Navbar from '@/components/navbar/Navbar'

export default function MainLayout({
    children
}: Readonly<{
    children: ReactNode
}>){
    return (
        <body className="min-h-full flex flex-col">
            <Navbar />
            {children}
        </body>
    )
}