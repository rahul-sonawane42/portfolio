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
      className={`fixed top-5 right-5 z-30 inline-flex h-[38px] w-[74px] cursor-pointer items-center rounded-full p-1 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kohaku)] ${
        isLight
          ? "bg-[#e3dfd6] shadow-[0_4px_14px_rgba(0,0,0,0.16)] ring-1 ring-black/15"
          : "bg-[#15181b] shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-1 ring-white/15"
      }`}
    >
      {/* Sliding Sun / Moon Thumb */}
      <span
        aria-hidden="true"
        className={`theme-slider-thumb pointer-events-none absolute left-1 top-1 h-[30px] w-[32px] rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.38,0.64,1)] ${
          isLight
            ? "translate-x-0 bg-[#1c1a17]"
            : "translate-x-[34px] bg-[#f4f4f5]"
        }`}
      />

      {/* Sun Slot (Left) */}
      <span
        aria-hidden="true"
        className={`relative z-10 flex w-1/2 items-center justify-center transition-colors duration-300 ${
          isLight ? "text-[#fbbf24]" : "text-white/45"
        }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      </span>

      {/* Moon Slot (Right) */}
      <span
        aria-hidden="true"
        className={`relative z-10 flex w-1/2 items-center justify-center transition-colors duration-300 ${
          isLight ? "text-black/45" : "text-[#15181b]"
        }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M20.3 15.7A8.5 8.5 0 0 1 8.3 3.7a8.6 8.6 0 1 0 12 12Z" />
        </svg>
      </span>
    </button>
  );
}
