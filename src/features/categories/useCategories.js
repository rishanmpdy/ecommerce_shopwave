import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const fetchCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
};
