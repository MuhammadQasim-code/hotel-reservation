import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../layouts/Sidebar';
import Navbar from '../layouts/Navbar';

const MyProfile = () => {
  const { user, refreshProfile } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (user) {
      setValue('fullName', user.fullName);
      setValue('email', user.email);
      setValue('phoneNumber', user.phoneNumber);
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.put('/auth/profile', {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber
      });
      setSuccessMsg('Profile updated successfully.');
      await refreshProfile();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
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
          <h2 className="font-display-lg text-3xl font-bold text-primary tracking-tight">Account Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Update your personal information and contact settings.</p>
        </header>

        <div className="max-w-2xl bg-surface-container-lowest p-md md:p-xl rounded-xl border border-outline-variant/30 custom-shadow-l1 space-y-md">
          <h3 className="font-headline-md text-lg font-bold text-primary border-b border-outline-variant/20 pb-xs">
            Profile Details
          </h3>

          {successMsg && (
            <div className="p-sm bg-secondary-container text-on-secondary-container border border-secondary/20 rounded-lg font-semibold text-body-md">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-sm bg-error-container text-on-error-container border border-error/20 rounded-lg font-semibold text-body-md">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
            
            {/* Full Name */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Full Name</label>
              <input
                type="text"
                className={`w-full h-12 px-md border rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary ${
                  errors.fullName ? 'border-error' : 'border-outline-variant'
                }`}
                {...register('fullName', { required: 'Full name is required.' })}
              />
              {errors.fullName && <p className="text-error text-xs font-semibold">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Email Address</label>
              <input
                type="email"
                className={`w-full h-12 px-md border rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary ${
                  errors.email ? 'border-error' : 'border-outline-variant'
                }`}
                {...register('email', {
                  required: 'Email is required.',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: 'Please enter a valid email address.'
                  }
                })}
              />
              {errors.email && <p className="text-error text-xs font-semibold">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block font-medium">Phone Number</label>
              <input
                type="tel"
                className={`w-full h-12 px-md border rounded-lg font-body-md focus:border-primary outline-none focus:ring-1 focus:ring-primary ${
                  errors.phoneNumber ? 'border-error' : 'border-outline-variant'
                }`}
                {...register('phoneNumber', { required: 'Phone number is required.' })}
              />
              {errors.phoneNumber && <p className="text-error text-xs font-semibold">{errors.phoneNumber.message}</p>}
            </div>

            {/* Role indicator (Read-only) */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block font-medium">User Role</label>
              <input
                type="text"
                disabled
                className="w-full h-12 px-md border border-outline-variant bg-surface-container-low rounded-lg font-body-md text-outline cursor-not-allowed capitalize font-bold"
                value={user?.role || 'user'}
              />
              <p className="text-[10px] text-outline font-semibold">Your role is set by the system administrator.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:opacity-95 active:scale-[0.98] transition-all font-semibold flex items-center justify-center gap-xs"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Save Changes
                </>
              )}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
};

export default MyProfile;
