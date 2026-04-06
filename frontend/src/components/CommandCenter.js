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

    render() {
        return `
            <main class="ml-64 mt-16 p-6 h-screen overflow-y-auto">
                <div class="max-w-7xl mx-auto">
                    <!-- Header -->
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-white mb-2">Command Center</h1>
                        <p class="text-gray-400">Overview of company resources and recent achievements</p>
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
