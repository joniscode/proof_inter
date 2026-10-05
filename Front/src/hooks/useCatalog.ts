import { useEffect, useRef, useState } from 'react';
import { getCategories, getProducts } from '../api/shop';
import texts from '../content/texts.json';
import type { ProductPage } from '../types/shop';

export function useCatalog() {
  const [page, setPage] = useState<ProductPage | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({ page: 1, category: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const categoryCache = useRef<{ data: string[] } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const timer = window.setTimeout(() => {
      Promise.all([
        getProducts(filters.page, filters.category, filters.search, controller.signal),
        categoryCache.current ?? getCategories(controller.signal),
      ])
        .then(([result, options]) => {
          if (!controller.signal.aborted) {
            categoryCache.current = options;
            setPage(result);
            setCategories(options.data);
          }
        })
        .catch(() => { if (!controller.signal.aborted) setError(texts.catalog.error); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filters, attempt]);

  function changeFilter(field: 'category' | 'search', value: string) {
    setLoading(true);
    setFilters(current => ({ ...current, [field]: value, page: 1 }));
  }

  function changePage(value: number) {
    setLoading(true);
    setFilters(current => ({ ...current, page: value }));
  }

  function reload() {
    setLoading(true);
    setError('');
    setAttempt(current => current + 1);
  }

  return { page, categories, filters, loading, error, changeFilter, changePage, reload };
}
