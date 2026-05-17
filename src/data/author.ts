export interface AuthorContact {
  label: string;
  href: string;
  value: string;
  icon: "mail" | "linkedin" | "github" | "globe" | "twitter" | "file-text";
}

export const AUTHOR = {
  name: "Narendra Gupta",
  tagline: "Software Developer · B.Tech CSE, MNNIT Allahabad (2022–2026)",
  bio:
    "I build clean web apps, solve DSA problems, and love shipping useful " +
    "tools that make developers' lives easier. Helix is one of those tools.",
  email: "narendraxwork@gmail.com",
  website: "https://narendraxportfolio.vercel.app",
  linkedin: "https://www.linkedin.com/in/narendraxgupta/",
  github: "https://github.com/narendraxgupta",
  resume:
    "https://drive.google.com/file/d/1JjC9W6nySumQr3-JW_50Q7X16DxsNIPU/view?usp=sharing",
} as const;

export const AUTHOR_CONTACTS: readonly AuthorContact[] = [
  {
    label: "Email",
    href: `mailto:${AUTHOR.email}?subject=${encodeURIComponent("Helix · hello")}`,
    value: AUTHOR.email,
    icon: "mail",
  },
  {
    label: "LinkedIn",
    href: AUTHOR.linkedin,
    value: "in/narendraxgupta",
    icon: "linkedin",
  },
  {
    label: "GitHub",
    href: AUTHOR.github,
    value: "@narendraxgupta",
    icon: "github",
  },
  {
    label: "Portfolio",
    href: AUTHOR.website,
    value: "narendraxportfolio.vercel.app",
    icon: "globe",
  },
  {
    label: "Resume",
    href: AUTHOR.resume,
    value: "drive.google.com/…",
    icon: "file-text",
  },
] as const;
