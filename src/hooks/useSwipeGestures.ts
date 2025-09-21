import { useRef, useEffect, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export function useSwipeGestures(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
  } = options;

  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEnd.current = null;

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
        clearLongPressTimer();
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay, clearLongPressTimer]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Clear long press timer on move
    clearLongPressTimer();
    
    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, [clearLongPressTimer]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    clearLongPressTimer();

    if (!touchStart.current) return;

    const endTouch = touchEnd.current || {
      x: touchStart.current.x,
      y: touchStart.current.y,
      time: Date.now(),
    };

    const deltaX = endTouch.x - touchStart.current.x;
    const deltaY = endTouch.y - touchStart.current.y;
    const deltaTime = endTouch.time - touchStart.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check for tap (short duration, minimal movement)
    if (deltaTime < 300 && distance < 10 && onTap) {
      onTap();
      return;
    }

    // Check for swipe gestures
    if (distance > threshold) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, threshold, clearLongPressTimer]);

  const attachGestures = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      // Remove existing listeners
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchmove', handleTouchMove);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    elementRef.current = element;

    if (element) {
      // Add touch event listeners
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      clearLongPressTimer();
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart);
        elementRef.current.removeEventListener('touchmove', handleTouchMove);
        elementRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearLongPressTimer]);

  return { attachGestures };
}