import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceFiltersComponent } from '../components/ServiceFilters';
import { ViewToggle } from '../components/ViewToggle';
import { ServicesMap } from '../components/ServicesMap';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../contexts/AuthContext';
import type { Service } from '../services/types';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [filters, setFilters] = useState({
    search: '',
    category: [] as string[],
    minBudget: undefined as number | undefined,
    maxBudget: undefined as number | undefined
  });
  
  const { data: allServices = [], isLoading } = useServices();

  const filteredServices = useMemo(() => {
    return allServices.filter((service: Service) => {
      if (filters.search && !service.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !service.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      if (filters.category.length > 0 && !filters.category.some(cat => 
        service.category.includes(cat))) {
        return false;
      }

      if (filters.minBudget && service.budget < filters.minBudget) {
        return false;
      }
      if (filters.maxBudget && service.budget > filters.maxBudget) {
        return false;
      }

      return true;
    });
  }, [allServices, filters]);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: [],
      minBudget: undefined,
      maxBudget: undefined
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Services in your neighborhood
          </h1>
          <p className="text-gray-600">
            Find and connect with local service providers
          </p>
        </div>

        <ServiceFiltersComponent 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          services={allServices}
        />

        <div className="flex justify-end mb-6">
          <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {filters.search || filters.category.length > 0 || filters.minBudget || filters.maxBudget
                ? 'No services match your filters. Try adjusting your search criteria.'
                : 'No services found in your area.'
              }
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'map' && (
              <div className="mb-6">
                <ServicesMap 
                  services={filteredServices} 
                  userLocation={user?.location || undefined}
                />
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
