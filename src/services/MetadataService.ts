export interface PageMetadata {
  title?: string;
  description?: string;
}

class MetadataService {
  update(metadata: PageMetadata) {
    if (metadata.title) {
      document.title = metadata.title;
    }

    let descriptionEl = document.querySelector('meta[name="description"]');
    if (!descriptionEl) {
      descriptionEl = document.createElement('meta');
      descriptionEl.setAttribute('name', 'description');
      document.head.appendChild(descriptionEl);
    }
    descriptionEl.setAttribute('content', metadata.description || '');
  }
}

export const metadataService = new MetadataService();
