import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getPerformanceCycles, 
  getPerformanceGoals, 
  createPerformanceCycle, 
  createPerformanceGoal, 
  updatePerformanceGoal,
  getPerformanceReviews, 
  createPerformanceReview, 
  updatePerformanceReview,
  type PerformanceCycle, 
  type PerformanceGoal, 
  type PerformanceReview,
  type CreateCycleRequest,
  type CreateGoalRequest,
  type CreateReviewRequest
} from '../api/performanceApi';
import { useIsAdmin } from '../store/useAuthStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/useAuthStore';
import Button from './Button';
import Input from './Input';
import StatusBadge from './StatusBadge';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';
import { StandardLayout } from './StandardLayout';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Calendar, 
  Users, 
  TrendingUp,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react';

const PerformanceGoals: React.FC = () => {
  const isAdmin = useIsAdmin();
  const { user } = useAuthStore();
  const { employees } = useEmployeeStore();
  const { addNotification } = useNotificationStore();
  const [activeTab, setActiveTab] = useState('my-goals');
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);

  // Form states
  const [cycleForm, setCycleForm] = useState<CreateCycleRequest>({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const [goalForm, setGoalForm] = useState<CreateGoalRequest>({
    cycleId: 0,
    employeeId: 0,
    title: '',
    description: '',
    targetDate: ''
  });

  const [reviewForm, setReviewForm] = useState<CreateReviewRequest>({
    cycleId: 0,
    goalId: 0,
    employeeId: 0,
    type: 'Self',
    rating: 3,
    comments: ''
  });

  // Fetch data on component mount and when tab changes
  useEffect(() => {
    fetchCycles();
    fetchData();
  }, [activeTab]);

  const fetchCycles = async () => {
    try {
      const response = await getPerformanceCycles();
      setCycles(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch cycles:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'my-goals' || activeTab === 'all-goals') {
        const params = activeTab === 'my-goals' ? { employeeId: user?.id } : {};
        const goalsResponse = await getPerformanceGoals(params);
        setGoals(goalsResponse.data || []);
      }

      if (activeTab === 'reviews') {
        const reviewsResponse = await getPerformanceReviews();
        setReviews(reviewsResponse.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await createPerformanceCycle(cycleForm);
      setSuccess('Performance cycle created successfully');
      setShowCycleModal(false);
      setCycleForm({ name: '', description: '', startDate: '', endDate: '' });
      fetchCycles();
    } catch (err: any) {
      setError(err.message || 'Failed to create performance cycle');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await createPerformanceGoal(goalForm);
      setSuccess('Performance goal created successfully');
      setShowGoalModal(false);
      setGoalForm({ cycleId: 0, employeeId: 0, title: '', description: '', targetDate: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create performance goal');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingGoal) return;
    
    try {
      setLoading(true);
      await updatePerformanceGoal(editingGoal.id, {
        title: goalForm.title,
        description: goalForm.description,
        targetDate: goalForm.targetDate
      });
      setSuccess('Performance goal updated successfully');
      setShowGoalModal(false);
      setEditingGoal(null);
      setGoalForm({ cycleId: 0, employeeId: 0, title: '', description: '', targetDate: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update performance goal');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await createPerformanceReview(reviewForm);
      setSuccess('Performance review created successfully');
      setShowReviewModal(false);
      setReviewForm({ cycleId: 0, goalId: 0, employeeId: 0, type: 'Self', rating: 3, comments: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create performance review');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGoal = (goal: PerformanceGoal) => {
    setEditingGoal(goal);
    setGoalForm({
      cycleId: goal.cycleId,
      employeeId: goal.employeeId,
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate.split('T')[0]
    });
    setShowGoalModal(true);
  };

  const handleCreateReviewForGoal = (goal: PerformanceGoal) => {
    setReviewForm({
      cycleId: goal.cycleId,
      goalId: goal.id,
      employeeId: goal.employeeId,
      type: 'Self',
      rating: 3,
      comments: ''
    });
    setShowReviewModal(true);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  const getGoalStats = () => {
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'Active').length;
    const completedGoals = goals.filter(g => g.status === 'Completed').length;
    const onHoldGoals = goals.filter(g => g.status === 'On Hold').length;

    return { totalGoals, activeGoals, completedGoals, onHoldGoals };
  };

  const stats = getGoalStats();

  return (
    <PageTransition>
      <StandardLayout 
        title="Performance Management"
        description="Set goals, track progress, and manage performance reviews"
      >
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Goals</p>
                <p className="text-2xl font-bold text-white">{stats.totalGoals}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-400">{stats.activeGoals}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-teal-400">{stats.completedGoals}</p>
              </div>
              <Award className="w-8 h-8 text-teal-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">On Hold</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.onHoldGoals}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('my-goals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-goals'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              My Goals
            </button>
            
            {(isAdmin || activeTab === 'all-goals') && (
              <button
                onClick={() => setActiveTab('all-goals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-goals'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
              All Goals
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Reviews
            </button>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          {isAdmin && (
            <Button
              onClick={() => setShowCycleModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Cycle
            </Button>
          )}
          
          <Button
            onClick={() => setShowGoalModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Goal
          </Button>
        </div>

        {/* Goals List */}
        {(activeTab === 'my-goals' || activeTab === 'all-goals') && (
          <Card className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-3 text-gray-400">Loading goals...</span>
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No goals found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Create your first goal to get started with performance tracking.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Goal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Cycle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Target Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {goals.map((goal) => (
                      <tr key={goal.id} className="hover:bg-slate-700/40 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {goal.title}
                            </div>
                            <div className="text-sm text-gray-400 max-w-xs truncate">
                              {goal.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {goal.employee?.name || 'You'}
                          </div>
                          {goal.employee?.department && (
                            <div className="text-xs text-gray-400">
                              {goal.employee.department}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {goal.cycle?.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(goal.cycle?.startDate || '').toLocaleDateString()} - {new Date(goal.cycle?.endDate || '').toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={goal.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {(goal.employeeId === user?.id || isAdmin) && (
                              <Button
                                onClick={() => handleEditGoal(goal)}
                                size="sm"
                                icon={<Edit className="w-3 h-3" />}
                              >
                                Edit
                              </Button>
                            )}
                            <Button
                              onClick={() => handleCreateReviewForGoal(goal)}
                              size="sm"
                              icon={<Star className="w-3 h-3" />}
                            >
                              Review
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Reviews List */}
        {activeTab === 'reviews' && (
          <Card className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-3 text-gray-400">Loading reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No reviews found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Start reviewing goals to track performance progress.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Goal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Reviewer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-slate-700/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">
                            {review.goal?.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {review.employee?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {review.reviewer?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            review.type === 'Self' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {review.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRatingStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-400">({review.rating}/5)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={review.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Create Cycle Modal */}
        {showCycleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create Performance Cycle</h3>
              
              <form onSubmit={handleCreateCycle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cycle Name *
                  </label>
                  <Input
                    type="text"
                    value={cycleForm.name}
                    onChange={(e) => setCycleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Q1 2024 Performance Review"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={cycleForm.description}
                    onChange={(e) => setCycleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the performance cycle"
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={cycleForm.startDate}
                      onChange={(e) => setCycleForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={cycleForm.endDate}
                      onChange={(e) => setCycleForm(prev => ({ ...prev, endDate: e.target.value }))}
                      min={cycleForm.startDate}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => setShowCycleModal(false)}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                  >
                    Create Cycle
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Create/Edit Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingGoal ? 'Edit Goal' : 'Create Performance Goal'}
              </h3>
              
              <form onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cycle *
                  </label>
                  <select
                    value={goalForm.cycleId}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, cycleId: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                    disabled={!!editingGoal}
                  >
                    <option value="">Select a cycle</option>
                    {cycles.map(cycle => (
                      <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Employee *
                  </label>
                  <select
                    value={goalForm.employeeId}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, employeeId: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                    disabled={!!editingGoal}
                  >
                    <option value="">Select an employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Goal Title *
                  </label>
                  <Input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Improve customer satisfaction score"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the goal and success criteria"
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Date *
                  </label>
                  <Input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowGoalModal(false);
                      setEditingGoal(null);
                      setGoalForm({ cycleId: 0, employeeId: 0, title: '', description: '', targetDate: '' });
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                  >
                    {editingGoal ? 'Update' : 'Create'} Goal
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Create Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create Performance Review</h3>
              
              <form onSubmit={handleCreateReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Review Type *
                  </label>
                  <select
                    value={reviewForm.type}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, type: e.target.value as 'Self' | 'Manager' }))}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="Self">Self Review</option>
                    <option value="Manager">Manager Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= reviewForm.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-400">({reviewForm.rating}/5)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Comments
                  </label>
                  <textarea
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Provide detailed feedback and comments"
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowReviewModal(false);
                      setReviewForm({ cycleId: 0, goalId: 0, employeeId: 0, type: 'Self', rating: 3, comments: '' });
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                  >
                    Submit Review
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </StandardLayout>
    </PageTransition>
  );
};

export default PerformanceGoals;
