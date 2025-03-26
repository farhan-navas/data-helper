"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const router = useRouter();

  return (
    <>
      <div className="flex gap-2 m-auto align-middle items-center justify-center">
        <div className="font-semibold text-gray-600">
          Click here to query your files:
        </div>
        <Button variant="outline" onClick={() => router.push("/query")}>
          Query Datasets
        </Button>
      </div>
      <div className="flex gap-2 m-auto align-middle items-center justify-center">
        <div className="font-semibold text-gray-600">
          Click here to prompt OpenAI:
        </div>
        <Button variant="outline" onClick={() => router.push("/prompt-openai")}>
          Prompt OpenAI
        </Button>
      </div>
    </>
  );
}
