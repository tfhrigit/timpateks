import { useState, useCallback } from 'react';
const useUndoRedo = (initialState, maxHistory = 5) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const setState = useCallback((newState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      const updatedState = typeof newState === 'function' 
        ? newState(prev[currentIndex]) 
        : newState;
      newHistory.push(updatedState);
      if (newHistory.length > maxHistory + 1) {
        newHistory.shift();
        setCurrentIndex(prevIndex => prevIndex - 1);
      }
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  const state = history[currentIndex];

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
export default useUndoRedo;