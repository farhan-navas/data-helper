"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useEffect } from "react";

const fileSchema = z.object({
  filePath: z
    .instanceof(File)
    .refine(
      (file) =>
        [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
        ].includes(file.type),
      {
        message: "Only Excel/CSV files are supported!",
      }
    ),
});

export default function FileUpload() {
  const [filename, setFilename] = useState<string>("");

  const form = useForm<z.infer<typeof fileSchema>>({
    resolver: zodResolver(fileSchema),
  });

  const onSubmit = async (data: z.infer<typeof fileSchema>) => {
    const formData = new FormData();
    formData.append("file", data.filePath);
    // console.log("formData is: ", formData);

    const res = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    const resJson = await res.json();
    setFilename(resJson.filename);
    console.log(`ResJson is: ${resJson} Filename is: ${filename}`);
  };

  // debug code just to check and display when filename is updated
  useEffect(() => {
    if (filename) {
      console.log(`Updated filename is: ${filename}`);
    }
  }, [filename]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="filePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="file-input" className="mb-2">
                Upload here:
              </FormLabel>
              <FormControl>
                {/* Have uncontrolled input, by passing onChange handler to the prop */}
                <Input
                  id="file-input"
                  type="file"
                  onChange={(e) =>
                    field.onChange(e.target.files && e.target.files[0])
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormDescription>
                Only Excel/CSV files are supported!
              </FormDescription>
            </FormItem>
          )}
        />
        <Button className="mt-2" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
