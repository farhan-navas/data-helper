"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
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

const formSchema = z.object({
  fileName: z.string().nonempty(),
  prompt: z.string().nonempty(),
});

export default function PromptAI() {
  const [files, setFiles] = useState<string[]>([]);

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
    formData.append("inputData", data.prompt);
    formData.append("fileName", data.fileName);

    const res = await fetch("http://localhost:8000/query-n-rows", {
      method: "POST",
      body: formData,
    });

    const resJson = await res.json();
    console.log(resJson);
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
                <FormLabel htmlFor="query-n" className="mb-2">
                  Enter number of rows to retreive:
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="query-n"
                    name={field.name}
                    type="number"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="mt-3" type="submit">
            Query
          </Button>
        </form>
      </Form>
    </>
  );
}
