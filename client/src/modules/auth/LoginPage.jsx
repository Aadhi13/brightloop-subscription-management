import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@brightloop.io');
    setPassword('Admin@12345!');
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-paper py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          Sign in to Brightloop
        </h2>
        <p className="mt-1.5 text-xs text-muted">
          Verdant Ledger Subscription Management & Billing Console
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 pr-3 pl-9 text-sm text-charcoal placeholder-muted focus:border-forest focus:bg-surface focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-charcoal">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-forest hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 pr-3 pl-9 text-sm text-charcoal placeholder-muted focus:border-forest focus:bg-surface focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center space-x-2 rounded-lg bg-forest py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-forest-hover transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo helper */}
          <div className="mt-6 border-t border-stone pt-4">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Demo Admin shortcut:</span>
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="font-medium text-forest hover:underline cursor-pointer"
              >
                Fill admin credentials
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted">
            New customer?{' '}
            <Link to="/register" className="font-semibold text-forest hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
