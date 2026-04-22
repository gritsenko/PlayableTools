import routeManifestJson from "./route-manifest.json";

export interface SeoRouteManifestEntry {
  routePath: string;
  canonicalPath?: string;
  indexable: boolean;
  prerender: boolean;
  robots?: string;
}

const routeManifest = routeManifestJson as SeoRouteManifestEntry[];

export function getSeoRouteManifest(): SeoRouteManifestEntry[] {
  return routeManifest;
}

export function getSeoRouteEntry(routePath: string): SeoRouteManifestEntry | undefined {
  return routeManifest.find((entry) => entry.routePath === routePath);
}

export function getPrerenderRoutes(): SeoRouteManifestEntry[] {
  return routeManifest.filter((entry) => entry.indexable && entry.prerender);
}
