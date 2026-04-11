import React from 'react';

interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  stickyHeader?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  compact?: boolean;
}

function Table<T>({
  data,
  columns,
  loading = false,
  onRowClick,
  className = '',
  stickyHeader = false,
  hoverable = true,
  striped = false,
  compact = false
}: TableProps<T>) {
  const rowHeight = compact ? 'py-2' : 'py-3';
  const cellPadding = compact ? 'px-3' : 'px-4';

  const renderCell = (column: Column<T>, row: T, index: number): React.ReactNode => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row, index);
    }
    
    return value as React.ReactNode;
  };

  if (loading) {
    return (
      <div className={`bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-600/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`${cellPadding} ${rowHeight} text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${column.className || ''}`}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 12l5-5 5 5H5z" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-slate-700/30">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`${cellPadding} ${rowHeight}`}
                    >
                      <div className="h-4 bg-slate-600 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${stickyHeader ? 'sticky top-0 z-10' : ''} bg-slate-700/50 border-b border-slate-600/50`}>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`${cellPadding} ${rowHeight} text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <button className="text-gray-500 hover:text-gray-300 transition-colors duration-200">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 12l5-5 5 5H5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {data.map((row, index) => (
              <tr
                key={index}
                className={`
                  ${hoverable ? 'hover:bg-slate-700/40 cursor-pointer transition-colors duration-200' : ''}
                  ${striped && index % 2 === 1 ? 'bg-slate-700/20' : ''}
                  ${onRowClick ? 'group' : ''}
                `}
                onClick={() => onRowClick?.(row, index)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`${cellPadding} ${rowHeight} text-sm ${column.className || ''}`}
                  >
                    <div className="flex items-center">
                      {renderCell(column, row, index)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-sm">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Table;
