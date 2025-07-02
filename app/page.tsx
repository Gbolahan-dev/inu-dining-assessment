'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  MapPin,
  Search,
  Star,
  Clock,
  Utensils,
  Menu,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import 'leaflet/dist/leaflet.css';
import { Controller, useForm } from 'react-hook-form';
import {
  restaurantSchema,
  RestaurantSchemaType,
} from '@/validation/restaurant';
import { zodResolver } from '@hookform/resolvers/zod';
import InputErrorWrapper from '@/components/input-error-wrapper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRestaurant,
  Restaurant,
  useRestaurants,
} from '@/hooks/use-restaurant';
import ReactLoading from 'react-loading';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./map-client'), {
  ssr: false,
});

// // Custom marker icon
// const restaurantIcon = new Icon({
//   // iconUrl:
//   //   'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMxMEI5ODEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTJMMTMgMTJNMyAxMkwzIDRMMTMgNEwxMyAxMk0zIDEyTDMgMjBMMTMgMjBMMTMgMTJNMTMgMTJMMTMgMTYiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTEzIDEyTDIxIDEyTTIxIDEyTDIxIDhMMTMgOE0yMSAxMkwyMSAxNkwxMyAxNiIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+',
//   iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
//   iconSize: [32, 32],
//   iconAnchor: [16, 32],
//   popupAnchor: [0, -32],
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
//   shadowSize: [41, 41],
// });

// const userIcon = new Icon({
//   iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png',
//   iconSize: [35, 35],
//   iconAnchor: [17, 35],
//   popupAnchor: [0, -30],
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
//   shadowSize: [41, 41],
// });

// function MapClickHandler({
//   onMapClick,
// }: {
//   onMapClick: (lat: number, lng: number) => void;
// }) {
//   useMapEvents({
//     click: (e) => {
//       onMapClick(e.latlng.lat, e.latlng.lng);
//     },
//   });
//   return null;
// }

export default function Home() {
  const { restaurants, isLoading } = useRestaurants();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [map, setMap] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error('Error getting user location:', error);
        // fallback to NYC or any default
        setUserLocation([40.7128, -74.006]);
      },
    );
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setIsAddModalOpen(true);
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    if (map) {
      map.setView([restaurant.latitude, restaurant.longitude], 15);
    }
  };

  const filteredRestaurants = restaurants?.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      italian: 'bg-red-100 text-red-800',
      chinese: 'bg-yellow-100 text-yellow-800',
      mexican: 'bg-orange-100 text-orange-800',
      indian: 'bg-purple-100 text-purple-800',
      japanese: 'bg-pink-100 text-pink-800',
      american: 'bg-blue-100 text-blue-800',
      french: 'bg-indigo-100 text-indigo-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return (
      colors[category.toLowerCase() as keyof typeof colors] || colors.default
    );
  };

  const {
    formState: { errors },
    handleSubmit,
    reset,
    register,
    control,
  } = useForm<RestaurantSchemaType>({
    resolver: zodResolver(restaurantSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createRestaurant,
    onSuccess: (response) => {
      if (response?.success === true) {
        queryClient.setQueryData(
          ['restaurants'],
          (oldData: Restaurant[] = []): Restaurant[] => {
            return [...oldData, response.data];
          },
        );

        queryClient.invalidateQueries({
          queryKey: ['restaurants'],
        });

        setIsAddModalOpen(false);
        setSelectedPosition(null);
        toast({
          title: 'Success',
          description: response.message,
        });
        reset();
      }
    },
  });

  const onSubmit = async (formValues: RestaurantSchemaType) => {
    if (!selectedPosition) return;

    const data = {
      name: formValues.name,
      latitude: selectedPosition?.lat,
      longitude: selectedPosition?.lng,
      category: formValues.category,
      rating: formValues.rating,
      description: formValues.description ?? '',
    };

    mutate(data);
  };

  if (isLoading && !userLocation) {
    return (
      <div className="h-screen w-screen flex items-center justify-center fixed inset-0 bg-white z-50">
        <ReactLoading type="spin" color="#4C36E0" height={40} width={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Sidebar */}
      {/* Toggle Button — Mobile Only */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-500 rounded"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="text-white w-5 h-5" />
      </button>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 text-white transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:relative md:translate-x-0 md:flex flex-col`}
      >
        {/* Close Button — Mobile Only */}
        <button
          className="md:hidden absolute top-4 right-4 p-1 rounded bg-slate-800 hover:bg-slate-700"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Utensils className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">RestaurantMap</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Restaurant List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {filteredRestaurants && filteredRestaurants?.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">No restaurants yet</p>
                <p className="text-sm text-slate-500">
                  Click on the map to add your first restaurant
                </p>
              </div>
            ) : (
              filteredRestaurants?.map((restaurant) => (
                <Card
                  key={restaurant?.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-slate-700 ${
                    selectedRestaurant?.id === restaurant?.id
                      ? 'ring-2 ring-emerald-500 bg-slate-800'
                      : 'bg-slate-800 hover:bg-slate-750'
                  }`}
                  onClick={() => handleRestaurantSelect(restaurant)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white text-lg">
                        {restaurant?.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-slate-300">
                          {restaurant?.rating}
                        </span>
                      </div>
                    </div>

                    {restaurant?.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                        {restaurant?.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center">
                      {restaurant?.category && (
                        <Badge
                          className={getCategoryColor(restaurant?.category)}
                        >
                          {restaurant?.category}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {format(
                            new Date(restaurant.created_at),
                            'dd/MM/yyyy',
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Stats */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Total Restaurants</span>
            <span className="font-semibold text-emerald-400">
              {restaurants?.length}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-50">
        <div className="flex items-center gap-2 mb-2">
          <Plus className="w-5 h-5 text-emerald-500" />
          <span className="font-medium">Add Restaurant</span>
        </div>
        <p className="text-sm text-gray-600">
          Click anywhere on the map to add a new restaurant
        </p>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {/* <MapContainer
          center={userLocation ?? [40.7128, -74.006]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={setMap}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />

          
          <Marker position={userLocation ?? [40.7128, -74.006]} icon={userIcon}>
            <Popup>
              <span>You are here</span>
            </Popup>
          </Marker>

          {restaurants?.map((restaurant) => (
            <Marker
              key={restaurant.id}
              position={[restaurant.latitude, restaurant.longitude]}
              icon={restaurantIcon}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-lg mb-1">
                    {restaurant.name}
                  </h3>
                  {restaurant.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {restaurant.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    {restaurant.category && (
                      <Badge className={getCategoryColor(restaurant.category)}>
                        {restaurant.category}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{restaurant.rating}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer> */}
        <MapClient
          userLocation={userLocation ?? [40.7128, -74.006]}
          restaurants={restaurants ?? []}
          onMapClick={handleMapClick}
          selectedRestaurant={selectedRestaurant}
          setMap={setMap}
        />
      </div>

      {/* Add Restaurant Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <InputErrorWrapper error={errors.name?.message}>
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter restaurant name"
                  />
                </div>
              </InputErrorWrapper>

              <InputErrorWrapper error={errors.category?.message}>
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Category</Label>
                  <Input
                    id="category"
                    {...register('category')}
                    placeholder="e.g., Italian, Chinese, Mexican"
                  />
                </div>
              </InputErrorWrapper>

              <InputErrorWrapper error={errors.rating?.message}>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="5"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    )}
                  />
                </div>
              </InputErrorWrapper>

              <InputErrorWrapper error={errors.description?.message}>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Tell us about this restaurant..."
                    rows={3}
                  />
                </div>
              </InputErrorWrapper>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex gap-x-2 disabled:bg-gray-800"
                disabled={isPending}
              >
                {isPending && (
                  <ReactLoading
                    type="spin"
                    color="#ffffff"
                    height={18}
                    width={18}
                  />
                )}
                Add Restaurant
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
