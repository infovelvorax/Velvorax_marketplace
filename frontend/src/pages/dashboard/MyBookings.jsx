import React, { useState, useEffect } from 'react';
import { serviceMarketplaceService } from '../../services/api/service.service';
import { Loader } from '../../components/common/Loader';
import { cn } from '../../utils';

export function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await serviceMarketplaceService.getMyBookings();
        setBookings(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-[var(--text-primary)]">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">Service Bookings</h1>
        <p className="text-[15px] text-[var(--text-secondary)] mt-1">Track requested appointments, schedules, and service status.</p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center"><Loader size="lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="p-14 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center shadow-xs">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">No service bookings</h3>
          <p className="text-[15px] text-[var(--text-secondary)]">You haven't booked any home repairs, cleaning, or expert services yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map(b => (
            <div key={b._id} className="p-7 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    {b.serviceListingId?.title || 'Service Appointment'}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold uppercase",
                    b.status === 'CONFIRMED' ? "bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/30" :
                    b.status === 'COMPLETED' ? "bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent-border)]" :
                    b.status === 'CANCELLED' ? "bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/30" :
                    "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]"
                  )}>
                    {b.status}
                  </span>
                </div>
                <div className="text-[13px] text-[var(--text-secondary)] space-x-3">
                  <span>📅 Scheduled: {b.bookingDate} ({b.timeSlot})</span>
                  <span>📍 Address: {b.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
