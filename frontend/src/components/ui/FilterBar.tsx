import { Filter, X } from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'range' | 'date';
  options?: { value: string; label: string }[];
}

interface FilterBarProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset: () => void;
}

export function FilterBar({ filters, values, onChange, onReset }: FilterBarProps) {
  const activeCount = Object.keys(values).filter(k => values[k] !== undefined && values[k] !== '').length;

  return (
    <div className="flex items-center space-x-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
      <div className="flex items-center text-slate-500">
        <Filter className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <div className="h-6 w-px bg-slate-200" />

      {filters.map((filter) => (
        <div key={filter.key} className="flex-shrink-0">
          {filter.type === 'select' && filter.options && (
            <select
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="text-sm border-slate-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">{filter.label}</option>
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
          {/* Add other filter types as needed */}
        </div>
      ))}

      {activeCount > 0 && (
        <>
          <div className="h-6 w-px bg-slate-200 ml-auto" />
          <button
            onClick={onReset}
            className="flex items-center text-sm text-slate-500 hover:text-slate-900 ml-2"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </button>
        </>
      )}
    </div>
  );
}
