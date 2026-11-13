"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Check, Copy, Search, SlidersHorizontal, X } from "lucide-react";
import { getMarketLabel, type AppMarket } from "@/lib/markets";
import { formatCurrency } from "@/lib/utils";

type CatalogProperty = {
  id: string;
  title: string;
  zone: string;
  market: AppMarket;
  propertyType: string;
  operationType: string;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;
  summary: string | null;
  description: string | null;
  imageUrl: string | null;
};

type PublicPropertiesCatalogProps = {
  initialQueryString: string;
  properties: CatalogProperty[];
};

type SortOption = "featured" | "price-asc" | "price-desc" | "area-desc";
type CatalogFilters = {
  search: string;
  market: CatalogProperty["market"] | "all";
  zone: string;
  propertyType: string;
  operationType: string;
  minBedrooms: string;
  priceRange: string;
  sortBy: SortOption;
};

const defaultFilters: CatalogFilters = {
  search: "",
  market: "all",
  zone: "all",
  propertyType: "all",
  operationType: "all",
  minBedrooms: "all",
  priceRange: "all",
  sortBy: "featured",
};

function parseFilters(
  searchParams: URLSearchParams,
  {
    zones,
    availableMarkets,
    propertyTypes,
    operationTypes,
    bedroomOptions,
  }: {
    zones: string[];
    availableMarkets: CatalogProperty["market"][];
    propertyTypes: string[];
    operationTypes: string[];
    bedroomOptions: number[];
  },
): CatalogFilters {
  const minBedroomsParam = searchParams.get("recamaras") ?? defaultFilters.minBedrooms;
  const sortByParam = searchParams.get("orden") ?? defaultFilters.sortBy;
  const validPriceRanges = new Set(["all", "under-3m", "3m-6m", "6m-10m", "over-10m"]);
  const validSortOptions = new Set<SortOption>(["featured", "price-asc", "price-desc", "area-desc"]);

  return {
    search: searchParams.get("buscar") ?? defaultFilters.search,
    market: availableMarkets.includes((searchParams.get("mercado") as CatalogProperty["market"]) ?? "all")
      ? ((searchParams.get("mercado") as CatalogProperty["market"]) ?? defaultFilters.market)
      : defaultFilters.market,
    zone: zones.includes(searchParams.get("ubicacion") ?? "") ? (searchParams.get("ubicacion") as string) : defaultFilters.zone,
    propertyType: propertyTypes.includes(searchParams.get("tipo") ?? "") ? (searchParams.get("tipo") as string) : defaultFilters.propertyType,
    operationType: operationTypes.includes(searchParams.get("operacion") ?? "") ? (searchParams.get("operacion") as string) : defaultFilters.operationType,
    minBedrooms: bedroomOptions.map(String).includes(minBedroomsParam) ? minBedroomsParam : defaultFilters.minBedrooms,
    priceRange: validPriceRanges.has(searchParams.get("precio") ?? "") ? (searchParams.get("precio") as string) : defaultFilters.priceRange,
    sortBy: validSortOptions.has(sortByParam as SortOption) ? (sortByParam as SortOption) : defaultFilters.sortBy,
  };
}

function filtersEqual(a: CatalogFilters, b: CatalogFilters) {
  return (
    a.search === b.search &&
    a.market === b.market &&
    a.zone === b.zone &&
    a.propertyType === b.propertyType &&
    a.operationType === b.operationType &&
    a.minBedrooms === b.minBedrooms &&
    a.priceRange === b.priceRange &&
    a.sortBy === b.sortBy
  );
}

export function PublicPropertiesCatalog({ initialQueryString, properties }: PublicPropertiesCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const zones = useMemo(() => [...new Set(properties.map((property) => property.zone))].sort((a, b) => a.localeCompare(b)), [properties]);
  const propertyTypes = useMemo(() => [...new Set(properties.map((property) => property.propertyType))].sort((a, b) => a.localeCompare(b)), [properties]);
  const operationTypes = useMemo(() => [...new Set(properties.map((property) => property.operationType))].sort((a, b) => a.localeCompare(b)), [properties]);
  const bedroomOptions = useMemo(
    () => [...new Set(properties.map((property) => property.bedrooms).filter((value): value is number => typeof value === "number"))].sort((a, b) => a - b),
    [properties],
  );
  const availableMarkets = useMemo(() => [...new Set(properties.map((property) => property.market))], [properties]);
  const [origin] = useState(() => (typeof window === "undefined" ? "" : window.location.origin));
  const [filters, setFilters] = useState<CatalogFilters>(() =>
    parseFilters(new URLSearchParams(initialQueryString), { zones, availableMarkets, propertyTypes, operationTypes, bedroomOptions }),
  );
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const normalizedSearch = filters.search.trim().toLowerCase();

  useEffect(() => {
    const syncFromLocation = () => {
      const nextFilters = parseFilters(new URLSearchParams(window.location.search), { zones, availableMarkets, propertyTypes, operationTypes, bedroomOptions });
      setFilters((currentFilters) => (filtersEqual(currentFilters, nextFilters) ? currentFilters : nextFilters));
    };

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, [availableMarkets, bedroomOptions, operationTypes, propertyTypes, zones]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (filters.search) nextParams.set("buscar", filters.search);
    if (filters.market !== defaultFilters.market) nextParams.set("mercado", filters.market);
    if (filters.zone !== defaultFilters.zone) nextParams.set("ubicacion", filters.zone);
    if (filters.propertyType !== defaultFilters.propertyType) nextParams.set("tipo", filters.propertyType);
    if (filters.operationType !== defaultFilters.operationType) nextParams.set("operacion", filters.operationType);
    if (filters.minBedrooms !== defaultFilters.minBedrooms) nextParams.set("recamaras", filters.minBedrooms);
    if (filters.priceRange !== defaultFilters.priceRange) nextParams.set("precio", filters.priceRange);
    if (filters.sortBy !== defaultFilters.sortBy) nextParams.set("orden", filters.sortBy);

    const nextQuery = nextParams.toString();
    const currentQuery = window.location.search.startsWith("?") ? window.location.search.slice(1) : window.location.search;

    if (nextQuery === currentQuery) {
      return;
    }

    startTransition(() => {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    });
  }, [filters, pathname, router, startTransition]);

  const filteredProperties = properties
    .filter((property) => {
      const matchesSearch =
        !normalizedSearch ||
        [property.title, property.zone, property.propertyType, property.operationType, property.summary, property.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesMarket = filters.market === "all" || property.market === filters.market;
      const matchesZone = filters.zone === "all" || property.zone === filters.zone;
      const matchesPropertyType = filters.propertyType === "all" || property.propertyType === filters.propertyType;
      const matchesOperationType = filters.operationType === "all" || property.operationType === filters.operationType;
      const matchesBedrooms =
        filters.minBedrooms === "all" || (typeof property.bedrooms === "number" && property.bedrooms >= Number(filters.minBedrooms));

      const matchesPriceRange =
        filters.priceRange === "all" ||
        (filters.priceRange === "under-3m" && property.price < 3_000_000) ||
        (filters.priceRange === "3m-6m" && property.price >= 3_000_000 && property.price <= 6_000_000) ||
        (filters.priceRange === "6m-10m" && property.price > 6_000_000 && property.price <= 10_000_000) ||
        (filters.priceRange === "over-10m" && property.price > 10_000_000);

      return matchesSearch && matchesMarket && matchesZone && matchesPropertyType && matchesOperationType && matchesBedrooms && matchesPriceRange;
    })
    .sort((a, b) => {
      if (filters.sortBy === "price-asc") return a.price - b.price;
      if (filters.sortBy === "price-desc") return b.price - a.price;
      if (filters.sortBy === "area-desc") return (b.areaM2 ?? 0) - (a.areaM2 ?? 0);
      return 0;
    });

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const copyCurrentSearch = async () => {
    const query = new URLSearchParams();

    if (filters.search) query.set("buscar", filters.search);
    if (filters.market !== defaultFilters.market) query.set("mercado", filters.market);
    if (filters.zone !== defaultFilters.zone) query.set("ubicacion", filters.zone);
    if (filters.propertyType !== defaultFilters.propertyType) query.set("tipo", filters.propertyType);
    if (filters.operationType !== defaultFilters.operationType) query.set("operacion", filters.operationType);
    if (filters.minBedrooms !== defaultFilters.minBedrooms) query.set("recamaras", filters.minBedrooms);
    if (filters.priceRange !== defaultFilters.priceRange) query.set("precio", filters.priceRange);
    if (filters.sortBy !== defaultFilters.sortBy) query.set("orden", filters.sortBy);

    const nextQuery = query.toString();
    const shareUrl = `${origin}${pathname}${nextQuery ? `?${nextQuery}` : ""}`;

    try {
      await navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    window.setTimeout(() => {
      setCopyState("idle");
    }, 2200);
  };

  const updateFilter = <Key extends keyof CatalogFilters>(key: Key, value: CatalogFilters[Key]) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-[2rem] border border-[#5f503d]/45 bg-[#1b1612] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#d6c0a0]">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros inteligentes
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[#f4e7d7] sm:text-3xl">Encuentra más rápido lo que se alinea a tu búsqueda</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#dccdb8]/82">
              Filtra por ubicación, precio, tipo de propiedad y perfil de operación para comparar opciones con más claridad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-[#7f6748] bg-[#221b16] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0ddc1]">
              {filteredProperties.length} {filteredProperties.length === 1 ? "resultado" : "resultados"}
            </div>
            <button
              type="button"
              onClick={copyCurrentSearch}
              className="inline-flex items-center gap-2 rounded-full border border-[#8b7354] bg-[#241c15] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f0ddc1] transition hover:border-[#d3b184] hover:text-white"
            >
              {copyState === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copyState === "copied" ? "Búsqueda copiada" : copyState === "error" ? "No se pudo copiar" : "Copiar búsqueda"}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-full border border-[#6b5840] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#dccdb8] transition hover:border-[#9d825d] hover:text-white"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#cab394]">Buscar</span>
            <div className="flex items-center gap-3 border border-[#5f503d] bg-[#15110d] px-4 py-3 text-sm text-[#f5ede2]">
              <Search className="h-4 w-4 text-[#b89b72]" />
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Tulum, penthouse, Yaax..."
                className="w-full bg-transparent outline-none placeholder:text-[#8d7a60]"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#cab394]">Mercado</span>
            <select value={filters.market} onChange={(event) => updateFilter("market", event.target.value as CatalogFilters["market"])} className="w-full border border-[#5f503d] bg-[#15110d] px-4 py-3 text-sm text-[#f5ede2] outline-none">
              <option value="all">Todos los mercados</option>
              {availableMarkets.map((market) => (
                <option key={market} value={market}>
                  {getMarketLabel(market)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#cab394]">Ubicación</span>
            <select value={filters.zone} onChange={(event) => updateFilter("zone", event.target.value)} className="w-full border border-[#5f503d] bg-[#15110d] px-4 py-3 text-sm text-[#f5ede2] outline-none">
              <option value="all">Todas las ubicaciones</option>
              {zones.map((zoneOption) => (
                <option key={zoneOption} value={zoneOption}>
                  {zoneOption}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#cab394]">Tipo</span>
            <select value={filters.propertyType} onChange={(event) => updateFilter("propertyType", event.target.value)} className="w-full border border-[#5f503d] bg-[#15110d] px-4 py-3 text-sm text-[#f5ede2] outline-none">
              <option value="all">Todos los tipos</option>
              {propertyTypes.map((typeOption) => (
                <option key={typeOption} value={typeOption}>
                  {typeOption}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#cab394]">Operación</span>
            <select
              value={filters.operationType}
              onChange={(event) => updateFilter("operationType", event.target.value)}
              className="w-full border border-[#5f503d] bg-[#15110d] px-4 py-3 text-sm text-[#f5ede2] outline-none"
            >
              <option value="all">Compra o renta</option>
              {operationTypes.map((operationOption) => (
                <option key={operationOption} value={operationOption}>
                  {operationOption}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#cab394]">Recámaras</span>
            <select
              value={filters.minBedrooms}
              onChange={(event) => updateFilter("minBedrooms", event.target.value)}
              className="w-full border border-[#5f503d] bg-[#15110d] px-4 py-3 text-sm text-[#f5ede2] outline-none"
            >
              <option value="all">Cualquier configuración</option>
              {bedroomOptions.map((bedroomOption) => (
                <option key={bedroomOption} value={String(bedroomOption)}>
                  {bedroomOption}+ recámaras
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#cab394]">Rango de precio</span>
            <select
              value={filters.priceRange}
              onChange={(event) => updateFilter("priceRange", event.target.value)}
              className="w-full border border-[#5f503d] bg-[#15110d] px-4 py-3 text-sm text-[#f5ede2] outline-none"
            >
              <option value="all">Todos los precios</option>
              <option value="under-3m">Menos de $3M</option>
              <option value="3m-6m">$3M a $6M</option>
              <option value="6m-10m">$6M a $10M</option>
              <option value="over-10m">Más de $10M</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#cab394]">Ordenar</span>
            <select
              value={filters.sortBy}
              onChange={(event) => updateFilter("sortBy", event.target.value as SortOption)}
              className="w-full border border-[#5f503d] bg-[#15110d] px-4 py-3 text-sm text-[#f5ede2] outline-none"
            >
              <option value="featured">Orden editorial</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="area-desc">Mayor superficie</option>
            </select>
          </label>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#cab394]">Mercados disponibles</span>
            <div className="flex min-h-[50px] flex-wrap items-center gap-2 border border-[#5f503d] bg-[#15110d] px-4 py-3 text-sm text-[#f5ede2]">
              {availableMarkets.map((market) => (
                <span key={market} className="rounded-full border border-[#7f6748] bg-[#241c15] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f0ddc1]">
                  {getMarketLabel(market)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {filteredProperties.length ? (
          filteredProperties.map((property) => (
            <article key={property.id} className="border border-[#5f503d]/45 bg-[#1d1814] p-3">
              {property.imageUrl ? (
                <div
                  className="h-64 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${property.imageUrl}')`,
                  }}
                />
              ) : (
                <div className="flex h-64 flex-col justify-between bg-[linear-gradient(160deg,#2a221c_0%,#1b1612_100%)] p-5">
                  <span className="text-xs uppercase tracking-[0.24em] text-[#c5a57c]">{getMarketLabel(property.market)}</span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#d6c0a0]">Valterra</p>
                    <p className="mt-3 font-serif text-3xl text-[#f4e7d7]">{property.title}</p>
                    <p className="mt-3 text-sm leading-6 text-[#dccdb8]/78">{property.zone}</p>
                  </div>
                </div>
              )}
              <div className="px-3 pb-4 pt-5 text-center">
                <h2 className="font-serif text-3xl text-[#f4e7d7]">{property.title}</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#b89b72]">
                  {property.zone} · {getMarketLabel(property.market)}
                </p>
                <p className="mt-4 text-lg text-[#f4e7d7]">{formatCurrency(property.price, property.currency)}</p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#dccdb8]/82">
                  <span className="border border-[#5f503d] px-2 py-1">{property.propertyType}</span>
                  <span className="border border-[#5f503d] px-2 py-1">{property.operationType}</span>
                  {typeof property.bedrooms === "number" ? <span className="border border-[#5f503d] px-2 py-1">{property.bedrooms} rec</span> : null}
                  {typeof property.bathrooms === "number" ? <span className="border border-[#5f503d] px-2 py-1">{property.bathrooms} baños</span> : null}
                  {typeof property.areaM2 === "number" ? <span className="border border-[#5f503d] px-2 py-1">{property.areaM2} m2</span> : null}
                </div>

                <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#dccdb8]/80">
                  {property.summary || property.description || "Propiedad seleccionada para clientes que buscan ubicación, valor comercial y mejor contexto de decisión."}
                </p>
                <Link href={`/propiedades/${property.id}`} className="mt-6 inline-flex items-center justify-center gap-2 bg-[#d3b184] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95]">
                  Ver propiedad
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="lg:col-span-3 rounded-[1.5rem] border border-dashed border-[#5f503d] px-6 py-12 text-center text-[#dccdb8]/80">
            Ninguna propiedad coincide con esos filtros. Prueba con otro rango de precio, ubicación o tipo de operación.
          </div>
        )}
      </section>
    </div>
  );
}
