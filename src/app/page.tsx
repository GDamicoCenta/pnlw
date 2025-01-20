/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-nocheck

"use client";

import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import { formatMoney, formatPrice } from "./utils/formatMoney";

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
  console.log("intradayData", intradayData);
  const { data: lastOrdersData, error: lastOrdersError } = useSWR(
    "/api/market/proxy/last",
    fetcher,
    {
      refreshInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  const { data: extraTableData, error: extraTableError } = useSWR(
    "/api/market/proxy/crypto",
    fetcher,
    {
      refreshInterval: 1000,
      revalidateOnFocus: false,
    }
  );

  const { data: pendingData, error: pendingDataError } = useSWR(
    "/api/market/proxy/pendientes",
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
  const previousExtraTableData = useRef(null);
  const [cellStylesExtraTable, setCellStylesExtraTable] = useState({});
  const previousPendingData = useRef(null);
  const [cellStylesPendingTable, setCellStylesPendingTable] = useState({});

  useEffect(() => {
    if (intradayData && previousIntradayData.current) {
      const styles = {};
      intradayData.Datos.forEach((row, index) => {
        const prevRow = previousIntradayData.current?.Datos?.[index];
        if (prevRow) {
          for (const key in row) {
            if (row[key] > prevRow[key]) {
              if (!styles[index]) styles[index] = {};
              styles[index][key] = "bg-green-700";
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
              styles[index][key] = "bg-green-700";
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

  useEffect(() => {
    if (extraTableData && previousExtraTableData.current) {
      const styles = {};
      extraTableData.Datos.forEach((row, index) => {
        const prevRow = previousExtraTableData.current?.Datos?.[index];
        if (prevRow) {
          for (const key in row) {
            if (row[key] > prevRow[key]) {
              if (!styles[index]) styles[index] = {};
              styles[index][key] = "bg-green-700";
            } else if (row[key] < prevRow[key]) {
              if (!styles[index]) styles[index] = {};
              styles[index][key] = "bg-red-700";
            }
          }
        }
      });
      setCellStylesExtraTable(styles);

      // Remove styles after 2 seconds
      setTimeout(() => {
        setCellStylesExtraTable({});
      }, 2000);
    }
    previousExtraTableData.current = extraTableData;
  }, [extraTableData]);

  useEffect(() => {
    if (pendingData && previousPendingData.current) {
      const styles = {};
      pendingData.forEach((row, index) => {
        const prevRow = previousPendingData.current?.[index];
        if (prevRow) {
          for (const key in row) {
            if (row[key] > prevRow[key]) {
              if (!styles[index]) styles[index] = {};
              styles[index][key] = "bg-green-700";
            } else if (row[key] < prevRow[key]) {
              if (!styles[index]) styles[index] = {};
              styles[index][key] = "bg-red-700";
            }
          }
        }
      });
      setCellStylesPendingTable(styles);

      // Remove styles after 2 seconds
      setTimeout(() => {
        setCellStylesPendingTable({});
      }, 2000);
    }
    previousPendingData.current = pendingData;
  }, [pendingData]);

  if (intradayError || lastOrdersError || extraTableError || pendingDataError) {
    return (
      <div className="bg-gray-900 mx-auto">
        <span>Error al cargar los datos </span>
      </div>
    );
  }

  if (!intradayData || !lastOrdersData || !extraTableData || !pendingData) {
    return (
      <div className="flex flex-col h-screen justify-center items-center bg-gray-900">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 gap-8 bg-gray-900 p-2 sm:p-8 h-auto">
      {/* Primera tabla */}
      <div className="overflow-x-auto my-4">
        <div className="w-full flex mb-4 gap-8 justify-center items-center">
          <h1 className="text-lg sm:text-xl font-bold text-center">
            Estado del mercado: {intradayData["Estado del mercado"]}
          </h1>
          <span className="w-8 h-8 flex items-center justify-center">
            {isValidating && (
              <span className="loading loading-ring loading-md bg-green-700"></span>
            )}
          </span>
        </div>
        <table className="table table-sm max-w-7xl mx-auto">
          <thead className="bg-gray-800 text-sm">
            <tr>
              <th className="">Titulo</th>
              <th className="">Nominales</th>
              <th className="">Px Mercado</th>
              <th className="">PPC</th>
              <th className="">Posi intra</th>
              <th className="">PPP intra</th>
              <th className="">Valuacion</th>
              <th className="">PnL</th>
              <th className="">PnL acumulado</th>
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
                      className={`text-sm ${cellStylesIntraday[index]?.[key]} ${
                        key === "PnL" || key === "PnL-acumulado"
                          ? value > 0
                            ? "text-green-500"
                            : value < 0
                            ? "text-red-500"
                            : ""
                          : ""
                      } ${key === "PnL" ? "border-r border-gray-500" : ""}`}
                    >
                      {key === "PPP1" ||
                      key === "Px Mercado" ||
                      key === "PPP intra" ||
                      key === "PPP2"
                        ? formatPrice(value, "es", { maximumFractionDigits: 2 })
                        : key === "Valuacion" ||
                          key === "PnL" ||
                          key === "PnL-acumulado"
                        ? formatMoney(value, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })
                        : key === "Nominales" || key === "Intraday"
                        ? new Intl.NumberFormat("es", {
                            style: "decimal",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                            signDisplay: "auto",
                            useGrouping: true,
                          }).format(value)
                        : value}
                    </td>
                  ))}
                </tr>
              ))
            }
          </tbody>
          <tfoot className="bg-gray-800">
            <tr className="font-bold text-base">
              <td colSpan={6}>Totales</td>
              <td className={`text-white`}>
                {formatMoney(intradayData["Valuacion total"], {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </td>
              <td
                className={`${
                  Number(intradayData["PNL total"]) > 0
                    ? "text-green-500"
                    : Number(intradayData["PNL total"]) < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formatMoney(intradayData["PNL total"], {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </td>
              <td
                className={`${
                  Number(intradayData["PNL-acumulado-total"]) > 0
                    ? "text-green-500"
                    : Number(intradayData["PNL-acumulado-total"]) < 0
                    ? "text-red-500"
                    : "white"
                }`}
              >
                {formatMoney(intradayData["PNL-acumulado-total"], {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
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
              <span className="loading loading-ring loading-md bg-green-700"></span>
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
                    {Object.entries(order).map(([key, value]) => {
                      const today = new Date();

                      const normalizedToday = today.toISOString().split("T")[0];
                      const normalizedValue =
                        key === "Ultimas 10 ordenes" ? value : null;

                      console.log("normalizedToday", normalizedToday);
                      console.log("normalizedValue", normalizedValue);

                      const isToday =
                        key === "Ultimas 10 ordenes" &&
                        normalizedValue === normalizedToday;

                      return (
                        <td
                          key={key}
                          className={`${cellStylesLastOrders[index]?.[key]} ${
                            value < 0 ? "text-red-500" : ""
                          } ${
                            isToday
                              ? "bg-yellow-300 text-gray-900 font-bold"
                              : ""
                          }`}
                        >
                          {key === "PX"
                            ? formatPrice(value, { maximumFractionDigits: 2 })
                            : key === "VN"
                            ? new Intl.NumberFormat("es", {
                                style: "decimal",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                                signDisplay: "auto",
                              }).format(value)
                            : value}
                        </td>
                      );
                    })}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tercera tabla */}
      <div className="overflow-x-auto my-4">
        <div className="w-full flex mb-4 gap-8 justify-center items-center">
          <h1 className="text-lg sm:text-xl font-bold text-center">
            Tabla Crypto
          </h1>
          <span className="w-8 h-8 flex items-center justify-center">
            {isValidating && (
              <span className="loading loading-ring loading-md bg-green-700"></span>
            )}
          </span>
        </div>
        <table className="table table-sm max-w-7xl mx-auto">
          <thead className="bg-gray-800 text-sm">
            <tr>
              <th className="">Titulo</th>
              <th className="">Nominales</th>
              <th className="">Px Mercado</th>
              <th className="">PPC</th>
              <th className="">Intraday</th>
              <th className="">PPP</th>
              <th className="">Valuacion</th>
              <th className="">PnL</th>
              <th className="">PnL acumulado</th>
            </tr>
          </thead>
          <tbody>
            {extraTableData.Datos.map((row, index) => (
              <tr key={index}>
                {Object.entries(row).map(([key, value]) => (
                  <td
                    key={key}
                    className={`text-sm ${cellStylesExtraTable[index]?.[key]} ${
                      key === "PnL" || key === "PnL-acumulado"
                        ? value > 0
                          ? "text-green-500"
                          : value < 0
                          ? "text-red-500"
                          : ""
                        : ""
                    } ${key === "PnL" ? "border-r border-gray-500" : ""}`}
                  >
                    {key === "Px Mercado" || key === "PPP1" || key === "PPP2"
                      ? formatPrice(value, { maximumFractionDigits: 2 })
                      : key === "Valuacion" ||
                        key === "PnL" ||
                        key === "PnL-acumulado"
                      ? formatMoney(value, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      : key === "Nominales" || key === "Intraday"
                      ? new Intl.NumberFormat("es", {
                          style: "decimal",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                          signDisplay: "auto",
                          useGrouping: true,
                        }).format(value)
                      : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-800">
            <tr className="font-bold text-base">
              <td colSpan={6}>Totales</td>
              <td className={`text-white`}>
                {formatMoney(extraTableData["Valuacion total"], {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </td>
              <td
                className={`${
                  Number(extraTableData["PNL total"]) > 0
                    ? "text-green-500"
                    : Number(extraTableData["PNL total"]) < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formatMoney(extraTableData["PNL total"], {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </td>
              <td
                className={`${
                  Number(extraTableData["PNL-acumulado-total"]) > 0
                    ? "text-green-500"
                    : Number(extraTableData["PNL-acumulado-total"]) < 0
                    ? "text-red-500"
                    : "text-white"
                }`}
              >
                {formatMoney(extraTableData["PNL-acumulado-total"], {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Cuarta tabla */}
      <div className="overflow-x-auto my-4">
        <div className="w-full flex mb-4 gap-8 justify-center items-center">
          <h1 className="text-lg sm:text-xl font-bold text-center">
            Tabla de pendientes
          </h1>
          <span className="w-8 h-8 flex items-center justify-center">
            {isValidating && (
              <span className="loading loading-ring loading-md bg-green-700"></span>
            )}
          </span>
        </div>
        <table className="table table-sm max-w-7xl mx-auto">
          <thead className="bg-gray-800 text-sm">
            <tr>
              <th className="">Ticker</th>
              <th className="">TIPO</th>
              <th className="">VN</th>
              <th className="">PX</th>
            </tr>
          </thead>
          <tbody>
            {pendingData.map((row, index) => (
              <tr key={index}>
                {Object.entries(row).map(([key, value]) => (
                  <td
                    key={key}
                    className={` text-sm ${
                      cellStylesPendingTable[index]?.[key]
                    } ${value < 0 ? "text-red-500" : ""}`}
                  >
                    {key === "PX"
                      ? formatPrice(value, { maximumFractionDigits: 2 })
                      : key === "VN"
                      ? new Intl.NumberFormat("es", {
                          style: "decimal",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                          signDisplay: "auto",
                        }).format(value)
                      : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
