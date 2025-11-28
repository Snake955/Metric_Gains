export function formatTime(secondsTotal: number): string {
  const mins = Math.floor(secondsTotal / 60);
  const secs = secondsTotal % 60;
  const mm = mins < 10 ? "0" + mins : "" + mins;
  const ss = secs < 10 ? "0" + secs : "" + secs;
  return mm + ":" + ss;
}

export function formatStartTime(dateObj: Date | null): string {
  if (!dateObj) return "";
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours();
  const mins = dateObj.getMinutes();
  const dd = day < 10 ? "0" + day : "" + day;
  const mm = month < 10 ? "0" + month : "" + month;
  const hh = hours < 10 ? "0" + hours : "" + hours;
  const minStr = mins < 10 ? "0" + mins : "" + mins;
  return `${dd}.${mm}.${year} kl ${hh}:${minStr}`;
}