import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Navbar from '../layouts/Navbar';

const Auth = () => {
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm();

  // Watch fields for matching passwords
  const password = watch('password');

  useEffect(() => {
    // If user is already logged in, redirect
    if (user) {
      navigate('/dashboard-redirect');
    }
  }, [user, navigate]);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
    setErrorMsg('');
    setSuccessMsg('');
    reset();
  }, [searchParams, reset]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setSuccessMsg('');
    reset();
  };

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(data.email, data.password);
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => navigate('/dashboard-redirect'), 800);
      } else {
        await signup(
          data.fullName,
          data.email,
          data.phoneNumber,
          data.password,
          data.confirmPassword
        );
        setSuccessMsg('Account created successfully!');
        setTimeout(() => navigate('/dashboard-redirect'), 800);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center relative py-xl mt-20">
        <div className="w-full max-w-container-max mx-auto px-sm md:px-lg flex flex-col md:flex-row min-h-[600px] shadow-lg rounded-xl overflow-hidden bg-surface-container-lowest z-10 border border-outline-variant/30">
          
          {/* Left Side: Visual Content */}
          <div className="hidden md:flex md:w-1/2 relative bg-primary-container overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div
                className="w-full h-full bg-cover bg-center opacity-85"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80')`,
                  filter: 'brightness(0.6)'
                }}
              ></div>
            </div>
            <div className="relative z-10 flex flex-col justify-end p-xl bg-gradient-to-t from-primary-container/90 to-transparent w-full text-left">
              <h2 className="font-headline-lg text-3xl text-on-primary mb-sm font-bold">Experience Undiscovered Elegance</h2>
              <p className="font-body-lg text-body-lg text-primary-fixed-dim max-w-md">
                Join our exclusive community of travelers and access curated experiences in the world's most sought-after destinations.
              </p>
            </div>
          </div>

          {/* Right Side: Auth Form Content */}
          <div className="w-full md:w-1/2 bg-surface p-md md:p-xl flex flex-col justify-center text-left">
            <div className="max-w-md mx-auto w-full">
              
              <header className="mb-md">
                <h1 className="font-headline-lg text-3xl text-on-surface font-bold mb-xs">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {isLogin ? 'Please enter your details to access your account.' : 'Start your journey with Lumina Luxury Hotels today.'}
                </p>
              </header>

              {/* Toast/Error Alert */}
              {errorMsg && (
                <div className="mb-md p-sm bg-error-container text-on-error-container border border-error/20 rounded-lg text-body-md font-medium">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-md p-sm bg-secondary-container text-on-secondary-container border border-secondary/20 rounded-lg text-body-md font-medium">
                  {successMsg}
                </div>
              )}

              <form className="space-y-base" onSubmit={handleSubmit(onSubmit)}>
                {!isLogin && (
                  <>
                    {/* Full Name */}
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md text-on-surface-variant block font-medium" htmlFor="fullName">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="Alexander Dupont"
                        className={`w-full h-12 px-md border bg-surface-container-lowest rounded-lg font-body-md focus:border-primary transition-all outline-none focus:ring-1 focus:ring-primary ${
                          errors.fullName ? 'border-error' : 'border-outline-variant'
                        }`}
                        {...register('fullName', { required: 'Full name is required.' })}
                      />
                      {errors.fullName && <p className="text-error text-xs font-semibold">{errors.fullName.message}</p>}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md text-on-surface-variant block font-medium" htmlFor="phoneNumber">
                        Phone Number
                      </label>
                      <input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className={`w-full h-12 px-md border bg-surface-container-lowest rounded-lg font-body-md focus:border-primary transition-all outline-none focus:ring-1 focus:ring-primary ${
                          errors.phoneNumber ? 'border-error' : 'border-outline-variant'
                        }`}
                        {...register('phoneNumber', {
                          required: 'Phone number is required.',
                          pattern: {
                            value: /^\+?[0-9\s\-()]{7,20}$/,
                            message: 'Please enter a valid phone number.'
                          }
                        })}
                      />
                      {errors.phoneNumber && <p className="text-error text-xs font-semibold">{errors.phoneNumber.message}</p>}
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@luxury.com"
                    className={`w-full h-12 px-md border bg-surface-container-lowest rounded-lg font-body-md focus:border-primary transition-all outline-none focus:ring-1 focus:ring-primary ${
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

                {/* Password */}
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block font-medium" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={`w-full h-12 px-md border bg-surface-container-lowest rounded-lg font-body-md focus:border-primary transition-all outline-none focus:ring-1 focus:ring-primary ${
                      errors.password ? 'border-error' : 'border-outline-variant'
                    }`}
                    {...register('password', {
                      required: 'Password is required.',
                      minLength: { value: 8, message: 'Password must be at least 8 characters long.' }
                    })}
                  />
                  {errors.password && <p className="text-error text-xs font-semibold">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                {!isLogin && (
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block font-medium" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`w-full h-12 px-md border bg-surface-container-lowest rounded-lg font-body-md focus:border-primary transition-all outline-none focus:ring-1 focus:ring-primary ${
                        errors.confirmPassword ? 'border-error' : 'border-outline-variant'
                      }`}
                      {...register('confirmPassword', {
                        required: 'Confirm password is required.',
                        validate: (value) => value === password || 'Passwords do not match.'
                      })}
                    />
                    {errors.confirmPassword && <p className="text-error text-xs font-semibold">{errors.confirmPassword.message}</p>}
                  </div>
                )}

                {/* Buttons */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:opacity-95 active:scale-[0.98] transition-all font-semibold flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : isLogin ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-md text-center">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {isLogin ? "Don't have an account? " : 'Already a member? '}
                  <button onClick={toggleAuthMode} className="text-primary font-bold hover:underline">
                    {isLogin ? 'Register Now' : 'Sign In'}
                  </button>
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
