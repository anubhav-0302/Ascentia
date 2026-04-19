import React from 'react';

interface ResponsiveTableProps {
  headers: string[];
  data: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  renderRow: (item: any, index: number) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
  renderMobileCard?: (item: any, index: number) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  data,
  renderRow,
  renderMobileCard,
  className = ''
}) => {
  return (
    <>
      {/* Desktop Table View */}
      <div className={`hidden md:block overflow-x-auto ${className}`}>
        <table className="min-w-full divide-y divide-slate-700/50">
          <thead className="bg-slate-800/50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={`md:hidden space-y-4 ${className}`}>
        {data.map((item, index) => (
          <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            {renderMobileCard ? renderMobileCard(item, index) : renderRow(item, index)}
          </div>
        ))}
      </div>
    </>
  );
};

export default ResponsiveTable;
