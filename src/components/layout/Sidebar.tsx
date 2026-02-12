'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useModuleAccess } from '@/hooks/usePermissions'
import { useUser } from '@/hooks/useUser'
import { useCompanies } from '@/hooks/useCompanies'
import { useStoreContextOptional } from '@/components/providers/StoreContext'
import { authApi } from '@/lib/api/client'
import { Module } from '@/lib/permissions'
import {
  LayoutDashboard,
  ShoppingCart,
  Gift,
  Store,
  MapPin,
  Package,
  Users,
  Warehouse,
  Truck,
  UserCog,
  Settings,
  HardDrive,
  BarChart,
  Tags,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  module?: Module
  badge?: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

// Navigation groups - Only add routes that actually exist!
// See docs/guides/04-routes-organization.md for instructions on adding new routes
const navGroups: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        // No module = always visible
      },
      {
        title: 'Punto de Venta',
        href: '/pos',
        icon: ShoppingCart,
        module: Module.SALES,
      },
    ],
  },
  {
    title: 'Gestión',
    items: [
      {
        title: 'Productos',
        href: '/products',
        icon: Package,
        module: Module.PRODUCTS,
      },
      {
        title: 'Categorías',
        href: '/categories',
        icon: Tags,
        module: Module.CATEGORIES,
      },
      {
        title: 'Inventario',
        href: '/inventory',
        icon: Warehouse,
        module: Module.INVENTORY,
      },
      {
        title: 'Reportes',
        href: '/reports',
        icon: BarChart,
        module: Module.REPORTS,
      },
    ],
  },
  {
    title: 'Administración',
    items: [
      {
        title: 'Clientes',
        href: '/customers',
        icon: Users,
        module: Module.CUSTOMERS,
      },
      {
        title: 'Proveedores',
        href: '/suppliers',
        icon: Truck,
        module: Module.SUPPLIERS,
      },
      {
        title: 'Usuarios',
        href: '/admin/users',
        icon: UserCog,
        module: Module.USERS,
      },
      {
        title: 'Configuración',
        href: '/admin/settings',
        icon: Settings,
        module: Module.STORE_CONFIG,
      },
      {
        title: 'Lealtad',
        href: '/admin/loyalty',
        icon: Gift,
        module: Module.LOYALTY,
      },
    ],
  },
  {
    title: 'Avanzado',
    items: [
      {
        title: 'Copias de Seguridad',
        href: '/admin/backup',
        icon: HardDrive,
        module: Module.STORE_CONFIG,
      },
    ],
  },
]

// Component for individual nav item with permission check
function NavItemComponent({ item, pathname, onNavigate }: { 
  item: NavItem
  pathname: string
  onNavigate: () => void
}) {
  // Always call hooks unconditionally (React rules)
  // Use a default module (REPORTS) when no module is specified
  // Reports access is typically granted to most users, but we'll check it anyway
  const moduleToCheck = item.module ?? Module.REPORTS
  const moduleAccess = useModuleAccess(moduleToCheck)
  // If no module is specified, item is always visible (we use REPORTS as default but ignore result)
  const hasAccess = item.module ? moduleAccess : true

  if (!hasAccess) {
    return null
  }

  const Icon = item.icon
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isActive
          ? 'bg-gray-100 text-gray-900 font-semibold'
          : 'text-gray-600 hover:text-gray-900'
      )}
    >
      <Icon className={cn(
        'h-5 w-5 flex-shrink-0',
        isActive ? 'text-gray-900' : 'text-gray-500'
      )} />
      <span>{item.title}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function IconNavItem({ item, pathname, onNavigate }: { 
  item: NavItem
  pathname: string
  onNavigate: () => void
}) {
  const moduleToCheck = item.module ?? Module.REPORTS
  const moduleAccess = useModuleAccess(moduleToCheck)
  const hasAccess = item.module ? moduleAccess : true

  if (!hasAccess) {
    return null
  }

  const Icon = item.icon
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      title={item.title}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
        isActive
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100'
      )}
    >
      <Icon className="h-5 w-5" />
    </Link>
  )
}

// Component for navigation group
function NavGroupComponent({ group, pathname, onNavigate }: {
  group: NavGroup
  pathname: string
  onNavigate: () => void
}) {
  // Filter items by permissions
  const visibleItems = group.items.filter((item) => {
    if (!item.module) return true
    const moduleToCheck = item.module ?? Module.REPORTS
    const moduleAccess = useModuleAccess(moduleToCheck)
    return item.module ? moduleAccess : true
  })

  // Don't render group if no items are visible
  if (visibleItems.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {group.title}
        </h3>
      </div>
      <div className="space-y-1">
        {visibleItems.map((item) => (
          <NavItemComponent
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  )
}

// Component for user avatar
function UserAvatar({ name }: { name?: string }) {
  const safeName = typeof name === 'string' ? name : ''
  const initials =
    safeName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
      {initials}
    </div>
  )
}

// Component for role badge
function RoleBadge({ role }: { role: string }) {
  const roleColors: Record<string, { bg: string; text: string }> = {
    ADMIN: { bg: 'bg-blue-100', text: 'text-blue-800' },
    SUPERVISOR: { bg: 'bg-green-100', text: 'text-green-800' },
    CASHIER: { bg: 'bg-gray-100', text: 'text-gray-800' },
  }

  const colors = roleColors[role] || roleColors.CASHIER

  return (
    <Badge variant="outline" className={cn('text-xs', colors.bg, colors.text)}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </Badge>
  )
}

const COMPANY_SELECT_PLACEHOLDER = '__none__'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días
function setTokenCookie(token: string) {
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

/** Query keys that depend on company; invalidate on company change (not currentUser). */
const COMPANY_DATA_QUERY_KEYS = [
  ['products'], ['sales'], ['customers'], ['categories'], ['suppliers'],
  ['store-config'], ['ticket-config'], ['reports'], ['inventory'],
  ['companyMembers'], ['backups'], ['loyalty'], ['user-preferences'],
] as const

export function Sidebar() {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const autoSelectFirstDone = useRef(false)
  const isChangingCompany = useRef(false)
  const { data: user, isLoading: isLoadingUser } = useUser()
  const isSuperuser = user?.isSuperuser === true
  const companiesQuery = useCompanies(true)
  const allCompanies = companiesQuery.data ?? []
  const companies =
    isSuperuser ? allCompanies : allCompanies.filter((c) => c.shopflowEnabled)
  const needCompanySelector =
    !!user &&
    (isSuperuser || !user.companyId || companies.length > 1)
  const storeContext = useStoreContextOptional()

  // Auto-select first company when user has no companyId and no preferredCompanyId
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      autoSelectFirstDone.current ||
      !user ||
      user.companyId ||
      user.preferredCompanyId
    )
      return
    if (!companiesQuery.isSuccess || !companies.length) return
    autoSelectFirstDone.current = true
    const firstId = companies[0].id
    authApi
      .post<{
        success?: boolean
        data?: { token: string; companyId?: string; company?: { id: string; name: string; workifyEnabled: boolean; shopflowEnabled: boolean } }
        error?: string
      }>('/context', { companyId: firstId })
      .then((res) => {
        if (
          res &&
          typeof res === 'object' &&
          'data' in res &&
          res.success &&
          res.data?.token
        ) {
          setTokenCookie(res.data.token)
          const newCompanyId = res.data.companyId ?? firstId
          const newCompany = res.data.company
          queryClient.setQueryData(['currentUser'], (prev: unknown) => {
            if (prev && typeof prev === 'object' && prev !== null) {
              return { ...prev, companyId: newCompanyId, company: newCompany ?? (prev as { company?: unknown }).company }
            }
            return prev
          })
        }
      })
      .catch(() => {
        autoSelectFirstDone.current = false
      })
  }, [user, companiesQuery.isSuccess, companies, queryClient])

  const handleCompanyChange = async (companyId: string) => {
    if (companyId === COMPANY_SELECT_PLACEHOLDER || companyId === user?.companyId) return
    if (isChangingCompany.current) return
    isChangingCompany.current = true
    try {
      const res = await authApi.post<{
        success?: boolean
        data?: { token: string; companyId?: string; company?: { id: string; name: string; workifyEnabled: boolean; shopflowEnabled: boolean } }
        error?: string
      }>('/context', { companyId })
      if (
        res &&
        typeof res === 'object' &&
        'data' in res &&
        res.success &&
        res.data?.token
      ) {
        setTokenCookie(res.data.token)
        const newCompanyId = res.data.companyId ?? companyId
        const newCompany = res.data.company
        queryClient.setQueryData(['currentUser'], (prev: unknown) => {
          if (prev && typeof prev === 'object' && prev !== null) {
            return { ...prev, companyId: newCompanyId, company: newCompany ?? (prev as { company?: unknown }).company }
          }
          return prev
        })
        for (const key of COMPANY_DATA_QUERY_KEYS) {
          void queryClient.invalidateQueries({ queryKey: key })
        }
      }
    } catch {
      // ignore
    } finally {
      isChangingCompany.current = false
    }
  }

  const handleMobileClose = () => {}

  return (
    <>
      {/* Mobile icon rail */}
      <aside
        className="lg:hidden sticky top-0 z-40 h-screen w-16 shrink-0 border-r border-slate-200 bg-slate-50 shadow-xl"
        aria-label="Navegación principal"
        role="navigation"
      >
        <div className="flex h-full flex-col items-center py-4 bg-slate-50">
          <Link
            href="/dashboard"
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white"
            aria-label="Ir al dashboard"
          >
            SF
          </Link>
          <ScrollArea className="flex-1 w-full">
            <nav className="flex flex-col items-center gap-2 py-2" aria-label="Navegación principal">
              {navGroups.map((group) => (
                <div key={group.title} className="flex flex-col items-center gap-2">
                  {group.items.map((item) => (
                    <IconNavItem key={item.href} item={item} pathname={pathname} onNavigate={handleMobileClose} />
                  ))}
                </div>
              ))}
            </nav>
          </ScrollArea>
          <div className="pt-3">
            <Link
              href="/account"
              onClick={handleMobileClose}
              aria-label="Ver mi cuenta"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100"
            >
              <UserAvatar name={user?.name} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex sticky top-0 z-40 h-screen shrink-0 border-r border-slate-200 bg-slate-50 shadow-xl',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:shadow-none'
        )}
        aria-label="Navegación principal"
        role="navigation"
      >
        <div className="flex h-full flex-col bg-slate-50">
          {/* Header: un solo control = desplegable de empresa (icono + texto dentro del selector) */}
          <div className="border-b border-gray-200 px-4 py-3 min-w-0">
            {needCompanySelector ? (
              <Select
                value={user?.companyId ?? COMPANY_SELECT_PLACEHOLDER}
                onValueChange={handleCompanyChange}
                disabled={companiesQuery.isLoading}
              >
                <SelectTrigger
                  className="w-full h-11 pl-3 pr-3 text-left border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer gap-2"
                  aria-label="Seleccionar empresa"
                >
                  <Store className="h-5 w-5 shrink-0 text-primary" />
                  <span className="flex-1 truncate text-sm font-medium">
                    <SelectValue
                      placeholder={
                        companiesQuery.isLoading
                          ? 'Cargando empresas…'
                          : companies.length === 0
                            ? 'Sin empresas'
                            : 'Selecciona una empresa'
                      }
                    />
                  </span>
                </SelectTrigger>
                <SelectContent sideOffset={4} className="max-h-[min(16rem,70vh)]">
                  {companies.length > 0 ? (
                    companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__none__" disabled>
                      Sin empresas
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 min-h-11 px-1">
                <Store className="h-5 w-5 shrink-0 text-primary" />
                <h1 className="text-sm font-bold text-gray-900 truncate" title={user?.company?.name ?? undefined}>
                  {user?.company?.name ?? '—'}
                </h1>
              </div>
            )}
            {/* Local de venta: debajo del selector de empresa */}
            {user?.companyId && storeContext && (() => {
              const { stores, isLoading, isError, currentStoreId, setCurrentStoreId, setReportStoreId } = storeContext
              const activeStores = stores.filter((s) => s.active)
              if (isLoading) {
                return (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground px-1">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>Cargando locales...</span>
                  </div>
                )
              }
              if (isError) {
                return (
                  <div className="mt-3 text-sm text-amber-700 px-1" title="Error al cargar locales. Revisa que la API esté en marcha y uses la misma base de datos.">
                    <MapPin className="h-4 w-4 inline-block mr-1.5 align-middle" />
                    Error al cargar locales
                  </div>
                )
              }
              if (activeStores.length === 0) {
                return (
                  <div className="mt-3 text-sm text-muted-foreground px-1" title="Ejecuta el seed en la carpeta database contra la misma base de datos que usa la API (misma DATABASE_URL).">
                    <MapPin className="h-4 w-4 inline-block mr-1.5 align-middle" />
                    Sin locales de venta
                  </div>
                )
              }
              return (
                <Select
                  value={currentStoreId ?? activeStores[0]?.id ?? ''}
                  onValueChange={(id) => {
                    setCurrentStoreId(id || null)
                    setReportStoreId(id || null)
                  }}
                >
                  <SelectTrigger
                    className="mt-3 w-full h-10 pl-3 pr-3 text-left border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer gap-2"
                    aria-label="Seleccionar local de venta"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1 truncate text-sm">
                      <SelectValue placeholder="Seleccionar local de venta" />
                    </span>
                  </SelectTrigger>
                  <SelectContent sideOffset={4} className="max-h-[min(16rem,70vh)]">
                    {activeStores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            })()}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 bg-slate-50">
            <nav className="p-4 space-y-4 bg-slate-50" aria-label="Navegación principal">
              {navGroups.map((group, groupIndex) => (
                <div key={group.title}>
                  <NavGroupComponent
                    group={group}
                    pathname={pathname}
                    onNavigate={handleMobileClose}
                  />
                  {groupIndex < navGroups.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-slate-50">
            {isLoadingUser ? (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ) : user ? (
              <Link
                href="/account"
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100"
                onClick={handleMobileClose}
                aria-label="Ver mi cuenta"
              >
                <UserAvatar name={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <div className="mt-1">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  )
}

