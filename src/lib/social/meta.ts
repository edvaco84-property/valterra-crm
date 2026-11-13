import type { AppMarket } from "@/lib/markets";
import { buildInstagramCaption } from "@/lib/social/instagram";

type MetaPublishableProperty = {
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
  images: Array<{
    url: string;
  }>;
  development: {
    title: string;
    slug: string;
  } | null;
};

type MetaPublishResult = {
  externalId: string;
  externalUrl: string | null;
  syncNotes: string;
};

type MetaGraphSuccess<T> = T & {
  error?: never;
};

type MetaGraphFailure = {
  error: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
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

function getPropertyUrl(propertyId: string) {
  return new URL(`/propiedades/${propertyId}`, getBaseUrl()).toString();
}

function getMetaConfig() {
  const accessToken = process.env.META_ACCESS_TOKEN?.trim();
  const facebookPageId = process.env.META_FACEBOOK_PAGE_ID?.trim();
  const instagramBusinessAccountId = process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim();
  const apiVersion = process.env.META_GRAPH_API_VERSION?.trim() || "v23.0";

  return {
    accessToken,
    facebookPageId,
    instagramBusinessAccountId,
    apiVersion,
  };
}

function assertMetaConfig(channel: "FACEBOOK" | "INSTAGRAM") {
  const config = getMetaConfig();

  if (!config.accessToken) {
    throw new Error("Falta META_ACCESS_TOKEN para publicar en Meta.");
  }

  if (channel === "FACEBOOK" && !config.facebookPageId) {
    throw new Error("Falta META_FACEBOOK_PAGE_ID para publicar en Facebook.");
  }

  if (channel === "INSTAGRAM" && !config.instagramBusinessAccountId) {
    throw new Error("Falta META_INSTAGRAM_BUSINESS_ACCOUNT_ID para publicar en Instagram.");
  }

  return {
    accessToken: config.accessToken,
    facebookPageId: config.facebookPageId ?? "",
    instagramBusinessAccountId: config.instagramBusinessAccountId ?? "",
    apiVersion: config.apiVersion,
  };
}

function resolveImageUrls(property: MetaPublishableProperty) {
  const candidates = [
    ...property.images.map((image) => image.url),
    property.imageUrl,
  ].filter((value): value is string => Boolean(value));

  const unique = Array.from(new Set(candidates.map((value) => toAbsoluteUrl(value)).filter((value): value is string => Boolean(value))));

  if (!unique.length) {
    throw new Error("La propiedad no tiene imágenes publicables para Meta.");
  }

  return unique.slice(0, 10);
}

function getSocialCaption(property: MetaPublishableProperty) {
  return buildInstagramCaption({
    id: property.id,
    title: property.title,
    market: property.market,
    zone: property.zone,
    propertyType: property.propertyType,
    operationType: property.operationType,
    price: property.price,
    currency: property.currency,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaM2: property.areaM2,
    summary: property.summary,
    description: property.description,
    imageUrl: property.imageUrl,
    development: property.development,
  });
}

async function readGraphResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    const error = payload as MetaGraphFailure;
    const message = error.error?.message || `Meta devolvió ${response.status}.`;
    throw new Error(message);
  }

  if ((payload as MetaGraphFailure).error) {
    throw new Error((payload as MetaGraphFailure).error.message || "Meta devolvió un error.");
  }

  return payload;
}

async function metaGraphPost<T>(path: string, params: Record<string, string | boolean>) {
  const { accessToken, apiVersion } = getMetaConfig();

  if (!accessToken) {
    throw new Error("Falta META_ACCESS_TOKEN para llamar a Meta.");
  }

  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    body.set(key, String(value));
  });
  body.set("access_token", accessToken);

  const response = await fetch(`https://graph.facebook.com/${apiVersion}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  return readGraphResponse<MetaGraphSuccess<T>>(response);
}

async function metaGraphGet<T>(path: string, params: Record<string, string>) {
  const { accessToken, apiVersion } = getMetaConfig();

  if (!accessToken) {
    throw new Error("Falta META_ACCESS_TOKEN para llamar a Meta.");
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  searchParams.set("access_token", accessToken);

  const response = await fetch(`https://graph.facebook.com/${apiVersion}${path}?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  return readGraphResponse<MetaGraphSuccess<T>>(response);
}

function buildFacebookPostUrl(pageId: string, postId: string) {
  const [, storyId] = postId.split("_");
  return storyId ? `https://www.facebook.com/${pageId}/posts/${storyId}` : null;
}

export async function publishPropertyToFacebook(property: MetaPublishableProperty): Promise<MetaPublishResult> {
  const { facebookPageId } = assertMetaConfig("FACEBOOK");
  const imageUrls = resolveImageUrls(property);
  const caption = getSocialCaption(property);

  if (imageUrls.length === 1) {
    const photo = await metaGraphPost<{ id: string; post_id?: string }>(`/${facebookPageId}/photos`, {
      url: imageUrls[0]!,
      caption,
      published: true,
    });

    const externalId = photo.post_id || photo.id;
    let externalUrl = buildFacebookPostUrl(facebookPageId, externalId);

    if (photo.post_id) {
      const permalink = await metaGraphGet<{ permalink_url?: string }>(`/${photo.post_id}`, {
        fields: "permalink_url",
      }).catch(() => null);

      externalUrl = permalink?.permalink_url || externalUrl;
    }

    return {
      externalId,
      externalUrl,
      syncNotes: "Publicado en Facebook con 1 imagen.",
    };
  }

  const mediaIds = await Promise.all(
    imageUrls.map(async (imageUrl) => {
      const photo = await metaGraphPost<{ id: string }>(`/${facebookPageId}/photos`, {
        url: imageUrl,
        published: false,
      });

      return photo.id;
    }),
  );

  const postParams: Record<string, string | boolean> = {
    message: caption,
    published: true,
  };

  mediaIds.forEach((mediaId, index) => {
    postParams[`attached_media[${index}]`] = JSON.stringify({ media_fbid: mediaId });
  });

  const post = await metaGraphPost<{ id: string }>(`/${facebookPageId}/feed`, postParams);
  const permalink = await metaGraphGet<{ permalink_url?: string }>(`/${post.id}`, {
    fields: "permalink_url",
  }).catch(() => null);

  return {
    externalId: post.id,
    externalUrl: permalink?.permalink_url || buildFacebookPostUrl(facebookPageId, post.id),
    syncNotes: `Publicado en Facebook con ${mediaIds.length} imágenes.`,
  };
}

export async function publishPropertyToInstagram(property: MetaPublishableProperty): Promise<MetaPublishResult> {
  const { instagramBusinessAccountId } = assertMetaConfig("INSTAGRAM");
  const imageUrls = resolveImageUrls(property);
  const caption = getSocialCaption(property);

  const creationId =
    imageUrls.length === 1
      ? (
          await metaGraphPost<{ id: string }>(`/${instagramBusinessAccountId}/media`, {
            image_url: imageUrls[0]!,
            caption,
          })
        ).id
      : (
          await (async () => {
            const childIds = await Promise.all(
              imageUrls.map(async (imageUrl) => {
                const child = await metaGraphPost<{ id: string }>(`/${instagramBusinessAccountId}/media`, {
                  image_url: imageUrl,
                  is_carousel_item: true,
                });

                return child.id;
              }),
            );

            const parent = await metaGraphPost<{ id: string }>(`/${instagramBusinessAccountId}/media`, {
              media_type: "CAROUSEL",
              caption,
              children: childIds.join(","),
            });

            return parent.id;
          })()
        );

  const published = await metaGraphPost<{ id: string }>(`/${instagramBusinessAccountId}/media_publish`, {
    creation_id: creationId,
  });

  const media = await metaGraphGet<{ permalink?: string }>(`/${published.id}`, {
    fields: "permalink",
  }).catch(() => null);

  return {
    externalId: published.id,
    externalUrl: media?.permalink || null,
    syncNotes:
      imageUrls.length === 1
        ? "Publicado en Instagram con 1 imagen."
        : `Publicado en Instagram como carrusel con ${imageUrls.length} imágenes.`,
  };
}

export function getMetaPropertyUrl(propertyId: string) {
  return getPropertyUrl(propertyId);
}
