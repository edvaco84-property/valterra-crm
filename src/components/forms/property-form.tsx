"use client";

import dynamic from "next/dynamic";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createPropertyAction, updatePropertyAction } from "@/app/actions/properties";
import { marketOptions, type AppMarket } from "@/lib/markets";
import { inputClassName, primaryButtonClassName, selectClassName, textareaClassName } from "@/lib/utils";

const PropertyLocationPicker = dynamic(
  () => import("@/components/forms/property-location-picker").then((module) => module.PropertyLocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-[1.75rem] border border-zinc-200/90 bg-white/70 text-sm text-zinc-500">
        Cargando mapa...
      </div>
    ),
  },
);

const initialState = { error: "" };
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

const propertyTypeOptions = [
  { value: "Casa", label: "Casa" },
  { value: "Casa en condominio", label: "Casa en condominio" },
  { value: "Departamento", label: "Departamento" },
  { value: "Terreno", label: "Terreno" },
  { value: "Bodega", label: "Bodega" },
  { value: "Oficina", label: "Oficina" },
  { value: "Local comercial", label: "Local comercial" },
  { value: "Penthouse", label: "Penthouse" },
] as const;

type PropertyImageItem = {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder?: number;
};

type PropertyFormValues = {
  id?: string;
  title?: string;
  market?: AppMarket;
  zone?: string;
  locationLabel?: string | null;
  googleMapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  developmentId?: string | null;
  development?: { id: string; title: string; market?: string | null } | null;
  unitCode?: string | null;
  unitType?: string | null;
  floorLabel?: string | null;
  propertyType?: string;
  operationType?: string;
  price?: number;
  currency?: string;
  status?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaM2?: number | null;
  imageUrl?: string | null;
  summary?: string | null;
  description?: string | null;
  featured?: boolean;
  published?: boolean;
  publications?: Array<{
    id: string;
    channel: "WEBSITE" | "INMUEBLES24" | "FACEBOOK" | "INSTAGRAM";
    isEnabled: boolean;
    status: "DRAFT" | "READY" | "PUBLISHED" | "PAUSED" | "ERROR";
  }>;
  images?: PropertyImageItem[];
};

type DevelopmentOption = {
  id: string;
  title: string;
  market: string;
  zone: string;
  status: string;
};

export function PropertyForm({
  property,
  developments,
}: {
  property?: PropertyFormValues;
  developments: DevelopmentOption[];
}) {
  const action = property?.id ? updatePropertyAction.bind(null, property.id) : createPropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [marketValue, setMarketValue] = useState<AppMarket>(property?.market ?? "CDMX");
  const [locationLabel, setLocationLabel] = useState(property?.locationLabel ?? "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(property?.googleMapsUrl ?? "");
  const [latitude, setLatitude] = useState<number | null>(property?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(property?.longitude ?? null);
  const [locationMessage, setLocationMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inmuebles24Publication = property?.publications?.find((publication) => publication.channel === "INMUEBLES24");
  const facebookPublication = property?.publications?.find((publication) => publication.channel === "FACEBOOK");
  const instagramPublication = property?.publications?.find((publication) => publication.channel === "INSTAGRAM");
  const inmuebles24Selected = inmuebles24Publication?.isEnabled ?? false;
  const facebookSelected = facebookPublication?.isEnabled ?? false;
  const instagramSelected = instagramPublication?.isEnabled ?? false;
  const publicationStatusLabels = {
    DRAFT: "Borrador",
    READY: "Lista para publicar",
    PUBLISHED: "Publicada",
    PAUSED: "Pausada",
    ERROR: "Error",
  } as const;
  const inmuebles24StatusLabel = {
    DRAFT: "Borrador",
    READY: "Lista para publicar",
    PUBLISHED: "Publicada",
    PAUSED: "Pausada",
    ERROR: "Error",
  }[inmuebles24Publication?.status ?? "DRAFT"];
  const facebookStatusLabel = publicationStatusLabels[facebookPublication?.status ?? "DRAFT"];
  const instagramStatusLabel = publicationStatusLabels[instagramPublication?.status ?? "DRAFT"];

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    })),
    [selectedFiles],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previewUrls]);

  const syncInputFiles = (files: File[]) => {
    const input = fileInputRef.current;
    if (!input || typeof DataTransfer === "undefined") return;

    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  };

  const applyCoordinates = (coords: { lat: number; lng: number }) => {
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    setLocationMessage(`Ubicación fijada en ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
  };

  const parseGoogleMapsCoordinates = () => {
    const source = googleMapsUrl.trim();

    if (!source) {
      setLocationMessage("Pega primero un link o coordenadas.");
      return;
    }

    const coordinatePatterns = [
      /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
      /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
      /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/,
    ];

    for (const pattern of coordinatePatterns) {
      const match = source.match(pattern);

      if (match) {
        applyCoordinates({
          lat: Number(match[1]),
          lng: Number(match[2]),
        });
        return;
      }
    }

    setLocationMessage("No pude leer coordenadas de ese link. Puedes hacer clic directo en el mapa.");
  };

  const handleFileSelection = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        errors.push(`${file.name}: usa JPG, PNG o WebP.`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        errors.push(`${file.name}: pesa más de 8 MB.`);
        continue;
      }

      validFiles.push(file);
    }

    setSelectedFiles(validFiles);
    syncInputFiles(validFiles);
    setUploadError(errors.join(" "));
  };

  return (
    <form action={formAction} className="space-y-6 rounded-[28px] border border-white/60 bg-white/82 p-6 shadow-[0_18px_60px_rgba(24,24,27,0.12)] backdrop-blur-xl">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre de la propiedad" name="title" defaultValue={property?.title} required />
        <Select label="Mercado" name="market" value={marketValue} onChange={(value) => setMarketValue(value as AppMarket)} options={marketOptions} />
        <Field label="Zona" name="zone" defaultValue={property?.zone} required />
        <Select
          label="Desarrollo"
          name="developmentId"
          defaultValue={property?.developmentId ?? ""}
          options={[
            { value: "", label: "Sin desarrollo ligado" },
            ...developments.map((development) => ({
              value: development.id,
              label: `${development.title} · ${development.zone}`,
            })),
          ]}
        />
        <Field label="Código de unidad" name="unitCode" defaultValue={property?.unitCode ?? ""} />
        <Field label="Tipología / unidad" name="unitType" defaultValue={property?.unitType ?? ""} />
        <Field label="Nivel / planta" name="floorLabel" defaultValue={property?.floorLabel ?? ""} />
        <Select label="Tipo de propiedad" name="propertyType" defaultValue={property?.propertyType ?? "Departamento"} options={propertyTypeOptions} />
        <Field label="Tipo de operación" name="operationType" defaultValue={property?.operationType ?? "Venta"} required />
        <Field label="Precio" name="price" type="number" defaultValue={property?.price ? String(property.price) : undefined} required />
        <Field label="Moneda" name="currency" defaultValue={property?.currency ?? "MXN"} required />
        <Field label="Estatus" name="status" defaultValue={property?.status ?? "Disponible"} required />
        <Field label="Recámaras" name="bedrooms" type="number" defaultValue={property?.bedrooms?.toString()} />
        <Field label="Baños" name="bathrooms" type="number" defaultValue={property?.bathrooms?.toString()} />
        <Field label="Área m²" name="areaM2" type="number" defaultValue={property?.areaM2?.toString()} />
        <Field label="Imagen URL de respaldo" name="imageUrl" defaultValue={property?.imageUrl ?? undefined} />
      </div>

      <div className="space-y-4 rounded-[1.75rem] border border-zinc-200/90 bg-white/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div>
          <p className="text-sm font-medium text-zinc-900">Ubicación real para la web</p>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            Selecciona la ubicación exacta en el mapa o pega un link de Google Maps para extraer coordenadas. Así la ficha pública deja de improvisar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="locationLabel">Referencia exacta / dirección</label>
            <input
              id="locationLabel"
              name="locationLabel"
              value={locationLabel}
              onChange={(event) => setLocationLabel(event.target.value)}
              className={inputClassName}
              placeholder="Ej. Yaax Tulum Condos, Región 11, Tulum"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="googleMapsUrl">Google Maps URL</label>
            <div className="flex gap-2">
              <input
                id="googleMapsUrl"
                name="googleMapsUrl"
                value={googleMapsUrl}
                onChange={(event) => setGoogleMapsUrl(event.target.value)}
                className={inputClassName}
                placeholder="https://maps.google.com/..."
              />
              <button
                type="button"
                onClick={parseGoogleMapsCoordinates}
                className="shrink-0 rounded-2xl border border-zinc-200/90 bg-zinc-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800"
              >
                Leer link
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="latitude">Latitud</label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              value={latitude ?? ""}
              onChange={(event) => setLatitude(event.target.value ? Number(event.target.value) : null)}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="longitude">Longitud</label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={longitude ?? ""}
              onChange={(event) => setLongitude(event.target.value ? Number(event.target.value) : null)}
              className={inputClassName}
            />
          </div>
        </div>

        <PropertyLocationPicker
          latitude={latitude}
          longitude={longitude}
          market={marketValue}
          onPick={applyCoordinates}
        />

        {locationMessage ? <p className="text-sm text-amber-700">{locationMessage}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="images">Imágenes de la propiedad</label>
        <input
          ref={fileInputRef}
          id="images"
          name="images"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            handleFileSelection(files);
          }}
          className="w-full rounded-2xl border border-zinc-200/90 bg-white/88 px-4 py-3 text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <p className="text-xs text-zinc-500">Puedes subir varias imágenes JPG, PNG o WebP de hasta 8 MB cada una. La primera nueva se agrega al final; si no hay ninguna, se toma como portada.</p>
        {uploadError ? <p className="text-xs text-rose-600">{uploadError}</p> : null}
      </div>

      {previewUrls.length ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-700">Preview de imágenes nuevas</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {previewUrls.map((preview, index) => (
              <div key={`${preview.name}-${index}`} className="space-y-2 rounded-2xl border border-dashed border-zinc-300 bg-white/75 p-3 text-sm text-zinc-700 shadow-sm">
                <div className="h-28 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('${preview.url}')` }} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-zinc-500">{preview.name}</p>
                    <p className="mt-1 text-xs text-zinc-400">Preview local antes de guardar</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFiles((files) => {
                        const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
                        syncInputFiles(nextFiles);
                        return nextFiles;
                      });
                    }}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {property?.images?.length ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-700">Imágenes actuales</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {property.images.map((image, index) => (
              <label key={image.id} className="space-y-3 rounded-2xl border border-zinc-200 bg-white/75 p-3 text-sm text-zinc-700 shadow-sm">
                <div className="h-28 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('${image.url}')` }} />
                <div className="flex items-center justify-between gap-3">
                  <span>{image.isPrimary ? "Portada actual" : "Imagen"}</span>
                  <span className="flex items-center gap-2 text-xs text-rose-600">
                    <input type="checkbox" name="removeImageIds" value={image.id} className="h-4 w-4" />
                    Eliminar
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs text-zinc-600">
                  <input type="radio" name="primaryImageId" value={image.id} defaultChecked={image.isPrimary} className="h-4 w-4" />
                  Usar como portada
                </label>
                <label className="space-y-1 text-xs text-zinc-600">
                  <span>Orden en galería</span>
                  <div className="flex items-center gap-2">
                    <input type="hidden" name="imageOrderIds" value={image.id} />
                    <input
                      name="imageOrderValues"
                      type="number"
                      min="0"
                      defaultValue={image.sortOrder ?? index}
                      className="w-24 rounded-xl border border-zinc-200/90 bg-white/88 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100/80"
                    />
                    <span className="text-[11px] text-zinc-400">0 aparece primero</span>
                  </div>
                </label>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="summary">Resumen corto</label>
        <textarea id="summary" name="summary" defaultValue={property?.summary ?? ""} rows={2} className={textareaClassName} placeholder="Texto corto para mostrar en la web" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="description">Descripción</label>
        <textarea id="description" name="description" defaultValue={property?.description ?? ""} rows={5} className={textareaClassName} placeholder="Detalles de la propiedad, propuesta de valor, amenidades..." />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl border border-zinc-200/90 bg-white/70 px-4 py-3 text-sm text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <input type="checkbox" name="published" defaultChecked={property?.published} className="h-4 w-4" />
          Publicar en página web
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-zinc-200/90 bg-white/70 px-4 py-3 text-sm text-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <input type="checkbox" name="featured" defaultChecked={property?.featured} className="h-4 w-4" />
          Destacar en home
        </label>
      </div>

      <div className="rounded-[1.75rem] border border-amber-200/70 bg-amber-50/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Portales de pago</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Aquí eliges qué inventario sí puede salir a portales como Inmuebles24. La idea no es subir todo Yaax a lo loco, porque regalar dinero también es una estrategia, pero mala.
            </p>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-700">
            Estado actual: {inmuebles24StatusLabel}
          </p>
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-700">
          <input type="checkbox" name="inmuebles24Enabled" defaultChecked={inmuebles24Selected} className="h-4 w-4" />
          Marcar para Inmuebles24
        </label>

        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Si la marcas, la propiedad queda en estado <strong>Lista para publicar</strong>. Eso permite filtrar sólo las unidades seleccionadas cuando conectemos la salida real al portal.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-sky-200/70 bg-sky-50/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Meta: Facebook e Instagram</p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Aquí decides qué propiedades sí pasan al escaparate social. La publicación real usa Meta Graph API, no acrobacias con una pestaña de Chrome sostenida con fe y cinta adhesiva.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.18em] text-sky-700">
            <span>Facebook: {facebookStatusLabel}</span>
            <span>Instagram: {instagramStatusLabel}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-sky-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-700">
            <input type="checkbox" name="facebookEnabled" defaultChecked={facebookSelected} className="h-4 w-4" />
            Marcar para Facebook
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-sky-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-700">
            <input type="checkbox" name="instagramEnabled" defaultChecked={instagramSelected} className="h-4 w-4" />
            Marcar para Instagram
          </label>
        </div>

        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Si las marcas, quedan en estado <strong>Lista para publicar</strong>. Luego puedes disparar la publicación manual desde la edición de la propiedad para no soltar inventario por accidente.
        </p>
      </div>

      {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button disabled={pending} className={primaryButtonClassName}>
        {pending ? "Guardando..." : property?.id ? "Guardar cambios" : "Crear propiedad"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} step={step} defaultValue={defaultValue} className={inputClassName} />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={selectClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
