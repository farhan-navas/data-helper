"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  query: z.number().int().positive(),
});

export default function QueryNRows() {
  const [tableData, setTableData] = useState([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: 1,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("queryN", data.query.toString());
    const res = await fetch("http://localhost:8000/query-n-rows", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const resJson = await res.json();
    console.log("ResJson is: ", resJson);
    setTableData(resJson);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="query"
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
      {tableData.length > 0 && (
        <Table>
          <TableCaption>Data starting from the first row</TableCaption>
          <TableHeader>
            <TableRow>
              {Object.keys(tableData[0]).map((key) => (
                <TableHeader key={key}>{key}</TableHeader>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                {Object.values(row).map((value, index) => (
                  <TableCell key={index}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
