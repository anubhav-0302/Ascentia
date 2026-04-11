import React, { useMemo } from 'react';
import { StandardLayout } from './StandardLayout';
import { useFilters } from '../contexts/FilterContext';
import Filter from './Filter';
import { Users, UserPlus, TrendingUp, Award, Calendar, Target, Star } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';

const MyTeam: React.FC = () => {
  const { filters } = useFilters();

  const teamStats = [
    {
      title: 'Team Members',
      value: '12',
      change: '+2 this month',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Performance Score',
      value: '8.7',
      change: '+0.3',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Projects Active',
      value: '6',
      change: 'On track',
      icon: Target,
      color: 'text-purple-400'
    },
    {
      title: 'Avg. Satisfaction',
      value: '92%',
      change: '+5%',
      icon: Award,
      color: 'text-yellow-400'
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Senior Frontend Developer',
      performance: 9.2,
      status: 'Active',
      avatar: 'SC',
      projects: 3,
      joinDate: 'Jan 2023'
    },
    {
      id: 2,
      name: 'Michael Brown',
      role: 'Engineering Manager',
      performance: 8.8,
      status: 'Active',
      avatar: 'MB',
      projects: 2,
      joinDate: 'Mar 2022'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      role: 'Frontend Developer',
      performance: 8.5,
      status: 'Active',
      avatar: 'EW',
      projects: 4,
      joinDate: 'Jun 2023'
    },
    {
      id: 4,
      name: 'David Lee',
      role: 'UX Designer',
      performance: 9.0,
      status: 'On Leave',
      avatar: 'DL',
      projects: 2,
      joinDate: 'Feb 2023'
    }
  ];

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

  const getPerformanceColor = (score: number) => {
    if (score >= 9) return 'text-green-400 bg-green-400/10';
    if (score >= 8) return 'text-blue-400 bg-blue-400/10';
    return 'text-yellow-400 bg-yellow-400/10';
  };

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
        member.role.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || filters.status === 'all' ||
        member.status.toLowerCase() === filters.status.toLowerCase();

      const matchesDepartment = !filters.department || filters.department === 'all'; // No department data in team members

      const matchesLocation = !filters.location || filters.location === 'all'; // No location data in team members

      const matchesEmploymentType = !filters.employmentType || filters.employmentType === 'all'; // No employment type data in team members

      return matchesSearch && matchesStatus && matchesDepartment && matchesLocation && matchesEmploymentType;
    }).sort((a, b) => {
      const { sortBy } = filters;
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'department':
          return 0; // No department data
        case 'date':
          return 0; // No date data
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [teamMembers, filters]);

  return (
    <PageTransition>
      <StandardLayout 
        title="My Team"
        description="Manage your team members and performance"
      >
        <FadeIn delay={100}>
          {/* Filter Component */}
          <Filter
            showDepartment={false}
            showStatus={true}
            showEmploymentType={false}
            showLocation={false}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Members */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Team Members {filteredTeamMembers.length !== teamMembers.length && `(${filteredTeamMembers.length}/${teamMembers.length})`}
                  </h3>
                  <button className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </button>
                </div>
                <div className="space-y-4">
                  {filteredTeamMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No team members found matching your filters.</p>
                    </div>
                  ) : (
                    filteredTeamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-teal-400">{member.avatar}</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{member.name}</h4>
                            <p className="text-gray-400 text-sm">{member.role}</p>
                            <p className="text-gray-500 text-xs">Joined {member.joinDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Performance</p>
                            <p className={`text-sm font-medium ${getPerformanceColor(member.performance).split(' ')[0]}`}>
                              {member.performance}/10
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Projects</p>
                            <p className="text-sm font-medium text-white">{member.projects}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
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