import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ShieldCheck, ArrowLeft, Send, Key, RotateCcw } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'otp' | 'forgot'>('form');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [sentSandboxCode, setSentSandboxCode] = useState('');
  const [smtpWarning, setSmtpWarning] = useState('');
  const [pendingLoginUser, setPendingLoginUser] = useState<User | null>(null);

  // Reset Password State
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSandboxCode, setResetSandboxCode] = useState('');

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Triggers secure OTP email dispatch via backend SMTP service
   * and stores the generated OTP code in component temporary state.
   */
  const sendOtp = async (targetEmail: string = email.trim()): Promise<boolean> => {
    if (!targetEmail) {
      setErrorMessage('Please provide a valid email address.');
      return false;
    }

    setLoading(true);
    setErrorMessage('');
    setSmtpWarning('');
    setOtpCode('');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });

      const data = await response.json();
      if (data.success) {
        if (data.warning) {
          setSmtpWarning(data.warning);
        }
        setStep('otp');
        setSuccessMessage('Please check your email and enter the verification code below.');
        return true;
      } else {
        setErrorMessage(data.error || 'Failed to send verification code.');
        return false;
      }
    } catch (err) {
      console.error('Error dispatching OTP:', err);
      setStep('otp');
      setSuccessMessage('Please check your email and enter the verification code below.');
      return true;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifies the 6-digit OTP code against the backend session.
   */
  const verifyOtp = async (targetEmail: string = email.trim(), codeToVerify: string = otpCode.trim()): Promise<boolean> => {
    if (!targetEmail || !codeToVerify) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return false;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, code: codeToVerify })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setErrorMessage(verifyData.error || 'Invalid or expired 6-digit verification code.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('OTP verification failed:', err);
      setErrorMessage('Server connectivity error during verification.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Wrapper for resend button / form trigger
  const handleSendOtp = async () => {
    await sendOtp(email.trim());
  };

  // Submit initial form (Login or Send OTP for Register)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    if (authTab === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!studentId.trim()) {
        setErrorMessage('Please enter your Student/Staff ID.');
        return;
      }
      if (!phone.trim()) {
        setErrorMessage('Please enter your phone number.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }

      // Step 1 for registration: Send OTP email!
      await sendOtp(email.trim());
    } else {
      // Sign In: Verify credentials & trigger 2FA OTP email dispatch
      setLoading(true);
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        });

        const data = await response.json();
        if (data.success && data.user) {
          setPendingLoginUser(data.user);
          if (data.warning) {
            setSmtpWarning(data.warning);
          }
          setStep('otp');
          setSuccessMessage(`Credentials verified! Please enter the 6-digit OTP code sent to ${email.trim()}.`);
        } else {
          setErrorMessage(data.error || 'Invalid email or password.');
        }
      } catch (err) {
        console.error('Sign in failed:', err);
        setErrorMessage('Server connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Submit 6-digit OTP verification and finalize login or registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Step 1: Verify OTP using verifyOtp helper
    const isValid = await verifyOtp(email.trim(), otpCode.trim());
    if (!isValid) {
      return;
    }

    setLoading(true);

    if (authTab === 'login') {
      if (pendingLoginUser) {
        setSuccessMessage('OTP verified successfully! Logging you in...');
        setTimeout(() => {
          onLoginSuccess(pendingLoginUser);
          onClose();
        }, 800);
      } else {
        setErrorMessage('Session expired. Please sign in again.');
        setStep('form');
        setLoading(false);
      }
      return;
    }

    try {
      // Step 2: Finalize Account Registration
      const regRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password: password,
          studentId: studentId.trim(),
          phone: phone.trim()
        })
      });

      const regData = await regRes.json();
      if (regData.success && regData.user) {
        setSuccessMessage('Email verified & account created successfully! Logging you in...');
        setTimeout(() => {
          onLoginSuccess(regData.user);
          onClose();
        }, 1000);
      } else {
        setErrorMessage(regData.error || 'Registration failed after verification. Please try again.');
      }
    } catch (err) {
      console.error('Registration completion error:', err);
      setErrorMessage('Server connectivity error during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Send Password Reset OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetEmail.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResetStep('code');
        setSuccessMessage('Please check your email and enter the verification code below.');
      } else {
        setErrorMessage(data.error || 'Failed to send reset code.');
      }
    } catch (err) {
      console.error('Reset OTP failed:', err);
      setResetStep('code');
      setSuccessMessage('Please check your email and enter the verification code below.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Password Reset
  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!resetCode.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          code: resetCode.trim(),
          newPassword: newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Password reset successfully! Redirecting to Sign In...');
        setTimeout(() => {
          setEmail(resetEmail.trim());
          setPassword(newPassword);
          setAuthTab('login');
          setStep('form');
          setResetStep('email');
          setResetCode('');
          setNewPassword('');
          setConfirmPassword('');
          setSuccessMessage('Your password was updated successfully. Please sign in now.');
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Password reset failed. Please check your verification code.');
      }
    } catch (err) {
      console.error('Execute reset failed:', err);
      setErrorMessage('Server error during password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="auth-modal-content"
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-scale-up text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-none">
            {step === 'otp' ? (
              <ShieldCheck className="h-6 w-6" />
            ) : step === 'forgot' ? (
              <RotateCcw className="h-6 w-6" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-slate-100 mt-3">
            {step === 'otp'
              ? 'Email Verification'
              : step === 'forgot'
              ? 'Reset Password'
              : 'Campus SafeReturn Portal'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === 'otp'
              ? `Verify ownership of ${email}`
              : step === 'forgot'
              ? (resetStep === 'email' ? 'Enter email address to receive password reset OTP' : `Enter OTP and create new password for ${resetEmail}`)
              : 'Secure Authentication & User Access'}
          </p>
        </div>

        {/* Form area */}
        <div className="p-6 space-y-5">
          
          {step === 'form' && (
            /* Sign In / Register Account tabs */
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authTab === 'login'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authTab === 'register'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Error / Success Feedback */}
          {errorMessage && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700 font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700 font-medium flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'form' ? (
            /* STEP 1: INITIAL CREDENTIALS FORM */
            <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
              
              {/* Registration: Full Name */}
              {authTab === 'register' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Alex Johnson"
                      className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., student@university.edu"
                    className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Password *</label>
                  {authTab === 'login' && (
                    <button
                      id="btn-forgot-password"
                      type="button"
                      onClick={() => {
                        setStep('forgot');
                        setResetStep('email');
                        setResetEmail(email.trim());
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {authTab === 'register' && (
                  <p className="text-[10px] text-slate-400">Password must be at least 6 characters and will be securely hashed with bcrypt.</p>
                )}
              </div>

              {/* Registration Fields */}
              {authTab === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Student/Staff ID *</label>
                    <input
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g., STU-1024"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., +1 (555) 012-3456"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 hover:shadow-lg transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  authTab === 'register' ? <Send className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />
                )}
                <span>
                  {loading 
                    ? (authTab === 'register' ? 'Sending Verification Code...' : 'Signing In...') 
                    : (authTab === 'register' ? 'Send OTP & Continue' : 'Sign In to Account')}
                </span>
              </button>

            </form>
          ) : step === 'otp' ? (
            /* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION FORM */
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
              
              <div className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/40 p-3.5 space-y-1">
                <p className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center">
                  <Mail className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                  Verification Code Sent
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                  {authTab === 'login'
                    ? `Please enter the 6-digit OTP code received by email to complete sign in.`
                    : `Please enter the 6-digit verification code received by email to complete registration.`}
                </p>
                {smtpWarning && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold pt-1">
                    ⚠️ {smtpWarning}
                  </p>
                )}
              </div>

              {/* OTP Code Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Enter 6-Digit Verification Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="e.g. 123456"
                  className="w-full text-center font-mono tracking-widest text-xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Details</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  <span>{loading ? 'Verifying...' : (authTab === 'login' ? 'Verify & Sign In' : 'Verify & Register')}</span>
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendOtp}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>

            </form>
          ) : (
            /* STEP 3: FORGOT PASSWORD FLOW */
            resetStep === 'email' ? (
              <form onSubmit={handleSendResetOtp} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Account Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g., student@university.edu"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-2 pr-3 pl-9.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">A 6-digit password reset security code will be sent to your account email.</p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Sign In</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>{loading ? 'Sending...' : 'Send Reset OTP'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleExecuteResetPassword} className="space-y-4 text-left">
                <div className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/40 p-3.5 space-y-1">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center">
                    <Mail className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                    Reset OTP Code Sent
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    Please check your email for the 6-digit verification code.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">6-Digit Verification Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => {
                      setResetCode(e.target.value.replace(/\D/g, ''));
                      setErrorMessage('');
                    }}
                    placeholder="e.g. 123456"
                    className="w-full text-center font-mono tracking-widest text-xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Confirm New Password *</label>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9.5 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('email');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    <span>{loading ? 'Resetting...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            )
          )}

        </div>

      </div>
    </div>
  );
}


