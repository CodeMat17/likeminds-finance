export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function parseDob(dob: string) {
  const [year, month, day] = dob.split("-").map(Number);
  return { year, month, day };
}

export function isBirthdayToday(dob: string, today = new Date()) {
  const { month, day } = parseDob(dob);
  return month === today.getMonth() + 1 && day === today.getDate();
}

export type BirthdayState = "next" | "today" | "celebrated" | "upcoming";

export function getBirthdayState(dob: string, today = new Date()): BirthdayState {
  const { month, day } = parseDob(dob);
  const thisYear = today.getFullYear();
  const birthdayThisYear = new Date(thisYear, month - 1, day);
  const todayMidnight = new Date(thisYear, today.getMonth(), today.getDate());

  const diffDays = Math.round(
    (birthdayThisYear.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "next";
  if (diffDays === -1) return "celebrated";
  return "upcoming";
}

export function formatDob(dob: string) {
  const { year, month, day } = parseDob(dob);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function age(dob: string, today = new Date()) {
  const { year, month, day } = parseDob(dob);
  let a = today.getFullYear() - year;
  const hasHadBirthday =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hasHadBirthday) a -= 1;
  return a;
}
