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
                            <a href="#" onclick="event.preventDefault(); app.navigate('dashboard')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50 ${this.currentPage === 'dashboard' ? 'bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30' : ''}">
                                <i class="fas fa-home w-5 mr-3"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('command-center')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50 ${this.currentPage === 'command-center' ? 'bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30' : ''}">
                                <i class="fas fa-tachometer-alt w-5 mr-3"></i>
                                <span>Command Center</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('workflow-hub')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50 ${this.currentPage === 'workflow-hub' ? 'bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30' : ''}">
                                <i class="fas fa-tasks w-5 mr-3"></i>
                                <span>Workflow Hub</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('my-team')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50 ${this.currentPage === 'my-team' ? 'bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30' : ''}">
                                <i class="fas fa-users w-5 mr-3"></i>
                                <span>My Team</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('directory')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50 ${this.currentPage === 'directory' ? 'bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30' : ''}">
                                <i class="fas fa-address-book w-5 mr-3"></i>
                                <span>Directory</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('leave')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50 ${this.currentPage === 'leave' ? 'bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30' : ''}">
                                <i class="fas fa-calendar-alt w-5 mr-3"></i>
                                <span>Leave & Attendance</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('payroll')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50 ${this.currentPage === 'payroll' ? 'bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30' : ''}">
                                <i class="fas fa-dollar-sign w-5 mr-3"></i>
                                <span>Payroll & Benefits</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('recruiting')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50 ${this.currentPage === 'recruiting' ? 'bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30' : ''}">
                                <i class="fas fa-user-tie w-5 mr-3"></i>
                                <span>Recruiting</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" onclick="event.preventDefault(); app.navigate('reports')" class="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50 ${this.currentPage === 'reports' ? 'bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30' : ''}">
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
        this.employees = [];
        this.loading = false;
        this.error = null;
        this.fetchEmployees();
    }

    async fetchEmployees() {
        this.loading = true;
        this.error = null;
        
        try {
            const response = await fetch('http://localhost:3000/employees');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const employeesData = await response.json();
            
            // Add avatar URLs to the employee data from API
            this.employees = employeesData.map(emp => ({
                ...emp,
                avatar: `https://picsum.photos/seed/${emp.name.toLowerCase().replace(' ', '')}/40/40.jpg`
            }));
            
        } catch (error) {
            console.error('Error fetching employees:', error);
            this.error = 'Failed to load employee data';
            // Fallback to mock data if API fails
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
                }
            ];
        } finally {
            this.loading = false;
        }
    }

    async refreshEmployees() {
        await this.fetchEmployees();
        // Re-render the app to show updated data
        if (window.app) {
            const appElement = document.getElementById('app');
            appElement.innerHTML = window.app.render();
        }
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
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.class}">
                <span class="w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5"></span>
                ${status}
            </span>
        `;
    }

    renderEmployeeRow(employee) {
        return `
            <div class="bg-slate-800/40 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 group hover:-translate-y-0.5">
                <div class="grid grid-cols-12 gap-3 items-center">
                    <!-- Employee Info -->
                    <div class="col-span-4 flex items-center space-x-2">
                        <img 
                            src="${employee.avatar}" 
                            alt="${employee.name}" 
                            class="w-8 h-8 rounded-full border border-slate-600 group-hover:border-blue-500/50 transition-all duration-300 group-hover:scale-105"
                        >
                        <div>
                            <p class="text-white font-medium text-sm group-hover:text-blue-100 transition-colors duration-200">${employee.name}</p>
                            <p class="text-gray-400 text-xs group-hover:text-gray-300 transition-colors duration-200">${employee.email}</p>
                        </div>
                    </div>
                    
                    <!-- Job Title -->
                    <div class="col-span-2">
                        <p class="text-gray-300 text-sm group-hover:text-gray-200 transition-colors duration-200">${employee.jobTitle}</p>
                    </div>
                    
                    <!-- Department -->
                    <div class="col-span-2">
                        <p class="text-gray-300 text-sm group-hover:text-gray-200 transition-colors duration-200">${employee.department}</p>
                    </div>
                    
                    <!-- Location -->
                    <div class="col-span-2">
                        <div class="flex items-center text-gray-300 text-sm group-hover:text-gray-200 transition-colors duration-200">
                            <i class="fas fa-map-marker-alt w-3 h-3 mr-1 text-gray-500 group-hover:text-blue-400 transition-colors duration-200"></i>
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

    renderFilterPanel() {
        return `
            <div class="w-72 bg-slate-800/60 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 shadow-xl shadow-black/20 h-fit sticky top-24">
                <h3 class="text-base font-bold text-white mb-4 flex items-center">
                    <i class="fas fa-filter mr-2 text-blue-400 text-sm"></i>
                    Filters
                </h3>
                
                <!-- Search Input -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-1">Search</label>
                    <div class="relative">
                        <input 
                            type="text" 
                            placeholder="Search employees..." 
                            class="w-full bg-slate-700/60 text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-slate-600/50 text-sm"
                        >
                        <i class="fas fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                    </div>
                </div>
                
                <!-- Employees Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Employees</label>
                    <div class="space-y-1">
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2" checked>
                            <span class="ml-2 text-xs text-gray-300">Engineers</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">Designers</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">Managers</span>
                        </label>
                    </div>
                </div>
                
                <!-- Skillset Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Skillset</label>
                    <div class="space-y-1">
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">JavaScript</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">Python</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">React</span>
                        </label>
                    </div>
                </div>
                
                <!-- Location Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Location</label>
                    <select class="w-full bg-slate-700/60 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-slate-600/50 text-sm">
                        <option value="departments" selected>Departments</option>
                        <option value="san-francisco">San Francisco</option>
                        <option value="new-york">New York</option>
                        <option value="chicago">Chicago</option>
                        <option value="remote">Remote</option>
                    </select>
                </div>
                
                <!-- Department Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Department</label>
                    <select class="w-full bg-slate-700/60 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-slate-600/50 text-sm">
                        <option value="sort" selected>Sort</option>
                        <option value="engineering">Engineering</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                    </select>
                </div>
                
                <!-- Tags Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Tags</label>
                    <div class="flex flex-wrap gap-1">
                        <span class="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs border border-blue-600/30 hover:bg-blue-600/30 transition-colors duration-200 cursor-pointer">Marketing</span>
                        <span class="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs border border-purple-600/30 hover:bg-purple-600/30 transition-colors duration-200 cursor-pointer">Communities</span>
                        <span class="px-2 py-1 bg-slate-600/20 text-gray-400 rounded-full text-xs border border-slate-600/30 hover:bg-slate-600/30 transition-colors duration-200 cursor-pointer">Senior</span>
                        <span class="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs border border-green-600/30 hover:bg-green-600/30 transition-colors duration-200 cursor-pointer">Team Lead</span>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="space-y-2">
                    <button class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm">
                        Apply Filters
                    </button>
                    <button class="w-full py-2 bg-slate-700/60 text-gray-300 rounded-lg hover:bg-slate-700/80 transition-colors duration-200 text-sm">
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
                            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-3 border border-slate-700/50 mb-4">
                                <div class="flex items-center gap-3">
                                    <!-- Search Bar -->
                                    <div class="flex-1">
                                        <div class="relative">
                                            <input 
                                                type="text" 
                                                placeholder="Search..." 
                                                class="w-full bg-slate-700/60 text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-slate-600/50 text-sm"
                                            >
                                            <i class="fas fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                                        </div>
                                    </div>
                                    
                                    <!-- Filter Buttons -->
                                    <div class="flex gap-2">
                                        <button class="px-3 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-all duration-200 flex items-center space-x-1 border border-slate-600/50 text-sm">
                                            <i class="fas fa-sliders-h text-xs"></i>
                                            <span>Complex filters</span>
                                        </button>
                                        <button class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1 text-sm">
                                            <i class="fas fa-plus text-xs"></i>
                                            <span>Apply filters</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Results Summary -->
                            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-3 border border-slate-700/50 mb-4">
                                <div class="flex items-center justify-between">
                                    <p class="text-gray-300 text-sm">Showing <span class="text-white font-medium">${this.employees.length}</span> employees</p>
                                    <div class="flex gap-2">
                                        <button onclick="app.directory.refreshEmployees()" class="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm">
                                            <i class="fas fa-sync-alt mr-1"></i>Refresh
                                        </button>
                                        <button class="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm">
                                            <i class="fas fa-download mr-1"></i>Export
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Table Header -->
                            <div class="bg-slate-800/20 backdrop-blur-sm rounded-xl p-3 border border-slate-700/30 mb-3">
                                <div class="grid grid-cols-12 gap-3 items-center text-xs font-medium text-gray-400">
                                    <div class="col-span-4">Employee Name</div>
                                    <div class="col-span-2">Job Title</div>
                                    <div class="col-span-2">Department</div>
                                    <div class="col-span-2">Location</div>
                                    <div class="col-span-2">Status</div>
                                </div>
                            </div>
                            
                            <!-- Employee Rows -->
                            ${this.loading ? `
                                <div class="bg-slate-800/40 backdrop-blur-sm rounded-lg p-8 border border-slate-700/50 text-center">
                                    <div class="flex flex-col items-center justify-center">
                                        <i class="fas fa-spinner fa-spin text-3xl text-blue-400 mb-4"></i>
                                        <p class="text-gray-300">Loading employee data...</p>
                                    </div>
                                </div>
                            ` : this.error ? `
                                <div class="bg-slate-800/40 backdrop-blur-sm rounded-lg p-8 border border-slate-700/50 text-center">
                                    <div class="flex flex-col items-center justify-center">
                                        <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-4"></i>
                                        <p class="text-gray-300 mb-2">${this.error}</p>
                                        <button onclick="app.directory.refreshEmployees()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                            <i class="fas fa-retry mr-2"></i>Try Again
                                        </button>
                                    </div>
                                </div>
                            ` : `
                                <div class="space-y-2">
                                    ${this.employees.map(employee => this.renderEmployeeRow(employee)).join('')}
                                </div>
                            ` }
                            
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

class WorkflowHub {
    constructor() {
        this.tasks = [
            {
                id: 1,
                employeeName: 'Sarah Johnson',
                avatar: 'https://picsum.photos/seed/sarah/40/40.jpg',
                taskType: 'Review PTO Request',
                duration: '3 days leave',
                timestamp: '2 hours ago',
                priority: 'medium'
            },
            {
                id: 2,
                employeeName: 'Michael Chen',
                avatar: 'https://picsum.photos/seed/michael/40/40.jpg',
                taskType: 'Approve Expense Report',
                duration: '$1,250.00',
                timestamp: '4 hours ago',
                priority: 'high'
            },
            {
                id: 3,
                employeeName: 'Emily Davis',
                avatar: 'https://picsum.photos/seed/emily/40/40.jpg',
                taskType: 'Review Timesheet',
                duration: 'Week 47 - 40 hours',
                timestamp: '5 hours ago',
                priority: 'low'
            },
            {
                id: 4,
                employeeName: 'James Wilson',
                avatar: 'https://picsum.photos/seed/james/40/40.jpg',
                taskType: 'Performance Review Approval',
                duration: 'Q4 Review',
                timestamp: '1 day ago',
                priority: 'high'
            },
            {
                id: 5,
                employeeName: 'Lisa Anderson',
                avatar: 'https://picsum.photos/seed/lisa/40/40.jpg',
                taskType: 'Remote Work Request',
                duration: '2 weeks remote',
                timestamp: '1 day ago',
                priority: 'medium'
            },
            {
                id: 6,
                employeeName: 'David Martinez',
                avatar: 'https://picsum.photos/seed/david/40/40.jpg',
                taskType: 'Bonus Calculation',
                duration: '15% annual bonus',
                timestamp: '2 days ago',
                priority: 'high'
            }
        ];
    }

    getPriorityBadge(priority) {
        const priorityConfig = {
            'high': {
                class: 'bg-red-400/20 text-red-400 border-red-400/30',
                dot: 'bg-red-400'
            },
            'medium': {
                class: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
                dot: 'bg-yellow-400'
            },
            'low': {
                class: 'bg-green-400/20 text-green-400 border-green-400/30',
                dot: 'bg-green-400'
            }
        };

        const config = priorityConfig[priority] || priorityConfig['medium'];
        
        return `
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.class}">
                <span class="w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5"></span>
                ${priority}
            </span>
        `;
    }

    renderTaskCard(task) {
        return `
            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 group">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <img 
                            src="${task.avatar}" 
                            alt="${task.employeeName}" 
                            class="w-10 h-10 rounded-full border-2 border-slate-600 group-hover:border-teal-500/50 transition-all duration-300 group-hover:scale-105"
                        >
                        <div>
                            <h4 class="text-white font-medium group-hover:text-teal-100 transition-colors duration-200">${task.employeeName}</h4>
                            <p class="text-gray-400 text-sm">${task.timestamp}</p>
                        </div>
                    </div>
                    ${this.getPriorityBadge(task.priority)}
                </div>
                
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-teal-100 transition-colors duration-200">${task.taskType}</h3>
                    <p class="text-gray-300 text-sm flex items-center group-hover:text-gray-200 transition-colors duration-200">
                        <i class="fas fa-clock mr-2 text-gray-500 group-hover:text-teal-400 transition-colors duration-200"></i>
                        ${task.duration}
                    </p>
                </div>
                
                <div class="flex gap-3">
                    <button class="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5">
                        <i class="fas fa-check"></i>
                        <span>Approve</span>
                    </button>
                    <button class="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5">
                        <i class="fas fa-times"></i>
                        <span>Deny</span>
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
                            <h1 class="text-3xl font-bold text-white mb-2">Workflow Hub</h1>
                            <p class="text-gray-400">Manage pending approvals and workflow tasks</p>
                        </div>
                        <button onclick="app.navigate('dashboard')" class="px-4 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 flex items-center space-x-2">
                            <i class="fas fa-arrow-left"></i>
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                    
                    <!-- Stats Overview -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
                            <div class="flex items-center justify-between mb-4">
                                <i class="fas fa-inbox text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-200"></i>
                                <span class="text-sm text-gray-400">+2 today</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">${this.tasks.length}</h3>
                            <p class="text-gray-400 text-sm">Pending Tasks</p>
                        </div>
                        
                        <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
                            <div class="flex items-center justify-between mb-4">
                                <i class="fas fa-exclamation-triangle text-2xl text-red-400 group-hover:scale-110 transition-transform duration-200"></i>
                                <span class="text-sm text-red-400">Urgent</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">${this.tasks.filter(t => t.priority === 'high').length}</h3>
                            <p class="text-gray-400 text-sm">High Priority</p>
                        </div>
                        
                        <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
                            <div class="flex items-center justify-between mb-4">
                                <i class="fas fa-check-circle text-2xl text-green-400 group-hover:scale-110 transition-transform duration-200"></i>
                                <span class="text-sm text-gray-400">+12%</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">28</h3>
                            <p class="text-gray-400 text-sm">Completed Today</p>
                        </div>
                        
                        <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
                            <div class="flex items-center justify-between mb-4">
                                <i class="fas fa-clock text-2xl text-yellow-400 group-hover:scale-110 transition-transform duration-200"></i>
                                <span class="text-sm text-gray-400">Avg 2h</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">94%</h3>
                            <p class="text-gray-400 text-sm">Response Rate</p>
                        </div>
                    </div>
                    
                    <!-- Task Inbox Section -->
                    <div class="mb-8">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold text-white">Task Inbox</h2>
                            <div class="flex gap-2">
                                <button class="px-3 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 text-sm">
                                    <i class="fas fa-filter mr-2"></i>Filter
                                </button>
                                <button class="px-3 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 text-sm">
                                    <i class="fas fa-sort mr-2"></i>Sort
                                </button>
                            </div>
                        </div>
                        
                        <!-- Task Cards Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            ${this.tasks.map(task => this.renderTaskCard(task)).join('')}
                        </div>
                    </div>
                    
                    <!-- Workflow Pipeline Section -->
                    <div class="mb-8">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold text-white">Workflow Pipeline</h2>
                            <div class="flex gap-2">
                                <button class="px-3 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 text-sm">
                                    <i class="fas fa-chart-line mr-2"></i>Analytics
                                </button>
                                <button class="px-3 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 text-sm">
                                    <i class="fas fa-cog mr-2"></i>Settings
                                </button>
                            </div>
                        </div>
                        
                        <!-- Pipeline Flow -->
                        <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 shadow-xl shadow-black/20">
                            <div class="flex items-center justify-between relative">
                                <!-- Progress Line Background -->
                                <div class="absolute top-1/2 left-0 right-0 h-1 bg-slate-700/50 transform -translate-y-1/2 z-0"></div>
                                
                                <!-- Progress Line Active -->
                                <div class="absolute top-1/2 left-0 w-1/3 h-1 bg-gradient-to-r from-blue-500 to-teal-500 transform -translate-y-1/2 z-0"></div>
                                
                                <!-- Stage 1: Request Submitted -->
                                <div class="relative z-10 flex flex-col items-center">
                                    <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 border-2 border-blue-400/30">
                                        <i class="fas fa-paper-plane text-white text-xl"></i>
                                    </div>
                                    <div class="mt-3 text-center">
                                        <h3 class="text-white font-semibold text-sm">Request Submitted</h3>
                                        <p class="text-blue-400 font-bold text-lg mt-1">12</p>
                                        <p class="text-gray-400 text-xs">items</p>
                                    </div>
                                </div>
                                
                                <!-- Stage 2: Manager Review -->
                                <div class="relative z-10 flex flex-col items-center">
                                    <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/25 border-2 border-teal-400/30 ring-4 ring-teal-500/20">
                                        <i class="fas fa-user-check text-white text-xl"></i>
                                    </div>
                                    <div class="mt-3 text-center">
                                        <h3 class="text-white font-semibold text-sm">Manager Review</h3>
                                        <p class="text-teal-400 font-bold text-lg mt-1">8</p>
                                        <p class="text-gray-400 text-xs">items</p>
                                    </div>
                                    <div class="mt-2 px-2 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs border border-teal-500/30">
                                        Active
                                    </div>
                                </div>
                                
                                <!-- Stage 3: HR Approval -->
                                <div class="relative z-10 flex flex-col items-center">
                                    <div class="w-16 h-16 bg-slate-700/60 rounded-full flex items-center justify-center border-2 border-slate-600/50">
                                        <i class="fas fa-user-tie text-gray-400 text-xl"></i>
                                    </div>
                                    <div class="mt-3 text-center">
                                        <h3 class="text-gray-300 font-semibold text-sm">HR Approval</h3>
                                        <p class="text-gray-400 font-bold text-lg mt-1">3</p>
                                        <p class="text-gray-500 text-xs">items</p>
                                    </div>
                                </div>
                                
                                <!-- Stage 4: Completed -->
                                <div class="relative z-10 flex flex-col items-center">
                                    <div class="w-16 h-16 bg-slate-700/60 rounded-full flex items-center justify-center border-2 border-slate-600/50">
                                        <i class="fas fa-check-circle text-gray-400 text-xl"></i>
                                    </div>
                                    <div class="mt-3 text-center">
                                        <h3 class="text-gray-300 font-semibold text-sm">Completed</h3>
                                        <p class="text-gray-400 font-bold text-lg mt-1">47</p>
                                        <p class="text-gray-500 text-xs">items</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Pipeline Stats -->
                            <div class="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/50">
                                <div class="text-center">
                                    <p class="text-gray-400 text-xs mb-1">Avg. Processing Time</p>
                                    <p class="text-white font-semibold">2.3 days</p>
                                </div>
                                <div class="text-center">
                                    <p class="text-gray-400 text-xs mb-1">Completion Rate</p>
                                    <p class="text-green-400 font-semibold">87.5%</p>
                                </div>
                                <div class="text-center">
                                    <p class="text-gray-400 text-xs mb-1">Pending Today</p>
                                    <p class="text-yellow-400 font-semibold">23</p>
                                </div>
                                <div class="text-center">
                                    <p class="text-gray-400 text-xs mb-1">Overdue</p>
                                    <p class="text-red-400 font-semibold">3</p>
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
            <div class="w-72 bg-slate-800/60 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 shadow-xl shadow-black/20 h-fit sticky top-24">
                <h3 class="text-base font-bold text-white mb-4 flex items-center">
                    <i class="fas fa-filter mr-2 text-blue-400 text-sm"></i>
                    Filters
                </h3>
                
                <!-- Search Input -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-1">Search</label>
                    <div class="relative">
                        <input 
                            type="text" 
                            placeholder="Search employees..." 
                            class="w-full bg-slate-700/60 text-white rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-slate-600/50 text-sm"
                        >
                        <i class="fas fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                    </div>
                </div>
                
                <!-- Employees Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Employees</label>
                    <div class="space-y-1">
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2" checked>
                            <span class="ml-2 text-xs text-gray-300">Engineers</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">Designers</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">Managers</span>
                        </label>
                    </div>
                </div>
                
                <!-- Skillset Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Skillset</label>
                    <div class="space-y-1">
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">JavaScript</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">Python</span>
                        </label>
                        <label class="flex items-center p-2 rounded-lg hover:bg-slate-700/40 transition-colors duration-200 cursor-pointer">
                            <input type="checkbox" class="w-3 h-3 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2">
                            <span class="ml-2 text-xs text-gray-300">React</span>
                        </label>
                    </div>
                </div>
                
                <!-- Location Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Location</label>
                    <select class="w-full bg-slate-700/60 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-slate-600/50 text-sm">
                        <option value="departments" selected>Departments</option>
                        <option value="san-francisco">San Francisco</option>
                        <option value="new-york">New York</option>
                        <option value="chicago">Chicago</option>
                        <option value="remote">Remote</option>
                    </select>
                </div>
                
                <!-- Department Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Department</label>
                    <select class="w-full bg-slate-700/60 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 border border-slate-600/50 text-sm">
                        <option value="sort" selected>Sort</option>
                        <option value="engineering">Engineering</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                    </select>
                </div>
                
                <!-- Tags Section -->
                <div class="mb-4">
                    <label class="block text-xs font-medium text-gray-300 mb-2">Tags</label>
                    <div class="flex flex-wrap gap-1">
                        <span class="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs border border-blue-600/30 hover:bg-blue-600/30 transition-colors duration-200 cursor-pointer">Marketing</span>
                        <span class="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs border border-purple-600/30 hover:bg-purple-600/30 transition-colors duration-200 cursor-pointer">Communities</span>
                        <span class="px-2 py-1 bg-slate-600/20 text-gray-400 rounded-full text-xs border border-slate-600/30 hover:bg-slate-600/30 transition-colors duration-200 cursor-pointer">Senior</span>
                        <span class="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs border border-green-600/30 hover:bg-green-600/30 transition-colors duration-200 cursor-pointer">Team Lead</span>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="space-y-2">
                    <button class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm">
                        Apply Filters
                    </button>
                    <button class="w-full py-2 bg-slate-700/60 text-gray-300 rounded-lg hover:bg-slate-700/80 transition-colors duration-200 text-sm">
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
        this.workflowHub = new WorkflowHub();
        this.currentPage = 'dashboard';
    }

    navigate(page) {
        console.log('Navigation requested:', page);
        this.currentPage = page;
        const appElement = document.getElementById('app');
        appElement.innerHTML = this.render();
        console.log('Navigated to:', page); // Debug log
    }

    toggleFAB() {
        const menu = document.getElementById('fab-menu');
        const overlay = document.getElementById('fab-overlay');
        const icon = document.getElementById('fab-icon');
        const fabMain = document.getElementById('fab-main');
        
        if (menu.classList.contains('opacity-0')) {
            // Open menu
            menu.classList.remove('opacity-0', 'invisible', 'scale-95');
            menu.classList.add('opacity-100', 'visible', 'scale-100');
            overlay.classList.remove('opacity-0', 'invisible');
            overlay.classList.add('opacity-100', 'visible');
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-times');
            fabMain.classList.add('rotate-45');
        } else {
            // Close menu
            this.closeFAB();
        }
    }

    closeFAB() {
        const menu = document.getElementById('fab-menu');
        const overlay = document.getElementById('fab-overlay');
        const icon = document.getElementById('fab-icon');
        const fabMain = document.getElementById('fab-main');
        
        menu.classList.add('opacity-0', 'invisible', 'scale-95');
        menu.classList.remove('opacity-100', 'visible', 'scale-100');
        overlay.classList.add('opacity-0', 'invisible');
        overlay.classList.remove('opacity-100', 'visible');
        icon.classList.add('fa-plus');
        icon.classList.remove('fa-times');
        fabMain.classList.remove('rotate-45');
    }

    handleFABAction(action) {
        console.log('FAB Action clicked:', action);
        
        // Show a simple notification (you can expand this later)
        const messages = {
            'timeoff': 'Time Off Request form would open here',
            'expense': 'Expense Report form would open here',
            'onboarding': 'Onboarding form would open here'
        };
        
        console.log('Showing message:', messages[action]);
        
        // Create a simple notification with enhanced animations
        const notification = document.createElement('div');
        notification.id = 'fab-notification';
        notification.className = 'fixed top-20 right-6 bg-slate-800/95 text-white px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm border border-slate-700/50 z-50 transform translate-x-full opacity-0 transition-all duration-300 ease-out';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-info-circle text-blue-400 animate-pulse"></i>
                <span class="font-medium">${messages[action]}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        console.log('Notification added to DOM');
        
        // Slide in and fade in notification
        setTimeout(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
            notification.classList.add('translate-x-0', 'opacity-100');
            console.log('Notification slid in');
        }, 100);
        
        // Remove notification after 3 seconds with fade out
        setTimeout(() => {
            notification.classList.add('translate-x-full', 'opacity-0');
            notification.classList.remove('translate-x-0', 'opacity-100');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                    console.log('Notification removed');
                }
            }, 300);
        }, 3000);
        
        // Close FAB menu
        this.closeFAB();
        console.log('FAB menu closed');
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
            case 'workflow-hub':
                mainContent = this.workflowHub.render();
                break;
            default:
                mainContent = this.mainLayout.render();
        }

        return `
            ${this.sidebar.render()}
            ${this.header.render()}
            ${mainContent}
            
            <!-- Floating Action Button (FAB) -->
            <div id="fab-container" class="fixed bottom-6 right-6 z-50">
                <!-- FAB Button -->
                <button id="fab-main" onclick="app.toggleFAB()" class="w-14 h-14 bg-gradient-to-br from-teal-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 group">
                    <i id="fab-icon" class="fas fa-plus text-white text-xl transition-transform duration-300 group-hover:scale-110"></i>
                </button>
                
                <!-- FAB Menu (Hidden by default) -->
                <div id="fab-menu" class="absolute bottom-16 right-0 opacity-0 invisible transition-all duration-300 transform scale-95">
                    <div class="flex flex-col gap-2">
                        <!-- Request Time Off -->
                        <div class="flex items-center justify-end mb-2">
                            <span class="bg-slate-800/90 text-white px-3 py-1 rounded-lg text-sm mr-2 whitespace-nowrap backdrop-blur-sm border border-slate-700/50">Request Time Off</span>
                            <button onclick="app.handleFABAction('timeoff')" class="w-12 h-12 bg-slate-800/90 rounded-full flex items-center justify-center shadow-lg shadow-black/20 hover:bg-slate-700/90 transition-all duration-300 backdrop-blur-sm border border-slate-600/50">
                                <i class="fas fa-calendar-alt text-white text-sm"></i>
                            </button>
                        </div>
                        
                        <!-- Submit Expense -->
                        <div class="flex items-center justify-end mb-2">
                            <span class="bg-slate-800/90 text-white px-3 py-1 rounded-lg text-sm mr-2 whitespace-nowrap backdrop-blur-sm border border-slate-700/50">Submit Expense</span>
                            <button onclick="app.handleFABAction('expense')" class="w-12 h-12 bg-slate-800/90 rounded-full flex items-center justify-center shadow-lg shadow-black/20 hover:bg-slate-700/90 transition-all duration-300 backdrop-blur-sm border border-slate-600/50">
                                <i class="fas fa-receipt text-white text-sm"></i>
                            </button>
                        </div>
                        
                        <!-- Initiate Onboarding -->
                        <div class="flex items-center justify-end">
                            <span class="bg-slate-800/90 text-white px-3 py-1 rounded-lg text-sm mr-2 whitespace-nowrap backdrop-blur-sm border border-slate-700/50">Initiate Onboarding</span>
                            <button onclick="app.handleFABAction('onboarding')" class="w-12 h-12 bg-slate-800/90 rounded-full flex items-center justify-center shadow-lg shadow-black/20 hover:bg-slate-700/90 transition-all duration-300 backdrop-blur-sm border border-slate-600/50">
                                <i class="fas fa-user-plus text-white text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- FAB Overlay (Click outside to close) -->
            <div id="fab-overlay" onclick="app.closeFAB()" class="fixed inset-0 z-40 opacity-0 invisible transition-all duration-300"></div>
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
