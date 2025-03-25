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
  fileName: z.string().nonempty(),
  queryN: z.number().int().positive(),
});

export default function QueryNRows() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: "",
      queryN: 1,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const res = await fetch("http://localhost:8000/query_n_rows", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const resJson = await res.json();
    console.log(resJson);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="queryN"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name} className="mb-2">
                Query N rows:
              </FormLabel>
              <FormControl>
                <Input {...field} id={field.name} type="number" />
              </FormControl>
              <FormDescription>
                Enter the number of rows to query!
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit">Query</Button>
      </form>
    </Form>
  );
}
