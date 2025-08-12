import React from 'react';
import { Label } from './label';
import { MapPin } from 'lucide-react';

interface LocationRangeInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const LocationRangeInput: React.FC<LocationRangeInputProps> = ({
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={className}>
      <Label className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4" />
        Location Range: {value} km
      </Label>
      
      <div className="space-y-3">
        <div className="relative">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1km</span>
            <span>2km</span>
            <span>3km</span>
            <span>4km</span>
            <span>5km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
