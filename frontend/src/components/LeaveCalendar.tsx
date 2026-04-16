import React, { useState, useMemo, useCallback } from 'react';
import { getAllLeaves, type LeaveRequest } from '../api/leaveApi';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface LeaveCalendarProps {
  className?: string;
  onDateSelect?: (startDate: string, endDate: string) => void;
  onClear?: () => void;
}

const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ className = '', onDateSelect, onClear }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredLeave, setHoveredLeave] = useState<LeaveRequest | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Fetch leaves for the current month
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllLeaves();
      setLeaves(response.data || []);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch leaves only on component mount
  React.useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Memoize calendar calculations
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const startDay = firstDay.getDay();
    
    // Create calendar days array
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Group leaves by date for quick lookup
    const leavesByDate = new Map<string, LeaveRequest[]>();
    
    leaves.forEach(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      
      // Iterate through each day of the leave period
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        if (!leavesByDate.has(dateStr)) {
          leavesByDate.set(dateStr, []);
        }
        leavesByDate.get(dateStr)!.push(leave);
      }
    });
    
    return {
      year,
      month,
      days,
      daysInMonth,
      startDay,
      leavesByDate,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [currentDate, leaves]);

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  }, []);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get leaves for a specific day
  const getLeavesForDay = useCallback((day: number | null) => {
    if (!day) return [];
    
    const dateStr = `${calendarData.year}-${String(calendarData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData.leavesByDate.get(dateStr) || [];
  }, [calendarData]);

  // Handle date click for leave selection
  const handleDateClick = useCallback((day: number | null) => {
    if (!day || !onDateSelect) return;

    const clickedDate = new Date(calendarData.year, calendarData.month, day);
    
    if (!isSelecting) {
      // Start selection
      setSelectedStartDate(clickedDate);
      setSelectedEndDate(clickedDate);
      setIsSelecting(true);
    } else {
      // Complete selection
      if (clickedDate < (selectedStartDate || clickedDate)) {
        // If clicked date is before start date, swap them
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(clickedDate);
      } else {
        setSelectedEndDate(clickedDate);
      }
      
      // Format dates as YYYY-MM-DD for the form
      const startDateStr = selectedStartDate?.toISOString().split('T')[0] || clickedDate.toISOString().split('T')[0];
      const endDateStr = clickedDate.toISOString().split('T')[0];
      
      // Call the callback to update the form
      onDateSelect(startDateStr, endDateStr);
      
      // Reset selection state
      setIsSelecting(false);
    }
  }, [calendarData.year, calendarData.month, isSelecting, selectedStartDate, onDateSelect]);

  // Check if a date is in the selected range
  const isDateInSelectedRange = useCallback((day: number | null) => {
    if (!day || !selectedStartDate || !selectedEndDate) return false;
    
    const checkDate = new Date(calendarData.year, calendarData.month, day);
    return checkDate >= selectedStartDate && checkDate <= selectedEndDate;
  }, [calendarData.year, calendarData.month, selectedStartDate, selectedEndDate]);

  // Reset selection
  const resetSelection = useCallback(() => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsSelecting(false);
    onClear?.();
  }, [onClear]);

  // Weekday names
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className={`bg-slate-800/60 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/60 rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-teal-400" />
            Leave Calendar
          </h3>
          {isSelecting && (
            <div className="text-xs text-teal-400 bg-teal-400/10 px-2 py-1 rounded">
              Selecting range...
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-white font-medium min-w-[120px] text-sm text-center">
            {calendarData.monthName}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-700/30 rounded-lg overflow-hidden">
        {/* Weekday headers */}
        {weekdays.map(day => (
          <div key={day} className="bg-slate-700/50 p-2 text-center">
            <span className="text-xs font-medium text-gray-400">{day}</span>
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarData.days.map((day, index) => {
          const dayLeaves = getLeavesForDay(day);
          const isToday = day === new Date().getDate() && 
                          calendarData.month === new Date().getMonth() && 
                          calendarData.year === new Date().getFullYear();
          const isSelected = isDateInSelectedRange(day);
          const isSelectable = day && onDateSelect;
          
          return (
            <div
              key={index}
              className={`
                bg-slate-800/40 min-h-[60px] p-1 relative
                ${day ? (isSelectable ? 'hover:bg-slate-700/30 cursor-pointer' : 'hover:bg-slate-700/30') : ''}
                ${isToday ? 'ring-1 ring-teal-500/50' : ''}
                ${isSelected ? 'bg-teal-500/20 ring-1 ring-teal-500/50' : ''}
                transition-colors
              `}
              onClick={() => handleDateClick(day)}
            >
              {day && (
                <>
                  {/* Day number */}
                  <div className={`text-xs font-medium mb-1 ${
                    isToday ? 'text-teal-400' : isSelected ? 'text-teal-300' : 'text-gray-300'
                  }`}>
                    {day}
                  </div>
                  
                  {/* Leave badges */}
                  <div className="space-y-0.5">
                    {dayLeaves.slice(0, 2).map((leave) => (
                      <div
                        key={leave.id}
                        className={`
                          relative group
                          text-xs px-1 py-0.5 rounded border truncate cursor-pointer
                          ${getStatusColor(leave.status)}
                        `}
                        onMouseEnter={() => setHoveredLeave(leave)}
                        onMouseLeave={() => setHoveredLeave(null)}
                      >
                        {leave.user?.name || 'Unknown'}
                        
                        {/* Hover tooltip */}
                        {hoveredLeave?.id === leave.id && (
                          <div className="absolute z-50 bottom-full left-0 mb-2 w-48 p-3 bg-slate-900/95 backdrop-blur-lg border border-slate-700/50 rounded-lg shadow-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-white text-sm">
                                {leave.user?.name || 'Unknown'}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(leave.status)}`}>
                                {leave.status}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="text-gray-300">
                                <i className="fas fa-calendar-alt mr-1"></i>
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </div>
                              <div className="text-gray-400">
                                <i className="fas fa-tag mr-1"></i>
                                {leave.type}
                              </div>
                              <div className="text-gray-500 truncate">
                                <i className="fas fa-comment mr-1"></i>
                                {leave.reason}
                              </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95"></div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Show "more" indicator if there are more leaves */}
                    {dayLeaves.length > 2 && (
                      <div className="text-xs text-gray-500 italic">
                        +{dayLeaves.length - 2}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend and Actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded bg-green-500/20 border border-green-500/30"></div>
            <span className="text-gray-400">Approved</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
            <span className="text-gray-400">Pending</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded bg-red-500/20 border border-red-500/30"></div>
            <span className="text-gray-400">Rejected</span>
          </div>
        </div>
        
        {(isSelecting || selectedStartDate || selectedEndDate) && (
          <button
            onClick={resetSelection}
            className="px-3 py-1 text-xs bg-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white rounded transition-colors border border-slate-600/50"
          >
            {isSelecting ? 'Cancel Selection' : 'Clear Selection'}
          </button>
        )}
      </div>
    </div>
  );
};

export default LeaveCalendar;
