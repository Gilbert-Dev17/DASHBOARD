'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Home, CheckSquare, Wallet, Sun, Moon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getActiveQuickAdds } from './quick-add-registry'



const Navbar = () => {
  const pathname = usePathname();
  const activeQuickAdds = getActiveQuickAdds(pathname);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems = [
    { icon: Home, label: 'Home', point: '/home' },
    { icon: CheckSquare, label: 'Planner', point: '/planner' },
    { icon: Wallet, label: 'Expenses', point: '/expenses' }
  ];

  return (
    <header className="hidden lg:flex sticky top-0 z-40 w-full justify-end pt-4 pr-8 ">
      <nav className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 backdrop-blur-xl shadow-md border border-border pointer-events-auto transition-all duration-500">
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

        <Separator orientation="vertical" className="bg-muted-foreground/30" />

        {/* Quick Add Button */}
        {activeQuickAdds.map(({ id, Component }) => (
          <Component key={id} />
        ))}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-9 h-9 transition-all duration-300"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label={mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
        >
          {mounted ? (
            resolvedTheme === 'dark' ? (
              <Sun size={18} className="transition-transform duration-300" />
            ) : (
              <Moon size={18} className="transition-transform duration-300" />
            )
          ) : (
            <Sun size={18} className="opacity-0" />
          )}
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