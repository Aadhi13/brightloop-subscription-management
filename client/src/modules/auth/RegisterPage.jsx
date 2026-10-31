import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    phone: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password rules validation
  const password = formData.password;
  const checks = {
    length: password.length > 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid = Object.values(checks).every(Boolean);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Please satisfy all password complexity requirements.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-paper py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          Register Customer Account
        </h2>
        <p className="mt-1.5 text-xs text-muted">
          Access your recurring subscriptions, quotations, and invoices
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="rounded-2xl border border-stone bg-surface px-6 py-8 shadow-xs sm:px-10">
          {error && (
            <div className="mb-6 flex items-start space-x-2.5 rounded-lg border border-terracotta/30 bg-terracotta-subtle p-3.5 text-xs text-terracotta">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-charcoal">
                Full Name *
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 pr-3 pl-9 text-sm text-charcoal placeholder-muted focus:border-forest focus:bg-surface focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-charcoal">
                Email Address *
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@company.com"
                  className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 pr-3 pl-9 text-sm text-charcoal placeholder-muted focus:border-forest focus:bg-surface focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Company & Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="companyName" className="block text-xs font-semibold text-charcoal">
                  Company Name (Optional)
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Building className="h-4 w-4" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Ltd"
                    className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 pr-3 pl-9 text-sm text-charcoal placeholder-muted focus:border-forest focus:bg-surface focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-charcoal">
                  Phone (Optional)
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 pr-3 pl-9 text-sm text-charcoal placeholder-muted focus:border-forest focus:bg-surface focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-charcoal">
                Password *
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create secure password"
                  className="block w-full rounded-lg border border-stone bg-paper/50 py-2.5 pr-3 pl-9 text-sm text-charcoal placeholder-muted focus:border-forest focus:bg-surface focus:outline-none transition-colors"
                />
              </div>

              {/* Password complexity checklist */}
              <div className="mt-2.5 rounded-lg border border-stone/60 bg-paper/40 p-3 text-xs">
                <p className="font-semibold text-charcoal mb-1.5">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className={`flex items-center space-x-1.5 ${checks.length ? 'text-forest font-medium' : 'text-muted'}`}>
                    {checks.length ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>&gt; 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${checks.upper ? 'text-forest font-medium' : 'text-muted'}`}>
                    {checks.upper ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${checks.lower ? 'text-forest font-medium' : 'text-muted'}`}>
                    {checks.lower ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${checks.special ? 'text-forest font-medium' : 'text-muted'}`}>
                    {checks.special ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>Special character</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isPasswordValid}
              className="mt-4 flex w-full items-center justify-center space-x-2 rounded-lg bg-forest py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-forest-hover transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Customer Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-forest hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
