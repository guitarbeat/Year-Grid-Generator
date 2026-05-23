import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { AppConfig } from '../types';

export function useHistory(
  config: AppConfig,
  setConfig: Dispatch<SetStateAction<AppConfig>>
) {
  const pastRef = useRef<AppConfig[]>([]);
  const futureRef = useRef<AppConfig[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const prevConfigRef = useRef<AppConfig>(config);
  const isUndoRedoRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const continuousStartConfigRef = useRef<AppConfig | null>(null);

  const updateHistoryFlags = () => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  };

  useEffect(() => {
    const prev = prevConfigRef.current;
    prevConfigRef.current = config;

    if (JSON.stringify(prev) === JSON.stringify(config)) {
      return;
    }

    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      updateHistoryFlags();
      return;
    }

    const areColorsEqual = JSON.stringify(prev.colors) === JSON.stringify(config.colors);

    const isContinuousChange = 
      prev.dotSize !== config.dotSize ||
      prev.gap !== config.gap ||
      prev.radius !== config.radius ||
      prev.fontSize !== config.fontSize ||
      prev.dimPastDaysStrength !== config.dimPastDaysStrength ||
      prev.itemsPerRow !== config.itemsPerRow ||
      prev.customQuoteText !== config.customQuoteText ||
      prev.customTitle !== config.customTitle ||
      prev.monthsToShow !== config.monthsToShow ||
      prev.monthsPerRow !== config.monthsPerRow ||
      prev.lifeExpectancy !== config.lifeExpectancy ||
      !areColorsEqual;

    if (isContinuousChange) {
      if (!continuousStartConfigRef.current) {
        continuousStartConfigRef.current = prev;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (continuousStartConfigRef.current) {
          const startState = continuousStartConfigRef.current;
          continuousStartConfigRef.current = null;

          futureRef.current = [];
          const newPast = [...pastRef.current, startState];
          if (newPast.length > 100) {
            newPast.shift();
          }
          pastRef.current = newPast;
          updateHistoryFlags();
        }
        debounceTimerRef.current = null;
      }, 500);
    } else {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      let updatedPast = [...pastRef.current];
      if (continuousStartConfigRef.current) {
        updatedPast.push(continuousStartConfigRef.current);
        continuousStartConfigRef.current = null;
      }

      updatedPast.push(prev);
      if (updatedPast.length > 100) {
        updatedPast = updatedPast.slice(-100);
      }

      futureRef.current = [];
      pastRef.current = updatedPast;
      updateHistoryFlags();
    }
  }, [config]);

  const handleUndo = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      
      if (continuousStartConfigRef.current) {
        const startState = continuousStartConfigRef.current;
        continuousStartConfigRef.current = null;
        
        setConfig(prev => {
          futureRef.current = [prev, ...futureRef.current];
          return startState;
        });
        isUndoRedoRef.current = true;
        updateHistoryFlags();
        return;
      }
    }

    if (pastRef.current.length === 0) return;

    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    
    setConfig(prev => {
      futureRef.current = [prev, ...futureRef.current];
      return previous;
    });
    
    isUndoRedoRef.current = true;
    updateHistoryFlags();
  };

  const handleRedo = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      if (continuousStartConfigRef.current) {
        pastRef.current = [...pastRef.current, continuousStartConfigRef.current];
        continuousStartConfigRef.current = null;
      }
    }

    if (futureRef.current.length === 0) return;

    const next = futureRef.current[0];
    futureRef.current = futureRef.current.slice(1);
    
    setConfig(prev => {
      pastRef.current = [...pastRef.current, prev];
      return next;
    });
    
    isUndoRedoRef.current = true;
    updateHistoryFlags();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z';
      const isY = e.key.toLowerCase() === 'y';
      const hasMetaOrCtrl = e.metaKey || e.ctrlKey;
      
      if (hasMetaOrCtrl && isZ) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (hasMetaOrCtrl && isY) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { canUndo, canRedo, handleUndo, handleRedo };
}
