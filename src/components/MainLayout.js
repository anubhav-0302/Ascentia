class MainLayout {
    constructor() {
        this.sidebar = new Sidebar();
        this.header = new Header();
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
                    </div>
                    
                    <!-- Dashboard Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div class="flex items-center justify-between mb-4">
                                <i class="fas fa-users text-2xl text-teal-500"></i>
                                <span class="text-sm text-gray-400">+12%</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">248</h3>
                            <p class="text-gray-400 text-sm">Total Employees</p>
                        </div>
                        
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div class="flex items-center justify-between mb-4">
                                <i class="fas fa-user-plus text-2xl text-green-500"></i>
                                <span class="text-sm text-gray-400">+8%</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">12</h3>
                            <p class="text-gray-400 text-sm">New Hires</p>
                        </div>
                        
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div class="flex items-center justify-between mb-4">
                                <i class="fas fa-calendar-check text-2xl text-blue-500"></i>
                                <span class="text-sm text-gray-400">-3%</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">18</h3>
                            <p class="text-gray-400 text-sm">On Leave</p>
                        </div>
                        
                        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <div class="flex items-center justify-between mb-4">
                                <i class="fas fa-chart-line text-2xl text-purple-500"></i>
                                <span class="text-sm text-gray-400">+15%</span>
                            </div>
                            <h3 class="text-2xl font-bold text-white">94%</h3>
                            <p class="text-gray-400 text-sm">Productivity</p>
                        </div>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 class="text-xl font-bold text-white mb-4">Recent Activity</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-user-plus text-green-500"></i>
                                    <div>
                                        <p class="text-white font-medium">New employee onboarded</p>
                                        <p class="text-gray-400 text-sm">Sarah Johnson - Developer</p>
                                    </div>
                                </div>
                                <span class="text-gray-400 text-sm">2 hours ago</span>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-calendar-alt text-blue-500"></i>
                                    <div>
                                        <p class="text-white font-medium">Leave request approved</p>
                                        <p class="text-gray-400 text-sm">Mike Chen - Vacation</p>
                                    </div>
                                </div>
                                <span class="text-gray-400 text-sm">5 hours ago</span>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-file-alt text-purple-500"></i>
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
