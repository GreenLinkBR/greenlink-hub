/**
 * Placeholder para chamadas HTTP futuras.
 * Por enquanto, apenas um wrapper que pode ser expandido com axios/fetch + baseUrl.
 */
export const http = {
  get: async <T>(url: string): Promise<T> => {
    console.log(`GET ${url}`);
    throw new Error("Not implemented - use mock services for now");
  },
  post: async <TResponse, TBody = unknown>(url: string, data?: TBody): Promise<TResponse> => {
    console.log(`POST ${url}`, data);
    throw new Error("Not implemented - use mock services for now");
  },
  patch: async <TResponse, TBody = unknown>(url: string, data?: TBody): Promise<TResponse> => {
    console.log(`PATCH ${url}`, data);
    throw new Error("Not implemented - use mock services for now");
  },
  delete: async <T>(url: string): Promise<T> => {
    console.log(`DELETE ${url}`);
    throw new Error("Not implemented - use mock services for now");
  },
};
