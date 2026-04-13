import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  employeeApi, 
  type Employee, 
  type CreateEmployeeRequest, 
  type UpdateEmployeeRequest 
} from '../api/employeeApi';
import { useUser } from '../store/useAuthStore';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import Modal from './Modal';
import UserForm from './UserForm';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Key, 
  Shield, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
  Crown,
  User as UserIcon
} from 'lucide-react';

const PermissionManagement = () => {
  console.log('🔍 PermissionManagement: Component rendering');
  const currentUser = useUser();
  console.log('🔍 PermissionManagement: currentUser from useUser:', currentUser);
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  
  // Form states
  const [createFormData, setCreateFormData] = useState<CreateEmployeeRequest & { password: string }>({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    jobTitle: 'Employee',
    department: 'General',
    location: 'Main Office',
    status: 'active'
  });
  
  const [editFormData, setEditFormData] = useState<UpdateEmployeeRequest>({
    name: '',
    email: '',
    role: 'employee',
    status: 'active'
  });
  
  const [passwordFormData, setPasswordFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch users on component mount and when user changes
  useEffect(() => {
    console.log('🔍 PermissionManagement: Component mounted or user changed, calling fetchUsers');
    if (currentUser) {
      if (currentUser.role !== 'admin') {
        setAuthError('Access denied. Admin privileges required.');
        setError('You do not have permission to access this page.');
        return;
      }
      setAuthError(null);
      fetchUsers();
    } else {
      setAuthError('Not authenticated. Please log in again.');
      setError('Please log in to access this page.');
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      console.log('🔍 PermissionManagement: Starting fetchUsers');
      console.log('🔍 Current user:', currentUser);
      setLoading(true);
      setError(null);
      
      console.log('🔍 Calling employeeApi.getEmployees API...');
      const response = await employeeApi.getEmployees();
      console.log('🔍 API Response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', Object.keys(response));
      console.log('🔍 Response.data:', response.data);
      console.log('🔍 Response.data type:', typeof response.data);
      
      if (response && response.data) {
        setUsers(response.data);
        console.log('🔍 Users set successfully:', response.data);
      } else if (response && Array.isArray(response)) {
        // Handle case where API returns array directly
        setUsers(response);
        console.log('🔍 Users set from direct array:', response);
      } else if (response && response.success && response.data) {
        // Handle case where response has success flag
        setUsers(response.data);
        console.log('🔍 Users set from success response:', response.data);
      } else {
        console.warn('🔍 API response missing data:', response);
        setUsers([]);
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('❌ PermissionManagement Error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      let errorMessage = 'Failed to fetch users';
      if (err.message.includes('401')) {
        errorMessage = 'Authentication failed. Please log in again.';
        setAuthError('Authentication required');
      } else if (err.message.includes('403')) {
        errorMessage = 'Access denied. Admin privileges required.';
        setAuthError('Access denied');
      } else if (err.message.includes('CORS')) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message || 'Failed to fetch users';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchUsers();
  };

  const handleCreateUser = async (userData: CreateEmployeeRequest & { password: string }) => {
    if (!userData.name || !userData.email || !userData.password || !userData.jobTitle || !userData.department) {
      toast.error('Please fill all required fields');
      return;
    }

    if (userData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await employeeApi.createEmployee(userData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      setCreateFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'employee',
        jobTitle: 'Employee',
        department: 'General',
        location: 'Main Office',
        status: 'active'
      });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !editFormData.name || !editFormData.email) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await employeeApi.updateEmployee(selectedUser.id, editFormData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !passwordFormData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await employeeApi.updateEmployee(selectedUser.id, { password: passwordFormData.newPassword });
      toast.success('Password reset successfully');
      setShowPasswordModal(false);
      setSelectedUser(null);
      setPasswordFormData({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await employeeApi.deleteEmployee(selectedUser.id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: Employee) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: Employee) => {
    setSelectedUser(user);
    setPasswordFormData({ newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const openDeleteModal = (user: Employee) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'text-yellow-400 bg-yellow-400/10' : 'text-blue-400 bg-blue-400/10';
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10';
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        <span className="ml-3 text-gray-400">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Shield className="w-6 h-6 mr-2 text-teal-400" />
            Permission Management
          </h2>
          <p className="text-gray-400 mt-1">Manage user roles and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="secondary"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(authError || error) && (
        <Card className="p-4 border-l-4 border-red-500 bg-red-500/10">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-red-400 font-medium mb-1">
                {authError ? 'Authentication Error' : 'Error'}
              </h4>
              <p className="text-red-300 text-sm">
                {authError || error}
              </p>
              {authError && (
                <p className="text-red-300 text-xs mt-2">
                  Please try logging out and logging back in as an administrator.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Users List */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Users className="w-5 h-5 mr-2 text-teal-400" />
          <h3 className="text-lg font-semibold text-white">All Users</h3>
          <span className="ml-3 px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded-full">
            {users.length} users
          </span>
        </div>

        {error ? (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{error}</p>
            <Button onClick={fetchUsers} className="mt-3" variant="secondary">
              Try Again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-3">No users found</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create First User
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 w-80">User</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 w-24">Role</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 w-20">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400 w-28">Created</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-400 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">{user.name}</p>
                          <p className="text-gray-400 text-sm flex items-center truncate">
                            <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1">{user.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-gray-300 text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          onClick={() => openEditModal(user)}
                          variant="secondary"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => openPasswordModal(user)}
                          variant="secondary"
                          size="sm"
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            onClick={() => openDeleteModal(user)}
                            variant="secondary"
                            size="sm"
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <UserForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        loading={loading}
        title="Create New User"
      />

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <Input
            label="Name"
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            placeholder="Enter user name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={editFormData.email}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            placeholder="Enter email address"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as 'admin' | 'employee' })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={selectedUser?.id === currentUser?.id}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            {selectedUser?.id === currentUser?.id && (
              <p className="text-xs text-gray-500 mt-1">You cannot change your own role</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Reset Password"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={passwordFormData.newPassword}
            onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
            placeholder="Enter new password (min 6 characters)"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={passwordFormData.confirmPassword}
            onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
            required
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete the user <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
          </p>
          <p className="text-red-400 text-sm">
            This action cannot be undone. The user will lose access to the system immediately.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionManagement;
