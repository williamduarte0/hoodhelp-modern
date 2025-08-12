import { useQuery } from '@tanstack/react-query';
import { serviceService } from '../services';

export const useMyServices = () => {
  return useQuery({
    queryKey: ['my-services'],
    queryFn: () => serviceService.getMyServices(),
    staleTime: 2 * 60 * 1000,
  });
};
