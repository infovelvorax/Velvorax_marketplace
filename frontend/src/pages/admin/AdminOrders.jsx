import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../services/api/order.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import { formatListingPrice } from '../../utils/formatters';

export function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Admin Orders] Fetching orders...', { status: statusFilter });
        }

        const response = await orderService.getAdminOrders({
          status: statusFilter
        });

        if (cancelled) return;

        let list = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (Array.isArray(response?.data)) {
          list = response.data;
        } else if (Array.isArray(response?.orders)) {
          list = response.orders;
        }

        setOrders(list);
        if (response?.stats) {
          setStats(response.stats);
        }
      } catch (err) {
        if (cancelled) return;

        let errorMsg = 'Unable to load orders. Please try again.';
        const statusCode = err?.response?.status || err?.status;
        if (statusCode === 401) {
          errorMsg = 'Your admin session has expired. Please sign in again.';
        } else if (statusCode === 403) {
          errorMsg = 'You do not have permission to access this area.';
        } else if (err?.message && !err.message.includes('aborted')) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        showToast('error', errorMsg);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [statusFilter, refreshTrigger, showToast]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">Processing</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Shipped</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-black uppercase rounded-md bg-zinc-500/10 text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/dashboard" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              &larr; Admin Dashboard
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-purple-400">Marketplace Transactions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Marketplace Orders & Purchases
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Complete transaction ledger connecting buyers, products, and sellers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs">
          <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Total Orders Logged</span>
          <div className="text-3xl font-black text-[var(--text-primary)] mt-1">{stats.totalOrders}</div>
        </div>
        <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs">
          <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Gross Transaction Value</span>
          <div className="text-3xl font-black text-emerald-400 mt-1">{formatListingPrice(stats.totalRevenue, 'INR')}</div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)] w-fit">
        {['ALL', 'COMPLETED', 'PROCESSING', 'SHIPPED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === tab
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl space-y-3">
          <div className="text-4xl">💳</div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No Orders Found</h3>
          <p className="text-xs text-[var(--text-secondary)]">No marketplace purchase records match your filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-xs">
          <table className="w-full text-left text-xs text-[var(--text-primary)] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-6">Order ID & Date</th>
                <th className="py-3.5 px-4">Item / Product</th>
                <th className="py-3.5 px-4">Buyer</th>
                <th className="py-3.5 px-4">Sold By</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-sm text-[var(--text-primary)]">#{order.orderNumber}</span>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-[var(--text-primary)] max-w-xs truncate">
                    {order.listingId?.title || 'Marketplace Item'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-[var(--text-primary)]">{order.buyerId?.name || 'Buyer'}</div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">{order.buyerId?.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-emerald-400">{order.sellerId?.name || 'Seller'}</div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">{order.sellerId?.email}</div>
                  </td>
                  <td className="py-4 px-4 font-black text-sm text-[var(--text-primary)]">
                    {formatListingPrice(order.amount, order.currency || 'INR')}
                  </td>
                  <td className="py-4 px-4">
                    {getOrderStatusBadge(order.orderStatus)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg font-bold text-xs text-[var(--text-secondary)] transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs font-black uppercase text-purple-400">Order Inspection</span>
                <h3 className="text-xl font-black text-[var(--text-primary)]">#{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Product Purchased</span>
                <p className="font-bold text-sm text-[var(--text-primary)]">{selectedOrder.listingId?.title}</p>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <span className="font-bold text-[var(--text-secondary)]">Total Amount:</span>
                  <span className="font-black text-sm text-emerald-400">
                    {formatListingPrice(selectedOrder.amount, selectedOrder.currency || 'INR')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Buyer</span>
                  <p className="font-bold text-[var(--text-primary)]">{selectedOrder.buyerId?.name}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{selectedOrder.buyerId?.email}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{selectedOrder.buyerId?.phone}</p>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Seller</span>
                  <p className="font-bold text-emerald-400">{selectedOrder.sellerId?.name}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{selectedOrder.sellerId?.email}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{selectedOrder.sellerId?.phone}</p>
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div className="p-3 bg-[var(--bg-secondary)] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Delivery / Contact Address</span>
                  <p className="font-semibold text-[var(--text-primary)]">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-[var(--text-secondary)]">
                    {[selectedOrder.shippingAddress.address, selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.region, selectedOrder.shippingAddress.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-xs font-bold rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
