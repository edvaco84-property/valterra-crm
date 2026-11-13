import { formatCurrency } from "@/lib/utils";
import { getMarketLabel, type AppMarket } from "@/lib/markets";

type InstagramProperty = {
  id: string;
  title: string;
  market: AppMarket;
  zone: string;
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
  development: {
    title: string;
    slug: string;
  } | null;
};

function getBaseUrl() {
  return process.env.APP_URL || "https://valterra-crm.fly.dev";
}

function toAbsoluteUrl(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return new URL(value, getBaseUrl()).toString();
}

function toHashtagToken(value: string) {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  return cleaned ? `#${cleaned}` : null;
}

function getPropertyUrl(propertyId: string) {
  return new URL(`/propiedades/${propertyId}`, getBaseUrl()).toString();
}

function pluralize(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function getSpecsLine(property: InstagramProperty) {
  const specs = [
    property.bedrooms ? pluralize(property.bedrooms, "recámara", "recámaras") : null,
    property.bathrooms ? pluralize(property.bathrooms, "baño", "baños") : null,
    property.areaM2 ? `${property.areaM2} m²` : null,
  ].filter(Boolean);

  return specs.length ? specs.join(" · ") : "Solicita ficha y disponibilidad actualizada";
}

function getDescription(property: InstagramProperty) {
  return property.summary || property.description || "Propiedad publicada en inventario activo de Valterra.";
}

function getCommercialHook(property: InstagramProperty) {
  if (property.development?.slug === "yaax-tulum-condos") {
    if (property.bedrooms === 1) {
      return "Ideal para entrada más accesible en Tulum con perfil fuerte para renta vacacional o uso personal.";
    }

    if (property.bedrooms === 2) {
      return "Una tipología muy sólida para quien busca equilibrio entre uso personal, plusvalía y ticket competitivo.";
    }

    if ((property.bedrooms ?? 0) >= 3) {
      return "Perfil premium para comprador que quiere más amplitud, presencia y potencial de renta superior.";
    }
  }

  return "Opción activa dentro del inventario comercial de Valterra con atención directa para resolver disponibilidad y siguiente paso.";
}

function getHashtags(property: InstagramProperty) {
  return [
    "#Valterra",
    "#BienesRaices",
    "#InmueblesMexico",
    toHashtagToken(property.zone),
    toHashtagToken(getMarketLabel(property.market)),
    toHashtagToken(property.propertyType),
    toHashtagToken(property.operationType),
    property.development ? toHashtagToken(property.development.title) : null,
  ].filter((value): value is string => Boolean(value));
}

export function buildInstagramCaption(property: InstagramProperty) {
  const lines = [
    property.title,
    `${property.zone} · ${getMarketLabel(property.market)}`,
    formatCurrency(property.price, property.currency),
    getSpecsLine(property),
    "",
    getCommercialHook(property),
    getDescription(property),
    "",
    "Escríbenos por DM para recibir disponibilidad actualizada, ficha y siguiente paso.",
    getPropertyUrl(property.id),
    "",
    getHashtags(property).join(" "),
  ];

  return lines.join("\n");
}

export function buildInstagramPostDraft(property: InstagramProperty) {
  return {
    id: property.id,
    title: property.title,
    development: property.development?.title || null,
    market: property.market,
    marketLabel: getMarketLabel(property.market),
    zone: property.zone,
    propertyType: property.propertyType,
    operationType: property.operationType,
    price: property.price,
    currency: property.currency,
    priceLabel: formatCurrency(property.price, property.currency),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaM2: property.areaM2,
    imageUrl: toAbsoluteUrl(property.imageUrl),
    propertyUrl: getPropertyUrl(property.id),
    caption: buildInstagramCaption(property),
    hashtags: getHashtags(property),
  };
}
