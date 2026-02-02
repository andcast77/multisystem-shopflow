# Auditoría de endpoints: Frontend (shopflow) vs API (multisystem/api)

## Resumen

**Todos los endpoints del frontend apuntan a la API externa** (`NEXT_PUBLIC_API_URL`), no a rutas API de Next.js.

1. **Cliente API**: `shopflowApi`, `authApi`, `apiClient` en [src/lib/api/client.ts](src/lib/api/client.ts). Base: `NEXT_PUBLIC_API_URL`.
2. **fetch a API externa**: Para uploads (logo) o rutas que requieren FormData/URL absoluta se usa `API_URL` y `getAuthHeaders()` exportados desde el cliente.
3. **Backup, ticket-config logo, printers**: Llaman a `NEXT_PUBLIC_API_URL + /api/shopflow/...` vía [backupApiService](src/lib/services/backupApiService.ts) o fetch con `API_URL`.

---

## Endpoints en la API (multisystem/api)

### Auth (`/api/auth/*`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Usuario actual |
| POST | /api/auth/verify | Verificar token |
| POST | /api/auth/sessions | Crear sesión |
| GET | /api/auth/sessions/validate | Validar sesión |
| GET | /api/auth/sessions | Listar sesiones (userId) |
| DELETE | /api/auth/sessions/:token | Terminar una sesión |
| POST | /api/auth/sessions/terminate-others | Terminar otras sesiones |
| POST | /api/auth/sessions/cleanup-expired | Limpiar expiradas |
| PUT | /api/auth/users/:userId/concurrent-sessions | Política de sesiones concurrentes |

**Nota:** No existe `/api/auth/logout`. El cierre de sesión se hace en cliente (borrar cookie y redirigir).

### Users (`/api/users`)
| Método | Ruta |
|--------|------|
| GET | /api/users |
| GET | /api/users/:id |
| POST | /api/users |
| PUT | /api/users/:id |
| DELETE | /api/users/:id |

### Shopflow (`/api/shopflow/*`)

| Recurso | Endpoints |
|---------|-----------|
| **customers** | GET/POST /api/shopflow/customers, GET/PUT/DELETE /api/shopflow/customers/:id |
| **categories** | GET/POST /api/shopflow/categories, GET/PUT/DELETE /api/shopflow/categories/:id |
| **suppliers** | GET/POST /api/shopflow/suppliers, GET/PUT/DELETE /api/shopflow/suppliers/:id |
| **store-config** | GET/PUT /api/shopflow/store-config, POST /api/shopflow/store-config/next-invoice-number |
| **sales** | GET/POST /api/shopflow/sales, GET /api/shopflow/sales/:id, POST /api/shopflow/sales/:id/cancel, POST /api/shopflow/sales/:id/refund |
| **ticket-config** | GET/PUT /api/shopflow/ticket-config (incluye logoUrl; no hay ruta específica /logo ni upload) |
| **user-preferences** | GET/PUT /api/shopflow/user-preferences/:userId |
| **loyalty** | GET/PUT /api/shopflow/loyalty/config, GET /api/shopflow/loyalty/points/:customerId, POST /api/shopflow/loyalty/points/award |
| **reports** | GET /api/shopflow/reports/stats, daily, top-products, payment-methods, inventory, today, week, month, by-user/:userId |
| **action-history** | POST/GET /api/shopflow/action-history, GET .../user/:userId, GET .../entity/:entityType/:entityId |
| **notifications** | POST/GET /api/shopflow/notifications, PUT .../:id/read, .../unread, PUT read-all, DELETE .../:id, GET unread-count, GET preferences/:userId, GET users/:userId/notification-preferences |
| **products** | GET/POST /api/shopflow/products, GET /api/shopflow/products/low-stock, GET/PUT/DELETE /api/shopflow/products/:id, PUT /api/shopflow/products/:id/inventory |
| **stores** | GET/POST /api/shopflow/stores, GET /api/shopflow/stores/by-code/:code, GET/PUT/DELETE /api/shopflow/stores/:id |
| **export** | GET /api/shopflow/export/json, GET /api/shopflow/export/csv?table= |
| **inventory-transfers** | GET/POST /api/shopflow/inventory-transfers, POST .../:id/complete, POST .../:id/cancel |
| **push-subscriptions** | GET /api/shopflow/users/:userId/push-subscriptions, POST/DELETE /api/shopflow/push-subscriptions |

---

## Uso en el frontend

### Correcto (usan cliente API / servicios)

- **productService**: shopflowApi → /api/shopflow/products, products/low-stock, products/:id/inventory.
- **categoryService, customerService, supplierService, saleService, storeConfigService, ticketConfigService, userPreferencesService, loyaltyService, notificationService, reportService, actionHistoryService, etc.**: usan shopflowApi o apiClient con rutas que coinciden con la API.

### Incorrecto o a revisar (fetch relativo o ruta distinta)

| Origen | fetch / uso | API correcta | Acción |
|--------|-------------|--------------|--------|
| useStoreConfig | GET/PUT /api/store-config | GET/PUT /api/shopflow/store-config | Usar storeConfigService |
| useUsers | GET/POST/PUT/DELETE /api/users... | /api/users (mismo path, otro origen) | Usar userService (apiClient) |
| useUserPreferences | GET/PUT /api/user/preferences | GET/PUT /api/shopflow/user-preferences/:userId | Usar userPreferencesService + userId |
| useSales | GET/POST /api/sales..., PUT cancel/refund | GET/POST /api/shopflow/sales, POST cancel/refund | Usar saleService; cancel/refund son POST |
| PaymentModal | POST /api/sales | POST /api/shopflow/sales | Usar saleService.createSale(userId, data) |
| useLoyalty | GET /api/loyalty/balance/:id, history/:id, config, POST redeem | balance → /api/shopflow/loyalty/points/:id, config → /api/shopflow/loyalty/config; no history/redeem en API | Usar loyaltyService (history/redeem ya resueltos en servicio) |
| ProductForm | GET /api/categories | GET /api/shopflow/categories | Usar useCategories() |
| Sidebar | POST /api/auth/logout | No existe | Limpiar cookie y redirigir en cliente |
| TicketConfigForm | POST /api/ticket-config/logo (upload) | No existe; ticket-config tiene logoUrl en GET/PUT | Mantener o implementar upload en Next/API |
| usePushNotifications | GET /api/push/vapid-public-key, POST /api/push/subscribe | VAPID desde env; subscribe → POST /api/shopflow/push-subscriptions | Usar env + pushNotificationService/shopflowApi |
| BackupList, CreateBackupButton, RestoreBackupDialog | /api/admin/backup/list, create, restore, delete | No existen; solo /api/shopflow/export/json y export/csv | Decidir: implementar backup en API o sustituir por export |

### Servicios que llaman rutas no definidas en la API

- **lowStockAlertService, importantSaleAlertService, pendingTaskService**: `shopflowApi.get('/users/notify-recipients?role=...')` — no existe en la API. Requiere nuevo endpoint o alternativa.

---

## Resumen de acciones

1. **Frontend**: Sustituir `fetch('/api/...')` por servicios/cliente que usen `NEXT_PUBLIC_API_URL` y la ruta correcta (/api/shopflow/... o /api/auth/..., /api/users).
2. **Cancel/refund ventas**: La API usa POST para cancel y refund; el frontend no debe usar PUT.
3. **Logout**: No llamar a la API; borrar cookie y redirigir a /login.
4. **Logo ticket**: Si se mantiene upload, implementar en Next (API route) o en la API; no existe hoy.
5. **Backup**: Alinear con export o implementar endpoints de backup en la API.
6. **notify-recipients**: Añadir en la API o cambiar lógica de alertas para no depender de esta ruta.
