import { useState } from 'react';
import { ViewMode } from '../types';

export const useUIState = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const [viewMode] = useState<ViewMode>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get('view');
      if (mode === 'image' || mode === 'export_base64') return mode as ViewMode;
    } catch {}
    return 'editor';
  });

  return {
    isDownloading,
    setIsDownloading,
    zoom,
    setZoom,
    viewMode,
    isExpanded,
    setIsExpanded
  };
};
