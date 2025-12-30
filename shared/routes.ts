import { z } from "zod";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  github: {
    listRepos: {
      method: 'GET' as const,
      path: '/api/github/repos',
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.internal,
        500: errorSchemas.internal,
      },
    },
    syncRepos: {
      method: 'POST' as const,
      path: '/api/github/sync',
      responses: {
        200: z.object({ message: z.string(), count: z.number() }),
        401: errorSchemas.internal,
        500: errorSchemas.internal,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
