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
      aria-pressed={isLight}
      aria-label={`Switch to ${isLight ? "night" : "day"} mode`}
      onClick={onToggle}
      className="fixed top-5 right-5 z-30 inline-flex h-[38px] w-[74px] cursor-pointer items-center rounded-full bg-[#18181b] p-1 shadow-[0_4px_16px_rgba(0,0,0,0.24)] ring-1 ring-white/15 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kohaku)]"
    >
      <span
        aria-hidden="true"
        className={`theme-slider-thumb pointer-events-none absolute left-1 top-1 h-[30px] w-[32px] rounded-full transition-transform duration-300 ease-out ${
          isLight
            ? "translate-x-0 bg-[#18181b] text-[#fbbf24]"
            : "translate-x-[34px] bg-[#f4f4f5] text-[#09090b]"
        }`}
      />
      <span
        aria-hidden="true"
        className={`relative z-10 flex w-1/2 items-center justify-center ${
          isLight ? "text-[#fbbf24]" : "text-white/55"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      </span>
      <span
        aria-hidden="true"
        className={`relative z-10 flex w-1/2 items-center justify-center ${
          isLight ? "text-white/55" : "text-[#18181b]"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M20.3 15.7A8.5 8.5 0 0 1 8.3 3.7a8.6 8.6 0 1 0 12 12Z" />
        </svg>
      </span>
    </button>
  );
}
