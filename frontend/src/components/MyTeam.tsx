import React, { useMemo, useEffect, useState } from 'react';
import { StandardLayout } from './StandardLayout';
import { useFilters } from '../contexts/FilterContext';
import Filter from './Filter';
import { Users, TrendingUp, Award, Target, ChevronDown, ChevronRight, FolderKanban } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useAuthStore } from '../store/useAuthStore';
import { getMyProjects, getProjectMembers, type MyProject, type ProjectMember } from '../api/projectApi';

// Unified team member shape for both Employee and ProjectMember sources
interface TeamMember {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  status: string;
  location?: string;
  managerId?: number;
  manager?: { id: number; name: string; email: string; jobTitle: string };
  projectRole?: string; // Only when viewing a specific project
  allocation?: number;  // Only when viewing a specific project
}

const MyTeam: React.FC = () => {
  const { filters } = useFilters();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { user } = useAuthStore();
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());

  // Project filter state
  const [myProjects, setMyProjects] = useState<MyProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => { fetchEmployees(isAdminOrHR ? 'all' : undefined); }, [fetchEmployees, isAdminOrHR]);

  // Fetch user's projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const data = await getMyProjects();
        setMyProjects(data);
      } catch (err) {
        console.error('Failed to fetch my projects:', err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch project members when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const fetchMembers = async () => {
        try {
          setProjectsLoading(true);
          const members = await getProjectMembers(selectedProjectId);
          setProjectMembers(members);
        } catch (err) {
          console.error('Failed to fetch project members:', err);
          setProjectMembers([]);
        } finally {
          setProjectsLoading(false);
        }
      };
      fetchMembers();
    } else {
      setProjectMembers([]);
    }
  }, [selectedProjectId]);

  // Map data source to unified TeamMember[]
  const teamMembers: TeamMember[] = useMemo(() => {
    if (selectedProjectId) {
      return projectMembers.map(pm => ({
        id: pm.employee.id,
        name: pm.employee.name,
        email: pm.employee.email,
        jobTitle: pm.employee.jobTitle || '',
        department: pm.employee.department || '',
        status: pm.employee.status || 'active',
        projectRole: pm.role,
        allocation: pm.allocation,
      }));
    }
    return employees.map(e => ({
      id: e.id,
      name: e.name,
      email: e.email,
      jobTitle: e.jobTitle,
      department: e.department,
      status: e.status,
      location: e.location,
      managerId: e.managerId,
      manager: e.manager,
    }));
  }, [selectedProjectId, projectMembers, employees]);

  const teamStats = useMemo(() => [
    { title: 'Team Members', value: String(teamMembers.length), change: selectedProjectId ? 'Project members' : 'Total employees', icon: Users, color: 'text-blue-400' },
    { title: 'Active', value: String(teamMembers.filter(e => e.status.toLowerCase() === 'active').length), change: 'Currently active', icon: TrendingUp, color: 'text-green-400' },
    { title: 'Remote', value: String(teamMembers.filter(e => e.status.toLowerCase() === 'remote').length), change: 'Working remotely', icon: Target, color: 'text-purple-400' },
    { title: 'Departments', value: String(new Set(teamMembers.map(e => e.department).filter(Boolean)).size), change: 'Active departments', icon: Award, color: 'text-yellow-400' }
  ], [teamMembers, selectedProjectId]);


  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'on leave': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const normalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Filter team members based on filter context
  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = !filters.search || 
        member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.department.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || filters.status === 'all' ||
        member.status.toLowerCase() === filters.status.toLowerCase();

      const matchesDepartment = !filters.department || filters.department === 'all' || 
        member.department === filters.department;

      const matchesLocation = !filters.location || filters.location === 'all' || 
        member.location === filters.location;

      return matchesSearch && matchesStatus && matchesDepartment && matchesLocation;
    }).sort((a, b) => {
      const { sortBy } = filters;
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'department':
          return a.department.localeCompare(b.department);
        case 'date':
          return 0; // No date data
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [teamMembers, filters]);

  // Group employees by department
  const employeesByDepartment = useMemo(() => {
    const groups: { [key: string]: typeof filteredTeamMembers } = {};
    
    filteredTeamMembers.forEach(member => {
      const department = member.department || 'Unassigned';
      if (!groups[department]) {
        groups[department] = [];
      }
      groups[department].push(member);
    });

    // Sort departments alphabetically
    const sortedGroups: { [key: string]: typeof filteredTeamMembers } = {};
    Object.keys(groups).sort().forEach(department => {
      sortedGroups[department] = groups[department];
    });

    return sortedGroups;
  }, [filteredTeamMembers]);

  return (
    <PageTransition>
      <StandardLayout 
        title="My Team"
        description="Manage your team members and performance"
      >
        <FadeIn delay={100}>
          {/* Filter Component */}
          <Filter
            showDepartment={true}
            showStatus={true}
            showEmploymentType={false}
            showLocation={true}
            showSortOptions={true}
            showDateRange={false}
            showReportType={false}
          />

          {/* Project Filter Dropdown */}
          {myProjects.length > 1 && (
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <FolderKanban className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <select
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 min-w-[200px]"
                  disabled={projectsLoading}
                >
                  <option value="">All Projects</option>
                  {myProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.myRole})
                    </option>
                  ))}
                </select>
                {projectsLoading && (
                  <div className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                )}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {teamStats.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-sm text-gray-400">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </Card>
            ))}
          </div>

          {/* All Projects: Team Structure + Department Members */}
          {!selectedProjectId && (
            <>
              {/* Team Hierarchy View */}
              <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-400" />
                    Team Structure
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {(() => {
                    // Group employees by manager
                    const hierarchy: { [key: string]: typeof filteredTeamMembers } = {};
                    const managers = new Set<string>();
                    
                    // First pass: identify managers and group employees
                    filteredTeamMembers.forEach(member => {
                      if (member.managerId) {
                        const managerKey = `${member.manager?.name || 'Unknown Manager'} (${member.manager?.jobTitle || 'Unknown'})`;
                        if (!hierarchy[managerKey]) {
                          hierarchy[managerKey] = [];
                        }
                        hierarchy[managerKey].push(member);
                        managers.add(managerKey);
                      }
                    });

                    // Find employees without managers (top level)
                    // Only show "Unassigned" group for admin/HR
                    if (isAdminOrHR) {
                      const topLevel = filteredTeamMembers.filter(member => !member.managerId);
                      if (topLevel.length > 0) {
                        hierarchy['Unassigned (No Manager)'] = topLevel;
                      }
                    }

                    return Object.keys(hierarchy).length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No hierarchy structure available</p>
                        <p className="text-gray-500 text-sm mt-2">Assign managers to employees to see the team structure</p>
                      </div>
                    ) : (
                      Object.entries(hierarchy).map(([managerName, members]) => {
                        const isExpanded = expandedManagers.has(managerName);
                        const toggleManager = () => {
                          setExpandedManagers(prev => {
                            const next = new Set(prev);
                            if (next.has(managerName)) next.delete(managerName);
                            else next.add(managerName);
                            return next;
                          });
                        };
                        return (
                        <div key={managerName} className="space-y-3">
                          <button
                            onClick={toggleManager}
                            className="w-full flex items-center space-x-3 pb-2 border-b border-slate-700/50 hover:bg-slate-700/20 rounded-lg px-2 py-1.5 transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{managerName}</h4>
                              <p className="text-gray-400 text-xs">{members.length} direct {members.length === 1 ? 'report' : 'reports'}</p>
                            </div>
                          </button>
                          
                          {isExpanded && (
                          <div className="ml-11 space-y-2">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-teal-400">
                                      {member.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-white font-medium text-sm">{member.name}</p>
                                    <p className="text-gray-400 text-xs">{member.jobTitle}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-500 text-xs">{member.department}</span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                                    {normalizeStatus(member.status)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          )}
                        </div>
                        );
                      })
                    );
                  })()}
                </div>
              </Card>

              {/* Team Members by Department - Only for Admin/HR */}
              {isAdminOrHR && (
                <Card className="p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-400" />
                      Team Members {filteredTeamMembers.length !== teamMembers.length && `(${filteredTeamMembers.length}/${teamMembers.length})`}
                    </h3>
                  </div>
                  
                  {/* Department Groups */}
                  <div className="space-y-6">
                    {Object.keys(employeesByDepartment).length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No team members found matching your filters.</p>
                      </div>
                    ) : (
                      Object.entries(employeesByDepartment).map(([department, members]) => {
                        const isExpanded = expandedDepts.has(department);
                        const toggleDept = () => {
                          setExpandedDepts(prev => {
                            const next = new Set(prev);
                            if (next.has(department)) next.delete(department);
                            else next.add(department);
                            return next;
                          });
                        };
                        return (
                        <div key={department} className="space-y-3">
                          <button
                            onClick={toggleDept}
                            className="w-full flex items-center space-x-2 pb-2 border-b border-slate-700/50 hover:bg-slate-700/20 rounded-lg px-2 py-1.5 transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <Award className="w-4 h-4 text-yellow-400" />
                            <h4 className="text-white font-medium">{department}</h4>
                            <span className="text-xs text-gray-500 bg-slate-700/50 px-2 py-1 rounded-full">
                              {members.length} {members.length === 1 ? 'member' : 'members'}
                            </span>
                          </button>
                          
                          {isExpanded && (
                          <div className="grid grid-cols-1 gap-3">
                            {members.map((member) => (
                              <div key={member.id} className="bg-slate-800/60 rounded-xl p-4 hover:bg-slate-800/80 transition-all duration-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-sm font-bold text-teal-400">{member.name.charAt(0)}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5 className="text-white font-medium text-sm truncate">{member.name}</h5>
                                      <p className="text-gray-400 text-xs truncate">{member.jobTitle}</p>
                                      <p className="text-gray-500 text-xs truncate">{member.email}</p>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)} flex-shrink-0`}>
                                    {normalizeStatus(member.status)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          )}
                        </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Specific Project: Project Team Details */}
          {selectedProjectId && (
            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <FolderKanban className="w-5 h-5 mr-2 text-teal-400" />
                  Project Team
                </h3>
                <span className="text-sm text-gray-400">
                  {filteredTeamMembers.length} member{filteredTeamMembers.length !== 1 ? 's' : ''}
                </span>
              </div>

              {projectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                  <span className="ml-3 text-gray-400">Loading team...</span>
                </div>
              ) : filteredTeamMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No team members found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTeamMembers.map((member) => (
                    <div key={member.id} className="bg-slate-800/60 rounded-xl p-4 hover:bg-slate-800/80 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-teal-400">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-white font-medium text-sm truncate">{member.name}</h5>
                            <p className="text-gray-400 text-xs truncate">{member.jobTitle}</p>
                            <p className="text-gray-500 text-xs truncate">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {member.projectRole && (
                            <span className="px-2 py-1 text-xs rounded-full bg-teal-500/20 text-teal-300">
                              {member.projectRole}{member.allocation ? ` · ${member.allocation}%` : ''}
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                            {normalizeStatus(member.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default MyTeam;