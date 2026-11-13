const tipologyInterestMap = {
  studio: "Quiero precios y disponibilidad de studios en la Fase 1 de Yaax Tulum Condos",
  "2-recamaras": "Quiero precios y disponibilidad de unidades de 2 recámaras en la Fase 1 de Yaax Tulum Condos",
  "3-recamaras-lock-off": "Quiero precios y disponibilidad de unidades de 3 recámaras lock-off en la Fase 1 de Yaax Tulum Condos",
  penthouse: "Quiero precios y disponibilidad de penthouses en la Fase 1 de Yaax Tulum Condos",
} as const;

export type TipologySlug = keyof typeof tipologyInterestMap;

export function resolveTipologyInterest(slug?: string | null) {
  if (!slug) return null;
  return tipologyInterestMap[slug as TipologySlug] ?? null;
}

export function getTipologyLabel(slug?: string | null) {
  switch (slug) {
    case "studio":
      return "Studio";
    case "2-recamaras":
      return "2 recámaras";
    case "3-recamaras-lock-off":
      return "3 recámaras lock-off";
    case "penthouse":
      return "Penthouse";
    default:
      return null;
  }
}
