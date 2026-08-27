import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface Props {
  data: DataPoint[];
}

const COLORS: Record<string, string> = {
  'Africell': '#9D207E',
  'QCell': '#f47c20',
  'Comium': '#EB222A',
  'Gamcel': '#10b981',
  'Gamtel': '#0284c7',
  'International': '#64748b',
  'Standard': '#94a3b8',
  'Unknown': '#cbd5e1',
};

export const OperatorDistributionChart: React.FC<Props> = ({ data }) => {
  const filteredData = data
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = filteredData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Operator Distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={6}
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#cbd5e1'} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderRadius: '0.75rem', 
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-col gap-2 justify-center px-2">
          {filteredData.map((entry) => {
            const color = COLORS[entry.name] || '#cbd5e1';
            const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-500 dark:text-slate-400">{entry.value}</span>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

