import React from 'react';
import { SDG_REFERENCES } from '../data/sdgReference';
import {
  HeartHandshake,
  Utensils,
  Activity,
  GraduationCap,
  Users,
  Droplets,
  Zap,
  TrendingUp,
  Cpu,
  Scale,
  Building2,
  Recycle,
  CloudRain,
  Waves,
  Trees,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  HeartHandshake,
  Utensils,
  Activity,
  GraduationCap,
  Users,
  Droplets,
  Zap,
  TrendingUp,
  Cpu,
  Scale,
  Building2,
  Recycle,
  CloudRain,
  Waves,
  Trees,
  ShieldCheck,
  Globe2,
};

interface SdgBadgeProps {
  sdgNumber: number;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const SdgBadge: React.FC<SdgBadgeProps> = ({
  sdgNumber,
  showName = true,
  size = 'md',
  className = '',
  onClick,
}) => {
  const ref = SDG_REFERENCES.find((s) => s.number === sdgNumber) || {
    number: sdgNumber,
    officialIndonesianName: `SDG ${sdgNumber}`,
    shortName: `SDG ${sdgNumber}`,
    color: '#0B3C5D',
    textColor: '#FFFFFF',
    iconName: 'Globe2',
  };

  const IconComponent = ICON_MAP[ref.iconName] || Globe2;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      onClick={onClick}
      style={{
        backgroundColor: ref.color,
        color: ref.textColor,
      }}
      className={`inline-flex items-center font-medium rounded-md shadow-xs transition-opacity ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${sizeClasses} ${className}`}
      title={`SDG ${ref.number}: ${ref.officialIndonesianName}`}
    >
      <IconComponent size={iconSizes} strokeWidth={2.5} />
      <span className="font-bold">SDG {ref.number}</span>
      {showName && <span className="opacity-95 hidden sm:inline">| {ref.shortName}</span>}
    </span>
  );
};
