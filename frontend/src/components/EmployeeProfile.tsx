import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Extend Window interface for document upload
declare global {
  interface Window {
    documentUploadInput?: HTMLInputElement;
  }
}

import { StandardLayout } from './StandardLayout';
import { User, Calendar, MapPin, Briefcase, Edit, Trash2, Clock, AlertCircle, FileText, Download, Upload, Lock, Eye } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useAuthStore } from '../store/useAuthStore';
import { getMyLeaves, getAllLeaves, type LeaveRequest } from '../api/leaveApi';
import { useIsAdmin } from '../store/useAuthStore';
import Button from './Button';
import StatusBadge from './StatusBadge';
import { EnhancedModal } from './EnhancedModal';
import { employeeApi, type Employee, type UpdateEmployeeRequest } from '../api/employeeApi';
import { documentsApi } from '../api/documentsApi';
import { performanceReviewApi } from '../api/performanceReviewApi';
import PayslipView from './PayslipView';
import PasswordVerificationModal from './PasswordVerificationModal';
import toast from 'react-hot-toast';

const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { employees, fetchEmployees } = useEmployeeStore();
  
  // If no ID provided (e.g., /profile route), use current user's ID
  const employeeId = id || user?.id?.toString();
  const isOwnProfile = !id || (user && parseInt(id) === user.id);
  const employeeIdNum = employeeId ? parseInt(employeeId) : undefined;
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaveData, setLeaveData] = useState<LeaveRequest[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  
  // Performance Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    feedback: '',
    type: 'General'
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Salary protection state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [salaryUnlocked, setSalaryUnlocked] = useState(false);
  const [salaryUnlockTime, setSalaryUnlockTime] = useState<number | null>(null);
  const SALARY_ACCESS_DURATION = 10 * 60 * 1000; // 10 minutes

  // Check if salary access is still valid
  useEffect(() => {
    if (salaryUnlockTime) {
      const timeElapsed = Date.now() - salaryUnlockTime;
      if (timeElapsed > SALARY_ACCESS_DURATION) {
        setSalaryUnlocked(false);
        setSalaryUnlockTime(null);
      } else {
        // Set timeout to lock salary after remaining time
        const remainingTime = SALARY_ACCESS_DURATION - timeElapsed;
        const timer = setTimeout(() => {
          setSalaryUnlocked(false);
          setSalaryUnlockTime(null);
        }, remainingTime);
        
        return () => clearTimeout(timer);
      }
    }
  }, [salaryUnlockTime]);

  const handleSalaryClick = () => {
    if (!salaryUnlocked) {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSuccess = () => {
    setSalaryUnlocked(true);
    setSalaryUnlockTime(Date.now());
  };

  // Find employee from store or fetch if not available
  useEffect(() => {
    const loadEmployee = async () => {
      if (!employeeId) return;
      
      setError(null); // Reset error state
      const empId = parseInt(employeeId);
      if (isNaN(empId)) {
        setError('Invalid employee ID');
        setLoading(false);
        return;
      }
      
      // First check if employee exists in store
      let foundEmployee = employees.find(emp => emp.id === employeeIdNum);
      
      if (foundEmployee) {
        setEmployee(foundEmployee);
        setLoading(false);
        return;
      }
      
      // If not found, try direct API call first (more efficient)
      try {
        const response = await employeeApi.getEmployee(employeeIdNum!);
        // Handle API response format: { success: true, data: employee }
        if (response && response.data) {
          setEmployee(response.data);
        } else if (response) {
          setEmployee(response);
        } else {
          setError('Employee not found');
        }
      } catch (error: any) {
        console.error('Direct API call failed, trying to fetch all employees:', error);
        
        // If direct call fails, try fetching all employees and then finding the employee
        try {
          await fetchEmployees();
          // Wait a bit for state to update
          setTimeout(() => {
            const updatedEmployee = employees.find(emp => emp.id === employeeIdNum);
            if (updatedEmployee) {
              setEmployee(updatedEmployee);
            } else {
              setError('Employee not found');
            }
            setLoading(false);
          }, 100);
          return; // Exit early since we're handling setLoading in setTimeout
        } catch (fetchError) {
          console.error('Failed to fetch employees:', fetchError);
          setError('Failed to load employee data');
        }
      }
      
      setLoading(false);
    };

    loadEmployee();
  }, [employeeId, employees, fetchEmployees]); // Add location.key to handle browser back/forward navigation

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      // Reset states and reload data when browser navigation occurs
      setEmployee(null);
      setError(null);
      setLoading(true);
      setLeaveData([]);
      setLeaveLoading(true);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Load leave data for the employee
  useEffect(() => {
    const loadLeaveData = async () => {
      if (!employee) return;
      
      setLeaveLoading(true);
      try {
        // If viewing own profile, use my leaves, otherwise use all leaves and filter
        if (user?.id === employee.id) {
          const response = await getMyLeaves();
          // Handle API response format
          if (response && response.data) {
            setLeaveData(response.data);
          } else {
            setLeaveData(response || []);
          }
        } else if (isAdmin) {
          const response = await getAllLeaves();
          // Handle API response format
          const allLeaves = response && response.data ? response.data : (response || []);
          const employeeLeaves = allLeaves.filter((leave: LeaveRequest) => 
            leave.user && leave.user.id === employee.id
          );
          setLeaveData(employeeLeaves);
        }
      } catch (error) {
        console.error('Failed to load leave data:', error);
        setLeaveData([]); // Set empty array on error
      } finally {
        setLeaveLoading(false);
      }
    };

    loadLeaveData();
  }, [employee, user, isAdmin]);

  // Memoized leave statistics
  const leaveStats = useMemo(() => {
    const total = leaveData.length;
    const pending = leaveData.filter(leave => leave.status === 'Pending').length;
    const approved = leaveData.filter(leave => leave.status === 'Approved').length;
    const rejected = leaveData.filter(leave => leave.status === 'Rejected').length;
    
    return { total, pending, approved, rejected };
  }, [leaveData]);

  // Recent leave requests (last 5)
  const recentLeaves = useMemo(() => {
    return leaveData
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [leaveData]);

  const handleEditEmployee = () => {
    setShowEditModal(true);
  };

  const handleDeleteEmployee = async () => {
    if (!employee || !window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      return;
    }

    try {
      await employeeApi.deleteEmployee(employee.id);
      toast.success('Employee deleted successfully');
      navigate('/directory');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete employee');
    }
  };

  const handleUpdateEmployee = async (data: UpdateEmployeeRequest) => {
    if (!employee) return;
    
    setEditLoading(true);
    try {
      await employeeApi.updateEmployee(employee.id, data);
      toast.success('Employee updated successfully');
      setShowEditModal(false);
      // Refresh employee data
      const response = await employeeApi.getEmployee(employee.id);
      if (response && response.data) {
        setEmployee(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update employee');
    } finally {
      setEditLoading(false);
    }
  };

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!employee) return;
      
      setDocumentsLoading(true);
      try {
        const response = await documentsApi.getEmployeeDocuments(employee.id);
        if (response.success) {
          setDocuments(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, [employee]);

  // Fetch performance reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!employee) return;
      
      setReviewsLoading(true);
      try {
        const response = await performanceReviewApi.getEmployeeReviews(employee.id);
        if (response.success) {
          setReviews(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [employee]);

  // Handle review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;
    
    setSubmittingReview(true);
    try {
      const response = await performanceReviewApi.createReview(
        employee.id,
        reviewForm.rating,
        reviewForm.feedback,
        reviewForm.type
      );
      
      if (response.success) {
        toast.success('Performance review submitted successfully');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, feedback: '', type: 'General' });
        
        // Refresh reviews
        const reviewsResponse = await performanceReviewApi.getEmployeeReviews(employee.id);
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employee) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      toast.error('Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF');
      return;
    }

    setUploadingDocument(true);
    try {
      const response = await documentsApi.upload(employee.id, file);
      if (response.success) {
        toast.success('Document uploaded successfully');
        // Refresh documents list
        const docsResponse = await documentsApi.getEmployeeDocuments(employee.id);
        if (docsResponse.success) {
          setDocuments(docsResponse.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDocument(false);
      // Clear the input
      event.target.value = '';
    }
  };

  // Handle document delete
  const handleDeleteDocument = async (documentId: number) => {
    if (!employee) return;

    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await documentsApi.delete(documentId);
      if (response.success) {
        toast.success('Document deleted successfully');
        // Refresh documents list
        const docsResponse = await documentsApi.getEmployeeDocuments(employee.id);
        if (docsResponse.success) {
          setDocuments(docsResponse.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  // Handle document download
  const handleDownloadDocument = async (documentId: number, fileName: string) => {
    try {
      await documentsApi.download(documentId, fileName);
    } catch (error: any) {
      toast.error('Failed to download document');
    }
  };


  if (loading) {
    return (
      <PageTransition>
        <StandardLayout title="Employee Profile" description="Loading employee information...">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading employee information...</p>
          </div>
        </StandardLayout>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <StandardLayout title="Error" description="An error occurred while loading the employee profile">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Error: {error}</p>
            <p className="text-gray-500 text-sm mb-6">Please try again or contact support if the problem persists.</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
              <Button onClick={() => navigate('/directory')} variant="secondary" className="mt-4">
                Back to Directory
              </Button>
            </div>
          </div>
        </StandardLayout>
      </PageTransition>
    );
  }

  if (!employee) {
    return (
      <PageTransition>
        <StandardLayout title="Employee Not Found" description="The requested employee could not be found">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Employee not found</p>
            <Button onClick={() => navigate('/directory')} className="mt-4">
              Back to Directory
            </Button>
          </div>
        </StandardLayout>
      </PageTransition>
    );
  }

  
  return (
    <PageTransition>
      <StandardLayout>
        <FadeIn delay={100}>
          <div className="space-y-6">
            {/* Header Section */}
            <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-teal-400">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-white">{employee.name}</h1>
                    <p className="text-teal-400 font-medium">{employee.jobTitle}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <StatusBadge status={employee.status} />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {(isAdmin || isOwnProfile) && (
                    <Button onClick={handleEditEmployee} variant="secondary">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {isAdmin && !isOwnProfile && (
                    <Button onClick={handleDeleteEmployee} variant="danger">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-teal-400" />
                    Basic Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                      <p className="text-white">{employee.name || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                      <p className="text-white">{employee.email || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Job Title</label>
                      <p className="text-white">{employee.jobTitle || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Department</label>
                      <p className="text-white">{employee.department || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Reports To</label>
                      <p className="text-white flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {employee.manager ? (
                          <button
                            onClick={() => employee.manager && navigate(`/employee/${employee.manager.id}`)}
                            className="text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            {employee.manager.name}
                          </button>
                        ) : (
                          <span className="text-gray-400">No manager assigned</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                      <p className="text-white flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {employee.location || 'Not available'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Employee ID</label>
                      <p className="text-white">#{employee.id}</p>
                    </div>
                  </div>
                </Card>

                {/* Work Info Section */}
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-teal-400" />
                    Work Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                      <StatusBadge status={employee.status} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Join Date</label>
                      <p className="text-white flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Last Login</label>
                      <p className="text-white flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Team Members Section */}
                {employee.directReports && employee.directReports.length > 0 && (
                  <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-teal-400" />
                      Team Members ({employee.directReports.length})
                    </h2>
                    
                    <div className="space-y-3">
                      {employee.directReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors cursor-pointer"
                          onClick={() => navigate(`/employee/${report.id}`)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-teal-400">
                                {report.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{report.name}</p>
                              <p className="text-gray-400 text-sm">{report.jobTitle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">{report.department}</p>
                            <StatusBadge status={report.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Account Security Section - Only for own profile */}
                
                {/* Performance Reviews Section */}
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-teal-400" />
                      Performance Reviews
                    </h3>
                    {(isAdmin || user?.role === 'manager' || user?.role === 'teamlead') && !isOwnProfile && (
                      <Button
                        size="sm"
                        onClick={() => setShowReviewModal(true)}
                      >
                        Add Review
                      </Button>
                    )}
                  </div>

                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                      <p className="text-gray-400 text-sm mt-2">Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No performance reviews yet</p>
                      {(isAdmin || user?.role === 'manager' || user?.role === 'teamlead') && !isOwnProfile && (
                        <p className="text-gray-500 text-sm mt-2">Click "Add Review" to provide feedback</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-slate-700/30 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-white font-medium">{review.reviewer.name}</p>
                              <p className="text-gray-400 text-sm">
                                {review.reviewer.role} • {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= review.rating ? 'text-yellow-400' : 'text-gray-600'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          {review.feedback && (
                            <p className="text-gray-300 mt-2">{review.feedback}</p>
                          )}
                          {review.type && (
                            <span className="inline-block px-2 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full mt-2">
                              {review.type}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Leave Summary Section */}
              <div className="space-y-6">
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-teal-400" />
                    Leave Summary
                  </h2>
                  
                  {leaveLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                      <p className="text-gray-400 text-sm mt-2">Loading leave data...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-2xl font-bold text-teal-400">{leaveStats.total}</p>
                          <p className="text-gray-400 text-sm">Total Requests</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-400">{leaveStats.pending}</p>
                          <p className="text-gray-400 text-sm">Pending</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-2xl font-bold text-green-400">{leaveStats.approved}</p>
                          <p className="text-gray-400 text-sm">Approved</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-2xl font-bold text-red-400">{leaveStats.rejected}</p>
                          <p className="text-gray-400 text-sm">Rejected</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Recent Leave History */}
                {recentLeaves.length > 0 && (
                  <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Leave History</h3>
                    <div className="space-y-3">
                      {recentLeaves.map((leave) => (
                        <div key={leave.id} className="p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{leave.type}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <StatusBadge status={leave.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Documents Section */}
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-teal-400" />
                      Documents
                    </h3>
                    {(isAdmin || isOwnProfile) && (
                      <>
                        <input
                          ref={(input) => {
                            if (input) {
                              window.documentUploadInput = input;
                            }
                          }}
                          type="file"
                          onChange={handleDocumentUpload}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                          className="hidden"
                          disabled={uploadingDocument}
                        />
                        <Button
                          size="sm"
                          disabled={uploadingDocument}
                          className="flex items-center"
                          onClick={() => {
                            const input = window.documentUploadInput;
                            if (input) {
                              input.click();
                            }
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingDocument ? 'Uploading...' : 'Upload'}
                        </Button>
                      </>
                    )}
                  </div>

                  {documentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                      <p className="text-gray-400 text-sm mt-2">Loading documents...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No documents uploaded</p>
                      {(isAdmin || isOwnProfile) && (
                        <p className="text-gray-500 text-sm mt-2">Click the Upload button to add documents</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{doc.originalName}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.fileSize / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleDownloadDocument(doc.id, doc.originalName)}
                                className="p-2"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              {(isAdmin || isOwnProfile) && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="p-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Salary Details Section - Password Protected */}
            {isOwnProfile ? (
              <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-teal-400" />
                  Salary Details
                  {salaryUnlocked && (
                    <span className="ml-3 text-xs text-teal-400 bg-teal-500/20 px-2 py-1 rounded-full">
                      Access expires in {Math.ceil((SALARY_ACCESS_DURATION - (Date.now() - (salaryUnlockTime || 0))) / 60000)} min
                    </span>
                  )}
                </h2>
                
                {!salaryUnlocked ? (
                  <div 
                    onClick={handleSalaryClick}
                    className="relative group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-slate-900/90">
                      <div className="text-center">
                        <Lock className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                        <p className="text-white font-medium mb-1">Restricted Content</p>
                        <p className="text-gray-400 text-sm">Click to verify password and view salary details</p>
                        <Button size="sm" className="mt-3">
                          <Eye className="w-4 h-4 mr-2" />
                          View Salary
                        </Button>
                      </div>
                    </div>
                    <div className="blur-sm">
                      <PayslipView 
                        employeeId={employee.id} 
                        employeeName={employee.name}
                        preview={true}
                      />
                    </div>
                  </div>
                ) : (
                  <PayslipView 
                    employeeId={employee.id} 
                    employeeName={employee.name}
                  />
                )}
              </Card>
            ) : (
              <PayslipView 
                employeeId={employee.id} 
                employeeName={employee.name}
              />
            )}
          </div>
        </FadeIn>
      </StandardLayout>

      {/* Edit Modal */}
      <EnhancedModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${employee.name}`}
      >
        <EmployeeEditForm
          employee={employee}
          onSubmit={handleUpdateEmployee}
          onCancel={() => setShowEditModal(false)}
          loading={editLoading}
        />
      </EnhancedModal>

      {/* Review Modal */}
      <EnhancedModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Add Performance Review"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className={`transition-colors ${
                    star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-600'
                  }`}
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-1">Selected: {reviewForm.rating} out of 5</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Review Type</label>
            <select
              value={reviewForm.type}
              onChange={(e) => setReviewForm({ ...reviewForm, type: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="General">General</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
              <option value="Project">Project</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Feedback</label>
            <textarea
              value={reviewForm.feedback}
              onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
              placeholder="Provide detailed feedback..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              onClick={() => setShowReviewModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={submittingReview}
              className="flex-1"
              loadingText="Submitting..."
            >
              Submit Review
            </Button>
          </div>
        </form>
      </EnhancedModal>

      {/* Password Verification Modal */}
      <PasswordVerificationModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
        title="Verify Password to View Salary"
        message="Please enter your password to access your confidential salary information"
      />
    </PageTransition>
  );

};

// Employee Edit Form Component
interface EmployeeEditFormProps {
  employee: Employee;
  onSubmit: (data: UpdateEmployeeRequest) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({
  employee,
  onSubmit,
  onCancel,
  loading
}) => {
  const [formData, setFormData] = useState<UpdateEmployeeRequest>({
    name: employee.name,
    email: employee.email,
    jobTitle: employee.jobTitle,
    department: employee.department,
    location: employee.location,
    status: employee.status,
    role: employee.role
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
        <input
          type="text"
          value={formData.jobTitle}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
        <input
          type="text"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="hr">HR</option>
          <option value="manager">Manager</option>
          <option value="teamlead">Team Lead</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );

};

export default EmployeeProfile;
