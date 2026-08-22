export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

export function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

const dateFormatterFull = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date));
}

export function formatDateFull(date: Date | string): string {
  return dateFormatterFull.format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return timeFormatter.format(new Date(date));
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function relativeTimeFromNow(date: Date | string): string {
  const target = new Date(date).getTime();
  const diffMs = target - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);

  const units: [number, string][] = [
    [60, "segundo"],
    [60, "minuto"],
    [24, "hora"],
    [30, "dia"],
    [12, "mês"],
    [Number.POSITIVE_INFINITY, "ano"],
  ];

  let value = abs;
  let unit = "segundo";
  let acc = 1;
  for (const [amount, name] of units) {
    if (value < amount) {
      unit = name;
      break;
    }
    value = Math.floor(value / amount);
    acc *= amount;
    unit = name;
  }

  const plural = value === 1 ? unit : unit === "mês" ? "meses" : `${unit}s`;
  return diffSec >= 0 ? `em ${value} ${plural}` : `há ${value} ${plural}`;
}

export function countdownParts(target: Date | string) {
  const diffMs = new Date(target).getTime() - Date.now();
  const expired = diffMs <= 0;
  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((abs / (1000 * 60)) % 60);
  return { expired, days, hours, minutes };
}
