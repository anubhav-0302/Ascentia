import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LayoutWrapper from './LayoutWrapper';
import SkeletonLoader from './SkeletonLoader';

interface Employee {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  status: 'Active' | 'Onboarding' | 'Remote';
  avatar: string;
  phone: string;
  location: string;
  joinDate: string;
  employeeId: string;
  manager?: {
    name: string;
    id: string;
  };
  directReports?: Array<{
    name: string;
    id: string;
    jobTitle: string;
  }>;
}

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'certificate' | 'resume' | 'performance' | 'other';
  uploadDate: string;
  size: string;
}

const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'experience' | 'documents'>('overview');

  // Mock employee data
  const mockEmployee: Employee = {
    id: id || '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@ascentia.com',
    jobTitle: 'Senior Frontend Developer',
    department: 'Engineering',
    status: 'Active',
    avatar: 'https://picsum.photos/seed/sarah/120/120.jpg',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: '2021-03-15',
    employeeId: 'EMP001234',
    manager: {
      name: 'John Davis',
      id: 'manager-1'
    },
    directReports: [
      { name: 'Alex Johnson', id: '1', jobTitle: 'Frontend Developer' },
      { name: 'Emma Wilson', id: '2', jobTitle: 'Junior Developer' }
    ]
  };

  const mockSkills: Skill[] = [
    { name: 'React', level: 'Expert', category: 'Frontend' },
    { name: 'TypeScript', level: 'Advanced', category: 'Frontend' },
    { name: 'Node.js', level: 'Intermediate', category: 'Backend' },
    { name: 'UI/UX Design', level: 'Advanced', category: 'Design' },
    { name: 'Project Management', level: 'Intermediate', category: 'Management' },
    { name: 'AWS', level: 'Beginner', category: 'Cloud' }
  ];

  const mockExperience: Experience[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'Ascentia',
      startDate: '2021-03-15',
      description: 'Leading frontend development for HRMS platform, implementing modern React patterns and improving user experience.'
    },
    {
      id: '2',
      title: 'Frontend Developer',
      company: 'TechCorp',
      startDate: '2019-06-01',
      endDate: '2021-02-28',
      description: 'Developed responsive web applications using React and TypeScript, collaborated with design team to implement pixel-perfect UIs.'
    },
    {
      id: '3',
      title: 'Junior Developer',
      company: 'StartupXYZ',
      startDate: '2018-01-15',
      endDate: '2019-05-31',
      description: 'Built and maintained client websites, gained experience in full-stack development with React and Node.js.'
    }
  ];

  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'Employment Contract 2021.pdf',
      type: 'contract',
      uploadDate: '2021-03-15',
      size: '245 KB'
    },
    {
      id: '2',
      name: 'React Certification.pdf',
      type: 'certificate',
      uploadDate: '2022-06-20',
      size: '1.2 MB'
    },
    {
      id: '3',
      name: 'Performance Review 2023.pdf',
      type: 'performance',
      uploadDate: '2023-12-15',
      size: '156 KB'
    },
    {
      id: '4',
      name: 'Updated Resume 2024.pdf',
      type: 'resume',
      uploadDate: '2024-01-10',
      size: '89 KB'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEmployee(mockEmployee);
      setSkills(mockSkills);
      setExperience(mockExperience);
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: "bg-green-400/20 text-green-400 border-green-400/30",
      Onboarding: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
      Remote: "bg-blue-400/20 text-blue-400 border-blue-400/30",
    };

    const dotColor = {
      Active: "bg-green-400",
      Onboarding: "bg-yellow-400",
      Remote: "bg-blue-400",
    };

    const configClass = statusConfig[status as keyof typeof statusConfig] || statusConfig["Active"];
    const dotClassValue = dotColor[status as keyof typeof dotColor] || dotColor["Active"];

    return (
      <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border " + configClass}>
        <span className={"w-2 h-2 rounded-full " + dotClassValue + " mr-2"}></span>
        {status}
      </span>
    );
  };

  const getSkillLevelColor = (level: Skill['level']) => {
    const colors = {
      Beginner: 'bg-blue-500',
      Intermediate: 'bg-yellow-500',
      Advanced: 'bg-purple-500',
      Expert: 'bg-green-500'
    };
    return colors[level];
  };

  const getDocumentIcon = (type: Document['type']) => {
    const icons = {
      contract: 'fas fa-file-contract',
      certificate: 'fas fa-certificate',
      resume: 'fas fa-file-alt',
      performance: 'fas fa-chart-line',
      other: 'fas fa-file'
    };
    return icons[type];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <SkeletonLoader height={36} width={200} className="mb-2" />
          <SkeletonLoader height={20} width={400} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <SkeletonLoader variant="circular" width={120} height={120} className="mx-auto mb-4" />
              <SkeletonLoader height={24} width={150} className="mx-auto mb-2" />
              <SkeletonLoader height={16} width={100} className="mx-auto mb-4" />
              <div className="space-y-3">
                <SkeletonLoader height={16} />
                <SkeletonLoader height={16} />
                <SkeletonLoader height={16} />
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <SkeletonLoader height={32} width={200} className="mb-4" />
              <div className="space-y-4">
                <SkeletonLoader height={20} />
                <SkeletonLoader height={20} />
                <SkeletonLoader height={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <i className="fas fa-user-slash text-gray-500 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-white mb-2">Employee Not Found</h3>
          <p className="text-gray-400 mb-4">The employee you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/directory')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <LayoutWrapper className="page-transition">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors duration-200 mb-2"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Employee Profile</h1>
          <p className="text-gray-400">Comprehensive employee information and history</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 button-interactive">
          <i className="fas fa-edit mr-2"></i>
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn">
            {/* Avatar and Basic Info */}
            <div className="text-center mb-6">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-32 h-32 rounded-full border-4 border-slate-700 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-white mb-2">{employee.name}</h2>
              <p className="text-gray-400 mb-3">{employee.jobTitle}</p>
              {getStatusBadge(employee.status)}
            </div>

            {/* Contact Information */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <i className="fas fa-envelope text-gray-400 w-5"></i>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-white">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-phone text-gray-400 w-5"></i>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-white">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-map-marker-alt text-gray-400 w-5"></i>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm text-white">{employee.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-building text-gray-400 w-5"></i>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm text-white">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-calendar text-gray-400 w-5"></i>
                <div>
                  <p className="text-xs text-gray-500">Join Date</p>
                  <p className="text-sm text-white">{new Date(employee.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-id-badge text-gray-400 w-5"></i>
                <div>
                  <p className="text-xs text-gray-500">Employee ID</p>
                  <p className="text-sm text-white">{employee.employeeId}</p>
                </div>
              </div>
            </div>

            {/* Organization Structure */}
            <div className="border-t border-slate-700/50 pt-4">
              <h3 className="text-sm font-semibold text-white mb-3">Organization</h3>
              {employee.manager && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Reports to</p>
                  <button
                    onClick={() => navigate(`/profile/${employee.manager?.id}`)}
                    className="flex items-center space-x-2 text-sm text-teal-400 hover:text-teal-300 transition-colors duration-200"
                  >
                    <img
                      src={`https://picsum.photos/seed/${employee.manager.id}/24/24.jpg`}
                      alt={employee.manager.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{employee.manager.name}</span>
                  </button>
                </div>
              )}
              {employee.directReports && employee.directReports.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Direct Reports ({employee.directReports.length})</p>
                  <div className="space-y-2">
                    {employee.directReports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => navigate(`/profile/${report.id}`)}
                        className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 w-full"
                      >
                        <img
                          src={`https://picsum.photos/seed/${report.id}/24/24.jpg`}
                          alt={report.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div className="text-left">
                          <p>{report.name}</p>
                          <p className="text-xs text-gray-500">{report.jobTitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl animate-fadeIn">
            {/* Tabs */}
            <div className="border-b border-slate-700/50">
              <div className="flex space-x-1 p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: 'fas fa-user' },
                  { id: 'skills', label: 'Skills', icon: 'fas fa-cogs' },
                  { id: 'experience', label: 'Experience', icon: 'fas fa-briefcase' },
                  { id: 'documents', label: 'Documents', icon: 'fas fa-folder' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <i className={tab.icon}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Passionate frontend developer with expertise in modern JavaScript frameworks and user experience design. 
                      Committed to creating intuitive, performant web applications that delight users and drive business success.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Key Achievements</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-trophy text-yellow-400 mt-1"></i>
                        <div>
                          <p className="text-white font-medium">Led UI Redesign Project</p>
                          <p className="text-gray-400 text-sm">Improved user engagement by 40% through complete UI overhaul</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-award text-purple-400 mt-1"></i>
                        <div>
                          <p className="text-white font-medium">Employee of the Year 2023</p>
                          <p className="text-gray-400 text-sm">Recognized for outstanding contributions and leadership</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <i className="fas fa-star text-blue-400 mt-1"></i>
                        <div>
                          <p className="text-white font-medium">Mentored 5 Junior Developers</p>
                          <p className="text-gray-400 text-sm">Successfully onboarded and trained new team members</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-certificate text-green-400"></i>
                          <div>
                            <p className="text-white text-sm">Completed React Advanced Certification</p>
                            <p className="text-gray-500 text-xs">2 weeks ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-project-diagram text-blue-400"></i>
                          <div>
                            <p className="text-white text-sm">Completed Dashboard Redesign</p>
                            <p className="text-gray-500 text-xs">1 month ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Technical Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{skill.name}</span>
                            <span className="text-xs px-2 py-1 bg-slate-600/50 text-gray-300 rounded">
                              {skill.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-slate-600/50 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getSkillLevelColor(skill.level)}`}
                                style={{
                                  width: skill.level === 'Expert' ? '100%' :
                                         skill.level === 'Advanced' ? '75%' :
                                         skill.level === 'Intermediate' ? '50%' : '25%'
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 w-16 text-right">{skill.level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Adaptability'].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-teal-600/20 text-teal-400 border border-teal-600/30 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="space-y-4 animate-fadeIn">
                  {experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{exp.title}</h4>
                          <p className="text-teal-400 text-sm">{exp.company}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="animate-fadeIn">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Documents</h3>
                    <button className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 button-interactive">
                      <i className="fas fa-upload mr-2"></i>
                      Upload
                    </button>
                  </div>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-600/50 rounded-lg flex items-center justify-center">
                            <i className={`${getDocumentIcon(doc.type)} text-gray-400`}></i>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{doc.name}</p>
                            <p className="text-gray-500 text-xs">{doc.uploadDate} • {doc.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/50 rounded transition-all duration-200">
                            <i className="fas fa-download text-sm"></i>
                          </button>
                          <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/50 rounded transition-all duration-200">
                            <i className="fas fa-eye text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default EmployeeProfile;
