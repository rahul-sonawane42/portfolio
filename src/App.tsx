import { useEffect, useState } from "react";
import KoiPondCanvas from "./components/KoiPondCanvas";
import Footbridge from "./components/Footbridge";
import ThemeToggle, { type Theme } from "./components/ThemeToggle";
import { profile, experience, projects, skills, education } from "./resumeData";

const navItems = [
  { label: "Experience", href: "#experience", id: "experience" },
  { label: "Projects", href: "#projects", id: "projects" },
  { label: "Skills", href: "#skills", id: "skills" },
  { label: "Contact", href: "#contact", id: "contact" },
];

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [pondOnly, setPondOnly] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-25% 0px -55% 0px" }
    );
    for (const item of navItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

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

      {/* Floating Restore Control when viewing unobstructed garden pond */}
      {pondOnly && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-30 pt-4">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 sm:px-8">
            <button
              type="button"
              onClick={() => setPondOnly(false)}
              className="pointer-events-auto inline-flex min-h-11 cursor-pointer items-center gap-2.5 border-2 border-[var(--wood-mid)] bg-[var(--plank)] px-4 font-mono-tech text-xs text-[var(--fg)] transition-colors hover:border-[var(--kohaku)] hover:text-[var(--kohaku)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kohaku)]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rotate-45 bg-[var(--kohaku)]"
              />
              <span>Show bridges</span>
            </button>

            <ThemeToggle
              theme={theme}
              onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
          </div>
        </div>
      )}

      <div
        className={`pointer-events-none relative z-10 min-h-screen transition-opacity duration-500 ${
          pondOnly ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={pondOnly}
      >
        {/* Top Garden Overlook Walkway */}
        <header className="walkway-nav pointer-events-auto fixed inset-x-0 top-0 z-20">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
            <a
              href="#top"
              className="inline-flex min-h-11 items-center font-display text-2xl text-[var(--fg)] transition-colors hover:text-[var(--kohaku)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kohaku)]"
            >
              Rahul Sonawane
            </a>

            <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  data-active={activeSection === item.id}
                  className={`nav-link font-mono-tech text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kohaku)] ${
                    activeSection === item.id
                      ? "font-semibold text-[var(--fg)]"
                      : "text-[var(--muted)] hover:text-[var(--fg)]"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setPondOnly(true)}
                className="pointer-events-auto hidden min-h-11 cursor-pointer items-center border-2 border-[var(--wood-mid)] bg-[var(--tag-bg)] px-3 font-mono-tech text-[11px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--moss)] hover:text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kohaku)] sm:inline-flex"
                title="Hide footbridges to watch the koi pond"
              >
                Pond
              </button>

              <ThemeToggle
                theme={theme}
                onToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
            </div>
          </div>
        </header>

        {/* Main Content — Full-Viewport-Width Arched Timber Footbridges Spanning Bank to Bank */}
        <main
          id="main-content"
          className="flex w-full flex-col gap-36 pb-32"
        >
          {/* Screen 1: Open Upper Water + Entrance Footbridge Anchored in Lower Third */}
          <section
            id="top"
            data-enter=""
            className="flex min-h-[100svh] flex-col justify-between pb-6 pt-20"
          >
            {/* Unboxed shoreline note tucked quietly in top-left margin */}
            <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
              <p className="select-none font-mono-tech text-[11px] text-[var(--muted)] opacity-75">
                Click anywhere on the water to feed the koi
              </p>
            </div>

            {/* Primary Entrance Footbridge spanning edge-to-edge across the pond */}
            <Footbridge className="enter-1 mt-auto">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono-tech text-xs font-medium text-[var(--kohaku)]">
                  {profile.role}
                </p>
                <p className="font-mono-tech text-xs text-[var(--muted)]">
                  {profile.location}
                </p>
              </div>

              <h1 className="font-display mt-2.5 text-5xl leading-[1.02] text-[var(--fg)] sm:text-6xl">
                {profile.name}
              </h1>

              <div className="enter-2 mt-6 grid grid-cols-1 items-end gap-6 border-t border-[var(--line)] pt-5 lg:grid-cols-12">
                <p className="text-[15px] leading-7 text-[var(--fg-soft)] lg:col-span-6">
                  {profile.bio}
                </p>

                <div className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end">
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
            </Footbridge>
          </section>

          {/* Section 2: Experience Footbridge — Full-Width Span */}
          <section id="experience" className="pt-4">
            <Footbridge title="Experience and leadership">
              <div className="divide-y divide-[var(--line)]">
                {experience.map((r) => (
                  <article
                    key={r.title + r.org}
                    className="py-6 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-2xl text-[var(--fg)]">
                        {r.title}
                      </h3>
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
            </Footbridge>
          </section>

          {/* Section 3: Projects Footbridge — Full-Width Span */}
          <section id="projects" className="pt-4">
            <Footbridge title="Featured projects">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {projects.map((p, i) => (
                  <article
                    key={p.name}
                    className={`flex flex-col justify-between ${
                      i === 0
                        ? "border-b border-[var(--line)] pb-8 md:col-span-2"
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
            </Footbridge>
          </section>

          {/* Section 4: Technical Skills Footbridge — Full-Width Span */}
          <section id="skills" className="pt-4">
            <Footbridge title="Technical skills">
              <div className="divide-y divide-[var(--line)]">
                {Object.entries(skills).map(([group, items]) => (
                  <div
                    key={group}
                    className="grid grid-cols-1 gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-12 sm:items-center"
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
            </Footbridge>
          </section>

          {/* Section 5: Education & Contact Footbridge — Full-Width Span */}
          <section id="contact" className="pt-4">
            <Footbridge title="Education and contact">
              <div className="grid grid-cols-1 gap-8 border-b border-[var(--line)] pb-8 md:grid-cols-2">
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
            </Footbridge>
          </section>
        </main>
      </div>
    </>
  );
}
