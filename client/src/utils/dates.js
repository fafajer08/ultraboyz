// Safely parses a date that might come as "2026-10-17" (plain date string,
// what we expect) or "2026-10-17T00:00:00.000Z" (full ISO timestamp, in case
// pg's date parser is ever reconfigured) without producing an Invalid Date.
export function parseEventDate(value) {
  if (!value) return null;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = new Date(isDateOnly ? `${value}T00:00:00` : value);
  return isNaN(d.getTime()) ? null : d;
}
