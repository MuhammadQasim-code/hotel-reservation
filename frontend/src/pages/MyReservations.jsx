import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing state
  const [editingResv, setEditingResv] = useState(null);
  const [cancelResvId, setCancelResvId] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reservations');
      setReservations(response.data.data.reservations);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleEditClick = (resv) => {
    setEditingResv(resv);
    
    // Format date properly for input field (YYYY-MM-DD)
    const formattedDate = new Date(resv.reservation_date).toISOString().split('T')[0];

    // Prepopulate form fields
    setValue('customerName', resv.customer_name);
    setValue('phoneNumber', resv.phone_number);
    setValue('reservationDate', formattedDate);
    setValue('reservationDay', resv.reservation_day);
    setValue('numberOfPersons', resv.number_of_persons);
    setValue('mealPreference', resv.meal_preference);
    setValue('stayType', resv.stay_type);
    setValue('specialNotes', resv.special_notes || '');
  };

  const onEditSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        reservationDate: data.reservationDate,
        reservationDay: data.reservationDay,
        numberOfPersons: parseInt(data.numberOfPersons, 10),
        mealPreference: data.mealPreference,
        stayType: data.stayType,
        specialNotes: data.specialNotes
      };

      await api.put(`/reservations/${editingResv.id}`, payload);
      setSuccessMsg('Reservation updated successfully.');
      setEditingResv(null);
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update reservation.');
    }
  };

  const handleCancelClick = (id) => {
    setCancelResvId(id);
  };

  const handleConfirmCancel = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/reservations/${cancelResvId}`);
      setSuccessMsg('Reservation cancelled successfully.');
      setCancelResvId(null);
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel reservation.');
      setCancelResvId(null);
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      case 'Completed':
        return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
      default:
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
    }
  };

  const getMinDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row">
      <Navbar />
      <Sidebar />

      {/* Main Canvas */}
      <main className="flex-grow md:ml-64 p-md md:p-lg pt-24 max-w-container-max mx-auto w-full text-left">
        
        {/* Header */}
        <header className="mb-lg">
          <h2 className="font-display-lg text-3xl font-bold text-primary tracking-tight">My Bookings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">View details, modify, or cancel your upcoming and past bookings.</p>
        </header>

        {/* Messaging alerts */}
        {errorMsg && (
          <div className="mb-md p-sm bg-error-container text-on-error-container border border-error/20 rounded-lg font-semibold text-body-md">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-md p-sm bg-secondary-container text-on-secondary-container border border-secondary/20 rounded-lg font-semibold text-body-md">
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : reservations.length > 0 ? (
          <section className="space-y-md">
            {reservations.map((resv) => (
              <div
                key={resv.id}
                className="bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/30 custom-shadow-l1 flex flex-col md:flex-row justify-between gap-md"
              >
                
                {/* Left Panel: Booking summary */}
                <div className="space-y-sm flex-grow">
                  <div className="flex flex-wrap items-center gap-sm">
                    <h3 className="font-headline-md text-xl font-bold text-primary">{resv.hotel_name}</h3>
                    <span className={`px-sm py-xs rounded-full font-label-sm text-xs font-semibold ${getStatusColorClass(resv.status)}`}>
                      {resv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-sm text-label-md font-label-md text-on-surface-variant">
                    <div>
                      <p className="text-outline uppercase tracking-wider text-[10px] font-bold">Check-in Date</p>
                      <p className="text-primary font-bold">
                        {new Date(resv.reservation_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-outline uppercase tracking-wider text-[10px] font-bold">Guests</p>
                      <p className="text-primary font-bold">{resv.number_of_persons} Persons</p>
                    </div>
                    <div>
                      <p className="text-outline uppercase tracking-wider text-[10px] font-bold">Meal Option</p>
                      <p className="text-primary font-bold">{resv.meal_preference}</p>
                    </div>
                    <div>
                      <p className="text-outline uppercase tracking-wider text-[10px] font-bold">Stay Type</p>
                      <p className="text-primary font-bold">{resv.stay_type}</p>
                    </div>
                  </div>

                  {resv.special_notes && (
                    <div className="bg-surface-container-low p-sm rounded-lg text-body-md text-on-surface-variant border border-outline-variant/20">
                      <span className="font-bold text-primary block text-xs">Special Requests:</span>
                      {resv.special_notes}
                    </div>
                  )}
                </div>

                {/* Right Panel: Operations (Gated by 'Pending' status) */}
                <div className="flex md:flex-col justify-end gap-sm items-end min-w-[120px]">
                  <p className="hidden md:block font-headline-md text-lg font-bold text-primary">
                    ${parseFloat(resv.price_per_night * resv.number_of_persons).toFixed(2)}
                  </p>
                  
                  {resv.status === 'Pending' ? (
                    <div className="flex md:flex-col gap-xs w-full md:w-auto">
                      <button
                        onClick={() => handleEditClick(resv)}
                        className="flex-1 md:w-full px-md py-xs bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:opacity-90 font-bold transition-all text-center flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span> Edit
                      </button>
                      <button
                        onClick={() => handleCancelClick(resv.id)}
                        className="flex-1 md:w-full px-md py-xs border border-error text-error rounded-lg font-label-sm text-label-sm hover:bg-error-container/10 font-bold transition-all text-center flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-sm">close</span> Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-outline uppercase tracking-wider font-bold italic">
                      Locked
                    </p>
                  )}
                </div>

              </div>
            ))}
          </section>
        ) : (
          <div className="text-center py-xl bg-surface-container-low rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-6xl mb-sm">book_online</span>
            <h3 className="font-headline-md text-lg font-bold text-primary mb-xs">No Reservations Found</h3>
            <p className="text-on-surface-variant">You don't have any bookings yet.</p>
          </div>
        )}

        {/* ----------------- EDIT RESERVATION MODAL ----------------- */}
        {editingResv && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-container/40 backdrop-blur-sm p-sm">
            <div className="bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/50 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-md text-left">
              <header className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
                <h3 className="font-headline-md text-xl font-bold text-primary">Modify Reservation</h3>
                <button
                  onClick={() => setEditingResv(null)}
                  className="p-xs text-on-surface-variant hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-sm">
                
                {/* Guest Name */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Guest Full Name</label>
                  <input
                    type="text"
                    className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                    {...register('customerName', { required: true })}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Contact Phone</label>
                  <input
                    type="tel"
                    className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                    {...register('phoneNumber', { required: true })}
                  />
                </div>

                {/* Date */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Check-in Date</label>
                  <input
                    type="date"
                    min={getMinDateString()}
                    className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                    {...register('reservationDate', { required: true })}
                  />
                </div>

                {/* Day */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Duration / Day description</label>
                  <input
                    type="text"
                    className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                    {...register('reservationDay', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  {/* Guests */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Guests</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full h-10 px-md border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                      {...register('numberOfPersons', { required: true, min: 1 })}
                    />
                  </div>

                  {/* Stay Type */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Stay Type</label>
                    <select
                      className="w-full h-10 px-md border border-outline-variant bg-surface-container-lowest rounded-lg font-body-md focus:border-primary outline-none"
                      {...register('stayType')}
                    >
                      <option value="Night Stay">Night Stay</option>
                      <option value="Day Stay">Day Stay</option>
                    </select>
                  </div>
                </div>

                {/* Meals */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Meal Preference</label>
                  <select
                    className="w-full h-10 px-md border border-outline-variant bg-surface-container-lowest rounded-lg font-body-md focus:border-primary outline-none"
                    {...register('mealPreference')}
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Special Notes</label>
                  <textarea
                    rows="2"
                    className="w-full p-sm border border-outline-variant rounded-lg font-body-md focus:border-primary outline-none"
                    {...register('specialNotes')}
                  />
                </div>

                <div className="flex gap-sm pt-sm">
                  <button
                    type="submit"
                    className="flex-1 h-12 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingResv(null)}
                    className="flex-1 h-12 border border-outline text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-surface-variant"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------- CONFIRM CANCEL MODAL ----------------- */}
        {cancelResvId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-container/40 backdrop-blur-sm p-sm">
            <div className="bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/50 max-w-sm w-full shadow-2xl space-y-md text-left">
              <header className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
                <h3 className="font-headline-md text-xl font-bold text-primary">Cancel Reservation</h3>
                <button
                  onClick={() => setCancelResvId(null)}
                  className="p-xs text-on-surface-variant hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Are you sure you want to cancel this reservation request? This action is permanent and cannot be undone.
              </p>

              <div className="flex gap-sm">
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 h-10 bg-error text-on-error rounded-lg font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm"
                >
                  Confirm Cancel
                </button>
                <button
                  onClick={() => setCancelResvId(null)}
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

export default MyReservations;
