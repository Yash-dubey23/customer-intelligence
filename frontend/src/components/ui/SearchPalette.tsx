import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Search, Users, BrainCircuit, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { search } from '../../api/endpoints';
import { SearchResult } from '../../api/types';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      setLoading(true);
      search.search(debouncedQuery)
        .then((res: any) => {
          // interceptor unwraps .data, but handle both cases
          const data = Array.isArray(res) ? res : (res?.data || []);
          setResults(data);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleSelect = (item: SearchResult) => {
    onClose();
    if (item.type === 'customer') {
      navigate(`/app/customers/${item.id}`);
    } else {
      navigate(`/app/predictions/${item.id}`);
    }
    setQuery('');
  };

  // Reset query when closing
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-lg transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200 transition-all">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  className="h-11 w-full border-0 bg-transparent pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0"
                  placeholder="Search customers or predictions…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {query.length >= 2 && (
                <div className="border-t border-slate-100">
                  <ul className="max-h-72 scroll-py-2 overflow-y-auto py-1 text-sm">
                    {loading && (
                      <li className="px-4 py-3 text-slate-400 flex items-center gap-2">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
                        Searching…
                      </li>
                    )}
                    {!loading && results.map((result) => (
                      <li
                        key={`${result.type}-${result.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleSelect(result)}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                          {result.type === 'customer' ? (
                            <Users className="h-3.5 w-3.5" />
                          ) : (
                            <BrainCircuit className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-slate-900">{result.label}</span>
                          <span className="ml-2 text-slate-400">{result.subLabel}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                      </li>
                    ))}
                    {!loading && results.length === 0 && (
                      <li className="px-4 py-8 text-center text-slate-400">
                        No results for "{query}"
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {query.length < 2 && (
                <div className="border-t border-slate-100 px-4 py-6 text-center">
                  <Search className="mx-auto h-5 w-5 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">Type at least 2 characters to search</p>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
