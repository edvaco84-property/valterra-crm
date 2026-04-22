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
```

## Deploy recomendado
### Opción rápida: Vercel + Postgres gestionado
1. Sube este repo a GitHub
2. Importa el proyecto en Vercel
3. Configura variables de entorno de producción
4. Provisiona Postgres (Neon, Supabase, Railway o Vercel Postgres)
5. Ejecuta en build o post-deploy:
   - `npm run db:generate`
   - `npm run db:push`
   - `npm run db:seed` (solo si quieres datos demo)
6. Conecta tu dominio (`valterra.mx` o `www.valterra.mx`)

## Checklist de salida a producción
- [ ] `DATABASE_URL` de producción activa
- [ ] `NEXTAUTH_SECRET` largo y aleatorio
- [ ] `NEXTAUTH_URL` y `APP_URL` apuntando al dominio final
- [ ] Logo final como archivo real en `public/`
- [ ] Revisar copy final de contacto y CTA
- [ ] Crear primera propiedad publicada desde CRM
- [ ] Verificar que los formularios estén guardando en DB

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
