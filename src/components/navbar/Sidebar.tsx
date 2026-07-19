'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Home, CheckSquare, PiggyBank, Sun, Moon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { getActiveQuickAdds } from './quick-add-registry'
import { Separator } from '../ui/separator'
import { Label } from '../ui/label'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Sidebar = () => {
  const pathname = usePathname();
  const activeQuickAdds = getActiveQuickAdds(pathname);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems = [
    { icon: Home, label: 'Home', point: '/home' },
    { icon: CheckSquare, label: 'Schedule', point: '/schedule' },
    { icon: PiggyBank, label: 'Finance', point: '/finance' }
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
                <div className="flex items-center overflow-hidden transition-all duration-300 w-0 opacity-0 group-hover:w-36 group-hover:opacity-100">
                  <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </Link>
            </Button>
          );
        })}

        <Separator orientation="horizontal" className="bg-muted-foreground/30" />

        <Suspense fallback={<div className="w-12 h-12" />}>
          {activeQuickAdds.map(({ id, Component }) => (
              <Component key={id} />
          ))}
        </Suspense>

        {/* Theme Toggle */}
        <Button
          variant={'ghost'}
          className="rounded-md h-12 flex justify-start items-center p-0 transition-all duration-300 overflow-hidden w-12 group-hover:w-36"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label={mounted ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
        >
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            {mounted ? (
              resolvedTheme === 'dark' ? (
                <Sun size={20} className="transition-transform duration-300" />
              ) : (
                <Moon size={20} className="transition-transform duration-300" />
              )
            ) : (
              <Sun size={20} className="opacity-0" />
            )}
          </div>
          <div className="flex items-center overflow-hidden transition-all duration-500 w-0 opacity-0 group-hover:w-full group-hover:opacity-100">
            <span className="text-sm font-medium tracking-wide whitespace-nowrap">
              {mounted ? (resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Theme'}
            </span>
          </div>
        </Button>

        <Separator orientation="horizontal" className="bg-muted-foreground/30" />

        {/* Profile Avatar */}
        <Button
          variant={pathname === '/profile' ? "outline" : "ghost"}
          className="rounded-md h-12 flex justify-start items-center p-0 transition-all duration-300 overflow-hidden w-12 group-hover:w-36"
          asChild
        >
          <Link href="/profile" className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <Avatar className="h-7 w-7">
                <AvatarImage alt="Profile" className="object-cover" />
                <AvatarFallback className="text-[10px]">PR</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex items-center overflow-hidden transition-all duration-300 w-0 opacity-0 group-hover:w-full group-hover:opacity-100">
              <span className="text-sm font-medium tracking-wide whitespace-nowrap">
                Gilbert
              </span>
            </div>
          </Link>
        </Button>

      </nav>
    </aside>
  )
}

export default Sidebar
