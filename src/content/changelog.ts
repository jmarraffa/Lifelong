export interface ChangelogEntry { id: string; title: string; bullets: string[] } // 2-3 bullets, each <= 70 chars
export const CHANGELOG: ChangelogEntry[] = [
  { id: "alpha-0.1", title: "Hello, Lifelong", bullets: [
      "Live a whole life from 18 to 65 and watch it add up.",
      "Pick college or work, then how much you save.",
      "Tap Copy my run to share or replay your life.",
  ] },
  { id: "alpha-0.2", title: "Real careers, real taxes", bullets: [
      "4 majors, 7 careers and promotions up real pay ladders.",
      "Taxes use 2026 US federal brackets and payroll tax.",
      "Sharper fonts, easier to read at night.",
  ] },
];
export const currentEntry = (id: string): ChangelogEntry | undefined => CHANGELOG.find((e) => e.id === id);
