import { Some } from "../utils/Some";
import axios, { AxiosRequestConfig } from "axios";
import queryString from "query-string";

type Params = {
  readonly apiBaseUrl: string;
};

export function createApiClient({ apiBaseUrl }: Params) {
  const httpClient = axios.create({
    baseURL: apiBaseUrl,
    timeout: 50000,
    withCredentials: true,
  });

  const get = async <Response, QueryStringType = undefined>(
    url: string,
    data?: QueryStringType,
    config?: AxiosRequestConfig
  ) => {
    const urlToUse = Some(data) ? `${url}?${queryString.stringify(data)}` : url;
    const response = await httpClient.get<Response>(urlToUse, config);

    return response.data;
  };

  const post = async <Request, Response = undefined>(
    url: string,
    data?: Request,
    config?: AxiosRequestConfig
  ) => {
    const response = await httpClient.post<Response>(url, data, config);

    return response.data;
  };

  const patch = async <Request, Response = undefined>(
    url: string,
    data?: Request,
    config?: AxiosRequestConfig
  ) => {
    const response = await httpClient.patch<Response>(url, data, config);

    return response.data;
  };

  const deleteMethod = async <Response>(
    url: string,
    config?: AxiosRequestConfig
  ) => {
    const response = await httpClient.delete<Response>(url, config);

    return response.data;
  };

  return {
    delete: deleteMethod,
    get,
    patch,
    post,
  };
}

export const apiClient = createApiClient({
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
});
