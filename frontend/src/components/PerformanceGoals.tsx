import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getPerformanceCycles, 
  getPerformanceGoals, 
  createPerformanceCycle, 
  deletePerformanceCycle,
  createPerformanceGoal, 
  updatePerformanceGoal,
  getPerformanceReviews, 
  createPerformanceReview,
  type PerformanceCycle, 
  type PerformanceGoal, 
  type PerformanceReview,
  type CreateCycleRequest,
  type CreateGoalRequest,
  type CreateReviewRequest
} from '../api/performanceApi';
import { kraApi } from '../api/kraApi';
import type { KRA } from '../api/kraApi';
import { useIsAdmin } from '../store/useAuthStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useAuthStore } from '../store/useAuthStore';
import { useModalWithUnsavedChanges } from '../hooks/useModalWithUnsavedChanges';
import Button from './Button';
import Input from './Input';
import StatusBadge from './StatusBadge';
import Card from './Card';
import UnifiedDropdown from './UnifiedDropdown';
import { PageTransition } from './PageTransition';
import { StandardLayout } from './StandardLayout';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Calendar, 
  TrendingUp,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react';

const PerformanceGoals: React.FC = () => {
  const isAdmin = useIsAdmin();
  const { user } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  
  // Initialize activeTab from localStorage, default to 'my-goals'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('performance-active-tab') || 'my-goals';
    }
    return 'my-goals';
  });

  // Persist activeTab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('performance-active-tab', activeTab);
    }
  }, [activeTab]);
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
  const [showKraFormModal, setShowKraFormModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);
  const [selectedGoalForKra, setSelectedGoalForKra] = useState<PerformanceGoal | null>(null);
  const [kras, setKras] = useState<KRA[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);

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

  const [kraForm, setKraForm] = useState({
    title: '',
    description: '',
    targetValue: '',
    weightage: 1.0,
    dueDate: ''
  });
  
  // Filtered employees based on user role
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);

  // Detect unsaved changes in cycle form
  const isCycleFormChanged = () => {
    return (
      cycleForm.name.trim() !== '' ||
      (cycleForm.description && cycleForm.description.trim() !== '') ||
      cycleForm.startDate.trim() !== ''
    );
  };

  // Detect unsaved changes in goal form
  const isGoalFormChanged = () => {
    return (
      goalForm.title.trim() !== '' ||
      (goalForm.description && goalForm.description.trim() !== '') ||
      goalForm.targetDate.trim() !== ''
    );
  };

  // Detect unsaved changes in review form
  const isReviewFormChanged = () => {
    return (
      (reviewForm.comments && reviewForm.comments.trim() !== '') ||
      reviewForm.rating !== 3
    );
  };

  // Detect unsaved changes in KRA form
  const isKraFormChanged = () => {
    return (
      kraForm.title.trim() !== '' ||
      kraForm.description.trim() !== '' ||
      kraForm.targetValue.trim() !== ''
    );
  };

  // Modal close handlers with unsaved changes warning
  const { handleClose: handleCloseCycleModal } = useModalWithUnsavedChanges({
    isOpen: showCycleModal,
    onClose: () => {
      setShowCycleModal(false);
      setCycleForm({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
      });
    },
    hasUnsavedChanges: isCycleFormChanged()
  });

  const { handleClose: handleCloseGoalModal } = useModalWithUnsavedChanges({
    isOpen: showGoalModal,
    onClose: () => {
      setShowGoalModal(false);
      setEditingGoal(null);
      setGoalForm({
        cycleId: 0,
        employeeId: 0,
        title: '',
        description: '',
        targetDate: ''
      });
    },
    hasUnsavedChanges: isGoalFormChanged()
  });

  const { handleClose: handleCloseReviewModal } = useModalWithUnsavedChanges({
    isOpen: showReviewModal,
    onClose: () => {
      setShowReviewModal(false);
      setReviewForm({
        cycleId: 0,
        goalId: 0,
        employeeId: 0,
        type: 'Self',
        rating: 3,
        comments: ''
      });
    },
    hasUnsavedChanges: isReviewFormChanged()
  });

  const { handleClose: handleCloseKraModal } = useModalWithUnsavedChanges({
    isOpen: showKraFormModal,
    onClose: () => {
      setShowKraFormModal(false);
      setSelectedGoalForKra(null);
      setKraForm({
        title: '',
        description: '',
        targetValue: '',
        weightage: 1.0,
        dueDate: ''
      });
    },
    hasUnsavedChanges: isKraFormChanged()
  });

  const fetchCycles = async () => {
    try {
      console.log('Fetching cycles...');
      const response = await getPerformanceCycles();
      console.log('Cycles response:', response);
      // response is now the Array(3) directly from getPerformanceCycles()
      setCycles(response || []);
      console.log('Cycles set in state:', response);
    } catch (err: any) {
      console.error('Failed to fetch cycles:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'my-goals' || activeTab === 'all-goals') {
        let params: any = {};
        
        if (activeTab === 'my-goals') {
          // Employees see only their own goals
          params.employeeId = user?.id;
        } else if (activeTab === 'all-goals') {
          // Managers see goals for their team members
          // Admins see all goals
          // Don't filter by employeeId - let backend handle it
        }
        
        const goalsResponse = await getPerformanceGoals(params);
        let filteredGoals = goalsResponse || [];
        
        // Additional filtering on frontend for managers viewing all-goals
        if (activeTab === 'all-goals' && user?.role === 'manager') {
          const teamMemberIds = employees
            .filter(emp => emp.manager?.id === user?.id)
            .map(emp => emp.id);
          filteredGoals = filteredGoals.filter((goal: PerformanceGoal) => teamMemberIds.includes(goal.employeeId));
        }
        
        setGoals(filteredGoals);
      }

      if (activeTab === 'reviews') {
        const reviewsResponse = await getPerformanceReviews();
        setReviews(reviewsResponse || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees on component mount
  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees();
    }
  }, []);

  // Fetch data on component mount and when tab changes
  useEffect(() => {
    fetchCycles();
    fetchData();
  }, [activeTab]);

  // Debug: Track cycles state changes
  useEffect(() => {
    console.log('Cycles state updated:', cycles);
  }, [cycles]);

  // Filter employees based on user role
  useEffect(() => {
    if (isAdmin) {
      // Admins see all employees
      setFilteredEmployees(employees);
    } else if (user?.role === 'manager') {
      // Managers see only their team members (employees who report to them)
      const teamMembers = employees.filter(emp => emp.manager?.id === user?.id);
      setFilteredEmployees(teamMembers);
    } else {
      // Regular employees see only themselves
      setFilteredEmployees(user ? [user] : []);
    }
  }, [employees, user, isAdmin]);

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

  const handleDeleteCycle = async (cycleId: number) => {
    try {
      setLoading(true);
      await deletePerformanceCycle(cycleId);
      toast.success('Performance cycle deleted successfully');
      fetchCycles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete performance cycle');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!goalForm.cycleId || goalForm.cycleId === 0) {
      setError('Please select a cycle');
      return;
    }
    if (!goalForm.employeeId || goalForm.employeeId === 0) {
      setError('Please select an employee');
      return;
    }
    if (!goalForm.title.trim()) {
      setError('Please enter a goal title');
      return;
    }
    if (!goalForm.targetDate) {
      setError('Please select a target date');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
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
    
    // Validate form
    if (!goalForm.title.trim()) {
      setError('Please enter a goal title');
      return;
    }
    if (!goalForm.targetDate) {
      setError('Please select a target date');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
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

  const handleViewKras = async (goal: PerformanceGoal) => {
    try {
      setLoading(true);
      const kraList = await kraApi.getKRAsByGoal(goal.id);
      setKras(kraList || []);
      setSelectedGoalForKra(goal);
      setExpandedGoalId(expandedGoalId === goal.id ? null : goal.id);
    } catch (err: any) {
      toast.error('Failed to fetch KRAs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKraForm = (goal: PerformanceGoal) => {
    setSelectedGoalForKra(goal);
    setKraForm({ title: '', description: '', targetValue: '', weightage: 1.0, dueDate: '' });
    setShowKraFormModal(true);
  };

  const handleCreateKra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForKra) return;

    try {
      setLoading(true);
      await kraApi.createKRA({
        goalId: selectedGoalForKra.id,
        title: kraForm.title,
        description: kraForm.description,
        targetValue: kraForm.targetValue,
        weightage: kraForm.weightage,
        dueDate: kraForm.dueDate
      });
      toast.success('KRA created successfully');
      setKraForm({ title: '', description: '', targetValue: '', weightage: 1.0, dueDate: '' });
      setShowKraFormModal(false);
      await handleViewKras(selectedGoalForKra);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create KRA');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKra = async (kraId: number) => {
    try {
      setLoading(true);
      await kraApi.deleteKRA(kraId);
      toast.success('KRA deleted successfully');
      if (selectedGoalForKra) {
        await handleViewKras(selectedGoalForKra);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete KRA');
    } finally {
      setLoading(false);
    }
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
            
            {(isAdmin || user?.role === 'manager') && (
              <button
                onClick={() => setActiveTab('all-goals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-goals'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
              {isAdmin ? 'All Goals' : 'Team Goals'}
              </button>
            )}
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('cycles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cycles'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
              Cycles
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


        {/* Goals List */}
        {(activeTab === 'my-goals' || activeTab === 'all-goals') && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {activeTab === 'my-goals' ? 'My Goals' : 'All Goals'}
              </h2>
              {activeTab === 'all-goals' && (isAdmin || user?.role === 'manager') && (
                <Button 
                  onClick={() => setShowGoalModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create Goal
                </Button>
              )}
            </div>
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
                      <React.Fragment key={goal.id}>
                        <tr className="hover:bg-slate-700/40 transition-colors">
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
                            <Button
                              onClick={() => handleViewKras(goal)}
                              size="sm"
                              variant={expandedGoalId === goal.id ? 'primary' : 'secondary'}
                            >
                              KRAs
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedGoalId === goal.id && (
                        <tr className="bg-slate-700/20">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-white">Key Result Areas (KRAs)</h4>
                                {(goal.employeeId === user?.id || isAdmin) && (
                                  <Button
                                    onClick={() => handleOpenKraForm(goal)}
                                    size="sm"
                                    icon={<Plus className="w-3 h-3" />}
                                  >
                                    Add KRA
                                  </Button>
                                )}
                              </div>
                              {kras.length === 0 ? (
                                <p className="text-sm text-gray-400">No KRAs added yet</p>
                              ) : (
                                <div className="space-y-2">
                                  {kras.map((kra) => (
                                    <div key={kra.id} className="bg-slate-700/40 p-3 rounded">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-white">{kra.title}</div>
                                          {kra.description && (
                                            <div className="text-xs text-gray-400 mt-1">{kra.description}</div>
                                          )}
                                          <div className="text-xs text-gray-500 mt-2">
                                            Target: {kra.targetValue} | Weight: {kra.weightage * 100}% | Status: {kra.status}
                                          </div>
                                        </div>
                                        <div className="flex space-x-2">
                                          {user?.role === 'manager' && goal.employeeId !== user?.id && (
                                            <Button
                                              size="sm"
                                              variant="secondary"
                                            >
                                              Review
                                            </Button>
                                          )}
                                          {(goal.employeeId === user?.id || isAdmin) && (
                                            <Button
                                              onClick={() => handleDeleteKra(kra.id)}
                                              size="sm"
                                              variant="danger"
                                            >
                                              Delete
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </Card>
          </div>
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

        {/* Cycles Section - Admin Only */}
        {activeTab === 'cycles' && isAdmin && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Performance Cycles</h2>
              <Button 
                onClick={() => setShowCycleModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Cycle
              </Button>
            </div>

            {cycles.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No performance cycles found</p>
                <p className="text-gray-500 text-sm mt-2">Create your first performance cycle to get started</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cycles.map((cycle) => (
                  <Card key={cycle.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">{cycle.name}</h3>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={cycle.status} />
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete cycle "${cycle.name}"? This action cannot be undone.`)) {
                              handleDeleteCycle(cycle.id);
                            }
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete cycle"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                        </button>
                      </div>
                    </div>
                    
                    {cycle.description && (
                      <p className="text-gray-400 text-sm mb-4">{cycle.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        Start: {new Date(cycle.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        End: {new Date(cycle.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between text-sm">
                      <span className="text-gray-400">
                        {cycle.goals?.length || 0} Goals
                      </span>
                      <span className="text-gray-400">
                        {cycle.reviews?.length || 0} Reviews
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
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
                    onClick={handleCloseCycleModal}
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

        {/* Create/Edit Goal Modal - Only for admins and managers */}
        {showGoalModal && (isAdmin || user?.role === 'manager') && (
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
                  <UnifiedDropdown
                    value={goalForm.cycleId || ''}
                    onChange={(value) => setGoalForm(prev => ({ ...prev, cycleId: parseInt(value as string) }))}
                    options={[
                      { value: '', label: 'Select a cycle' },
                      ...cycles.map(cycle => ({ value: cycle.id, label: cycle.name }))
                    ]}
                    showLabel={false}
                    required={true}
                    disabled={!!editingGoal}
                    size="md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Employee *
                  </label>
                  <UnifiedDropdown
                    value={goalForm.employeeId || ''}
                    onChange={(value) => setGoalForm(prev => ({ ...prev, employeeId: parseInt(value as string) }))}
                    options={[
                      { value: '', label: 'Select an employee' },
                      ...filteredEmployees.map(emp => ({ value: emp.id, label: emp.name }))
                    ]}
                    showLabel={false}
                    required={true}
                    disabled={!!editingGoal}
                    size="md"
                  />
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
                    onClick={handleCloseGoalModal}
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
                    onClick={handleCloseReviewModal}
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

        {/* Add KRA Modal */}
        {showKraFormModal && selectedGoalForKra && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add Key Result Area (KRA)</h3>
              
              <form onSubmit={handleCreateKra} className="space-y-4">
                <Input
                  label="KRA Title *"
                  value={kraForm.title}
                  onChange={(e) => setKraForm({ ...kraForm, title: e.target.value })}
                  placeholder="e.g., Complete Project X"
                  required
                />

                <Input
                  label="Description"
                  value={kraForm.description}
                  onChange={(e) => setKraForm({ ...kraForm, description: e.target.value })}
                  placeholder="Detailed description of the KRA"
                />

                <Input
                  label="Target Value *"
                  value={kraForm.targetValue}
                  onChange={(e) => setKraForm({ ...kraForm, targetValue: e.target.value })}
                  placeholder="e.g., 100%, 50 units, $10,000"
                  required
                />

                <Input
                  label="Weightage (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={kraForm.weightage.toString()}
                  onChange={(e) => setKraForm({ ...kraForm, weightage: parseFloat(e.target.value) || 1.0 })}
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={kraForm.dueDate}
                  onChange={(e) => setKraForm({ ...kraForm, dueDate: e.target.value })}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={handleCloseKraModal}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                  >
                    Add KRA
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
