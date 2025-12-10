(function() {
  'use strict';

  // Expose API to parent window
  window.__ptScreenshot = {
    captureBlob: async (callback) => {
      try {
        // Wait a bit for WebGL to be ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find any canvas elements (common for games/WebGL content)
        const canvases = document.querySelectorAll('canvas');
        console.log(`[Screenshot] Found ${canvases.length} canvas elements`);
        
        let targetCanvas = null;

        // Try to find the largest visible canvas (likely the game canvas)
        if (canvases.length > 0) {
          let maxArea = 0;
          for (const canvas of canvases) {
            const rect = canvas.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            const area = canvas.width * canvas.height;
            console.log(`[Screenshot] Canvas: ${canvas.width}x${canvas.height} (visible: ${isVisible}, area: ${area})`);
            
            if (isVisible && area > maxArea) {
              maxArea = area;
              targetCanvas = canvas;
              console.log(`[Screenshot] Selected canvas as target`);
            }
          }
        }

        if (targetCanvas && targetCanvas.width > 0 && targetCanvas.height > 0) {
          console.log(`[Screenshot] Capturing from canvas: ${targetCanvas.width}x${targetCanvas.height}`);
          
          // Wait for the next animation frame to ensure the canvas is rendered
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              requestAnimationFrame(resolve);
            });
          });

          // Try to get WebGL context and check for preserveDrawingBuffer
          let webglContext = null;
          try {
            webglContext = targetCanvas.getContext('webgl2') || targetCanvas.getContext('webgl');
            if (webglContext) {
              console.log('[Screenshot] Found WebGL context');
              // Try to get the parameter to see if preserveDrawingBuffer is set
              const params = webglContext.getParameter(webglContext.UNPACK_COLORSPACE_CONVERSION_WEBGL);
              console.log('[Screenshot] WebGL context acquired');
            }
          } catch (e) {
            console.warn('[Screenshot] Could not access WebGL context:', e);
          }

          // Try multiple methods to capture
          try {
            // Method 1: Try toDataURL (most reliable for WebGL)
            console.log('[Screenshot] Attempting toDataURL...');
            const dataUrl = targetCanvas.toDataURL('image/png');
            
            if (dataUrl && dataUrl !== 'data:,') {
              console.log(`[Screenshot] Got data URL: ${dataUrl.length} chars`);
              
              // Convert data URL to blob
              const response = await fetch(dataUrl);
              const blob = await response.blob();
              
              if (blob && blob.size > 100) { // Check if it's not just a tiny blank image
                console.log(`[Screenshot] Successfully captured blob: ${blob.size} bytes`);
                callback(null, blob);
                return;
              } else {
                console.warn('[Screenshot] Data URL blob too small:', blob.size);
              }
            }
          } catch (err) {
            console.warn('[Screenshot] toDataURL failed:', err);
          }

          // Method 2: Try toBlob as fallback
          try {
            console.log('[Screenshot] Attempting toBlob as fallback...');
            targetCanvas.toBlob((blob) => {
              if (blob && blob.size > 100) {
                console.log(`[Screenshot] toBlob successful: ${blob.size} bytes`);
                callback(null, blob);
              } else {
                console.warn('[Screenshot] toBlob blob too small:', blob?.size);
                callback(new Error('Canvas appears to be blank (WebGL preserveDrawingBuffer may be false)'), null);
              }
            }, 'image/png');
          } catch (err) {
            console.error('[Screenshot] toBlob failed:', err);
            callback(err, null);
          }
        } else {
          console.log('[Screenshot] No valid canvas found, attempting fallback to html2canvas');
          
          // Fallback: try html2canvas for HTML-only content
          if (!window.html2canvas) {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
              script.onload = resolve;
              script.onerror = () => reject(new Error('Failed to load html2canvas'));
              document.head.appendChild(script);
            });
          }

          const canvas = await window.html2canvas(document.body, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            windowHeight: document.documentElement.scrollHeight,
            windowWidth: document.documentElement.scrollWidth
          });

          canvas.toBlob((blob) => {
            if (blob) {
              console.log(`[Screenshot] html2canvas fallback successful: ${blob.size} bytes`);
              callback(null, blob);
            } else {
              callback(new Error('Failed to create blob from html2canvas'), null);
            }
          }, 'image/jpeg', 0.95);
        }
      } catch (error) {
        console.error('[Screenshot] Capture failed:', error);
        callback(error, null);
      }
    }
  };

  console.log('PlayableTools screenshot capture API ready');
})();
