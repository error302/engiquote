import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

export default function DataTable({
  data,
  columns,
  searchFields = [],
  filters = [],
  onRowClick,
  emptyMessage = 'No data found'
}) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = data.filter(item => {
    const matchesSearch = searchFields.length === 0 || searchFields.some(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return value?.toString().toLowerCase().includes(search.toLowerCase());
    });

    const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = item[key];
      return itemValue?.toString().toLowerCase() === value.toLowerCase();
    });

    return matchesSearch && matchesFilters;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setActiveFilters({});
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(activeFilters).some(v => v);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${searchFields.join(', ')}...`}
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters || hasActiveFilters ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
          >
            <Filter size={20} />
            Filter
            {hasActiveFilters && (
              <span className="bg-white text-primary text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(activeFilters).filter(v => v).length}
              </span>
            )}
          </button>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex flex-wrap gap-4">
            {filters.map(filter => (
              <div key={filter.key} className="min-w-[150px]">
                <label className="block text-sm font-medium mb-1">{filter.label}</label>
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={e => { setActiveFilters({...activeFilters, [filter.key]: e.target.value}); setCurrentPage(1); }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                >
                  <option value="">All</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={16} /> Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    onClick={() => onRowClick?.(item)}
                    className={`border-t hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > itemsPerPage && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border rounded px-2 py-1"
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-sm text-gray-500">of {filteredData.length} entries</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
