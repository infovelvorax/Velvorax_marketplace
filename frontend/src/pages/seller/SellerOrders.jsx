import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { orderService } from '../../services/api/order.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import { formatListingPrice } from '../../utils/formatters';

export function SellerOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getSellerSales();
      setOrders(Array.isArray(response) ? response : (response?.data || []));
    } catch (err) {
      showToast('error', err.message || 'Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, { orderStatus: newStatus });
      showToast('success', `Order status updated to ${newStatus}.`);
      fetchOrders();
    } catch (err) {
      showToast('error', err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesStatus;

      const orderNum = (order.orderNumber || '').toLowerCase();
      const title = (order.listingId?.title || '').toLowerCase();
      const buyerName = (order.buyerId?.name || '').toLowerCase();
      const buyerEmail = (order.buyerId?.email || '').toLowerCase();
      const buyerPhone = (order.buyerId?.phone || '').toLowerCase();

      return matchesStatus && (
        orderNum.includes(term) ||
        title.includes(term) ||
        buyerName.includes(term) ||
        buyerEmail.includes(term) ||
        buyerPhone.includes(term)
      );
    });
  }, [orders, statusFilter, searchTerm]);

  // Key KPI metrics calculation
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const totalGross = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const activeFulfillments = orders.filter(o => ['PROCESSING', 'SHIPPED'].includes(o.orderStatus)).length;
    const completedCount = orders.filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED').length;

    return { totalCount, totalGross, activeFulfillments, completedCount };
  }, [orders]);

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-3 py-1 text-[11px] font-black uppercase rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs">✓ Completed</span>;
      case 'PROCESSING':
        return <span className="px-3 py-1 text-[11px] font-black uppercase rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-2xs animate-pulse">⚡ Processing</span>;
      case 'SHIPPED':
        return <span className="px-3 py-1 text-[11px] font-black uppercase rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-2xs">🚚 Shipped</span>;
      case 'DELIVERED':
        return <span className="px-3 py-1 text-[11px] font-black uppercase rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-2xs">📦 Delivered</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 text-[11px] font-black uppercase rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-2xs">✕ Cancelled</span>;
      default:
        return <span className="px-3 py-1 text-[11px] font-black uppercase rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 sm:py-8 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/seller/dashboard" className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              &larr; Seller Workspace
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-purple-400">Sales & Fulfillment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Sales Orders & Customer Fulfillment
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track customer orders, manage dispatch status, and review customer delivery details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs">
          <span className="text-xs text-[var(--text-secondary)] uppercase font-bold tracking-wider">Total Sales Count</span>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1 tracking-tight">
            {metrics.totalCount}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-medium mt-1 block">Total customer orders</span>
        </div>

        <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs">
          <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Gross Sales Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 tracking-tight">
            {formatListingPrice(metrics.totalGross, 'INR')}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-medium mt-1 block">Total sales volume</span>
        </div>

        <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs">
          <span className="text-xs text-blue-400 uppercase font-bold tracking-wider">In Fulfillment</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 tracking-tight">
            {metrics.activeFulfillments}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-medium mt-1 block">Processing or shipped</span>
        </div>

        <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs">
          <span className="text-xs text-purple-400 uppercase font-bold tracking-wider">Fulfilled Orders</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1 tracking-tight">
            {metrics.completedCount}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-medium mt-1 block">Successfully delivered</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
          {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">🔍</span>
          <input
            type="text"
            placeholder="Search by order #, item, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-purple-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader size="lg" />
          <span className="text-xs font-bold text-[var(--text-secondary)]">Loading sales orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 sm:p-16 text-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl space-y-4 shadow-xs">
          <div className="text-5xl">🛍️</div>
          <h3 className="text-lg font-black text-[var(--text-primary)]">
            {searchTerm || statusFilter !== 'ALL' ? 'No Matching Orders' : 'No Orders Received Yet'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try changing your status filter or search keywords.'
              : 'When buyers purchase your products or finalize property transactions, full customer and fulfillment records will appear here.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout (< 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                  <div>
                    <span className="font-mono font-black text-sm text-[var(--text-primary)]">#{order.orderNumber}</span>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                  <div>{getOrderStatusBadge(order.orderStatus)}</div>
                </div>

                {/* Product & Price */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Item</span>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">
                      {order.listingId?.title || 'Marketplace Item'}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Amount</span>
                    <span className="font-black text-base text-emerald-400">
                      {formatListingPrice(order.amount, order.currency || 'INR')}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-[var(--text-primary)] flex items-center justify-between">
                    <span>👤 {order.buyerId?.name || 'Customer'}</span>
                    {order.buyerId?.phone && (
                      <a href={`tel:${order.buyerId.phone}`} className="text-emerald-400 font-bold hover:underline">
                        📞 {order.buyerId.phone}
                      </a>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] font-mono">{order.buyerId?.email}</div>
                </div>

                {/* Status Selector */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">Update Status:</span>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                    className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-hidden cursor-pointer"
                  >
                    <option value="PROCESSING">⚡ Processing</option>
                    <option value="SHIPPED">🚚 Shipped</option>
                    <option value="DELIVERED">📦 Delivered</option>
                    <option value="COMPLETED">✓ Completed</option>
                    <option value="CANCELLED">✕ Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout (>= 768px) */}
          <div className="hidden md:block overflow-x-auto bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-xs">
            <table className="w-full text-left text-xs text-[var(--text-primary)] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Order ID & Date</th>
                  <th className="py-4 px-4">Purchased Item</th>
                  <th className="py-4 px-4">Customer Details</th>
                  <th className="py-4 px-4">Total Amount</th>
                  <th className="py-4 px-4">Fulfillment Status</th>
                  <th className="py-4 px-6 text-right">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono font-black text-sm text-[var(--text-primary)]">#{order.orderNumber}</span>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-[var(--text-primary)] max-w-xs truncate">
                      {order.listingId?.title ? (
                        <Link to={`/listing/${order.listingId._id || order.listingId}`} className="hover:text-purple-400 hover:underline">
                          {order.listingId.title}
                        </Link>
                      ) : (
                        'Marketplace Item'
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[var(--text-primary)]">{order.buyerId?.name || 'Customer'}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">{order.buyerId?.email}</div>
                      {order.buyerId?.phone && (
                        <a href={`tel:${order.buyerId.phone}`} className="text-[11px] text-emerald-400 font-bold hover:underline block mt-0.5">
                          📞 {order.buyerId.phone}
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4 font-black text-sm text-emerald-400">
                      {formatListingPrice(order.amount, order.currency || 'INR')}
                    </td>
                    <td className="py-4 px-4">
                      {getOrderStatusBadge(order.orderStatus)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-hidden cursor-pointer shadow-2xs hover:border-purple-500 transition-colors"
                      >
                        <option value="PROCESSING">⚡ Processing</option>
                        <option value="SHIPPED">🚚 Shipped</option>
                        <option value="DELIVERED">📦 Delivered</option>
                        <option value="COMPLETED">✓ Completed</option>
                        <option value="CANCELLED">✕ Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default SellerOrders;
