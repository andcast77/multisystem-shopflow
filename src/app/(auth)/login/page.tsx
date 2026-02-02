'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { authApi } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type CompanyOption = { id: string; name: string; workifyEnabled: boolean; shopflowEnabled: boolean }

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

function setTokenCookie(token: string) {
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [companies, setCompanies] = useState<CompanyOption[] | null>(null)
  const [selectingCompany, setSelectingCompany] = useState(false)

  // Verificar si el usuario ya está autenticado (solo vía API)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authApi.get('/me')
        window.location.href = '/dashboard'
        return
      } catch {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await authApi.post<
        | {
            success: true
            data: {
              token: string
              user: { id: string; email: string; role: string; name: string }
              companyId?: string
              company?: { id: string; name: string }
              companies?: CompanyOption[]
            }
          }
        | { success: false; error?: string }
      >('/login', data)

      if (!res || typeof res !== 'object' || !('data' in res) || !res.success || !res.data) {
        setError((res as { error?: string })?.error ?? 'Error al iniciar sesión')
        return
      }

      const { token, companyId, company, companies: companiesList } = res.data

      if (!token) {
        setError('La API no devolvió un token')
        return
      }

      setTokenCookie(token)

      // Si ya hay empresa en el token, ir al dashboard
      if (companyId ?? company) {
        window.location.href = '/dashboard'
        return
      }

      // Superuser o varias empresas: seleccionar primera por defecto y redirigir
      if (companiesList && companiesList.length > 0) {
        const withShopflow = companiesList.filter((c) => c.shopflowEnabled)
        const listToShow = withShopflow.length > 0 ? withShopflow : companiesList
        if (listToShow.length > 0) {
          const ctx = await authApi.post<{ success: boolean; data?: { token: string }; error?: string }>(
            '/context',
            { companyId: listToShow[0].id }
          )
          if (ctx && typeof ctx === 'object' && 'data' in ctx && ctx.success && ctx.data?.token) {
            setTokenCookie(ctx.data.token)
            window.location.href = '/dashboard'
            return
          }
        }
        setCompanies(listToShow)
        setSelectingCompany(true)
        return
      }

      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChooseCompany = async (companyId: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const res = await authApi.post<{ success: boolean; data?: { token: string }; error?: string }>(
        '/context',
        { companyId }
      )
      if (!res || typeof res !== 'object' || !('data' in res) || !res.success || !res.data?.token) {
        setError((res as { error?: string })?.error ?? 'Error al seleccionar empresa')
        return
      }
      setTokenCookie(res.data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al seleccionar empresa')
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Pantalla de selección de empresa (superuser o varias empresas)
  if (selectingCompany && companies && companies.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Selecciona una empresa
            </CardTitle>
            <CardDescription className="text-center">
              Elige con qué empresa quieres trabajar en ShopFlow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              {companies.map((c) => (
                <Button
                  key={c.id}
                  type="button"
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  disabled={isLoading}
                  onClick={() => handleChooseCompany(c.id)}
                >
                  {c.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder a ShopFlow POS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Formulario seguro: usa POST con body JSON, nunca GET con query params */}
          <form onSubmit={handleSubmit(onSubmit)} method="post" className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                disabled={isLoading}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
