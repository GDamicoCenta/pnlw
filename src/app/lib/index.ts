type HTTP_METHOD = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type FetchOpts<BODY extends undefined | object = undefined> = {
  path: string;
  method: HTTP_METHOD;
  headers?: HeadersInit;
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
  signal?: AbortSignal;
} & (BODY extends object
  ? {
      body: BODY;
    }
  : {
      body?: undefined;
    });

export const superFetch =
  (baseUrl: string) =>
  async <T extends undefined | object = undefined>({
    path,
    cache = "no-store",
    headers = {},
    next = {},
    body,
    signal,
    ...opts
  }: FetchOpts<T>): Promise<Response> => {
    const endpoint = baseUrl + path;
    console.log("ep", endpoint);

    try {
      const result = await fetch(endpoint, {
        ...opts,

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...headers,
        },

        ...(body
          ? {
              body:
                body instanceof URLSearchParams ? body : JSON.stringify(body),
            }
          : {}),

        ...next,

        cache,

        signal,
      });

      return result;
    } catch (error) {
      console.log("Error on fetching: ", endpoint, { error });
      throw new Error("Servidor no disponible");
    }
  };

type Datos = {
  Titulo: string;
  Nominales: number;
  "Px Mercado": number | string;
  PPC: number | string;
  "Posi intra": string;
  "PPP intra": string;
  Valuacion: number;
  PnL: number;
};

type GetIntradayResponse = {
  "Estado del mercado": string;
  "Valuacion total": number;
  "PNL total": number;
  Datos: Datos[];
};

export const getOperationById = async (): Promise<
  GetIntradayResponse | { success: false; message: string }
> => {
  try {
    const excelFetch = superFetch("http://50.17.242.174:8122");

    const response = await excelFetch({
      method: "GET",
      path: "/get_data_intraday",
      cache: "no-store",
    });

    const data = (await response.json()) as GetIntradayResponse;

    return data;
  } catch (error) {
    console.error("Error fetching operation by id:", error);
    return {
      success: false,
      message: "Error fetching operation by id",
    };
  }
};

/* export const getLast = async (
  id: string
): Promise<MAEOperationsApiResponse<{}>> => {
  try {
    const excelFetch = superFetch("http://50.17.242.174:8122");

    const response = await excelFetch({
      method: "GET",
      path: "/get_data_intraday",
      cache: "no-store",
    });
    const data =
      (await response.json()) as MAEOperationsApiResponse<MAEOperation>;
    return data;
  } catch (error) {
    return {
      success: false,
      message: "Error fetching operation by id",
    };
  }
}; */
