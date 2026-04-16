import React, { useMemo, useEffect } from 'react';
import { StandardLayout } from './StandardLayout';
import { useFilters } from '../contexts/FilterContext';
import Filter from './Filter';
import { Users, UserPlus, TrendingUp, Award, Calendar, Target, Star } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { PageTransition, FadeIn } from './PageTransition';
import { useEmployeeStore } from '../store/useEmployeeStore';

const MyTeam: React.FC = () => {
  const { filters } = useFilters();
  const { employees, fetchEmployees } = useEmployeeStore();

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const teamStats = useMemo(() => [
    { title: 'Team Members', value: String(employees.length), change: 'Total employees', icon: Users, color: 'text-blue-400' },
    { title: 'Active', value: String(employees.filter(e => e.status === 'Active').length), change: 'Currently active', icon: TrendingUp, color: 'text-green-400' },
    { title: 'Remote', value: String(employees.filter(e => e.status === 'Remote').length), change: 'Working remotely', icon: Target, color: 'text-purple-400' },
    { title: 'Departments', value: String(new Set(employees.map(e => e.department).filter(Boolean)).size), change: 'Active departments', icon: Award, color: 'text-yellow-400' }
  ], [employees]);

  const teamMembers = employees;

  const upcomingEvents = [
    {
      title: 'Team Standup',
      date: 'Today, 10:00 AM',
      type: 'meeting'
    },
    {
      title: 'Performance Review - Sarah',
      date: 'Tomorrow, 2:00 PM',
      type: 'review'
    },
    {
      title: 'Sprint Planning',
      date: 'Friday, 11:00 AM',
      type: 'planning'
    },
    {
      title: 'Team Building Event',
      date: 'Next Monday, 3:00 PM',
      type: 'event'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-400/10';
      case 'On Leave': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
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
                const topLevel = filteredTeamMembers.filter(member => !member.managerId);
                
                if (topLevel.length > 0) {
                  hierarchy['Unassigned (No Manager)'] = topLevel;
                }

                return Object.keys(hierarchy).length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No hierarchy structure available</p>
                    <p className="text-gray-500 text-sm mt-2">Assign managers to employees to see the team structure</p>
                  </div>
                ) : (
                  Object.entries(hierarchy).map(([managerName, members]) => (
                    <div key={managerName} className="space-y-3">
                      <div className="flex items-center space-x-3 pb-2 border-b border-slate-700/50">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{managerName}</h4>
                          <p className="text-gray-400 text-xs">{members.length} direct {members.length === 1 ? 'report' : 'reports'}</p>
                        </div>
                      </div>
                      
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
                                {member.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                );
              })()}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Members */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Team Members {filteredTeamMembers.length !== teamMembers.length && `(${filteredTeamMembers.length}/${teamMembers.length})`}
                  </h3>
                  <Button
                    icon={<UserPlus className="w-4 h-4" />}
                    size="sm"
                  >
                    Add Member
                  </Button>
                </div>
                
                {/* Department Groups */}
                <div className="space-y-6">
                  {Object.keys(employeesByDepartment).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No team members found matching your filters.</p>
                    </div>
                  ) : (
                    Object.entries(employeesByDepartment).map(([department, members]) => (
                      <div key={department} className="space-y-3">
                        {/* Department Header */}
                        <div className="flex items-center space-x-2 pb-2 border-b border-slate-700/50">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <h4 className="text-white font-medium">{department}</h4>
                          <span className="text-xs text-gray-500 bg-slate-700/50 px-2 py-1 rounded-full">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                        
                        {/* Employee Cards */}
                        <div className="grid grid-cols-1 gap-3">
                          {members.map((member) => (
                            <div key={member.id} className="bg-slate-800/60 rounded-xl p-4 hover:bg-slate-800/80 transition-all duration-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {/* Avatar */}
                                  <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-teal-400">{member.name.charAt(0)}</span>
                                  </div>
                                  
                                  {/* Employee Info */}
                                  <div className="min-w-0 flex-1">
                                    <h5 className="text-white font-medium text-sm truncate">{member.name}</h5>
                                    <p className="text-gray-400 text-xs truncate">{member.jobTitle}</p>
                                    <p className="text-gray-500 text-xs truncate">{member.email}</p>
                                  </div>
                                </div>
                                
                                {/* Status Badge */}
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)} flex-shrink-0`}>
                                  {member.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Upcoming Events */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          event.type === 'meeting' ? 'bg-blue-500/20' :
                          event.type === 'review' ? 'bg-green-500/20' :
                          event.type === 'planning' ? 'bg-purple-500/20' :
                          'bg-yellow-500/20'
                        }`}>
                          {event.type === 'meeting' && <Users className="w-4 h-4 text-blue-400" />}
                          {event.type === 'review' && <Star className="w-4 h-4 text-green-400" />}
                          {event.type === 'planning' && <Target className="w-4 h-4 text-purple-400" />}
                          {event.type === 'event' && <Award className="w-4 h-4 text-yellow-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{event.title}</p>
                          <p className="text-gray-400 text-xs">{event.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default MyTeam;