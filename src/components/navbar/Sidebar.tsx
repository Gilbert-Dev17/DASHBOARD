'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Wallet } from 'lucide-react'
import { Button } from "@/components/ui/button"

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', point: '/home' },
    { icon: CheckSquare, label: 'Planner', point: '/planner' },
    { icon: Wallet, label: 'Expenses', point: '/expenses' }
  ];

  return (
    <aside className="fixed left-4 md:left-5 top-1/2 -translate-y-1/2 z-40">
      <nav className="flex flex-col items-start gap-2 p-2 rounded-md bg-background/50 backdrop-blur-xl shadow-lg border border-border transition-all duration-300 group">
        {navItems.map((item) => {
          const active = pathname === item.point;
          const Icon = item.icon;

          return (
            <Button
              key={item.point}
              variant={active ? "outline" : "link"}
              className={`rounded-md h-12 flex justify-start items-center p-0 transition-all duration-300 overflow-hidden w-12 group-hover:w-36`}
              asChild
            >
              <Link href={item.point} className={`flex items-center `}>
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <Icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110 text-foreground' : 'scale-95 text-muted-foreground group-hover:text-foreground'}`} />
                </div>
                <div className="flex items-center overflow-hidden transition-all duration-500 w-0 opacity-0 group-hover:w-full group-hover:opacity-100">
                  <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
