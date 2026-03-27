'use client';

import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    referralCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });
  const router = useRouter();

  // TikTok Pixel initialization check
  useEffect(() => {
    // Ensure TikTok pixel is loaded
    if (typeof window !== 'undefined' && !window.ttq) {
      console.warn('TikTok pixel not loaded');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      return setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields',
      });
    }

    const phoneNormalized = formData.phone.trim();
    const phoneRegex = /^\+?\d{7,15}$/;
    if (!phoneRegex.test(phoneNormalized)) {
      return setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid phone number.',
      });
    }

    if (formData.password.length < 6) {
      return setModal({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Password must be at least 6 characters.',
      });
    }

    const username = formData.username.trim();
    const lowerUsername = username.toLowerCase();
    const emailLikePattern = /[@.]/;

    if (emailLikePattern.test(lowerUsername)) {
      return setModal({
        isOpen: true,
        type: 'error',
        title: 'Invalid Username',
        message: "Username cannot contain '@' or '.'.",
      });
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: phoneNormalized,
          referralCode: formData.referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // ✅ Track TikTok CompleteRegistration event ONLY on successful signup
      if (data.success === true && typeof window !== 'undefined' && window.ttq) {
        try {
          window.ttq.track('CompleteRegistration', {
            content_name: 'user_registration',
            content_type: 'registration',
            value: 0,
            currency: 'NGN',
          });
          console.log('✅ TikTok CompleteRegistration event tracked');
        } catch (trackError) {
          console.error('TikTok tracking error:', trackError);
        }
      }

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Registration Successful!',
        message: 'Your account has been created.',
      });

      setFormData({
        username: '',
        email: '',
        password: '',
        phone: '',
        referralCode: '',
      });

      setTimeout(() => {
        router.push('/dashboard'); // Direct to dashboard since session is created
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
              Register
            </h1>
            <p className="text-gray-600 text-base lg:text-lg">
              Create an account and unlock a vast selection of premium social
              media accounts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <User className="w-5 h-5" />
              </div>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-12 h-14 bg-gray-50 border border-gray-200 focus:border-primary rounded-xl"
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-12 h-14 bg-gray-50 border border-gray-200 focus:border-primary rounded-xl"
              />
            </div>

            {/* Phone */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Phone className="w-5 h-5" />
              </div>
              <Input
                type="tel"
                name="phone"
                placeholder="Phone (e.g. 08012345678)"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-12 h-14 bg-gray-50 border border-gray-200 focus:border-primary rounded-xl"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-12 pr-12 h-14 bg-gray-50 border border-gray-200 focus:border-primary rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Referral Code */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <User className="w-5 h-5" />
              </div>
              <Input
                type="text"
                name="referralCode"
                placeholder="Referral Code (optional)"
                value={formData.referralCode}
                onChange={handleInputChange}
                disabled={isLoading}
                className="pl-12 h-14 bg-gray-50 border border-gray-200 focus:border-primary rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg font-semibold mt-6"
            >
              {isLoading ? 'REGISTERING...' : 'REGISTER →'}
            </Button>
          </form>

          <p className="text-center mt-8 text-base text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <img
          src="/happy-person-using-social-media-on-phone-with-colo.jpg"
          alt="Happy person using social media"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8">
            <h2 className="text-4xl font-bold mb-4">Join Thousands of Users</h2>
            <p className="text-xl text-white/90">
              Access premium social media accounts instantly
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Modal */}
      <Modal isOpen={modal.isOpen} onClose={closeModal} title={modal.title}>
        <div className="text-center">
          <div className="mb-4">
            {modal.type === 'success' ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>
          <p className="text-gray-600 mb-6">{modal.message}</p>
          <Button onClick={closeModal} className="w-full">
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}