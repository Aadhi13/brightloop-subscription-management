import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../services/api.js';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  KeyRound,
} from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [email, setEmail] = useState('');
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [devToken, setDevToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const isResetMode = Boolean(tokenFromUrl || token);

  const checks = {
    length: newPassword.length > 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const isPasswordValid = Object.values(checks).every(Boolean);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
      if (response.data?.devToken) {
        setDevToken(response.data.devToken);
      }
    } catch (err) {
      setError(err.message || 'Unable to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Please satisfy all password complexity requirements.');
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await resetPassword({ token, newPassword });
      setMessage(response.message);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Password reset failed. Token may be invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-paper py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
          {isResetMode ? <KeyRound className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {isResetMode ? 'Set New Password' : 'Reset Your Password'}
        </h2>
        <p className="mt-1.5 text-xs text-muted">
          {isResetMode
            ? 'Enter your single-use reset token and choose a secure password'
            : 'Enter your registered email address to receive reset instructions'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-stone bg-surface px-6 py-8 shadow-xs sm:px-10">
          {error && (
            <div className="mb-6 flex items-start space-x-2.5 rounded-lg border border-terracotta/30 bg-terracotta-subtle p-3.5 text-xs text-terracotta">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-6 flex items-start space-x-2.5 rounded-lg border border-forest/30 bg-forest-subtle p-3.5 text-xs text-forest font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Development token helper box */}
          {devToken && (
            <div className="mb-6 rounded-lg border border-amber/40 bg-amber-subtle p-3.5 text-xs text-charcoal">
              <div className="font-semibold text-amber">Development Reset Token:</div>
              <code className="mt-1 block break-all font-mono text-[11px] bg-paper p-1.5 rounded border border-stone">
                {devToken}
              </code>
              <button
                type="button"
                onClick={() => setToken(devToken)}
                className="mt-2 text-xs font-semibold text-forest underline cursor-pointer"
              >
                Use this token to set new password &rarr;
              </button>
            </div>
          )}

          {isResetMode ? (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-xs font-semibold text-charcoal">
                  Reset Token
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="token"
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste 64-char hex token"
                    className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 px-3 text-xs font-mono text-charcoal focus:border-forest focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-charcoal">
                  New Password
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New secure password"
                    className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 pr-3 pl-9 text-sm text-charcoal focus:border-forest focus:bg-surface focus:outline-none"
                  />
                </div>

                <div className="mt-2.5 rounded-lg border border-stone/60 bg-paper/40 p-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-1">
                    <div className={checks.length ? 'text-forest font-medium' : 'text-muted'}>
                      &gt; 8 characters
                    </div>
                    <div className={checks.upper ? 'text-forest font-medium' : 'text-muted'}>
                      Uppercase
                    </div>
                    <div className={checks.lower ? 'text-forest font-medium' : 'text-muted'}>
                      Lowercase
                    </div>
                    <div className={checks.special ? 'text-forest font-medium' : 'text-muted'}>
                      Special char
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid}
                className="mt-2 flex w-full items-center justify-center space-x-2 rounded-lg bg-forest py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-forest-hover transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Password Reset</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-charcoal">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="registered@company.com"
                    className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 pr-3 pl-9 text-sm text-charcoal placeholder-muted focus:border-forest focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center space-x-2 rounded-lg bg-forest py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-forest-hover transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Sending Instructions...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-muted">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-forest hover:underline">
              Return to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
