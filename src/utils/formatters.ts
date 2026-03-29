import dayjs from 'dayjs';
import 'dayjs/locale/es';

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    if (mins > 0) return `${hours} h ${mins} min`;
    return `${hours} h`;
  }
  if (secs > 0) return `${mins} min ${secs} sec`;
  return `${mins} min`;
}

export function formatDurationShort(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function formatDate(isoString: string, locale: string): string {
  try {
    const lang = locale.split('-')[0].toLowerCase();
    const d = dayjs(isoString);
    if (lang === 'es') {
      return d.locale('es').format('D [de] MMMM [de] YYYY');
    }
    return d.format('MMMM D, YYYY');
  } catch {
    return isoString;
  }
}

export function formatTime(isoString: string): string {
  try {
    return dayjs(isoString).format('HH:mm');
  } catch {
    return '';
  }
}
