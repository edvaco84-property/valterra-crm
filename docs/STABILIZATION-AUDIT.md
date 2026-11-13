# Valterra CRM — auditoría de estabilización

Fecha: 2026-09-17

## Veredicto

**NO desplegar todavía.** La aplicación compila y producción está disponible, pero el estado local contiene una entrega grande sin versionar que mezcla producto, infraestructura, migraciones, integración Meta y 195 MB aproximados de medios de revisión/producción.

No se hizo commit, push, migración ni deploy durante esta auditoría.

## Estado comprobado

- Rama: `main`.
- Remoto: `origin` apunta a `https://github.com/edvaco84-property/valterra-crm.git`.
- `HEAD` y `origin/main`: 0 commits de diferencia al iniciar la auditoría.
- Producción:
  - `https://valterra.lat` responde HTTP 200.
  - `https://valterra-crm.fly.dev/login` responde HTTP 200.
  - Fly app `valterra-crm` tiene una máquina activa en `dfw`.
- Verificaciones locales:
  - `npm run lint`: pasa.
  - `npm run build`: pasa; 33 rutas generadas.
  - `npx prisma validate`: pasa.
  - `npm run db:generate`: pasa.
  - `git fsck --no-reflogs`: no reportó corrupción.
- Git local:
  - 74 archivos tracked modificados.
  - 42 entradas/grupos untracked en `git status`.
  - Diff tracked: aproximadamente 3,696 inserciones y 601 eliminaciones.
- Autor Git local: `user.name` y `user.email` no están configurados.

## Riesgos bloqueantes

### 1. La entrega es demasiado grande para un solo commit

Los cambios mezclan:

- endurecimiento de sesión y permisos;
- CRM, leads, equipo, agenda, tareas e inbox;
- catálogo público y ficha de propiedad;
- páginas y datos de Yaax;
- desarrollos, mapas e imágenes binarias;
- publicaciones por canal e integración Meta;
- infraestructura Fly/Docker y migraciones.

Un commit único dificultaría revisión y rollback.

### 2. Medios sin estrategia final

- `public/uploads`: 54 archivos y ~174 MB.
- screenshots de revisión `yaax-landing*.png`: ~21 MB adicionales.
- Las páginas SEO de Yaax referencian archivos bajo `/uploads/properties/yaax/`, por lo que esos medios no se pueden excluir sin cambiar las páginas o moverlos a almacenamiento externo.
- Los screenshots de revisión no son necesarios para producción y no deben versionarse.
- Conviene convertir/optimizar imágenes de Yaax antes del commit; varios archivos individuales pesan entre 2 MB y 7.5 MB.

### 3. Migraciones de producción requieren reconciliación controlada

La base registra como aplicadas las migraciones locales hasta:

`20260828192500_add_property_image_binary_storage`

Pendiente:

`20260901120000_add_meta_publication_channels`

Existe además un registro histórico `0001_init` marcado como `rolled_back`, cuyo archivo ya no existe localmente. Por eso `prisma migrate status` sale con código 1 y reporta historia diferente, aunque las ocho migraciones actuales anteriores sí aparecen aplicadas correctamente.

Antes de despliegue:

1. respaldar la base;
2. decidir si se limpia el registro histórico fallido `0001_init` o se conserva documentado;
3. probar `prisma migrate deploy` contra una copia/staging;
4. aplicar la migración Meta sólo dentro de una ventana de despliegue.

No se debe usar `db:push` en producción.

### 4. Meta no está configurado en Fly

Secretos desplegados actualmente:

- `DATABASE_URL`
- `APP_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `SESSION_SECRET`

No están configurados:

- `META_ACCESS_TOKEN`
- `META_FACEBOOK_PAGE_ID`
- `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `META_GRAPH_API_VERSION`

La UI de Meta puede desplegarse, pero publicar fallaría hasta configurar esos valores. Recomendación: separar Meta en un commit/despliegue posterior o mantener sus acciones inactivas hasta cerrar credenciales y prueba.

### 5. Producción parece incluir trabajo que Git no contiene

La producción pública muestra contenido nuevo de Valterra/Yaax, mientras `origin/main` sigue en el commit inicial y el árbol local conserva los cambios. Esto indica que al menos un despliegue pudo construirse desde un worktree sucio. El código de producción actual no está reproducible únicamente desde Git.

Prioridad: capturar el estado bueno en commits revisables antes de otro despliegue.

## Hallazgos de seguridad

- `.env` está ignorado y no aparece versionado.
- No se imprimieron valores secretos.
- Los archivos `.env.example` y `.env.production.example` también quedan ignorados por `.env*`; si deben versionarse, hay que añadir excepciones explícitas en `.gitignore`.
- La sesión cambió de una cookie con ID de usuario a un token firmado con expiración y revocación por actualización del usuario. Es una mejora importante, pero invalidará sesiones antiguas y requiere smoke test de login/logout y roles.
- El límite de Server Actions sube a 64 MB. Debe mantenerse sólo si la carga de imágenes lo necesita y acompañarse con validación de tipo/tamaño.
- Existe un archivo Finder `public/branding/Icon\r`; no está versionado y debe ignorarse o retirarse de forma recuperable.

## Clasificación recomendada

### Commit 1 — Infraestructura y seguridad

- `.dockerignore`
- `docker-entrypoint.js`
- `fly.toml`
- `scripts/release.sh`
- sesión firmada, auth y permisos
- `.gitignore` ajustado para ejemplos y artefactos

Validar: login, logout, revocación, roles y arranque Fly.

### Commit 2 — Modelo de datos y migraciones base

- migraciones desde `20260423103000_init` hasta `20260828192500_add_property_image_binary_storage`
- `prisma/schema.prisma`
- relaciones Development/Property/Lead
- mapas, publicaciones Website/Inmuebles24, inbox visto e imágenes binarias

No incluir todavía la migración Meta si se decide desacoplarla.

### Commit 3 — CRM operativo y responsive

- leads, equipo, agenda, tareas, inbox, dashboard, pipeline y UI móvil
- automatización de asignación, deduplicación y filtros de spam

Validar por rol: admin, coordinator y advisor.

### Commit 4 — Catálogo público y Yaax

- home pública, catálogo, fichas, páginas de desarrollo y SEO
- assets productivos optimizados
- seed de desarrollo/unidades sólo si se confirma que sus precios e inventario son vigentes

Excluir screenshots de revisión.

### Commit 5 — Publicaciones sociales Meta

- canal Facebook/Instagram
- migración `20260901120000_add_meta_publication_channels`
- cliente Graph API, route/action y panel UI
- documentación de variables

Desplegar sólo cuando existan credenciales y una propiedad de prueba autorizada.

## Pruebas mínimas antes de commit final

1. Lint y build.
2. Prisma validate/generate.
3. Login/logout y cookie inválida.
4. Acceso por roles a team, reports, properties e inquiries.
5. Crear/editar/borrar lead de prueba.
6. Crear propiedad con imágenes y verificar ficha pública.
7. Enviar formulario web y comprobar inquiry + lead + task sin duplicados.
8. Verificar páginas Yaax y todas las imágenes en desktop/móvil.
9. Confirmar que no se sembrarán precios obsoletos.
10. Ejecutar migraciones en copia de la base.

## Checklist de despliegue y rollback

### Antes

- Crear backup verificable de Neon.
- Capturar imagen Fly actualmente desplegada: `valterra-crm:deployment-01M1A2G5D7SWZ0JDVSQG374YMW`.
- Configurar autor Git.
- Revisar y commitear por grupos.
- Probar una build desde checkout limpio.
- Verificar secretos por nombre, nunca por valor.
- Resolver estrategia de migración histórica.

### Despliegue

- Desplegar primero sin Meta o con Meta deshabilitado.
- Vigilar release command, logs y health.
- Smoke test de home, login, CRM, catálogo y formulario.
- Confirmar que el dominio `valterra.lat` apunta a la versión correcta.

### Rollback

- Revertir a la imagen Fly capturada si falla la app.
- No revertir migraciones destructivamente sin backup y plan específico.
- Si la migración sólo agrega enum values, conservar esquema y revertir aplicación suele ser más seguro que intentar eliminar valores del enum.

## Próxima acción recomendada

1. Ajustar `.gitignore` y separar artefactos de revisión.
2. Optimizar/decidir almacenamiento de medios Yaax.
3. Configurar autor Git.
4. Preparar commits 1–4 sin desplegar.
5. Mantener Meta fuera del primer despliegue estable.
