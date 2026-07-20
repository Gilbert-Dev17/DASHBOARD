/** Converts any CSS color to an rgba() string with the given alpha (0-1). Falls back safely for non-hex input. */
export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const hex = color.length === 4
      ? color.replace('#', '').split('').map(c => c + c).join('')
      : color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // rgb()/named colors: wrap with color-mix as a safe fallback
  return `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`;
}