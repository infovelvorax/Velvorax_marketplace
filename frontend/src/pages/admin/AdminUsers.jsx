import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api/admin.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';

export function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await adminService.getUsers();
        if (cancelled) return;
        const items = Array.isArray(data) ? data : (data?.data || []);
        setUsers(items);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setUsers([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const handleVerify = async (id, status) => {
    try {
      await adminService.updateUserStatus(id, { verificationStatus: status });
      showToast('success', `Seller status updated to ${status}`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, verificationStatus: status } : u));
    } catch (e) {
      showToast('error', 'Failed to update user');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 text-[var(--text-primary)]">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">Registered Marketplace Users</h1>
          <p className="text-[15px] text-[var(--text-secondary)] mt-1">Manage buyer/seller verification, roles, and profiles.</p>
        </div>
        <Link to="/admin" className="text-[14px] text-[var(--accent)] font-bold hover:underline">&larr; Back to Admin Overview</Link>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center"><Loader size="lg" /></div>
      ) : users.length === 0 ? (
        <div className="p-14 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center shadow-xs">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">No users found</h3>
          <p className="text-[15px] text-[var(--text-secondary)]">No registered buyer or seller accounts found.</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden p-7 sm:p-9 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] text-[var(--text-primary)]">
              <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase tracking-wider text-[12px] font-bold">
                <tr>
                  <th className="py-3.5 px-3">User Name</th>
                  <th className="py-3.5 px-3">Email</th>
                  <th className="py-3.5 px-3">Role</th>
                  <th className="py-3.5 px-3">Verification</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="py-4 px-3 font-bold text-[var(--text-primary)] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold flex items-center justify-center text-xs uppercase border border-[var(--border-primary)]">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-4 px-3 text-[var(--text-secondary)]">{u.email}</td>
                    <td className="py-4 px-3 font-bold text-[var(--accent)]">{u.role}</td>
                    <td className="py-4 px-3">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                        u.verificationStatus === 'VERIFIED' ? 'bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/20' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]'
                      }`}>
                        {u.verificationStatus || 'UNVERIFIED'}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right space-x-2">
                      {u.verificationStatus !== 'VERIFIED' ? (
                        <button
                          onClick={() => handleVerify(u._id, 'VERIFIED')}
                          className="px-4 py-1.5 bg-[var(--success)] hover:opacity-90 text-white rounded-xl text-[12px] font-bold cursor-pointer shadow-xs"
                        >
                          Verify Badge
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(u._id, 'UNVERIFIED')}
                          className="px-4 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-primary)] rounded-xl text-[12px] font-bold cursor-pointer"
                        >
                          Revoke Badge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
