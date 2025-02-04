import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import ReusableTable, { TableColumn } from "./ReusableTable";
import { formatMoney, formatPrice } from "../utils/formatMoney";
import { ServerErrorIcon } from "./error-icon";
import TableSkeleton from "./TableSkeleton";

export type IntradayData = {
  [key: string]: number | string | null | undefined;
};

export type IntradayApiResponse = {
  data?: IntradayData[];
  success?: boolean;
  message?: string;
  errors?: {
    code: string;
    message: string;
  }[];
  [key: string]: unknown;
};

type IntradayTableProps = {
  hiddenColumns?: string[];
};

const fetcher = (url: string): Promise<IntradayApiResponse> =>
  fetch(url).then((res) => res.json());

const IntradayTable: React.FC<IntradayTableProps> = ({
  hiddenColumns = [],
}) => {
  const { data: intradayData, isValidating } = useSWR<IntradayApiResponse>(
    "/api/market/proxy/intraday",
    fetcher,
    {
      refreshInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  const previousIntradayData = useRef<IntradayApiResponse | undefined>(
    undefined
  );
  const [cellStylesIntraday, setCellStylesIntraday] = useState<
    Record<number, Record<string, string>>
  >({});

  useEffect(() => {
    if (
      intradayData &&
      previousIntradayData.current &&
      intradayData.data &&
      previousIntradayData.current.data
    ) {
      const styles: Record<number, Record<string, string>> = {};
      intradayData.data.forEach((row, index) => {
        const prevRow = previousIntradayData.current?.data?.[index];
        if (prevRow) {
          for (const key in row) {
            const currentValue = row[key];
            const previousValue = prevRow[key];
            // Solo comparamos valores numéricos
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
      setCellStylesIntraday(styles);

      const timer = setTimeout(() => {
        setCellStylesIntraday({});
      }, 2000);
      return () => clearTimeout(timer);
    }
    previousIntradayData.current = intradayData;
  }, [intradayData]);

  if (!intradayData) return <TableSkeleton />;

  if (intradayData?.success === false) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-center">
          Estado del mercado
        </h1>
        <div className="flex flex-col items-center justify-center bg-gray-600 text-white p-6 rounded-xl shadow-lg gap-4 w-fit">
          <ServerErrorIcon className="w-24 h-24" width={115} />
          <p className="text-lg font-semibold text-center">
            {intradayData.message}
          </p>
        </div>
      </div>
    );
  }

  const columns: TableColumn<IntradayData>[] = Object.keys(
    intradayData.data && intradayData.data[0] ? intradayData.data[0] : {}
  )
    .filter((key) => {
      const normalizedKey = key.toLowerCase().trim();
      const normalizedHidden = hiddenColumns.map((h) => h.toLowerCase().trim());
      return !normalizedHidden.includes(normalizedKey);
    })
    .map((key) => {
      let formatter:
        | ((
            value: unknown,
            row?: IntradayData,
            rowIndex?: number
          ) => React.ReactNode)
        | undefined;

      if (key === "Px Mercado" || key === "PPP intra") {
        formatter = (value: unknown) =>
          formatPrice(value as number, "es", { maximumFractionDigits: 2 });
      } else if (key === "Valuacion" || key === "PnL") {
        formatter = (value: unknown) =>
          formatMoney(value as number, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
      } else if (key === "Nominales") {
        formatter = (value: unknown) =>
          new Intl.NumberFormat("es", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            signDisplay: "auto",
            useGrouping: true,
          }).format(value as number);
      }

      const cellClass = (value: unknown): string => {
        if (key === "PnL" && typeof value === "number") {
          if (value > 0) return "text-green-500";
          if (value < 0) return "text-red-500";
        }
        return "";
      };

      return {
        key,
        header: key,
        formatter,
        cellClass,
      };
    });

  const renderFooter = (): React.ReactNode => (
    <tr className="font-bold text-xs sm:text-base">
      <td colSpan={3}>Totales</td>
      <td className="text-white">
        {formatMoney(intradayData["Valuacion total"] as number, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </td>
      <td
        className={
          (intradayData["PNL total"] as number) > 0
            ? "text-green-500"
            : (intradayData["PNL total"] as number) < 0
            ? "text-red-500"
            : "text-gray-500"
        }
      >
        {formatMoney(intradayData["PNL total"] as number, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </td>
    </tr>
  );

  const title = `Intraday`;

  return (
    <ReusableTable
      title={title}
      data={intradayData.data || []}
      columns={columns}
      isLoading={isValidating}
      cellStyles={cellStylesIntraday}
      renderFooter={renderFooter}
    />
  );
};

export default IntradayTable;
