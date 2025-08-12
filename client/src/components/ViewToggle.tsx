import React from 'react';
import { Button } from '@/components/ui/button';
import { Map, Grid3X3 } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'map' | 'grid';
  onViewChange: (view: 'map' | 'grid') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <Button
        variant={currentView === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('map')}
        className="flex items-center gap-2"
      >
        <Map className="w-4 h-4" />
        Map
      </Button>
      <Button
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="flex items-center gap-2"
      >
        <Grid3X3 className="w-4 h-4" />
        Grid
      </Button>
    </div>
  );
};
