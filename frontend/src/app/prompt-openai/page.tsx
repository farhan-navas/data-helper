import PromptAI from "../_components/prompt-ai";

export default function PromptOpenAI() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Prompt OpenAI</h1>
        <h2 className="text-lg font-semibold text-gray-600">
          Ask questions to OpenAI&apos;s GPT model about your dataset!
        </h2>
        <PromptAI />
      </div>
    </div>
  );
}
