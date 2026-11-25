import { useEffect, useState } from "react";
import HeroWordmark from "./components/HeroWordmark";
import KoiPondCanvas from "./components/KoiPondCanvas";
import SteppingStone from "./components/SteppingStone";
import ThemeToggle, { type Theme } from "./components/ThemeToggle";
import WoodenDeck from "./components/WoodenDeck";
import { profile, experience, projects, skills, education } from "./resumeData";

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const ActionLink = ({
    href,
    children,
    main,
    onDeck,
  }: {
    href: string;
    children: string;
    main?: boolean;
    onDeck?: boolean;
  }) => (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={`btn w-full sm:w-auto ${
        onDeck
          ? main
            ? "deck-btn-main"
            : "deck-btn"
          : main
            ? "btn-main"
            : ""
      }`}
    >
      <span>{children}</span>
      {href.startsWith("http") && (
        <span aria-hidden="true" className="text-[11px] opacity-80">
          {"\u2197"}
        </span>
      )}
    </a>
  );

  const skillEntries = Object.entries(skills);

  return (
    <div className="relative min-h-screen w-full overflow-x-clip">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Document-Space Overscan Pond Layer: scrolls rigidly with foreground on compositor thread */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <KoiPondCanvas theme={theme} />
      </div>

      <ThemeToggle
        theme={theme}
        onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
      />

      <div className="pointer-events-none relative z-10 min-h-screen">
        <main
          id="main-content"
          className="flex w-full flex-col gap-20 pb-32 sm:gap-24"
        >
          {/* Hero: Centered Monumental Full-Space Wordmark + Arched Zen Garden Bridge */}
          <section
            id="top"
            data-enter=""
            className="flex min-h-[100svh] w-full flex-col justify-between pt-10 sm:pt-12"
          >
            <div className="mx-auto w-full px-6 text-center">
              <p className="select-none font-mono-tech text-[11px] text-[var(--muted)] opacity-80">
                Click water to feed koi &middot; Hover title glyphs
              </p>
            </div>

            <header className="enter-1 mx-auto my-auto flex w-full max-w-[96vw] flex-col items-center justify-center px-3 py-8 text-center sm:px-8 sm:py-10">
              <p
                className="mb-7 font-mono-tech text-[11px] font-medium uppercase tracking-[0.24em] sm:mb-9 sm:text-xs md:mb-11"
                style={{ color: "var(--hero-sub)" }}
              >
                {profile.role} &middot; {profile.location}
              </p>

              <HeroWordmark text={profile.name} />
            </header>

            <WoodenDeck theme={theme} className="enter-2">
              <p className="mx-auto max-w-2xl text-[14.5px] leading-relaxed text-[var(--deck-fg-soft)] sm:text-[15.5px] sm:leading-7">
                {profile.bio}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <ActionLink href="#projects" main onDeck>
                  Selected systems
                </ActionLink>
                <ActionLink href={profile.resume} onDeck>
                  Resume
                </ActionLink>
                {profile.github && (
                  <ActionLink href={profile.github} onDeck>
                    GitHub
                  </ActionLink>
                )}
                <ActionLink href={profile.linkedin} onDeck>
                  LinkedIn
                </ActionLink>
              </div>
            </WoodenDeck>
          </section>

          {/* Winding Japanese Tobi-Ishi Stepping-Stone Path */}
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 sm:gap-20 sm:px-8">
            {/* 01: Selected Systems (Modular Staggered Flagstones + Compact Sutegishi Pebbles) */}
            <section id="projects" className="space-y-8 sm:space-y-10">
              <div className="mx-auto max-w-2xl">
                <SteppingStone
                  theme={theme}
                  title="Selected systems"
                  subtitle="01 / Architecture & Builds"
                  variant={1}
                  compact
                />
              </div>

              {projects.map((p, idx) => {
                const summary = p.points[0] ?? "";
                const specs = p.points.slice(1);
                const indexLabel = String(idx + 1).padStart(2, "0");
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={p.name}
                    className={`relative flex flex-col items-center justify-center gap-4 lg:gap-6 ${
                      isEven
                        ? "stone-shift-left lg:flex-row lg:items-end"
                        : "stone-shift-right lg:flex-row-reverse lg:items-start"
                    }`}
                  >
                    <SteppingStone
                      theme={theme}
                      variant={10 + idx * 3}
                      className="w-full max-w-[54rem]"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono-tech text-xs font-semibold text-[var(--kohaku)]">
                            {indexLabel}
                          </span>
                          <h3 className="engraved-title text-2xl sm:text-3xl">
                            {p.name}
                          </h3>
                        </div>
                        {p.status && (
                          <span className="font-mono-tech text-xs font-medium text-[var(--gold)]">
                            {p.status}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-[15px] text-[var(--fg-soft)]">
                        {summary}
                      </p>

                      {specs.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {specs.map((spec, sIdx) => (
                            <div key={spec} className="stone-spec-box">
                              <p className="font-mono-tech text-[10.5px] uppercase tracking-[0.14em] text-[var(--moss)]">
                                {sIdx === 0
                                  ? "Core Architecture"
                                  : "Implementation Detail"}
                              </p>
                              <p className="mt-1.5 text-[13.5px] leading-6 text-[var(--fg-soft)]">
                                {spec}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {p.stack.map((s) => (
                            <span key={s} className="tag">
                              {s}
                            </span>
                          ))}
                        </div>

                        {p.repo && (
                          <ActionLink href={p.repo}>Source code</ActionLink>
                        )}
                      </div>
                    </SteppingStone>

                    {/* Compact Fixed-Dimension Sutegishi Accent Stone */}
                    <SteppingStone
                      theme={theme}
                      variant={11 + idx * 3}
                      decorative
                      style={{ width: "140px", height: "90px" }}
                      className={`hidden shrink-0 lg:block ${
                        isEven ? "mb-4 self-end" : "mt-6 self-start"
                      }`}
                    />
                  </div>
                );
              })}
            </section>

            {/* 02: Engineering Craft */}
            <section id="skills" className="mx-auto w-full max-w-[50rem]">
              <SteppingStone
                theme={theme}
                title="Engineering craft"
                subtitle="02 / Capabilities"
                variant={2}
                align="right"
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {skillEntries.map(([group, items], idx) => (
                    <div
                      key={group}
                      className={`stone-spec-box flex flex-col justify-between ${
                        idx === 0 && skillEntries.length % 2 === 1
                          ? "md:col-span-2"
                          : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-mono-tech text-xs font-semibold uppercase tracking-[0.1em] text-[var(--moss)]">
                            {group}
                          </h3>
                          <span className="font-mono-tech text-[11px] text-[var(--muted)]">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {items.map((skill) => (
                            <span key={skill} className="tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SteppingStone>
            </section>

            {/* 03: Trajectory & Pedigree */}
            <section id="experience" className="mx-auto w-full max-w-[52rem]">
              <SteppingStone
                theme={theme}
                title="Trajectory and pedigree"
                subtitle="03 / Background"
                variant={3}
                align="left"
              >
                <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-9">
                  <div className="space-y-5 md:col-span-7">
                    <p className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[var(--moss)]">
                      Leadership &amp; Roles
                    </p>
                    <div className="divide-y divide-[var(--line)]">
                      {experience.map((r) => (
                        <article
                          key={r.title + r.org}
                          className="stone-divider py-5 first:pt-0 last:pb-0"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="engraved-title text-xl sm:text-2xl">
                              {r.title}
                            </h3>
                            <span className="font-mono-tech text-xs font-medium text-[var(--gold)]">
                              {r.period}
                            </span>
                          </div>
                          <p className="mt-1 font-mono-tech text-xs text-[var(--muted)]">
                            {r.org}
                          </p>
                          <p className="mt-2.5 text-[14px] text-[var(--fg-soft)]">
                            {r.points.join(" ")}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5 md:col-span-5 md:border-l md:border-[var(--line)] md:pl-7">
                    <p className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[var(--moss)]">
                      Academic Foundation
                    </p>
                    <div className="space-y-4">
                      {education.map((e) => (
                        <div key={e.degree} className="stone-spec-box">
                          <p className="font-mono-tech text-xs font-medium text-[var(--gold)]">
                            {e.period}
                          </p>
                          <h3 className="engraved-title mt-1.5 text-lg leading-snug sm:text-xl">
                            {e.degree}
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                            {e.school}
                          </p>
                          {e.note && (
                            <p className="mt-2.5 font-mono-tech text-xs font-medium text-[var(--fg-soft)]">
                              {e.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SteppingStone>
            </section>

            {/* 04: Start a Conversation */}
            <section id="contact" className="mx-auto w-full max-w-[44rem]">
              <SteppingStone
                theme={theme}
                title="Start a conversation"
                subtitle="04 / Contact"
                variant={4}
                align="right"
              >
                <p className="max-w-xl text-[15px] text-[var(--fg-soft)]">
                  Open to AI/ML, data science, and backend systems engineering
                  internships. Reach out directly for project discussions,
                  research collaborations, or engineering roles.
                </p>

                <footer className="stone-divider mt-7 flex flex-wrap items-center justify-between gap-6 border-t pt-7">
                  <div className="font-mono-tech text-sm">
                    <p className="break-all font-medium text-[var(--fg)]">
                      {profile.email}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {profile.location}
                    </p>
                  </div>

                  <div className="flex w-full flex-wrap gap-3 sm:w-auto">
                    <button
                      type="button"
                      className="btn btn-main w-full sm:w-auto"
                      onClick={copyEmail}
                    >
                      {copied ? "Email copied" : "Copy email"}
                    </button>
                    <ActionLink href={profile.resume}>Resume</ActionLink>
                    {profile.github && (
                      <ActionLink href={profile.github}>GitHub</ActionLink>
                    )}
                    <ActionLink href={profile.linkedin}>LinkedIn</ActionLink>
                  </div>
                </footer>
              </SteppingStone>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
