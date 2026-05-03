import { useQuery } from 'react-query';
import { getProjects } from '../api';
import { FolderKanban, Plus, Clock, CheckSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { useState } from 'react';
import ProjectForm from '../components/projects/ProjectForm';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery('projects', async () => {
    const res = await getProjects();
    return res.data.data;
  });

  if (isLoading) return <div className="text-white">Loading projects...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-dark-400 text-sm mt-1">Manage and track your team's projects.</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={20} />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map(project => (
          <div key={project._id} className="card group hover:border-primary-500/50 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${project.color}20`, color: project.color }}>
                  <FolderKanban size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold group-hover:text-primary-400 transition-colors">{project.name}</h3>
                  <span className="text-xs text-dark-400 capitalize">{project.status}</span>
                </div>
              </div>
              <div className="flex -space-x-2">
                {project.members.slice(0, 3).map((m, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-dark-900 bg-dark-700 flex items-center justify-center text-xs font-bold text-white z-10" style={{ zIndex: 3 - i }}>
                    {m.user?.name?.charAt(0).toUpperCase()}
                  </div>
                ))}
                {project.members.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-dark-900 bg-dark-800 flex items-center justify-center text-xs font-bold text-dark-300 z-0">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>
            </div>

            <p className="text-dark-300 text-sm mb-6 line-clamp-2">{project.description || 'No description provided.'}</p>

            <div className="grid grid-cols-3 gap-4 border-t border-dark-800 pt-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-dark-400 text-xs mb-1">
                  <CheckSquare size={14} /> Total
                </div>
                <p className="text-white font-semibold">{project.taskCount}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-green-400/80 text-xs mb-1">
                  <CheckSquare size={14} /> Done
                </div>
                <p className="text-white font-semibold">{project.doneCount}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-red-400/80 text-xs mb-1">
                  <AlertCircle size={14} /> Overdue
                </div>
                <p className="text-red-400 font-semibold">{project.overdueCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 text-xs text-dark-400">
                <Clock size={14} />
                {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'No deadline'}
              </div>
              
              {/* Progress bar */}
              <div className="w-1/2 bg-dark-800 rounded-full h-1.5 overflow-hidden flex">
                <div 
                  className="bg-primary-500 h-full rounded-full" 
                  style={{ width: `${project.taskCount ? (project.doneCount / project.taskCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProjectForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

export default Projects;
