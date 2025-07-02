'use client';

import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import { Icon } from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Restaurant } from '@/hooks/use-restaurant';
import 'leaflet/dist/leaflet.css';

const restaurantIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const userIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -30],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function getCategoryColor(category: string) {
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
}

export default function MapClient({
  userLocation,
  restaurants,
  onMapClick,
  selectedRestaurant,
  setMap,
}: {
  userLocation: [number, number];
  restaurants: Restaurant[];
  onMapClick: (lat: number, lng: number) => void;
  selectedRestaurant: Restaurant | null;
  setMap: (map: any) => void;
}) {
  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      ref={setMap}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onMapClick={onMapClick} />

      <Marker position={userLocation} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>

      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.latitude, restaurant.longitude]}
          icon={restaurantIcon}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
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
    </MapContainer>
  );
}
