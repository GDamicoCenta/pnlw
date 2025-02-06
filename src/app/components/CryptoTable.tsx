import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import ReusableTable, { TableColumn } from "./ReusableTable";
import { formatMoney, formatPrice } from "../utils/formatMoney";
import TableSkeleton from "./TableSkeleton";
import { ServerErrorIcon } from "./error-icon";

export type CryptoData = {
  [key: string]: number | string | null | undefined;
};

export type CryptoInnerData = {
  data: CryptoData[];
  totales: {
    "Valuacion total": number;
    "PnL total": number;
    "PnL acumulado total": number;
  };
};

export type ExtraTableApiResponse = {
  success: boolean;
  data: CryptoInnerData;
  pagination: unknown;
  message?: string;
};

type CryptoTableProps = {
  hiddenColumns?: string[];
};

const fetcher = (url: string): Promise<ExtraTableApiResponse> =>
  fetch(url).then((res) => res.json());

const CryptoTable: React.FC<CryptoTableProps> = ({ hiddenColumns = [] }) => {
  const { data: extraTableData, isValidating } = useSWR<ExtraTableApiResponse>(
    "/api/market/proxy/crypto",
    fetcher,
    { refreshInterval: 1000, revalidateOnFocus: false }
  );

  const previousExtraTableData = useRef<ExtraTableApiResponse | undefined>(
    undefined
  );
  const [cellStylesExtraTable, setCellStylesExtraTable] = useState<
    Record<number, Record<string, string>>
  >({});

  useEffect(() => {
    if (extraTableData && previousExtraTableData.current) {
      const styles: Record<number, Record<string, string>> = {};
      // Ahora comparamos sobre extraTableData.data.data
      extraTableData.data.data?.forEach((row, index) => {
        const prevRow = previousExtraTableData.current?.data.data?.[index];
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
                styles[index][key] = "bg-red-700";
              }
            }
          }
        }
      });
      setCellStylesExtraTable(styles);

      const timer = setTimeout(() => {
        setCellStylesExtraTable({});
      }, 2000);
      return () => clearTimeout(timer);
    }
    previousExtraTableData.current = extraTableData;
  }, [extraTableData]);

  if (!extraTableData) return <TableSkeleton />;

  if (extraTableData.success === false) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-center">
          Tabla Crypto
        </h1>
        <div className="flex flex-col items-center justify-center bg-gray-600 text-white p-6 rounded-xl shadow-lg gap-4 w-fit">
          <ServerErrorIcon className="w-24 h-24" width={115} />
          <p className="text-lg font-semibold text-center">
            {extraTableData.message}
          </p>
        </div>
      </div>
    );
  }

  // Definimos las columnas de la tabla
  const columns: TableColumn<CryptoData>[] = [
    {
      key: "Titulo",
      header: "Titulo",
      formatter: (value: unknown) => (value ? String(value) : ""),
    },
    {
      key: "Nominales",
      header: "Nominales",
      formatter: (value: unknown) =>
        typeof value === "number"
          ? new Intl.NumberFormat("es", {
              style: "decimal",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
              signDisplay: "auto",
              useGrouping: true,
            }).format(value)
          : value
          ? String(value)
          : "",
    },
    {
      key: "Px Mercado",
      header: "Px Mercado",
      formatter: (value: unknown) =>
        typeof value === "number"
          ? formatPrice(value, "es", { maximumFractionDigits: 2 })
          : value
          ? String(value)
          : "",
    },
    {
      key: "Valuacion",
      header: "Valuacion",
      formatter: (value: unknown) =>
        typeof value === "number"
          ? formatMoney(value, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : value
          ? String(value)
          : "",
    },
    {
      key: "PnL",
      header: "PnL",
      formatter: (value: unknown) =>
        typeof value === "number"
          ? formatMoney(value, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : value
          ? String(value)
          : "",
      cellClass: (value: unknown) => {
        let cls = "";
        if (typeof value === "number") {
          if (value > 0) cls += "text-green-500 ";
          else if (value < 0) cls += "text-red-500 ";
        }
        return cls;
      },
    },
  ];

  // Filtrar columnas ocultas
  const normalizedHidden = hiddenColumns.map((h) => h.toLowerCase().trim());
  const filteredColumns = columns.filter(
    (col) => !normalizedHidden.includes(String(col.key).toLowerCase().trim())
  );

  // Renderizamos el pie de tabla utilizando los totales de la respuesta
  const renderFooter = (): React.ReactNode => (
    <tr className="font-bold text-xs sm:text-base">
      <td colSpan={3}>Totales</td>
      <td className="text-white">
        {formatMoney(extraTableData.data.totales["Valuacion total"], {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </td>
      <td
        className={
          extraTableData.data.totales["PnL total"] > 0
            ? "text-green-500"
            : extraTableData.data.totales["PnL total"] < 0
            ? "text-red-500"
            : "text-gray-500"
        }
      >
        {formatMoney(extraTableData.data.totales["PnL total"], {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </td>
    </tr>
  );

  return (
    <div className="overflow-x-auto my-4">
      <ReusableTable
        title="Tabla Crypto"
        data={extraTableData.data.data || []}
        columns={filteredColumns}
        isLoading={isValidating}
        cellStyles={cellStylesExtraTable}
        renderFooter={renderFooter}
      />
    </div>
  );
};

export default CryptoTable;
