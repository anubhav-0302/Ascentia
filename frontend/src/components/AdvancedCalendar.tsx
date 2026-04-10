import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import LayoutWrapper from './LayoutWrapper';

interface LeaveEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity';
  startDate: Date;
  endDate: Date;
  status: 'approved' | 'pending' | 'rejected';
  reason?: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  department: string;
}

const AdvancedCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'timeline'>('month');
  const [leaveEvents, setLeaveEvents] = useState<LeaveEvent[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    type: 'all'
  });

  // Mock data
  const mockLeaveEvents: LeaveEvent[] = [
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Sarah Chen',
      employeeAvatar: 'https://picsum.photos/seed/sarah/32/32.jpg',
      type: 'vacation',
      startDate: new Date(2024, 11, 25), // Dec 25, 2024
      endDate: new Date(2024, 11, 30), // Dec 30, 2024
      status: 'approved',
      reason: 'Family vacation'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Michael Brown',
      employeeAvatar: 'https://picsum.photos/seed/michael/32/32.jpg',
      type: 'sick',
      startDate: new Date(2024, 11, 15), // Dec 15, 2024
      endDate: new Date(2024, 11, 16), // Dec 16, 2024
      status: 'approved',
      reason: 'Medical appointment'
    },
    {
      id: '3',
      employeeId: '3',
      employeeName: 'Emma Wilson',
      employeeAvatar: 'https://picsum.photos/seed/emma/32/32.jpg',
      type: 'personal',
      startDate: new Date(2024, 11, 10), // Dec 10, 2024
      endDate: new Date(2024, 11, 12), // Dec 12, 2024
      status: 'pending',
      reason: 'Personal matters'
    },
    {
      id: '4',
      employeeId: '4',
      employeeName: 'Alex Johnson',
      employeeAvatar: 'https://picsum.photos/seed/alex/32/32.jpg',
      type: 'vacation',
      startDate: new Date(2024, 11, 5), // Dec 5, 2024
      endDate: new Date(2024, 11, 7), // Dec 7, 2024
      status: 'approved',
      reason: 'Holiday trip'
    },
    {
      id: '5',
      employeeId: '5',
      employeeName: 'Lisa Anderson',
      employeeAvatar: 'https://picsum.photos/seed/lisa/32/32.jpg',
      type: 'maternity',
      startDate: new Date(2024, 10, 1), // Nov 1, 2024
      endDate: new Date(2025, 0, 31), // Jan 31, 2025
      status: 'approved',
      reason: 'Maternity leave'
    }
  ];

  const mockTeamMembers: TeamMember[] = [
    { id: '1', name: 'Sarah Chen', avatar: 'https://picsum.photos/seed/sarah/32/32.jpg', department: 'Engineering' },
    { id: '2', name: 'Michael Brown', avatar: 'https://picsum.photos/seed/michael/32/32.jpg', department: 'Engineering' },
    { id: '3', name: 'Emma Wilson', avatar: 'https://picsum.photos/seed/emma/32/32.jpg', department: 'Engineering' },
    { id: '4', name: 'Alex Johnson', avatar: 'https://picsum.photos/seed/alex/32/32.jpg', department: 'Marketing' },
    { id: '5', name: 'Lisa Anderson', avatar: 'https://picsum.photos/seed/lisa/32/32.jpg', department: 'HR' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeaveEvents(mockLeaveEvents);
      setTeamMembers(mockTeamMembers);
      setLoading(false);
    }, 1000);
  }, []);

  const getLeaveTypeColor = (type: LeaveEvent['type']) => {
    const colors = {
      vacation: 'bg-blue-500',
      sick: 'bg-red-500',
      personal: 'bg-yellow-500',
      maternity: 'bg-purple-500'
    };
    return colors[type];
  };

  const getLeaveTypeIcon = (type: LeaveEvent['type']) => {
    const icons = {
      vacation: 'fas fa-umbrella-beach',
      sick: 'fas fa-medkit',
      personal: 'fas fa-user',
      maternity: 'fas fa-baby'
    };
    return icons[type];
  };

  const getStatusColor = (status: LeaveEvent['status']) => {
    const colors = {
      approved: 'text-green-400',
      pending: 'text-yellow-400',
      rejected: 'text-red-400'
    };
    return colors[status];
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date: Date) => {
    return leaveEvents.filter(event => 
      date >= event.startDate && date <= event.endDate
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const filteredEvents = leaveEvents.filter(event => {
    if (filters.department !== 'all' && !teamMembers.find(m => m.id === event.employeeId)?.department.includes(filters.department)) {
      return false;
    }
    if (filters.status !== 'all' && event.status !== filters.status) {
      return false;
    }
    if (filters.type !== 'all' && event.type !== filters.type) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-48 bg-slate-700 rounded-lg mb-2 animate-pulse"></div>
          <div className="h-4 w-64 bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
          <div className="h-96 bg-slate-700/30 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <LayoutWrapper className="page-transition">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Calendar</h1>
          <p className="text-gray-400">Visualize team leave schedules and manage time off</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 button-interactive">
            <i className="fas fa-plus mr-2"></i>
            Request Leave
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === 'month'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-600'
              }`}
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              Month View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === 'timeline'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-600'
              }`}
            >
              <i className="fas fa-stream mr-2"></i>
              Timeline
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="vacation">Vacation</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
              <option value="maternity">Maternity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' && (
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <h2 className="text-xl font-semibold text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-700/30 rounded-lg overflow-hidden">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-700/50 p-3 text-center">
                <span className="text-xs font-medium text-gray-400">{day}</span>
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth().map((date, index) => {
              const events = getEventsForDate(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`bg-slate-800/50 p-2 min-h-[80px] cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
                    isSelected ? 'ring-2 ring-teal-500' : ''
                  } ${isToday ? 'bg-teal-500/10' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-teal-400' : 'text-gray-300'
                  }`}>
                    {format(date, 'd')}
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {events.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`px-1 py-0.5 rounded text-xs text-white ${getLeaveTypeColor(event.type)} opacity-80`}
                        title={`${event.employeeName} - ${event.type}`}
                      >
                        <div className="truncate">{event.employeeName}</div>
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{events.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold text-white mb-6">Team Leave Timeline</h2>
          
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200"
              >
                {/* Employee Avatar */}
                <img
                  src={event.employeeAvatar}
                  alt={event.employeeName}
                  className="w-10 h-10 rounded-full border-2 border-slate-600"
                />

                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-medium">{event.employeeName}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${getLeaveTypeColor(event.type)} text-white`}>
                      <i className={`${getLeaveTypeIcon(event.type)} mr-1`}></i>
                      {event.type}
                    </span>
                    <span className={`text-xs ${getStatusColor(event.status)}`}>
                      <i className="fas fa-circle mr-1" style={{ fontSize: '6px' }}></i>
                      {event.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>
                      <i className="fas fa-calendar mr-1"></i>
                      {format(event.startDate, 'MMM d')} - {format(event.endDate, 'MMM d, yyyy')}
                    </span>
                    <span>
                      <i className="fas fa-clock mr-1"></i>
                      {Math.ceil((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </span>
                  </div>
                  
                  {event.reason && (
                    <p className="text-sm text-gray-500 mt-1">{event.reason}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-600/50 rounded transition-all duration-200">
                    <i className="fas fa-eye text-sm"></i>
                  </button>
                  {event.status === 'pending' && (
                    <>
                      <button className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded transition-all duration-200">
                        <i className="fas fa-check text-sm"></i>
                      </button>
                      <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all duration-200">
                        <i className="fas fa-times text-sm"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-calendar-times text-gray-500 text-4xl mb-4"></i>
              <p className="text-gray-400">No leave events found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Date Details */}
      {selectedDate && viewMode === 'month' && (
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 mt-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-white mb-4">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          
          <div className="space-y-3">
            {getEventsForDate(selectedDate).map(event => (
              <div
                key={event.id}
                className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg"
              >
                <img
                  src={event.employeeAvatar}
                  alt={event.employeeName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-white font-medium">{event.employeeName}</p>
                  <p className="text-gray-400 text-sm">{event.type} • {event.status}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getLeaveTypeColor(event.type)} text-white`}>
                  {event.type}
                </span>
              </div>
            ))}
            
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-gray-500 text-center py-4">No events on this date</p>
            )}
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
};

export default AdvancedCalendar;
