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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  fileName: z.string().nonempty(),
  query: z.coerce.number().int().positive(),
});

export default function QueryNRows() {
  const [files, setFiles] = useState([]);
  const [tableData, setTableData] = useState([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: "",
      query: 1,
    },
  });

  const allForms = async () => {
    const res = await fetch("http://localhost:8000/get-files", {
      method: "GET",
    });

    console.log("Response is: ", res);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("query", data.query.toString());
    for (const pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    const res = await fetch("http://localhost:8000/query-n-rows", {
      method: "POST",
      body: formData,
    });

    const resJson = await res.json();
    console.log("ResJson for QueryNRows is: ", resJson);
    setTableData(resJson);
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
                <FormControl>
                  <Input {...field} id="file-name" name={field.name} />
                </FormControl>
                <FormDescription>Enter the file name to query!</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="query-n" className="mb-2">
                  Query N rows:
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="query-n"
                    name={field.name}
                    type="number"
                  />
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
          <TableCaption>Data starting from the first row:</TableCaption>
          <TableHeader>
            <TableRow>
              {Object.keys(tableData[0]).map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                {Object.values(row).map((value, index) => (
                  <TableCell key={index}>{String(value)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
