"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createPropertyAction, updatePropertyAction } from "@/app/actions/properties";

const initialState = { error: "" };

const marketOptions = [
  { value: "CDMX", label: "CDMX" },
  { value: "RIVIERA_MAYA", label: "Riviera Maya" },
] as const;

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
  market?: string;
  zone?: string;
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
  images?: PropertyImageItem[];
};

export function PropertyForm({ property }: { property?: PropertyFormValues }) {
  const action = property?.id ? updatePropertyAction.bind(null, property.id) : createPropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre de la propiedad" name="title" defaultValue={property?.title} required />
        <Select label="Mercado" name="market" defaultValue={property?.market ?? "CDMX"} options={marketOptions} />
        <Field label="Zona" name="zone" defaultValue={property?.zone} required />
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

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="images">Imágenes de la propiedad</label>
        <input
          ref={fileInputRef}
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setSelectedFiles(files);
            syncInputFiles(files);
          }}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <p className="text-xs text-zinc-500">Puedes subir varias imágenes. La primera nueva se agrega al final; si no hay ninguna, se toma como portada.</p>
      </div>

      {previewUrls.length ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-700">Preview de imágenes nuevas</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {previewUrls.map((preview, index) => (
              <div key={`${preview.name}-${index}`} className="space-y-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-700">
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
              <label key={image.id} className="space-y-3 rounded-2xl border border-zinc-200 p-3 text-sm text-zinc-700">
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
                      className="w-24 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
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
        <textarea id="summary" name="summary" defaultValue={property?.summary ?? ""} rows={2} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" placeholder="Texto corto para mostrar en la web" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="description">Descripción</label>
        <textarea id="description" name="description" defaultValue={property?.description ?? ""} rows={5} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400" placeholder="Detalles de la propiedad, propuesta de valor, amenidades..." />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          <input type="checkbox" name="published" defaultChecked={property?.published} className="h-4 w-4" />
          Publicar en página web
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          <input type="checkbox" name="featured" defaultChecked={property?.featured} className="h-4 w-4" />
          Destacar en home
        </label>
      </div>

      {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button disabled={pending} className="rounded-2xl bg-[#1a1817] px-5 py-3 font-medium text-white disabled:opacity-60">
        {pending ? "Guardando..." : property?.id ? "Guardar cambios" : "Crear propiedad"}
      </button>
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text", required = false }: { label: string; name: string; defaultValue?: string; type?: string; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400" />
    </div>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: ReadonlyArray<{ value: string; label: string }>; defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-zinc-400">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
