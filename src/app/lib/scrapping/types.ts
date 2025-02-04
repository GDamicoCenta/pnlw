export type ScrappingApiSuccess<T extends object | null> = {
  success: true;
  message: string;
  data: T;
};

export type ScrappingFailure = {
  success: false;
  message: string;
  data: string | null;
  errors:
    | {
        code: string;
        message: string;
      }[]
    | null;
};

export type ScrappingApiResponse<T extends object | null> =
  | ScrappingFailure
  | ScrappingApiSuccess<T>;

export type IntradayItem = {
  Titulo: string | number;
  Nominales: string | number;
  "Px Mercado": string | number;
  PPP1: string | number;
  Intraday: string | number;
  PPP2: string | number;
  Valuacion: string | number;
  PnL: string | number;
  "PnL-acumulado": "";
};

export type GetIntradayResponse = ScrappingApiResponse<IntradayItem>;
