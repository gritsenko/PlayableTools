import html2canvas from "html2canvas";

type ScreenshotWindow = Window & {
  __ptScreenshotInstalled?: boolean;
  __ptScreenshot?: {
    captureBlob: (callback: (error: Error | null, blob: Blob | null) => void) => Promise<void>;
  };
};

type VisibleCanvas = {
  canvas: HTMLCanvasElement;
  rect: DOMRect;
  order: number;
};

function waitForAnimationFrames(targetWindow: Window, frameCount: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }
      targetWindow.requestAnimationFrame(() => step(remaining - 1));
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

function resolveScreenshotBackground(targetWindow: Window, targetDocument: Document): string {
  const candidates = [targetDocument.body, targetDocument.documentElement];
  for (const element of candidates) {
    if (!element) continue;
    const backgroundColor = targetWindow.getComputedStyle(element).backgroundColor;
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      return backgroundColor;
    }
  }

  return '#ffffff';
}

function findVisibleCanvases(targetWindow: Window, targetDocument: Document): VisibleCanvas[] {
  const canvases: VisibleCanvas[] = [];

  for (const [order, canvas] of Array.from(targetDocument.querySelectorAll('canvas')).entries()) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) continue;

    const computed = targetWindow.getComputedStyle(canvas);
    if (computed.display === 'none' || computed.visibility === 'hidden' || Number(computed.opacity) === 0) {
      continue;
    }

    canvases.push({ canvas, rect, order });
  }

  return canvases;
}

function findPrimaryCanvas(canvases: VisibleCanvas[]): HTMLCanvasElement | null {
  let bestCanvas: HTMLCanvasElement | null = null;
  let bestArea = 0;

  for (const entry of canvases) {
    const area = entry.rect.width * entry.rect.height;
    if (area > bestArea) {
      bestArea = area;
      bestCanvas = entry.canvas;
    }
  }

  return bestCanvas;
}

function countMeaningfulDomElements(targetWindow: Window, targetDocument: Document): number {
  if (!targetDocument.body) return 0;

  const walker = targetDocument.createTreeWalker(targetDocument.body, NodeFilter.SHOW_ELEMENT);
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

    const computed = targetWindow.getComputedStyle(element);
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

async function captureCanvasDomComposite(
  targetWindow: Window,
  targetDocument: Document,
  canvases: VisibleCanvas[],
): Promise<Blob> {
  if (canvases.length === 0) {
    throw new Error('No visible canvas was found in the playable.');
  }

  const root = targetDocument.documentElement;
  const viewportWidth = Math.max(targetWindow.innerWidth || root.clientWidth || 1, 1);
  const viewportHeight = Math.max(targetWindow.innerHeight || root.clientHeight || 1, 1);
  const scale = Math.min(2, targetWindow.devicePixelRatio || 1);
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = Math.max(1, Math.round(viewportWidth * scale));
  outputCanvas.height = Math.max(1, Math.round(viewportHeight * scale));
  const cloneViewportStyles = (clonedDocument: Document) => {
    const clonedRoot = clonedDocument.documentElement;
    const clonedBody = clonedDocument.body;
    const widthPx = `${viewportWidth}px`;
    const heightPx = `${viewportHeight}px`;

    if (clonedRoot) {
      clonedRoot.style.width = widthPx;
      clonedRoot.style.minWidth = widthPx;
      clonedRoot.style.maxWidth = widthPx;
      clonedRoot.style.height = heightPx;
      clonedRoot.style.minHeight = heightPx;
      clonedRoot.style.maxHeight = heightPx;
      clonedRoot.style.overflow = 'hidden';
      clonedRoot.style.backgroundColor = 'transparent';
    }

    if (clonedBody) {
      clonedBody.style.width = widthPx;
      clonedBody.style.minWidth = widthPx;
      clonedBody.style.maxWidth = widthPx;
      clonedBody.style.height = heightPx;
      clonedBody.style.minHeight = heightPx;
      clonedBody.style.maxHeight = heightPx;
      clonedBody.style.overflow = 'hidden';
      clonedBody.style.backgroundColor = 'transparent';
    }
  };

  const context = outputCanvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas composite rendering is not available.');
  }

  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.imageSmoothingEnabled = true;
  context.fillStyle = resolveScreenshotBackground(targetWindow, targetDocument);
  context.fillRect(0, 0, viewportWidth, viewportHeight);

  for (const { canvas, rect } of canvases.sort((left, right) => left.order - right.order)) {
    if (canvas.width === 0 || canvas.height === 0) continue;

    try {
      context.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        rect.left,
        rect.top,
        rect.width,
        rect.height,
      );
    } catch (error) {
      console.warn('PlayableTools screenshot: failed to draw a visible canvas into the composite', error);
    }
  }

  const overlayCanvas = await html2canvas(root, {
    backgroundColor: null,
    logging: false,
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: true,
    removeContainer: true,
    scale,
    width: viewportWidth,
    height: viewportHeight,
    windowWidth: viewportWidth,
    windowHeight: viewportHeight,
    x: targetWindow.scrollX,
    y: targetWindow.scrollY,
    scrollX: targetWindow.scrollX,
    scrollY: targetWindow.scrollY,
    ignoreElements: (element) => element.tagName.toLowerCase() === 'canvas',
    onclone: cloneViewportStyles,
  });

  context.drawImage(overlayCanvas, 0, 0, viewportWidth, viewportHeight);
  return canvasToBlob(outputCanvas, 'image/png');
}

async function captureDomScreenshot(targetWindow: Window, targetDocument: Document): Promise<Blob> {
  const root = targetDocument.documentElement;
  const viewportWidth = Math.max(targetWindow.innerWidth || root.clientWidth || 1, 1);
  const viewportHeight = Math.max(targetWindow.innerHeight || root.clientHeight || 1, 1);
  const cloneViewportStyles = (clonedDocument: Document) => {
    const clonedRoot = clonedDocument.documentElement;
    const clonedBody = clonedDocument.body;
    const widthPx = `${viewportWidth}px`;
    const heightPx = `${viewportHeight}px`;

    if (clonedRoot) {
      clonedRoot.style.width = widthPx;
      clonedRoot.style.minWidth = widthPx;
      clonedRoot.style.maxWidth = widthPx;
      clonedRoot.style.height = heightPx;
      clonedRoot.style.minHeight = heightPx;
      clonedRoot.style.maxHeight = heightPx;
      clonedRoot.style.overflow = 'hidden';
    }

    if (clonedBody) {
      clonedBody.style.width = widthPx;
      clonedBody.style.minWidth = widthPx;
      clonedBody.style.maxWidth = widthPx;
      clonedBody.style.height = heightPx;
      clonedBody.style.minHeight = heightPx;
      clonedBody.style.maxHeight = heightPx;
      clonedBody.style.overflow = 'hidden';
    }
  };

  const canvas = await html2canvas(root, {
    backgroundColor: resolveScreenshotBackground(targetWindow, targetDocument),
    logging: false,
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: true,
    removeContainer: true,
    scale: Math.min(2, targetWindow.devicePixelRatio || 1),
    width: viewportWidth,
    height: viewportHeight,
    windowWidth: viewportWidth,
    windowHeight: viewportHeight,
    x: targetWindow.scrollX,
    y: targetWindow.scrollY,
    scrollX: targetWindow.scrollX,
    scrollY: targetWindow.scrollY,
    onclone: cloneViewportStyles,
  });

  return canvasToBlob(canvas, 'image/png');
}

async function captureBlob(targetWindow: Window, targetDocument: Document): Promise<Blob> {
  await waitForAnimationFrames(targetWindow, 2);

  const visibleCanvases = findVisibleCanvases(targetWindow, targetDocument);
  const primaryCanvas = findPrimaryCanvas(visibleCanvases);
  const viewportArea = Math.max(targetWindow.innerWidth, 1) * Math.max(targetWindow.innerHeight, 1);
  const primaryCanvasRect = primaryCanvas?.getBoundingClientRect();
  const primaryCanvasCoverage = primaryCanvasRect
    ? Math.min(primaryCanvasRect.width * primaryCanvasRect.height, viewportArea) / viewportArea
    : 0;
  const meaningfulDomCount = countMeaningfulDomElements(targetWindow, targetDocument);
  const hasDomOverlay = visibleCanvases.length > 0 && meaningfulDomCount >= 3;
  const preferDom = !primaryCanvas || primaryCanvasCoverage < 0.78 || meaningfulDomCount >= 3;
  const strategies: Array<'composite' | 'dom' | 'canvas'> = hasDomOverlay
    ? ['composite', 'canvas', 'dom']
    : (preferDom ? ['dom', 'canvas'] : ['canvas', 'dom']);
  const failures: string[] = [];

  for (const strategy of strategies) {
    try {
      if (strategy === 'composite') {
        return await captureCanvasDomComposite(targetWindow, targetDocument, visibleCanvases);
      }
      if (strategy === 'canvas') {
        return await captureCanvasScreenshot(primaryCanvas);
      }
      return await captureDomScreenshot(targetWindow, targetDocument);
    } catch (error) {
      failures.push(`${strategy}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const details = failures.length > 0 ? ` (${failures.join(' | ')})` : '';
  throw new Error(`Failed to capture playable screenshot${details}`);
}

export function installIframeScreenshotCapture(targetWindow: ScreenshotWindow, targetDocument: Document): void {
  if (targetWindow.__ptScreenshotInstalled) {
    return;
  }

  targetWindow.__ptScreenshotInstalled = true;
  targetWindow.__ptScreenshot = {
    captureBlob: async (callback) => {
      try {
        callback(null, await captureBlob(targetWindow, targetDocument));
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)), null);
      }
    },
  };
}