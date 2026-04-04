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
                    
                    <!-- Search and Filter Bar -->
                    <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50 mb-6">
                        <div class="flex flex-col sm:flex-row gap-4">
                            <div class="flex-1">
                                <div class="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search employees..." 
                                        class="w-full bg-slate-700/60 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50"
                                    >
                                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <select class="bg-slate-700/60 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50">
                                    <option value="">All Departments</option>
                                    <option value="engineering">Engineering</option>
                                    <option value="product">Product</option>
                                    <option value="design">Design</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="sales">Sales</option>
                                </select>
                                <select class="bg-slate-700/60 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="onboarding">Onboarding</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
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
            </main>
        `;
    }
}
