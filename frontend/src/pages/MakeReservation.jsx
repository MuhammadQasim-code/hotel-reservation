import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../layouts/Navbar';

const MakeReservation = () => {
  const { hotelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      customerName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      numberOfPersons: 1,
      mealPreference: 'Breakfast',
      stayType: 'Night Stay',
      specialNotes: ''
    }
  });

  useEffect(() => {
    // Populate form if user info changes
    if (user) {
      setValue('customerName', user.fullName);
      setValue('phoneNumber', user.phoneNumber);
    }
  }, [user, setValue]);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await api.get(`/hotels/${hotelId}`);
        setHotel(response.data.data.hotel);
      } catch (err) {
        setErrorMsg('Failed to load hotel info.');
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [hotelId]);

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitLoading(true);

    try {
      const payload = {
        hotelId: parseInt(hotelId, 10),
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        reservationDate: data.reservationDate,
        reservationDay: data.reservationDay,
        numberOfPersons: parseInt(data.numberOfPersons, 10),
        mealPreference: data.mealPreference,
        stayType: data.stayType,
        specialNotes: data.specialNotes
      };

      await api.post('/reservations', payload);
      setSuccessMsg('Reservation submitted successfully! Redirecting...');
      setTimeout(() => navigate('/my-reservations'), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit reservation.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getMinDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (errorMsg && !hotel) {
    return (
      <div className="bg-surface min-h-screen flex flex-col justify-center items-center">
        <Navbar />
        <span className="material-symbols-outlined text-error text-6xl mb-sm">error</span>
        <h2 className="font-headline-lg text-2xl font-bold text-primary mb-xs">Error</h2>
        <p className="text-on-surface-variant mb-md">{errorMsg}</p>
        <Link to="/hotels" className="bg-primary text-on-primary py-xs px-md rounded-lg font-label-md text-label-md">
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-container-max mx-auto px-lg w-full pt-28 pb-xl text-left">
        <div className="mb-md">
          <Link to={`/hotels/${hotelId}`} className="text-label-sm font-label-sm text-outline hover:text-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Details
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          
          {/* Form (Col-span 2) */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/30 shadow-sm space-y-md">
            <header className="border-b border-outline-variant/20 pb-sm">
              <h1 className="font-headline-lg text-2xl font-bold text-primary">Make a Reservation</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Complete the form below to request your luxury booking.</p>
            </header>

            {errorMsg && (
              <div className="p-sm bg-error-container text-on-error-container border border-error/20 rounded-lg font-semibold text-body-md">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-sm bg-secondary-container text-on-secondary-container border border-secondary/20 rounded-lg font-semibold text-body-md">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                
                {/* Customer Name */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Guest Full Name</label>
                  <input
                    type="text"
                    className={`w-full h-12 px-md border rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary ${
                      errors.customerName ? 'border-error' : 'border-outline-variant'
                    }`}
                    {...register('customerName', { required: 'Guest name is required.' })}
                  />
                  {errors.customerName && <p className="text-error text-xs font-semibold">{errors.customerName.message}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Contact Phone</label>
                  <input
                    type="tel"
                    className={`w-full h-12 px-md border rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary ${
                      errors.phoneNumber ? 'border-error' : 'border-outline-variant'
                    }`}
                    {...register('phoneNumber', { required: 'Phone number is required.' })}
                  />
                  {errors.phoneNumber && <p className="text-error text-xs font-semibold">{errors.phoneNumber.message}</p>}
                </div>

                {/* Reservation Date */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Check-in Date</label>
                  <input
                    type="date"
                    min={getMinDateString()}
                    className={`w-full h-12 px-md border rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary ${
                      errors.reservationDate ? 'border-error' : 'border-outline-variant'
                    }`}
                    {...register('reservationDate', { required: 'Reservation date is required.' })}
                  />
                  {errors.reservationDate && <p className="text-error text-xs font-semibold">{errors.reservationDate.message}</p>}
                </div>

                {/* Reservation Day */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Day (e.g. Monday, 3 Nights)</label>
                  <input
                    type="text"
                    placeholder="e.g. Friday"
                    className={`w-full h-12 px-md border rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary ${
                      errors.reservationDay ? 'border-error' : 'border-outline-variant'
                    }`}
                    {...register('reservationDay', { required: 'Reservation day/stay count description is required.' })}
                  />
                  {errors.reservationDay && <p className="text-error text-xs font-semibold">{errors.reservationDay.message}</p>}
                </div>

                {/* Number of Persons */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    max={hotel.maximum_capacity}
                    className={`w-full h-12 px-md border rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary ${
                      errors.numberOfPersons ? 'border-error' : 'border-outline-variant'
                    }`}
                    {...register('numberOfPersons', {
                      required: 'Number of guests is required.',
                      min: { value: 1, message: 'Guests must be at least 1.' },
                      max: {
                        value: hotel.maximum_capacity,
                        message: `Maximum capacity for this hotel is ${hotel.maximum_capacity} guests.`
                      }
                    })}
                  />
                  {errors.numberOfPersons && <p className="text-error text-xs font-semibold">{errors.numberOfPersons.message}</p>}
                </div>

                {/* Stay Type */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Stay Type</label>
                  <select
                    className="w-full h-12 px-md border border-outline-variant bg-surface-container-lowest rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                    {...register('stayType')}
                  >
                    <option value="Night Stay">Night Stay</option>
                    <option value="Day Stay">Day Stay</option>
                  </select>
                </div>

                {/* Meal Preference */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Meal Preference</label>
                  <select
                    className="w-full h-12 px-md border border-outline-variant bg-surface-container-lowest rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                    {...register('mealPreference')}
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

              </div>

              {/* Special Notes */}
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Optional Special Notes / Requests</label>
                <textarea
                  rows="3"
                  placeholder="E.g., early check-in, dietary restrictions, airport shuttle arrangements..."
                  className="w-full p-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                  {...register('specialNotes')}
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full h-12 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg shadow-sm hover:opacity-95 active:scale-[0.98] transition-all font-bold flex items-center justify-center gap-xs"
              >
                {submitLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined">hotel_class</span>
                    Request Booking
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Hotel Details Info Card */}
          <div className="h-fit">
            <div className="bg-surface-container-lowest p-md rounded-xl shadow-md border border-outline-variant/30 space-y-md">
              <h3 className="font-headline-md text-lg font-bold text-primary border-b border-outline-variant/20 pb-xs">
                Selected Hotel
              </h3>
              
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-surface-variant">
                <img
                  className="w-full h-full object-cover"
                  src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                  alt={hotel.hotel_name}
                />
              </div>

              <div>
                <h4 className="font-headline-md text-md font-bold text-primary">{hotel.hotel_name}</h4>
                <p className="text-label-md font-label-md text-on-surface-variant flex items-center gap-xs mt-xs">
                  <span className="material-symbols-outlined text-secondary text-sm">location_on</span>
                  {hotel.city}
                </p>
              </div>

              <div className="border-t border-outline-variant/20 pt-md space-y-sm text-label-md font-label-md text-on-surface-variant">
                <div className="flex justify-between font-bold text-primary">
                  <span>Price Per Night</span>
                  <span>${hotel.price_per_night}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum Capacity</span>
                  <span>{hotel.maximum_capacity} Persons</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default MakeReservation;
