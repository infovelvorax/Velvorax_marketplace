import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MainLayout, AuthLayout, DashboardLayout, RootLayout } from '../layouts'
import { ErrorBoundary } from '../components/common/ErrorBoundary/ErrorBoundary'
import { routesConfig } from './routes.config.jsx'

/**
 * Group routes according to their configured layout
 */
const mainRoutes = routesConfig
  .filter((r) => !r.layout || r.layout === 'main')
  .map((r) => ({
    path: r.index ? undefined : r.path,
    index: r.index,
    element: r.element,
  }))

const authRoutes = routesConfig
  .filter((r) => r.layout === 'auth')
  .map((r) => ({
    path: r.path,
    element: r.element,
  }))

const dashboardRoutes = routesConfig
  .filter((r) => r.layout === 'dashboard')
  .map((r) => ({
    path: r.path,
    element: r.element,
  }))

const customRoutes = routesConfig
  .filter((r) => r.layout === 'none')
  .map((r) => ({
    path: r.path,
    element: r.element,
  }))

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: mainRoutes,
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: authRoutes,
  },
  {
    element: <DashboardLayout />,
    errorElement: <ErrorBoundary />,
    children: dashboardRoutes,
  },
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: customRoutes,
  },
])


/**
 * Main AppRoutes provider
 */
export default function AppRoutes() {
  return <RouterProvider router={router} />
}
