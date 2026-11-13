export const marketValues = ["CDMX", "ESTADO_DE_MEXICO", "RIVIERA_MAYA"] as const;

export type AppMarket = (typeof marketValues)[number];

export const marketOptions = [
  { value: "CDMX", label: "CDMX" },
  { value: "ESTADO_DE_MEXICO", label: "Estado de Mexico" },
  { value: "RIVIERA_MAYA", label: "Riviera Maya" },
] as const satisfies ReadonlyArray<{ value: AppMarket; label: string }>;

export const marketLabels: Record<AppMarket, string> = {
  CDMX: "CDMX",
  ESTADO_DE_MEXICO: "Estado de Mexico",
  RIVIERA_MAYA: "Riviera Maya",
};

export const marketCenters: Record<AppMarket, { lat: number; lng: number }> = {
  CDMX: { lat: 19.4326, lng: -99.1332 },
  ESTADO_DE_MEXICO: { lat: 19.2904, lng: -100.1047 },
  RIVIERA_MAYA: { lat: 20.2114, lng: -87.4653 },
};

export function getMarketLabel(market: AppMarket | null | undefined) {
  return market ? marketLabels[market] : "Sin mercado";
}
