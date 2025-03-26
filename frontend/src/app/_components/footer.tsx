import { BriefcaseBusiness, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      <div className="flex items-center gap-2 hover:underline hover:underline-offset-4">
        Built by Farhan Navas, check out my
      </div>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://www.linkedin.com/in/farhan-navas/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Linkedin />
        LinkedIn
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/farhan-navas"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github />
        Github
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://farhan-navas.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <BriefcaseBusiness />
        Portfolio Site
      </a>
    </footer>
  );
}
