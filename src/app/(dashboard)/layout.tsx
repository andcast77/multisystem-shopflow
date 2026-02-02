import { Sidebar } from '@/components/layout/Sidebar'
import { ShopflowModuleGuard } from '@/components/layout/ShopflowModuleGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ShopflowModuleGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-64">
          <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </ShopflowModuleGuard>
  )
}
