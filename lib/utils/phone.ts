export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "48" + digits.slice(1);
  if (digits.length === 9) digits = "48" + digits;
  return digits;
}
