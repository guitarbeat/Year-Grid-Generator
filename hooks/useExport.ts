import { RefObject } from 'react';
import html2canvas from 'html2canvas';
import { AppConfig } from '../types';

export const useExport = (
  gridRef: RefObject<HTMLDivElement>, 
  config: AppConfig, 
  setIsDownloading?: (val: boolean) => void
) => {
  const handleDownload = async () => {
    if (!gridRef.current) {
      alert('Could not find grid element. Please try again.');
      return;
    }

    setIsDownloading?.(true);
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: config.transparentBg ? null : config.colors.bg,
        scale: config.resolutionScale || 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `year-grid-${config.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsDownloading?.(false);
    }
  };

  const handleDownloadSvg = async () => {
    if (!gridRef.current) {
      alert('Could not find grid element. Please try again.');
      return;
    }

    setIsDownloading?.(true);
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise(resolve => setTimeout(resolve, 150));

      const { toSvg } = await import('html-to-image');
      
      const svgDataUrl = await toSvg(gridRef.current, {
        backgroundColor: config.transparentBg ? null : config.colors.bg,
        pixelRatio: config.resolutionScale || 2,
      });

      const link = document.createElement('a');
      link.download = `year-grid-${config.date}.svg`;
      link.href = svgDataUrl;
      link.click();
    } catch (error) {
      console.error('SVG Download failed:', error);
      alert('Failed to generate SVG. Please try again.');
    } finally {
      setIsDownloading?.(false);
    }
  };

  const handleBase64Export = async (): Promise<string | null> => {
    if (!gridRef.current) {
      throw new Error("Grid reference element was never mounted.");
    }

    // Fast settle delay so DOM elements are fully mounted (no transitions in export mode means zero lag)
    await new Promise(r => setTimeout(r, 50));

    // Capping scale at 1.2 is critical for iOS Extension / Scriptable RAM limits (Jetsam)
    const scale = 1.2;

    const canvas = await html2canvas(gridRef.current, {
      backgroundColor: config.transparentBg ? null : config.colors.bg,
      scale,
      logging: false,
      useCORS: false, // Turn off for base64 to avoid cross-origin font/stylesheet stalls
    });

    return canvas.toDataURL('image/png');
  };

  return { handleDownload, handleDownloadSvg, handleBase64Export };
};
