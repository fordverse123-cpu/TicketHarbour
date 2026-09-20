import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SectionHeader({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon,
  actionLabel,
  actionLink,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5 ${className}`}>
      <div className="space-y-1">
        {badge && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#03B3C3]/15 text-[#03B3C3] border border-[#03B3C3]/30 text-[10px] font-black uppercase tracking-wider mb-1">
            {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
            {badge}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#03B3C3] hover:underline shrink-0"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
