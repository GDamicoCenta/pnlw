import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";

import ReusableTable, { TableColumn } from "./ReusableTable";
import TableSkeleton from "./TableSkeleton";
import { ServerErrorIcon } from "./error-icon";
import { formatPrice } from "../utils/formatMoney";

export type LastOrderData = {
  [key: string]: number | string | null | undefined;
};

export type LastOrdersApiResponse = {
  data: LastOrderData[];
  success?: boolean;
  message?: string;
  pagination?: unknown;
};

const fetcher = (url: string): Promise<LastOrdersApiResponse> =>
  fetch(url).then((res) => res.json());

const LastOrdersTable: React.FC = () => {
  const { data: lastOrdersResponse, isValidating } =
    useSWR<LastOrdersApiResponse>("/api/market/proxy/last", fetcher, {
      refreshInterval: 1000,
      revalidateOnFocus: false,
    });

  const previousLastOrdersData = useRef<LastOrdersApiResponse | undefined>(
    undefined
  );
  const [cellStylesLastOrders, setCellStylesLastOrders] = useState<
    Record<number, Record<string, string>>
  >({});

  useEffect(() => {
    if (
      lastOrdersResponse &&
      previousLastOrdersData.current &&
      lastOrdersResponse.data &&
      previousLastOrdersData.current.data
    ) {
      const styles: Record<number, Record<string, string>> = {};
      lastOrdersResponse.data.forEach((order, index) => {
        const prevOrder = previousLastOrdersData.current!.data![index];
        if (prevOrder) {
          for (const key in order) {
            const currentValue = order[key];
            const previousValue = prevOrder[key];
            if (
              typeof currentValue === "number" &&
              typeof previousValue === "number"
            ) {
              if (currentValue > previousValue) {
                if (!styles[index]) styles[index] = {};
                styles[index][key] = "bg-green-700";
              } else if (currentValue < previousValue) {
                if (!styles[index]) styles[index] = {};
                styles[index][key] = "bg-red-700";
              }
            }
          }
        }
      });
      setCellStylesLastOrders(styles);

      const timer = setTimeout(() => {
        setCellStylesLastOrders({});
      }, 2000);
      return () => clearTimeout(timer);
    }
    previousLastOrdersData.current = lastOrdersResponse;
  }, [lastOrdersResponse]);

  if (!lastOrdersResponse) return <TableSkeleton />;

  if (lastOrdersResponse.success === false) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-center">
          Últimas 10 órdenes
        </h1>
        <div className="flex flex-col items-center justify-center bg-gray-600 text-white p-6 rounded-xl shadow-lg gap-4 w-fit">
          <ServerErrorIcon className="w-24 h-24" width={115} />
          <p className="text-lg font-semibold text-center">
            {lastOrdersResponse.message}
          </p>
        </div>
      </div>
    );
  }

  const columns: TableColumn<LastOrderData>[] = [
    {
      key: "Ultimas 10 ordenes",
      header: "Fecha",
      formatter: (value: unknown) => (value ? String(value) : ""),
      cellClass: (value: unknown) => {
        if (typeof value === "string") {
          const date = new Date(value);
          const normalizedYesterday = date.toISOString().split("T")[0];
          return value === normalizedYesterday
            ? "text-yellow-300 font-bold"
            : "";
        }
        return "";
      },
    },
    {
      key: "TICKER",
      header: "TICKER",
      formatter: (value: unknown) => (value ? String(value) : ""),
    },
    {
      key: "VN",
      header: "V/N",
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
      cellClass: (value: unknown) =>
        typeof value === "number" && value < 0 ? "text-red-500" : "",
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
      cellClass: (value: unknown) =>
        typeof value === "number" && value < 0 ? "text-red-500" : "",
    },
  ];

  return (
    <div className="overflow-x-auto my-4">
      <ReusableTable
        title="Últimas 10 órdenes"
        data={lastOrdersResponse.data}
        columns={columns}
        isLoading={isValidating}
        cellStyles={cellStylesLastOrders}
      />
    </div>
  );
};

export default LastOrdersTable;
