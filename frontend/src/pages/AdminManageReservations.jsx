import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';

const AdminManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals / Details view state
  const [selectedResv, setSelectedResv] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.patch(`/reservations/${id}/status`, { status });
      setSuccessMsg(`Reservation status updated to ${status}.`);
      
      // Close modal if open
      if (selectedResv && selectedResv.id === id) {
        setSelectedResv(null);
      }
      
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update reservation status.');
    } finally {
      setActionLoading(false);
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

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row">
      <Navbar />
      <Sidebar />

      {/* Main Canvas */}
      <main className="flex-grow md:ml-64 p-md md:p-lg pt-24 max-w-container-max mx-auto w-full text-left">
        
        {/* Header */}
        <header className="mb-lg">
          <h2 className="font-display-lg text-3xl font-bold text-primary tracking-tight">Manage Reservations</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Review booking requests, approve or reject stays, and track check-ins.</p>
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

        {/* Reservations List */}
        {loading ? (
          <div className="flex justify-center items-center py-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : reservations.length > 0 ? (
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 custom-shadow-l1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-label-sm font-label-sm text-outline text-left">
                    <th className="py-sm pl-md">Customer</th>
                    <th className="py-sm">Hotel</th>
                    <th className="py-sm hidden md:table-cell">Check-in Date</th>
                    <th className="py-sm hidden sm:table-cell">Guests</th>
                    <th className="py-sm">Status</th>
                    <th className="py-sm text-right pr-md">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md text-on-surface-variant">
                  {reservations.map((resv) => (
                    <tr key={resv.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-sm pl-md font-bold text-primary">
                        <div>{resv.customer_name}</div>
                        <div className="text-[10px] text-outline font-semibold font-sans">{resv.user_email}</div>
                      </td>
                      <td className="py-sm">{resv.hotel_name}</td>
                      <td className="py-sm hidden md:table-cell">
                        {new Date(resv.reservation_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-sm hidden sm:table-cell">{resv.number_of_persons} Guests</td>
                      <td className="py-sm">
                        <span className={`px-sm py-xs rounded-full font-label-sm text-xs font-semibold ${getStatusColorClass(resv.status)}`}>
                          {resv.status}
                        </span>
                      </td>
                      <td className="py-sm text-right pr-md">
                        <div className="flex justify-end gap-sm">
                          <button
                            onClick={() => setSelectedResv(resv)}
                            className="px-sm py-xs border border-outline hover:bg-surface-variant text-on-surface-variant rounded-lg font-label-sm text-xs font-semibold"
                          >
                            Details
                          </button>

                          {resv.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(resv.id, 'Approved')}
                                className="px-sm py-xs bg-emerald-600 text-on-primary rounded-lg font-label-sm text-xs font-semibold hover:opacity-90"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(resv.id, 'Rejected')}
                                className="px-sm py-xs bg-rose-600 text-on-primary rounded-lg font-label-sm text-xs font-semibold hover:opacity-90"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {resv.status === 'Approved' && (
                            <button
                              onClick={() => handleUpdateStatus(resv.id, 'Completed')}
                              className="px-sm py-xs bg-blue-600 text-on-primary rounded-lg font-label-sm text-xs font-semibold hover:opacity-90"
                            >
                              Mark Complete
                            </button>
                          )}
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
            <span className="material-symbols-outlined text-outline text-6xl mb-sm">book_online</span>
            <h3 className="font-headline-md text-lg font-bold text-primary mb-xs">No Bookings</h3>
            <p className="text-on-surface-variant">There are no reservations filed in the system database.</p>
          </div>
        )}

        {/* ----------------- RESERVATION DETAILS MODAL ----------------- */}
        {selectedResv && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-container/40 backdrop-blur-sm p-sm">
            <div className="bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/50 max-w-md w-full shadow-2xl space-y-md text-left">
              <header className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
                <h3 className="font-headline-md text-xl font-bold text-primary">Booking Details</h3>
                <button
                  onClick={() => setSelectedResv(null)}
                  className="p-xs text-on-surface-variant hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <div className="space-y-sm text-label-md font-label-md text-on-surface-variant">
                <div className="flex justify-between border-b border-outline-variant/10 pb-xs">
                  <span>Guest Name</span>
                  <span className="font-bold text-primary">{selectedResv.customer_name}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/10 pb-xs">
                  <span>Contact Phone</span>
                  <span className="font-bold text-primary">{selectedResv.phone_number}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/10 pb-xs">
                  <span>Check-in Date</span>
                  <span className="font-bold text-primary">
                    {new Date(selectedResv.reservation_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/10 pb-xs">
                  <span>Duration Day</span>
                  <span className="font-bold text-primary">{selectedResv.reservation_day}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/10 pb-xs">
                  <span>Guests Headcount</span>
                  <span className="font-bold text-primary">{selectedResv.number_of_persons} Guests</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/10 pb-xs">
                  <span>Stay Option</span>
                  <span className="font-bold text-primary">{selectedResv.stay_type}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/10 pb-xs">
                  <span>Meal Preference</span>
                  <span className="font-bold text-primary">{selectedResv.meal_preference}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/10 pb-xs">
                  <span>Status</span>
                  <span className={`px-sm py-xs rounded-full text-xs font-semibold ${getStatusColorClass(selectedResv.status)}`}>
                    {selectedResv.status}
                  </span>
                </div>

                {selectedResv.special_notes && (
                  <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant/20 mt-xs">
                    <span className="font-bold text-primary text-xs block mb-xs">Special Notes:</span>
                    <p className="text-body-md leading-relaxed">{selectedResv.special_notes}</p>
                  </div>
                )}
              </div>

              {/* Status Action Buttons inside Modal */}
              <div className="flex gap-sm pt-sm border-t border-outline-variant/20">
                {selectedResv.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedResv.id, 'Approved')}
                      disabled={actionLoading}
                      className="flex-grow h-10 bg-emerald-600 text-on-primary rounded-lg font-label-sm text-xs font-semibold hover:opacity-90"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedResv.id, 'Rejected')}
                      disabled={actionLoading}
                      className="flex-grow h-10 bg-rose-600 text-on-primary rounded-lg font-label-sm text-xs font-semibold hover:opacity-90"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedResv.status === 'Approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedResv.id, 'Completed')}
                    disabled={actionLoading}
                    className="w-full h-10 bg-blue-600 text-on-primary rounded-lg font-label-sm text-xs font-semibold hover:opacity-90"
                  >
                    Mark Stay Completed
                  </button>
                )}
                <button
                  onClick={() => setSelectedResv(null)}
                  className="flex-1 h-10 border border-outline text-on-surface-variant rounded-lg font-label-sm text-xs font-semibold hover:bg-surface-variant"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminManageReservations;
