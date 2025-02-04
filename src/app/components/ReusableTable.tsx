import React, { JSX } from "react";

export type TableColumn<T> = {
  key: keyof T | string;
  header: string;
  formatter?: (value: unknown, row?: T, rowIndex?: number) => React.ReactNode;
  cellClass?: (value: unknown, row?: T, rowIndex?: number) => string;
};

export type ReusableTableProps<T> = {
  title: string;
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  cellStyles?: Record<number, Record<string, string>>;
  renderFooter?: () => React.ReactNode;
  containerClass?: string;
  tableClass?: string;
};

function ReusableTable<T>({
  title,
  data,
  columns,
  isLoading = false,
  cellStyles = {},
  renderFooter,
  containerClass = "",
  tableClass = "",
}: ReusableTableProps<T>): JSX.Element {
  return (
    <div className={containerClass}>
      <div className="w-full flex mb-4  justify-center items-center">
        <h1 className="text-lg sm:text-xl font-bold text-center">{title}</h1>
        <span className="w-8 h-8 flex items-center justify-center">
          {isLoading && (
            <span className="loading loading-ring loading-md bg-green-700"></span>
          )}
        </span>
      </div>
      <div className="overflow-x-auto my-4">
        <table
          className={`table table-xs sm:table-sm max-w-7xl mx-auto ${tableClass}`}
        >
          <thead className="bg-gray-800 text-xs sm:text-sm">
            <tr>
              {columns.map((col) => (
                <th key={col.key.toString()}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => {
                  const value = row[col.key as keyof T];
                  const formattedValue: React.ReactNode = col.formatter
                    ? col.formatter(value, row, rowIndex)
                    : ((value == null
                        ? ""
                        : typeof value === "object" &&
                          !React.isValidElement(value)
                        ? JSON.stringify(value)
                        : value) as React.ReactNode);
                  const cellStyle =
                    cellStyles[rowIndex]?.[col.key as string] || "";
                  const extraClass = col.cellClass
                    ? col.cellClass(value, row, rowIndex)
                    : "";
                  return (
                    <td
                      key={col.key.toString()}
                      className={`${cellStyle} ${extraClass} text-xs sm:text-sm`}
                    >
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {renderFooter && (
            <tfoot className="bg-gray-800 font-bold text-xs sm:text-sm">
              {renderFooter()}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default ReusableTable;
