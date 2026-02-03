import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <span className="text-4xl">🏨</span>
            <span className="text-2xl font-display font-bold text-secondary-900">
              Hotel Complex
            </span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-secondary-900 text-center mb-2">
            Create Your Account
          </h2>
          <p className="text-secondary-500 text-center mb-8">
            Join us for an unforgettable experience
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'At least 2 characters',
                    },
                  })}
                  className={`input ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'At least 2 characters',
                    },
                  })}
                  className={`input ${errors.lastName ? 'input-error' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone Number (Optional)</label>
              <input
                type="tel"
                {...register('phone')}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Must be at least 8 characters',
                  },
                })}
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              {/* Password Strength */}
              <div className="mt-2 space-y-1">
                <p className="text-xs text-secondary-500">Password must contain:</p>
                <div className="flex gap-4 text-xs">
                  <span className={`${password?.length >= 8 ? 'text-green-600' : 'text-secondary-400'}`}>
                    ✓ 8+ characters
                  </span>
                  <span className={`${/[A-Z]/.test(password) ? 'text-green-600' : 'text-secondary-400'}`}>
                    ✓ Uppercase
                  </span>
                  <span className={`${/[0-9]/.test(password) ? 'text-green-600' : 'text-secondary-400'}`}>
                    ✓ Number
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('terms', {
                  required: 'You must accept the terms',
                })}
                className="w-4 h-4 mt-0.5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-secondary-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-sm -mt-4">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="mt-8 text-center text-secondary-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

