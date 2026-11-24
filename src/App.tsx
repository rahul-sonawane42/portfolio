import { useEffect, useState } from "react";
import { useEffect, useState } from "react";
import KoiPondCanvas from "./components/KoiPondCanvas";
import SteppingStone from "./components/SteppingStone";
import ThemeToggle, { type Theme } from "./components/ThemeToggle";
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
  }: {
    href: string;
    children: string;
    main?: boolean;
  }) => (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={`btn w-full sm:w-auto ${main ? "btn-main" : ""}`}
    >
      <span>{children}</span>
      {href.startsWith("http") && (
        <span aria-hidden="true" className="text-[11px] opacity-80">
          {"\u2197"}
        </span>
      )}
    </a>
  );

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
        {/* Staggered Tobi-Ishi Stepping Stones Across the Koi Pond */}
        <main
          id="main-content"
          className="flex w-full flex-col gap-28 pb-36 sm:gap-36"
        >
          {/* Stone 1: Entrance Stepping Stone */}
          <section
            id="top"
            data-enter=""
            className="flex min-h-[100svh] flex-col justify-between pb-6 pt-16"
          >
            <div className="mx-auto w-full max-w-4xl px-6 sm:px-8">
              <p className="select-none font-mono-tech text-[11px] text-[var(--muted)] opacity-75">
                Click anywhere on the water to feed the koi
              </p>
            </div>

            <SteppingStone
              theme={theme}
              variant={0}
              align="center"
              className="enter-1 mt-auto"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono-tech text-xs font-medium text-[var(--moss)]">
                  {profile.role}
                </p>
                <p className="font-mono-tech text-xs text-[var(--muted)]">
                  {profile.location}
                </p>
              </div>

              <h1 className="font-display mt-2.5 text-5xl leading-[1.02] sm:text-6xl">
                {profile.name}
              </h1>

              <div className="enter-2 stone-divider mt-6 border-t pt-5">
                <p className="max-w-2xl text-[15px] leading-7 text-[var(--fg-soft)]">
                  {profile.bio}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <ActionLink href="#projects" main>
                    View projects
                  </ActionLink>
                  <ActionLink href={profile.resume}>Download resume</ActionLink>
                  <ActionLink href={profile.linkedin}>LinkedIn</ActionLink>
                  {profile.github && (
                    <ActionLink href={profile.github}>GitHub</ActionLink>
                  )}
                </div>
              </div>
            </SteppingStone>
          </section>

          {/* Stone 2: Experience & Leadership */}
          <section id="experience" className="pt-2">
            <SteppingStone
              theme={theme}
              title="Experience and leadership"
              variant={1}
              align="left"
            >
              <div className="divide-y divide-[var(--line)]">
                {experience.map((r) => (
                  <article
                    key={r.title + r.org}
                    className="stone-divider py-6 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-2xl">{r.title}</h3>
                      <span className="font-mono-tech text-xs font-medium text-[var(--gold)]">
                        {r.period}
                      </span>
                    </div>
                    <p className="mt-1 font-mono-tech text-xs text-[var(--moss)]">
                      {r.org}
                    </p>
                    <ul className="mt-4 space-y-2.5 text-[14.5px] leading-6 text-[var(--fg-soft)]">
                      {r.points.map((p) => (
                        <li key={p} className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 border border-[var(--kohaku)]"
                          />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </SteppingStone>
          </section>

          {/* Stone 3: Featured Projects */}
          <section id="projects" className="pt-2">
            <SteppingStone
              theme={theme}
              title="Featured projects"
              variant={2}
              align="right"
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {projects.map((p, i) => (
                  <article
                    key={p.name}
                    className={`flex flex-col justify-between ${
                      i === 0
                        ? "stone-divider border-b pb-8 md:col-span-2"
                        : ""
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-2xl sm:text-3xl">
                          {p.name}
                        </h3>
                        {p.status && (
                          <span className="font-mono-tech text-xs font-medium text-[var(--gold)]">
                            {p.status}
                          </span>
                        )}
                      </div>

                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {p.stack.map((s) => (
                          <span key={s} className="tag">
                            {s}
                          </span>
                        ))}
                      </div>

                      <ul className="mt-5 space-y-2 text-[14.5px] leading-6 text-[var(--fg-soft)]">
                        {p.points.map((x) => (
                          <li key={x} className="flex items-start gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 border border-[var(--kohaku)]"
                            />
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {p.repo && (
                      <div className="mt-6 pt-1">
                        <ActionLink href={p.repo}>Repository</ActionLink>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </SteppingStone>
          </section>

          {/* Stone 4: Technical Skills */}
          <section id="skills" className="pt-2">
            <SteppingStone
              theme={theme}
              title="Technical skills"
              variant={3}
              align="left"
            >
              <div className="divide-y divide-[var(--line)]">
                {Object.entries(skills).map(([group, items]) => (
                  <div
                    key={group}
                    className="stone-divider grid grid-cols-1 gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-12 sm:items-center"
                  >
                    <h3 className="font-mono-tech text-xs font-medium text-[var(--moss)] sm:col-span-4">
                      {group}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:col-span-8">
                      {items.map((skill) => (
                        <span key={skill} className="tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SteppingStone>
          </section>

          {/* Stone 5: Education & Contact */}
          <section id="contact" className="pt-2">
            <SteppingStone
              theme={theme}
              title="Education and contact"
              variant={4}
              align="right"
            >
              <div className="stone-divider grid grid-cols-1 gap-8 border-b pb-8 md:grid-cols-2">
                {education.map((e) => (
                  <div key={e.degree}>
                    <p className="font-mono-tech text-xs font-medium text-[var(--gold)]">
                      {e.period}
                    </p>
                    <h3 className="font-display mt-1.5 text-2xl">{e.degree}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {e.school}
                    </p>
                    {e.note && (
                      <p className="mt-3 font-mono-tech text-xs text-[var(--fg-soft)]">
                        {e.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <footer className="mt-8 flex flex-wrap items-center justify-between gap-6">
                <div className="font-mono-tech text-sm">
                  <p className="font-medium text-[var(--fg)]">{profile.email}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {profile.phone}
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
                  <ActionLink href={profile.linkedin}>LinkedIn</ActionLink>
                  {profile.github && (
                    <ActionLink href={profile.github}>GitHub</ActionLink>
                  )}
                </div>
              </footer>
            </SteppingStone>
          </section>
        </main>
      </div>
    </>
  );
}
