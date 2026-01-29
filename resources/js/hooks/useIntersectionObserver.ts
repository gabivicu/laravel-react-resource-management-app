import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

interface IntersectionObserverOptions {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
}

export default function useIntersectionObserver(options: IntersectionObserverOptions = {}) {
    const elementRef = useRef<HTMLElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    
    // Memoize options to prevent unnecessary observer recreation
    const memoizedOptions = useMemo(() => ({
        root: options.root || null,
        rootMargin: options.rootMargin || '200px',
        threshold: options.threshold || 0,
    }), [
        options.root,
        options.rootMargin,
        options.threshold,
    ]);

    // Callback ref that works with MUI components
    const setRef = useCallback((node: HTMLElement | null) => {
        // Cleanup previous observer
        if (observerRef.current && elementRef.current) {
            observerRef.current.unobserve(elementRef.current);
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        elementRef.current = node;

        // Set up new observer if node exists
        if (node) {
            // Check if element is already visible (for initial load)
            const rect = node.getBoundingClientRect();
            const rootMarginValue = memoizedOptions.rootMargin || '200px';
            const marginPx = parseInt(rootMarginValue.replace('px', '')) || 200;
            const isInitiallyVisible = 
                rect.top < (window.innerHeight || document.documentElement.clientHeight) + marginPx;

            if (isInitiallyVisible) {
                setIsIntersecting(true);
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    // Check if any entry is intersecting
                    const isVisible = entries.some((entry) => entry.isIntersecting);
                    setIsIntersecting(isVisible);
                },
                memoizedOptions
            );

            observer.observe(node);
            observerRef.current = observer;
        } else {
            setIsIntersecting(false);
        }
    }, [memoizedOptions]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return [setRef, isIntersecting] as const;
}
