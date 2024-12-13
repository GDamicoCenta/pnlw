/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-nocheck

"use client";

import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "./utils/formatMoney";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Error fetching data");
  }
  return response.json();
};

export default function Home() {
  const {
    data: intradayData,
    error: intradayError,
    isValidating,
  } = useSWR("/api/market/proxy/intraday", fetcher, {
    refreshInterval: 1000,
    revalidateOnFocus: false,
  });

  const { data: lastOrdersData, error: lastOrdersError } = useSWR(
    "/api/market/proxy/last",
    fetcher,
    {
      refreshInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  const previousIntradayData = useRef(null);
  const [cellStylesIntraday, setCellStylesIntraday] = useState({});
  const previousLastOrdersData = useRef(null);
  const [cellStylesLastOrders, setCellStylesLastOrders] = useState({});

  useEffect(() => {
    if (intradayData && previousIntradayData.current) {
      const styles = {};
      intradayData.Datos.forEach((row, index) => {
        const prevRow = previousIntradayData.current?.Datos?.[index];
        if (prevRow) {
          for (const key in row) {
            if (row[key] > prevRow[key]) {
              if (!styles[index]) styles[index] = {};
              styles[index][key] = "bg-green-500";
            } else if (row[key] < prevRow[key]) {
              if (!styles[index]) styles[index] = {};
              styles[index][key] = "bg-red-700";
            }
          }
        }
      });
      setCellStylesIntraday(styles);

      // Remove styles after 2 seconds
      setTimeout(() => {
        setCellStylesIntraday({});
      }, 2000);
    }
    previousIntradayData.current = intradayData;
  }, [intradayData]);

  useEffect(() => {
    if (lastOrdersData && previousLastOrdersData.current) {
      const styles = {};
      lastOrdersData.forEach((order, index) => {
        const prevOrder = previousLastOrdersData.current?.[index];
        if (prevOrder) {
          for (const key in order) {
            if (order[key] > prevOrder[key]) {
              if (!styles[index]) styles[index] = {};
              styles[index][key] = "bg-green-500";
            } else if (order[key] < prevOrder[key]) {
              if (!styles[index]) styles[index] = {};
              styles[index][key] = "bg-red-500";
            }
          }
        }
      });
      setCellStylesLastOrders(styles);

      // Remove styles after 2 seconds
      setTimeout(() => {
        setCellStylesLastOrders({});
      }, 2000);
    }
    previousLastOrdersData.current = lastOrdersData;
  }, [lastOrdersData]);

  if (intradayError || lastOrdersError) {
    return (
      <div className="bg-gray-900 mx-auto">
        <span>Error al cargar los datos </span>
      </div>
    );
  }

  if (!intradayData || !lastOrdersData) {
    return (
      <div className="flex flex-col h-screen justify-center items-center bg-gray-900">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 gap-8 bg-gray-900 p-8 h-auto">
      {/* Primera tabla */}
      <div className="overflow-x-auto my-4">
        <table className="table table-sm max-w-7xl mx-auto">
          <thead className="bg-gray-800 text-sm">
            <tr>
              <th className="px-1 py-2">Titulo</th>
              <th className="px-1 py-2">Nominales</th>
              <th className="px-1 py-2">Px Mercado</th>
              <th className="px-1 py-2">PPC</th>
              <th className="px-1 py-2">Posi intra</th>
              <th className="px-1 py-2">PPP intra</th>
              <th className="px-1 py-2">Valuacion</th>
              <th className="px-1 py-2">PnL</th>
            </tr>
          </thead>
          <tbody>
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              intradayData.Datos.map((row: any, index: number) => (
                <tr key={index}>
                  {Object.entries(row).map(([key, value]) => (
                    <td
                      key={key}
                      className={`px-1 py-2 text-sm ${
                        cellStylesIntraday[index]?.[key]
                      } ${value < 0 ? "text-red-500" : ""}`}
                    >
                      {key === "PPC" ||
                      key === "PPP intra" ||
                      key === "Valuacion" ||
                      key === "PnL"
                        ? formatPrice(value, { maximumFractionDigits: 4 })
                        : value}
                    </td>
                  ))}
                </tr>
              ))
            }
          </tbody>
          <tfoot>
            <tr className="font-bold text-sm">
              <td colSpan={6}>Totales</td>
              <td>
                {formatPrice(intradayData["Valuacion total"], {
                  maximumFractionDigits: 4,
                })}
              </td>
              <td>
                {formatPrice(intradayData["PNL total"], {
                  maximumFractionDigits: 4,
                })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Segunda tabla */}
      <div className="w-full bg-gray-900">
        <div className="w-full flex mb-4 gap-8 justify-center items-center">
          <h1 className="text-lg sm:text-xl font-bold text-center">
            Últimas 10 ordenes
          </h1>
          <span className="w-8 h-8 flex items-center justify-center">
            {isValidating && (
              <span className="loading loading-ring loading-md bg-green-500"></span>
            )}
          </span>
        </div>
        <div className="overflow-x-auto my-4">
          <table className="table table-sm max-w-7xl mx-auto">
            <thead className="bg-gray-800 text-base">
              <tr>
                <th>Fecha</th>
                <th>TICKER</th>
                <th>V/N</th>
                <th>PX</th>
              </tr>
            </thead>
            <tbody>
              {lastOrdersData.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (order: any, index: number) => (
                  <tr key={index}>
                    {Object.entries(order).map(([key, value]) => (
                      <td
                        key={key}
                        className={`${cellStylesLastOrders[index]?.[key]} ${
                          value < 0 ? "text-red-500" : ""
                        }`}
                      >
                        {key === "PX"
                          ? formatPrice(value, { maximumFractionDigits: 4 })
                          : value}
                      </td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex max-w-7xl mx-auto flex-col">
        <div className="divider"></div>
        <div className="card bg-base-300 rounded-box grid h-20 place-items-center">
          <footer className="text-center">
            Desarrollado por Vulcan Tech ©
          </footer>
        </div>
      </div>
    </div>
  );
}
