import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="kicker mb-3">404</p>
        <h1 className="text-4xl">This page fell off the press.</h1>
        <a href="/" className="btn btn-outline mt-8">Back to the shop</a>
      </main>
    ),
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
