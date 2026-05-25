import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path.startsWith('/api') || path.startsWith('/_astro') || path.startsWith('/favicon')) {
    return next();
  }

  return next();
});
