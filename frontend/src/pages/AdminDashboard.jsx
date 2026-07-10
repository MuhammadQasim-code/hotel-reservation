import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, resvRes] = await Promise.all([
          api.get('/reservations/admin/stats'),
          api.get('/reservations')
        ]);
        setStats(statsRes.data.data);
        setRecentReservations(resvRes.data.data.reservations.slice(0, 5));
      } catch (error) {
        console.error('Failed to load admin stats:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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
        <header className="mb-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-sm">
          <div>
            <h2 className="font-display-lg text-3xl md:text-4xl font-bold text-primary tracking-tight">System Statistics</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Real-time metrics and system activity for Lumina Hotels.</p>
          </div>
          <div className="bg-surface-container-high px-md py-sm rounded-lg flex items-center gap-xs border border-outline-variant/30">
            <span className="material-symbols-outlined text-secondary">calendar_today</span>
            <span className="font-label-md text-label-md">System Active Dashboard</span>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-sm md:gap-gutter mb-xl">
              {/* Card 1: Users */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 flex flex-col justify-between h-36">
                <span className="material-symbols-outlined text-outline text-[28px]">group</span>
                <div>
                  <p className="text-[28px] font-bold text-primary leading-none">{stats?.totalUsers || 0}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Total Users</p>
                </div>
              </div>

              {/* Card 2: Hotels */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 flex flex-col justify-between h-36">
                <span className="material-symbols-outlined text-outline text-[28px]">hotel</span>
                <div>
                  <p className="text-[28px] font-bold text-primary leading-none">{stats?.totalHotels || 0}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Total Hotels</p>
                </div>
              </div>

              {/* Card 3: Reservations */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 flex flex-col justify-between h-36">
                <span className="material-symbols-outlined text-outline text-[28px]">book_online</span>
                <div>
                  <p className="text-[28px] font-bold text-primary leading-none">{stats?.totalReservations || 0}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Total Reservations</p>
                </div>
              </div>

              {/* Card 4: Pending */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 flex flex-col justify-between h-36">
                <span className="material-symbols-outlined text-amber-600 text-[28px]">pending_actions</span>
                <div>
                  <p className="text-[28px] font-bold text-amber-600 leading-none">{stats?.pendingReservations || 0}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Pending Stays</p>
                </div>
              </div>
            </section>

            {/* Sub Status Grid */}
            <section className="grid grid-cols-3 gap-sm md:gap-gutter mb-xl">
              {/* Approved */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats?.approvedReservations || 0}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Approved</p>
              </div>
              {/* Rejected */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 text-center">
                <p className="text-2xl font-bold text-rose-600">{stats?.rejectedReservations || 0}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Rejected</p>
              </div>
              {/* Completed */}
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 custom-shadow-l1 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats?.completedReservations || 0}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mt-xs">Completed</p>
              </div>
            </section>

            {/* Recent Bookings Canvas */}
            <section className="bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/30 custom-shadow-l1">
              <div className="flex justify-between items-center mb-md border-b border-outline-variant/20 pb-xs">
                <h3 className="font-headline-md text-lg font-bold text-primary">Recent Global Bookings</h3>
                <Link to="/admin/reservations" className="text-label-sm font-label-sm text-primary font-bold hover:underline flex items-center gap-xs">
                  Manage Reservations
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {recentReservations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-label-sm font-label-sm text-outline text-left">
                        <th className="py-sm">Customer</th>
                        <th className="py-sm">Hotel</th>
                        <th className="py-sm hidden md:table-cell">Check-in</th>
                        <th className="py-sm hidden sm:table-cell">Guests</th>
                        <th className="py-sm">Status</th>
                        <th className="py-sm text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md text-on-surface-variant">
                      {recentReservations.map((resv) => (
                        <tr key={resv.id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="py-sm font-bold text-primary">
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
                          <td className="py-sm hidden sm:table-cell">{resv.number_of_persons}</td>
                          <td className="py-sm">
                            <span className={`px-sm py-xs rounded-full font-label-sm text-xs font-semibold ${getStatusColorClass(resv.status)}`}>
                              {resv.status}
                            </span>
                          </td>
                          <td className="py-sm text-right">
                            <Link
                              to="/admin/reservations"
                              className="text-primary font-bold hover:underline"
                            >
                              Review
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
                  <p className="text-on-surface-variant font-medium">No bookings logged in the system.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
