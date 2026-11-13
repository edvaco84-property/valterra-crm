"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

type PropertyGalleryProps = {
  images: string[];
  title: string;
};

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((currentIndex) => (currentIndex === 0 ? images.length - 1 : currentIndex - 1));
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((currentIndex) => (currentIndex === images.length - 1 ? 0 : currentIndex + 1));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [images.length, lightboxOpen]);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex] ?? images[0];
  const canNavigate = images.length > 1;

  const showPreviousImage = () => {
    setActiveIndex((currentIndex) => (currentIndex === 0 ? images.length - 1 : currentIndex - 1));
  };

  const showNextImage = () => {
    setActiveIndex((currentIndex) => (currentIndex === images.length - 1 ? 0 : currentIndex + 1));
  };

  return (
    <>
      <section className="overflow-hidden border border-[#5f503d]/45 bg-[#1d1814]">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative block h-[320px] w-full overflow-hidden bg-[#120f0c] sm:h-[420px] lg:h-[520px]"
            aria-label={`Abrir galería de ${title}`}
          >
            <img
              src={activeImage}
              alt={`${title} imagen ${activeIndex + 1}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.42))]" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
              <div className="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#f8efe3] backdrop-blur-sm">
                {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#f8efe3] backdrop-blur-sm">
                <Expand className="h-4 w-4" />
                Ver galería
              </div>
            </div>
          </button>

          {canNavigate ? (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#f8efe3] backdrop-blur-sm transition hover:bg-black/55 sm:left-5"
                aria-label="Ver imagen anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#f8efe3] backdrop-blur-sm transition hover:bg-black/55 sm:right-5"
                aria-label="Ver imagen siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        {canNavigate ? (
          <div className="border-t border-[#5f503d]/35 bg-[#17120f] px-4 py-4 sm:px-6">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((image, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                    aria-pressed={isActive}
                    className={`relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl border transition sm:h-28 sm:w-36 ${
                      isActive ? "border-[#d3b184] ring-2 ring-[#d3b184]/35" : "border-[#5f503d]/45 hover:border-[#8e7454]"
                    }`}
                  >
                    <img src={image} alt={`${title} miniatura ${index + 1}`} className="h-full w-full object-cover" />
                    <div className={`absolute inset-0 transition ${isActive ? "bg-transparent" : "bg-black/20"}`} />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-6 sm:px-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería completa de ${title}`}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:bg-black/55 sm:right-6 sm:top-6"
            aria-label="Cerrar galería"
          >
            <X className="h-5 w-5" />
          </button>

          {canNavigate ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousImage();
                }}
                className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:bg-black/55 sm:left-6"
                aria-label="Ver imagen anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextImage();
                }}
                className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:bg-black/55 sm:right-6"
                aria-label="Ver imagen siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <div className="w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <div className="overflow-hidden border border-white/10 bg-[#120f0c] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <img src={activeImage} alt={`${title} imagen ampliada ${activeIndex + 1}`} className="max-h-[78vh] w-full object-contain" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-[#eadfce]">
              <p>{title}</p>
              <p>{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
