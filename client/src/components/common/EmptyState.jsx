import React from 'react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No items found',
  message = 'Try adjusting your search query or filter parameters.',
  icon: Icon = SearchX,
  actionLabel,
  actionLink,
  onActionClick,
  className = '',
}) {
  return (
    <GlassCard className={`text-center py-16 px-6 space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-full bg-[#03B3C3]/10 text-[#03B3C3] border border-[#03B3C3]/20 flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-black text-white">{title}</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">{message}</p>
      </div>

      {(actionLabel && (actionLink || onActionClick)) && (
        <div className="pt-2">
          {actionLink ? (
            <Link to={actionLink}>
              <GlassButton variant="gradient" size="sm">
                {actionLabel}
              </GlassButton>
            </Link>
          ) : (
            <GlassButton variant="gradient" size="sm" onClick={onActionClick}>
              {actionLabel}
            </GlassButton>
          )}
        </div>
      )}
    </GlassCard>
  );
}
