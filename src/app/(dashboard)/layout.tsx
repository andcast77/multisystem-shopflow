import { Sidebar } from '@/components/layout/Sidebar'
import { ShopflowModuleGuard } from '@/components/layout/ShopflowModuleGuard'
import { CompanyContextBootstrap } from '@/components/providers/CompanyContextBootstrap'
import { StoreProvider } from '@/components/providers/StoreContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ShopflowModuleGuard>
      <CompanyContextBootstrap>
        <StoreProvider>
          <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="lg:pl-64">
              <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
            </div>
          </div>
        </StoreProvider>
      </CompanyContextBootstrap>
    </ShopflowModuleGuard>
  )
}
