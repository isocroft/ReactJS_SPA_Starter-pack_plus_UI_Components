import axios, {
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

export type { AxiosError };

export interface OptionsArgs<BodyType, ParamType = any> {
  body?: BodyType;
  headers?: { [key: string]: any };
  params?: ParamType;
  isFormData?: boolean;
  [optionKey: string]: unknown;
}

export interface ServerResponse<Data> {
  data?: Data;
  meta?: {
    limit: number;
    total: number;
    page: number;
    pages: number;
  };
  status: boolean;
  message: string;
}

/**
 For axios v0.x.x & axios-mock-adapater v1.x.x 

const mock = new AxiosMockAdapter(axios);
const savedMockAdapter = axios.defaults.adapter
const originalAdapter = mock.originalAdapter;

*/

/**
 * For axios v1.x.x & axios-mock-adapater v2.x.x
 */
const originalAdapter = axios.defaults.adapter;
const axiosMock = new AxiosMockAdapter(axios);
const savedMockAdapter = axiosMock.adapter();

function toggleAxiosMockAdapter({ overwriteMock = false }) {
  if (overwriteMock) {
    if (
      process.env.NODE_ENV === "production" ||
      (process.env.NODE_ENV === "development" &&
        process.env.DEV_ENV_PATCH === "off")
    ) {
      axiosMock.restore();
    }
    return;
  }

  if (axios.defaults.adapter === originalAdapter) {
    axios.defaults.adapter = savedMockAdapter;
    /* @ts-ignore */
    toggleAxiosMock.$$mockApi = true;
  } else {
    axios.defaults.adapter = savedMockAdapter;
    /* @ts-ignore */
    toggleAxiosMock.$$mockApi = false;
  }
}

toggleAxiosMockAdapter.$$mockApi = false;
toggleAxiosMockAdapter({ overwriteMock: true });

async function axiosClientWrapper<
  ResponseType extends Record<string, any>,
  BodyType = {},
  ParamType = any
>(
  endpoint: string,
  method: "GET" | "PATCH" | "POST" | "PUT" | "DELETE" | "HEAD",
  {
    body,
    headers: customHeaders,
    params,
    ...customConfig
  }: OptionsArgs<BodyType, ParamType> = {}
): Promise<ServerResponse<ResponseType>> {
  let headers = customHeaders ? { ...customHeaders } : {};

  if (method === "POST" || method === "PUT") {
    headers = {
      ...headers,
      "Content-Type": customConfig.isFormData
        ? "multipart/form-data"
        : "application/json",
    };
  }

  const options: AxiosRequestConfig<BodyType> = {
    method,
    withCredentials: false,
    ...customConfig,
    headers: new AxiosHeaders(headers),
  };

  if (body) {
    options.data = body;
  }

  if (params) {
    options.params = params;
  }

  let axiosResponse: AxiosResponse<ServerResponse<ResponseType>> = {
    data: {
      status: false,
      message: "failure",
    },
    status: 0,
    statusText: "<unknown error>",
    headers,
    config: {
      headers: new AxiosHeaders(headers),
    },
  };

  try {
    axiosResponse = await axios(`${endpoint}`, options);

    if (axiosResponse?.data && axiosResponse?.data.status === false) {
      throw new Error("server signalled failure");
    }

    return axiosResponse?.data;
  } catch (error) {
    if (error !== undefined) {
      return Promise.reject(error);
    }
  }

  return axiosResponse?.data && axiosResponse?.data.status === false
    ? Promise.reject(new Error("server signalled failure"))
    : axiosResponse?.data;
}

export {
  axios,
  axiosMock,
  toggleAxiosMockAdapter,
  axiosClientWrapper as client,
};
