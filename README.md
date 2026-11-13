# Valterra

Web pública + CRM comercial de Valterra, construido con Next.js, TypeScript, Tailwind y Prisma.

## Rutas principales
- `/` → landing pública
- `/crm` → dashboard CRM
- `/login` → acceso al CRM
- `/properties` → inventario interno
- `/properties/new` → alta de propiedad con flags de publicación web

## Incluye hoy
- Landing pública premium
- CRM mobile-first con dashboard, leads, pipeline, tareas, agenda y reportes
- Alta de propiedades con opción de `published` y `featured`
- Formulario público de contacto para captar leads web
- Prisma schema con usuarios, leads, propiedades, tareas, citas, notas y `WebsiteInquiry`
- Base preparada para operar con PostgreSQL

## Arranque local
```bash
cp .env.example .env
npm install
npm run db:generate
npm run dev
```

## Conectar DB real local
```bash
npm run db:push
npm run db:seed
```

## Variables de entorno de producción
Usa `.env.production.example` como referencia:

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
APP_URL=
SESSION_SECRET=
META_ACCESS_TOKEN=
META_FACEBOOK_PAGE_ID=
META_INSTAGRAM_BUSINESS_ACCOUNT_ID=
META_GRAPH_API_VERSION=
```

## Deploy recomendado
### Producción recomendada: Fly.io + Neon
1. Crea una base Postgres en Neon y copia `DATABASE_URL`
2. Configura secretos en Fly:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `SESSION_SECRET`
   - `NEXTAUTH_URL`
   - `APP_URL`
   - `META_ACCESS_TOKEN`
   - `META_FACEBOOK_PAGE_ID`
   - `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
   - `META_GRAPH_API_VERSION` opcional, default `v23.0`
3. Despliega con `fly deploy`
4. Fly ejecutará `npx prisma migrate deploy` en release usando las migraciones versionadas del proyecto
5. Si quieres datos iniciales, corre el seed manualmente una sola vez:
   - `fly ssh console -C "cd /app && npm run db:seed"`
6. Conecta tu dominio (`valterra.mx` o `www.valterra.mx`)

### Notas importantes
- No uses `db:push` en producción; usa migraciones (`prisma migrate deploy`)
- Si apuntas a una base existente sin historial de migraciones, primero hay que baselinarla con `prisma migrate resolve`

## Checklist de salida a producción
- [ ] `DATABASE_URL` de producción activa
- [ ] `NEXTAUTH_SECRET` largo y aleatorio
- [ ] `NEXTAUTH_URL` y `APP_URL` apuntando al dominio final
- [ ] Logo final como archivo real en `public/`
- [ ] Revisar copy final de contacto y CTA
- [ ] Crear primera propiedad publicada desde CRM
- [ ] Verificar que los formularios estén guardando en DB
- [ ] Conectar Meta Business: página de Facebook + cuenta de Instagram Business
- [ ] Cargar `META_ACCESS_TOKEN`, `META_FACEBOOK_PAGE_ID` y `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
- [ ] Probar una publicación manual desde `/properties/[id]/edit`

## Scripts útiles
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
```

Sí, ya está en punto para deploy, faltando únicamente los secretos y la base real. O sea, lo que siempre guarda el drama final.
