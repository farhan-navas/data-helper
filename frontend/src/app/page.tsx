"use client";

import { Linkedin, Github, BriefcaseBusiness } from "lucide-react";
import FileUpload from "./_components/file-upload";
import { useState } from "react";

export default function Home() {
  const [filename, setFilename] = useState("");

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <FileUpload setFilename={setFilename} />
      </main>
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
    </div>
  );
}
