import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/api/job.service';
import { Loader } from '../../components/common/Loader';
import { cn } from '../../utils';

export function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const data = await jobService.getMyApplications();
        setApplications(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-[var(--text-primary)]">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">Job Applications</h1>
        <p className="text-[15px] text-[var(--text-secondary)] mt-1">Track jobs you have applied for and recruiter review statuses.</p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center"><Loader size="lg" /></div>
      ) : applications.length === 0 ? (
        <div className="p-14 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center shadow-xs">
          <div className="text-5xl mb-4">💼</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">No job applications</h3>
          <p className="text-[15px] text-[var(--text-secondary)]">You haven't submitted applications for any job openings yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {applications.map(app => (
            <div key={app._id} className="p-7 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    {app.listingId?.title || 'Job Application'}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold uppercase",
                    app.status === 'SHORTLISTED' ? "bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/30" :
                    app.status === 'REJECTED' ? "bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/30" :
                    "bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent-border)]"
                  )}>
                    {app.status}
                  </span>
                </div>
                <div className="text-[13px] text-[var(--text-secondary)]">
                  <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                  {app.experienceYears && <span> • Experience: {app.experienceYears}</span>}
                </div>
                {app.coverLetter && (
                  <p className="text-[14px] text-[var(--text-secondary)] italic pt-1 line-clamp-2 bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-primary)] mt-2 leading-relaxed">
                    "{app.coverLetter}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyApplications;
