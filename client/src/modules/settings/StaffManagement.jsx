import { useState, useEffect } from 'react';
import { getUsers, createStaff, updateUserStatus } from '../../services/api.js';
import { useAuth } from '../auth/useAuth.js';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';

export const StaffManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New staff form state
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await getUsers({ search });
      setUsers(response.data.items);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load user accounts.');
    }
  };

  useEffect(() => {
    let isMounted = true;

    getUsers({ search })
      .then((response) => {
        if (isMounted) {
          setUsers(response.data.items);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load user accounts.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [search]);

  const passwordChecks = {
    length: staffPassword.length > 8,
    upper: /[A-Z]/.test(staffPassword),
    lower: /[a-z]/.test(staffPassword),
    special: /[^A-Za-z0-9]/.test(staffPassword),
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createStaff({ email: staffEmail, password: staffPassword });
      setSuccess(`Staff account created for ${staffEmail}`);
      setStaffEmail('');
      setStaffPassword('');
      setShowModal(false);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create staff account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id && user.isActive) {
      setError('You cannot deactivate your own administrator account.');
      return;
    }

    try {
      await updateUserStatus(user.id, !user.isActive);
      setSuccess(`User ${user.email} ${!user.isActive ? 'activated' : 'deactivated'}.`);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-charcoal sm:text-2xl">
            User & Staff Management
          </h2>
          <p className="mt-1 text-xs text-muted">
            Manage system roles, staff provisioning, and account access permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 rounded-lg bg-forest px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-forest-hover transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Provision New Staff</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start space-x-2.5 rounded-lg border border-terracotta/30 bg-terracotta-subtle p-3.5 text-xs text-terracotta">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start space-x-2.5 rounded-lg border border-forest/30 bg-forest-subtle p-3.5 text-xs text-forest">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-xl border border-stone bg-surface shadow-2xs overflow-hidden">
        {/* Search bar */}
        <div className="border-b border-stone p-4">
          <div className="relative max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user emails..."
              className="block w-full rounded-lg border border-stone bg-paper/50 py-2 pr-3 pl-9 text-xs text-charcoal placeholder-muted focus:border-forest focus:bg-surface focus:outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone bg-paper/60 text-muted uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">User Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin text-forest" />
                    <span className="mt-2 block">Loading users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-paper/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-charcoal">
                        {u.email}
                        {isCurrent && (
                          <span className="ml-2 rounded bg-stone/40 px-1.5 py-0.5 text-[10px] text-muted">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-subtle text-amber border border-amber/30'
                              : u.role === 'staff'
                              ? 'bg-forest-subtle text-forest border border-forest/30'
                              : 'bg-stone-light text-muted border border-stone'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 font-medium ${
                            u.isActive ? 'text-forest' : 'text-terracotta'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.isActive ? 'bg-forest' : 'bg-terracotta'
                            }`}
                          />
                          <span>{u.isActive ? 'Active' : 'Deactivated'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isCurrent ? (
                          <span className="text-[11px] text-muted">Self</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className={`text-[11px] font-semibold underline cursor-pointer ${
                              u.isActive
                                ? 'text-terracotta hover:text-terracotta-hover'
                                : 'text-forest hover:text-forest-hover'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-forest" />
                <h3 className="text-base font-bold text-charcoal">Provision Staff Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-charcoal cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal">
                  Staff Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="staff@brightloop.io"
                  className="mt-1 block w-full rounded-lg border border-stone bg-paper/50 py-2 px-3 text-xs text-charcoal focus:border-forest focus:bg-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Create strong staff password"
                  className="mt-1 block w-full rounded-lg border border-stone bg-paper/50 py-2 px-3 text-xs text-charcoal focus:border-forest focus:bg-surface focus:outline-none"
                />

                <div className="mt-2 rounded-lg border border-stone/60 bg-paper/40 p-2.5 text-[11px]">
                  <div className="grid grid-cols-2 gap-1">
                    <div className={passwordChecks.length ? 'text-forest font-medium' : 'text-muted'}>
                      &gt; 8 characters
                    </div>
                    <div className={passwordChecks.upper ? 'text-forest font-medium' : 'text-muted'}>
                      Uppercase
                    </div>
                    <div className={passwordChecks.lower ? 'text-forest font-medium' : 'text-muted'}>
                      Lowercase
                    </div>
                    <div className={passwordChecks.special ? 'text-forest font-medium' : 'text-muted'}>
                      Special char
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-stone px-3 py-2 text-xs font-medium text-charcoal hover:bg-paper cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid}
                  className="rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
