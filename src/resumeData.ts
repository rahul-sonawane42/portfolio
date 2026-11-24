export interface Project { name: string; status?: string; stack: string[]; points: string[]; repo: string }
export interface Role { title: string; org: string; period: string; points: string[] }

export const profile = {
  name: "Rahul Sonawane",
  role: "AI / ML and GenAI Developer",
  location: "Pune, Maharashtra",
  phone: "9311880612",
  email: "rahulsonawane280305@gmail.com",
  linkedin: "https://linkedin.com/in/rahul-sonawane28",
  github: "",
  resume: "/RAHUL_resume_new.pdf",
  bio: "MCA student with hands-on experience building AI systems end to end: GNN-based physics models, a from-scratch NumPy neural network, and a Gemini-powered LLM application with built-in safety checks. Seeking an AI/ML or GenAI Developer internship where I can build reliable, production-minded AI.",
};

export const experience: Role[] = [
  { title: "Web Master", org: "SPPU ACM Student Chapter", period: "Current", points: ["Currently working as Web Master for the chapter."] },
  { title: "Head of Accounts", org: "FIESTRON Tech Fest, KC College", period: "Leadership", points: ["Managed the accounts for FIESTRON, KC College's annual tech fest with 500+ participants."] },
  { title: "Volunteer", org: "International Conference on Artificial Intelligence - Horizons: Navigating Future Frontiers, KC College", period: "Extra-curricular", points: ["Contributed to organizing a conference on Artificial Intelligence with 300+ participants."] },
];

export const projects: Project[] = [
  { name: "Graph-to-Physics: AI-Driven Physics and Collision Engine", status: "Ongoing", stack: ["Python", "PyTorch", "Pygame"], repo: "",
    points: ["Real-time AI physics engine that eliminated autoregressive hallucinations.", "Simulated 150+ particles at 60 FPS with sub-0.05 masked loss and 100% resolution of phantom energy bugs.", "Implemented GINEConv architectures, custom PINN loss functions and 4D relative feature engineering to model particle interactions.", "Bypassed O(N^2) collision complexity with a mass-proportional KD-Tree spatial partitioning pipeline."] },
  { name: "Canvas-to-Matrix: Framework-Free Neural Inference Engine", stack: ["Python", "NumPy", "OpenCV", "Pygame"], repo: "",
    points: ["Built a framework-free neural inference engine and real-time computer vision UI from scratch, reducing ML framework dependencies to zero.", "Executed matrix dot products at 60 FPS, normalizing 400x400 canvas drawings to the exact 28x28 input format; model converged in 35 epochs.", "Engineered a 784-256-128-10 pure NumPy MLP and an OpenCV bounding-box and center-of-mass preprocessing pipeline, loading serialized .npy weights directly into memory."] },
  { name: "AiSH: Custom Python Shell", stack: ["Python", "Google Gemini API", "Linux OS"], repo: "",
    points: ["Dual-mode AI Linux terminal that translates natural-language intent into safe Unix pipelines.", "Strict prompt constraints plus a local pre-execution safety parser intercepting 100% of destructive AI-generated commands (e.g., rm -rf).", "Automated 7-day rolling backups with zero command-history loss on sudden termination, without blocking the main UI thread.", "Decoupled I/O using Python multithreading and hooked GNU Readline for instant disk synchronization."] },
];

export const skills: Record<string, string[]> = {
  Languages: ["Python", "C++", "C", "Assembly"],
  "AI / ML": ["PyTorch", "NumPy", "OpenCV", "Gemini API"],
  "Systems / Backend": ["Linux", "Multithreading", "GNU Readline", "ASP.NET"],
  "Web / Databases": ["React JS", "Tailwind", "MySQL", "MongoDB", "PostgreSQL"],
  Tools: ["Pygame", "Git"],
};

export const education = [
  { degree: "Master of Computer Applications", school: "Savitribai Phule Pune University", period: "2025 - 2027 (Current), Expected 2027", note: "" },
  { degree: "Bachelor of Science (Computer Science)", school: "Kishinchand Chellaram College, Mumbai", period: "2022 - 2025", note: "Grade: 9.95 CGPA" },
];
