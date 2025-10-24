'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  Layers,
  PenSquare,
  Sparkles,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const menuItems = [
  {
    href: '/editor',
    label: 'محرر النصوص',
    icon: PenSquare,
  },
  {
    href: '/analysis/initial',
    label: 'تحليل درامي',
    icon: Sparkles,
  },
  {
    href: '/analysis/deep',
    label: 'تحليل معمق',
    icon: Layers,
  },
  {
    href: '/brainstorm',
    label: 'عصف ذهني',
    icon: BrainCircuit,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
