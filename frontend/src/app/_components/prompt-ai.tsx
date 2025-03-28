"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";

const formSchema = z.object({
  fileName: z.string().nonempty(),
  prompt: z.string().nonempty(),
});

interface PromptHistory {
  file: string;
  question: string;
  response: string;
}

export default function PromptAI() {
  const [files, setFiles] = useState<string[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: "",
      prompt: "",
    },
  });

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch("http://localhost:8000/get-files");
      const resJson = await res.json();
      setFiles(resJson);
    };
    fetchFiles();
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("prompt", data.prompt);
    formData.append("fileName", data.fileName);
    console.log("Form data:", formData);

    const res = await fetch("http://localhost:8000/prompt-open-ai", {
      method: "POST",
      body: formData,
    });

    const resJson = await res.json();
    console.log(resJson);

    const fetchPromptHistory = async () => {
      const res = await fetch("http://localhost:8000/get-prompt-history");
      const resJson = await res.json();
      setPromptHistory(resJson);
    };
    fetchPromptHistory();
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="fileName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="file-name" className="mb-2">
                  File Name:
                </FormLabel>
                <Select
                  {...field}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select a file --"></SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {files.map((file) => (
                      <SelectItem key={file} value={file}>
                        {file}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel htmlFor="prompt-qn" className="mb-2">
                  Enter your prompt:
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    id="prompt-qn"
                    name={field.name}
                    placeholder="What would you like to know about the dataset?"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="mt-3" type="submit">
            Prompt OpenAI
          </Button>
        </form>
      </Form>

      {promptHistory.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-600 mt-8">
            Current file is: {promptHistory[0].file}
          </h2>
          <ScrollArea className="rouded-md mt-4 h-[300px] w-full">
            {promptHistory.map((convo, index) => (
              <div key={index}>
                <ChatMessage message={convo.question} isUser={true} />
                <ChatMessage message={convo.response} isUser={false} />
              </div>
            ))}
          </ScrollArea>
        </>
      )}
    </>
  );
}
