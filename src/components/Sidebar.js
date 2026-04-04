class Sidebar {
    render() {
        return `
            <div class="w-64 bg-gradient-to-b from-teal-600 to-black h-screen fixed left-0 top-0 flex flex-col">
                <!-- Logo -->
                <div class="p-6 border-b border-gray-700">
                    <h1 class="text-2xl font-bold text-white">Ascentia</h1>
                </div>
                
                <!-- Navigation Menu -->
                <nav class="flex-1 p-4">
                    <ul class="space-y-2">
                        <li>
                            <a href="#" class="flex items-center p-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 text-gray-300 hover:text-white">
                                <i class="fas fa-tachometer-alt w-5 mr-3"></i>
                                <span>Command Center</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 text-gray-300 hover:text-white">
                                <i class="fas fa-users w-5 mr-3"></i>
                                <span>My Team</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 text-gray-300 hover:text-white">
                                <i class="fas fa-address-book w-5 mr-3"></i>
                                <span>Directory</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 text-gray-300 hover:text-white">
                                <i class="fas fa-calendar-alt w-5 mr-3"></i>
                                <span>Leave & Attendance</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 text-gray-300 hover:text-white">
                                <i class="fas fa-money-bill-wave w-5 mr-3"></i>
                                <span>Payroll & Benefits</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 text-gray-300 hover:text-white">
                                <i class="fas fa-user-tie w-5 mr-3"></i>
                                <span>Recruiting</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center p-3 rounded-xl hover:bg-gray-800 transition-colors duration-200 text-gray-300 hover:text-white">
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
