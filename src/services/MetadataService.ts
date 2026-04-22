export interface PageMetadata {
  title?: string;
  description?: string;
  canonicalPath?: string;
  robots?: string;
}

interface MetadataUpdateContext {
  currentPath?: string;
  canonicalOrigin?: string;
}

class MetadataService {
  private upsertMeta(selector: string, attributes: Record<string, string>) {
    let element = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement("meta");
      document.head.appendChild(element);
    }

    Object.entries(attributes).forEach(([name, value]) => {
      element!.setAttribute(name, value);
    });
  }

  private setCanonical(href: string | null) {
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!href) {
      canonical?.remove();
      return;
    }

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", href);
  }

  update(metadata: PageMetadata, context: MetadataUpdateContext = {}) {
    if (metadata.title) {
      document.title = metadata.title;
    }

    this.upsertMeta('meta[name="description"]', {
      name: "description",
      content: metadata.description || "",
    });

    this.upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: metadata.robots || "index,follow",
    });

    const siteOriginMeta = document.head.querySelector('meta[name="site-origin"]') as HTMLMetaElement | null;
    const canonicalOrigin = context.canonicalOrigin ?? siteOriginMeta?.content ?? window.location.origin;
    const currentPath = context.currentPath ?? `${window.location.pathname}${window.location.search}`;
    const canonicalPath = metadata.canonicalPath ?? null;

    const ogUrl = new URL(canonicalPath ?? currentPath, canonicalOrigin).toString();
    this.upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: ogUrl,
    });

    if (canonicalPath) {
      const canonicalUrl = new URL(canonicalPath, canonicalOrigin).toString();
      this.setCanonical(canonicalUrl);
    } else {
      this.setCanonical(null);
    }
  }
}

export const metadataService = new MetadataService();
