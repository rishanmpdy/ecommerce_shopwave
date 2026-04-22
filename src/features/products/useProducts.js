import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';


const fetchProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};


export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 10 * 60 * 1000,    // Keep data fresh for 10 min
    refetchOnWindowFocus: false,   // Prevent re-fetch (  "reload") on window focus
  });
};


export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
    enabled: !!id, // Only run query if ID is passed
    staleTime: 10 * 60 * 1000,   
    refetchOnWindowFocus: false,  // Prevent refetch 
  });
};
export const useDeals = () => {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data } = await api.get('/deals');
      return data;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
