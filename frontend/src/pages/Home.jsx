import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../layouts/Navbar';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await api.get('/hotels');
        // Get first 4 hotels as featured
        setHotels(response.data.data.hotels.slice(0, 4));
      } catch (error) {
        console.error('Failed to load featured hotels:', error.message);
      }
    };
    fetchHotels();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/hotels?search=${searchQuery}&city=${searchCity}`);
  };

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center pt-20">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80')`,
                filter: 'brightness(0.7)'
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/80 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-container-max mx-auto px-lg w-full">
            <div className="max-w-2xl text-left">
              <h1 className="font-display-lg text-4xl md:text-6xl mb-md leading-tight text-primary font-bold">
                Find Your <br />
                <span className="text-secondary italic">Perfect Stay</span>
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant mb-xl max-w-lg">
                Experience the pinnacle of hospitality where modern design meets timeless comfort in the world's most sought-after locations.
              </p>

              {/* Search Bar Bento Component */}
              <form
                onSubmit={handleSearch}
                className="glass-card p-sm rounded-full flex flex-col md:flex-row items-center gap-base shadow-lg border border-white/20 max-w-xl"
              >
                <div className="flex-1 flex items-center gap-sm px-md py-xs w-full">
                  <span className="material-symbols-outlined text-secondary">search</span>
                  <div className="flex flex-col w-full text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Search</span>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md w-full focus:outline-none placeholder-outline-variant text-on-surface"
                      placeholder="Hotel name or keyword"
                      type="text"
                    />
                  </div>
                </div>
                <div className="w-px h-8 bg-outline-variant hidden md:block"></div>
                <div className="flex-1 flex items-center gap-sm px-md py-xs w-full">
                  <span className="material-symbols-outlined text-secondary">location_on</span>
                  <div className="flex flex-col w-full text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-outline">City</span>
                    <input
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="bg-transparent border-none p-0 focus:ring-0 font-body-md text-body-md w-full focus:outline-none placeholder-outline-variant text-on-surface"
                      placeholder="Santorini, Tokyo, Bali..."
                      type="text"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-secondary text-on-secondary px-lg py-md rounded-full font-label-md text-label-md hover:opacity-90 transition-all flex items-center gap-xs w-full md:w-auto justify-center"
                >
                  <span className="material-symbols-outlined">explore</span>
                  Explore
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-xl bg-surface">
          <div className="max-w-container-max mx-auto px-lg grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
            <div className="relative">
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-xl border border-outline-variant/30">
                <img
                  className="w-full h-full object-cover"
                  alt="Luxury Lobby"
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                />
              </div>
              <div className="absolute -bottom-md -right-md w-64 glass-card p-md rounded-xl shadow-lg border border-white/40 hidden md:block">
                <p className="font-headline-md text-headline-md text-primary font-bold">15+</p>
                <p className="text-label-md font-label-md text-on-surface-variant">Years of Curating Unforgettable Memories</p>
              </div>
            </div>
            <div className="text-left">
              <h2 className="font-headline-lg text-3xl font-bold mb-md text-primary">Our Heritage of Excellence</h2>
              <p className="text-body-lg font-body-lg text-on-surface-variant mb-md leading-relaxed">
                Lumina Hotels is not just a booking platform; it is a gateway to the world's most refined sanctuary spaces. Founded on the principles of precision and quiet luxury, we bridge the gap between corporate efficiency and vacation relaxation.
              </p>
              <p className="text-body-md font-body-md text-on-surface-variant mb-lg leading-relaxed">
                Every property in our portfolio is hand-selected and rigorously vetted for service quality, architectural integrity, and environmental responsibility. We believe travel should be seamless, leaving you space to focus on what truly matters.
              </p>
              <Link
                to="/hotels"
                className="inline-block px-lg py-sm rounded-full font-label-md text-label-md border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all font-semibold"
              >
                Browse All Properties
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-xl bg-surface-container-low">
          <div className="max-w-container-max mx-auto px-lg">
            <div className="text-center mb-xl">
              <h2 className="font-headline-lg text-3xl font-bold mb-base text-primary">The Lumina Difference</h2>
              <p className="text-body-md font-body-md text-on-surface-variant">Elevating your travel standard with every reservation.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {/* Reason 1 */}
              <div className="bg-surface p-xl rounded-xl shadow-sm border border-outline-variant/30 text-center hover-lift">
                <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-md">
                  <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: '32px' }}>
                    payments
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-sm font-bold text-primary">Best Price Guarantee</h3>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  Exclusive rates for corporate and luxury stays found nowhere else on the web.
                </p>
              </div>
              {/* Reason 2 */}
              <div className="bg-surface p-xl rounded-xl shadow-sm border border-outline-variant/30 text-center hover-lift">
                <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-md">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>
                    verified_user
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-sm font-bold text-primary">Quality Service</h3>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  24/7 personalized concierge support to ensure your stay exceeds expectations.
                </p>
              </div>
              {/* Reason 3 */}
              <div className="bg-surface p-xl rounded-xl shadow-sm border border-outline-variant/30 text-center hover-lift">
                <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-md">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>
                    touch_app
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-sm font-bold text-primary">Easy Booking</h3>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  A frictionless digital experience from selection to checkout in under three minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Hotels Grid */}
        <section className="py-xl bg-surface">
          <div className="max-w-container-max mx-auto px-lg">
            <div className="flex justify-between items-end mb-xl">
              <div className="text-left">
                <h2 className="font-headline-lg text-3xl font-bold mb-base text-primary">Featured Destinations</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">Explore our most-requested stays this season.</p>
              </div>
              <Link to="/hotels" className="hidden md:flex items-center gap-xs font-label-md text-label-md text-primary group font-bold">
                View all properties
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>

            {hotels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                {hotels.map((hotel) => (
                  <Link to={`/hotels/${hotel.id}`} key={hotel.id} className="group cursor-pointer text-left block">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-sm shadow-sm border border-outline-variant/30">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={hotel.hotel_name}
                        src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                      />
                      <div className="absolute top-sm right-sm bg-surface/90 backdrop-blur-sm px-sm py-xs rounded-full shadow-sm">
                        <span className="text-label-sm font-label-sm text-primary font-bold">From ${hotel.price_per_night}/nt</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-headline-md text-lg font-bold text-primary mb-xs group-hover:text-secondary transition-colors">
                          {hotel.hotel_name}
                        </h3>
                        <p className="text-label-md font-label-md text-on-surface-variant flex items-center gap-xs">
                          <span className="material-symbols-outlined text-sm text-secondary">location_on</span> {hotel.city}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-lg bg-surface-container rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-outline text-5xl mb-sm">hotel</span>
                <p className="text-on-surface-variant font-medium">No properties available at the moment.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-surface-container-highest border-t border-outline-variant/40 w-full py-xl mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg max-w-container-max mx-auto gap-md">
          <div className="font-headline-md text-headline-md font-bold text-primary">Lumina Luxury Hotels</div>
          <div className="flex flex-wrap justify-center gap-md">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:underline decoration-primary" href="#privacy">
              Privacy Policy
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:underline decoration-primary" href="#terms">
              Terms of Service
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:underline decoration-primary" href="#cookies">
              Cookies
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:underline decoration-primary" href="#access">
              Accessibility
            </a>
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant">
            © 2026 Lumina Luxury Hotels. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
