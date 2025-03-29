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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/lib/config";

const formSchema = z.object({
  fileName: z.string().nonempty(),
  query: z.coerce.number().int().positive(),
});

export default function QueryNRows() {
  const [files, setFiles] = useState<string[]>([]);
  const [tableData, setTableData] = useState([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: "",
      query: 1,
    },
  });

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch(`${API_URL}/get-files`);
      const resJson = await res.json();
      setFiles(resJson);
    };
    fetchFiles();
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("query", data.query.toString());
    formData.append("fileName", data.fileName);

    const res = await fetch(`${API_URL}/query-n-rows`, {
      method: "POST",
      body: formData,
    });

    const resJson = await res.json();
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
            name="query"
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
