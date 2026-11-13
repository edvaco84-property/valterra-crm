"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { trackMarketingEvent } from "@/lib/marketing-client";

type TrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: string;
  href: string;
  label?: string;
  page?: string;
  target?: string;
  rel?: string;
};

export function TrackedAnchor({
  children,
  className,
  eventName,
  href,
  label,
  page,
  rel,
  target,
}: TrackedLinkProps) {
  function handleClick() {
    void trackMarketingEvent({
      eventName,
      label,
      page,
      href,
    });
  }

  return (
    <a href={href} target={target} rel={rel} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

type TrackedInternalLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  eventName: string;
  href: string;
  label?: string;
  page?: string;
};

export function TrackedInternalLink({
  children,
  eventName,
  href,
  label,
  onClick,
  page,
  ...props
}: TrackedInternalLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    void trackMarketingEvent({
      eventName,
      label,
      page,
      href,
    });

    onClick?.(event);
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
