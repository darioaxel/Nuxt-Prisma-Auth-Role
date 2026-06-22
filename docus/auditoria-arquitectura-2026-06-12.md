# Auditoría de arquitectura y patrones — Nuxt-Prisma-Auth-Role

> Fecha: 2026-06-12  
> Auditor: asistente de código (modo ingeniero experto en patrones y Nuxt 4.2)  
> Alcance: revisión de buenas prácticas, estructura Nuxt 4.2, seguridad, rendimiento, TypeScript y deuda técnica.

---

## Resumen ejecutivo

Se han identificado **5 problemas críticos** que deberían abordarse antes que el resto:

1. **Seguridad:** endpoints `/api/content/file` sin autorización y vulnerable a path traversal.
2. **Seguridad:** endpoints de gestión de usuarios (`/api/users/*`) permiten roles no administrativos (`BLOG`, `DAW`).
3. **Arquitectura:** coexisten dos sistemas de autorización (`role.ts` y `role.global.ts` legacy) con jerarquía rota.
4. **Build/TypeScript:** `pnpm nuxt typecheck` falla; no hay validación de tipos.
5. **Estructura:** `app.vue` duplicado en raíz y `app/app.vue`; riesgo de comportamiento impredecible.

---

## Convenciones

- **Prioridad:** `Crítico` > `Alto` > `Medio` > `Bajo`.
- Cada ítem está numerado jerárquicamente: `1.` categoría, `1.1` subcategoría/problema.
- Al final de cada ítem se indica la **acción recomendada**.

---

## 1. Arquitectura Nuxt 4.2 y compatibilidad

### 1.1 `app.vue` duplicado / ubicación incorrecta
- **Prioridad:** Crítico
- **Ubicación:** `app.vue` (raíz), `app/app.vue`
- **Descripción:** Con `future.compatibilityVersion: 4`, Nuxt 4 espera el componente raíz en `app/app.vue`. El archivo `app.vue` en raíz es confuso y puede ser ignorado o causar comportamiento impredecible.
- **Acción:** Eliminar `app.vue` de la raíz y mantener únicamente `app/app.vue`.

### 1.2 `compatibilityDate` obsoleto
- **Prioridad:** Crítico
- **Ubicación:** `nuxt.config.ts:6`
- **Descripción:** Fecha `2024-11-01` con Nuxt `^4.2.1` no activa comportamientos recientes ni correcciones de compatibilidad.
- **Acción:** Actualizar `compatibilityDate` a una fecha cercana a la versión instalada (ej. `2025-06-01`) tras revisar el changelog.

### 1.3 Configuración de imports redundante/peligrosa
- **Prioridad:** Alto
- **Ubicación:** `nuxt.config.ts:122-124`
- **Descripción:** `imports: { dirs: ['composables/**'] }` fuerza el escaneo desde la raíz. En Nuxt 4 los composables ya se auto-importan desde `app/composables`.
- **Acción:** Eliminar la opción `imports` y confiar en la convención de Nuxt 4.

### 1.4 Vitest sin soporte Nuxt
- **Prioridad:** Alto
- **Ubicación:** `vitest.config.ts`
- **Descripción:** Usa `@vitejs/plugin-vue` en lugar de `@nuxt/test-utils`/`nuxt-vitest`, por lo que faltan auto-imports, composables SSR y resolución de aliases de Nuxt.
- **Acción:** Migrar a `@nuxt/test-utils` con `defineVitestConfig`.

### 1.5 Falta de ESLint / Prettier / lint-staged
- **Prioridad:** Alto
- **Ubicación:** raíz del proyecto
- **Descripción:** No hay herramientas de linting ni formateo. El código presenta inconsistencias, imports no usados y estilos desiguales.
- **Acción:** Añadir `@nuxt/eslint` (o ESLint plano) y Prettier con configuración mínima.

### 1.6 `typeCheck: false`
- **Prioridad:** Alto
- **Ubicación:** `nuxt.config.ts:103`
- **Descripción:** Desactiva la comprobación de tipos en build. Sumado al fallo de `nuxt typecheck`, el proyecto carece de validación TypeScript.
- **Acción:** Resolver errores de tipos y activar `typeCheck: true`.

### 1.7 Alias `~` y `@` duplicados en Vitest
- **Prioridad:** Medio
- **Ubicación:** `vitest.config.ts:13-16`
- **Descripción:** Nuxt ya proporciona estos aliases; duplicarlos puede generar inconsistencias.
- **Acción:** Usar configuración de `@nuxt/test-utils` y eliminar aliases manuales.

### 1.8 Hook manual para registrar componentes de contenido
- **Prioridad:** Medio
- **Ubicación:** `nuxt.config.ts:127-136`
- **Descripción:** Nuxt Content v3 registra automáticamente componentes en `app/components/content/`. El hook puede ser innecesario.
- **Acción:** Verificar si el hook sigue siendo necesario; preferir convención sobre configuración.

### 1.9 Patrones Nuxt 4.2 no utilizados
- **Prioridad:** Medio
- **Ubicación:** global
- **Descripción:** No se aprovechan `app/router.options.ts`, `app/error.vue`, `<NuxtRouteAnnouncer />`, `<NuxtLoadingIndicator />` ni `app.config.ts`.
- **Acción:** Evaluar incorporar estos patrones para mejorar accesibilidad, feedback de carga y configuración runtime.

---

## 2. Autenticación y autorización

### 2.1 Doble sistema de autorización inconsistente
- **Prioridad:** Crítico
- **Ubicación:** `app/middleware/role.ts`, `app/middleware/role.global.ts`, varias páginas
- **Descripción:** Algunas páginas usan `middleware: ['auth','role']` + `allowedRoles`; otras usan `middleware: ['auth']` + `roles` (legacy global). Es fácil olvidar uno y abrir brechas.
- **Acción:** Elegir un único sistema (recomendado: `auth` + `role` + `allowedRoles`) y eliminar `role.global.ts`.

### 2.2 `useRole.ts` ignora `BLOG` y `DAW` en la jerarquía
- **Prioridad:** Crítico
- **Ubicación:** `app/composables/useRole.ts:6`
- **Descripción:** La jerarquía real debería ser `USER < BLOG < DAW < ADMIN < ROOT`. Con la lista actual, `hasRoleOrHigher('USER')` devuelve `false` para `BLOG`/`DAW`.
- **Acción:** Sincronizar `roleHierarchy` con el enum real de Prisma y los roles del negocio.

### 2.3 `role.ts` solo verifica coincidencia exacta
- **Prioridad:** Crítico
- **Ubicación:** `app/middleware/role.ts:26`
- **Descripción:** Un usuario `ROOT` no pasaría una ruta con `allowedRoles: ['ADMIN']` si no se incluye explícitamente.
- **Acción:** Implementar comprobación jerárquica reutilizando `useRole.hasRoleOrHigher` o una función equivalente.

### 2.4 `alta-usuario.vue` sin restricción de rol
- **Prioridad:** Crítico
- **Ubicación:** `app/pages/usuario/alta-usuario.vue:2-6`
- **Descripción:** Cualquier usuario logueado puede acceder a la página de alta. Aunque la API bloquea a `USER`, `BLOG`/`DAW` pueden crear usuarios.
- **Acción:** Añadir `middleware: ['auth','role']` y `allowedRoles: ['ADMIN','ROOT']`.

### 2.5 `admin/usuarios/listado.vue` mezcla sistemas y tiene dos bloques `<script setup>`
- **Prioridad:** Crítico
- **Ubicación:** `app/pages/admin/usuarios/listado.vue:1-306`
- **Descripción:** Usa `middleware: ['auth']` + `roles: [...]` (legacy) en lugar de `allowedRoles`. Tener dos `<script setup>` en un SFC no es válido y puede provocar errores de compilación.
- **Acción:** Fusionar en un único `<script setup>` y usar `middleware: ['auth','role']` + `allowedRoles: ['ADMIN','ROOT']`.

### 2.6 `auth.ts` no espera resolución de `fetch()`
- **Prioridad:** Alto
- **Ubicación:** `app/middleware/auth.ts:9-11`
- **Descripción:** `loggedIn` se consulta antes de esperar la resolución de `fetch()`. El flujo es propenso a redirecciones incorrectas en SSR.
- **Acción:** Hacer `await fetch()` y luego evaluar `loggedIn.value`.

### 2.7 `useAppUserSession` ejecuta `onMounted` dentro del composable
- **Prioridad:** Alto
- **Ubicación:** `app/composables/useAppUserSession.ts:77-83`
- **Descripción:** `onMounted` solo se ejecuta en componentes; dentro de un composable llamado en SSR puede no comportarse como se espera.
- **Acción:** Eliminar `onMounted`; confiar en el `watch` con `immediate: true`.

### 2.8 `toast` importado en un composable
- **Prioridad:** Alto
- **Ubicación:** `app/composables/useAppUserSession.ts:4`
- **Descripción:** `vue-sonner` depende del DOM; si el composable se usa en SSR (middleware, plugin), puede fallar.
- **Acción:** Mover los toasts a las capas de UI o proteger con `process.client`.

### 2.9 `console.log`/`warn` en middleware y composables
- **Prioridad:** Alto
- **Ubicación:** `app/middleware/role.global.ts:32`, `app/composables/useAppUserSession.ts:54,66,71`
- **Descripción:** Ruido en producción y posible fuga de información.
- **Acción:** Eliminar o envolver con un logger condicional a `process.dev`.

### 2.10 Login/Register sin rate limiting
- **Prioridad:** Medio
- **Ubicación:** `server/api/auth/login.post.ts`, `server/api/auth/register.post.ts`
- **Descripción:** Vulnerable a fuerza bruta y spam de registros.
- **Acción:** Añadir rate limiting (Redis/memory) o al menos contador de intentos con bloqueo temporal.

### 2.11 Registro público sin aprobación
- **Prioridad:** Medio
- **Ubicación:** `server/api/auth/register.post.ts`
- **Descripción:** Cualquiera puede crear cuenta `USER` sin verificación de email.
- **Acción:** Evaluar si es deseado; si no, requerir invitación/verificación o deshabilitar el endpoint.

---

## 3. Rendimiento y SSR

### 3.1 Acceso a `document`/`window` en setup sin guardia SSR
- **Prioridad:** Crítico
- **Ubicación:** `app/components/ui/sidebar/SidebarProvider.vue:34`, `app/components/ThemeToggle.vue:16-33`
- **Descripción:** Provoca `document is not defined` o hidratación incorrecta en SSR.
- **Acción:** Usar `process.client`, `<ClientOnly>`, o hooks de `@vueuse` como `useWindowSize`/`usePreferredDark`.

### 3.2 Carrera de datos en consultas anidadas de contenido
- **Prioridad:** Alto
- **Ubicación:** `app/pages/[centro]/index.vue:25-35`, `app/pages/ayuda/[...slug].vue:13-23`
- **Descripción:** `children` consulta el valor de `item.value` dentro de su factory, pero ambas `useAsyncData` se ejecutan en paralelo; en SSR `item.value` suele ser nulo.
- **Acción:** Hacer secuencial: `await` el item primero y lanzar la segunda consulta condicionalmente, o usar una sola `useAsyncData` combinada.

### 3.3 `DynamicBreadCrumb` carga toda la colección
- **Prioridad:** Alto
- **Ubicación:** `app/components/DynamicBreadCrumb.vue:30-37`
- **Descripción:** `queryCollection(...).all()` descarga todos los documentos solo para obtener títulos de breadcrumb.
- **Acción:** Consultar solo los paths necesarios o cachear un mapa de títulos en el servidor.

### 3.4 `editor.vue` carga todas las colecciones a la vez
- **Prioridad:** Alto
- **Ubicación:** `app/pages/editor.vue:8-16`
- **Descripción:** Tres `useAsyncData` traen todo el contenido de tres colecciones.
- **Acción:** Implementar paginación/búsqueda o carga bajo demanda.

### 3.5 `reloadNuxtApp()` tras guardar contenido
- **Prioridad:** Alto
- **Ubicación:** `app/pages/[centro]/[...slug].vue:72`, `app/pages/ayuda/[...slug].vue:39`
- **Descripción:** Recarga completa de la aplicación; pérdida de estado y experiencia pobre.
- **Acción:** Refrescar solo el item de Nuxt Content (`refreshItem`) e invalidar la caché correspondiente.

### 3.6 Uso de `$fetch` para datos que podrían usar `useAsyncData`
- **Prioridad:** Medio
- **Ubicación:** `app/components/TiptapEditor.vue:128`, `app/pages/admin/usuarios/listado.vue:546`
- **Descripción:** Posibles dobles peticiones y falta de cacheo entre navegaciones.
- **Acción:** Usar `useFetch`/`useAsyncData` cuando los datos sean parte del estado de la página.

### 3.7 `useAppUserSession` dispara `loadUser()` desde watch + onMounted
- **Prioridad:** Medio
- **Ubicación:** `app/composables/useAppUserSession.ts:51-82`
- **Descripción:** Doble llamada a `/api/user` en cliente.
- **Acción:** Eliminar `onMounted`; el `watch(immediate)` es suficiente.

---

## 4. API del servidor (Nitro)

### 4.1 Endpoints de contenido sin autorización
- **Prioridad:** Crítico
- **Ubicación:** `server/api/content/file.get.ts`, `server/api/content/file.put.ts`
- **Descripción:** Cualquiera puede leer y escribir archivos markdown.
- **Acción:** Añadir `requireUserSession(event)` y comprobar roles (`ADMIN`/`ROOT` o `DAW`/`BLOG` según el centro).

### 4.2 Path traversal en `resolveContentPath`
- **Prioridad:** Crítico
- **Ubicación:** `server/utils/content-path.ts:9-44`
- **Descripción:** Un path como `../package.json` resuelve fuera de `content/` y permite leer archivos arbitrarios.
- **Acción:** Sanitizar segmentos `..`, validar contra lista blanca y usar `pathe.resolve` con comprobación de prefijo.

### 4.3 Autorización de administración demasiado permisiva
- **Prioridad:** Crítico
- **Ubicación:** `server/api/users/index.get.ts:12`, `server/api/users/index.post.ts:27`, `server/api/users/bulk.patch.ts:39`, `server/api/users/[id].patch.ts:18`
- **Descripción:** Solo rechazan `USER`; `BLOG` y `DAW` pueden gestionar usuarios.
- **Acción:** Requerir `ADMIN` o `ROOT` explícitamente y restringir qué puede hacer cada uno.

### 4.4 Schema Zod de usuarios excluye `BLOG` y `DAW`
- **Prioridad:** Crítico
- **Ubicación:** `server/api/users/bulk.patch.ts:7-8`, `server/api/users/[id].patch.ts:6-7`
- **Descripción:** Aunque Prisma los soporta, la API no permite asignar esos roles.
- **Acción:** Incluir todos los valores del enum `Role` en los schemas.

### 4.5 `profile.put.ts` actualiza email sin verificar unicidad
- **Prioridad:** Alto
- **Ubicación:** `server/api/user/profile.put.ts:33`
- **Descripción:** Podría duplicar emails violando la restricción única.
- **Acción:** Comprobar que el nuevo email no existe en otro usuario.

### 4.6 Operaciones Prisma no atómicas
- **Prioridad:** Alto
- **Ubicación:** `server/api/auth/login.post.ts:42-60`
- **Descripción:** Dos `update` consecutivos sin transacción.
- **Acción:** Agrupar en `prisma.$transaction` o un único `update`.

### 4.7 `register.post.ts` devuelve contraseña en texto plano
- **Prioridad:** Alto
- **Ubicación:** `server/api/auth/register.post.ts:88`
- **Descripción:** Aunque comentado como "en producción enviar por email", actualmente expone credenciales.
- **Acción:** No devolver nunca la contraseña; enviarla por canal seguro o forzar cambio en primer login.

### 4.8 Errores con `statusMessage` genéricos y `error: any`
- **Prioridad:** Medio
- **Ubicación:** Todos los endpoints
- **Descripción:** Se pierde información útil y se dificulta el debugging.
- **Acción:** Crear helper de error tipado y loggear detalles en servidor.

### 4.9 Uso de `readBody` + `parse` en lugar de `readValidatedBody`
- **Prioridad:** Medio
- **Ubicación:** `server/api/user/profile.put.ts:26-27`, `server/api/users/bulk.patch.ts:47-48`
- **Descripción:** Mezcla de APIs de validación.
- **Acción:** Estandarizar en `readValidatedBody(event, schema.parse)`.

### 4.10 `profile.put.ts` usa `any` para construir payload
- **Prioridad:** Medio
- **Ubicación:** `server/api/user/profile.put.ts:30`
- **Descripción:** Pierde tipos y seguridad.
- **Acción:** Usar `Prisma.UserUpdateInput` o un tipo derivado del schema.

---

## 5. Base de datos y Prisma

### 5.1 Versión de `@prisma/client` desfasada respecto a `prisma`
- **Prioridad:** Crítico
- **Ubicación:** `package.json:31,98`
- **Descripción:** `@prisma/client` `7.3.0` vs `prisma` `7.5.0`. Incompatibilidades silenciosas y generación de cliente inconsistente.
- **Acción:** Alinear versiones (`^7.5.0`).

### 5.2 Cliente Prisma con adapter + singleton global mixto
- **Prioridad:** Alto
- **Ubicación:** `server/utils/db.ts`, `prisma/seed/config.ts`
- **Descripción:** El adapter `PrismaPg` mantiene la conexión; el patrón global puede no funcionar correctamente en producción con reciclaje de workers.
- **Acción:** Revisar documentación de Prisma 7 para adapters; evitar singleton global cuando se usa adapter.

### 5.3 `prisma/seed/config.ts` depende de `dotenv` (devDependency)
- **Prioridad:** Alto
- **Ubicación:** `prisma/seed/config.ts:1`
- **Descripción:** En producción `dotenv` puede no estar instalado.
- **Acción:** Usar `prisma.config.ts` para cargar variables o mover `dotenv` a dependencias.

### 5.4 Modelo `User` sin campos de auditoría de seguridad
- **Prioridad:** Medio
- **Ubicación:** `prisma/schema/user.prisma`
- **Descripción:** No se registra IP, agente de usuario ni historial de sesiones.
- **Acción:** Añadir tabla `Session`/`AuditLog` si el proyecto requiere trazabilidad.

### 5.5 `failedLoginAttempts` sin bloqueo temporal
- **Prioridad:** Medio
- **Ubicación:** `prisma/schema/user.prisma:33`
- **Descripción:** El campo existe pero no hay lógica de bloqueo.
- **Acción:** Implementar bloqueo tras N intentos o reseteo programado.

---

## 6. UI y componentes

### 6.1 `admin/usuarios/listado.vue`: dos `<script setup>`
- **Prioridad:** Crítico
- **Ubicación:** `app/pages/admin/usuarios/listado.vue`
- **Descripción:** Vue SFC no permite múltiples `<script setup>`.
- **Acción:** Unificar en un único bloque.

### 6.2 `MdcTabs` usa `marked.parse()` de forma síncrona
- **Prioridad:** Alto
- **Ubicación:** `app/components/content/MdcTabs.vue:15-18`
- **Descripción:** `marked.parse` devuelve `Promise<string>` en v18; `v-html` recibirá un objeto Promise.
- **Acción:** Usar `marked.parseSync()` o procesar en `onMounted`/`watch` con estado asíncrono.

### 6.3 `editor.vue` usa `v-model` en `TiptapEditor` que no lo expone
- **Prioridad:** Alto
- **Ubicación:** `app/pages/editor.vue:96`
- **Descripción:** `TiptapEditor` solo tiene prop `path` y eventos `saved`/`cancelled`.
- **Acción:** Eliminar `v-model` o implementar `modelValue`/`update:modelValue` en el editor.

### 6.4 `editor.vue` desestructura respuesta incorrectamente
- **Prioridad:** Alto
- **Ubicación:** `app/pages/editor.vue:32-33`
- **Descripción:** La API devuelve `{ content, path }`, no `{ data: { content } }`.
- **Acción:** Usar `result.content` directamente.

### 6.5 `MdcField` no asocia `<label>` con `<input>`
- **Prioridad:** Alto
- **Ubicación:** `app/components/content/MdcField.vue:13-20`
- **Descripción:** Falta `for`/`id`; problema de accesibilidad.
- **Acción:** Generar un id único y vincular label + input.

### 6.6 `SidebarProvider` escribe `document.cookie` en SSR
- **Prioridad:** Alto
- **Ubicación:** `app/components/ui/sidebar/SidebarProvider.vue:34`
- **Descripción:** Error en servidor.
- **Acción:** Guardar cookie solo en cliente.

### 6.7 `ThemeToggle` manipula DOM directamente en setup
- **Prioridad:** Alto
- **Ubicación:** `app/components/ThemeToggle.vue:16-33`
- **Descripción:** `useColorMode` ya debería gestionar la clase; el código manual rompe SSR/hidratación.
- **Acción:** Simplificar usando solo `useColorMode` o envolver en `<ClientOnly>`.

### 6.8 Uso inconsistente de iconos
- **Prioridad:** Medio
- **Ubicación:** `package.json:26,69`
- **Descripción:** Dos librerías de iconos idénticas (`@lucide/vue` y `lucide-vue-next`).
- **Acción:** Elegir una y eliminar la otra (recomendado `lucide-vue-next`).

### 6.9 Componentes MDC registrados globalmente vía hook manual
- **Prioridad:** Medio
- **Ubicación:** `nuxt.config.ts:127-136`
- **Descripción:** Posiblemente innecesario con Nuxt Content v3.
- **Acción:** Verificar y eliminar si el registro automático funciona.

### 6.10 `MdcCollapsible` usa `v-model:open` incorrectamente
- **Prioridad:** Medio
- **Ubicación:** `app/components/content/MdcCollapsible.vue:13`
- **Descripción:** El wrapper `Collapsible.vue` no expone `open` como v-model (usa slot scoped `open`).
- **Acción:** Corregir el wrapper o usar el estado interno de reka-ui directamente.

---

## 7. Nuxt Content v3 y Tiptap

### 7.1 `tiptap-markdown` instalado a pesar de ser incompatible
- **Prioridad:** Crítico
- **Ubicación:** `package.json:79`
- **Descripción:** El equipo ya documentó que no se debe usar; aumenta el bundle y puede causar errores de build.
- **Acción:** Eliminar `tiptap-markdown` del `package.json`.

### 7.2 Guardado de contenido recarga toda la app
- **Prioridad:** Alto
- **Ubicación:** `app/pages/[centro]/[...slug].vue:72`, `app/pages/ayuda/[...slug].vue:39`
- **Descripción:** Mala UX.
- **Acción:** Refrescar el item de Nuxt Content y re-renderizar.

### 7.3 `resolveContentPath` usa `process.cwd()`
- **Prioridad:** Alto
- **Ubicación:** `server/utils/content-path.ts:10`
- **Descripción:** En producción (`.output/server`) `process.cwd()` puede no apuntar al source con la carpeta `content`.
- **Acción:** Resolver la ruta relativa al proyecto usando `useRuntimeConfig` o una ruta absoluta configurable.

### 7.4 Mapeo de centros duplicado
- **Prioridad:** Medio
- **Ubicación:** `[centro]/[...slug].vue`, `[centro]/index.vue`, `DynamicBreadCrumb.vue`
- **Descripción:** DRY violado; riesgo de inconsistencias.
- **Acción:** Centralizar el `collectionMap` en `app/lib/config.ts`.

### 7.5 Case-sensitivity gestionado a mano en cada página
- **Prioridad:** Medio
- **Ubicación:** `app/pages/[centro]/[...slug].vue:17`, etc.
- **Descripción:** Fragilidad ante cambios de convención.
- **Acción:** Usar helpers centralizados o normalizar rutas en el router.

---

## 8. TypeScript

### 8.1 `nuxt typecheck` falla
- **Prioridad:** Crítico
- **Ubicación:** `tsconfig.json`, `vue-router`
- **Descripción:** Bloquea CI/CD y validación de tipos.
- **Acción:** Corregir incompatibilidad `vue-router`/`vue-tsc` (actualizar `vue-tsc` o ajustar resolución) y eliminar/ajustar `baseUrl` deprecado.

### 8.2 Uso extendido de `any`
- **Prioridad:** Alto
- **Ubicación:** Cliente y servidor
- **Descripción:** Pérdida de seguridad de tipos.
- **Acción:** Reemplazar por tipos derivados de Prisma o Zod (`z.infer<typeof schema>`).

### 8.3 `Role` hardcodeado en vez de usar el enum de Prisma
- **Prioridad:** Alto
- **Ubicación:** `server/api/users/bulk.patch.ts`, `server/api/users/[id].patch.ts`, `app/pages/admin/usuarios/listado.vue`
- **Descripción:** Si se añaden roles, la API y la UI no se enteran.
- **Acción:** Usar `Role` de `@prisma/client` en schemas Zod y listas de roles.

### 8.4 `tsconfig.json` redefine `strict`
- **Prioridad:** Medio
- **Ubicación:** `tsconfig.json:2-6`
- **Descripción:** Nuxt ya genera la configuración; duplicar opciones puede generar advertencias.
- **Acción:** Revisar si `strict: true` es necesario explícitamente.

---

## 9. Estado y Pinia

### 9.1 Pinia instalado pero sin stores definidas
- **Prioridad:** Medio
- **Ubicación:** `package.json:29,74-75`
- **Descripción:** `@pinia/nuxt` y `pinia-plugin-persistedstate` están en dependencias pero no se usa ninguna store.
- **Acción:** O crear stores para estado global (usuarios, UI) o eliminar Pinia si `useState` es suficiente.

### 9.2 `useAppUserSession` mantiene estado duplicado
- **Prioridad:** Medio
- **Ubicación:** `app/composables/useAppUserSession.ts`
- **Descripción:** `baseUser` de `nuxt-auth-utils` ya tiene `id`, `email`, `role`; `useAppUserSession` vuelve a cargar `/api/user` y guarda copia.
- **Acción:** Considerar extender directamente el tipo de sesión de `nuxt-auth-utils` para incluir datos de perfil y evitar doble estado.

---

## 10. Código muerto o duplicado

### 10.1 `tiptap-markdown` no se usa
- **Prioridad:** Alto
- **Ubicación:** `package.json:79`
- **Acción:** Eliminar.

### 10.2 `@lucide/vue` no se usa
- **Prioridad:** Alto
- **Ubicación:** `package.json:26`
- **Acción:** Eliminar.

### 10.3 `vee-validate` instalado pero formularios usan validación manual
- **Prioridad:** Alto
- **Ubicación:** Todo el proyecto
- **Acción:** Decidir si migrar formularios a `vee-validate` + `zod` o eliminar el módulo.

### 10.4 Funciones `getRoleLabel`/`getRoleColor` duplicadas
- **Prioridad:** Medio
- **Ubicación:** `app/pages/usuario/index.vue`, `app/components/NavUser.vue`, etc.
- **Acción:** Extraer a un helper reutilizable (`app/lib/roles.ts`).

### 10.5 `docus/*.md` pueden contener información obsoleta
- **Prioridad:** Bajo
- **Ubicación:** `docus/`
- **Acción:** Revisar y archivar o mantener actualizado; no afecta runtime.

---

## 11. Otros (DevOps, tests, UX)

### 11.1 Dockerfile usa `node:20-alpine`
- **Prioridad:** Alto
- **Ubicación:** `Dockerfile:8`
- **Descripción:** Nuxt 4.2 recomienda Node 22 LTS.
- **Acción:** Actualizar a `node:22-alpine` y verificar builds.

### 11.2 Dockerfile ejecuta `pnpm approve-builds` con `|| true`
- **Prioridad:** Alto
- **Ubicación:** `Dockerfile:38`
- **Descripción:** Enmascara fallos de builds nativos.
- **Acción:** Revisar si es necesario y manejar errores explícitamente.

### 11.3 `NUXT_SESSION_PASSWORD` por defecto inseguro
- **Prioridad:** Alto
- **Ubicación:** `docker-compose.yml:45`
- **Descripción:** Clave por defecto en compose para producción.
- **Acción:** Documentar claramente que debe cambiarse; considerar validación en startup.

### 11.4 Sin tests reales
- **Prioridad:** Alto
- **Ubicación:** `tests/setup.ts`
- **Descripción:** Solo contiene un comentario; cobertura nula.
- **Acción:** Añadir tests unitarios de composables y tests de integración de endpoints.

### 11.5 `app/pages/index.vue` redirige solo en `onMounted`
- **Prioridad:** Medio
- **Ubicación:** `app/pages/index.vue:5-11`
- **Descripción:** En SSR muestra "Cargando..." y luego redirige; no es ideal para SEO ni UX.
- **Acción:** Usar middleware o `navigateTo` en setup con guardia de cliente/SSR según corresponda.

### 11.6 `MdcCard` usa `<a>` sin `NuxtLink`
- **Prioridad:** Medio
- **Ubicación:** `app/components/content/MdcCard.vue:16`
- **Descripción:** Pierde prefetching y manejo de rutas de Nuxt.
- **Acción:** Usar `<NuxtLink>` cuando `to` sea interno.

---

## Plan de acción recomendado

### Fase 1 — Seguridad y estabilidad (antes de cualquier despliegue)
1. Corregir autorización de `/api/content/file` y path traversal.
2. Restringir `/api/users/*` a `ADMIN`/`ROOT` e incluir todos los roles en Zod.
3. Unificar sistema de roles y eliminar `role.global.ts`.
4. Corregir `useRole.ts` y `role.ts` para jerarquía real.
5. Eliminar `app.vue` de raíz.
6. Resolver `nuxt typecheck`.

### Fase 2 — Correcciones funcionales
7. Unificar `admin/usuarios/listado.vue` en un único `<script setup>`.
8. Corregir accesos SSR a `document`/`window`.
9. Corregir `MdcTabs`, `editor.vue`, carrera de datos en páginas de contenido.
10. Eliminar `tiptap-markdown`, `@lucide/vue` y revisar `vee-validate`.

### Fase 3 — Calidad y mantenibilidad
11. Añadir ESLint/Prettier.
12. Migrar Vitest a `@nuxt/test-utils`.
13. Añadir tests unitarios e integración.
14. Actualizar Dockerfile a Node 22 y revisar variables sensibles.
15. Extraer helpers duplicados y centralizar configuración (`collectionMap`, roles).

---

## Seguimiento

Marcar cada ítem como `[ ] pendiente` / `[~] en progreso` / `[x] completado` a medida que se aborden.
