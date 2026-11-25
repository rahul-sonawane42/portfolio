import { Fragment, useEffect, useState } from "react";
import KoiPondCanvas from "./components/KoiPondCanvas";
import SteppingStone from "./components/SteppingStone";
import ThemeToggle, { type Theme } from "./components/ThemeToggle";
import WoodenDeck from "./components/WoodenDeck";
import { profile, experience, projects, skills, education } from "./resumeData";

/* Asymmetric Arare-Koboshi Flagstone Placement Patterns for Multi-Stone Clusters */
const CLUSTER_PATTERNS = [
  {
    contentSpan: "md:col-span-10",
    fillerSpan: "hidden md:block md:col-span-2",
    fillerFirst: true,
    nudge: "md:translate-x-1",
  },
  {
    contentSpan: "md:col-span-9",
    fillerSpan: "hidden md:block md:col-span-3",
    fillerFirst: false,
    nudge: "md:-translate-x-1.5",
  },
  {
    contentSpan: "md:col-span-10",
    fillerSpan: "hidden md:block md:col-span-2",
    fillerFirst: true,
    nudge: "md:translate-x-0.5",
  },
];

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
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <KoiPondCanvas theme={theme} />
      <ThemeToggle
        theme={theme}
        onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
      />

      <div className="pointer-events-none relative z-10 min-h-screen">
        {/* Arched Zen Garden Bridge Leading onto Tobi-Ishi & Arare-Koboshi Stepping Stones */}
        <main
          id="main-content"
          className="flex w-full flex-col gap-24 pb-32 sm:gap-28"
        >
          {/* Entry: Monumental Name Over the Pond + Arched Zen Garden Bridge */}
          <section
            id="top"
            data-enter=""
            className="flex min-h-[100svh] w-full flex-col justify-between pb-6 pt-14"
          >
            <div className="mx-auto w-full max-w-[52rem] px-7 sm:px-11">
              <p className="select-none font-mono-tech text-[11px] text-[var(--muted)] opacity-75">
                Click anywhere on the water to feed the koi
              </p>
            </div>

            {/* Monumental Tall & Wide Display Wordmark Floating Over the Pond */}
            <header className="enter-1 my-auto select-none px-4 py-6 text-center sm:px-8">
              <h1 className="hero-wordmark">{profile.name}</h1>
              <p className="mt-7 font-mono-tech text-[11px] uppercase tracking-[0.24em] text-[var(--fg-soft)] opacity-85 sm:mt-9 sm:text-xs">
                {profile.role} &middot; {profile.location}
              </p>
            </header>

            {/* Arched Zen Garden Bridge with Railings & Stone Abutments */}
            <WoodenDeck theme={theme} className="enter-2">
              <p className="max-w-2xl text-[14.5px] leading-relaxed text-[var(--deck-fg-soft)] sm:text-[15px] sm:leading-7">
                {profile.bio}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
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

          {/* 01: Selected Systems — Interlocking Flagstone Cluster (Arare-Koboshi) */}
          <section id="projects" className="pt-2">
            <div data-stepping-stone="" className="stone-cluster">
              {/* Row 1: Compact Section Header Stone + Flanking Decorative Stone */}
              <SteppingStone
                theme={theme}
                title="Selected systems"
                subtitle="01 / Architecture & Builds"
                variant={10}
                inCluster
                className="md:col-span-8"
              />
              <SteppingStone
                theme={theme}
                variant={11}
                inCluster
                decorative
                minHeight={92}
                className="hidden md:block md:col-span-4 md:translate-y-1"
              />

              {/* Rows 2..N: Staggered Case-Study Stones + Small Accent Pebbles (Sutegishi) */}
              {projects.map((p, idx) => {
                const summary = p.points[0] ?? "";
                const specs = p.points.slice(1);
                const indexLabel = String(idx + 1).padStart(2, "0");
                const layout = CLUSTER_PATTERNS[idx % CLUSTER_PATTERNS.length];

                const projectStone = (
                  <SteppingStone
                    theme={theme}
                    variant={12 + idx * 2}
                    inCluster
                    className={`${layout.contentSpan} ${layout.nudge}`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono-tech text-xs font-semibold text-[var(--kohaku)]">
                          {indexLabel}
                        </span>
                        <h3 className="font-display text-2xl sm:text-3xl">
                          {p.name}
                        </h3>
                      </div>
                      {p.status && (
                        <span className="font-mono-tech text-xs font-medium text-[var(--gold)]">
                          {p.status}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-[15px] leading-7 text-[var(--fg-soft)]">
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
                      <div className="flex flex-wrap gap-1.5">
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
                );

                const fillerStone = (
                  <SteppingStone
                    theme={theme}
                    variant={13 + idx * 2}
                    inCluster
                    decorative
                    minHeight={116}
                    className={layout.fillerSpan}
                  />
                );

                return (
                  <Fragment key={p.name}>
                    {layout.fillerFirst ? (
                      <>
                        {fillerStone}
                        {projectStone}
                      </>
                    ) : (
                      <>
                        {projectStone}
                        {fillerStone}
                      </>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </section>

          {/* Stone 02: Engineering Craft & Stack (Single Monolithic Boulder) */}
          <section id="skills" className="pt-2">
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

          {/* Stone 03: Trajectory & Pedigree (Single Monolithic Boulder) */}
          <section id="experience" className="pt-2">
            <SteppingStone
              theme={theme}
              title="Trajectory and pedigree"
              subtitle="03 / Background"
              variant={3}
              align="left"
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                <div className="space-y-6 md:col-span-7">
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
                          <h3 className="font-display text-2xl">{r.title}</h3>
                          <span className="font-mono-tech text-xs font-medium text-[var(--gold)]">
                            {r.period}
                          </span>
                        </div>
                        <p className="mt-1 font-mono-tech text-xs text-[var(--muted)]">
                          {r.org}
                        </p>
                        <p className="mt-2.5 text-[14px] leading-6 text-[var(--fg-soft)]">
                          {r.points.join(" ")}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 md:col-span-5 md:border-l md:border-[var(--line)] md:pl-7">
                  <p className="font-mono-tech text-[11px] uppercase tracking-[0.16em] text-[var(--moss)]">
                    Academic Foundation
                  </p>
                  <div className="space-y-5">
                    {education.map((e) => (
                      <div key={e.degree} className="stone-spec-box">
                        <p className="font-mono-tech text-xs font-medium text-[var(--gold)]">
                          {e.period}
                        </p>
                        <h3 className="font-display mt-1.5 text-xl leading-snug">
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

          {/* Stone 04: Start a Conversation (Single Monolithic Boulder) */}
          <section id="contact" className="pt-2">
            <SteppingStone
              theme={theme}
              title="Start a conversation"
              subtitle="04 / Contact"
              variant={4}
              align="right"
            >
              <p className="max-w-xl text-[15px] leading-7 text-[var(--fg-soft)]">
                Open to AI/ML, data science, and backend systems engineering
                internships. Reach out directly for project discussions,
                research collaborations, or engineering roles.
              </p>

              <footer className="stone-divider mt-7 flex flex-wrap items-center justify-between gap-6 border-t pt-7">
                <div className="font-mono-tech text-sm">
                  <p className="font-medium text-[var(--fg)]">{profile.email}</p>
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
        </main>
      </div>
    </>
  );
}
