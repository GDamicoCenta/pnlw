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
