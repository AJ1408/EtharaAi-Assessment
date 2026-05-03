export const priorityConfig = {
  low: { label: 'Low', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  urgent: { label: 'Urgent', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

export const statusConfig = {
  todo: { label: 'To Do', color: 'bg-slate-500/20 text-slate-300', dot: 'bg-slate-400' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-300', dot: 'bg-blue-400' },
  review: { label: 'Review', color: 'bg-yellow-500/20 text-yellow-300', dot: 'bg-yellow-400' },
  done: { label: 'Done', color: 'bg-green-500/20 text-green-300', dot: 'bg-green-400' },
};

export const projectStatusConfig = {
  active: { label: 'Active', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  'on-hold': { label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  completed: { label: 'Completed', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  archived: { label: 'Archived', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
};

export const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.medium;
  return (
    <span className={`badge border ${config.color}`}>
      {config.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.todo;
  return (
    <span className={`badge ${config.color} flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const RoleBadge = ({ role }) => (
  <span className={`badge border ${role === 'admin' ? 'bg-primary-500/20 text-primary-300 border-primary-500/30' : 'bg-dark-700 text-dark-300 border-dark-600'}`}>
    {role === 'admin' ? '★ Admin' : 'Member'}
  </span>
);

export const Avatar = ({ name, avatar, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const initials = name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;

  if (avatar) {
    return <img src={avatar} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`${sizes[size]} ${colors[colorIdx]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
};
