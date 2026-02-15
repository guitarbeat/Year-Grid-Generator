import React from 'react';
import { AppColors } from '../types';

interface DayCellProps {
  filled: boolean;
  active?: boolean;
  label: string;
  colors: AppColors;
  dotSize: number;
  radius: number;
  children?: React.ReactNode;
}

const DayCell: React.FC<DayCellProps> = React.memo(({
  filled,
  active,
  label,
  colors,
  dotSize,
  radius,
  children
}) => {
  const style: React.CSSProperties = {
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    backgroundColor: filled ? colors.fill : colors.empty,
    borderRadius: `${radius}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${Math.max(8, dotSize * 0.4)}px`,
    color: filled ? colors.bg : colors.text,
    fontWeight: 'bold',
    userSelect: 'none',
    zIndex: active ? 10 : 2,
    position: 'relative',
    boxShadow: 'none',
    lineHeight: 1,
    textAlign: 'center',
    whiteSpace: 'pre-line'
  };

  return (
    <div
      title={label}
      style={style}
    >
      <span className="pointer-events-none w-full">{children}</span>
    </div>
  );
});

DayCell.displayName = 'DayCell';

export default DayCell;
