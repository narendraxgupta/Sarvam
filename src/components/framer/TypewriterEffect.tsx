import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

export type TypewriterEffectProps = {
  strings: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  holdMs?: number;
  loop?: boolean;
  caret?: boolean;
  mono?: boolean;
  as?: keyof JSX.IntrinsicElements;
  ariaLabel?: string;
  className?: string;
};

export function TypewriterEffect({
  strings,
  typingSpeed = 42,
  deletingSpeed = 26,
  holdMs = 1400,
  loop = true,
  caret = true,
  mono = false,
  as: Tag = "span",
  ariaLabel,
  className,
}: TypewriterEffectProps) {
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<
    "typing" | "holding" | "deleting" | "done"
  >("typing");
  const [index, setIndex] = useState(0);
  const [chars, setChars] = useState(0);
  const widestRef = useRef<HTMLSpanElement>(null);

  const safe = strings.length ? strings : [""];
  const current = safe[index % safe.length] ?? "";
  const widest = safe.reduce(
    (acc, s) => (s.length > acc.length ? s : acc),
    "",
  );
  const isLast = index === safe.length - 1;

  useEffect(() => {
    if (reduced || phase === "done") return;
    let timer: ReturnType<typeof setTimeout>;

    const jitter = (base: number) => base + Math.random() * (base * 0.35);

    if (phase === "typing") {
      if (chars < current.length) {
        timer = setTimeout(() => setChars((c) => c + 1), jitter(typingSpeed));
      } else {
        timer = setTimeout(() => setPhase("holding"), holdMs);
      }
    } else if (phase === "holding") {
      if (!loop && isLast) {
        setPhase("done");
        return;
      }
      timer = setTimeout(() => setPhase("deleting"), holdMs);
    } else if (phase === "deleting") {
      if (chars > 0) {
        timer = setTimeout(() => setChars((c) => c - 1), jitter(deletingSpeed));
      } else {

        const next = (index + 1) % safe.length;
        setIndex(next);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timer);
  }, [
    phase,
    chars,
    current,
    holdMs,
    typingSpeed,
    deletingSpeed,
    loop,
    reduced,
    safe.length,
    isLast,
    index,
  ]);

  const visible = reduced ? widest : current.slice(0, chars);

  const Element = Tag as unknown as "span";

  return (
    <Element
      className={cn(
        "relative inline-block align-baseline",
        mono && "font-mono",
        className,
      )}
      aria-label={ariaLabel ?? current}
    >

      <span
        ref={widestRef}
        aria-hidden
        className="invisible whitespace-pre"
      >
        {widest}
      </span>
      <span
        className="absolute inset-0 whitespace-pre"
        aria-hidden
      >
        {visible}
        {caret && (
          <span
            className="inline-block align-baseline ml-[2px] w-[2px] bg-accent"
            style={{
              height: "0.95em",
              transform: "translateY(0.05em)",
              animation: reduced
                ? undefined
                : "caret-blink 1.05s ease-in-out infinite",
            }}
          />
        )}
      </span>
    </Element>
  );
}
