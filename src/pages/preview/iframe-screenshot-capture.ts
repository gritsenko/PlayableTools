import html2canvas from "html2canvas";

declare global {
  interface Window {
    __ptScreenshotInstalled?: boolean;
    __ptScreenshot?: {
      captureBlob: (callback: (error: Error | null, blob: Blob | null) => void) => Promise<void>;
    };
  }
}

function waitForAnimationFrames(frameCount: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }
      window.requestAnimationFrame(() => step(remaining - 1));
    };
    step(frameCount);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas export failed.'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

function resolveScreenshotBackground(): string {
  const candidates = [document.body, document.documentElement];
  for (const element of candidates) {
    if (!element) continue;
    const backgroundColor = window.getComputedStyle(element).backgroundColor;
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      return backgroundColor;
    }
  }

  return '#ffffff';
}

function findPrimaryCanvas(): HTMLCanvasElement | null {
  let bestCanvas: HTMLCanvasElement | null = null;
  let bestArea = 0;

  for (const canvas of Array.from(document.querySelectorAll('canvas'))) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) continue;

    const computed = window.getComputedStyle(canvas);
    if (computed.display === 'none' || computed.visibility === 'hidden' || Number(computed.opacity) === 0) {
      continue;
    }

    const area = rect.width * rect.height;
    if (area > bestArea) {
      bestArea = area;
      bestCanvas = canvas;
    }
  }

  return bestCanvas;
}

function countMeaningfulDomElements(): number {
  if (!document.body) return 0;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let count = 0;

  while (walker.nextNode()) {
    const element = walker.currentNode as Element;
    const tag = element.tagName.toLowerCase();
    if (['script', 'style', 'meta', 'link', 'noscript', 'canvas'].includes(tag)) continue;

    const htmlElement = element as HTMLElement;
    const rect = typeof htmlElement.getBoundingClientRect === 'function'
      ? htmlElement.getBoundingClientRect()
      : null;
    if (!rect || rect.width < 12 || rect.height < 12) continue;

    const computed = window.getComputedStyle(element);
    if (computed.display === 'none' || computed.visibility === 'hidden' || Number(computed.opacity) === 0) {
      continue;
    }

    const hasText = (element.textContent || '').trim().length > 0;
    const hasGraphicContent = tag === 'img'
      || tag === 'svg'
      || computed.backgroundImage !== 'none'
      || (computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent');

    if (!hasText && !hasGraphicContent && element.children.length === 0) continue;

    count += 1;
    if (count >= 4) {
      return count;
    }
  }

  return count;
}

async function captureCanvasScreenshot(canvas: HTMLCanvasElement | null): Promise<Blob> {
  if (!canvas) {
    throw new Error('No visible canvas was found in the playable.');
  }
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('The playable canvas is empty.');
  }

  return canvasToBlob(canvas, 'image/png');
}

async function captureDomScreenshot(): Promise<Blob> {
  const root = document.documentElement;
  const viewportWidth = Math.max(window.innerWidth || root.clientWidth || 1, 1);
  const viewportHeight = Math.max(window.innerHeight || root.clientHeight || 1, 1);

  const canvas = await html2canvas(root, {
    backgroundColor: resolveScreenshotBackground(),
    logging: false,
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: true,
    removeContainer: true,
    scale: Math.min(2, window.devicePixelRatio || 1),
    width: viewportWidth,
    height: viewportHeight,
    windowWidth: viewportWidth,
    windowHeight: viewportHeight,
    x: window.scrollX,
    y: window.scrollY,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  });

  return canvasToBlob(canvas, 'image/png');
}

async function captureBlob(): Promise<Blob> {
  await waitForAnimationFrames(2);

  const primaryCanvas = findPrimaryCanvas();
  const viewportArea = Math.max(window.innerWidth, 1) * Math.max(window.innerHeight, 1);
  const primaryCanvasRect = primaryCanvas?.getBoundingClientRect();
  const primaryCanvasCoverage = primaryCanvasRect
    ? Math.min(primaryCanvasRect.width * primaryCanvasRect.height, viewportArea) / viewportArea
    : 0;
  const preferDom = !primaryCanvas || primaryCanvasCoverage < 0.78 || countMeaningfulDomElements() >= 3;
  const strategies: Array<'dom' | 'canvas'> = preferDom ? ['dom', 'canvas'] : ['canvas', 'dom'];
  const failures: string[] = [];

  for (const strategy of strategies) {
    try {
      if (strategy === 'canvas') {
        return await captureCanvasScreenshot(primaryCanvas);
      }
      return await captureDomScreenshot();
    } catch (error) {
      failures.push(`${strategy}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const details = failures.length > 0 ? ` (${failures.join(' | ')})` : '';
  throw new Error(`Failed to capture playable screenshot${details}`);
}

if (!window.__ptScreenshotInstalled) {
  window.__ptScreenshotInstalled = true;
  window.__ptScreenshot = {
    captureBlob: async (callback) => {
      try {
        callback(null, await captureBlob());
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)), null);
      }
    },
  };
}

export {};