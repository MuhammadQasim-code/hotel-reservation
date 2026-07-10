import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../layouts/Navbar';

const BrowseHotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Local inputs synced to searchParams
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (city) queryParams.append('city', city);
      
      const response = await api.get(`/hotels?${queryParams.toString()}`);
      setHotels(response.data.data.hotels);
    } catch (error) {
      console.error('Failed to load hotels:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (city) newParams.city = city;
    setSearchParams(newParams);
  };

  const handleClear = () => {
    setSearch('');
    setCity('');
    setSearchParams({});
  };

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-container-max mx-auto px-lg w-full pt-28 pb-xl text-left">
        
        {/* Header */}
        <header className="mb-lg">
          <h1 className="font-display-lg text-4xl font-bold text-primary tracking-tight">Explore Destinations</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Find the perfect sanctuary tailored for your stay.</p>
        </header>

        {/* Filter Bar */}
        <form 
          onSubmit={handleFilterSubmit}
          className="bg-surface-container-low p-md rounded-xl border border-outline-variant/30 flex flex-col md:flex-row gap-base mb-xl items-end shadow-sm"
        >
          <div className="flex-1 flex flex-col gap-xs w-full">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Search Keyword</label>
            <div className="flex items-center bg-surface-container-lowest rounded-lg border border-outline-variant px-sm h-12">
              <span className="material-symbols-outlined text-outline mr-xs">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hotel name, description..."
                className="bg-transparent border-none focus:ring-0 w-full text-body-md focus:outline-none"
                type="text"
              />
            </div>
          </div>

          <div className="w-full md:w-64 flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Filter by City</label>
            <div className="flex items-center bg-surface-container-lowest rounded-lg border border-outline-variant px-sm h-12">
              <span className="material-symbols-outlined text-outline mr-xs">location_on</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Santorini, Tokyo..."
                className="bg-transparent border-none focus:ring-0 w-full text-body-md focus:outline-none"
                type="text"
              />
            </div>
          </div>

          <div className="flex gap-sm w-full md:w-auto">
            <button
              type="submit"
              className="flex-1 md:flex-initial bg-primary text-on-primary px-lg h-12 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all font-semibold"
            >
              Apply Filters
            </button>
            {(search || city) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-md h-12 rounded-lg font-label-md text-label-md border border-outline hover:bg-surface-variant transition-all font-semibold text-on-surface-variant"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {hotels.map((hotel) => (
              <div 
                key={hotel.id} 
                className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden hover-lift flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-outline-variant/30 bg-surface-variant">
                    <img
                      className="w-full h-full object-cover"
                      alt={hotel.hotel_name}
                      src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                    />
                    <div className="absolute top-sm right-sm bg-surface/90 backdrop-blur-sm px-sm py-xs rounded-full shadow-sm">
                      <span className="text-label-sm font-label-sm text-primary font-bold">${hotel.price_per_night} / night</span>
                    </div>
                  </div>

                  <div className="p-md">
                    <h3 className="font-headline-md text-xl font-bold text-primary mb-xs">{hotel.hotel_name}</h3>
                    <p className="text-label-md font-label-md text-on-surface-variant flex items-center gap-xs mb-sm">
                      <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                      {hotel.city} — <span className="opacity-85">{hotel.address}</span>
                    </p>
                    <p className="text-body-md font-body-md text-on-surface-variant line-clamp-3 mb-md">
                      {hotel.description}
                    </p>
                  </div>
                </div>

                <div className="p-md pt-0">
                  <div className="flex justify-between items-center border-t border-outline-variant/20 pt-md">
                    <span className="text-label-sm font-label-sm text-outline flex items-center gap-xs">
                      <span className="material-symbols-outlined text-sm">group</span>
                      Capacity: Up to {hotel.maximum_capacity} persons
                    </span>
                    <Link
                      to={`/hotels/${hotel.id}`}
                      className="bg-primary text-on-primary py-xs px-md rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-all font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-xl bg-surface-container-low rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-6xl mb-sm">search_off</span>
            <h3 className="font-headline-md text-lg font-bold text-primary mb-xs">No Hotels Found</h3>
            <p className="text-on-surface-variant">We couldn't find any hotels matching your criteria. Try adjusting your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseHotels;
