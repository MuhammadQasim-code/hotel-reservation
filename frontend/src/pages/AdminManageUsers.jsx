import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';

const AdminManageUsers = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete modal state
  const [deleteUserId, setDeleteUserId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (id) => {
    if (id === currentAdmin.id) {
      setErrorMsg('You cannot delete your own admin session.');
      return;
    }
    setDeleteUserId(id);
  };

  const handleConfirmDelete = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/users/${deleteUserId}`);
      setSuccessMsg('User account deleted successfully.');
      setDeleteUserId(null);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete user.');
      setDeleteUserId(null);
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
          <h2 className="font-display-lg text-3xl font-bold text-primary tracking-tight">Manage Users</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">View user accounts, verify login credentials, and delete profiles.</p>
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

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center py-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : users.length > 0 ? (
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 custom-shadow-l1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-label-sm font-label-sm text-outline text-left">
                    <th className="py-sm pl-md">Full Name</th>
                    <th className="py-sm">Email Address</th>
                    <th className="py-sm">Phone Number</th>
                    <th className="py-sm">Role</th>
                    <th className="py-sm hidden md:table-cell">Joined Date</th>
                    <th className="py-sm text-right pr-md">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md text-on-surface-variant">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-sm pl-md font-bold text-primary">{user.full_name}</td>
                      <td className="py-sm">{user.email}</td>
                      <td className="py-sm">{user.phone_number}</td>
                      <td className="py-sm">
                        <span className={`px-sm py-xs rounded-full font-label-sm text-xs font-semibold uppercase ${
                          user.role === 'admin' 
                            ? 'bg-secondary-container text-on-secondary-container border border-secondary/20' 
                            : 'bg-surface-variant text-primary border border-outline-variant/30'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-sm hidden md:table-cell">
                        {new Date(user.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-sm text-right pr-md">
                        {user.id !== currentAdmin.id ? (
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            className="p-xs text-outline hover:text-error transition-all"
                            title="Delete User"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-outline uppercase tracking-wider font-semibold italic pl-xs pr-xs">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="text-center py-xl bg-surface-container-low rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-6xl mb-sm">group</span>
            <h3 className="font-headline-md text-lg font-bold text-primary mb-xs">No Users Found</h3>
            <p className="text-on-surface-variant">There are no user profiles cataloged in the system database.</p>
          </div>
        )}

        {/* ----------------- CONFIRM DELETE MODAL ----------------- */}
        {deleteUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-container/40 backdrop-blur-sm p-sm">
            <div className="bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/50 max-w-sm w-full shadow-2xl space-y-md text-left">
              <header className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
                <h3 className="font-headline-md text-xl font-bold text-primary">Delete User</h3>
                <button
                  onClick={() => setDeleteUserId(null)}
                  className="p-xs text-on-surface-variant hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Are you sure you want to delete this user account? All associated stay reservations will also be permanently deleted.
              </p>

              <div className="flex gap-sm">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 h-10 bg-error text-on-error rounded-lg font-label-md text-label-md font-semibold hover:opacity-95 shadow-sm"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteUserId(null)}
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

export default AdminManageUsers;
