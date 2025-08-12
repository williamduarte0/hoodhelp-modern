import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardTitle } from './ui/card';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import type { Service } from '../services/types';

interface ServiceFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  services: Service[];
}

export const ServiceFiltersComponent: React.FC<ServiceFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  services
}) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const categoriesList = useMemo(() => {
    const allCategories = services.flatMap(service => service.category || []);
    const uniqueCategories = [...new Set(allCategories)];
    return uniqueCategories.sort();
  }, [services]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.category || [];
    if (currentCategories.includes(category)) {
      handleFilterChange('category', currentCategories.filter((cat: string) => cat !== category));
    } else {
      handleFilterChange('category', [...currentCategories, category]);
    }
  };

  const hasActiveFilters = Object.values(filters).some((value: any) => 
    value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  const selectedCategoriesCount = filters.category?.length || 0;

  return (
    <Card className="w-full mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories {categoriesList.length > 0 && `(${categoriesList.length})`}
            </label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                disabled={categoriesList.length === 0}
              >
                <span>
                  {selectedCategoriesCount === 0 
                    ? categoriesList.length === 0 
                      ? 'No categories available' 
                      : 'Select categories...'
                    : `${selectedCategoriesCount} selected`
                  }
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {isCategoriesOpen && categoriesList.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {categoriesList.map((category: string) => (
                    <label key={category} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.category?.includes(category) || false}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minBudget || ''}
                onChange={(e) => handleFilterChange('minBudget', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxBudget || ''}
                onChange={(e) => handleFilterChange('maxBudget', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
