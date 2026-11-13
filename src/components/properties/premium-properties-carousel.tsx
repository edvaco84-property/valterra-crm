"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getMarketLabel, type AppMarket } from "@/lib/markets";
import { formatCurrency } from "@/lib/utils";

type PremiumProperty = {
  id: string;
  title: string;
  zone: string;
  market: AppMarket;
  price: number;
  currency: string;
  summary: string | null;
  description: string | null;
  imageUrl: string | null;
};

type PremiumPropertiesCarouselProps = {
  properties: PremiumProperty[];
};

export function PremiumPropertiesCarousel({ properties }: PremiumPropertiesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    const updateActiveIndex = () => {
      const card = track.querySelector<HTMLElement>("[data-premium-card]");
      if (!card) return;

      const cardWidth = card.getBoundingClientRect().width;
      const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "0");
      const step = cardWidth + gap;
      const index = Math.round(track.scrollLeft / step);
      setActiveIndex(Math.max(0, Math.min(index, properties.length - 1)));
    };

    updateActiveIndex();
    track.addEventListener("scroll", updateActiveIndex, { passive: true });

    return () => {
      track.removeEventListener("scroll", updateActiveIndex);
    };
  }, [properties.length]);

  const scrollToCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>("[data-premium-card]");
    if (!card) return;

    const cardWidth = card.getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "0");
    const step = cardWidth + gap;
    const cardsPerView = window.innerWidth >= 1280 ? 3 : window.innerWidth >= 1024 ? 2 : 1;
    const maxIndex = Math.max(0, properties.length - cardsPerView);
    const nextIndex = Math.max(0, Math.min(activeIndex + direction, maxIndex));

    track.scrollTo({
      left: step * nextIndex,
      behavior: "smooth",
    });
  };

  if (properties.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#5f503d] px-6 py-12 text-center text-[#dccdb8]/80">
        Aún no hay propiedades publicadas. En cuanto el equipo libere inventario para web, aparecerá aquí automáticamente.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#b89b72]">
          Navega la selección
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollToCard(-1)}
            disabled={activeIndex === 0}
            aria-label="Ver propiedad anterior"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#a98a61] bg-[#211a15] text-[#f3e7d6] shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-[#2a221c] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollToCard(1)}
            disabled={activeIndex >= Math.max(0, properties.length - (typeof window !== "undefined" && window.innerWidth >= 1280 ? 3 : typeof window !== "undefined" && window.innerWidth >= 1024 ? 2 : 1))}
            aria-label="Ver siguiente propiedad"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#a98a61] bg-[#211a15] text-[#f3e7d6] shadow-[0_10px_24px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-[#2a221c] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8f7a60]">
            {String(activeIndex + 1).padStart(2, "0")} / {String(properties.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-5 xl:gap-8"
      >
        {properties.map((property) => (
          <article
            key={property.id}
            data-premium-card
            className="min-w-full snap-start border border-[#5f503d]/45 bg-[#1d1814] p-3 md:min-w-[calc(50%-0.75rem)] xl:min-w-[calc((100%-5.25rem)/3)]"
          >
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
              <h3 className="font-serif text-3xl text-[#f4e7d7]">{property.title}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#b89b72]">
                {property.zone} · {getMarketLabel(property.market)}
              </p>
              <p className="mt-4 text-lg text-[#f4e7d7]">{formatCurrency(property.price, property.currency)}</p>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#dccdb8]/80">
                {property.summary || property.description || "Propiedad selecta para clientes que buscan ubicación, criterio y presencia."}
              </p>
              <Link
                href={`/propiedades/${property.id}`}
                className="mt-6 inline-flex items-center justify-center gap-2 bg-[#d3b184] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1d1712] transition hover:bg-[#e0bf95]"
              >
                Ver propiedad
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {properties.map((property, index) => (
          <button
            key={property.id}
            type="button"
            onClick={() => {
              const track = trackRef.current;
              const card = track?.querySelector<HTMLElement>("[data-premium-card]");
              if (!track || !card) return;

              const cardWidth = card.getBoundingClientRect().width;
              const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "0");
              const step = cardWidth + gap;

              track.scrollTo({
                left: step * index,
                behavior: "smooth",
              });
            }}
            aria-label={`Ir a la propiedad ${index + 1}`}
            className={`h-2.5 rounded-full transition ${index === activeIndex ? "w-8 bg-[#d3b184]" : "w-2.5 bg-[#6b5841]"}`}
          />
        ))}
      </div>
    </div>
  );
}
