import React from 'react';

interface DayCellProps {
  // filled prop is not needed for rendering; color logic is handled by parent to optimize re-renders
  active?: boolean;
  label: string;
  backgroundColor: string;
  textColor: string;
  dotSize: number;
  radius: number;
  children?: React.ReactNode;
}

/**
 * Optimization Note:
 * This component receives specific color strings (backgroundColor, textColor) instead of the full
 * 'colors' object or 'filled' boolean. This ensures that React.memo is effective, as string
 * primitives are compared by value. Passing the full 'colors' object would cause unnecessary
 * re-renders whenever *any* color in the theme changes (new object reference), even if it
 * doesn't affect this specific cell.
 */
const DayCell: React.FC<DayCellProps> = React.memo(({
  active,
  label,
  backgroundColor,
  textColor,
  dotSize,
  radius,
  children
}) => {
  const style: React.CSSProperties = {
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    backgroundColor: backgroundColor,
    borderRadius: `${radius}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${Math.max(8, dotSize * 0.4)}px`,
    color: textColor,
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
