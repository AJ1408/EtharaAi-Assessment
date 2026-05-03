import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getUsers, updateUserRole, deleteUser } from '../api';
import { Shield, User, Trash2, Mail, Calendar, AlertCircle } from 'lucide-react';
import { Avatar, RoleBadge } from '../components/shared/Badges';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminPanel = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery('adminUsers', async () => {
    const res = await getUsers();
    return res.data.data;
  });

  const updateRoleMutation = useMutation(
    ({ id, role }) => updateUserRole(id, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User role updated');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to update role')
    }
  );

  const deleteUserMutation = useMutation(
    (id) => deleteUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        queryClient.invalidateQueries('dashboardStats');
        toast.success('User deleted');
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  );

  const handleRoleChange = (id, currentRole, newRole) => {
    if (currentRole === newRole) return;
    updateRoleMutation.mutate({ id, role: newRole });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="text-white">Loading users...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="text-dark-400 text-sm mt-1">Manage users, roles, and access controls.</p>
        </div>
        <div className="flex items-center gap-2 bg-dark-800/50 px-4 py-2 rounded-lg border border-dark-700">
          <Shield className="text-primary-400" size={20} />
          <span className="text-white font-medium">Admin View</span>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900/50 border-b border-dark-800 text-dark-400 text-sm">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {users?.map(user => (
                <tr key={user._id} className="hover:bg-dark-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} avatar={user.avatar} size="sm" />
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-dark-300">
                      <Mail size={14} className="text-dark-500" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-dark-300">
                      <Calendar size={14} className="text-dark-500" />
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, user.role, e.target.value)}
                      disabled={updateRoleMutation.isLoading}
                      className="bg-dark-800 border border-dark-700 text-sm rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(user._id)}
                      disabled={deleteUserMutation.isLoading}
                      className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
