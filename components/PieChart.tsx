import React from 'react';

interface PieChartProps {
  data: { name: string; value: number }[];
  size?: number;
}

const COLORS = ['#00A8FF', '#00E0C7', '#FACC15', '#FF7A00', '#D600FF', '#00FF4C'];

const PieChart: React.FC<PieChartProps> = ({ data, size = 250 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent - Math.PI / 2);
    const y = Math.sin(2 * Math.PI * percent - Math.PI / 2);
    return [x, y];
  };

  return (
    <svg width={size} height={size} viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)'}}>
      {data.map((item, index) => {
        const percent = item.value / total;
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
        cumulativePercent += percent;
        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
        const largeArcFlag = percent > 0.5 ? 1 : 0;

        const pathData = [
          `M ${startX} ${startY}`,
          `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          'L 0 0',
        ].join(' ');

        return (
          <path key={item.name} d={pathData} fill={COLORS[index % COLORS.length]}>
            <title>{item.name}: {item.value.toFixed(2)}</title>
          </path>
        );
      })}
    </svg>
  );
};

export default PieChart;
