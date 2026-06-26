'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Wallet, Plus } from 'lucide-react'

// Adjust these import paths based on your shadcn installation
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', point: '/home' },
    { icon: CheckSquare, label: 'Planner', point: '/planner' },
    { icon: Wallet, label: 'Expenses', point: '/expenses' }
  ];

  return (
    // <div className="hidden lg:flex fixed top-6 right-8 z-40 pointer-events-none">
    <header className="hidden lg:flex sticky top-0 z-40 w-full justify-end pt-4 pr-8 ">
      <nav className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/70 backdrop-blur-xl shadow-md border border-border pointer-events-auto transition-all duration-500">
        {/* Navigation Items */}
        {navItems.map((item) => {
          const active = pathname === item.point;
          const Icon = item.icon;

          return (
            <Button
              key={item.point}
              variant={active ? "secondary" : "ghost"}
              className={`rounded-full transition-all duration-300 ${active ? 'px-4' : 'px-3'}`}
              asChild
            >
              <Link href={item.point} className="flex items-center gap-2">
                <div className={`transition-transform duration-300 ${active ? 'scale-100' : 'scale-95'}`}>
                  <Icon size={18} />
                </div>
                {active && (
                  <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            </Button>
          );
        })}

        {/* Divider */}
        <Separator orientation="vertical" className="bg-muted-foreground/30" />

        {/* Quick Add Button */}
        <Button
          // onClick={onQuickAdd}
          size="icon"
          className="w-10 h-10 rounded-full transition-all duration-300 hover:scale-105"
        >
          <Plus size={18} strokeWidth={2.5} />
        </Button>

        {/* Profile Avatar */}
        <button
          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-300 ml-1 hover:opacity-80 ${
            pathname === '/profile'
              ? 'border-primary opacity-100 scale-100'
              : 'border-transparent opacity-80 scale-95'
          }`}
        >
          <Avatar className="w-full h-full grayscale">
            <AvatarImage  alt="Profile" className="object-cover" />
            <AvatarFallback>PR</AvatarFallback>
          </Avatar>
        </button>

      </nav>
    </header>
  )
}

export default Navbar