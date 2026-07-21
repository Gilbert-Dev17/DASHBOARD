import { ReactNode, Suspense } from 'react'

import Navbar from '@/components/navbar/Navbar'
import Sidebar from '@/components/navbar/Sidebar'
import { getUser } from '@/lib/auth/get-user'

async function SidebarWrapper() {
    const user = await getUser();
    return (
        <>
            <Sidebar user={user} />
            {/* <Navbar user={user} /> */}
        </>
    );
}

export default function MainLayout({children}: Readonly<{children: ReactNode}>){
    return (
        <section className="min-h-full flex flex-col" suppressHydrationWarning>
            <Suspense fallback={null}>
                <SidebarWrapper />
            </Suspense>
            {children}
        </section>
    )
}