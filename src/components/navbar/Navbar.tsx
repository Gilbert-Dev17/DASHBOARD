'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Home, CheckSquare, PiggyBank, Sun, Moon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getActiveQuickAdds } from './quick-add-registry'

const Navbar = () => {
  const pathname = usePathname();
  const activeQuickAdds = getActiveQuickAdds(pathname);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems = [
    {icon: Home, label: 'Home', point: '/home'},
    {icon: CheckSquare, label: 'Schedule', point: '/schedule'},
    {icon: PiggyBank, label: 'Finance', point: '/finance'},
  ]

  return (
    <header className="hidden lg:flex sticky top-0 z-40 w-full justify-end pt-4 pr-8 pointer-events-none">
      <nav className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/50 backdrop-blur-xl shadow-md border border-border pointer-events-auto transition-all duration-500">

        {navItems.map((item) => {
          const active = pathname.startsWith(item.point);
          const Icon = item.icon;

          return (
            <Button
              key={item.point}
              variant={active ? "secondary" : "ghost"}
              className={`rounded-md transition-all duration-300 ${active ? 'px-4' : 'px-3'}`}
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

        <Suspense fallback={<div className="w-9 h-9" />}>
          {activeQuickAdds.map(({ id, Component }) => (
            <Component key={id} />
          ))}
        </Suspense>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md w-9 h-9 transition-all duration-300"
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

        <Separator orientation="vertical" className="bg-muted-foreground/30" />

        {/* Profile Avatar */}
        <Link href="/profile" className="outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md">
          <button className={`flex items-center gap-2 pl-3 rounded-md border transition-all duration-300
          ${ pathname === '/profile'
                ? 'border-border opacity-100 bg-secondary'
                : 'border-transparent opacity-80 scale-95 hover:bg-secondary/50 hover:opacity-100'}
            `}>
            <Label className="text-sm font-medium cursor-pointer">
              Gilbert
            </Label>

            <Avatar className="h-8 w-8">
              <AvatarImage alt="Profile" className="object-cover rounded-none" />
              <AvatarFallback className="text-xs">PR</AvatarFallback>
            </Avatar>
          </button>
        </Link>
      </nav>
    </header>
  )
}

export default Navbar