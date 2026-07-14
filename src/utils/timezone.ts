const APP_TIMEZONE = 'Asia/Manila';

export function getTodayInTimezone(timeZone: string = APP_TIMEZONE, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}