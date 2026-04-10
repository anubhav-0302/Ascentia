import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LayoutWrapper from './LayoutWrapper';
import SkeletonLoader from './SkeletonLoader';

interface TeamMember {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  avatar: string;
  status: 'Active' | 'Onboarding' | 'Remote';
  email: string;
  joinDate: string;
  performanceScore?: number;
  skills: string[];
  directReports?: TeamMember[];
}

interface TeamAnalytics {
  totalMembers: number;
  activeMembers: number;
  averagePerformance: number;
  topPerformers: number;
  departments: Array<{
    name: string;
    count: number;
    avgPerformance: number;
  }>;
  skillsGap: Array<{
    skill: string;
    needed: number;
    available: number;
  }>;
}

const TeamView: React.FC = () => {
  const [teamData, setTeamData] = useState<TeamMember | null>(null);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'list'>('hierarchy');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Mock team hierarchy data
  const mockTeamData: TeamMember = {
    id: 'ceo',
    name: 'John Davis',
    jobTitle: 'CEO',
    department: 'Executive',
    avatar: 'https://picsum.photos/seed/ceo/60/60.jpg',
    status: 'Active',
    email: 'john.davis@ascentia.com',
    joinDate: '2018-01-15',
    performanceScore: 95,
    skills: ['Leadership', 'Strategy', 'Business Development'],
    directReports: [
      {
        id: 'cto',
        name: 'Sarah Chen',
        jobTitle: 'CTO',
        department: 'Engineering',
        avatar: 'https://picsum.photos/seed/sarah/60/60.jpg',
        status: 'Active',
        email: 'sarah.chen@ascentia.com',
        joinDate: '2019-03-15',
        performanceScore: 92,
        skills: ['React', 'TypeScript', 'Architecture', 'Leadership'],
        directReports: [
          {
            id: 'eng-manager',
            name: 'Michael Brown',
            jobTitle: 'Engineering Manager',
            department: 'Engineering',
            avatar: 'https://picsum.photos/seed/michael/60/60.jpg',
            status: 'Active',
            email: 'michael.brown@ascentia.com',
            joinDate: '2020-01-10',
            performanceScore: 88,
            skills: ['Management', 'JavaScript', 'Agile'],
            directReports: [
              {
                id: 'dev1',
                name: 'Alex Johnson',
                jobTitle: 'Senior Developer',
                department: 'Engineering',
                avatar: 'https://picsum.photos/seed/alex/60/60.jpg',
                status: 'Active',
                email: 'alex.johnson@ascentia.com',
                joinDate: '2020-06-15',
                performanceScore: 85,
                skills: ['React', 'Node.js', 'Python']
              },
              {
                id: 'dev2',
                name: 'Emma Wilson',
                jobTitle: 'Frontend Developer',
                department: 'Engineering',
                avatar: 'https://picsum.photos/seed/emma/60/60.jpg',
                status: 'Active',
                email: 'emma.wilson@ascentia.com',
                joinDate: '2021-02-01',
                performanceScore: 82,
                skills: ['React', 'CSS', 'UI/UX']
              }
            ]
          }
        ]
      },
      {
        id: 'cfo',
        name: 'Lisa Anderson',
        jobTitle: 'CFO',
        department: 'Finance',
        avatar: 'https://picsum.photos/seed/lisa/60/60.jpg',
        status: 'Active',
        email: 'lisa.anderson@ascentia.com',
        joinDate: '2019-06-01',
        performanceScore: 90,
        skills: ['Finance', 'Strategy', 'Leadership'],
        directReports: [
          {
            id: 'finance-manager',
            name: 'David Martinez',
            jobTitle: 'Finance Manager',
            department: 'Finance',
            avatar: 'https://picsum.photos/seed/david/60/60.jpg',
            status: 'Active',
            email: 'david.martinez@ascentia.com',
            joinDate: '2020-03-20',
            performanceScore: 87,
            skills: ['Accounting', 'Excel', 'Financial Analysis']
          }
        ]
      },
      {
        id: 'cmo',
        name: 'Robert Taylor',
        jobTitle: 'CMO',
        department: 'Marketing',
        avatar: 'https://picsum.photos/seed/robert/60/60.jpg',
        status: 'Active',
        email: 'robert.taylor@ascentia.com',
        joinDate: '2020-01-15',
        performanceScore: 89,
        skills: ['Marketing', 'Strategy', 'Leadership'],
        directReports: [
          {
            id: 'marketing-manager',
            name: 'Jennifer White',
            jobTitle: 'Marketing Manager',
            department: 'Marketing',
            avatar: 'https://picsum.photos/seed/jennifer/60/60.jpg',
            status: 'Active',
            email: 'jennifer.white@ascentia.com',
            joinDate: '2020-09-10',
            performanceScore: 86,
            skills: ['Digital Marketing', 'Content Strategy', 'Analytics']
          }
        ]
      }
    ]
  };

  const mockAnalytics: TeamAnalytics = {
    totalMembers: 12,
    activeMembers: 11,
    averagePerformance: 87.5,
    topPerformers: 4,
    departments: [
      { name: 'Engineering', count: 5, avgPerformance: 86.8 },
      { name: 'Finance', count: 2, avgPerformance: 88.5 },
      { name: 'Marketing', count: 2, avgPerformance: 87.5 },
      { name: 'Executive', count: 3, avgPerformance: 91.3 }
    ],
    skillsGap: [
      { skill: 'Leadership', needed: 8, available: 6 },
      { skill: 'Data Analysis', needed: 6, available: 3 },
      { skill: 'Cloud Computing', needed: 5, available: 2 },
      { skill: 'Project Management', needed: 7, available: 5 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTeamData(mockTeamData);
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, []);

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
      <span className={"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border " + configClass}>
        <span className={"w-1.5 h-1.5 rounded-full " + dotClassValue + " mr-1"}></span>
        {status}
      </span>
    );
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTeamMember = (member: TeamMember, level: number = 0) => {
    const isExpanded = expandedNodes.has(member.id);
    const hasChildren = member.directReports && member.directReports.length > 0;

    return (
      <div key={member.id} className="animate-fadeIn" style={{ animationDelay: `${level * 0.1}s` }}>
        <div
          className={`flex items-center p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200 ${level > 0 ? 'ml-' + (level * 8) : ''}`}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleNodeExpansion(member.id)}
              className="mr-3 p-1 text-gray-400 hover:text-white hover:bg-slate-600/50 rounded transition-all duration-200"
            >
              <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-sm`}></i>
            </button>
          )}
          {!hasChildren && <div className="w-6 mr-3"></div>}

          {/* Avatar */}
          <img
            src={member.avatar}
            alt={member.name}
            className="w-12 h-12 rounded-full border-2 border-slate-600 mr-4"
          />

          {/* Member Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <Link
                to={`/profile/${member.id}`}
                className="text-white font-semibold hover:text-teal-400 transition-colors duration-200"
              >
                {member.name}
              </Link>
              {getStatusBadge(member.status)}
            </div>
            <p className="text-gray-400 text-sm mb-2">{member.jobTitle} • {member.department}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span><i className="fas fa-envelope mr-1"></i>{member.email}</span>
              <span><i className="fas fa-calendar mr-1"></i>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
              {member.performanceScore && (
                <span className={getPerformanceColor(member.performanceScore)}>
                  <i className="fas fa-chart-line mr-1"></i>{member.performanceScore}% Performance
                </span>
              )}
            </div>
            {/* Skills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {member.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-slate-600/50 text-gray-300 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="px-2 py-0.5 bg-slate-600/50 text-gray-400 text-xs rounded">
                  +{member.skills.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/50 rounded transition-all duration-200">
              <i className="fas fa-comment text-sm"></i>
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/50 rounded transition-all duration-200">
              <i className="fas fa-chart-bar text-sm"></i>
            </button>
          </div>
        </div>

        {/* Direct Reports */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {member.directReports!.map((report) => renderTeamMember(report, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderListView = (_members: TeamMember[]) => {
    const flattenTeam = (member: TeamMember): TeamMember[] => {
      const result = [member];
      if (member.directReports) {
        member.directReports.forEach(report => {
          result.push(...flattenTeam(report));
        });
      }
      return result;
    };

    const allMembers = flattenTeam(teamData!);

    return (
      <div className="space-y-2">
        {allMembers.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200 animate-fadeIn"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <img
              src={member.avatar}
              alt={member.name}
              className="w-10 h-10 rounded-full border-2 border-slate-600 mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Link
                  to={`/profile/${member.id}`}
                  className="text-white font-semibold hover:text-teal-400 transition-colors duration-200"
                >
                  {member.name}
                </Link>
                {getStatusBadge(member.status)}
              </div>
              <p className="text-gray-400 text-sm">{member.jobTitle} • {member.department}</p>
            </div>
            {member.performanceScore && (
              <div className={`text-sm font-medium ${getPerformanceColor(member.performanceScore)}`}>
                {member.performanceScore}%
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <SkeletonLoader height={36} width={200} className="mb-2" />
          <SkeletonLoader height={20} width={400} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
              <SkeletonLoader height={20} width={100} className="mb-2" />
              <SkeletonLoader height={32} width={60} className="mb-1" />
              <SkeletonLoader height={16} width={80} />
            </div>
          ))}
        </div>
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
          <SkeletonLoader height={24} width={150} className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonLoader height={80} key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <LayoutWrapper className="page-transition">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team View</h1>
          <p className="text-gray-400">Organization hierarchy and team analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === 'hierarchy'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-600'
              }`}
            >
              <i className="fas fa-sitemap mr-2"></i>
              Hierarchy
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-600'
              }`}
            >
              <i className="fas fa-list mr-2"></i>
              List
            </button>
          </div>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 button-interactive">
            <i className="fas fa-user-plus mr-2"></i>
            Add Member
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 card-hover animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <i className="fas fa-users text-blue-400 text-xl"></i>
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{analytics.totalMembers}</h3>
            <p className="text-gray-400 text-sm">Team Members</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 card-hover animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <i className="fas fa-user-check text-green-400 text-xl"></i>
              </div>
              <span className="text-sm text-gray-400">Active</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{analytics.activeMembers}</h3>
            <p className="text-gray-400 text-sm">Active Members</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 card-hover animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <i className="fas fa-chart-line text-purple-400 text-xl"></i>
              </div>
              <span className="text-sm text-gray-400">Average</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{analytics.averagePerformance}%</h3>
            <p className="text-gray-400 text-sm">Performance Score</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 card-hover animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <i className="fas fa-trophy text-yellow-400 text-xl"></i>
              </div>
              <span className="text-sm text-gray-400">Top</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{analytics.topPerformers}</h3>
            <p className="text-gray-400 text-sm">Top Performers</p>
          </div>
        </div>
      )}

      {/* Department Performance */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn">
            <h3 className="text-lg font-semibold text-white mb-4">Department Performance</h3>
            <div className="space-y-3">
              {analytics.departments.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    <span className="text-white text-sm">{dept.name}</span>
                    <span className="text-gray-400 text-xs">({dept.count} members)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-600/50 rounded-full h-2">
                      <div
                        className="bg-teal-400 h-2 rounded-full"
                        style={{ width: `${dept.avgPerformance}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-xs w-10 text-right">{dept.avgPerformance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn">
            <h3 className="text-lg font-semibold text-white mb-4">Skills Gap Analysis</h3>
            <div className="space-y-3">
              {analytics.skillsGap.map((skill) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      skill.available >= skill.needed ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-white text-sm">{skill.skill}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">{skill.available}/{skill.needed}</span>
                    <div className="w-16 bg-slate-600/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          skill.available >= skill.needed ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${Math.min((skill.available / skill.needed) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Structure */}
      {teamData && (
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Team Structure</h3>
            <button
              onClick={() => setExpandedNodes(new Set(teamData.directReports?.map(m => m.id) || []))}
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors duration-200"
            >
              <i className="fas fa-expand-alt mr-2"></i>
              Expand All
            </button>
          </div>

          {viewMode === 'hierarchy' ? (
            <div className="space-y-2">
              {renderTeamMember(teamData)}
            </div>
          ) : (
            renderListView([teamData])
          )}
        </div>
      )}
    </LayoutWrapper>
  );
};

export default TeamView;
