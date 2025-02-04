export const isEmpty = (argument: any): boolean => {
  return argument === null || argument === undefined || argument === "";
};

type ServerActionError = {
  error: string;
};

export type ServerActionResponse<T> = T | ServerActionError;

export const isServerActionError = (
  response: ServerActionResponse<unknown>
): response is ServerActionError => {
  return !isEmpty((response as ServerActionError).error);
};

export type FileBlobOrError = Blob | { error: string };
