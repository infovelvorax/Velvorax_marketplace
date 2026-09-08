import { ScrollToTop } from '../components';
import { Outlet } from 'react-router-dom'


/**
 * Foundation RootLayout
 * Provides the top-level outlet for custom or undecorated routes.
 */
export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <ScrollToTop />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout

