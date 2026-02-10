'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: '🏠',
      active: pathname === '/',
    },
    {
      href: '/matches',
      label: 'Matches',
      icon: '⚽',
      active: pathname?.startsWith('/matches'),
    },
    {
      href: '/news',
      label: 'News',
      icon: '📰',
      active: pathname === '/news',
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: '👤',
      active: pathname === '/profile',
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex flex-col items-center justify-center flex-1 h-full gap-0.5
              transition-colors
              ${
                item.active
                  ? 'text-accent'
                  : 'text-muted hover:text-accent'
              }
            `}
            aria-current={item.active ? 'page' : undefined}
          >
            <span className="text-2xl" aria-hidden="true">
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
