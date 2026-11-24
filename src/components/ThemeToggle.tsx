export type Theme = "dark" | "light";

export default function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={`Garden lighting: ${isLight ? "Day" : "Night"}. Switch to ${
        isLight ? "Night" : "Day"
      } mode`}
      onClick={onToggle}
      className="pointer-events-auto relative inline-flex h-11 w-[140px] shrink-0 cursor-pointer items-center border-2 border-[var(--rail)] bg-[var(--slider-track)] p-1 transition-colors duration-200 hover:border-[var(--kohaku)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kohaku)]"
    >
      <span
        aria-hidden="true"
        className={`theme-slider-thumb pointer-events-none absolute top-1 bottom-1 left-1 w-[62px] border border-[var(--rail-shadow)] bg-[var(--slider-thumb)] transition-transform duration-300 ${
          isLight ? "translate-x-[66px]" : "translate-x-0"
        }`}
      />

      <span
        className={`relative z-10 flex w-1/2 items-center justify-center gap-1.5 font-mono-tech text-[11px] font-medium tracking-wide transition-colors ${
          !isLight ? "text-[var(--fg)]" : "text-[#e6dccf]/75"
        }`}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={!isLight ? "text-[var(--gold)]" : "opacity-75"}
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
        <span>Night</span>
      </span>

      <span
        className={`relative z-10 flex w-1/2 items-center justify-center gap-1.5 font-mono-tech text-[11px] font-medium tracking-wide transition-colors ${
          isLight ? "text-[var(--fg)]" : "text-[var(--muted)]"
        }`}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={isLight ? "text-[var(--kohaku)]" : "opacity-70"}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
        </svg>
        <span>Day</span>
      </span>
    </button>
  );
}
