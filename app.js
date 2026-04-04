// Import components
class StatCard {
    constructor(title, value, changeText, changeType = 'positive', icon = 'fas fa-chart-line', iconColor = 'text-teal-400') {
        this.title = title;
        this.value = value;
        this.changeText = changeText;
        this.changeType = changeType; // 'positive' or 'negative'
        this.icon = icon;
        this.iconColor = iconColor;
    }

    render() {
        const changeColorClass = this.changeType === 'positive' ? 'text-green-400' : 'text-red-400';
        const changeIcon = this.changeType === 'positive' ? 'fa-arrow-up' : 'fa-arrow-down';
        
        return `
            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 hover:bg-slate-800/60 group">
                <div class="flex items-center justify-between mb-4">
                    <i class="${this.icon} text-2xl ${this.iconColor} group-hover:scale-110 transition-transform duration-300"></i>
                    <div class="flex items-center space-x-1">
                        <i class="fas ${changeIcon} text-xs ${changeColorClass}"></i>
                        <span class="text-sm ${changeColorClass} font-medium">${this.changeText}</span>
                    </div>
                </div>
                <h3 class="text-3xl font-bold text-white mb-1 group-hover:text-teal-100 transition-colors duration-300">${this.value}</h3>
                <p class="text-gray-400 text-sm">${this.title}</p>
            </div>
        `;
    }
}
class Sidebar {
    render() {
        return `
            <div class="w-64 bg-gradient-to-b from-teal-600 to-black h-screen fixed left-0 top-0 flex flex-col border-r border-slate-700/50 backdrop-blur-sm">
                <!-- Logo -->
                <div class="p-6 border-b border-slate-700/50 backdrop-blur-sm">
                    <h1 class="text-2xl font-bold text-white">Ascentia</h1>
                </div>
                
                <!-- Navigation Menu -->
                <nav class="flex-1 p-4">
                    <ul class="space-y-2">
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('command-center')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
                                <i class="fas fa-tachometer-alt w-5 mr-3"></i>
                                <span>Command Center</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('my-team')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
                                <i class="fas fa-users w-5 mr-3"></i>
                                <span>My Team</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('directory')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
                                <i class="fas fa-address-book w-5 mr-3"></i>
                                <span>Directory</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('leave')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
                                <i class="fas fa-calendar-alt w-5 mr-3"></i>
                                <span>Leave & Attendance</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('payroll')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
                                <i class="fas fa-money-bill-wave w-5 mr-3"></i>
                                <span>Payroll & Benefits</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('recruiting')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
                                <i class="fas fa-user-tie w-5 mr-3"></i>
                                <span>Recruiting</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('reports')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
                                <i class="fas fa-chart-bar w-5 mr-3"></i>
                                <span>Reports</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `;
    }
}

class Header {
    render() {
        return `
            <header class="h-16 bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 fixed top-0 left-64 right-0 flex items-center justify-between px-6 z-10 shadow-lg shadow-black/20">
                <!-- Search Bar -->
                <div class="flex-1 max-w-xl">
                    <div class="relative">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            class="w-full bg-slate-700/60 backdrop-blur-sm text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700/80 transition-all duration-300 border border-slate-600/50"
                        >
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
                
                <!-- Right Side Actions -->
                <div class="flex items-center space-x-4">
                    <!-- Notifications -->
                    <button class="relative p-2 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
                        <i class="fas fa-bell text-gray-300 hover:text-white"></i>
                        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    
                    <!-- User Avatar -->
                    <div class="flex items-center space-x-3">
                        <img 
                            src="https://picsum.photos/seed/user-avatar/40/40.jpg" 
                            alt="User Avatar" 
                            class="w-10 h-10 rounded-full border-2 border-teal-500/30 shadow-lg shadow-teal-500/20"
                        >
                        <div class="hidden md:block">
                            <p class="text-sm font-medium text-white">John Doe</p>
                            <p class="text-xs text-gray-400">Administrator</p>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }
}

class Directory {
    constructor() {
        this.employees = [
            {
                id: 1,
                name: 'Sarah Johnson',
                email: 'sarah.johnson@ascentia.com',
                avatar: 'https://picsum.photos/seed/sarah/40/40.jpg',
                jobTitle: 'Senior Developer',
                department: 'Engineering',
                location: 'San Francisco',
                status: 'Active'
            },
            {
                id: 2,
                name: 'Michael Chen',
                email: 'michael.chen@ascentia.com',
                avatar: 'https://picsum.photos/seed/michael/40/40.jpg',
                jobTitle: 'Product Manager',
                department: 'Product',
                location: 'New York',
                status: 'Active'
            },
            {
                id: 3,
                name: 'Emily Davis',
                email: 'emily.davis@ascentia.com',
                avatar: 'https://picsum.photos/seed/emily/40/40.jpg',
                jobTitle: 'UX Designer',
                department: 'Design',
                location: 'Remote',
                status: 'Remote'
            },
            {
                id: 4,
                name: 'James Wilson',
                email: 'james.wilson@ascentia.com',
                avatar: 'https://picsum.photos/seed/james/40/40.jpg',
                jobTitle: 'Marketing Manager',
                department: 'Marketing',
                location: 'Chicago',
                status: 'Active'
            },
            {
                id: 5,
                name: 'Lisa Anderson',
                email: 'lisa.anderson@ascentia.com',
                avatar: 'https://picsum.photos/seed/lisa/40/40.jpg',
                jobTitle: 'HR Specialist',
                department: 'Human Resources',
                location: 'Boston',
                status: 'Onboarding'
            },
            {
                id: 6,
                name: 'David Martinez',
                email: 'david.martinez@ascentia.com',
                avatar: 'https://picsum.photos/seed/david/40/40.jpg',
                jobTitle: 'Sales Director',
                department: 'Sales',
                location: 'Los Angeles',
                status: 'Active'
            },
            {
                id: 7,
                name: 'Jennifer Taylor',
                email: 'jennifer.taylor@ascentia.com',
                avatar: 'https://picsum.photos/seed/jennifer/40/40.jpg',
                jobTitle: 'Data Analyst',
                department: 'Analytics',
                location: 'Remote',
                status: 'Remote'
            },
            {
                id: 8,
                name: 'Robert Brown',
                email: 'robert.brown@ascentia.com',
                avatar: 'https://picsum.photos/seed/robert/40/40.jpg',
                jobTitle: 'DevOps Engineer',
                department: 'Engineering',
                location: 'Seattle',
                status: 'Active'
            },
            {
                id: 9,
                name: 'Amanda Garcia',
                email: 'amanda.garcia@ascentia.com',
                avatar: 'https://picsum.photos/seed/amanda/40/40.jpg',
                jobTitle: 'Content Writer',
                department: 'Marketing',
                location: 'Austin',
                status: 'Onboarding'
            },
            {
                id: 10,
                name: 'Christopher Lee',
                email: 'chris.lee@ascentia.com',
                avatar: 'https://picsum.photos/seed/chris/40/40.jpg',
                jobTitle: 'Finance Manager',
                department: 'Finance',
                location: 'Miami',
                status: 'Active'
            }
        ];
    }

    getStatusBadge(status) {
        const statusConfig = {
            'Active': {
                class: 'bg-green-400/20 text-green-400 border-green-400/30',
                dot: 'bg-green-400'
            },
            'Onboarding': {
                class: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
                dot: 'bg-yellow-400'
            },
            'Remote': {
                class: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
                dot: 'bg-blue-400'
            }
        };

        const config = statusConfig[status] || statusConfig['Active'];
        
        return `
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.class}">
                <span class="w-2 h-2 rounded-full ${config.dot} mr-2"></span>
                ${status}
            </span>
        `;
    }

    renderEmployeeRow(employee) {
        return `
            <div class="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 group">
                <div class="grid grid-cols-12 gap-4 items-center">
                    <!-- Employee Info -->
                    <div class="col-span-4 flex items-center space-x-3">
                        <img 
                            src="${employee.avatar}" 
                            alt="${employee.name}" 
                            class="w-10 h-10 rounded-full border-2 border-slate-600 group-hover:border-teal-500/50 transition-colors duration-300"
                        >
                        <div>
                            <p class="text-white font-medium">${employee.name}</p>
                            <p class="text-gray-400 text-sm">${employee.email}</p>
                        </div>
                    </div>
                    
                    <!-- Job Title -->
                    <div class="col-span-2">
                        <p class="text-gray-300">${employee.jobTitle}</p>
                    </div>
                    
                    <!-- Department -->
                    <div class="col-span-2">
                        <p class="text-gray-300">${employee.department}</p>
                    </div>
                    
                    <!-- Location -->
                    <div class="col-span-2">
                        <div class="flex items-center text-gray-300">
                            <i class="fas fa-map-marker-alt w-4 h-4 mr-2 text-gray-500"></i>
                            ${employee.location}
                        </div>
                    </div>
                    
                    <!-- Status -->
                    <div class="col-span-2">
                        ${this.getStatusBadge(employee.status)}
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        return `
            <main class="ml-64 mt-16 p-6 h-screen overflow-y-auto">
                <div class="max-w-7xl mx-auto">
                    <!-- Header -->
                    <div class="mb-8 flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-white mb-2">Directory</h1>
                            <p class="text-gray-400">Browse company directory and employee profiles</p>
                        </div>
                        <button onclick="app.navigate('dashboard')" class="px-4 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 flex items-center space-x-2">
                            <i class="fas fa-arrow-left"></i>
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                    
                    <!-- Main Content Grid -->
                    <div class="flex gap-6">
                        <!-- Left: Filter Panel -->
                        ${this.renderFilterPanel()}
                        
                        <!-- Right: Employee Table -->
                        <div class="flex-1">
                            <!-- Top Control Bar -->
                            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 mb-4">
                                <div class="flex items-center gap-4">
                                    <!-- Search Bar -->
                                    <div class="flex-1">
                                        <div class="relative">
                                            <input 
                                                type="text" 
                                                placeholder="Search employees by name, email, department..." 
                                                class="w-full bg-slate-700/60 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50"
                                            >
                                            <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                        </div>
                                    </div>
                                    
                                    <!-- Filter Buttons -->
                                    <div class="flex gap-3">
                                        <button class="px-4 py-3 bg-slate-700/60 text-white rounded-xl hover:bg-slate-700/80 transition-all duration-200 flex items-center space-x-2 border border-slate-600/50">
                                            <i class="fas fa-sliders-h"></i>
                                            <span>Complex Filters</span>
                                        </button>
                                        <button class="px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 flex items-center space-x-2">
                                            <i class="fas fa-plus"></i>
                                            <span>Add Filters</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Results Summary -->
                            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 mb-4">
                                <div class="flex items-center justify-between">
                                    <p class="text-gray-300">Showing <span class="text-white font-medium">${this.employees.length}</span> employees</p>
                                    <button class="text-teal-400 hover:text-teal-300 transition-colors duration-200">
                                        <i class="fas fa-download mr-2"></i>Export
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Table Header -->
                            <div class="bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30 mb-4">
                                <div class="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-400">
                                    <div class="col-span-4">Employee</div>
                                    <div class="col-span-2">Job Title</div>
                                    <div class="col-span-2">Department</div>
                                    <div class="col-span-2">Location</div>
                                    <div class="col-span-2">Status</div>
                                </div>
                            </div>
                            
                            <!-- Employee Rows -->
                            <div class="space-y-3">
                                ${this.employees.map(employee => this.renderEmployeeRow(employee)).join('')}
                            </div>
                            
                            <!-- Pagination -->
                            <div class="mt-6 flex items-center justify-between">
                                <p class="text-gray-400 text-sm">Showing 1-10 of ${this.employees.length} employees</p>
                                <div class="flex gap-2">
                                    <button class="px-3 py-1 bg-slate-700/60 text-gray-300 rounded-lg hover:bg-slate-700/80 transition-colors duration-200 disabled:opacity-50" disabled>
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <button class="px-3 py-1 bg-teal-600 text-white rounded-lg">1</button>
                                    <button class="px-3 py-1 bg-slate-700/60 text-gray-300 rounded-lg hover:bg-slate-700/80 transition-colors duration-200">2</button>
                                    <button class="px-3 py-1 bg-slate-700/60 text-gray-300 rounded-lg hover:bg-slate-700/80 transition-colors duration-200">
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        `;
    }
}

class CommandCenter {
    constructor() {
        this.statCards = [
            new StatCard('Active Projects', '42', '+8%', 'positive', 'fas fa-project-diagram', 'text-blue-400'),
            new StatCard('Team Members', '156', '+12%', 'positive', 'fas fa-users', 'text-teal-400'),
            new StatCard('This Month Budget', '$84.5K', '+5%', 'positive', 'fas fa-dollar-sign', 'text-green-400'),
            new StatCard('Pending Tasks', '28', '-15%', 'negative', 'fas fa-tasks', 'text-orange-400')
        ];
    }

    renderChartPlaceholder() {
        return `
            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-white">Company Resource Allocation</h3>
                    <button class="px-3 py-1 bg-teal-600/20 text-teal-400 rounded-lg hover:bg-teal-600/30 transition-colors duration-200 text-sm">
                        <i class="fas fa-expand-alt mr-1"></i> Expand
                    </button>
                </div>
                
                <!-- Chart Placeholder -->
                <div class="h-64 bg-slate-700/30 rounded-lg flex items-center justify-center border border-slate-600/50">
                    <div class="text-center">
                        <i class="fas fa-chart-pie text-4xl text-teal-400 mb-3"></i>
                        <p class="text-gray-400">Interactive Chart</p>
                        <p class="text-gray-500 text-sm mt-1">Resource distribution across departments</p>
                    </div>
                </div>
                
                <!-- Chart Legend -->
                <div class="grid grid-cols-2 gap-3 mt-4">
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-teal-400 rounded-full"></div>
                        <span class="text-sm text-gray-300">Engineering (35%)</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span class="text-sm text-gray-300">Sales (25%)</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-purple-400 rounded-full"></div>
                        <span class="text-sm text-gray-300">Marketing (20%)</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span class="text-sm text-gray-300">Operations (20%)</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderMilestones() {
        const milestones = [
            {
                title: 'Q4 Planning Complete',
                description: 'Annual strategy and budget allocation finalized',
                date: '2 days ago',
                type: 'success',
                icon: 'fas fa-check-circle'
            },
            {
                title: 'New Office Launch',
                description: 'Berlin office successfully opened with 15 new hires',
                date: '1 week ago',
                type: 'info',
                icon: 'fas fa-building'
            },
            {
                title: 'Product Release v2.5',
                description: 'Major platform update deployed to all clients',
                date: '2 weeks ago',
                type: 'success',
                icon: 'fas fa-rocket'
            },
            {
                title: 'Team Expansion',
                description: 'Engineering team grew by 25% this quarter',
                date: '3 weeks ago',
                type: 'achievement',
                icon: 'fas fa-trophy'
            },
            {
                title: 'Security Audit Passed',
                description: 'Annual security compliance audit completed successfully',
                date: '1 month ago',
                type: 'success',
                icon: 'fas fa-shield-alt'
            }
        ];

        const getTypeStyles = (type) => {
            const styles = {
                success: 'text-green-400 bg-green-400/10',
                info: 'text-blue-400 bg-blue-400/10',
                achievement: 'text-yellow-400 bg-yellow-400/10'
            };
            return styles[type] || styles.info;
        };

        return `
            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-white">Recent Milestones</h3>
                    <span class="px-2 py-1 bg-teal-600/20 text-teal-400 rounded text-xs">5 this month</span>
                </div>
                
                <div class="space-y-4">
                    ${milestones.map(milestone => `
                        <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors duration-200">
                            <div class="flex-shrink-0 w-8 h-8 rounded-lg ${getTypeStyles(milestone.type)} flex items-center justify-center">
                                <i class="${milestone.icon} text-sm"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-white font-medium text-sm">${milestone.title}</p>
                                <p class="text-gray-400 text-xs mt-1">${milestone.description}</p>
                                <p class="text-gray-500 text-xs mt-2">${milestone.date}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button class="w-full mt-4 py-2 bg-slate-700/40 text-gray-300 rounded-lg hover:bg-slate-700/60 transition-colors duration-200 text-sm">
                    View All Milestones
                </button>
            </div>
        `;
    }

    renderFilterPanel() {
        return `
            <div class="w-80 bg-slate-800/60 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-xl shadow-black/20 h-fit sticky top-24">
                <h3 class="text-lg font-bold text-white mb-6 flex items-center">
                    <i class="fas fa-filter mr-2 text-teal-400"></i>
                    Filters
                </h3>
                
                <!-- Search Input -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">Search</label>
                    <div class="relative">
                        <input 
                            type="text" 
                            placeholder="Search employees..." 
                            class="w-full bg-slate-700/60 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50"
                        >
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
                
                <!-- Department Dropdown -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">Department</label>
                    <select class="w-full bg-slate-700/60 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50">
                        <option value="">All Departments</option>
                        <option value="engineering">Engineering</option>
                        <option value="product">Product</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                        <option value="human-resources">Human Resources</option>
                        <option value="finance">Finance</option>
                        <option value="analytics">Analytics</option>
                    </select>
                </div>
                
                <!-- Location Dropdown -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <select class="w-full bg-slate-700/60 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50">
                        <option value="">All Locations</option>
                        <option value="san-francisco">San Francisco</option>
                        <option value="new-york">New York</option>
                        <option value="chicago">Chicago</option>
                        <option value="boston">Boston</option>
                        <option value="los-angeles">Los Angeles</option>
                        <option value="seattle">Seattle</option>
                        <option value="austin">Austin</option>
                        <option value="miami">Miami</option>
                        <option value="remote">Remote</option>
                    </select>
                </div>
                
                <!-- Skills Multi-Select -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                    <div class="space-y-2">
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2">
                            <span class="ml-3 text-sm text-gray-300">JavaScript</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2">
                            <span class="ml-3 text-sm text-gray-300">Python</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2">
                            <span class="ml-3 text-sm text-gray-300">React</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2">
                            <span class="ml-3 text-sm text-gray-300">UI/UX Design</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2">
                            <span class="ml-3 text-sm text-gray-300">Project Management</span>
                        </label>
                    </div>
                </div>
                
                <!-- Tags Section -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-2">Popular Tags</label>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 bg-teal-600/20 text-teal-400 rounded-full text-xs border border-teal-600/30 hover:bg-teal-600/30 transition-colors duration-200 cursor-pointer">Senior</span>
                        <span class="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs border border-blue-600/30 hover:bg-blue-600/30 transition-colors duration-200 cursor-pointer">Remote</span>
                        <span class="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs border border-purple-600/30 hover:bg-purple-600/30 transition-colors duration-200 cursor-pointer">Full-time</span>
                        <span class="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs border border-green-600/30 hover:bg-green-600/30 transition-colors duration-200 cursor-pointer">Team Lead</span>
                        <span class="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs border border-yellow-600/30 hover:bg-yellow-600/30 transition-colors duration-200 cursor-pointer">New Hire</span>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="space-y-2">
                    <button class="w-full py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200 font-medium">
                        Apply Filters
                    </button>
                    <button class="w-full py-2 bg-slate-700/60 text-gray-300 rounded-xl hover:bg-slate-700/80 transition-colors duration-200">
                        Clear All
                    </button>
                </div>
            </div>
        `;
    }

    render() {
        return `
            <main class="ml-64 mt-16 p-6 h-screen overflow-y-auto">
                <div class="max-w-7xl mx-auto">
                    <!-- Header -->
                    <div class="mb-8 flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-white mb-2">Command Center</h1>
                            <p class="text-gray-400">Overview of company resources and recent achievements</p>
                        </div>
                        <button onclick="app.navigate('dashboard')" class="px-4 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 flex items-center space-x-2">
                            <i class="fas fa-arrow-left"></i>
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                    
                    <!-- Stat Cards Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        ${this.statCards.map(card => card.render()).join('')}
                    </div>
                    
                    <!-- Main Content Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Chart Section (2 columns) -->
                        <div class="lg:col-span-2">
                            ${this.renderChartPlaceholder()}
                        </div>
                        
                        <!-- Milestones Section (1 column) -->
                        <div class="lg:col-span-1">
                            ${this.renderMilestones()}
                        </div>
                    </div>
                </div>
            </main>
        `;
    }
}

class MainLayout {
    constructor() {
        this.sidebar = new Sidebar();
        this.header = new Header();
        this.statCards = [
            new StatCard('Total Employees', '248', '+12%', 'positive', 'fas fa-users', 'text-teal-400'),
            new StatCard('Pending Approvals', '23', '+5%', 'positive', 'fas fa-clock', 'text-yellow-400'),
            new StatCard('New Hires', '12', '+8%', 'positive', 'fas fa-user-plus', 'text-green-400'),
            new StatCard('Open Positions', '7', '-15%', 'negative', 'fas fa-briefcase', 'text-purple-400')
        ];
    }

    render() {
        return `
            ${this.sidebar.render()}
            ${this.header.render()}
            
            <!-- Main Content Area -->
            <main class="ml-64 mt-16 p-6 h-screen overflow-y-auto">
                <div class="max-w-7xl mx-auto">
                    <!-- Welcome Section -->
                    <div class="mb-8">
                        <h2 class="text-3xl font-bold text-white mb-2">Welcome to Ascentia</h2>
                        <p class="text-gray-400">Your comprehensive HR management platform</p>
                        <button onclick="app.navigate('command-center')" class="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                            Test Navigation to Command Center
                        </button>
                    </div>
                    
                    <!-- Dashboard Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        ${this.statCards.map(card => card.render()).join('')}
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 hover:bg-slate-800/60">
                        <h3 class="text-xl font-bold text-white mb-4">Recent Activity</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-slate-700/40 backdrop-blur-sm rounded-xl border border-slate-600/50 hover:bg-slate-700/60 transition-all duration-300">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-user-plus text-green-400"></i>
                                    <div>
                                        <p class="text-white font-medium">New employee onboarded</p>
                                        <p class="text-gray-400 text-sm">Sarah Johnson - Developer</p>
                                    </div>
                                </div>
                                <span class="text-gray-400 text-sm">2 hours ago</span>
                            </div>
                            
                            <div class="flex items-center justify-between p-4 bg-slate-700/40 backdrop-blur-sm rounded-xl border border-slate-600/50 hover:bg-slate-700/60 transition-all duration-300">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-calendar-alt text-blue-400"></i>
                                    <div>
                                        <p class="text-white font-medium">Leave request approved</p>
                                        <p class="text-gray-400 text-sm">Mike Chen - Vacation</p>
                                    </div>
                                </div>
                                <span class="text-gray-400 text-sm">5 hours ago</span>
                            </div>
                            
                            <div class="flex items-center justify-between p-4 bg-slate-700/40 backdrop-blur-sm rounded-xl border border-slate-600/50 hover:bg-slate-700/60 transition-all duration-300">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-file-alt text-purple-400"></i>
                                    <div>
                                        <p class="text-white font-medium">Performance review completed</p>
                                        <p class="text-gray-400 text-sm">Emily Davis - Q4 Review</p>
                                    </div>
                                </div>
                                <span class="text-gray-400 text-sm">1 day ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        `;
    }
}

class App {
    constructor() {
        this.sidebar = new Sidebar();
        this.header = new Header();
        this.mainLayout = new MainLayout();
        this.commandCenter = new CommandCenter();
        this.directory = new Directory();
        this.currentPage = 'dashboard';
    }

    navigate(page) {
        this.currentPage = page;
        const appElement = document.getElementById('app');
        appElement.innerHTML = this.render();
        console.log('Navigated to:', page); // Debug log
    }

    render() {
        let mainContent;
        
        switch(this.currentPage) {
            case 'command-center':
                mainContent = this.commandCenter.render();
                break;
            case 'my-team':
                mainContent = `
                    <main class="ml-64 mt-16 p-6 h-screen overflow-y-auto">
                        <div class="max-w-7xl mx-auto">
                            <div class="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 class="text-3xl font-bold text-white mb-2">My Team</h1>
                                    <p class="text-gray-400">Manage your team members and their performance</p>
                                </div>
                                <button onclick="app.navigate('dashboard')" class="px-4 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 flex items-center space-x-2">
                                    <i class="fas fa-arrow-left"></i>
                                    <span>Back to Dashboard</span>
                                </button>
                            </div>
                            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center">
                                <i class="fas fa-users text-4xl text-teal-400 mb-4"></i>
                                <h2 class="text-xl font-bold text-white mb-2">My Team Page</h2>
                                <p class="text-gray-400">This page is under construction</p>
                            </div>
                        </div>
                    </main>
                `;
                break;
            case 'directory':
                mainContent = this.directory.render();
                break;
            case 'leave':
                mainContent = `
                    <main class="ml-64 mt-16 p-6 h-screen overflow-y-auto">
                        <div class="max-w-7xl mx-auto">
                            <div class="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 class="text-3xl font-bold text-white mb-2">Leave & Attendance</h1>
                                    <p class="text-gray-400">Manage leave requests and attendance tracking</p>
                                </div>
                                <button onclick="app.navigate('dashboard')" class="px-4 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 flex items-center space-x-2">
                                    <i class="fas fa-arrow-left"></i>
                                    <span>Back to Dashboard</span>
                                </button>
                            </div>
                            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center">
                                <i class="fas fa-calendar-alt text-4xl text-teal-400 mb-4"></i>
                                <h2 class="text-xl font-bold text-white mb-2">Leave & Attendance Page</h2>
                                <p class="text-gray-400">This page is under construction</p>
                            </div>
                        </div>
                    </main>
                `;
                break;
            case 'payroll':
                mainContent = `
                    <main class="ml-64 mt-16 p-6 h-screen overflow-y-auto">
                        <div class="max-w-7xl mx-auto">
                            <div class="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 class="text-3xl font-bold text-white mb-2">Payroll & Benefits</h1>
                                    <p class="text-gray-400">Manage payroll and employee benefits</p>
                                </div>
                                <button onclick="app.navigate('dashboard')" class="px-4 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 flex items-center space-x-2">
                                    <i class="fas fa-arrow-left"></i>
                                    <span>Back to Dashboard</span>
                                </button>
                            </div>
                            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center">
                                <i class="fas fa-money-bill-wave text-4xl text-teal-400 mb-4"></i>
                                <h2 class="text-xl font-bold text-white mb-2">Payroll & Benefits Page</h2>
                                <p class="text-gray-400">This page is under construction</p>
                            </div>
                        </div>
                    </main>
                `;
                break;
            case 'recruiting':
                mainContent = `
                    <main class="ml-64 mt-16 p-6 h-screen overflow-y-auto">
                        <div class="max-w-7xl mx-auto">
                            <div class="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 class="text-3xl font-bold text-white mb-2">Recruiting</h1>
                                    <p class="text-gray-400">Manage job postings and candidate pipeline</p>
                                </div>
                                <button onclick="app.navigate('dashboard')" class="px-4 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 flex items-center space-x-2">
                                    <i class="fas fa-arrow-left"></i>
                                    <span>Back to Dashboard</span>
                                </button>
                            </div>
                            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center">
                                <i class="fas fa-user-tie text-4xl text-teal-400 mb-4"></i>
                                <h2 class="text-xl font-bold text-white mb-2">Recruiting Page</h2>
                                <p class="text-gray-400">This page is under construction</p>
                            </div>
                        </div>
                    </main>
                `;
                break;
            case 'reports':
                mainContent = `
                    <main class="ml-64 mt-16 p-6 h-screen overflow-y-auto">
                        <div class="max-w-7xl mx-auto">
                            <div class="mb-8 flex items-center justify-between">
                                <div>
                                    <h1 class="text-3xl font-bold text-white mb-2">Reports</h1>
                                    <p class="text-gray-400">View and generate HR reports</p>
                                </div>
                                <button onclick="app.navigate('dashboard')" class="px-4 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 flex items-center space-x-2">
                                    <i class="fas fa-arrow-left"></i>
                                    <span>Back to Dashboard</span>
                                </button>
                            </div>
                            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center">
                                <i class="fas fa-chart-bar text-4xl text-teal-400 mb-4"></i>
                                <h2 class="text-xl font-bold text-white mb-2">Reports Page</h2>
                                <p class="text-gray-400">This page is under construction</p>
                            </div>
                        </div>
                    </main>
                `;
                break;
            default:
                mainContent = this.mainLayout.render();
        }

        return `
            ${this.sidebar.render()}
            ${this.header.render()}
            ${mainContent}
        `;
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new App();
    window.app = app; // Make app globally accessible
    const appElement = document.getElementById('app');
    appElement.innerHTML = app.render();
});
