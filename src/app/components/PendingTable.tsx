// PendingTable.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import ReusableTable, { TableColumn } from "./ReusableTable";
import { formatPrice } from "../utils/formatMoney";
import TableSkeleton from "./TableSkeleton";
import { ServerErrorIcon } from "./error-icon";

export type PendingData = {
  [key: string]: number | string | null | undefined;
};

export type PendingApiResponse = {
  data?: PendingData[];
  success?: boolean;
  message?: string;
  [key: string]: unknown;
};

const fetcher = (url: string): Promise<PendingApiResponse> =>
  fetch(url).then((res) => res.json());

const PendingTable: React.FC = () => {
  const { data: pendingResponse, isValidating } = useSWR<PendingApiResponse>(
    "/api/market/proxy/pendientes",
    fetcher,
    {
      refreshInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  const [cellStylesPendingTable, setCellStylesPendingTable] = useState<
    Record<number, Record<string, string>>
  >({});
  const previousPendingResponse = useRef<PendingApiResponse | undefined>(
    undefined
  );

  useEffect(() => {
    if (
      pendingResponse &&
      previousPendingResponse.current &&
      pendingResponse.data &&
      previousPendingResponse.current.data
    ) {
      const styles: Record<number, Record<string, string>> = {};
      pendingResponse.data.forEach((row, index) => {
        const prevRow = previousPendingResponse.current!.data![index];
        if (prevRow) {
          for (const key in row) {
            const currentValue = row[key];
            const previousValue = prevRow[key];
            if (
              typeof currentValue === "number" &&
              typeof previousValue === "number"
            ) {
              if (currentValue > previousValue) {
                if (!styles[index]) styles[index] = {};
                styles[index][key] = "bg-green-700";
              } else if (currentValue < previousValue) {
                if (!styles[index]) styles[index] = {};
                styles[index][key] = "bg-red-500";
              }
            }
          }
        }
      });
      setCellStylesPendingTable(styles);

      const timer = setTimeout(() => {
        setCellStylesPendingTable({});
      }, 2000);
      return () => clearTimeout(timer);
    }
    previousPendingResponse.current = pendingResponse;
  }, [pendingResponse]);

  if (!pendingResponse) return <TableSkeleton />;

  if (pendingResponse.success === false) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-center">
          Tabla de pendientes
        </h1>
        <div className="flex flex-col items-center justify-center bg-gray-600 text-white p-6 rounded-xl shadow-lg gap-4 w-fit">
          <ServerErrorIcon className="w-24 h-24" width={115} />
          <p className="text-lg font-semibold text-center">
            {pendingResponse.message}
          </p>
        </div>
      </div>
    );
  }

  const columns: TableColumn<PendingData>[] = [
    {
      key: "Ticker",
      header: "Ticker",
      formatter: (value: unknown) => (value ? String(value) : ""),
    },
    {
      key: "TIPO",
      header: "TIPO",
      formatter: (value: unknown) => (value ? String(value) : ""),
    },
    {
      key: "VN",
      header: "VN",
      formatter: (value: unknown) =>
        typeof value === "number"
          ? new Intl.NumberFormat("es", {
              style: "decimal",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              signDisplay: "auto",
            }).format(value)
          : value
          ? String(value)
          : "",
    },
    {
      key: "PX",
      header: "PX",
      formatter: (value: unknown) =>
        typeof value === "number"
          ? formatPrice(value, "es", { maximumFractionDigits: 2 })
          : value
          ? String(value)
          : "",
    },
  ];

  return (
    <div className="overflow-x-auto my-4">
      <ReusableTable
        title="Tabla de pendientes"
        data={pendingResponse.data || []}
        columns={columns}
        isLoading={isValidating}
        cellStyles={cellStylesPendingTable}
      />
    </div>
  );
};

export default PendingTable;
