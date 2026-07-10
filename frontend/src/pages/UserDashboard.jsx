import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';

const UserDashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get('/reservations');
        setReservations(response.data.data.reservations);
      } catch (error) {
        console.error('Failed to load reservations:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const totalBookings = reservations.length;
  const pendingBookings = reservations.filter((r) => r.status === 'Pending').length;
  const approvedBookings = reservations.filter((r) => r.status === 'Approved').length;
  const completedBookings = reservations.filter((r) => r.status === 'Completed').length;

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
        
        {/* Welcome Header */}
        <header className="mb-lg">
          <h2 className="font-display-lg text-3xl md:text-4xl font-bold text-primary tracking-tight">
            Welcome, {user?.fullName || 'Guest'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage your sanctuary requests and reservation history in real time.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Bento Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-sm md:gap-md mb-xl">
              {/* Card 1 */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 flex flex-col justify-between h-32 text-left">
                <span className="material-symbols-outlined text-outline text-[28px]">book_online</span>
                <div>
                  <p className="text-[28px] font-bold text-primary leading-none">{totalBookings}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Total Stays</p>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 flex flex-col justify-between h-32 text-left">
                <span className="material-symbols-outlined text-amber-600 text-[28px]">pending_actions</span>
                <div>
                  <p className="text-[28px] font-bold text-amber-600 leading-none">{pendingBookings}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Pending</p>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 flex flex-col justify-between h-32 text-left">
                <span className="material-symbols-outlined text-emerald-600 text-[28px]">verified</span>
                <div>
                  <p className="text-[28px] font-bold text-emerald-600 leading-none">{approvedBookings}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Approved</p>
                </div>
              </div>
              {/* Card 4 */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 flex flex-col justify-between h-32 text-left">
                <span className="material-symbols-outlined text-blue-600 text-[28px]">hotel</span>
                <div>
                  <p className="text-[28px] font-bold text-blue-600 leading-none">{completedBookings}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Completed</p>
                </div>
              </div>
            </section>

            {/* Recent Stays */}
            <section className="bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/30 custom-shadow-l1">
              <h3 className="font-headline-md text-lg font-bold text-primary mb-md border-b border-outline-variant/20 pb-xs">
                Recent Stays
              </h3>

              {reservations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-label-sm font-label-sm text-outline text-left">
                        <th className="py-sm">Hotel</th>
                        <th className="py-sm hidden md:table-cell">City</th>
                        <th className="py-sm">Check-in Date</th>
                        <th className="py-sm hidden sm:table-cell">Guests</th>
                        <th className="py-sm">Status</th>
                        <th className="py-sm text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md text-on-surface-variant">
                      {reservations.slice(0, 5).map((resv) => (
                        <tr key={resv.id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="py-sm font-bold text-primary">{resv.hotel_name}</td>
                          <td className="py-sm hidden md:table-cell">{resv.city}</td>
                          <td className="py-sm">
                            {new Date(resv.reservation_date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-sm hidden sm:table-cell">{resv.number_of_persons}</td>
                          <td className="py-sm">
                            <span className={`px-sm py-xs rounded-full font-label-sm text-xs font-semibold ${getStatusColorClass(resv.status)}`}>
                              {resv.status}
                            </span>
                          </td>
                          <td className="py-sm text-right">
                            <Link
                              to="/my-reservations"
                              className="text-primary font-bold hover:underline flex items-center gap-xs justify-end"
                            >
                              Manage
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-xl">
                  <span className="material-symbols-outlined text-outline text-5xl mb-sm">book_online</span>
                  <h4 className="font-headline-md text-md font-bold text-primary mb-xs">No Stays Found</h4>
                  <p className="text-on-surface-variant mb-md max-w-sm mx-auto">
                    You haven't requested any hotel reservations yet. Explore our portfolio of premium properties and book your first stay!
                  </p>
                  <Link
                    to="/hotels"
                    className="inline-block bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-md text-label-md font-bold hover:opacity-95 shadow-sm"
                  >
                    Browse Hotels
                  </Link>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
