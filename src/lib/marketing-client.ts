"use client";

type MarketingEventInput = {
  eventName: string;
  href?: string;
  label?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  page?: string;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export async function trackMarketingEvent({ eventName, href, label, metadata, page }: MarketingEventInput) {
  const payload = {
    eventName,
    href,
    label,
    metadata,
    page: page || window.location.pathname,
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...payload,
    });
  }

  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Ignore analytics transport failures so conversion UX doesn't choke on marketing tech.
  }
}
