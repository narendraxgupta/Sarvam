import { Github, Globe, Linkedin, Mail, FileText } from "lucide-react";
import { AUTHOR, AUTHOR_CONTACTS, type AuthorContact } from "@/data/author";
import { cn } from "@/lib/utils";

const ICONS = {
  mail: Mail,
  linkedin: Linkedin,
  github: Github,
  globe: Globe,
  "file-text": FileText,
  twitter: Globe,
} as const;

interface Props {

  variant?: "compact" | "detailed";
  className?: string;
  hideHeading?: boolean;
}

export function AuthorCredit({
  variant = "compact",
  className,
  hideHeading,
}: Props) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-ink-muted",
          className,
        )}
      >
        <span className="text-ink-subtle">
          Built by{" "}
          <a
            href={AUTHOR.website}
            target="_blank"
            rel="noreferrer noopener"
            className="text-ink font-medium underline-offset-2 hover:underline hover:text-accent transition-colors"
          >
            {AUTHOR.name}
          </a>
        </span>
        <span aria-hidden className="text-ink-dim/40">·</span>
        <nav
          aria-label="Author contact"
          className="flex items-center gap-2"
        >
          {AUTHOR_CONTACTS.map((c) => (
            <ContactLink key={c.label} contact={c} showLabel={false} />
          ))}
        </nav>
      </div>
    );
  }

  return (
    <section
      aria-label="About the author"
      className={cn("flex flex-col gap-3", className)}
    >
      {!hideHeading && (
        <div className="hx-eyebrow text-ink-subtle">About the author</div>
      )}
      <div>
        <div className="text-[14px] font-semibold text-ink">
          {AUTHOR.name}
        </div>
        <div className="text-[11.5px] text-ink-subtle mt-0.5">
          {AUTHOR.tagline}
        </div>
      </div>
      <p className="text-[12.5px] text-ink-muted leading-relaxed max-w-prose">
        {AUTHOR.bio}
      </p>
      <ul
        aria-label="Contact channels"
        className="flex flex-wrap items-center gap-1.5 pt-1"
      >
        {AUTHOR_CONTACTS.map((c) => (
          <li key={c.label}>
            <ContactLink contact={c} showLabel />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContactLink({
  contact,
  showLabel,
}: {
  contact: AuthorContact;
  showLabel: boolean;
}) {
  const Icon = ICONS[contact.icon];
  const isMail = contact.href.startsWith("mailto:");
  return (
    <a
      href={contact.href}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noreferrer noopener"}
      aria-label={`${contact.label} — ${contact.value}`}
      title={contact.value}
      className={cn(
        "inline-flex items-center gap-1.5",
        "h-7 px-2 rounded-md border border-line/10 bg-bg-elevated/40",
        "text-[11.5px] text-ink-muted",
        "hover:text-ink hover:border-accent/30 hover:bg-accent/[0.04]",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        !showLabel && "h-7 w-7 px-0 justify-center",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {showLabel && (
        <span className="hidden sm:inline-block font-medium">
          {contact.label}
        </span>
      )}
    </a>
  );
}
