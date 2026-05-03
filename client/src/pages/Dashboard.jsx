import { useQuery } from 'react-query';
import { getDashboardStats } from '../api';
import { CheckCircle2, Clock, AlertCircle, LayoutDashboard, Briefcase, Users } from 'lucide-react';
import { StatusBadge, Avatar } from '../components/shared/Badges';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="stat-card flex items-center gap-4">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-dark-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  
  const { data, isLoading, error } = useQuery('dashboardStats', async () => {
    const res = await getDashboardStats();
    return res.data.data;
  });

  if (isLoading) return <div className="text-white">Loading dashboard...</div>;
  if (error) return <div className="text-red-400">Error loading dashboard</div>;

  const stats = data.tasks;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
        <p className="text-dark-400">Here's what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={stats.total} icon={LayoutDashboard} colorClass="bg-primary-500/20 text-primary-400" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} colorClass="bg-blue-500/20 text-blue-400" />
        <StatCard title="Completed" value={stats.done} icon={CheckCircle2} colorClass="bg-green-500/20 text-green-400" />
        <StatCard title="Overdue" value={stats.overdue} icon={AlertCircle} colorClass="bg-red-500/20 text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">My Tasks</h2>
            {data.myTasks.length === 0 ? (
              <p className="text-dark-400 text-sm py-4">No active tasks assigned to you.</p>
            ) : (
              <div className="space-y-3">
                {data.myTasks.map(task => (
                  <div key={task._id} className="p-4 rounded-lg bg-dark-800/50 border border-dark-700 flex items-center justify-between hover:border-dark-600 transition-colors">
                    <div>
                      <h4 className="text-white font-medium mb-1">{task.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-dark-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project.color }} />
                          {task.project.name}
                        </span>
                        {task.dueDate && <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Project Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-dark-800/50">
                <div className="flex items-center gap-3">
                  <Briefcase className="text-primary-400" size={20} />
                  <span className="text-dark-200">Active Projects</span>
                </div>
                <span className="text-white font-bold">{data.projects.active}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-dark-800/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-400" size={20} />
                  <span className="text-dark-200">Completed Projects</span>
                </div>
                <span className="text-white font-bold">{data.projects.completed}</span>
              </div>
              {isAdmin && (
                <div className="flex justify-between items-center p-3 rounded-lg bg-dark-800/50">
                  <div className="flex items-center gap-3">
                    <Users className="text-violet-400" size={20} />
                    <span className="text-dark-200">Total Users</span>
                  </div>
                  <span className="text-white font-bold">{data.userCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
