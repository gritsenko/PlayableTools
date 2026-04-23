import routeContentJson from "./route-content.json";

export interface SeoFallbackContent {
  h1: string;
  intro: string;
  highlights: string[];
  secondaryText?: string;
}

const routeContent = routeContentJson as Record<string, SeoFallbackContent>;

export function getSeoFallbackContent(routePath: string): SeoFallbackContent | undefined {
  return routeContent[routePath];
}
