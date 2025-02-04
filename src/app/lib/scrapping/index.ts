import { superFetch } from "..";
import { GetIntradayResponse } from "./types";

export const getScrapingFetch = async (): Promise<
  ReturnType<typeof superFetch>
> => {
  return superFetch(`http://50.17.242.174:8125`);
};

export const getIntradayResponse = async (): Promise<GetIntradayResponse> => {
  const scrapingFetch = await getScrapingFetch();

  try {
    const response = await scrapingFetch({
      method: "GET",
      path: "/get_data_intraday",
      cache: "no-store",
    });

    const data = (await response.json()) as GetIntradayResponse;

    return data;
  } catch (error) {
    console.log("getEuroClearContrapartes error", error);
    return {
      success: false,
      data: "",
      message: "Error al obtener contrapartes",
      errors: [],
    };
  }
};
