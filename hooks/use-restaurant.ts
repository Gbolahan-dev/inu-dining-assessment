import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export type Restaurant = {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  latitude: number;
  longitude: number;
  created_at: Date;
};

export type CreateRestaurantDTO = {
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  description: string;
};

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const response = await api.get('/restaurants');
  return response.data.data as Restaurant[];
};

export const useRestaurants = () => {
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => getRestaurants(),
  });

  return { restaurants, isLoading };
};

export const createRestaurant = async (data: CreateRestaurantDTO) => {
  const response = await api.post('/restaurants', data);
  return response.data as {
    data: Restaurant;
    success: boolean;
    message: string;
  };
};
