import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { googleFontsUrl } from '@printai/core'
import { AuthProvider } from '@/lib/auth'
import appCss from '../styles.css?url'

const fontsHref = googleFontsUrl()

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Matbaa — custom print studio' },
      {
        name: 'description',
        content:
          'Design and print business cards, invitations, certificates, t-shirts, tote bags and favour sachets. A modern print shop with an old press soul.',
      },
      { name: 'theme-color', content: '#f4efe6' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: fontsHref },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  shellComponent: RootDocument,
  component: () => (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
