export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export function formatTimeRange(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const end = new Date(2000, 0, 1, h, m + durationMinutes);
  const endStr = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
  return `${startTime} - ${endStr}`;
}

export function todayISO(): string {
  const now = new Date();
  return toISODate(now);
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function nowHHMM(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/** Add minutes to an "HH:MM" time-of-day string, wrapping past midnight. */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function startOfWeekMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function firstDayOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export function lastDayOfMonth(): string {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return toISODate(last);
}

export function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

/** Next date on/after `from` that falls on `dayOfWeek` (0=CN..6=T7, JS getDay convention). */
export function nextOccurrence(dayOfWeek: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const diff = (dayOfWeek - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

/** Most recent date on/before `from` that falls on `dayOfWeek` — today counts if it matches. */
export function mostRecentOccurrence(dayOfWeek: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const diff = (d.getDay() - dayOfWeek + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

/**
 * Số Việt Nam về một dạng duy nhất để so sánh và để lưu: bỏ khoảng trắng,
 * dấu chấm, gạch ngang; "+84..." đổi thành "0...". Không hợp lệ thì trả "".
 */
export function chuanHoaSoDienThoai(raw: string): string {
  const d = raw.replace(/[^0-9+]/g, "").replace(/^\+84/, "0");
  return /^0\d{8,10}$/.test(d) ? d : "";
}

/**
 * Khách đăng ký bằng số điện thoại thì không đưa email, nhưng cột email là
 * UNIQUE NOT NULL và có 28 bảng khác tham chiếu users(id) — dựng lại bảng chỉ
 * để bỏ NOT NULL là rủi ro không đáng trên dữ liệu thật. Thay vào đó chỗ trống
 * được lấp bằng một địa chỉ đánh dấu sinh từ chính số điện thoại. Không nơi
 * nào gửi thư tới nó, và mọi chỗ hiển thị đều lọc bằng emailHienThi().
 */
const MIEN_TAM = "@sdt.local";

export function emailTheoSoDienThoai(phone: string): string {
  return phone.replace(/[^0-9]/g, "") + MIEN_TAM;
}

/** Đúng là địa chỉ đánh dấu ở trên, không phải email thật của khách. */
export function laEmailTam(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith(MIEN_TAM);
}

/** Email để hiện ra màn hình — tài khoản chỉ có số điện thoại thì không hiện. */
export function emailHienThi(email: string | null | undefined): string | null {
  return !email || laEmailTam(email) ? null : email;
}
