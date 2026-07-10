import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../layouts/Navbar';

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await api.get(`/hotels/${id}`);
        setHotel(response.data.data.hotel);
      } catch (err) {
        setError(err.message || 'Failed to load hotel details.');
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="bg-surface min-h-screen flex flex-col justify-center items-center">
        <Navbar />
        <span className="material-symbols-outlined text-error text-6xl mb-sm">error</span>
        <h2 className="font-headline-lg text-2xl font-bold text-primary mb-xs">Error Loading Hotel</h2>
        <p className="text-on-surface-variant mb-md">{error || 'Hotel not found.'}</p>
        <Link to="/hotels" className="bg-primary text-on-primary py-xs px-md rounded-lg font-label-md text-label-md">
          Back to Hotels
        </Link>
      </div>
    );
  }

  const amenitiesList = hotel.amenities ? hotel.amenities.split(',').map((item) => item.trim()) : [];

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-container-max mx-auto px-lg w-full pt-28 pb-xl text-left">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-md">
          <Link to="/hotels" className="text-label-sm font-label-sm text-outline hover:text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Browse
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          
          {/* Main Details (Col-span 2) */}
          <div className="lg:col-span-2 space-y-md">
            {/* Image Banner */}
            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 bg-surface-variant">
              <img
                className="w-full h-full object-cover"
                alt={hotel.hotel_name}
                src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
              />
            </div>

            {/* Title Block */}
            <div>
              <h1 className="font-display-lg text-3xl md:text-4xl font-bold text-primary tracking-tight mb-xs">
                {hotel.hotel_name}
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                {hotel.address}, {hotel.city}
              </p>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Description */}
            <div className="space-y-xs">
              <h2 className="font-headline-md text-xl font-bold text-primary">About the Sanctuary</h2>
              <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                {hotel.description}
              </p>
            </div>

            <hr className="border-outline-variant/30" />

            {/* Amenities */}
            <div className="space-y-sm">
              <h2 className="font-headline-md text-xl font-bold text-primary">Premium Amenities</h2>
              {amenitiesList.length > 0 ? (
                <div className="flex flex-wrap gap-xs">
                  {amenitiesList.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-sm py-xs bg-surface-container rounded-full text-label-md font-label-md text-primary font-semibold border border-outline-variant/20 flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star_rate
                      </span>
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant text-body-md">Standard hotel amenities included.</p>
              )}
            </div>
          </div>

          {/* Booking Summary Card (Col-span 1) */}
          <div className="h-fit">
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-lg border border-outline-variant/30 space-y-md">
              <div className="flex justify-between items-end border-b border-outline-variant/20 pb-md">
                <div>
                  <span className="font-headline-lg text-2xl font-bold text-primary">${hotel.price_per_night}</span>
                  <span className="text-on-surface-variant text-label-sm"> / night</span>
                </div>
                <span className="text-label-sm font-label-sm text-outline flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm">group</span>
                  Max Capacity: {hotel.maximum_capacity} guests
                </span>
              </div>

              {/* Info Table */}
              <div className="space-y-sm text-label-md font-label-md text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-bold text-primary">{hotel.city}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type</span>
                  <span className="font-bold text-primary">Luxury Stay</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleanliness Review</span>
                  <span className="font-bold text-primary flex items-center gap-xs">
                    <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    4.9 / 5
                  </span>
                </div>
              </div>

              {/* Actions */}
              <Link
                to={`/book/${hotel.id}`}
                className="w-full bg-secondary text-on-secondary py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:opacity-95 transition-all font-bold shadow-sm"
              >
                <span className="material-symbols-outlined">book_online</span>
                Book Your Stay
              </Link>

              <p className="text-[10px] text-center text-outline uppercase tracking-wider font-semibold">
                Instant approval. Modify or cancel up to 24h prior.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HotelDetails;
