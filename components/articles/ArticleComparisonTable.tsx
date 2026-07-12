export type ArticleTableData = {
  headers: string[];
  rows: string[][];
};

export default function ArticleComparisonTable({ table }: { table: ArticleTableData }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-600">
        横にスクロールして比較できます
      </p>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-[720px] text-xs md:text-sm">
          <thead>
            <tr>
              {table.headers.map((header, index) => (
                <th
                  key={header}
                  className={`bg-gray-50 px-3 py-3 text-left font-semibold text-gray-900 ${
                    index === 0 ? "sticky left-0 z-10" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`${row.join("-")}-${rowIndex}`} className="border-t border-gray-200">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${cell}-${cellIndex}`}
                    className={
                      cellIndex === 0
                        ? "sticky left-0 bg-white px-3 py-3 font-bold text-gray-900"
                        : "px-3 py-3 font-medium leading-6 text-gray-700"
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
