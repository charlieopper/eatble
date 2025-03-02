import { useEffect, useCallback } from 'react';

export default function useInfiniteScroll(
  loadMoreCallback,
  hasMore,
  isLoading,
  isLoadingMore,
  options = { threshold: 0.8 }
) {
  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
        loadMoreCallback();
      }
    },
    [loadMoreCallback, hasMore, isLoading, isLoadingMore]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: options.threshold,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    const sentinel = document.getElementById('scroll-sentinel');
    
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [handleObserver, options.threshold]);
} 