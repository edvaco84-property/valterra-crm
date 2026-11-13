# Integracion Selectiva Valterra CRM -> Inmuebles24

## Objetivo

Permitir que Valterra CRM marque solo ciertas propiedades para publicarse en Inmuebles24, sin empujar todo el inventario de Yaax ni comprometer presupuesto.

## Lo que ya queda resuelto en CRM

- La propiedad puede seguir usando `published` para web propia.
- Cada propiedad ahora puede tener publicaciones por canal.
- Se agrega el canal `INMUEBLES24`.
- El formulario permite marcar manualmente una propiedad para Inmuebles24.
- Cuando se marca, la propiedad queda en estado `READY`, o sea: seleccionada pero todavia no enviada al portal.

## Flujo recomendado

1. Alta o edicion de propiedad en CRM.
2. Si la unidad vale la pena para pauta pagada, se marca `Marcar para Inmuebles24`.
3. Un proceso de exportacion toma solo propiedades con canal `INMUEBLES24` y `status = READY`.
4. Ese proceso transforma los datos al formato que exija Inmuebles24.
5. Si la publicacion se acepta, el canal pasa a `PUBLISHED`.
6. Si se pausa o deja de convenir, el canal pasa a `PAUSED` sin bajar la ficha web propia.

## Integracion tecnica sugerida

### Opcion 1

Exportador manual desde route handler:

- Endpoint interno tipo `/api/integrations/inmuebles24/export`
- Filtra solo propiedades con `INMUEBLES24` habilitado
- Genera JSON, XML o CSV segun el formato que permita el portal o proveedor

### Opcion 2

Sincronizacion programada:

- Cron diario o bajo demanda
- Empuja solo inventario `READY`
- Guarda `externalId`, `externalUrl`, `lastSyncedAt` y errores por propiedad

## Campos que normalmente pide el portal

- titulo
- descripcion
- precio y moneda
- tipo de operacion
- tipo de propiedad
- recamaras, banos, metros
- ubicacion
- fotos
- contacto comercial

## Recomendacion operativa

Para no gastar de mas:

- Publicar primero solo 3 a 5 unidades ancla
- Priorizar tipologias con mejor conversion o ticket
- Medir leads por unidad y costo por lead antes de abrir mas inventario
- Mantener Yaax completo en CRM, pero solo una seleccion minima en Inmuebles24

## Siguiente paso real

Confirmar si Inmuebles24 acepta:

- carga manual por panel,
- feed XML/JSON/CSV,
- o integracion via partner / cuenta broker.

Con eso se construye el exportador exacto en el CRM, en lugar de adivinar como aficionados con teclado.
