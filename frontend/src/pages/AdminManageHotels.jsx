import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';

const AdminManageHotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const [editHotel, setEditHotel] = useState(null);
  const [deleteHotelId, setDeleteHotelId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm();

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hotels');
      setHotels(response.data.data.hotels);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Listen to url search params to open add modal
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleAddNewClick();
      // Remove query parameter so it doesn't reopen
      setSearchParams({});
    }
  }, [searchParams]);

  const handleAddNewClick = () => {
    setEditHotel(null);
    reset({
      hotelName: '',
      city: '',
      address: '',
      description: '',
      pricePerNight: '',
      maximumCapacity: '',
      amenities: '',
      imageFile: null
    });
    setShowModal(true);
  };

  const handleEditClick = (hotel) => {
    setEditHotel(hotel);
    reset({
      hotelName: hotel.hotel_name,
      city: hotel.city,
      address: hotel.address,
      description: hotel.description,
      pricePerNight: hotel.price_per_night,
      maximumCapacity: hotel.maximum_capacity,
      amenities: hotel.amenities,
      imageFile: null
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Build FormData for multipart-form upload
      const formData = new FormData();
      formData.append('hotelName', data.hotelName);
      formData.append('city', data.city);
      formData.append('address', data.address);
      formData.append('description', data.description);
      formData.append('pricePerNight', data.pricePerNight);
      formData.append('maximumCapacity', data.maximumCapacity);
      formData.append('amenities', data.amenities || '');
      
      if (data.imageFile && data.imageFile[0]) {
        formData.append('image', data.imageFile[0]);
      }

      const headers = { 'Content-Type': 'multipart/form-data' };

      if (editHotel) {
        // Update Hotel
        await api.put(`/hotels/${editHotel.id}`, formData, { headers });
        setSuccessMsg('Hotel updated successfully.');
      } else {
        // Create Hotel
        await api.post('/hotels', formData, { headers });
        setSuccessMsg('Hotel added successfully.');
      }

      setShowModal(false);
      fetchHotels();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save hotel.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteHotelId(id);
  };

  const handleConfirmDelete = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/hotels/${deleteHotelId}`);
      setSuccessMsg('Hotel deleted successfully.');
      setDeleteHotelId(null);
      fetchHotels();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete hotel.');
      setDeleteHotelId(null);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row">
      <Navbar />
      <Sidebar />

      {/* Main Canvas */}
      <main className="flex-grow md:ml-64 p-md md:p-lg pt-24 max-w-container-max mx-auto w-full text-left">
        
        {/* Header */}
        <header className="mb-lg flex flex-col sm:flex-row justify-between items-start sm:items-end gap-sm">
          <div>
            <h2 className="font-display-lg text-3xl font-bold text-primary tracking-tight">Manage Hotels</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Add, modify, or remove cataloged hotel properties.</p>
          </div>
          <button
            onClick={handleAddNewClick}
            className="bg-primary text-on-primary py-sm px-md rounded-lg font-label-md text-label-md flex items-center gap-xs hover:opacity-90 transition-all font-semibold shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span> Add New Hotel
          </button>
        </header>

        {successMsg && (
          <div className="mb-md p-sm bg-secondary-container text-on-secondary-container border border-secondary/20 rounded-lg font-semibold text-body-md">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-md p-sm bg-error-container text-on-error-container border border-error/20 rounded-lg font-semibold text-body-md">
            {errorMsg}
          </div>
        )}

        {/* Hotels Table List */}
        {loading ? (
          <div className="flex justify-center items-center py-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : hotels.length > 0 ? (
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 custom-shadow-l1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-label-sm font-label-sm text-outline text-left">
                    <th className="py-sm pl-md">Thumbnail</th>
                    <th className="py-sm">Hotel Name</th>
                    <th className="py-sm">City</th>
                    <th className="py-sm hidden md:table-cell">Price/Night</th>
                    <th className="py-sm hidden md:table-cell">Capacity</th>
                    <th className="py-sm text-right pr-md">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md text-on-surface-variant">
                  {hotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-sm pl-md">
                        <div className="w-16 h-10 rounded overflow-hidden bg-surface-variant border border-outline-variant/20">
                          <img
                            className="w-full h-full object-cover"
                            src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80'}
                            alt={hotel.hotel_name}
                          />
                        </div>
                      </td>
                      <td className="py-sm font-bold text-primary">{hotel.hotel_name}</td>
                      <td className="py-sm">{hotel.city}</td>
                      <td className="py-sm hidden md:table-cell">${hotel.price_per_night}</td>
                      <td className="py-sm hidden md:table-cell">{hotel.maximum_capacity} Guests</td>
                      <td className="py-sm text-right pr-md">
                        <div className="flex justify-end gap-sm">
                          <button
                            onClick={() => handleEditClick(hotel)}
                            className="p-xs text-outline hover:text-primary transition-all"
                            title="Edit Hotel"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(hotel.id)}
                            className="p-xs text-outline hover:text-error transition-all"
                            title="Delete Hotel"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="text-center py-xl bg-surface-container-low rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-6xl mb-sm">hotel</span>
            <h3 className="font-headline-md text-lg font-bold text-primary mb-xs">No Hotels</h3>
            <p className="text-on-surface-variant">There are no properties cataloged. Click "Add New Hotel" to create one.</p>
          </div>
        )}

        {/* ----------------- ADD/EDIT HOTEL MODAL ----------------- */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-container/40 backdrop-blur-sm p-sm">
            <div className="bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/50 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-md text-left">
              <header className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
                <h3 className="font-headline-md text-xl font-bold text-primary">
                  {editHotel ? 'Edit Hotel Details' : 'Add New Property'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-xs text-on-surface-variant hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-sm">
                
                {/* Hotel Name */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Hotel Name</label>
                  <input
                    type="text"
                    className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                    {...register('hotelName', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  {/* City */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-medium">City</label>
                    <input
                      type="text"
                      className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                      {...register('city', { required: true })}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Address</label>
                    <input
                      type="text"
                      className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                      {...register('address', { required: true })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Description</label>
                  <textarea
                    rows="3"
                    className="w-full p-sm border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                    {...register('description', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  {/* Price */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Price / Night ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                      {...register('pricePerNight', { required: true })}
                    />
                  </div>

                  {/* Max Capacity */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Max Capacity</label>
                    <input
                      type="number"
                      className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                      {...register('maximumCapacity', { required: true })}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">
                    Amenities (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Pool, Spa, Free Wi-Fi"
                    className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                    {...register('amenities')}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">
                    Hotel Photo {editHotel && '(Leave blank to keep existing)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full file:h-10 file:px-md file:border-0 file:bg-surface-variant file:text-primary file:font-semibold file:rounded-lg file:mr-md file:cursor-pointer border border-outline-variant rounded-lg font-body-md"
                    {...register('imageFile')}
                  />
                </div>

                <div className="flex gap-sm pt-sm">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 h-12 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm flex items-center justify-center"
                  >
                    {submitLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Save Property'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-12 border border-outline text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-surface-variant"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------- CONFIRM DELETE MODAL ----------------- */}
        {deleteHotelId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-container/40 backdrop-blur-sm p-sm">
            <div className="bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/50 max-w-sm w-full shadow-2xl space-y-md text-left">
              <header className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
                <h3 className="font-headline-md text-xl font-bold text-primary">Delete Hotel</h3>
                <button
                  onClick={() => setDeleteHotelId(null)}
                  className="p-xs text-on-surface-variant hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Are you sure you want to delete this property? All associated reservations will also be permanently deleted.
              </p>

              <div className="flex gap-sm">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 h-10 bg-error text-on-error rounded-lg font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteHotelId(null)}
                  className="flex-1 h-10 border border-outline text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-surface-variant"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminManageHotels;
