import QueryNRows from "../_components/query-n-rows";

export default function QueryPage() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Query Datasets</h1>
        <h2 className="text-lg font-semibold text-gray-600">
          Select which dataset and the number of rows to query!
        </h2>
        <QueryNRows />
      </div>
    </div>
  );
}
