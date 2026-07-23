import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_ICONS } from '@/lib/constants/categories';
import { HelpCircle } from 'lucide-react';

interface CategoryBadgeProps {
  name?: string;
  icon?: string;
  color?: string | null;
  className?: string;
}

export function CategoryBadge({ name = 'Uncategorized', icon, color, className = '' }: CategoryBadgeProps) {
  const iconObj = icon ? AVAILABLE_ICONS.find(i => i.name === icon) : null;
  const Icon = iconObj?.icon || HelpCircle;

  return (
    <Badge
      variant="outline"
      className={`gap-2 rounded-full bg-card/50 px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-card/80 justify-start ${className}`}
    >
      <Icon size={14} className="shrink-0" style={{ color: color || 'var(--muted)' }} />
      <span className="text-foreground/90 truncate max-w-[120px]">{name}</span>
    </Badge>
  );
}
