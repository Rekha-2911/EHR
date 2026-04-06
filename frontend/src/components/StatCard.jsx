export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const configs = {
    blue:   { bg: 'from-blue-500 to-blue-600',     icon: 'bg-blue-400/30',   text: 'text-blue-100',  glow: 'shadow-blue-500/25'   },
    green:  { bg: 'from-emerald-500 to-emerald-600', icon: 'bg-emerald-400/30', text: 'text-emerald-100', glow: 'shadow-emerald-500/25' },
    purple: { bg: 'from-purple-500 to-purple-600', icon: 'bg-purple-400/30', text: 'text-purple-100', glow: 'shadow-purple-500/25' },
    orange: { bg: 'from-orange-500 to-orange-600', icon: 'bg-orange-400/30', text: 'text-orange-100', glow: 'shadow-orange-500/25' },
    red:    { bg: 'from-rose-500 to-rose-600',     icon: 'bg-rose-400/30',   text: 'text-rose-100',  glow: 'shadow-rose-500/25'   },
    teal:   { bg: 'from-teal-500 to-teal-600',     icon: 'bg-teal-400/30',   text: 'text-teal-100',  glow: 'shadow-teal-500/25'   },
    indigo: { bg: 'from-indigo-500 to-indigo-600', icon: 'bg-indigo-400/30', text: 'text-indigo-100', glow: 'shadow-indigo-500/25' },
  };
  const c = configs[color] || configs.blue;

  return (
    <div className={`bg-gradient-to-br ${c.bg} rounded-2xl p-5 shadow-lg ${c.glow} text-white relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative">
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center mb-4`}>
          <Icon size={22} className="text-white" />
        </div>
        <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
        <p className={`text-sm font-medium mt-1 ${c.text}`}>{title}</p>
        {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs text-white/70">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
