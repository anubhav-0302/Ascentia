import React from 'react';
import { StandardLayout } from './StandardLayout';
import { Users, UserPlus, Briefcase, TrendingUp, Calendar, Filter, Search, Star } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';

const Recruiting: React.FC = () => {
  const recruitingStats = [
    {
      title: 'Active Job Postings',
      value: '6',
      change: '+1 this week',
      icon: Briefcase,
      color: 'text-blue-400'
    },
    {
      title: 'Total Applicants',
      value: '89',
      change: '+15',
      icon: Users,
      color: 'text-green-400'
    },
    {
      title: 'Interviews Scheduled',
      value: '12',
      change: 'This week',
      icon: Calendar,
      color: 'text-purple-400'
    },
    {
      title: 'Time to Hire',
      value: '18 days',
      change: '-3 days',
      icon: TrendingUp,
      color: 'text-yellow-400'
    }
  ];

  const openPositions = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      applicants: 24,
      status: 'Active',
      posted: '3 days ago',
      priority: 'High'
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'New York',
      type: 'Full-time',
      applicants: 18,
      status: 'Active',
      posted: '1 week ago',
      priority: 'Medium'
    },
    {
      id: 3,
      title: 'UX Designer',
      department: 'Design',
      location: 'San Francisco',
      type: 'Full-time',
      applicants: 31,
      status: 'Active',
      posted: '5 days ago',
      priority: 'High'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      applicants: 15,
      status: 'Review',
      posted: '2 weeks ago',
      priority: 'Medium'
    }
  ];

  const recentCandidates = [
    {
      id: 1,
      name: 'Alex Thompson',
      position: 'Senior Frontend Developer',
      stage: 'Technical Interview',
      rating: 4.5,
      applied: '2 days ago',
      avatar: 'AT'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      position: 'Product Manager',
      stage: 'Final Round',
      rating: 4.8,
      applied: '1 week ago',
      avatar: 'MG'
    },
    {
      id: 3,
      name: 'James Chen',
      position: 'UX Designer',
      stage: 'Portfolio Review',
      rating: 4.2,
      applied: '3 days ago',
      avatar: 'JC'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'Low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-400/10';
      case 'Review': return 'text-yellow-400 bg-yellow-400/10';
      case 'Closed': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Applied': return 'text-blue-400';
      case 'Screening': return 'text-purple-400';
      case 'Technical Interview': return 'text-yellow-400';
      case 'Final Round': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <PageTransition>
      <StandardLayout 
        title="Recruiting"
        description="Manage job postings and candidate pipeline"
      >
        <FadeIn delay={100}>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {recruitingStats.map((stat, index) => (
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
            {/* Open Positions */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                    Open Positions
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center">
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </button>
                    <button className="px-3 py-1 text-sm bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors flex items-center">
                      <UserPlus className="w-3 h-3 mr-1" />
                      New Position
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {openPositions.map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-medium">{position.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(position.priority)}`}>
                            {position.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(position.status)}`}>
                            {position.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{position.department}</span>
                          <span>•</span>
                          <span>{position.location}</span>
                          <span>•</span>
                          <span>{position.type}</span>
                          <span>•</span>
                          <span>{position.posted}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Applicants</p>
                          <p className="text-lg font-bold text-white">{position.applicants}</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recent Candidates */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  Recent Candidates
                </h3>
                <div className="space-y-4">
                  {recentCandidates.map((candidate) => (
                    <div key={candidate.id} className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-teal-400">{candidate.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{candidate.name}</h4>
                          <p className="text-gray-400 text-sm">{candidate.position}</p>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-white">{candidate.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`text-${getStageColor(candidate.stage).split('-')[1]}-400`}>
                          {candidate.stage}
                        </span>
                        <span className="text-gray-500">{candidate.applied}</span>
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

export default Recruiting;