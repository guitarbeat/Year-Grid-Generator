import React from 'react';

interface DayCellProps {
  filled: boolean;
  active?: boolean;
  label: string;
  children?: React.ReactNode;
}

const DayCell: React.FC<DayCellProps> = React.memo(({
  filled,
  active,
  label,
  children
}) => {
  const style: React.CSSProperties = {
    width: 'var(--dot-size)',
    height: 'var(--dot-size)',
    backgroundColor: filled ? 'var(--color-fill)' : 'var(--color-empty)',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Using max() and calc() for responsive font size based on dot size
    fontSize: 'max(8px, calc(var(--dot-size) * 0.4))',
    color: filled ? 'var(--color-bg)' : 'var(--color-text)',
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
