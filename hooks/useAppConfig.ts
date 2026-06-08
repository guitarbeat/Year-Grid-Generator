import { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import {
  DEFAULT_CONFIG,
  STORAGE_KEY,
  decodeConfig,
  encodeConfig,
  migrateConfig
} from '../utils/configSync';

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const configParam = searchParams.get('config');
      
      let baseConfig: AppConfig;

      if (configParam) {
        const decoded = decodeConfig(configParam);
        baseConfig = decoded ? migrateConfig(decoded) : DEFAULT_CONFIG;
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          baseConfig = migrateConfig(parsed);
        } else {
          baseConfig = DEFAULT_CONFIG;
        }
      }

      // URL Overrides
      const dateOverride = searchParams.get('date');
      if (dateOverride === 'today') {
        baseConfig.date = new Date().toISOString().split('T')[0];
      } else if (dateOverride && /^\d{4}-\d{2}-\d{2}$/.test(dateOverride)) {
        baseConfig.date = dateOverride;
      }

      const transparentOverride = searchParams.get('transparent');
      if (transparentOverride === 'true') {
        baseConfig.transparentBg = true;
      } else if (transparentOverride === 'false') {
        baseConfig.transparentBg = false;
      }

      return baseConfig;
    } catch (error) {
      console.warn('Failed to load initial config:', error);
    }
    return DEFAULT_CONFIG;
  });

  // Sync to URL & LocalStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = encodeConfig(config);
      
      if (params.get('config') !== encoded) {
        params.set('config', encoded);
        window.history.replaceState(null, '', `?${params.toString()}`);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Error syncing state:', e);
    }
  }, [config]);

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const toggleOverride = (id: string) => {
    setConfig(prev => {
      const overrides = { ...(prev.overrides || {}) };
      if (overrides[id]) {
        delete overrides[id];
      } else {
        overrides[id] = 'significant';
      }
      return { ...prev, overrides };
    });
  };

  return { config, setConfig, resetConfig, toggleOverride };
};
