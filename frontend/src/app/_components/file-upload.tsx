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

const formSchema = z.object({
  filePath: z.string().nonempty(),
});

export default function FileUpload({
  setFilename,
}: {
  setFilename: (filename: string) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filePath: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const res = await fetch("http://localhost:8000/upload_file", {
      method: "POST",
      body: data.filePath,
    });

    const resJson = await res.json();
    setFilename(resJson.filename);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="filePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name} className="mb-2">
                Upload here:
              </FormLabel>
              <FormControl>
                <Input {...field} type="file" />
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
